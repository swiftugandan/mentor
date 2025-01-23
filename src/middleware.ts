import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  async function middleware(req) {
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage =
      req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/register')
    const isDashboardPage = req.nextUrl.pathname.startsWith('/dashboard')

    // Handle auth pages (login, register)
    if (isAuthPage) {
      if (isAuth) {
        // If user is authenticated and tries to access auth pages,
        // redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
      // Allow access to auth pages for non-authenticated users
      return null
    }

    // Handle protected pages (dashboard)
    if (isDashboardPage) {
      if (!isAuth) {
        // If user is not authenticated, redirect to login
        let from = req.nextUrl.pathname
        if (req.nextUrl.search) {
          from += req.nextUrl.search
        }

        const url = new URL('/login', req.url)
        url.searchParams.set('from', from)

        return NextResponse.redirect(url)
      }

      // Handle role-based access
      const role = token?.role
      const isStudentRoute =
        req.nextUrl.pathname.startsWith('/dashboard/student')
      const isAlumniRoute = req.nextUrl.pathname.startsWith('/dashboard/alumni')

      if (isStudentRoute && role !== 'STUDENT') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      if (isAlumniRoute && role !== 'ALUMNI') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    return null
  },
  {
    callbacks: {
      authorized: ({}) => true, // Let the middleware function handle the auth logic
    },
  }
)

// Protect these routes with middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
