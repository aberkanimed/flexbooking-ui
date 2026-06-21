import 'server-only'

import { getTraceId, runWithTrace, logger } from '@/lib/log'

/**
 * Wraps a Server Action with automatic entry/exit logging and duration tracking.
 *
 * Usage:
 *   export const myAction = instrumentAction('my_action', async (_prev, formData) => { ... })
 *
 * The wrapper:
 *   - Seeds an ALS trace scope from the incoming request header (if present)
 *   - Logs an entry event before running the action
 *   - Logs an exit event with duration on success
 *   - Logs a failure event with duration on error, then re-throws
 *   - Returns the result unchanged
 *
 * The wrapped function's signature and return type are preserved exactly, so
 * `.bind()` usage at the call site continues to work without modification.
 */
export function instrumentAction<TArgs extends unknown[], TReturn>(
  name: string,
  fn: (...args: TArgs) => Promise<TReturn>,
): (...args: TArgs) => Promise<TReturn> {
  return async function instrumented(...args: TArgs): Promise<TReturn> {
    const traceId = await getTraceId()

    const run = async (): Promise<TReturn> => {
      const start = Date.now()
      logger.info(`action.${name}`, `${name} started`)
      try {
        const result = await fn(...args)
        const duration = Date.now() - start
        logger.info(`action.${name}`, `${name} completed`, { duration })
        return result
      } catch (err) {
        const duration = Date.now() - start
        logger.error(`action.${name}`, `${name} failed`, {
          duration,
          error: err instanceof Error ? err.message : String(err),
        })
        throw err
      }
    }

    return traceId !== null ? runWithTrace(traceId, run) : run()
  }
}
