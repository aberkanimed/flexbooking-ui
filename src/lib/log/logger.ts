import 'server-only'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogRecord {
  timestamp: string
  level: LogLevel
  event: string
  message: string
  context?: Record<string, unknown>
}

// ---------------------------------------------------------------------------
// Level ordering
// ---------------------------------------------------------------------------

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function resolveMinLevel(): LogLevel {
  const env = process.env.LOG_LEVEL as LogLevel | undefined
  if (env && env in LEVEL_ORDER) return env
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

// ---------------------------------------------------------------------------
// Emit
// ---------------------------------------------------------------------------

function emit(
  level: LogLevel,
  event: string,
  message: string,
  context?: Record<string, unknown>,
): void {
  const minLevel = resolveMinLevel()
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return

  const record: LogRecord = {
    timestamp: new Date().toISOString(),
    level,
    event,
    message,
    ...(context !== undefined ? { context } : {}),
  }

  process.stdout.write(JSON.stringify(record) + '\n')
}

// ---------------------------------------------------------------------------
// Logger
// ---------------------------------------------------------------------------

export const logger = {
  debug(event: string, message: string, context?: Record<string, unknown>): void {
    emit('debug', event, message, context)
  },
  info(event: string, message: string, context?: Record<string, unknown>): void {
    emit('info', event, message, context)
  },
  warn(event: string, message: string, context?: Record<string, unknown>): void {
    emit('warn', event, message, context)
  },
  error(event: string, message: string, context?: Record<string, unknown>): void {
    emit('error', event, message, context)
  },
}
