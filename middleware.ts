import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin routes require ADMIN or SUPERADMIN
    if (pathname.startsWith('/admin')) {
      if (token?.role !== 'ADMIN' && token?.role !== 'SUPERADMIN') {
        return NextResponse.redirect(new URL('/dashboard/opportunities', req.url))
      }
    }

    // Suspended users are redirected to the suspended page
    if (token?.status === 'SUSPENDED' && !pathname.startsWith('/suspended')) {
      return NextResponse.redirect(new URL('/suspended', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
}
