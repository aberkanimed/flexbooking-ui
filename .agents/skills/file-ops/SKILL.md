---
name: file-ops
description: >
  Rules for reading, writing, searching, and listing files inside Claude Code on this project.
  Use this skill any time you are about to read a file, write or append to a source file,
  search file contents, or list directory contents. It prevents the three most common
  mistakes: using Bash cat/heredoc to write code (triggers security blocks), using Bash grep
  to search (unnecessary approval prompt), and using Bash ls to list files (cross-platform
  failures). The Read/Write/Edit/Grep/Glob tools are always preferred over Bash for file work.
---

# File Operations Skill

Use the **dedicated file tools** for all file work. They are cross-platform, need no
approval prompts, show clean diffs, and never trip security heuristics.

Bash is for running commands (git, gh, npm). It is **not** for reading or writing files.

---

## Tool selection guide

| What you need to do | Use this tool | Never use |
|---|---|---|
| Read a file | **Read** | `Bash(cat ...)`, `Bash(Get-Content ...)` |
| Write a new file | **Write** | `Bash(echo > ...)`, heredocs |
| Edit / append to a file | **Edit** | `Bash(cat >> ... << EOF)`, `Bash(echo >>)` |
| Search file contents | **Grep** | `Bash(grep ...)`, `Bash(Select-String ...)` |
| List files / find by pattern | **Glob** | `Bash(ls ...)`, `Bash(Get-ChildItem ...)` |
| Read command output | Read stdout directly | Write to temp file then cat |

---

## Writing and editing source files

**Never use Bash to write source code.** The heredoc pattern is blocked:
```bash
# BLOCKED — triggers security heuristic:
cat >> src/lib/api/catalog.ts << 'EOF'
export interface CharacteristicRequest { ... }
EOF
```

**Always use Write (new file) or Edit (existing file):**
- **Write tool**: creates the file with full content in one operation.
- **Edit tool**: applies a targeted find-and-replace to an existing file. Shows a clean diff.
  Use Edit to append by targeting the last line / closing brace of the file.

This applies to all file types: `.ts`, `.tsx`, `.md`, `.json`, `.sql`, `.css`, `.env`.

---

## Searching file contents

Use the **Grep tool** with a regex pattern and a directory. It returns matching lines with
file paths and line numbers — exactly what you need for finding components, patterns, or
symbol definitions.

```
# Examples of what to ask the Grep tool:
- pattern: "CharacteristicRequest", directory: "src/"
- pattern: "export default function", directory: "src/components/"
- pattern: "Depends on.*#7", directory: "." (for issue body references)
```

Never construct `Select-String` or `grep` Bash calls for this.

---

## Listing and discovering files

Use the **Glob tool** with a pattern. It returns matching file paths without any shell.

```
# Examples of what to ask the Glob tool:
- pattern: "src/components/**/*.tsx"
- pattern: "docs/kb/*.md"
- pattern: ".claude/agents/*.md"
```

---

## Temporary files (when genuinely needed)

If you must write a temp file (e.g. a full issue body to pass to `gh issue edit --body-file`):
- Use `.tmp/` relative to the project root (not `/tmp`)
- Use the **Write tool** to create it
- Clean it up with `Bash(Remove-Item .tmp/filename)` after use
- Ensure `.tmp/` is in `.gitignore`

---

## Reading large files

For files over ~300 lines, use the Read tool with a line range rather than reading the whole
file. This keeps context lean and avoids truncation:
```
Read tool: path="src/lib/api/catalog.ts", start_line=1, end_line=80
```

Re-read the specific section you need before any Edit — stale context causes bad patches.

---

## Checking if a file exists before writing

Use Glob to check existence before writing a new file:
```
Glob pattern: "src/lib/api/catalog.ts"
```
Empty result → file doesn't exist → use Write.
Non-empty result → file exists → use Edit (or Read first to understand what's there).
