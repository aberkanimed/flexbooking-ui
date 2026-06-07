# Design System — FlexBooking UI

> **Loaded on demand for UI work** (not always-on). This is the engineer's cheat-sheet — tokens,
> type, components, and code patterns. For brand philosophy, visual foundations, and content depth,
> see `docs/design/README.md` (the `flexbooking-design` skill's home doc).

**Theme:** Warm Studio — clay/terracotta brand, cream canvas, sage/sand accents.
All tokens live in `src/app/globals.css` under `:root` (canonical). Never hardcode colors.

---

## Quick Reference

- Brand color: `bg-primary` (clay terracotta) / hover: `bg-primary-deep`
- Page background: `bg-background` (warm cream)
- Cards: `bg-card` + `ring-1 ring-foreground/10` + `rounded-3xl`
- Heading font: `font-heading` (Bricolage Grotesque)
- Body font: `font-sans` (Hanken Grotesk)
- Class merging: always use `cn()` from `@/lib/utils`
- Icons: `lucide-react` only

---

## Design Sources

The extended design reference lives in `docs/design/` (full directory in `docs/kb/INDEX.md`).
Consult the matching kit/specimen before writing any new page or component.

### UI kits — consult before coding a page

| Kit | Path | Pages covered | What to look for |
|-----|------|---------------|------------------|
| Catalog Dashboard | `docs/design/ui_kits/catalog-dashboard/` | Products listing, Services listing | Responsive shell (top/bottom nav), search + status filter bar, card grid, add/edit sheets, mobile FAB, bottom sheet → modal → side-panel breakpoints |
| Product Detail | `docs/design/ui_kits/product-detail/` | Product detail page | Product header, 4-up rollup stats row, service accordion with characteristics, workbench rail layout (stacked / side-by-side modes) |
| Service Detail | `docs/design/ui_kits/service-detail/` | Service detail page | Service header, base-price display, characteristics layout |

Each kit is a self-contained `index.html` — open it in a browser to interact with the layout at every breakpoint.

### Preview specimens — individual components

Located in `docs/design/preview/`. Key specimens:

| File | Documents |
|------|-----------|
| `card-product.html`, `card-service.html` | ProductCard and ServiceCard anatomy |
| `badges.html`, `data-badges.html` | Badge variants and data-label badges |
| `rollup-stats.html` | 4-up stat tile row (icon, label, value) |
| `accordion-service.html` | Service accordion open/close states |
| `char-cards.html` | Characteristic cards inside the accordion |
| `empty-state.html` | Empty state layout (icon + bold fact + quiet next step) |
| `nav-states.html` | Top nav tab and bottom nav active/idle states |
| `buttons.html`, `button-sizes.html` | Button variants and size scale |

### Brand philosophy and content rules

`docs/design/README.md` — brand context, visual foundations, and content fundamentals. The "Content & Copy" section below is drawn from it.

---

## Color Tokens

All tokens are in `oklch()` color space. Reference via Tailwind utilities (`bg-primary`, `text-muted-foreground`, etc.) or CSS variables (`var(--primary)`).

### Brand / Primary

| Token | Tailwind class | Semantic role |
|-------|----------------|---------------|
| `--primary` | `bg-primary` / `text-primary` | Clay terracotta — CTAs, active states, focus rings |
| `--primary-foreground` | `text-primary-foreground` | Off-white text on primary backgrounds |
| `--primary-deep` | `bg-primary-deep` | Darker clay — button hover state |
| `--primary-soft` | `bg-primary-soft` | Light warm tint — icon containers, hover backgrounds |
| `--primary-tint` | `bg-primary-tint` | Very subtle warm tint — accent backgrounds |

### Surfaces & Text

| Token | Tailwind class | Semantic role |
|-------|----------------|---------------|
| `--background` | `bg-background` | Page canvas (warm cream) |
| `--foreground` | `text-foreground` | Primary body text (warm brown) |
| `--card` | `bg-card` | Card surface (warm white) |
| `--card-foreground` | `text-card-foreground` | Text on cards |
| `--popover` | `bg-popover` | Popover / dropdown surface |

### Quiet Fills

| Token | Tailwind class | Semantic role |
|-------|----------------|---------------|
| `--secondary` | `bg-secondary` | Warm sand — secondary buttons, fills |
| `--muted` | `bg-muted` | Same as secondary — quiet fills |
| `--muted-foreground` | `text-muted-foreground` | Secondary / caption text |
| `--accent` | `bg-accent` | Subtle warm accent background |
| `--accent-foreground` | `text-accent-foreground` | Clay text on accent backgrounds |

### Semantic

| Token | Tailwind class | Semantic role |
|-------|----------------|---------------|
| `--destructive` | `text-destructive` / `bg-destructive` | Errors, warnings (red-orange) |
| `--border` | `border-border` | Subtle dividers and card rings |
| `--input` | `border-input` | Input field borders |
| `--ring` | `ring-ring` | Focus rings (matches primary) |

### Status

| Token | Usage |
|-------|-------|
| `--status-active-bg` / `--status-active-fg` | Sage green pair — "Active" status pill |
| `--status-inactive-bg` / `--status-inactive-fg` | Sand pair — "Inactive" status pill |

Use these via inline styles or CSS variables: `style={{ background: 'var(--status-active-bg)', color: 'var(--status-active-fg)' }}`.

### Sidebar

| Token | Tailwind class |
|-------|----------------|
| `--sidebar` | `bg-sidebar` |
| `--sidebar-foreground` | `text-sidebar-foreground` |
| `--sidebar-primary` | `bg-sidebar-primary` |
| `--sidebar-accent` | `bg-sidebar-accent` |
| `--sidebar-border` | `border-sidebar-border` |

---

## Typography

### Font Families

| Variable | Tailwind class | Font | Weights | Use for |
|----------|----------------|------|---------|---------|
| `--font-heading` | `font-heading` | Bricolage Grotesque | 400–800 | Page titles, card titles, display text |
| `--font-sans` | `font-sans` | Hanken Grotesk | 400–700 | Body copy, UI labels, inputs |
| `--font-mono` | `font-mono` | Geist Mono | default | Code, numeric data |

Both are loaded in `src/app/layout.tsx` and exposed as CSS variables via `next/font/google`.

### Type Scale Patterns

| Role | Classes |
|------|---------|
| Page h1 | `font-heading font-bold text-[30px] sm:text-[38px] lg:text-[44px] leading-[1.02] tracking-[-0.03em]` |
| Section header | `font-heading font-bold text-[19px]` |
| Eyebrow label | `text-xs font-semibold uppercase tracking-[0.13em] text-primary` |
| Card title | `font-heading font-semibold text-base leading-snug` |
| Body text | `text-[15px] leading-relaxed` |
| Secondary text | `text-sm text-muted-foreground` |
| Caption / meta | `text-xs text-muted-foreground` |
| Price / tabular | `text-sm tabular-nums` |

---

## Radius Scale

Base: `--radius: 0.625rem` (10px)

| Token | Value | Tailwind class | Use for |
|-------|-------|----------------|---------|
| `--radius-sm` | 6px | `rounded-sm` | Small badges |
| `--radius-md` | 8px | `rounded-md` | Inputs, small buttons |
| `--radius-lg` | 10px | `rounded-lg` | Default radius |
| `--radius-xl` | 14px | `rounded-xl` | Cards (inner), sidebar items |
| `--radius-2xl` | 18px | `rounded-2xl` | — |
| `--radius-3xl` | 22px | `rounded-3xl` | Cards (outer), image containers |
| `--radius-4xl` | 26px | `rounded-4xl` | Sheets, drawers |
| `rounded-full` | 50% | `rounded-full` | Pills, avatars, circular buttons |

---

## Shadows

| Variable | Tailwind equivalent | Use for |
|----------|--------------------|----|
| `--shadow-card` | `shadow-card` | Default card elevation (subtle inset + drop) |
| `--shadow-pop` | `shadow-pop` | Hover elevation, popovers (larger drop shadow) |
| `--shadow-cta` | `shadow-cta` | Primary CTA buttons (warm clay tint) |

---

## Component Inventory

### shadcn/ui — `src/components/ui/`

> These components use `@base-ui/react` primitives (not Radix UI). Check source before assuming API.

| Component | File | Variants / Sizes |
|-----------|------|-----------------|
| Button | `button.tsx` | variants: `default` `outline` `secondary` `ghost` `destructive` `link` / sizes: `xs` `sm` `default` `lg` `icon` `icon-xs` `icon-sm` `icon-lg` |
| Card | `card.tsx` | Compound: `Card` `CardHeader` `CardTitle` `CardDescription` `CardAction` `CardContent` `CardFooter` / sizes: `default` `sm` |
| Badge | `badge.tsx` | variants: `default` `secondary` `destructive` `outline` `ghost` `link` |
| Sheet | `sheet.tsx` | Sides: `top` `right` `bottom` `left` / Compound: `Sheet` `SheetTrigger` `SheetContent` `SheetHeader` `SheetFooter` `SheetTitle` `SheetDescription` `SheetClose` |
| AlertDialog | `alert-dialog.tsx` | Confirmation modal — Compound: `AlertDialog` `AlertDialogTrigger` `AlertDialogContent` `AlertDialogHeader` `AlertDialogFooter` `AlertDialogTitle` `AlertDialogDescription` `AlertDialogAction` `AlertDialogCancel`. Use to gate destructive actions (e.g. delete) behind a Cancel/Confirm step before calling the server action |

### Domain Components — `src/components/catalog/`

| Component | File | Use for |
|-----------|------|---------|
| StatusPill | `status-pill.tsx` | Shared `active`/`inactive` status pill (`sm` size variant, `className`); colors are inline styles per Golden Rule #9 — use this instead of re-implementing the pill markup |
| ProductCard | `product-card.tsx` | Grid card with icon, status pill, name, description |
| ServiceCard | `service-card.tsx` | Same structure as ProductCard; footer shows base price |

### Shell Components — `src/components/dashboard/`

| Component | File | Use for |
|-----------|------|---------|
| TopHeader | `top-header.tsx` | App header — logo, nav tabs, search, notifications, avatar |
| BottomNav | `bottom-nav.tsx` | Mobile-only tab bar (hidden on sm+); links: Products, Services, Characteristics — only entries with shipped pages |
| MobileDrawer | `mobile-drawer.tsx` | Sheet-based nav drawer for mobile |
| SidebarNav | `sidebar-nav.tsx` | Grouped nav items used inside MobileDrawer |

---

## Layout Patterns

### Dashboard Shell (`src/app/dashboard/layout.tsx`)

```
TopHeader          (fixed top)
  └─ main          (flex-1, overflow-y-auto)
       └─ content  (max-w-6xl, px-4 sm:px-6 lg:px-8, py-4 sm:py-6 lg:py-8)
BottomNav          (fixed bottom, hidden on sm+)
```

### Catalog Page Structure

```
Hero section
  Eyebrow label (text-xs uppercase tracking-wide text-primary)
  h1 title (font-heading, responsive 30→44px)
  Description paragraph (text-[15px] text-muted-foreground)
  CTA Button (h-[46px] rounded-full px-5 bg-primary shadow-cta)

Card grid
  grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
  gap-3.5 sm:gap-4 lg:gap-[18px]

Empty state (when no items)
  Centered container, rounded-3xl dashed border
  Icon + heading + description + CTA
```

### Responsive Breakpoints

| Breakpoint | Layout changes |
|------------|----------------|
| `< sm` (mobile) | 1-col grid, BottomNav visible, search hidden |
| `sm` (≥640px) | 2-col grid, top nav tabs visible, BottomNav hidden |
| `xl` (≥1280px) | 3-col grid |

---

## Recurring Visual Patterns

### Card

```tsx
<div className="bg-card ring-1 ring-foreground/10 rounded-3xl p-[18px] shadow-card
                hover:-translate-y-0.5 hover:shadow-pop hover:ring-primary-soft
                transition-all duration-200">
```

### Icon Container (inside card)

```tsx
<div className="size-[50px] rounded-[15px] bg-primary-soft flex items-center justify-center">
  <Icon className="size-5 text-primary" />
</div>
```

### Status Pill

Use the shared `StatusPill` component (`src/components/catalog/status-pill.tsx`) — don't
re-implement this markup. It renders `active`/`inactive` with an optional `sm` size and accepts
`className`; status colors stay inline-style per Golden Rule #9 (`var(--status-*-bg/fg)`).

```tsx
<StatusPill active={item.active} />
<StatusPill active={item.active} sm />
```

### CTA Button

```tsx
<Button size="lg" className="h-[46px] rounded-full px-5 shadow-cta">
  Label
</Button>
```

### Sidebar Nav Item (active state)

```tsx
className="bg-sidebar-accent text-sidebar-accent-foreground rounded-xl"
```

---

## Content & Copy

FlexBooking copy is sparse, plain, and operator-facing. Follow these rules on every page.

- **Voice:** neutral and direct; labels are nouns (`Products`, `Base price`); helper text uses light second person (`"Products you add will appear here."`). No "we," no exclamation marks.
- **Casing:** sentence case everywhere — headings, buttons, empty states. The **only** uppercase is the tiny tracked eyebrow/group label (`CATALOG`, `BASE PRICE`). Never Title Case on sentences.
- **Counts:** spelled out and pluralized correctly: `"1 product in your catalog"` / `"12 services in your catalog"` / `"No products yet."` Never `"Products (2)"`.
- **Empty states:** two lines — a bold fact (`"No products found"`) followed by a quiet next step (`"Products you add will appear here."`). Never blamey or cute.
- **Money:** format with `Intl.NumberFormat` as USD, two decimals, tabular figures (`$189.00`). Prices are stored in cents — divide by 100 at the display edge.
- **Never use:** emoji, exclamation marks, or jargon.

---

## Conventions & Don'ts

- **Never hardcode colors** — always use CSS variables or Tailwind semantic classes
- **Never use hex/hsl** — tokens are `oklch()`; converting will break dark mode
- **Always use `cn()`** from `@/lib/utils` to merge Tailwind classes
- **Server Components by default** — add `"use client"` only for browser APIs or interactive state
- **Icons**: `lucide-react` only — no other icon libraries
- **Font classes**: use `font-heading` / `font-sans` — never reference font names directly
- **New Tailwind utilities**: define in `globals.css` with `@utility`, not in a config file

---

## How to Extend

When you add a new page, section, or component:

1. **New CSS tokens** → add to `globals.css` `:root` block (and `.dark` if needed), then document them in the Color Tokens table above
2. **New component** → add a row to the Component Inventory with file path and purpose
3. **New visual pattern** → add a snippet under Recurring Visual Patterns
4. **New layout structure** → add a diagram under Layout Patterns
5. **New convention or gotcha** → add to Conventions & Don'ts

Keep entries concise — one row per component, one snippet per pattern.
