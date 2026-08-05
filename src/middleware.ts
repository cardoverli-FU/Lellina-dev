// ════════════════════════════════════════════════════════════════════
//  Lellina — Middleware (Phase 2.17)
//  Login NOT gated. Register/app routes gated by is_verified.
//  Admin routes gated by role. Night trap fires on app entry.
// ════════════════════════════════════════════════════════════════════

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // ─── Public routes (always accessible, no auth needed) ────────
    const publicRoutes = ['/', '/login', '/join', '/forgot-password', '/verify', '/api/auth', '/api/exchange-rate', '/api/districts', '/api/tribe-tags', '/api/discover', '/api/like']
    if (publicRoutes.some((r) => path === r || path.startsWith(r + '/'))) {
      return NextResponse.next()
    }

    // ─── API routes for verify (pre-auth) ─────────────────────────
    if (path.startsWith('/api/verify')) {
      return NextResponse.next()
    }

    // ─── Register requires auth token (handled in the page itself) ──
    if (path === '/register' || path.startsWith('/register')) {
      return NextResponse.next()
    }

    // ─── From here: requires session ──────────────────────────────
    if (!token) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', path)
      return NextResponse.redirect(loginUrl)
    }

    const role = token.role as string
    const isVerified = token.isVerified as boolean

    // ─── Admin routes ─────────────────────────────────────────────
    if (path.startsWith('/admin')) {
      if (role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
      }
      return NextResponse.next()
    }

    // ─── App routes (discover, chat, events, profile, settings) ──
    // Admin bypasses verification. Regular users must be verified.
    if (!isVerified && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/verify', req.url))
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Always allow public routes
        const publicRoutes = ['/', '/login', '/join', '/forgot-password', '/verify', '/api/auth', '/api/exchange-rate', '/api/verify', '/api/districts', '/api/tribe-tags', '/api/discover', '/api/like']
        if (publicRoutes.some((r) => path === r || path.startsWith(r + '/'))) {
          return true
        }

        // Register is accessible without auth (token check happens in-page)
        if (path === '/register' || path.startsWith('/register')) {
          return true
        }

        // All other routes require a token
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Match all paths EXCEPT: static files, _next, api/webhooks, favicon
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|logo.png|og-image.png|robots.txt|api/webhooks).*)',
  ],
}
