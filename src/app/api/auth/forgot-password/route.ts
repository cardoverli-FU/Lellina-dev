// ════════════════════════════════════════════════════════════════════
//  Lellina — Forgot Password API (Phase 2.13)
//  Anti-enumeration: always returns the same success response.
//  Email is sent (or silently skipped) via @/lib/email.
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // Still return success to prevent email enumeration
      return NextResponse.json({
        success: true,
        message: 'If that email exists, a reset link has been sent.',
      })
    }

    // Attempt to send — the lib handles the "user not found" case silently
    await sendPasswordResetEmail(email)

    // Always return the same generic message (anti-enumeration)
    return NextResponse.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      senderEmail: process.env.GMAIL_USER || null,
    })
  } catch (error) {
    console.error('[auth/forgot-password] Error:', error)
    // Even on internal error, return generic success to avoid leaking info
    return NextResponse.json({
      success: true,
      message: 'If that email exists, a reset link has been sent.',
      senderEmail: process.env.GMAIL_USER || null,
    })
  }
}
