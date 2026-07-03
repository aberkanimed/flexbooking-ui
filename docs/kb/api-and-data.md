# API layer & data

Read this for any catalog data or API work. The catalog implementation is `src/lib/api/catalog.ts`;
availability helpers are in `src/lib/api/availability.ts`. Both build on the shared client in
`src/lib/api/client.ts`. Backend ground truth: **`docs/catalog-api-docs.json`** (OpenAPI) and
**`docs/db-schema-catalog.sql`** (schema) — read the relevant slice, not the whole file.

## How it works

- **Shared API client** (`src/lib/api/client.ts`, `import 'server-only'`): exports `BASE_URL`
  (`process.env.CATALOG_API_URL ?? 'http://localhost:8080/api'`) and `apiFetch<T>`. All server-side
  API modules (`catalog.ts`, `availability.ts`) import from here — never duplicate these.
- **Base URL**: `process.env.CATALOG_API_URL ?? 'http://localhost:8080/api'`.
- A generic wrapper does the fetch and error handling. Since Feature #31, both `apiFetch` and
  `apiMutate` also handle trace correlation automatically:
  1. Call `await getTraceId()` to read the current `x-trace-id` from `next/headers`.
  2. Attach it as an `x-trace-id` header on the outbound request so the backend can correlate logs.
  3. Wrap the fetch execution in `runWithTrace(traceId, run)` so any `logger` calls made during the
     request have `traceId` stamped on the `LogRecord`.
  4. Fall back to running without an ALS scope when `traceId` is null (e.g. outside middleware context).

- Responses use `cache: 'no-store'` (always fresh).
- All response shapes are typed in the **same file** — keep types and helpers co-located.

## Current helpers (read-only)

| Helper | Endpoint | Returns |
|---|---|---|
| `getProducts()` | `GET /v1/catalog/products` | `ProductResponse[]` (unwraps `{ products }`) |
| `getServices()` | `GET /v1/catalog/services` | `ServiceResponse[]` (unwraps `{ services }`) |
| `getProductById(id)` | `GET /v1/catalog/products/{id}` | `ProductDetailResponse` (includes nested `services` + characteristics) |
| `getServiceById(id)` | `GET /v1/catalog/services/{id}` | `ServiceDetailResponse` |

### Data model: Characteristics vs Characteristic Specifications

Two related but distinct entities appear throughout the catalog domain:

| Entity | Interface | id field | What it represents |
|---|---|---|---|
| **Characteristic** ("Item") | `CharacteristicResponse` | `characteristic.id` | Standalone item template in the catalog (name, type, active). Managed at `/characteristics`. |
| **Characteristic Specification** | `CharacteristicSpecificationDetailResponse` | `spec.id` | Per-service attachment of a characteristic with extra config (price, unit, values, range). Lives inside `service.characteristics[]`. |

A `CharacteristicSpecificationDetailResponse` carries a nested `characteristic: CharacteristicResponse` field — this is a back-reference to the template, not the specification itself. Always use `spec.id` when the operation targets the specification (e.g., removing it from a service); use `spec.characteristic.id` only when the operation targets the underlying item template.

### Characteristic relationships & conditional visibility (Feature #49)

A specification may declare **parent relationships** — dependencies on other specs that must be configured first. `CharacteristicSpecificationDetailResponse` has an optional `parentRelationships?: CharacteristicRelationshipParentResponse[]` field containing `{ id: string, code: string, relationshipType: string }` tuples.

**Usage in booking flow:**

The `isSpecVisible(spec, configuredItems): boolean` helper in `src/lib/booking/pricing.ts` checks whether a spec is currently renderable by testing whether all its parent relationships exist in the configured items map. If a spec has no parents, it's always visible. This enables conditional spec reveal in the ItemsStep without backend round-trips:

```ts
const visibleSpecs = serviceDetail.characteristics.filter(
  (spec) => spec.active && isSpecVisible(spec, configuredItems)
)
```

When a parent spec's value changes, all dependent children are re-evaluated for visibility on the next render. No separate mutation is needed — the visibility logic is stateless.

