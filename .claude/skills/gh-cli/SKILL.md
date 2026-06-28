---
name: gh-cli
description: >
  Rules and patterns for using the GitHub CLI (gh) inside Claude Code on this project.
  Use this skill any time you need to query, filter, or update GitHub issues, PRs, or
  labels — especially before constructing any gh command that pipes output through
  PowerShell (Where-Object, Select-Object, ConvertFrom-Json) or uses braces with
  quoted strings. Those patterns trigger security blocks. This skill shows the safe
  alternatives using gh's built-in --jq flag for all filtering needs.
---

# gh CLI Skill

## Golden rule 1 — filtering

All `gh` output filtering must use the **`--jq` flag** built into the `gh` CLI.
Never pipe `gh` output through PowerShell (`ConvertFrom-Json`, `Where-Object`,
`Select-Object`) — this produces commands with `{ "..." }` patterns that trigger
Claude Code's brace+quote security heuristic and are blocked.

```powershell
# NEVER — triggers security block:
gh issue list --json number,title,body | ConvertFrom-Json | Where-Object { $_.body -match "Depends on.*#7" }

# ALWAYS — safe and cross-platform:
$jq = '.[] | select(.body | test("Depends on.*#7")) | [.number, .title] | @tsv'
gh issue list --json number,title,body --jq $jq
```

---

## Golden rule 2 — multi-line bodies

Whenever a `gh` command carries a multi-line body (issue creation, issue edit, PR creation,
PR comment, PR review), **write the body to a temp file first** using the Write tool, then
pass it with `--body-file`. Never embed multi-line content directly in the shell command.
This eliminates shell escaping failures and retry loops.

```powershell
# Write body using the Write tool → .tmp/body.md, then:
gh issue create  --title "..." --label feature  --body-file .tmp/body.md
gh issue edit <N>                               --body-file .tmp/body.md
gh pr create     --title "..." --base main      --body-file .tmp/body.md
gh pr comment <N>                               --body-file .tmp/body.md
gh pr review  <N> --approve                     --body-file .tmp/body.md  # or --request-changes
```

Only use inline `--body "..."` for single-line strings with no special characters.

---

## Golden rule 3 — PowerShell 5.1 jq quoting

**PowerShell 5.1 splits `--jq` arguments that contain inner double-quotes and spaces.**
When a single-quoted PS string contains `"` characters (e.g. `test("pattern")` or
`"\(.field)"` interpolation), PS5.1 passes it as multiple broken arguments instead of one.

### Two safe patterns — always use one of these:

**Pattern A — `@tsv` for output (no double-quotes needed):**
```powershell
# BROKEN — "\(.number): \(.title)" contains " and spaces → argument is split:
gh issue list --json number,title --jq '.[] | "\(.number): \(.title)"'

# FIXED — @tsv produces tab-separated output without any inner double-quotes:
gh issue list --json number,title --jq '.[] | [.number, .title] | @tsv'
```

**Pattern B — store filter in a `$jq` variable when `test()` or string literals are needed:**
```powershell
# BROKEN — test("...") contains " and spaces → argument is split:
gh issue list --json number,title,body --jq '.[] | select(.body | test("Depends on.*#46")) | [.number, .title] | @tsv'

# FIXED — PS5.1 correctly escapes variable values when invoking native executables:
$jq = '.[] | select(.body | test("Depends on.*#46")) | [.number, .title] | @tsv'
gh issue list --json number,title,body --jq $jq
```

**Combine both patterns** when a filter needs `test()` AND multi-field output:
```powershell
$jq = '.[] | select(.body | test("Depends on.*#<N>|Part of.*#<N>")) | [.number, .title] | @tsv'
gh issue list --json number,title,body --jq $jq
```

---

## Common patterns

### Get all issues with a label
```powershell
gh issue list --label ready --json number,title --jq '.[] | [.number, .title] | @tsv'
```

### Get sub-issues of a parent (by body reference)
```powershell
# Use $jq variable — test() contains inner double-quotes (Golden rule 3)
$jq = '.[] | select(.body | test("Depends on.*#<N>|Part of.*#<N>|parent.*#<N>")) | [.number, .title] | @tsv'
gh issue list --json number,title,body --jq $jq
```

### Get a single field from an issue
```powershell
gh issue view 7 --json body --jq '.body'
gh issue view 7 --json labels --jq '[.labels[].name]'
gh issue view 7 --json number,title,body,labels --jq '.'
```

### Check if an issue has a specific label
```powershell
gh issue view 7 --json labels --jq '.labels[].name | select(. == "ready")'
# Returns the label name if found, empty if not
```

### Get all open issues with number and title
```powershell
# @tsv — no inner double-quotes, safe inline
gh issue list --state open --json number,title --jq '.[] | [.number, .title] | @tsv'
```

### Filter issues by body content (multiple patterns)
```powershell
# Use $jq variable — test() requires inner double-quotes (Golden rule 3)
$jq = '.[] | select(.body | test("Acceptance criteria|Implementation plan")) | [.number, .title] | @tsv'
gh issue list --json number,title,body --jq $jq
```

### Get PR number and status
```powershell
gh pr list --json number,title,isDraft --jq '.[] | select(.isDraft == true) | [.number, .title] | @tsv'
gh pr view 12 --json number,state,body --jq '.'
```

### Add a label to an issue
```powershell
gh issue edit 7 --add-label in-progress --remove-label needs-triage
```

### Post a PR comment (always use --body-file for multi-line)
```powershell
# Write .tmp/comment.md first, then:
gh pr comment 12 --body-file .tmp/comment.md
# Single-line only:
gh pr comment 12 --body "LGTM"
```

### Create an issue and capture its number (always use --body-file)
```powershell
# Write .tmp/body.md first, then:
$issue = gh issue create --title "My feature" --label feature --body-file .tmp/body.md --json number --jq '.number'
Write-Output "Created issue #$issue"
```

---

## Native sub-issue linking (GraphQL)

When linking a feature as a sub-issue of an epic (or a task under a feature):
```powershell
$parentId = gh issue view <PARENT#> --json id --jq '.id'
$childId  = gh issue view <CHILD#>  --json id --jq '.id'
gh api graphql -f query='
  mutation($p:ID!,$c:ID!){
    addSubIssue(input:{issueId:$p,subIssueId:$c}){
      issue{number}
    }
  }' -f p="$parentId" -f c="$childId"
```

If the `addSubIssue` mutation is unavailable (older GitHub), fall back to:
- Add `- [ ] #<child>` checklist in the parent body
- Add `Part of #<parent>` line in the child body

---

## Appending to an existing issue body

```powershell
# 1. Fetch the current body to a temp file
gh issue view 7 --json body --jq '.body' > .tmp/current-body.md
# 2. Append new content to .tmp/current-body.md using the Edit tool
# 3. Push the combined body
gh issue edit 7 --body-file .tmp/current-body.md
```

---

## Allowlisted Bash patterns for settings.json

These are the `gh` command prefixes to allowlist in `.claude/settings.json`:
```json
"Bash(gh issue *)",
"Bash(gh pr *)",
"Bash(gh api *)",
"Bash(gh repo *)"
```
