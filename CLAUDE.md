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
        products/page.tsx
        services/page.tsx
  components/
    ui/                              # shadcn components (owned — edit freely)
    catalog/                         # domain cards: ProductCard, ServiceCard
    dashboard/                       # shell: TopHeader, BottomNav, SidebarNav, MobileDrawer
  lib/
    utils.ts                         # cn() helper (clsx + tailwind-merge)
```

Import alias `@/*` resolves to `src/*`.

## Where to put new code

- New shadcn primitives → `src/components/ui/` via `npx shadcn@latest add <name>`
- New design tokens → `src/app/globals.css` `:root` block, then document in `DESIGN.md`

## Key conventions

- CSS variables for design tokens are defined in `globals.css` under `:root`; do not hardcode colours.
- `cn()` from `@/lib/utils` is the standard way to merge Tailwind classes.
- Tailwind CSS v4 uses `@utility`, `@variant`, `@theme` in CSS instead of `theme.extend` in JS config.
- Icons: `lucide-react` only.
