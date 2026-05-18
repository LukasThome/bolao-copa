import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdminRoute && req.auth?.user?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: ['/((?!login|setup|api/auth|_next|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
}
