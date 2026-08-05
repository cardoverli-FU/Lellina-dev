// ════════════════════════════════════════════════════════════════════
//  Lellina — Gating Lib (Phase 4.22 / 4.23 — skeleton)
//  Free tier: 5 likes visible. Lelly Pass: unlimited.
//  Full gating (see who liked you, chat intercepts) ships in Phase 4B/7.
// ════════════════════════════════════════════════════════════════════

import { db } from './db'

/** Free tier can see this many "who liked you" profiles. */
export const FREE_LIKE_VISIBILITY_LIMIT = 5

/**
 * Returns true if the user has an active Lelly Pass (any tier).
 * Admin always gets full access.
 */
export async function hasLellyPass(userId: string): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { lellyPassTier: true, role: true },
  })
  if (!user) return false
  if (user.role === 'ADMIN') return true
  return user.lellyPassTier !== null
}

/**
 * Returns the max number of "who liked you" profiles the user can see.
 * Free: 5. Lelly Pass / Admin: unlimited (returns -1).
 */
export async function getLikeVisibilityLimit(userId: string): Promise<number> {
  const hasPass = await hasLellyPass(userId)
  return hasPass ? -1 : FREE_LIKE_VISIBILITY_LIMIT
}
