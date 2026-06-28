---
name: verify
description: >
  Manually verify a FlexBooking Feature's acceptance criteria against the running app using
  Playwright. Pass the Feature issue number as the argument (e.g. /verify 47). Fetches the
  acceptance criteria from the GitHub issue, identifies the associated PR diff for context,
  then drives the browser through each criterion and reports a pass/fail table with screenshots.
  Use after the Scrum Master's GATE 2 prompt, or any time you want to validate behavior.
---

# Verify Skill

You validate a FlexBooking Feature's **acceptance criteria** against the running app. You receive a
**Feature issue number** as input. You use Playwright to drive the browser and report results.

## Step 1 — load the acceptance criteria

```bash
gh issue view <FEATURE#> --json body --jq '.body'
```

Extract every `- [ ]` and `- [x]` line under `## Acceptance criteria`. These are your test cases.

Also find the associated PR:
```bash
gh pr list --state open --json number,headRefName,title --jq '.[]'
```

Skim the PR diff (`gh pr diff <PR#>`) to understand what routes/components changed — this tells
you where to navigate.

## Step 2 — ensure the dev server is running

```bash
npx --yes wait-on http://localhost:3000 --timeout 5000
```

Exit code 0 = server is up. If it fails, tell the user to run `npm run dev` and re-invoke the skill.

## Step 3 — verify each acceptance criterion

For each AC item, run this sequence:

**a.** `browser_navigate` — go to the route under test.

**b.** `browser_snapshot` — read the accessibility tree to get element refs. **Always snapshot
   before acting; never guess refs or CSS selectors.**

**c.** `browser_take_screenshot` with `filename: "playwright-report/verify/<ac-slug>-before.png"`

**d.** Interact using refs from the snapshot:
   - Fill inputs: `browser_fill_form` with `{ ref, value }` entries from the snapshot.
   - Click buttons/links: `browser_click` using the ref from the snapshot.
   - Select dropdowns: `browser_select_option` with the ref and the option value.
   - **Destructive actions**: call `browser_handle_dialog("accept")` BEFORE the click that triggers
     a confirmation dialog.

**e.** `browser_snapshot` again — confirm the expected state change (item added/removed, form
   cleared, success toast shown, field updated).

**f.** `browser_take_screenshot` with `filename: "playwright-report/verify/<ac-slug>-after.png"`

**g.** `browser_console_messages` — flag any new errors or warnings.

**Screenshot naming:** use a short slug per AC, e.g. `ac1-create-service-before.png`. All saved to
`playwright-report/verify/` (gitignored — never stored in the repo root).

## Step 4 — report

Output a table:

| # | Acceptance criterion | Result | Notes |
|---|---|---|---|
| 1 | ... | ✓ Pass / ✗ Fail | screenshot: ac1-...-after.png |
| 2 | ... | ✓ Pass / ✗ Fail | console error: ... |

List any browser-visible failures (layout breaks, missing data, wrong state, JS errors) as separate
findings even if the criterion technically passed. Include the before/after screenshot filenames.

## Rules
- Never edit application code — this is observation only.
- Judge each criterion strictly against what it says, not what you think it should say.
- If the dev server is not running, stop and tell the user rather than guessing.
