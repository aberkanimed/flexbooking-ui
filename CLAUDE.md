# CLAUDE.md

Guidance for agents working in this repository. This file is the **always-on router**: it carries
only the universal rules and a map of where to find everything else. **Do not paste deep docs here**
— add them under `docs/kb/` and route to them from the Knowledge Map below, so each task loads only
what it needs.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # type-check without building
```

Add a shadcn component: `npx shadcn@latest add <component-name>`

## Stack

- **Next.js 16** (App Router) · **React 19** · **Tailwind CSS v4** (config in CSS, no JS config) ·
  **shadcn/ui** (style `base-nova`, built on **`@base-ui/react`** — *not* Radix) · `lucide-react` icons.
- APIs differ from older training data — see the Knowledge Map for where to verify (context7 MCP,
  `node_modules/next/dist/docs/`).

## Golden Rules (apply to every change — non-negotiable)

1. **Colors are `oklch()`** — never hardcode, never convert to hex/hsl (dark mode breaks). Use
   Tailwind semantic classes (`bg-primary`) or `var(--token)`.
2. **shadcn = base-ui, not Radix** — read the source in `src/components/ui/<x>.tsx` before using a
   primitive; props/events differ from Radix.
3. **Tailwind v4 has no config file** — all theme lives in `src/app/globals.css` via `@theme`
   `@utility` `@variant`. Never create `tailwind.config.js` or use `theme.extend`.
4. **Fonts via classes only** — `font-heading` (Bricolage Grotesque) for display, `font-sans`
   (Hanken Grotesk) for body. Never name font families in CSS/inline styles.
5. **Merge classes with `cn()`** from `@/lib/utils`.
6. **Server Components by default** — `"use client"` only for browser APIs / interactive state.
7. **Next 16 dynamic params are a Promise** — `await params` before reading (`params: Promise<{ id: string }>`).
8. **Fetch in async Server Components** — no `useEffect`/SWR for page data.
9. **Status colors are inline-style only** — `--status-*-bg/fg` are not Tailwind utilities; use
   `style={{ background: 'var(--status-active-bg)', color: 'var(--status-active-fg)' }}`.
10. **Copy is sentence-case, sparse, operator-facing** — no emoji, no exclamation marks, no jargon.
11. **Money** — `Intl.NumberFormat` USD, 2 decimals, tabular; prices stored in **cents**, divide by 100 at the edge.
12. **Icons: `lucide-react` only.** No test framework is configured (no `__tests__/`).

## Knowledge Map — load only what the task needs

`docs/` is local reference (gitignored). Full index with sizes and "when to read": **`docs/kb/INDEX.md`**.

| If the task involves… | Load / use |
|---|---|
| **Any** code change | The Golden Rules above (already loaded) |
| **UI page or component / styling** | `DESIGN.md` (token + pattern cheat-sheet) → open the matching `docs/design/preview/<x>.html` + `docs/design/ui_kits/*/index.html`; for net-new visuals invoke the **`flexbooking-design`** skill |
| **Routing / Server vs Client / data fetching / rendering** | `docs/kb/architecture.md`; **`nextjs`** skill; **context7** MCP for Next 16 API specifics |
| **API helpers / fetching catalog data / mutations** | `docs/kb/api-and-data.md`; `docs/catalog-api-docs.json` (OpenAPI); `docs/db-schema-catalog.sql` |
| **shadcn primitives** (Button/Card/Badge/Sheet/new) | `AGENTS.md` (base-ui note) → read `src/components/ui/<x>.tsx`; **`shadcn`** skill |
| **Tailwind v4 tokens / new utilities** | `AGENTS.md` + `src/app/globals.css`; **context7** MCP for Tailwind v4 |
| **Building a whole feature end-to-end** | `docs/kb/feature-workflow.md` (orchestrates the rows above) |
| **Commit / PR / review / verify** | **`conventional-commit`**, **`code-review`**, **`run`**, **`verify`** skills |

### When to reach for the context7 MCP
Use it for **current** library/framework behaviour (Next 16, React 19, Tailwind v4, `@base-ui/react`)
whenever your memory of the API might be stale — config, new APIs, migration, debugging a library
call. Prefer it over web search for library docs. Don't use it for this repo's own conventions
(those live in the KB) or general programming questions.
