// ════════════════════════════════════════════════════════════════════
//  Lellina — Chat Engine (Socket.io)  ·  Phase 5.1
//  Mini-service on port 3003. Gateway routes via /?XTransformPort=3003
//
//  Auth: client passes { token } in auth handshake → verified with
//  NEXTAUTH_SECRET (same JWT minted by /api/chat/token).
//
//  Rooms: conv:{conversationId}  — users join conversations they're part of.
//
//  Events (client → server):
//    conversation:join    { conversationId }
//    conversation:leave   { conversationId }
//    message:send         { conversationId, content?, photoUrl?, type? }
//    message:read         { conversationId }
//    typing:start         { conversationId }
//    typing:stop          { conversationId }
//    nudge:send           { conversationId }
//    presence:ping
//
//  Events (server → client):
//    message:new          { message }
//    message:read         { conversationId, readerId, messageIds }
//    typing:update        { conversationId, userId, isTyping }
//    presence:online      { userId }
//    presence:offline     { userId, lastSeen }
//    nudge:new            { conversationId, fromId }
//    conversation:update  { conversationId, lastMessagePreview }
// ════════════════════════════════════════════════════════════════════

import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const PORT = 3003
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET!

if (!NEXTAUTH_SECRET) {
  console.error('[chat-service] FATAL: NEXTAUTH_SECRET is not set')
  process.exit(1)
}

const db = new PrismaClient({
  log: ['error', 'warn'],
})

const httpServer = createServer()

const io = new Server(httpServer, {
  // Caddy forwards to port 3003 with path / — DO NOT change.
  path: '/',
  cors: {
    origin: true, // allow all origins (gateway handles security)
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 5 * 1024 * 1024, // 5MB for photo base64
})

// ─── Online presence ───
// userId → Set<socketId>  (a user may have multiple tabs/devices)
const onlineSockets = new Map<string, Set<string>>()

function setUserOnline(userId: string, socketId: string) {
  if (!onlineSockets.has(userId)) {
    onlineSockets.set(userId, new Set())
  }
  onlineSockets.get(userId)!.add(socketId)
}

function setUserOffline(userId: string, socketId: string) {
  const sockets = onlineSockets.get(userId)
  if (!sockets) return
  sockets.delete(socketId)
  if (sockets.size === 0) {
    onlineSockets.delete(userId)
    // mark last seen in DB + broadcast offline
    const lastSeen = new Date()
    db.profile
      .update({
        where: { userId },
        data: { isOnline: false, lastActiveAt: lastSeen },
      })
      .catch(() => {})
    io.emit('presence:offline', { userId, lastSeen: lastSeen.toISOString() })
  }
}

function isUserOnline(userId: string): boolean {
  return onlineSockets.has(userId)
}

// ─── Auth middleware ───
interface ChatToken {
  sub: string
  role: string
  country?: string | null
}

io.use(async (socket: Socket, next) => {
  const token = socket.handshake.auth?.token as string | undefined
  if (!token) {
    return next(new Error('NO_TOKEN'))
  }
  try {
    const payload = jwt.verify(token, NEXTAUTH_SECRET) as ChatToken
    socket.data.userId = payload.sub
    socket.data.role = payload.role
    next()
  } catch {
    next(new Error('BAD_TOKEN'))
  }
})

// ─── Helpers ───

/** Verify the user is a participant in a conversation. */
async function verifyParticipant(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true, status: true },
  })
  if (!conv) return false
  if (conv.status !== 'ACTIVE') return false
  return conv.userAId === userId || conv.userBId === userId
}

/** Get the other participant's userId. */
async function getOtherUserId(
  conversationId: string,
  userId: string
): Promise<string | null> {
  const conv = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { userAId: true, userBId: true },
  })
  if (!conv) return null
  return conv.userAId === userId ? conv.userBId : conv.userAId
}

/**
 * Record a reply for ghost-score tracking.
 * Called when a user sends a message in response to the other's last message.
 */
async function recordReplyForGhostScore(
  conversationId: string,
  senderId: string
): Promise<void> {
  try {
    // Find the last message from the OTHER person before this one
    const otherId = await getOtherUserId(conversationId, senderId)
    if (!otherId) return

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

    // Update sender's lastReplyAt
    await db.profile.update({
      where: { userId: senderId },
      data: { lastReplyAt: new Date() },
    })

    // If replied within 24h, count toward redemption
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
      // Slow reply (>24h) resets redemption counter
      await db.ghostRedemption.upsert({
        where: { userId: senderId },
        create: { userId: senderId, consecutiveDays: 0 },
        update: { consecutiveDays: 0 },
      })
    }

    // Recalculate ghost score for sender
    await recalculateGhostScore(senderId)
  } catch (err) {
    console.error('[chat-service] recordReplyForGhostScore error:', err)
  }
}

/** Recalculate a user's ghost score + tier based on reply history. */
async function recalculateGhostScore(userId: string): Promise<void> {
  // Get all conversations this user is part of
  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
      status: 'ACTIVE',
    },
    select: { id: true },
  })

  if (conversations.length === 0) return

  // For each conversation, find the user's average reply time
  let totalReplyMs = 0
  let replyCount = 0
  let ghostFlags = 0

  for (const conv of conversations) {
    const otherId = await getOtherUserId(conv.id, userId)
    if (!otherId) continue

    // Get all messages where the OTHER person sent first, then this user replied
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
  ghostFlags = await db.ghostFlag.count({ where: { ghostId: userId } })

  // Calculate tier
  let tier = 'NEW'
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
}

