// ════════════════════════════════════════════════════════════════════
//  Lellina — Reset Password API (Phase 2.13)
//  Validates the token from the email link, sets the new password.
//  Delegates to @/lib/email (which handles bcrypt-hashed token compare).
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { verifyResetTokenAndResetPassword } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    const token = typeof body?.token === 'string' ? body.token.trim() : ''
    const newPassword = typeof body?.newPassword === 'string' ? body.newPassword : ''

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields.' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters.' },
        { status: 400 }
      )
    }

    const result = await verifyResetTokenAndResetPassword(email, token, newPassword)

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error('[auth/reset-password] Error:', error)
    return NextResponse.json(
      { success: false, message: 'Could not reset password. Please request a new link.' },
      { status: 500 }
    )
  }
}
