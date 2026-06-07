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

All `gh` output filtering must use the **`--jq` flag** built into the `gh` CLI.
Never pipe `gh` output through PowerShell (`ConvertFrom-Json`, `Where-Object`,
`Select-Object`) — this produces commands with `{ "..." }` patterns that trigger
Claude Code's brace+quote security heuristic and are blocked.

---

## The golden rule

```
# NEVER — triggers security block:
gh issue list --json number,title,body | ConvertFrom-Json | Where-Object { $_.body -match "Depends on.*#7" }

# ALWAYS — safe and cross-platform:
gh issue list --json number,title,body --jq '.[] | select(.body | test("Depends on.*#7"))'
```

---

## Common patterns

### Get all issues with a label
```bash
gh issue list --label ready --json number,title --jq '.[] | "\(.number) \(.title)"'
```

### Get sub-issues of a parent (by body reference)
```bash
gh issue list --json number,title,body --jq '.[] | select(.body | test("Depends on.*#<N>|Part of.*#<N>|parent.*#<N>"))'
```

### Get a single field from an issue
```bash
gh issue view 7 --json body --jq '.body'
gh issue view 7 --json labels --jq '[.labels[].name]'
gh issue view 7 --json number,title,body,labels --jq '.'
```

### Check if an issue has a specific label
```bash
gh issue view 7 --json labels --jq '.labels[].name | select(. == "ready")'
# Returns the label name if found, empty if not
```

### Get all open issues with number and title
```bash
gh issue list --state open --json number,title --jq '.[] | "\(.number): \(.title)"'
```

### Filter issues by body content (multiple patterns)
```bash
gh issue list --json number,title,body \
  --jq '.[] | select(.body | test("Acceptance criteria|Implementation plan"))'
```

### Get PR number and status
```bash
gh pr list --json number,title,isDraft --jq '.[] | select(.isDraft == true)'
gh pr view 12 --json number,state,body --jq '.'
```

### Add a label to an issue
```bash
gh issue edit 7 --add-label in-progress --remove-label needs-triage
```

### Post a PR comment
```bash
gh pr comment 12 --body "Finding: missing null check in catalog.ts line 42"
```

### Create an issue and capture its number
```bash
ISSUE=$(gh issue create --title "My feature" --label feature --body "..." --json number --jq '.number')
echo "Created issue #$ISSUE"
```

---

## Native sub-issue linking (GraphQL)

When linking a feature as a sub-issue of an epic (or a task under a feature):
```bash
PARENT_ID=$(gh issue view <PARENT#> --json id --jq '.id')
CHILD_ID=$(gh issue view <CHILD#> --json id --jq '.id')
gh api graphql -f query='
  mutation($p:ID!,$c:ID!){
    addSubIssue(input:{issueId:$p,subIssueId:$c}){
      issue{number}
    }
  }' -f p="$PARENT_ID" -f c="$CHILD_ID"
```

If the `addSubIssue` mutation is unavailable (older GitHub), fall back to:
- Add `- [ ] #<child>` checklist in the parent body
- Add `Part of #<parent>` line in the child body

---

## Appending to an issue body

Never use shell here-docs or echo pipes to build multi-line strings. Use a temp file via
the Write tool, then pass it to `gh`:

1. Write tool → write new content to `.tmp/issue-append.md`
2. Bash: read current body and combine:
```bash
CURRENT=$(gh issue view 7 --json body --jq '.body')
NEW=$(Get-Content .tmp/issue-append.md -Raw)
gh issue edit 7 --body "$CURRENT`n$NEW"
```

Or in practice, use `gh issue edit` with a here-string only if the content has no quotes.
When content is complex (code blocks, backticks, quotes), write the full new body to a file
and pass it with `--body-file`:
```bash
gh issue edit 7 --body-file .tmp/full-body.md
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
