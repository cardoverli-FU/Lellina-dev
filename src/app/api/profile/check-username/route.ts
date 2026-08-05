// ════════════════════════════════════════════════════════════════════
//  Lellina — Username Availability Check
//  Returns { available: boolean, reason?, suggestion? }
// ════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('q')?.trim().toLowerCase()

  if (!username || username.length < 2) {
    return NextResponse.json({ available: false, reason: 'Too short' })
  }

  // Single word only — no spaces
  if (/\s/.test(username)) {
    return NextResponse.json({ available: false, reason: 'No spaces allowed — one word only' })
  }

  // Only letters, numbers, underscores, hyphens
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return NextResponse.json({ available: false, reason: 'Only letters, numbers, _ and - allowed' })
  }

  // Reserved names
  const RESERVED = [
    'admin', 'root', 'moderator', 'mod', 'support', 'help',
    'lellina', 'system', 'null', 'undefined', 'test', 'demo',
    'api', 'www', 'app', 'blog', 'info', 'login', 'signup',
    'verify', 'profile', 'settings', 'delete', 'ban', 'report',
  ]
  if (RESERVED.includes(username)) {
    return NextResponse.json({ available: false, reason: 'This name is reserved' })
  }

  // Check DB — compare against both username AND displayName
  const existingUser = await db.user.findFirst({
    where: {
      OR: [
        { username: { equals: username, mode: 'insensitive' } },
        { username: { startsWith: username + '-', mode: 'insensitive' } },
      ],
    },
    select: { username: true },
  })

  const existingProfile = await db.profile.findFirst({
    where: {
      displayName: { equals: username, mode: 'insensitive' },
    },
    select: { displayName: true },
  })

  if (existingUser || existingProfile) {
    // Suggest an alternative
    const suffix = Math.floor(Math.random() * 9000 + 1000)
    const suggestion = `${username}-${suffix}`
    return NextResponse.json({ available: false, reason: 'Already taken', suggestion })
  }

  // Get current user's existing displayName (if any) so they can keep their own
  const session = await getServerSession(authOptions)
  if (session?.user?.id) {
    const myProfile = await db.profile.findFirst({
      where: { userId: session.user.id },
      select: { displayName: true },
    })
    if (myProfile?.displayName?.toLowerCase() === username) {
      return NextResponse.json({ available: true, own: true })
    }
  }

  return NextResponse.json({ available: true })
}
