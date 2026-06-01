# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md
@DESIGN.md

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check without building
```

To add a shadcn component:
```bash
npx shadcn@latest add <component-name>
```

## Stack

- **Next.js 16** with App Router — APIs and conventions may differ from training data; check `node_modules/next/dist/docs/` for current behaviour
- **React 19** — new hooks (`use`, `useOptimistic`, `useFormStatus`) are available; legacy patterns like class components are not used
- **Tailwind CSS v4** — configuration lives in `src/app/globals.css` via `@theme`, not in a `tailwind.config.js` file
- **shadcn/ui** (style: `base-nova`, icons: `lucide-react`) — components are copied into `src/components/ui/` and owned by this repo; edit them freely

## Project structure

```
src/
  app/
    layout.tsx                       # root layout — font loading (Hanken Grotesk, Bricolage Grotesque)
    globals.css                      # Tailwind v4 @theme — all design tokens
    dashboard/
      layout.tsx                     # shell: TopHeader + main + BottomNav
      catalog/
        products/
          page.tsx
          [id]/page.tsx              # product detail
        services/
          page.tsx
          [id]/page.tsx              # service detail
  components/
    ui/                              # shadcn components (owned — edit freely)
    catalog/                         # domain cards: ProductCard, ServiceCard
    dashboard/                       # shell: TopHeader, BottomNav, SidebarNav, MobileDrawer
  lib/
    api/
      catalog.ts                     # apiFetch<T> + typed helpers (getProducts, getServices, …)
    utils.ts                         # cn() helper (clsx + tailwind-merge)
docs/design/                         # extended design system: tokens, UI kits, preview specimens
```

Import alias `@/*` resolves to `src/*`.

## Where to put new code

- New shadcn primitives → `src/components/ui/` via `npx shadcn@latest add <name>`
- New design tokens → `src/app/globals.css` `:root` block, then document in `DESIGN.md`
- New API helpers → `src/lib/api/catalog.ts` using the existing `apiFetch<T>` wrapper

## Data fetching

All pages are async Server Components — fetch data directly in the component, no `useEffect` or SWR.

Dynamic route params are `Promise<{ id: string }>` in Next.js 16 — always `await params` before accessing:

```ts
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getProductById(id)
  ...
}
```

Use `"use client"` only when the component needs `usePathname`, `useState`, or browser APIs (shell nav, search toggles, accordion state).

## API layer

`src/lib/api/catalog.ts` provides typed helpers (`getProducts`, `getServices`, `getProductById`, `getServiceById`) built on a generic `apiFetch<T>` wrapper.

- Base URL: `CATALOG_API_URL` env var (default: `http://localhost:8080/api`)
- Responses use `cache: 'no-store'`
- All API response shapes are typed in the same file

## Key conventions

- CSS variables for design tokens are defined in `globals.css` under `:root`; do not hardcode colours.
- `cn()` from `@/lib/utils` is the standard way to merge Tailwind classes.
- Tailwind CSS v4 uses `@utility`, `@variant`, `@theme` in CSS instead of `theme.extend` in JS config.
- Icons: `lucide-react` only.
- No test framework is configured — there are no `__tests__/` directories or test files.
