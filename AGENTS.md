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
