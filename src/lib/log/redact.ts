import 'server-only'

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_DENY_LIST = [
  'password',
  'token',
  'secret',
  'authorization',
  'api',
  'cookie',
  'email',
  'phone',
  'ssn',
  'card',
]

function resolveDenyList(): string[] {
  const override = process.env.LOG_REDACT_FIELDS
  if (override) {
    const custom = override.split(',').map((f) => f.trim().toLowerCase()).filter(Boolean)
    return [...new Set([...DEFAULT_DENY_LIST, ...custom])]
  }
  return DEFAULT_DENY_LIST
}

function resolveRedactEnabled(): boolean {
  const override = process.env.LOG_REDACT
  if (override === 'on') return true
  if (override === 'off') return false
  return process.env.NODE_ENV === 'production'
}

// ---------------------------------------------------------------------------
// Redaction helpers
// ---------------------------------------------------------------------------

function isDenied(key: string, denyList: string[]): boolean {
  const lower = key.toLowerCase()
  return denyList.some((term) => lower.includes(term))
}

function redactValue(
  value: unknown,
  denyList: string[],
  isProd: boolean,
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactValue(item, denyList, isProd))
  }
  if (value !== null && typeof value === 'object') {
    return redactObject(value as Record<string, unknown>, denyList, isProd)
  }
  return value
}

function redactObject(
  obj: Record<string, unknown>,
  denyList: string[],
  isProd: boolean,
): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(obj)) {
    if (isDenied(key, denyList)) {
      out[key] = '[redacted]'
    } else if (key === 'body' && isProd) {
      // Summarize verbose body fields in production
      if (val === null || val === undefined) {
        out[key] = val
      } else if (typeof val === 'string') {
        out[key] = val.length > 200 ? `[body omitted, ${val.length} chars]` : val
      } else if (typeof val === 'object') {
        const keys = Object.keys(val as object)
        out[key] = `[body omitted, keys: ${keys.join(', ')}]`
      } else {
        out[key] = val
      }
    } else {
      out[key] = redactValue(val, denyList, isProd)
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply deny-list masking and prod body summarization to a context object.
 * Config is resolved from env vars on each call so that test overrides work.
 */
export function redact(
  context: Record<string, unknown>,
): Record<string, unknown> {
  if (!resolveRedactEnabled()) return context
  const denyList = resolveDenyList()
  const isProd = process.env.NODE_ENV === 'production'
  return redactObject(context, denyList, isProd)
}
