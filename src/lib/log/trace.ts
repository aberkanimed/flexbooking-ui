import 'server-only'

import { AsyncLocalStorage } from 'async_hooks'
import { headers } from 'next/headers'

// ---------------------------------------------------------------------------
// AsyncLocalStorage store
// ---------------------------------------------------------------------------

const traceStore = new AsyncLocalStorage<string>()

// ---------------------------------------------------------------------------
// getTraceId — async, reads from the request headers
// ---------------------------------------------------------------------------

export async function getTraceId(): Promise<string | null> {
  const h = await headers()
  return h.get('x-trace-id')
}

// ---------------------------------------------------------------------------
// runWithTrace — seeds an ALS scope so currentTraceId() works synchronously
// ---------------------------------------------------------------------------

export function runWithTrace<T>(id: string, fn: () => T): T {
  return traceStore.run(id, fn)
}

// ---------------------------------------------------------------------------
// currentTraceId — synchronous; returns the trace id within a runWithTrace scope
// ---------------------------------------------------------------------------

export function currentTraceId(): string | null {
  return traceStore.getStore() ?? null
}
