# Engineering gotchas

> Loaded on demand (not always-on). Read this before touching shadcn primitives, the Tailwind
> theme, colors, or fonts. Routing, design, and API docs live via the Knowledge Map in `CLAUDE.md`.

**Next.js 16 — not the version you know.** Breaking changes to APIs, conventions, and file
structure. When unsure, verify against the current source — the **`nextjs`** skill, the **context7**
MCP, or `node_modules/next/dist/docs/` — rather than training data. Heed deprecation notices.

## Project-specific gotchas

**Base UI primitives — not Radix UI**
shadcn components in `src/components/ui/` are built on `@base-ui/react`, not Radix UI. Component APIs (props, event names, composition) differ from training data. Always read the component source in `src/components/ui/` before using it.

**Tailwind CSS v4 — no config file**
There is no `tailwind.config.js`. All configuration lives in `src/app/globals.css` using `@theme`, `@utility`, and `@variant` directives. Do not create a config file or use `theme.extend`.

**OKLch colors — do not convert**
All design tokens use `oklch()` color space. Never convert to hex or hsl — the dark mode palette relies on `oklch` lightness channels and will break if converted.

**Font classes**
Fonts are loaded in `src/app/layout.tsx` via `next/font/google` and exposed as `--font-hanken` and `--font-bricolage`. Use the Tailwind classes `font-sans` (body) and `font-heading` (display/titles) — never reference font names directly in CSS or inline styles.

**Status colors via CSS variables**
`--status-active-bg`, `--status-active-fg`, `--status-inactive-bg`, `--status-inactive-fg` are not mapped to Tailwind utilities. Use inline styles: `style={{ background: 'var(--status-active-bg)', color: 'var(--status-active-fg)' }}`. Don't hand-roll the pill markup — use the shared `StatusPill` from `src/components/catalog/status-pill.tsx` (it already does this correctly).

**Destructive actions need a confirmation step**
Gate delete/destroy server-action calls behind the shadcn `AlertDialog` (`src/components/ui/alert-dialog.tsx`, base-ui) — Cancel / destructive Confirm — rather than firing on a single click. See `characteristic-card.tsx` for the established pattern. Make the dialog copy match what actually happens server-side (e.g. if delete is really a soft-deactivate, say so — see `docs/kb/api-and-data.md` → soft-delete pattern).

**AlertDialog footer needs explicit mobile layout classes**
The shared `AlertDialogFooter` default isn't enough on its own for full-width/stacked mobile buttons — add `flex-col sm:flex-row` on the footer and `w-full sm:w-auto` on the `AlertDialogAction`/`AlertDialogCancel` buttons, as in `characteristic-card.tsx`.

**Mobile listing grids need clearance for the fixed FAB**
On listing pages with a mobile floating-action-button (`AddCharacteristicButton` and similar), add `pb-24 sm:pb-0` to the card grid container so the last row isn't obscured — see `src/app/dashboard/catalog/characteristics/page.tsx`.

**Controlled `Switch` when its initial value depends on a changing prop**
If a `Switch`'s starting value comes from a prop that can change across renders/remounts (e.g. the same edit sheet reused for different rows), use a fully controlled `checked` / `onCheckedChange` with state reset keyed on the entity id — not `defaultChecked`. Otherwise base-ui logs an "uncontrolled Switch changing default checked state" warning. See `characteristic-form-sheet.tsx`.

**Trace ALS is scoped to `runWithTrace` — plain Server Components are not auto-seeded**
`currentTraceId()` and the automatic `traceId` stamp on `LogRecord` only work inside a
`runWithTrace` scope. `apiFetch`/`apiMutate` call `runWithTrace` automatically, so logger calls
made *during* a catalog fetch are stamped. Logger calls in a plain Server Component render body
are **not** stamped unless you manually wrap them with `runWithTrace`. Server Actions will be
covered by `instrumentAction` (Feature #32, not yet shipped). Use `getTraceId()` (async) when
you only need the id string itself; use `runWithTrace` when you need the logger to stamp it.

**`Calendar` is react-day-picker v10 — not base-ui/Radix**
`src/components/ui/calendar.tsx` wraps **react-day-picker v10**, which has its own primitive API
distinct from both base-ui and Radix. Check the source before using any prop. To fill a card
container with the calendar, pass `classNames={{ root: "w-full" }}` and `className="p-0"` — the
component does not fill its container by default.

**Use native `disabled` attribute on interactive slot/option elements**
Always set `disabled={!slot.isAvailable}` (or equivalent) directly on the button/input element —
don't rely on only CSS opacity/pointer-events. Native `disabled` ensures keyboard users cannot tab
to or activate unavailable options; CSS-only "disabled" leaves them reachable by keyboard.

**Client-safe types split — extract a `*-types.ts` file when types must cross the server/client boundary**
API modules guarded with `import 'server-only'` cannot be imported by `"use client"` components.
When types or constants from such a module are needed on both sides, extract them into a separate
`*-types.ts` file (no server imports). Both the server module and client components import from
that file. See `src/lib/api/availability-types.ts` as the reference example.

**`"use server"` modules may only export async functions — not consts/types-as-values**
A file with `"use server"` at the top is a server-action boundary: **only `async function` exports
survive** the client/server split. Exporting a plain `const initialState = { errors: [] }` (or any
non-function value) compiles fine but resolves to `undefined` on the client, so `useActionState`'s
initial state becomes `undefined` and the component crashes during SSR reading e.g.
`state.errors.length` (`TypeError: Cannot read properties of undefined`). This caused a
production-breaking 500 on the service detail page (fixed in `112f53e`, refs #28). **Define
`initial*State` constants locally in the client component** that calls `useActionState` (mirroring
`service-form-sheet.tsx` / `spec-form-sheet.tsx`), importing only the **type** (e.g. `type
SpecActionState`) from the actions module — never the value.
