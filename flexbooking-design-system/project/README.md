# FlexBooking — Design System

FlexBooking is a **simple-but-smart operations platform** for service companies — think a
cleaning company, a maintenance crew, a mobile detailing outfit. It gives a business one place to
manage its **services catalog, products, bookings, customers and payments**. The product surface
this design system is built from is the **Catalog Dashboard**: an admin web app where an operator
curates the **Products** and **Services** they sell.

This folder is a portable design system: brand foundations (color, type, spacing, elevation),
real UI components lifted from the product's code, preview cards for the Design System tab, and a
high-fidelity, interactive **UI kit** recreation of the dashboard.

> **Aesthetic in one line:** a warm, human, editorial dashboard — **Bricolage Grotesque** display
> type over **Hanken Grotesk** body, a **clay / terracotta** primary on warm cream surfaces, soft
> rounded cards with diffuse shadows, and a reserved **sage** accent for "Active" status.
> Premium and calm, made for non-technical small-business owners.

---

## Sources

Everything here was derived from the product's front-end repository. The reader may not have
access, but it is recorded so they can go deeper:

- **GitHub:** [`aberkanimed/flexbooking-ui`](https://github.com/aberkanimed/flexbooking-ui) — branch `main`
  (the task referenced a `feat`/`catalog-dashboard` subtree; the catalog dashboard lives under
  `src/app/dashboard/catalog/` on `main`, which is what was imported and recreated here).
  - Stack: **Next.js 16** (App Router) · **React 19** · **Tailwind CSS v4** · **shadcn/ui** (style
    `base-nova`, icons `lucide-react`) · `@base-ui/react` primitives.
  - Design tokens live in `src/app/globals.css` under `@theme` — copied verbatim into
    `colors_and_type.css`.

To build better FlexBooking designs, **explore that repository** — the `src/components/ui/`
folder holds the canonical component source, and `globals.css` is the single source of truth for
tokens. A read-only copy of the imported source sits in [`_reference/`](_reference/).

---

## Content fundamentals

How FlexBooking writes. The product copy is **sparse, plain and operator-facing** — it talks to a
busy small-business owner, never markets at them.

- **Voice & person.** Neutral and direct. Labels are nouns (`Products`, `Services`, `Base price`).
  Helper text addresses the user in second person, lightly: *"Products you add will appear here."*
  No "we," no exclamation marks, no personality flourishes.
- **Casing.** **Sentence case everywhere** — headings (`Your catalog`), buttons (`New service`),
  empty states. The only uppercase is the tiny tracked **eyebrow / group label** (`CATALOG`,
  `BASE PRICE`). Never Title Case on sentences.
- **Counts & pluralization.** Counts are spelled out and correctly pluralized:
  *"1 product in your catalog"*, *"12 services in your catalog"*, or *"No products yet."*
- **Empty states** are two lines: a bold fact (*"No products found"*) + a quiet next step
  (*"Products you add will appear here."*). Never blamey, never cute.
- **Money.** Formatted with `Intl.NumberFormat` as USD, two decimals, tabular figures
  (`$189.00`). Prices are stored in **cents** and divided by 100 at the edge.
- **Emoji:** none. **Exclamations:** none. **Jargon:** none. The vibe is *quietly competent admin
  tooling* — closer to Linear/Vercel than to a consumer app.

**Do / Don't**

| Do | Don't |
|---|---|
| `New service` | `Create a New Service!` |
| `No services yet` | `Oops — nothing here 😕` |
| `2 products in your catalog` | `Products (2)` |
| `Base price` | `PRICE:` |

---

## Visual foundations

The whole system is a study in restraint. If in doubt, **remove color and reduce contrast of
chrome**, not content.

- **Color.** A **warm clay / terracotta** primary carries the system: `--primary`
  `oklch(0.62 0.15 41)` — warm, confident, human — used for primary buttons, the FAB, the logo
  chip, focus rings and active accents. It darkens to `--primary-deep` on hover/press, and softens
  to `--primary-soft` (icon thumbnails) and `--primary-tint` (hover washes). Surfaces are **warm**:
  a cream canvas `oklch(0.969 0.014 78)` over warm-white cards, with a warm-brown ink. Neutrals are
  low-chroma **warm** tones (sand), never pure gray. A **sage** pair
  (`oklch(0.93 0.04 150)` / `oklch(0.52 0.08 155)`) is reserved for the **"Active" status pill**,
  sand for **"Inactive"**, and `--destructive` warm-red for dangerous actions — those are the only
  other hues. Keep clay + sage + warm-red as the chromatic vocabulary; don't add more.
- **Type.** A characterful pairing: **Bricolage Grotesque** (display) for headings, prices and the
  wordmark — set bold (`600`–`800`) with tight `-0.03em` tracking — over **Hanken Grotesk** for all
  body, labels and helper text. Body is **14–15px**, card titles 17.5px/600 display, hero H1
  ~40px/700 display. Eyebrows are 12px/700 uppercase with `0.13em` tracking, in clay.
- **Spacing.** Tailwind's **4px base unit**. Card padding `16px`, card-grid gap `16px`, main
  content gutter `24px` (mobile) → `32px` (desktop), capped at `max-w-6xl` and centered.
- **Backgrounds.** Flat solid fills only. **No gradients, no images, no patterns, no textures.**
  The sidebar is a hair lighter than canvas; card footers use a `muted/50` wash to separate the
  price strip. Sheets dim the page with `bg-black/10` + a subtle `backdrop-blur-xs`.
- **Corner radii.** Soft and generous. Inputs/base `14px`, icon thumbnails `15px`, **cards `22px`**,
  **sheets `26px`**, and **buttons / chips / badges are full pills** (`999px`).
- **Cards.** Warm-white surface, **22px** radius, a **1px warm border** plus a faint white inset
  highlight and a **low diffuse shadow** — soft, never a hard drop. They **lift** on hover
  (translateY + a deeper diffuse shadow). A clay-soft icon thumbnail sits top-left, the status pill
  top-right.
- **Elevation / shadows.** Soft, warm and diffuse. Three roles: **card** (1px border + faint inset +
  low diffuse shadow), **lifted** (deeper diffuse shadow on hover / sheets / modals), and **clay
  glow** (a soft colored shadow under primary buttons & the FAB).
- **Borders.** 1px, color `--border` `oklch(0.922 0 0)`. Dashed 1px borders denote **empty /
  drop-zone** containers.
- **Hover states.** Quiet. Buttons darken the fill to ~80% opacity (`bg-primary/80`) or wash to
  `muted`; ghost items fill with `muted`; nav items go from 65% → full foreground and gain a
  `muted` fill. No color shifts to a new hue.
- **Press / active states.** Buttons nudge **down 1px** (`active:translate-y-px`); the FAB scales to
  `0.94`. Active nav uses a **clay-soft wash** with clay text + icon (top tabs invert to ink fill).
- **Focus.** A **3px ring** in **clay** (`--ring`) — warm and on-brand. Destructive controls focus in red.
- **Motion.** Minimal and functional. Color/background transitions ~150ms ease; sheets slide
  in/out ~200ms `ease-in-out` with an opacity fade. **No bounces, no springs, no decorative
  animation.**
- **Transparency & blur.** Used sparingly: the sticky header is `bg-background/95` +
  `backdrop-blur-sm`; the sheet overlay is `black/10` + `backdrop-blur-xs`. Opacity tokens
  (`/10`, `/50`, `/65`, `/80`) do most of the tonal work instead of extra color stops.
- **Imagery.** There is **none** in the product. No photography, no illustration, no avatars —
  meaning is carried by type, layout and a single line-icon set. If a design needs imagery, treat
  it as a deliberate exception and keep it warm. Icon thumbnails (clay-soft tiles) stand in for
  product imagery on cards.
- **Layout rules.** A 60–68px top bar (logo + nav + search + avatar). The catalog is a responsive
  card grid (1 → 2 → 3 columns), centered at `max-w-6xl`. Navigation is **top pill tabs** on laptop
  and a **fixed bottom tab bar** on mobile; detail/add panels are **bottom sheets** (mobile) →
  **centered modals** (tablet) → **right-side slide-overs** (laptop). All chrome is pinned to the
  app shell (container-query driven), so the kit is portable into any frame.
  `max-w-6xl`. Card grids are responsive 1 → 2 → 3 columns.

---

## Iconography

- **Set:** **[Lucide](https://lucide.dev)** (`lucide-react` in the product), used at **16px**
  (`size-4`) in nav and buttons, with the library default **2px stroke**. Line icons, rounded
  caps/joins, no fills. Icons inherit `currentColor` and dim to ~40% when idle in the sidebar.
- **In this kit:** icons are loaded from the **Lucide CDN** (UMD) and rendered through a small
  `Icon` component — the same set the product uses, so there is **no substitution**.
- **Known icons in use:** `calendar-range` (the FlexBooking logo mark), `package` (Products),
  `wrench` (Services), `menu` (mobile drawer), `x` (close), plus `plus` / `trash-2` for actions in
  this kit's specimens.
- **Emoji / unicode glyphs:** **never** used as icons. The currency symbol in prices comes from
  `Intl.NumberFormat`, not a hand-placed glyph.
- **Logo:** the brand mark is an **"F" monogram built from stacked "booking-slot" bars** of stepped
  lengths, with a detached modular slot signalling flexibility — set in a **brand-blue rounded chip**
  beside the `FlexBooking` wordmark (Geist 600, `-0.02em`; "Booking" in a lighter cool weight). See
  `preview/logo.html` for the horizontal lockup, standalone mark, and inverted variants.

---

## Index — what's in this folder

| Path | What it is |
|---|---|
| `README.md` | This document. |
| `colors_and_type.css` | All design tokens: color, type roles, radii, elevation, spacing. Import this first. |
| `SKILL.md` | Agent-Skills manifest so this system can be used as a downloadable skill. |
| `preview/` | Small HTML specimen cards that populate the **Design System** tab (colors, type, spacing, components, brand). |
| `ui_kits/catalog-dashboard/` | High-fidelity, **interactive & responsive** recreation of the product in the **Warm Studio** direction (mobile / tablet / laptop). See its own `README.md`. |
| `explorations/` | Side-by-side design-direction studies on a canvas (`Dashboard Directions.html`): Operator Console vs Warm Studio vs the reference. |
| `_reference/` | Read-only copy of the imported `flexbooking-ui` source (`app/`, `components/`, `lib/`) for ground-truth. |
| `assets/` | Copied brand/source assets (e.g. favicon). |

### UI kits
- **`ui_kits/catalog-dashboard/`** — the Catalog Dashboard in the chosen **Warm Studio** direction:
  top/bottom responsive nav, Products / Services views, live search + status filters, and detail /
  add **sheets** (bottom sheet → centered modal → side panel across breakpoints). Fully interactive.

---

## Notes & substitutions
- **Fonts:** Geist & Geist Mono are loaded from **Google Fonts** (the product uses `next/font`,
  same families). No local `.ttf` files are bundled — flag if you need them embedded for offline
  use.
- **Scope:** the product's shipped code covers the **catalog** only (products & services). The
  broader FlexBooking vision (bookings, customers, payments) is **not yet in the codebase**, so it
  is intentionally **not** recreated here — doing so would mean inventing UI.
