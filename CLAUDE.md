# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

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
  app/           # routes (App Router file conventions)
  components/
    ui/          # shadcn-generated components (owned, not a package)
  lib/
    utils.ts     # cn() helper (clsx + tailwind-merge)
```

Import alias `@/*` resolves to `src/*`.

## Key conventions

- All components are Server Components by default; add `"use client"` only when browser APIs or interactivity require it.
- CSS variables for design tokens are defined in `globals.css` under `@theme`; do not hardcode colours.
- `cn()` from `@/lib/utils` is the standard way to merge Tailwind classes.
- Tailwind CSS v4 uses `@utility`, `@variant`, `@theme` in CSS instead of `theme.extend` in JS config.
