import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** 32-char lowercase hex — matches W3C trace-id shape. */
function generateTraceId(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

/** Validate that a value is a 32-char lowercase hex string. */
function isValidTraceId(value: string | null): value is string {
  return typeof value === 'string' && /^[0-9a-f]{32}$/.test(value)
}

export function proxy(request: NextRequest) {
  const inbound = request.headers.get('x-trace-id')
  const traceId = isValidTraceId(inbound) ? inbound : generateTraceId()

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-trace-id', traceId)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  // Echo the id on the response so callers can correlate (debugging aid).
  response.headers.set('x-trace-id', traceId)

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
