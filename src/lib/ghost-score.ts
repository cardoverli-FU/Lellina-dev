// ════════════════════════════════════════════════════════════════════
//  Phase 5.16 + 5.18 — Ghost Score Tracking + Redemption
//
//  Ghost Score: 0-100 (higher = better). Calculated from reply patterns.
//  Tiers: NEW (no data) → FAST (replies <24h) → SLOW (24-72h) → GHOST (>72h or flagged)
//
//  Redemption: 14 consecutive days of <24h replies upgrades the tier:
//    GHOST → SLOW → FAST. A single >24h reply resets the counter.
//
//  This is the single source of truth for ghost score calculation.
//  The socket service has its own inline copy for real-time updates
//  (it can't import @/ aliases). Keep them in sync.
// ════════════════════════════════════════════════════════════════════

import { db } from './db'
import { GHOST_BADGES, type GhostTier, type GhostBadge } from './ghost-badges'

export { GHOST_BADGES, type GhostTier, type GhostBadge }

/**
 * Recalculate a user's ghost score + tier from their reply history.
 * Called after every message send, and can be called on-demand.
 *
 * Algorithm:
 *  1. For each ACTIVE conversation, find pairs of (other's msg → user's reply)
 *  2. Compute average reply time across all pairs
 *  3. Map avg reply time to tier:
 *     <6h  → FAST (score 90)
 *     <24h → FAST (score 75)
 *     <72h → SLOW (score 40)
 *     >72h → GHOST (score 15)
 *  4. Ghost flags drag score down (3+ flags = GHOST, 1+ = downgrade one tier)
 *  5. Redemption: 14 consecutive fast days → upgrade one tier
 */
export async function recalculateGhostScore(userId: string): Promise<GhostBadge> {
  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
      status: 'ACTIVE',
    },
    select: { id: true, userAId: true, userBId: true },
  })

  let totalReplyMs = 0
  let replyCount = 0

  for (const conv of conversations) {
    const otherId = conv.userAId === userId ? conv.userBId : conv.userAId

    // Get all messages from the OTHER person
    const otherMessages = await db.message.findMany({
      where: {
        conversationId: conv.id,
        senderId: otherId,
        type: { in: ['TEXT', 'PHOTO'] },
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    })

    for (const otherMsg of otherMessages) {
      // Find the user's first reply AFTER the other's message
      const myReply = await db.message.findFirst({
        where: {
          conversationId: conv.id,
          senderId: userId,
          createdAt: { gt: otherMsg.createdAt },
          type: { in: ['TEXT', 'PHOTO'] },
          deletedAt: null,
        },
        orderBy: { createdAt: 'asc' },
        select: { createdAt: true },
      })

      if (myReply) {
        totalReplyMs += myReply.createdAt.getTime() - otherMsg.createdAt.getTime()
        replyCount++
      }
    }
  }

  // Count ghost flags against this user
  const ghostFlags = await db.ghostFlag.count({ where: { ghostId: userId } })

  let tier: GhostTier = 'NEW'
  let score = 50 // neutral start

  if (replyCount === 0 && conversations.length > 0) {
    tier = 'NEW'
    score = 50
  } else if (replyCount > 0) {
    const avgHours = totalReplyMs / replyCount / (1000 * 60 * 60)
    if (avgHours <= 6) {
      tier = 'FAST'
      score = 90
    } else if (avgHours <= 24) {
      tier = 'FAST'
      score = 75
    } else if (avgHours <= 72) {
      tier = 'SLOW'
      score = 40
    } else {
      tier = 'GHOST'
      score = 15
    }
  }

  // Ghost flags drag the score down
  if (ghostFlags >= 3) {
    tier = 'GHOST'
    score = Math.min(score, 20)
  } else if (ghostFlags >= 1) {
    if (tier === 'FAST') tier = 'SLOW'
    score = Math.min(score, 45)
  }

  // Redemption: 14 consecutive fast days upgrades tier
  const redemption = await db.ghostRedemption.findUnique({
    where: { userId },
    select: { consecutiveDays: true },
  })
  if (redemption && redemption.consecutiveDays >= 14) {
    if (tier === 'GHOST') tier = 'SLOW'
    else if (tier === 'SLOW') tier = 'FAST'
    score = Math.min(100, score + 25)
  }

  await db.profile.update({
    where: { userId },
    data: {
      responseRateTier: tier,
      ghostScore: score,
      ghostFlagCount: ghostFlags,
    },
  })

  const badgeMeta = GHOST_BADGES[tier]
  return { ...badgeMeta, score, flagCount: ghostFlags }
}

/**
 * Record a reply for ghost score + redemption tracking.
 * Called when a user sends a message in response to the other's last message.
 */
