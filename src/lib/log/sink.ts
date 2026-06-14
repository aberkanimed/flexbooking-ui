import 'server-only'

import type { LogRecord } from './logger'

// ---------------------------------------------------------------------------
// Sink interface
// ---------------------------------------------------------------------------

export interface Sink {
  write(record: LogRecord): void
}

// ---------------------------------------------------------------------------
// Default sink — one JSON line per record to stdout
// ---------------------------------------------------------------------------

export const StdoutSink: Sink = {
  write(record: LogRecord): void {
    process.stdout.write(JSON.stringify(record) + '\n')
  },
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

let activeSink: Sink = StdoutSink

export function setSink(sink: Sink): void {
  activeSink = sink
}

export function getActiveSink(): Sink {
  return activeSink
}