// ─── Connection handler ───
io.on('connection', (socket: Socket) => {
  const userId: string = socket.data.userId
  console.log(`[chat-service] connect ${userId.slice(0, 8)}…`)

  // Mark online
  setUserOnline(userId, socket.id)
  db.profile
    .update({
      where: { userId },
      data: { isOnline: true, lastActiveAt: new Date() },
    })
    .catch(() => {})
  io.emit('presence:online', { userId })

  // ─── Join a conversation room ───
  socket.on('conversation:join', async ({ conversationId }: { conversationId: string }) => {
    const ok = await verifyParticipant(conversationId, userId)
    if (!ok) return
    socket.join(`conv:${conversationId}`)
    // Mark undelivered messages from the other person as delivered
    const otherId = await getOtherUserId(conversationId, userId)
    if (otherId) {
      await db.message.updateMany({
        where: {
          conversationId,
          senderId: otherId,
          deliveredAt: null,
          deletedAt: null,
        },
        data: { deliveredAt: new Date() },
      })
    }
  })

  // ─── Leave a conversation room ───
  socket.on('conversation:leave', ({ conversationId }: { conversationId: string }) => {
    socket.leave(`conv:${conversationId}`)
  })

  // ─── Send a message ───
  socket.on(
    'message:send',
    async (data: {
      conversationId: string
      content?: string
      photoUrl?: string
      type?: string
    }) => {
      const { conversationId, content, photoUrl, type } = data
      const ok = await verifyParticipant(conversationId, userId)
      if (!ok) return

      const msgType = type || (photoUrl ? 'PHOTO' : 'TEXT')
      if (msgType === 'TEXT' && !content?.trim()) return
      if (content && content.length > 2000) return
      if (photoUrl && photoUrl.length > 4 * 1024 * 1024) return // 4MB limit

      const otherId = await getOtherUserId(conversationId, userId)
      const recipientOnline = otherId ? isUserOnline(otherId) : false

      const message = await db.message.create({
        data: {
          conversationId,
          senderId: userId,
          content: content || null,
          photoUrl: photoUrl || null,
          type: msgType,
          deliveredAt: recipientOnline ? new Date() : null,
        },
      })

      // Update conversation preview
      const preview = content || (photoUrl ? '📷 Photo' : '')
      await db.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: preview.slice(0, 100),
          lastMessageSender: userId,
          updatedAt: new Date(),
        },
      })

      // Broadcast to the room (both participants)
      io.to(`conv:${conversationId}`).emit('message:new', { message })

      // Update conversation lists for both
      io.to(`conv:${conversationId}`).emit('conversation:update', {
        conversationId,
        lastMessagePreview: preview.slice(0, 100),
        lastMessageAt: message.createdAt.toISOString(),
        senderId: userId,
      })

      // Ghost score: if this is a reply, record it
      await recordReplyForGhostScore(conversationId, userId)
    }
  )

  // ─── Mark messages as read ───
  socket.on('message:read', async ({ conversationId }: { conversationId: string }) => {
    const ok = await verifyParticipant(conversationId, userId)
    if (!ok) return
    const otherId = await getOtherUserId(conversationId, userId)
    if (!otherId) return

    const updated = await db.message.updateMany({
      where: {
        conversationId,
        senderId: otherId,
        readAt: null,
        deletedAt: null,
      },
      data: { readAt: new Date(), deliveredAt: new Date() },
    })

    if (updated.count > 0) {
      io.to(`conv:${conversationId}`).emit('message:read', {
        conversationId,
        readerId: userId,
        count: updated.count,
      })
    }
  })

  // ─── Typing indicators ───
  socket.on('typing:start', ({ conversationId }: { conversationId: string }) => {
    socket.to(`conv:${conversationId}`).emit('typing:update', {
      conversationId,
      userId,
      isTyping: true,
    })
  })

  socket.on('typing:stop', ({ conversationId }: { conversationId: string }) => {
    socket.to(`conv:${conversationId}`).emit('typing:update', {
      conversationId,
      userId,
      isTyping: false,
    })
  })

  // ─── Ghost nudge ───
  socket.on('nudge:send', async ({ conversationId }: { conversationId: string }) => {
    const ok = await verifyParticipant(conversationId, userId)
    if (!ok) return

    // Max 1 nudge per conversation per 24h
    const recent = await db.ghostNudge.findFirst({
      where: {
        conversationId,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    })
    if (recent) return // can't spam

    await db.ghostNudge.create({
      data: { conversationId, sentBy: userId },
    })

    // Create a system nudge message
    const message = await db.message.create({
      data: {
        conversationId,
        senderId: userId,
        type: 'NUDGE',
        content: 'Still there? 👋',
        deliveredAt: isUserOnline((await getOtherUserId(conversationId, userId)) || '') ? new Date() : null,
      },
    })

    io.to(`conv:${conversationId}`).emit('nudge:new', {
      conversationId,
      fromId: userId,
      message,
    })
    io.to(`conv:${conversationId}`).emit('message:new', { message })
  })

  // ─── Presence ping ───
  socket.on('presence:ping', () => {
    db.profile
      .update({
        where: { userId },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => {})
  })

  // ─── Disconnect ───
  socket.on('disconnect', () => {
    setUserOffline(userId, socket.id)
    console.log(`[chat-service] disconnect ${userId.slice(0, 8)}…`)
  })

  socket.on('error', (err: Error) => {
    console.error(`[chat-service] socket error (${userId.slice(0, 8)}):`, err.message)
  })
})

// ─── Start ───
httpServer.listen(PORT, () => {
  console.log(`[chat-service] Socket.io listening on port ${PORT}`)
})

// ─── Graceful shutdown ───
async function shutdown(signal: string) {
  console.log(`[chat-service] ${signal} received, shutting down...`)
  io.close()
  await db.$disconnect()
  httpServer.close(() => {
    console.log('[chat-service] closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
