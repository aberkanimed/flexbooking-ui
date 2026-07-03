# Architecture & code structure

Read this before adding pages, routes, or components, or changing how data is fetched.
For API specifics see [`api-and-data.md`](./api-and-data.md); for visual specs see `DESIGN.md`.

## Project structure

```
src/
  app/
    layout.tsx                       # root layout — font loading (Hanken Grotesk, Bricolage Grotesque)
    globals.css                      # Tailwind v4 @theme — all design tokens (canonical)
    page.tsx · error.tsx · not-found.tsx · global-error.tsx
    dashboard/
      layout.tsx                     # shell: TopHeader + main + BottomNav (operator-facing)
      catalog/
        products/  page.tsx · [id]/page.tsx     # listing + product detail
        services/  page.tsx · [id]/page.tsx     # listing + service detail
    book/
      layout.tsx                     # public booking shell — no TopHeader/BottomNav;
                                     #   min-h-dvh flex flex-col bg-background (Feature #45)
      page.tsx                       # renders <BookingShell /> (Server Component wrapper)
    api/
      availability/
        dates/route.ts               # GET proxy → backend; validates startDate + days (Feature #46)
        slots/route.ts               # GET proxy → backend; validates date (Feature #46)
  components/
    ui/                              # shadcn primitives (base-ui; owned — edit freely)
                                     # includes: calendar.tsx (react-day-picker v9, NOT base-ui),
                                     #           skeleton.tsx (animate-pulse, Feature #46)
    catalog/                         # domain: product-card, service-card, *-detail-hero,
                                     #         rollup-stats, char-cards, services-workbench
    dashboard/                       # shell: top-header, bottom-nav, sidebar-nav, mobile-drawer
    booking/                         # public booking wizard (Feature #45/46/48):
                                     #   booking-shell.tsx (orchestrator), booking-top-bar.tsx,
                                     #   booking-footer.tsx, step-heading.tsx, slot-grid.tsx,
                                     #   steps/{date-time,customer,service,items,review,confirmation}-step.tsx
  lib/
    api/
      client.ts                      # server-only: BASE_URL + apiFetch<T> (shared by all API modules)
      catalog.ts                     # catalog typed helpers — imports apiFetch from client.ts
      availability.ts                # server-only: getAvailableDates / getAvailableSlots (Feature #46)
      availability-types.ts          # client-safe types + AVAILABILITY_WINDOW_DAYS (Feature #46)
    booking/
      types.ts                       # BookingState, BookingAction (discriminated union), StepConfig
      validation.ts                  # Validators like isValidEmail() (Feature #47)
    utils.ts                         # cn() helper (clsx + tailwind-merge)
    log/                             # server-only structured logger + trace context (see sections below)
  proxy.ts                           # Next 16 middleware: trace-id generation/validation (Feature #31)
```

Import alias `@/*` → `src/*`.

## Where to put new code

- **New page/route** → `src/app/.../page.tsx` (App Router file conventions). A folder with
  `[param]` is a dynamic route.
- **New shadcn primitive** → `npx shadcn@latest add <name>` (lands in `src/components/ui/`).
- **New domain component** → `src/components/catalog/` (catalog entities) or
  `src/components/dashboard/` (app shell/nav).
- **New booking step or booking component** → `src/components/booking/steps/` (step) or
  `src/components/booking/` (shared booking UI). Types go in `src/lib/booking/types.ts`; validators go in `src/lib/booking/validation.ts`.
- **New design token** → `src/app/globals.css` `:root` (canonical), then reflect in `DESIGN.md`'s
  token tables and `docs/design/colors_and_type.css`.
- **New API helper** → add to the appropriate module under `src/lib/api/` and build on `apiFetch<T>` from `client.ts` (see `api-and-data.md`). If types must be shared with client components, extract them into a `*-types.ts` file (see the client-safe types split pattern in `api-and-data.md`).
- **New log call** → import `logger` from `@/lib/log` (server-only; see Logging section below).

## Booking flow & step pattern

