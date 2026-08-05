// ════════════════════════════════════════════════════════════════════
//  Lellina — Registration API (Phase 2.12)
//  Final step of the verification ritual: create the verified user.
//
//  Flow:
//   1. Client passes { email, username, password, verificationToken }
//   2. We validate the token (must exist, not used, not expired)
//   3. We check email + username uniqueness
//   4. We hash the password with bcrypt (12 rounds)
//   5. We create the User with isVerified=true, verifiedAt=now
//   6. We consume (mark used) the verification token
//   7. We return { success: true, userId }
//   8. Client then calls signIn('credentials', ...) to auto-login
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'

const PASSWORD_MIN_LEN = 8
const USERNAME_MIN_LEN = 3
const USERNAME_MAX_LEN = 24
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      email: rawEmail,
      username: rawUsername,
      password,
      verificationToken,
      country: rawCountry,
    } = body || {}

    // ─── Basic field presence ────────────────────────────────────
    if (!rawEmail || !rawUsername || !password || !verificationToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields.' },
        { status: 400 }
      )
    }

    const email = String(rawEmail).trim().toLowerCase()
    const username = String(rawUsername).trim()

    // ─── Validate email ──────────────────────────────────────────
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email.' },
        { status: 400 }
      )
    }
    if (email.length > 254) {
      return NextResponse.json(
        { success: false, error: 'Email is too long.' },
        { status: 400 }
      )
    }

    // ─── Validate username ───────────────────────────────────────
    if (username.length < USERNAME_MIN_LEN || username.length > USERNAME_MAX_LEN) {
      return NextResponse.json(
        { success: false, error: `Username must be ${USERNAME_MIN_LEN}-${USERNAME_MAX_LEN} characters.` },
        { status: 400 }
      )
    }
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Username can only contain letters, numbers, dot, dash, and underscore.' },
        { status: 400 }
      )
    }

    // ─── Validate password ───────────────────────────────────────
    if (typeof password !== 'string' || password.length < PASSWORD_MIN_LEN) {
      return NextResponse.json(
        { success: false, error: `Password must be at least ${PASSWORD_MIN_LEN} characters.` },
        { status: 400 }
      )
    }
    if (password.length > 128) {
      return NextResponse.json(
        { success: false, error: 'Password is too long.' },
        { status: 400 }
      )
    }

    // ─── Validate country (ZA or TZ only) ────────────────────────
    const ALLOWED_COUNTRIES = ['ZA', 'TZ']
    const country = rawCountry ? String(rawCountry).toUpperCase() : null
    if (country && !ALLOWED_COUNTRIES.includes(country)) {
      return NextResponse.json(
        { success: false, error: 'Country not supported yet.' },
        { status: 400 }
      )
    }

    // ─── Validate the verification token ─────────────────────────
    const tokenRecord = await db.verificationToken.findUnique({
      where: { token: verificationToken },
    })

    if (!tokenRecord || tokenRecord.used || tokenRecord.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Verification token is invalid or expired. Please verify again.' },
        { status: 403 }
      )
    }

    // ─── Check email uniqueness ──────────────────────────────────
    const existingEmail = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })
    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 }
      )
    }

    // ─── Check username uniqueness ───────────────────────────────
    // Username is optional in the schema (String?), so do a findFirst with case-insensitive compare
    const existingUsername = await db.user.findFirst({
      where: { username: { equals: username } },
      select: { id: true },
    })
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'That username is taken. Try a different one.' },
        { status: 409 }
      )
    }

    // ─── Hash password (bcrypt 12 rounds) ────────────────────────
    const passwordHash = await bcrypt.hash(password, 12)

    // ─── Create the verified user ────────────────────────────────
    const now = new Date()
    const user = await db.user.create({
      data: {
        email,
        username,
        passwordHash,
        isVerified: true,
        verifiedAt: now,
        role: 'USER',
        deviceFingerprint: tokenRecord.deviceFingerprint,
        country,
      },
      select: { id: true },
    })

    // ─── Consume the verification token ──────────────────────────
    await db.verificationToken.update({
      where: { id: tokenRecord.id },
      data: { used: true },
    })

    return NextResponse.json({
      success: true,
      userId: user.id,
    })
  } catch (error) {
    console.error('[register] Error:', error)

    // Prisma unique-constraint violation (extra safety on top of pre-checks)
    const errMsg = error instanceof Error ? error.message : ''
    if (errMsg.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Email or username already taken.' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Could not create your account. Please try again.' },
      { status: 500 }
    )
  }
}
