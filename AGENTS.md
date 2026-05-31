<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design Reference

Before writing any UI code for a page, check `docs/design/ui_kits/` for the high-fidelity interactive kit that covers it:

- `docs/design/ui_kits/catalog-dashboard/` — Catalog Dashboard: Products/Services listing, search and status filters, add/edit sheets, mobile bottom nav, responsive layout. Entry point: `index.html`.
- `docs/design/ui_kits/product-detail/` — Product Detail page: product header, 4-up rollup stats, service accordion with characteristics, workbench rail layout. Entry point: `index.html`.

Individual components are documented as HTML specimens in `docs/design/preview/` (cards, badges, buttons, nav states, empty states, rollup stats, accordion, char-cards). Open the relevant `.html` file before implementing.

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
`--status-active-bg`, `--status-active-fg`, `--status-inactive-bg`, `--status-inactive-fg` are not mapped to Tailwind utilities. Use inline styles: `style={{ background: 'var(--status-active-bg)', color: 'var(--status-active-fg)' }}`.
