import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const secure = req.nextUrl.protocol === 'https:'
  const cookieName = secure
    ? '__Secure-authjs.session-token'
    : 'authjs.session-token'

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName,
  })

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.nextUrl.origin))
  }

  if (req.nextUrl.pathname.startsWith('/admin') && token.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', req.nextUrl.origin))
  }
}

export const config = {
  matcher: ['/((?!login|api/auth|_next|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
}
