import { getTraceId, runWithTrace, logger } from '@/lib/log'

export const BASE_URL = process.env.CATALOG_API_URL ?? 'http://localhost:8080/api'

/** GET wrapper — read-only, no body. Emits one structured log event per call. */
export async function apiFetch<T>(path: string): Promise<T> {
  const traceId = await getTraceId()
  const reqHeaders: Record<string, string> = {}
  if (traceId !== null) reqHeaders['x-trace-id'] = traceId

  const run = async () => {
    const start = Date.now()
    let status: number | undefined
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        cache: 'no-store',
        headers: reqHeaders,
      })
      status = res.status
      if (!res.ok) {
        const duration = Date.now() - start
        logger.error('api.fetch', `GET ${path} failed`, {
          method: 'GET',
          path,
          status,
          duration,
        })
        throw new Error(`API error ${res.status}: ${path}`)
      }
      const response = (await res.json()) as T
      const duration = Date.now() - start
      logger.info('api.fetch', `GET ${path}`, {
        method: 'GET',
        path,
        status,
        duration,
        response,
      })
      return response
    } catch (err) {
      if (status !== undefined) throw err // already logged above
      const duration = Date.now() - start
      logger.error('api.fetch', `GET ${path} network error`, {
        method: 'GET',
        path,
        duration,
        error: err instanceof Error ? err.message : String(err),
      })
      throw err
    }
  }

  // No trace context available (no middleware header); logs will emit without traceId
  return traceId !== null ? runWithTrace(traceId, run) : run()
}