The public booking wizard (`src/components/booking/`) is a linear multi-step form. All state lives in
a single `BookingState` reducer in `BookingShell`. Each step is a client component that receives
`state: BookingState` and `dispatch: Dispatch<BookingAction>` — read-only state, dispatch actions to
update it. The shell enforces progression: a step can only advance if its validation gate passes
(see `canAdvance(step, state)` in `booking-shell.tsx`).

**Step sequence** (linear, no skipping or backtracking beyond "Previous"):

| # | Component | File | Gate | Dispatches |
|---|---|---|---|---|
| 1 | DateTimeStep | `steps/date-time-step.tsx` | `date && slot` | `SET_DATE`, `SET_SLOT` |
| 2 | CustomerStep | `steps/customer-step.tsx` | `isValidEmail(email)` | `SET_EMAIL` |
| 3 | ServiceStep | `steps/service-step.tsx` (Feature #48) | `!!serviceId` | `SET_SERVICE` |
| 4 | ItemsStep | `steps/items-step.tsx` (Feature #49) | (none) | `SET_SERVICE_DETAIL`, `SET_ITEM` |
| 5 | ReviewStep | `steps/review-step.tsx` | (none) | (none — read-only) |
| 6 | ConfirmationStep | `steps/confirmation-step.tsx` | (none) | (none — end state) |

**BookingState** (`src/lib/booking/types.ts`):
```ts
{
  currentStep: number
  date: string | null                         // YYYY-MM-DD
  slot: AvailableSlotResponse | null
  email: string                               // validated before advancing past step 2
  serviceId: string | null                    // service UUID, set by ServiceStep
  serviceDetail: ServiceDetailResponse | null // full service + characteristics (Feature #49)
  configuredItems: Record<string, ConfiguredItem>  // spec ID → { value: string | number }
}
```

**`ConfiguredItem`** (`src/lib/booking/types.ts`):
```ts
{ value: string | number }  // user-selected value for a characteristic spec
```

**New action** (`SET_SERVICE_DETAIL`, Feature #49): dispatched by `ItemsStep` after fetching service
detail; also cleared when `SET_SERVICE` advances to a new service. Carries `ServiceDetailResponse`
with active characteristics only (from `GET /api/catalog/services/[id]`).

**When adding a new step:**
1. Create a file in `src/components/booking/steps/` accepting `{ state, dispatch }` props.
2. Add it to the `STEP_COMPONENTS` array in `booking-shell.tsx` (maintains 0-indexed array-to-1-indexed step).
3. Add the action type to `BookingAction` discriminated union in `src/lib/booking/types.ts`.
4. Add the reducer case in `bookingReducer()`.
5. Add a validation gate in `canAdvance()` (return `true` to allow auto-advance, or depend on `state`).
6. Update this table.

## Data fetching

All pages are **async Server Components** — fetch directly in the component; no `useEffect`/SWR for
page data.

Next 16 dynamic params are a **Promise** — always `await params`:

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getProductById(id)
  // ...
}
```

Real example: `src/app/dashboard/catalog/products/[id]/page.tsx` awaits `params`, calls
`getProductById(id)`, then composes `ProductDetailHero` + `RollupStats` + `ServicesWorkbench`.

## Client vs Server boundary

Add `"use client"` **only** when the component needs browser APIs or interactive state —
`usePathname`, `useState`, event handlers, refs. In this repo that's the shell nav, search toggles,
and accordion/sheet state. Keep data-fetching and static layout in Server Components; push
interactivity down into small client leaves.

## Conventions

- Tailwind v4: utilities/variants/theme live in `globals.css` (`@theme`, `@utility`, `@variant`) —
  there is no `tailwind.config.js`.
- Merge classes with `cn()` from `@/lib/utils`.
- Icons: `lucide-react` only.
- No test framework is configured (no `__tests__/`). Verify changes by running the app — see the
  `run` / `verify` skills.

For Next 16 / React 19 API details that aren't covered here, consult the **`nextjs`** skill or the
**context7** MCP rather than relying on older training data.

## Logging

Structured, server-only logging lives in `src/lib/log/` (PR #41, Feature #30). It is guarded with
`import 'server-only'` — never import it in Client Components.

**Public barrel** (`@/lib/log`): `logger`, `LogLevel`, `LogRecord`, `Sink`, `setSink`,
`StdoutSink`, `redact`, `getTraceId`, `runWithTrace`, `currentTraceId`.

**`LogRecord` shape:**
```ts
{
  timestamp: string        // ISO 8601
  level: LogLevel          // 'debug' | 'info' | 'warn' | 'error'
  event: string
  message: string
  traceId?: string | null  // stamped automatically when inside a runWithTrace ALS scope
  context?: unknown
}
```

**Usage:**
```ts
import { logger } from '@/lib/log'

logger.info('catalog.product.fetch', 'Fetched product list', { count: products.length })
logger.error('catalog.service.update', 'Update failed', { serviceId, reason })
```

**Level gating:** controlled by `LOG_LEVEL` env var. Default: `debug` in development, `info` in
production.

**Redaction:** in production, `redact(context)` is applied automatically before the record is
written. Fields whose names contain any of the default deny-list terms (`password`, `token`,
`secret`, `authorization`, `api`, `cookie`, `email`, `phone`, `ssn`, `card`) are masked.
`LOG_REDACT_FIELDS` (comma-separated) extends — does not replace — the default deny-list.
`LOG_REDACT=off` disables redaction entirely (dev default); `LOG_REDACT=on` forces it.

**Swapping the sink (e.g. in tests):**
```ts
import { setSink } from '@/lib/log'

setSink({ write: (record) => { /* capture or no-op */ } })
```

**Env vars summary:**

| Variable | Values | Default |
|---|---|---|
| `LOG_LEVEL` | `debug` / `info` / `warn` / `error` | `debug` (dev), `info` (prod) |
| `LOG_REDACT` | `on` / `off` | `off` (dev), `on` (prod) |
| `LOG_REDACT_FIELDS` | comma-separated field-name substrings | extends default deny-list |

## Trace context (Feature #31)

Per-request trace IDs flow from the middleware through the API layer and into every `LogRecord`,
enabling correlation of a single request across the Next.js app and the catalog backend.

### Middleware (`src/proxy.ts`)

A named Next 16 middleware export (`proxy` + `config` matcher) runs on every request:
- Reads the inbound `x-trace-id` header and validates it as a 32-character hex string.
- If absent or invalid, generates a fresh id with `crypto.randomUUID().replace(/-/g,'')`.
- Injects the id into the forwarded request headers via `NextResponse.next({ request: { headers } })`.
- Echoes it back as a response header for client-side debugging.

### Server-only trace context (`src/lib/log/trace.ts`)

Three exports (re-exported from `@/lib/log`):

| Export | Signature | Use |
|---|---|---|
| `getTraceId` | `(): Promise<string \| null>` | Reads `x-trace-id` from `next/headers`; call in async Server Components or Server Actions |
| `runWithTrace` | `<T>(id: string, fn: () => T): T` | Seeds an `AsyncLocalStorage` scope so `logger` auto-stamps `traceId` on every record within `fn` |
| `currentTraceId` | `(): string \| null` | Synchronous ALS read; only valid inside a `runWithTrace` scope |

### ALS seeding scope and limitations

ALS is seeded **only inside `runWithTrace` scopes**. Currently `apiFetch`/`apiMutate` call
`runWithTrace` automatically, so logger calls made during a catalog API request are always stamped.
Plain Server Component render bodies can call `getTraceId()` (async) but are **not** ALS-seeded
unless explicitly wrapped. Server Actions will be seeded by the `instrumentAction` wrapper
(Feature #32, not yet shipped).

### Usage pattern

```ts
import { getTraceId, runWithTrace, logger } from '@/lib/log'

// In an async Server Component — get the id and seed ALS manually if needed:
const traceId = await getTraceId()
if (traceId) {
  await runWithTrace(traceId, async () => {
    logger.info('my.event', 'Inside trace scope') // LogRecord will have traceId stamped
  })
}
```

For API helpers, no manual wrapping is needed — `apiFetch` and `apiMutate` handle it (see
`api-and-data.md`).
