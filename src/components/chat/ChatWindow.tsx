'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.2 — Chat Window (the active conversation)
//  Header + HandleRequestBar + Messages + Typing + Input
//  Real-time via Socket.io (messages, typing, read receipts, presence).
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, MoreVertical, X } from 'lucide-react'
import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'
import type { Socket } from 'socket.io-client'
import { MessageBubble, type ChatMessage } from './MessageBubble'
import { MessageInput, TypingIndicator } from './MessageInput'
import { HandleRequestBar } from './HandleRequestBar'
import { GhostBadge } from './GhostBadge'
import { ImageViewer } from './ImageViewer'
import { NotFeelingIt } from './NotFeelingIt'
import { GhostNudge } from './GhostNudge'
import { ReportGhost } from './ReportGhost'

export interface ChatWindowConversation {
  id: string
  status: string
  otherUser: {
    id: string
    displayName: string
    age?: number | null
    photoUrls: string[]
    district?: { name: string } | null
    responseRateTier: string | null
    isOnline: boolean
    lastSeenText: string
  }
}

interface ChatWindowProps {
  conversation: ChatWindowConversation
  socket: Socket | null
  currentUserId: string
  hasLellyPass: boolean
  onBack: () => void
  onConversationChanged: () => void
}

export function ChatWindow({
  conversation,
  socket,
  currentUserId,
  hasLellyPass,
  onBack,
  onConversationChanged,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [otherTyping, setOtherTyping] = useState(false)
  const [viewerSrc, setViewerSrc] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [handleStatus, setHandleStatus] = useState<'NONE' | 'PENDING_FROM_ME' | 'PENDING_FROM_THEM' | 'ACCEPTED'>('NONE')
  const [otherHandles, setOtherHandles] = useState<{
    telegram?: string | null
    instagram?: string | null
    signal?: string | null
    otherSocial?: string | null
  }>({})
  const [showNudge, setShowNudge] = useState(false)
  const [showFlag, setShowFlag] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  // ─── Load messages ────────────────────────────────────────────────
  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/chat/conversations/${conversation.id}/messages?limit=30`)
      if (!res.ok) return
      const data = await res.json()
      setMessages(data.messages)
      setLoading(false)
      // Join socket room
      socket?.emit('conversation:join', { conversationId: conversation.id })
      // Mark read
      socket?.emit('message:read', { conversationId: conversation.id })
    } catch {
      setLoading(false)
    }
  }, [conversation.id, socket])

  // ─── Load handle request status ──────────────────────────────────
  const loadHandleStatus = useCallback(async () => {
    try {
      // We check: is there a pending handle request? From me or from them?
      // Also: if accepted, fetch the other user's handles.
      const res = await fetch(`/api/chat/conversations/${conversation.id}/handle-status`)
      if (res.ok) {
        const data = await res.json()
        setHandleStatus(data.status || 'NONE')
        setOtherHandles(data.handles || {})
      }
    } catch {
      // endpoint may not exist yet — default to NONE
    }
  }, [conversation.id])

  // ─── Check if nudge/flag should be shown ──────────────────────────
  async function checkNudgeEligibility() {
    try {
      // Find my last message
      const myLastMsg = messages.filter(m => m.senderId === currentUserId).pop()
      if (!myLastMsg) return
      const lastMsgTime = new Date(myLastMsg.createdAt).getTime()
      const daysSilent = (Date.now() - lastMsgTime) / (1000 * 60 * 60 * 24)
      const otherReplied = messages.some(
        m => m.senderId === conversation.otherUser.id && new Date(m.createdAt) > new Date(myLastMsg.createdAt)
      )
      if (!otherReplied && daysSilent >= 3) setShowNudge(true)
      if (!otherReplied && daysSilent >= 7) setShowFlag(true)
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    setLoading(true)
    setMessages([])
    loadMessages()
    loadHandleStatus()
    checkNudgeEligibility()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation.id])

  // ─── Socket event listeners ───────────────────────────────────────
  useEffect(() => {
    if (!socket) return

    const onMessageNew = ({ message }: { message: ChatMessage }) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev
        return [...prev, message]
      })
      // Auto-mark read if we're viewing this conversation
      if (message.senderId !== currentUserId) {
        socket.emit('message:read', { conversationId: conversation.id })
      }
      onConversationChanged()
    }

    const onTyping = ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      if (userId !== currentUserId) {
        setOtherTyping(isTyping)
      }
    }

    const onRead = ({ readerId }: { readerId: string; count: number }) => {
      if (readerId !== currentUserId) {
        // Mark my messages as read
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId && !m.readAt
              ? { ...m, readAt: new Date().toISOString(), deliveredAt: m.deliveredAt || new Date().toISOString() }
              : m
          )
        )
      }
    }

    const onNudge = () => {
      // Nudge received — already handled via message:new (NUDGE type)
    }

    socket.on('message:new', onMessageNew)
    socket.on('typing:update', onTyping)
    socket.on('message:read', onRead)
    socket.on('nudge:new', onNudge)

    return () => {
      socket.off('message:new', onMessageNew)
      socket.off('typing:update', onTyping)
      socket.off('message:read', onRead)
      socket.off('nudge:new', onNudge)
      socket.emit('conversation:leave', { conversationId: conversation.id })
    }
  }, [socket, conversation.id, currentUserId, onConversationChanged])

  // ─── Auto-scroll to bottom on new messages ───────────────────────
  useEffect(() => {
    if (isAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, otherTyping])

  // ─── Track scroll position ────────────────────────────────────────
  function handleScroll() {
    const el = scrollRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    isAtBottomRef.current = distFromBottom < 100
  }

  // ─── Send message ─────────────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string, photoUrl?: string) => {
      if (!content && !photoUrl) return

      // Optimistic: add message immediately
      const tempId = `temp-${Date.now()}`
      const optimistic: ChatMessage = {
        id: tempId,
        senderId: currentUserId,
        content: content || null,
        photoUrl: photoUrl || null,
        type: photoUrl ? 'PHOTO' : 'TEXT',
        deliveredAt: null,
        readAt: null,
        deletedAt: null,
        createdAt: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, optimistic])

      // Send via socket (real-time). Fall back to REST if socket not connected.
      if (socket?.connected) {
        socket.emit('message:send', {
          conversationId: conversation.id,
          content: content || undefined,
          photoUrl: photoUrl || undefined,
        })
      } else {
        // REST fallback
        fetch(`/api/chat/conversations/${conversation.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, photoUrl }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.message) {
              setMessages((prev) =>
                prev.map((m) => (m.id === tempId ? data.message : m))
              )
            }
          })
          .catch(() => {
            toast.error('Failed to send')
            setMessages((prev) => prev.filter((m) => m.id !== tempId))
          })
      }
      onConversationChanged()
    },
    [socket, conversation.id, currentUserId, onConversationChanged]
  )

  // ─── Typing ───────────────────────────────────────────────────────
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      socket?.emit(isTyping ? 'typing:start' : 'typing:stop', {
        conversationId: conversation.id,
      })
    },
    [socket, conversation.id]
  )

  // ─── Delete message (Lelly only) ─────────────────────────────────
  async function deleteMessage(messageId: string) {
    if (!hasLellyPass) {
      toast.error('Lelly Pass required to delete messages')
      return
    }
    try {
      const res = await fetch(`/api/chat/conversations/${conversation.id}/messages/${messageId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        toast.error('Could not delete')
        return
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, deletedAt: new Date().toISOString(), content: null, photoUrl: null }
            : m
        )
      )
      toast.success('Message deleted')
    } catch {
      toast.error('Network error')
    }
  }

  const isExited = conversation.status === 'EXITED'
  const otherUser = conversation.otherUser

  return (
    <div className="flex h-full flex-col bg-hero-dark">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 border-b border-cream/10 bg-hero-dark px-3 py-3">
        <button
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/5 text-cream/60 hover:bg-cream/10 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {otherUser.photoUrls.length > 0 ? (
            <img
              src={otherUser.photoUrls[0]}
              alt={otherUser.displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-rose/20">
              <span className="font-display text-sm font-bold text-warm-rose-light">
                {otherUser.displayName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {otherUser.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-hero-dark bg-sage" />
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-display text-sm font-semibold text-cream truncate">
              {otherUser.displayName}
            </span>
            {otherUser.age && (
              <span className="font-body text-[11px] text-cream/40">{otherUser.age}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <GhostBadge tier={otherUser.responseRateTier} showLabel={false} />
            <span className="font-body text-[10px] text-cream/40">
              {otherUser.isOnline ? 'Online now' : otherUser.lastSeenText}
            </span>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream/5 text-cream/60 hover:bg-cream/10"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  className="absolute right-0 top-11 z-20 w-48 rounded-2xl border border-cream/10 bg-soft-charcoal p-1.5 shadow-2xl"
                >
                  {!isExited && (
                    <>
                      <div className="px-2 py-1.5">
                        <NotFeelingIt
                          conversationId={conversation.id}
                          onExited={() => {
                            setMenuOpen(false)
                            loadMessages()
                            onConversationChanged()
                          }}
                        />
                      </div>
                      {showNudge && (
                        <div className="px-2 py-1.5">
                          <GhostNudge
                            conversationId={conversation.id}
                            onNudged={() => {
                              setMenuOpen(false)
                              loadMessages()
                            }}
                          />
                        </div>
                      )}
                      {showFlag && (
                        <div className="px-2 py-1.5">
                          <ReportGhost
                            conversationId={conversation.id}
                            onReported={() => {
                              setMenuOpen(false)
                              loadMessages()
                              onConversationChanged()
                            }}
                          />
                        </div>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 font-body text-xs text-cream/60 hover:bg-cream/5"
                  >
                    <X className="h-3.5 w-3.5" />
                    Close menu
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ─── Handle request bar ─── */}
      {!isExited && (
        <HandleRequestBar
          conversationId={conversation.id}
          status={handleStatus}
          handles={otherHandles}
          onUpdate={loadHandleStatus}
        />
      )}

      {/* ─── Messages ─── */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-2"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-cream/20 border-t-warm-rose-light" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-2 text-3xl">👋</div>
            <p className="font-body text-sm text-cream/50">Say hi to start the conversation</p>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isMine={msg.senderId === currentUserId}
                hasLellyPass={hasLellyPass}
                onPhotoClick={setViewerSrc}
                onDeleteMessage={deleteMessage}
              />
            ))}
            <AnimatePresence>
              {otherTyping && (
                <TypingIndicator />
              )}
            </AnimatePresence>
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* ─── Input ─── */}
      {isExited ? (
        <div className="border-t border-cream/10 bg-hero-dark p-4 text-center">
          <p className="font-body text-xs text-cream/40">
            This conversation has been closed. 💛
          </p>
        </div>
      ) : (
        <MessageInput
          onSend={sendMessage}
          onTyping={sendTyping}
          placeholder={`Message ${otherUser.displayName}…`}
        />
      )}

      {/* ─── Full-screen image viewer ─── */}
      <ImageViewer src={viewerSrc} onClose={() => setViewerSrc(null)} />
    </div>
  )
}
