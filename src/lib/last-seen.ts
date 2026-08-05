// ════════════════════════════════════════════════════════════════════
//  Phase 5.12 — Last Seen + Online Presence
//
//  Presence is tracked in two layers:
//    1. Socket service in-memory Map (instant online/offline)
//    2. DB Profile.isOnline + lastActiveAt (persistent, for discover cards)
//
//  This lib handles the DB layer. The socket service calls these on
//  connect/disconnect. API routes call these on login/page-load.
// ════════════════════════════════════════════════════════════════════

import { db } from './db'

/** Grace period: if lastActiveAt is within this, consider user "online". */
const ONLINE_GRACE_MS = 2 * 60 * 1000 // 2 minutes

/** Mark a user as online + update lastActiveAt. */
export async function markOnline(userId: string): Promise<void> {
  await db.profile.update({
    where: { userId },
    data: {
      isOnline: true,
      lastActiveAt: new Date(),
    },
  })
}

/** Mark a user as offline + record lastActiveAt. */
export async function markOffline(userId: string): Promise<void> {
  await db.profile.update({
    where: { userId },
    data: {
      isOnline: false,
      lastActiveAt: new Date(),
    },
  })
}

/** Touch presence — update lastActiveAt without changing online status. */
export async function touchPresence(userId: string): Promise<void> {
  await db.profile.update({
    where: { userId },
    data: { lastActiveAt: new Date() },
  })
}

/**
 * Get a user's presence status.
 * Falls back to grace-period check if isOnline flag is stale.
 */
export async function getPresence(userId: string): Promise<{
  isOnline: boolean
  lastActiveAt: Date | null
}> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { isOnline: true, lastActiveAt: true },
  })

  if (!profile) {
    return { isOnline: false, lastActiveAt: null }
  }

  // Grace period: if lastActiveAt is recent, consider online even if flag is stale
  if (!profile.isOnline && profile.lastActiveAt) {
    const ageMs = Date.now() - profile.lastActiveAt.getTime()
    if (ageMs < ONLINE_GRACE_MS) {
      return { isOnline: true, lastActiveAt: profile.lastActiveAt }
    }
  }

  return {
    isOnline: profile.isOnline,
    lastActiveAt: profile.lastActiveAt,
  }
}

/**
 * Format a "last seen" timestamp as a human-readable relative string.
 * e.g. "Online now", "Last seen 5m ago", "Last seen 2h ago", "Last seen 3d ago"
 */
export function formatLastSeen(
  isOnline: boolean,
  lastActiveAt: Date | string | null
): string {
  if (isOnline) return 'Online now'
  if (!lastActiveAt) return 'Offline'

  const date = typeof lastActiveAt === 'string' ? new Date(lastActiveAt) : lastActiveAt
  const diffMs = Date.now() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)

  if (diffMin < 1) return 'Last seen just now'
  if (diffMin < 60) return `Last seen ${diffMin}m ago`
  if (diffHr < 24) return `Last seen ${diffHr}h ago`
  if (diffDay < 7) return `Last seen ${diffDay}d ago`

  // Format as date for older
  return `Last seen ${date.toLocaleDateString('en', { month: 'short', day: 'numeric' })}`
}

/**
 * Get presence for multiple users at once (for conversation lists, discover).
 */
export async function getPresenceBatch(
  userIds: string[]
): Promise<Map<string, { isOnline: boolean; lastActiveAt: Date | null }>> {
  const profiles = await db.profile.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, isOnline: true, lastActiveAt: true },
  })

  const map = new Map<string, { isOnline: boolean; lastActiveAt: Date | null }>()
  for (const p of profiles) {
    let isOnline = p.isOnline
    if (!isOnline && p.lastActiveAt) {
      const ageMs = Date.now() - p.lastActiveAt.getTime()
      if (ageMs < ONLINE_GRACE_MS) isOnline = true
    }
    map.set(p.userId, { isOnline, lastActiveAt: p.lastActiveAt })
  }
  return map
}
