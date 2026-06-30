import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { logger } from '@/lib/utils/logger'

export async function proxy(request: NextRequest) {
  // 1. Request Tracing: Propagate a unique request ID
  const requestId = request.headers.get('x-request-id') ?? crypto.randomUUID()
  request.headers.set('x-request-id', requestId)

  const startTime = Date.now()
  logger.info('middleware', 'Request start', { 
    requestId, 
    path: request.nextUrl.pathname, 
    method: request.method 
  })

  // Safeguard: if Supabase erroneously redirects an email login/verification back to
  // the root page or login page with a `code` query param, catch it and redirect
  // it to the proper auth callback route.
  if (
    (request.nextUrl.pathname === '/' || request.nextUrl.pathname === '/login') &&
    request.nextUrl.searchParams.has('code')
  ) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/auth/callback'
    return NextResponse.redirect(redirectUrl)
  }

  // updateSession handles both session refreshing and route protection
  const response = await updateSession(request)
  
  // Attach request ID to response headers for full traceability
  response.headers.set('x-request-id', requestId)

  // Basic security hardening headers
  response.headers.set('x-content-type-options', 'nosniff')
  response.headers.set('x-frame-options', 'DENY')
  response.headers.set('x-xss-protection', '1; mode=block')
  response.headers.set('referrer-policy', 'strict-origin-when-cross-origin')
  
  logger.info('middleware', 'Success', { 
    requestId, 
    reason: 'Request end',
    path: request.nextUrl.pathname, 
    method: request.method, 
    status: response.status,
    durationMs: Date.now() - startTime 
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
