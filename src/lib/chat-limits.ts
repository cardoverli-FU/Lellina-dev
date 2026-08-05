// ════════════════════════════════════════════════════════════════════
//  Phase 5.8 + 5.9 — Chat Request Limits
//
//  Free users: 1 chat request per rolling 24h.
//  Lelly Pass / Admin: unlimited.
//
//  A "chat request" = initiating a new conversation with someone.
//  Once accepted, messaging within the conversation is free for both.
// ════════════════════════════════════════════════════════════════════

import { db } from './db'
import { hasLellyPass } from './gating'

/** Free tier: 1 chat request per rolling 24h. */
export const FREE_DAILY_CHAT_REQUESTS = 1

/** Rolling window for chat request limit (24h in ms). */
const ROLLING_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Count how many chat requests the user has sent in the last 24h.
 * Only counts PENDING + ACCEPTED (not DECLINED/EXPIRED).
 */
export async function getChatRequestsSentToday(userId: string): Promise<number> {
  const since = new Date(Date.now() - ROLLING_WINDOW_MS)
  return db.chatRequest.count({
    where: {
      fromId: userId,
      createdAt: { gte: since },
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
  })
}

/**
 * How many chat requests the user can still send today.
 * Returns -1 for unlimited (Lelly Pass / Admin).
 */
export async function getRemainingChatRequests(userId: string): Promise<number> {
  const hasPass = await hasLellyPass(userId)
  if (hasPass) return -1 // unlimited

  const sent = await getChatRequestsSentToday(userId)
  return Math.max(0, FREE_DAILY_CHAT_REQUESTS - sent)
}

/**
 * Can the user send a chat request right now?
 */
export async function canSendChatRequest(userId: string): Promise<{
  allowed: boolean
  reason?: 'LIMIT_REACHED' | 'DUPLICATE' | 'OK'
  remaining: number
}> {
  const remaining = await getRemainingChatRequests(userId)
  if (remaining === 0) {
    return { allowed: false, reason: 'LIMIT_REACHED', remaining: 0 }
  }
  return { allowed: true, reason: 'OK', remaining }
}

/**
 * Has a chat request already been sent from `fromId` to `toId`?
 * Checks for any non-declined/expired request.
 */
export async function hasExistingChatRequest(
  fromId: string,
  toId: string
): Promise<boolean> {
  const existing = await db.chatRequest.findFirst({
    where: {
      fromId,
      toId,
      status: { in: ['PENDING', 'ACCEPTED'] },
    },
    select: { id: true },
  })
  return !!existing
}

/**
 * Do these two users already have an active conversation?
 */
export async function hasActiveConversation(
  userAId: string,
  userBId: string
): Promise<boolean> {
  // Conversation stores userAId < userBId lexicographically
  const [a, b] = userAId < userBId ? [userAId, userBId] : [userBId, userAId]
  const conv = await db.conversation.findFirst({
    where: { userAId: a, userBId: b },
    select: { id: true, status: true },
  })
  return conv?.status === 'ACTIVE'
}
