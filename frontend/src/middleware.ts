import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Allow requests for the waitlist path
  if (pathname === '/waitlist') {
    return NextResponse.next()
  }

  // Allow requests for static files, API routes, public assets, etc.
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api') || 
    pathname === '/favicon.ico' ||
    pathname.match(/\.[^/]+$/) // Match any path with a file extension (e.g., .png, .css)
  ) {
    return NextResponse.next()
  }

  // Redirect to waitlist for all other pages
  return NextResponse.redirect(new URL('/waitlist', request.url))
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (having an extension)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
}
