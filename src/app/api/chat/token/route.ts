// ════════════════════════════════════════════════════════════════════
//  Phase 5.1 — Chat Token Issuer
//  Mints a short-lived JWT (24h) that the Socket.io chat-service verifies.
//  Keeps NextAuth session token off the wire to the socket server.
// ════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'SERVER_MISCONFIG' }, { status: 500 })
  }

  const token = jwt.sign(
    {
      sub: user.id,
      role: user.role,
      country: user.country,
    },
    secret,
    { expiresIn: '24h' }
  )

  return NextResponse.json({ token })
}