Response model (abridged): `ProductResponse {id, name, description, active}` ·
`ServiceResponse` adds `basePrice` · `ProductDetailResponse` adds `services: ServiceDetailResponse[]` ·
services carry `characteristics: CharacteristicSpecificationDetailResponse[]`. **Prices are integers
in cents** — divide by 100 at the display edge (see `DESIGN.md` → Money).

## Booking pricing utilities (Feature #49)

Client-safe pricing helpers live in `src/lib/booking/pricing.ts` (no server-only imports). They compute
live estimates as the user configures items in the ItemsStep.

| Helper | Signature | Returns | Use for |
|---|---|---|---|
| `seedDefaults(detail)` | `ServiceDetailResponse → Record<string, ConfiguredItem>` | Map of spec ID → `{ value }` (seeded to defaults) | Initialize `configuredItems` from service detail when ItemsStep mounts |
| `isSpecVisible(spec, configuredItems)` | `(spec, Record<string, ConfiguredItem>) → boolean` | `true` if spec has no parents or all parents are configured | Filter specs to render in ItemsStep |
| `computeEstimate(detail, configuredItems)` | `(detail, Record<string, ConfiguredItem>) → { lineItems, totalCents }` | Array of `{ label, amountCents }` + `totalCents` | Display line-item breakdown + total in `BookingEstimate` component (ReviewStep, BookingFooter) |
| `buildConfiguredItemsPayload(detail, configuredItems)` | `(detail, Record<string, ConfiguredItem>) → CharacteristicItemRequest[]` | Array of `{ code, value, valueType, unitOfMeasure }` ready for backend submission | Prepare the configured items for the booking request; filters out unselected/inactive items, stringifies values, always includes `unitOfMeasure` (`"NONE"` if absent) |
| `usd` | `Intl.NumberFormat` | Formatter instance | `usd.format(amountCents / 100)` → `"$12.34"` (tabular figures, two decimals) |

**Pattern: seeding & re-computing on every change:**

```ts
// ItemsStep mounts — fetch detail and seed defaults
useEffect(() => {
  fetch(`/api/catalog/services/${serviceId}`)
    .then((res) => res.json() as Promise<ServiceDetailResponse>)
    .then((detail) => {
      dispatch({ type: "SET_SERVICE_DETAIL", payload: detail })
      const defaults = seedDefaults(detail)
      for (const [key, item] of Object.entries(defaults)) {
        dispatch({ type: "SET_ITEM", key, value: item.value })
      }
    })
}, [serviceId])

// Whenever configuredItems change, recompute estimate
const estimate = computeEstimate(serviceDetail, configuredItems)
```

All helpers are pure functions with no side effects or dependencies on global state — they accept
service detail + configured items and return computed values synchronously. This enables live,
responsive estimate updates as the user adjusts sliders and selections.

## Availability helpers (Feature #46)

Server-only; built on `apiFetch<T>` from `client.ts`. Types/constants that must also be imported by
client components live in the separate `src/lib/api/availability-types.ts` (no server imports).

| Helper | Endpoint | Returns |
|---|---|---|
| `getAvailableDates(startDate, days)` | `GET /api/availability/dates?startDate=&days=` (proxied via Next.js route) | `AvailableDatesResponse` |
| `getAvailableSlots(date)` | `GET /api/availability/slots?date=` (proxied via Next.js route) | `AvailableSlotsResponse` |

**Route handlers** (Next.js GET proxies to backend — validated, server-only):

| Route | File | Validates |
|---|---|---|
| `GET /api/availability/dates` | `src/app/api/availability/dates/route.ts` | `startDate` (YYYY-MM-DD), `days` (1–90) |
| `GET /api/availability/slots` | `src/app/api/availability/slots/route.ts` | `date` (YYYY-MM-DD) |

**Types** (`src/lib/api/availability-types.ts` — client-safe, no server imports):

- `AVAILABILITY_WINDOW_DAYS = 60` — constant for the calendar's max lookahead window.
- `AvailableSlotResponse`, `AvailableSlotsResponse`, `AvailableDatesResponse`.

### Pattern: client-safe types split

