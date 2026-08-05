// ════════════════════════════════════════════════════════════════════
//  Lellina — Password Reset Email (Phase 2.13)
//  Gmail + nodemailer. 1-hour expiry, single-use tokens.
// ════════════════════════════════════════════════════════════════════

import nodemailer from 'nodemailer'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const RESET_TOKEN_EXPIRY_HOURS = 1

function getTransporter() {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    throw new Error('Gmail credentials not configured')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  })
}

export async function sendPasswordResetEmail(email: string): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  // Check if user exists (don't reveal to caller whether email exists — security)
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, username: true },
  })

  if (!user) {
    // Return success to prevent email enumeration
    return { success: true, message: 'If that email exists, a reset link has been sent.' }
  }

  // Generate secure token
  const token = crypto.randomBytes(32).toString('hex')
  const tokenHash = await bcrypt.hash(token, 10)
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  // Store hashed token (we'll verify by comparing hashes)
  // We use a simple approach: store the hash + expiry in a VerificationToken-like record
  // For password reset, we'll reuse the VerificationToken model with a special prefix
  await db.verificationToken.create({
    data: {
      token: `reset:${tokenHash}`,
      deviceFingerprint: `reset:${user.id}`,
      ipAddress: 'system',
      expiresAt,
    },
  })

  // Build reset URL
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  const resetUrl = `${baseUrl}/forgot-password?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

  // Send email
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Lellina" <${process.env.GMAIL_USER}>`,
    to: normalizedEmail,
    subject: 'Reset your Lellina password',
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: Fraunces, Georgia, serif; color: #9D3B54; font-size: 28px; margin: 0;">Lellina</h1>
          <p style="color: #1A1614; font-size: 14px; margin-top: 4px;">Galz for Galz</p>
        </div>
        <p style="color: #1A1614; font-size: 16px;">Hi ${user.username || 'gal'},</p>
        <p style="color: #1A1614; font-size: 16px; line-height: 1.6;">
          Someone requested a password reset for your Lellina account. If that was you, tap the button below. The link expires in 1 hour.
        </p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${resetUrl}" style="background: #9D3B54; color: #fff; padding: 14px 32px; border-radius: 999px; text-decoration: none; font-weight: 600; display: inline-block;">
            Reset my password
          </a>
        </div>
        <p style="color: #5C5249; font-size: 14px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email. Your password stays as it is.
        </p>
        <hr style="border: none; border-top: 1px solid #D9D2C8; margin: 32px 0;" />
        <p style="color: #A89E92; font-size: 12px; text-align: center;">
          Lellina — Galz for Galz. A verified women-only space.<br/>
          This is an automated email. Please don't reply.
        </p>
      </div>
    `,
    text: `Lellina — Reset your password\n\nHi ${user.username || 'gal'},\n\nSomeone requested a password reset for your Lellina account. If that was you, open this link (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\nLellina — Galz for Galz`,
  })

  return { success: true, message: 'If that email exists, a reset link has been sent.' }
}

export async function verifyResetTokenAndResetPassword(
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = email.trim().toLowerCase()

  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (!user) {
    return { success: false, message: 'Invalid or expired token.' }
  }

  // Find the reset token
  const resetTokens = await db.verificationToken.findMany({
    where: {
      deviceFingerprint: `reset:${user.id}`,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Check if any token matches (compare bcrypt hashes)
  let validTokenRecord = null
  for (const record of resetTokens) {
    const storedHash = record.token.replace('reset:', '')
    const matches = await bcrypt.compare(token, storedHash)
    if (matches) {
      validTokenRecord = record
      break
    }
  }

  if (!validTokenRecord) {
    return { success: false, message: 'Invalid or expired token.' }
  }

  // Mark token as used
  await db.verificationToken.update({
    where: { id: validTokenRecord.id },
    data: { used: true },
  })

  // Update password
  const passwordHash = await bcrypt.hash(newPassword, 12)
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  return { success: true, message: 'Password reset. You can now log in.' }
}
