---
name: powershell-shell
description: >
  Rules for running shell commands in a Windows PowerShell (pwsh) environment inside Claude Code.
  Use this skill whenever you are about to run a Bash command, construct a shell pipeline,
  check server health, manage directories or temp paths, or redirect output. This covers
  every situation where Unix shell assumptions would cause failures or security blocks —
  /dev/null, 2>/dev/null, /tmp, curl health checks, heredocs, and brace-with-quote patterns.
  Always consult this skill before emitting any Bash tool call.
---

# PowerShell Shell Skill

This project runs on **Windows with PowerShell (pwsh)**. All Bash tool calls must produce
valid PowerShell or cross-platform commands. Violating these rules causes security blocks,
silent failures in headless subagents, or broken output.

---

## Forbidden patterns — never emit these

| Unix pattern | Why it fails | PowerShell replacement |
|---|---|---|
| `2>/dev/null` | Unix stderr redirect | `-ErrorAction SilentlyContinue` |
| `/dev/null` | Does not exist | `$null` or `Out-Null` |
| `/tmp/...` | No /tmp on Windows | `.tmp/` (project-relative) or `$env:TEMP\...` |
| `cat file` | May not exist / triggers security heuristic | Use the **Read tool** |
| `grep pattern file` | Unix only | Use the **Grep tool** |
| `ls` / `ls -la` | Unix only | Use the **Glob tool** or `Get-ChildItem` |
| `curl -s -o /dev/null -w "%{http_code}"` | Broken on Windows | See health check section |
| `cmd << 'EOF' ... EOF` | Heredoc — PowerShell incompatible + triggers security block | Use the **Write/Edit tool** |
| `{ $_ -match "..." }` in Bash | Brace+quote triggers security heuristic | Use `gh --jq` or Read tool |
| `cmd1 && cmd2` | Fragile cross-platform | Use separate Bash calls |

---

## Directory and path rules

- **Never use `/tmp`** — use `.tmp/` relative to the project root, or `$env:TEMP` for truly
  throwaway files. Add `.tmp/` to `.gitignore`.
- **Never hardcode absolute Unix paths** (`/usr`, `/home`, `/var`).
- **For worktrees**, use a project-relative path — git creates the directory automatically:
  ```bash
  git worktree add .worktrees/feat-slug feat/slug
  ```
  Do not `mkdir` the worktree directory first.
- **Suppress errors** with `-ErrorAction SilentlyContinue` (PowerShell) — never `2>/dev/null`.

---

## Server health checks

Never use `curl` with `/dev/null` to probe localhost. Use one of these instead:

**Option A — cross-platform, preferred (Node is always available):**
```bash
npx --yes wait-on http://localhost:3000 --timeout 5000
```
Exit code 0 = server is up. Exit code 1 = not reachable after timeout.

**Option B — PowerShell native:**
```powershell
(Invoke-WebRequest http://localhost:3000 -UseBasicParsing -ErrorAction SilentlyContinue).StatusCode
```

**Option C — just try the Playwright navigation** (Auditor agent only):
Attempt navigation; if it throws a connection error the server is not running. Report it as
a blocker rather than pre-checking with a separate health probe.

---

## Starting background processes

Never use `&` (Unix background). Use PowerShell job syntax, or just run the command and let
the Scrum Master manage sequencing:
```powershell
Start-Process npm -ArgumentList "run","dev" -WindowStyle Hidden
```
Or in practice, tell the user to start `npm run dev` manually and use `wait-on` to confirm.

---

## When to use Bash at all

Bash is for running **commands**, not manipulating file content. Restrict Bash to:
- `git *`
- `gh *` (with `--jq` for filtering — see gh-cli skill)
- `npm run *` / `npx *`
- `npx tsc --noEmit`
- `npx eslint *` / `npm run lint`
- `wait-on *`

Everything else (reading, writing, searching files) → use Read / Write / Edit / Grep / Glob tools.
