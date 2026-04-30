import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ============================================================
// PRONTUÁRIO SOCIAL — Middleware
// MVP Demo Mode: Auth is disabled for public demonstration
// When connecting real DB: re-enable JWT check below
// ============================================================

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow API routes and static assets
  if (pathname.startsWith('/api/') || pathname.startsWith('/_next/')) {
    return NextResponse.next()
  }

  // MVP DEMO MODE: allow all routes without authentication
  // This enables the site to work publicly at prontuario-digital-coral.vercel.app
  // TODO: re-enable auth when connecting real DATABASE_URL in production
  if (!process.env.DATABASE_URL) {
    return NextResponse.next()
  }

  // Public routes — no auth required
  const publicRoutes = ['/login', '/forgot-password', '/api/auth']
  const isPublic = publicRoutes.some((r) => pathname.startsWith(r))
  if (isPublic) return NextResponse.next()

  // DEV bypass — skip auth in development
  if (process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === 'true') {
    return NextResponse.next()
  }

  // Production auth: Read JWT token
  const { getToken } = await import('next-auth/jwt')
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