Server-only API modules (`availability.ts`, `client.ts`) cannot be imported by client components
(`"use client"`). When types or constants from an API module are needed on both sides, extract them
into a `*-types.ts` file with no server-only imports. The server module imports from there; client
components import types from the same file. Follow this pattern for any future API domain that has
client-side consumers.

## Services routes for booking (Features #48, #49)

Public booking flow fetches available services and service details via lightweight Next.js proxy
routes — not full server-side API helpers, since client components fetch directly with `fetch()`.

**Route handlers:**

| Route | File | Fetches | Filters | Returns |
|---|---|---|---|---|
| `GET /api/catalog/services` | `src/app/api/catalog/services/route.ts` | `getProductById(BOOKING_PRODUCT_ID)` | `services.filter((s) => s.active)` | `{ services: ServiceResponse[] }` |
| `GET /api/catalog/services/[id]` | `src/app/api/catalog/services/[id]/route.ts` | `getServiceById(id)` | `characteristics.filter((c) => c.active)` | `ServiceDetailResponse` with active specs only |

**Service list (`GET /api/catalog/services`, Feature #48):**
- Uses `BOOKING_PRODUCT_ID` constant (imported from `src/lib/api/booking`) — the catalog product UUID scoped to public bookings (`50abefda-704b-4a79-a6dd-046522f89e99`).
- Calls server-only `getProductById(BOOKING_PRODUCT_ID)` from `src/lib/api/catalog.ts`, gets back the full product with nested active and inactive services.
- Filters to only active services (`service.active === true`) — prevents inactive services from appearing in the UI.
- Returns the filtered list wrapped in `{ services }` (same shape as other catalog responses).
- Error handling: returns `{ error: '...' }` with HTTP 502 if the product fetch fails (backend unreachable).

**Service detail with characteristics (`GET /api/catalog/services/[id]`, Feature #49):**
- Fetches a single service by ID from the backend.
- Filters nested characteristics to only active specs (`characteristics.filter((c) => c.active)`).
- Returns `ServiceDetailResponse` with the filtered active characteristics only.
- Error handling: returns `{ error: '...' }` with HTTP 502 if the fetch fails.
- Used by `ItemsStep` to render dynamic item configuration forms and compute live pricing estimates.

**Future swap point:** `BOOKING_PRODUCT_ID` is a single constant (`src/lib/api/booking.ts`) because bookings are currently scoped to a single product.
When bookings become per-owner (each owner has their own product), replace the constant with a dynamic lookup
(e.g. from a request param, a subdomain, or a header) — both the route and the Server Action will read the same swap point — the route structure stays the same.

**Client-side usage** (Feature #48 ServiceStep, Feature #49 ItemsStep):
```ts
// Fetch active services for step 3 (ServiceStep):
fetch("/api/catalog/services")
  .then((res) => res.json() as Promise<{ services: ServiceResponse[] }>)
  .then((data) => setServices(data.services))

// Fetch service detail with characteristics for step 4 (ItemsStep):
fetch(`/api/catalog/services/${serviceId}`)
  .then((res) => res.json() as Promise<ServiceDetailResponse>)
  .then((detail) => dispatch({ type: "SET_SERVICE_DETAIL", payload: detail }))
```

Both routes are client-accessible; the route handlers validate and filter server-side before the response
leaves the API layer. The steps hold loading/selected/error state as client components.

## Adding a read helper

1. Confirm the endpoint, params, and response in `docs/catalog-api-docs.json`.
2. Add/extend the `*Response` interface(s) in `catalog.ts` to match the schema exactly.
3. Add a typed helper built on `apiFetch<T>` (import from `src/lib/api/client.ts`), unwrapping any
   envelope (e.g. `{ products }`) as the existing list helpers do.
4. Call it from an async Server Component (see `architecture.md`).

## Mutations

Writes go through `apiMutate<T>` (sibling to `apiFetch<T>`, accepts `method` + JSON `body`) and are
triggered by **Server Actions** (`"use server"`, see `src/app/dashboard/catalog/characteristics/actions.ts`),
not client `fetch`. After a mutation, revalidate the affected route instead of relying on
`cache: 'no-store'` alone.

Characteristics now have a full CRUD set (`src/lib/api/catalog.ts`):

| Helper | Endpoint | Notes |
|---|---|---|
| `getAllCharacteristics()` | `GET /v1/catalog/characteristics` | Returns **active and inactive** records (unwraps `{ items }`) — the UI shows all records without filtering |
| `createCharacteristic(body)` | `POST /v1/catalog/characteristics` | 201, returns `CharacteristicResponse` |
| `updateCharacteristic(id, body)` | `PUT /v1/catalog/characteristics/{id}` | 200, returns `CharacteristicResponse` |
| `deleteCharacteristic(id)` | `DELETE /v1/catalog/characteristics/{id}` | **Soft delete** — server deactivates the record and returns 204; the row is not removed |

`CharacteristicRequest` shape: `{ name, description, valueType: 'STRING' | 'NUMBER' | 'BOOLEAN', active }`
(all four fields required per OpenAPI).

### Pattern: soft-delete (no front-end filter)

`deleteCharacteristic` does **not** remove the record server-side — it deactivates it (`active: false`)
and returns 204. Because `getAllCharacteristics()` returns both active and inactive rows, the UI
**shows all records** (active and inactive) without a front-end filter. Operators can restore a
deactivated item by editing it and toggling **Active** on; the row reappears via the existing
revalidation. The delete `AlertDialog` copy in `characteristic-card.tsx` spells this out to the
operator ("will be deactivated… bring it back later by editing it").

> **History:** a `.filter((c) => c.active)` guard was removed from the characteristics listing page
> (`src/app/dashboard/catalog/characteristics/page.tsx`) and from the spec-picker in
> `service-specs-manager.tsx` as part of PR #28 acceptance-testing fixes. The backend returns all
> records when no active-filter param is sent, and the frontend now shows everything it receives.

Don't assume a DELETE endpoint removes a row — check the OpenAPI response/status first before adding
any new soft-deleting entity.

Keep the rule: **all catalog HTTP lives in `src/lib/api/catalog.ts`** — components call helpers,
never `fetch` directly.

## Service CRUD + characteristic-spec attach/remove

Services and their attached characteristic specs are now fully editable from the listing and
detail pages (`src/app/dashboard/catalog/services/actions.ts`):

| Helper | Endpoint | Notes |
|---|---|---|
| `createService(body)` | `POST /v1/catalog/services` | 201, returns `ServiceResponse`; body is `ServiceRequest` (includes `productId` — services are created under a product and can't be reassigned) |
| `updateService(id, body)` | `PUT /v1/catalog/services/{id}` | 200, returns `ServiceResponse`; body is `ServiceUpdateRequest` (no `productId`) |
| `deleteService(id)` | `DELETE /v1/catalog/services/{id}` | **Hard delete** — expects 204, the row is removed (unlike characteristics' soft-delete; no listing-filter pattern needed here) |
| `addServiceCharacteristics(serviceId, specs)` | `POST /v1/catalog/services/{id}/characteristics` | 201, returns `ServiceDetailResponse`; wraps `specs` in `{ characteristicsSpecs }`; body items are `CharacteristicSpecificationRequest` |
| `removeServiceCharacteristics(serviceId, ids)` | `DELETE /v1/catalog/services/{id}/characteristics` | Expects 204; wraps `ids` in `{ characteristics }` — see id gotcha below |

`ServiceRequest` / `ServiceUpdateRequest`: `{ name, description, active, basePrice, productId? }` —
`basePrice` is in **cents** (convert from operator-entered dollars at the action boundary, see
`saveServiceAction`'s `Math.round(priceValue * 100)`).

`CharacteristicSpecificationRequest`: `{ characteristicId, configurable, range, unitOfMeasure,
price, active, valueFrom?, valueTo?, characteristicValues? }` — `range: true` specs send
`valueFrom`/`valueTo`; `range: false` specs send `characteristicValues:
CharacteristicValueRequest[]` (`{ value, isDefault }`, exactly one `isDefault: true`). `price` is
in cents, same convention as `basePrice`.

### Gotcha: spec removal needs the *specification* id, not the characteristic id

`removeServiceCharacteristics(serviceId, ids)` — `ids` must be `spec.id` (the
`CharacteristicSpecificationDetailResponse` UUID, the specification's own primary key), **not**
`spec.characteristic.id` (the standalone `CharacteristicResponse` UUID).

The backend validates whether the service has a *characteristic specification* with that id —
sending the standalone characteristic id causes `"Characteristic uuid (...) is not associated with
this service"` on every call, regardless of which item is selected. This was previously documented
incorrectly (see commit `1d2999f`).

In code: `RemoveSpecControl` in `char-cards.tsx` binds `spec.id`; `removeSpecAction` passes it to
`removeServiceCharacteristics` as `[specId]`.

> **Correction note:** an earlier version of this doc (before commit `1d2999f`) stated the opposite
> — that `spec.characteristic.id` was correct and attributed failures to a backend defect. That was
> wrong. The bug was a frontend error (wrong id sent); it has been fixed.

### Pattern: range vs. value-set characteristic specs

`SpecFormSheet` (`src/components/catalog/spec-form-sheet.tsx`) toggles between two mutually
exclusive input modes for a spec — **range** (`valueFrom`/`valueTo` numeric bounds) and
**value-set** (a list of string options with exactly one marked default). The action
(`addSpecAction`) validates and shapes the payload accordingly, spreading only the relevant fields:

```ts
const spec: CharacteristicSpecificationRequest = {
  characteristicId, configurable, range: isRange, unitOfMeasure, price, active,
  ...(isRange ? { valueFrom, valueTo } : { characteristicValues }),
}
```

Follow this shape (validate per-mode, spread conditionally, guarantee one `isDefault`) for any
future configurable-attribute forms with similar either/or input shapes.

## Booking submission (Feature #50)

The public booking flow completes with a two-tier submission layer:

**API mutation** (`src/lib/api/booking.ts`):
- `createBooking(body: BookingRequest): Promise<BookingResponse>` — calls `apiMutate<BookingResponse>('/v1/bookings', 'POST', body)`.
- Request shape: `BookingRequest { customerEmail, productName, date, arrivalTime, notes?, services[] }` where each service is `ServiceSelectionRequest { serviceName, characteristics: CharacteristicItemRequest[] }`.
- Response: `BookingResponse { id, status, customer, productName, date, arrivalTime, subtotal, total, services, createdAt?, updatedAt? }` with nested `BookingServiceResponse[]` and `BookingItemResponse[]`.
- Prices in cents; divide by 100 at display edge (see DESIGN.md → Money).
- Also exports `BOOKING_PRODUCT_ID` constant — the hardcoded product UUID for public bookings (swap point for multi-tenant lookup when needed).

**Server Action** (`src/app/book/actions.ts`):
- `submitBookingAction(input: SubmitBookingInput): Promise<SubmitBookingResult>` — a `"use server"` function that wraps the API call with error handling.
- Input: `{ customerEmail, date, arrivalTime, serviceName, characteristics: CharacteristicItemRequest[], notes? }`.
- Returns a **discriminated union**: `{ ok: true; booking: BookingResponse } | { ok: false; errors: string[] }`.
- Fetches the product by `BOOKING_PRODUCT_ID` to populate `productName` in the request, then calls `createBooking()`.
- Catches errors and normalizes to an `errors` array (defaults to the error message or generic fallback).

**Pattern: discriminated-union Server Action results**

Instead of throwing or relying on `try`/`catch` in client code, Server Actions can return a discriminated union that client components pattern-match on:

```ts
// Server Action returns one of two shapes
type Result = { ok: true; data: T } | { ok: false; errors: string[] }

// Client component uses it in a transition
const result = await submitBookingAction(input)
if (result.ok) {
  dispatch({ type: 'SET_BOOKING_RESULT', booking: result.booking })
  dispatch({ type: 'NEXT' })
} else {
  setErrors(result.errors)
}
```

This avoids thrown exceptions in async contexts and makes error handling explicit. Use this pattern for any future mutations that need user-facing error feedback.

**Integration**: ReviewStep (step 5) calls `submitBookingAction` on button click with `useTransition`, dispatches `SET_BOOKING_RESULT` on success to seed ConfirmationStep (step 6) with the response data, or displays errors inline on failure.
