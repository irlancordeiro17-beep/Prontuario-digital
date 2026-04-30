import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Public routes — no auth required
  const publicRoutes = ['/login', '/forgot-password', '/api/auth']
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
  if (isPublic) return NextResponse.next()

  // Read JWT token (works in Edge runtime, no Prisma needed)
  const token = await getToken({ req, secret: process.env.AUTH_SECRET })

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL('/login', req.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  const role = token.role as string | undefined

  // Analytics only for gestor and admin
  if (pathname.startsWith('/analytics') && !['gestor', 'admin'].includes(role ?? '')) {
    return NextResponse.redirect(new URL('/search', req.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
