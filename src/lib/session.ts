// ════════════════════════════════════════════════════════════════════
//  Lellina — NextAuth Helper (server-side session getter)
// ════════════════════════════════════════════════════════════════════

import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { db } from './db'

export async function getSession() {
  return getServerSession(authOptions)
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  // Fetch fresh user data from DB (session JWT may be stale)
  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
      isVerified: true,
      bannedAt: true,
      faceEmbedding: true,
      lastNightCheck: true,
      lellyPassTier: true,
      country: true,
    },
  })

  if (!user || user.bannedAt) return null

  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHORIZED')
  }
  return user
}

export async function requireVerified() {
  const user = await requireAuth()
  if (!user.isVerified && user.role !== 'ADMIN') {
    throw new Error('NOT_VERIFIED')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  if (user.role !== 'ADMIN') {
    throw new Error('FORBIDDEN')
  }
  return user
}
