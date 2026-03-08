import { NextRequest, NextResponse } from 'next/server'

const CANONICAL_HOST = 'www.televiperde.com'
const LEGACY_HOST = 'televiperde.com'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host')

  if (host === LEGACY_HOST) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.host = CANONICAL_HOST
    redirectUrl.protocol = 'https:'
    return NextResponse.redirect(redirectUrl, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