export async function recordReply(
  conversationId: string,
  senderId: string
): Promise<void> {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  })
  if (!conv) return

  const otherId = conv.userAId === senderId ? conv.userBId : conv.userAId

  const lastOtherMessage = await db.message.findFirst({
    where: {
      conversationId,
      senderId: otherId,
      deletedAt: null,
      type: { in: ['TEXT', 'PHOTO'] },
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (!lastOtherMessage) return

  const replyMs = Date.now() - lastOtherMessage.createdAt.getTime()
  const replyHours = replyMs / (1000 * 60 * 60)

  await db.profile.update({
    where: { userId: senderId },
    data: { lastReplyAt: new Date() },
  })

  if (replyHours <= 24) {
    await db.ghostRedemption.upsert({
      where: { userId: senderId },
      create: {
        userId: senderId,
        consecutiveDays: 1,
        lastFastReplyAt: new Date(),
      },
      update: {
        consecutiveDays: { increment: 1 },
        lastFastReplyAt: new Date(),
      },
    })
  } else {
    // Slow reply resets redemption
    await db.ghostRedemption.upsert({
      where: { userId: senderId },
      create: { userId: senderId, consecutiveDays: 0 },
      update: { consecutiveDays: 0 },
    })
  }

  await recalculateGhostScore(senderId)
}

/**
 * Get a user's current ghost badge (from cached Profile fields).
 * Does NOT recalculate — use recalculateGhostScore() for that.
 */
export async function getGhostBadge(userId: string): Promise<GhostBadge> {
  const profile = await db.profile.findUnique({
    where: { userId },
    select: { responseRateTier: true, ghostScore: true, ghostFlagCount: true },
  })

  const tier = (profile?.responseRateTier as GhostTier) || 'NEW'
  const score = profile?.ghostScore ?? 50
  const flagCount = profile?.ghostFlagCount ?? 0

  const badgeMeta = GHOST_BADGES[tier]
  return { ...badgeMeta, score, flagCount }
}

/**
 * Check if a conversation qualifies for a ghost nudge (3+ days of silence).
 * Returns true if the other person hasn't replied in 3+ days.
 */
export async function canSendNudge(
  conversationId: string,
  senderId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true, status: true },
  })
  if (!conv || conv.status !== 'ACTIVE') {
    return { allowed: false, reason: 'Conversation not active' }
  }

  const otherId = conv.userAId === senderId ? conv.userBId : conv.userAId

  // Find the last message from the sender (the one who wants to nudge)
  const lastMyMessage = await db.message.findFirst({
    where: {
      conversationId,
      senderId,
      type: { in: ['TEXT', 'PHOTO'] },
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (!lastMyMessage) {
    return { allowed: false, reason: 'You haven\'t sent a message yet' }
  }

  // Check if the other person has replied since
  const otherReply = await db.message.findFirst({
    where: {
      conversationId,
      senderId: otherId,
      createdAt: { gt: lastMyMessage.createdAt },
      type: { in: ['TEXT', 'PHOTO'] },
      deletedAt: null,
    },
    select: { id: true },
  })

  if (otherReply) {
    return { allowed: false, reason: 'They already replied' }
  }

  // Check 3-day silence
  const silenceMs = Date.now() - lastMyMessage.createdAt.getTime()
  if (silenceMs < 3 * 24 * 60 * 60 * 1000) {
    return { allowed: false, reason: 'Only 3+ days of silence allows a nudge' }
  }

  // Check no nudge in the last 24h
  const recentNudge = await db.ghostNudge.findFirst({
    where: {
      conversationId,
      createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    select: { id: true },
  })
  if (recentNudge) {
    return { allowed: false, reason: 'You can only nudge once per day' }
  }

  return { allowed: true }
}

/**
 * Check if a conversation qualifies for a ghost flag (7+ days of silence).
 */
export async function canReportGhost(
  conversationId: string,
  reporterId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true, status: true },
  })
  if (!conv || conv.status !== 'ACTIVE') {
    return { allowed: false, reason: 'Conversation not active' }
  }

  const ghostId = conv.userAId === reporterId ? conv.userBId : conv.userAId

  // Already flagged? (findFirst — composite unique key name varies by Prisma version)
  const existingFlag = await db.ghostFlag.findFirst({
    where: { conversationId, reporterId },
    select: { id: true },
  })
  if (existingFlag) {
    return { allowed: false, reason: 'You already reported this ghost' }
  }

  // Find the last message from the reporter
  const lastMyMessage = await db.message.findFirst({
    where: {
      conversationId,
      senderId: reporterId,
      type: { in: ['TEXT', 'PHOTO'] },
      deletedAt: null,
    },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  })

  if (!lastMyMessage) {
    return { allowed: false, reason: 'You haven\'t sent a message yet' }
  }

  // Check if the ghost has replied since
  const ghostReply = await db.message.findFirst({
    where: {
      conversationId,
      senderId: ghostId,
      createdAt: { gt: lastMyMessage.createdAt },
      type: { in: ['TEXT', 'PHOTO'] },
      deletedAt: null,
    },
    select: { id: true },
  })
  if (ghostReply) {
    return { allowed: false, reason: 'They already replied' }
  }

  // Check 7-day silence
  const silenceMs = Date.now() - lastMyMessage.createdAt.getTime()
  if (silenceMs < 7 * 24 * 60 * 60 * 1000) {
    return { allowed: false, reason: 'Only 7+ days of silence allows a ghost flag' }
  }

  return { allowed: true }
}
