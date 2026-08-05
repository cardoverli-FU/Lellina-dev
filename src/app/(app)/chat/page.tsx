'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.2 — Chat Page
//  Two-pane layout (desktop): ConversationList | ChatWindow
//  Single-pane (mobile): list OR window with back button
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, ArrowLeft } from 'lucide-react'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/lib/socket-client'
import { hasLellyPass } from '@/lib/gating'
import { ConversationList, type ConversationItem, type ChatRequestItem } from '@/components/chat/ConversationList'
import { ChatWindow, type ChatWindowConversation } from '@/components/chat/ChatWindow'
import { toast } from 'sonner'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const socket = useSocket()

  const [conversations, setConversations] = useState<ConversationItem[]>([])
  const [requests, setRequests] = useState<ChatRequestItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lellyPass, setLellyPass] = useState(false)
  const [mobileView, setMobileView] = useState<'list' | 'window'>('list')

  // ─── Redirect if not authenticated ───
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  // ─── Load conversations + requests ───
  const loadData = useCallback(async () => {
    try {
      const [convRes, reqRes] = await Promise.all([
        fetch('/api/chat/conversations'),
        fetch('/api/chat/requests'),
      ])
      if (convRes.ok) {
        const data = await convRes.json()
        setConversations(data.conversations || [])
      }
      if (reqRes.ok) {
        const data = await reqRes.json()
        setRequests(data.incoming || [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Load Lelly Pass status ───
  useEffect(() => {
    if (!session?.user?.id) return
    hasLellyPass(session.user.id).then(setLellyPass)
  }, [session?.user?.id])

  useEffect(() => {
    if (session) loadData()
  }, [session, loadData])

  // ─── Accept / decline requests ───
  const acceptRequest = useCallback(async (requestId: string) => {
    try {
      const res = await fetch(`/api/chat/request/${requestId}/accept`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not accept')
        return
      }
      toast.success('Chat started 💛')
      // Reload data + open the new conversation
      await loadData()
      if (data.conversation) {
        setActiveId(data.conversation.id)
        setMobileView('window')
      }
    } catch {
      toast.error('Network error')
    }
  }, [loadData])

  const declineRequest = useCallback(async (requestId: string) => {
    try {
      const res = await fetch(`/api/chat/request/${requestId}/decline`, { method: 'POST' })
      if (!res.ok) {
        toast.error('Could not decline')
        return
      }
      setRequests((prev) => prev.filter((r) => r.id !== requestId))
    } catch {
      toast.error('Network error')
    }
  }, [])

  // ─── Select conversation ───
  const selectConversation = useCallback((id: string) => {
    setActiveId(id)
    setMobileView('window')
  }, [])

  const activeConversation: ChatWindowConversation | null = activeId
    ? (() => {
        const conv = conversations.find((c) => c.id === activeId)
        if (!conv) return null
        return {
          id: conv.id,
          status: conv.status,
          otherUser: conv.otherUser,
        }
      })()
    : null

  // ─── Socket: listen for conversation updates (new messages, etc.) ───
  useEffect(() => {
    if (!socket) return
    const onConvUpdate = () => loadData()
    socket.on('conversation:update', onConvUpdate)
    socket.on('message:new', onConvUpdate)
    return () => {
      socket.off('conversation:update', onConvUpdate)
      socket.off('message:new', onConvUpdate)
    }
  }, [socket, loadData])

  // ─── Loading state ───
  if (status === 'loading' || loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] md:h-screen items-center justify-center bg-hero-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cream/20 border-t-warm-rose-light" />
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-screen bg-hero-dark md:overflow-hidden">
      {/* ─── Desktop sidebar (conversation list) ─── */}
      <aside className="hidden md:flex md:w-80 md:flex-col md:border-r md:border-cream/10">
        <ConversationList
          conversations={conversations}
          requests={requests}
          activeId={activeId}
          onSelect={selectConversation}
          onAcceptRequest={acceptRequest}
          onDeclineRequest={declineRequest}
        />
      </aside>

      {/* ─── Mobile: list view ─── */}
      <div className="flex-1 md:hidden">
        <AnimatePresence mode="wait">
          {mobileView === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -50 }}
              className="h-[calc(100vh-4rem)] md:h-screen"
            >
              <ConversationList
                conversations={conversations}
                requests={requests}
                activeId={activeId}
                onSelect={selectConversation}
                onAcceptRequest={acceptRequest}
                onDeclineRequest={declineRequest}
              />
            </motion.div>
          ) : (
            <motion.div
              key="window"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              className="h-[calc(100vh-4rem)] md:h-screen"
            >
              {activeConversation ? (
                <ChatWindow
                  conversation={activeConversation}
                  socket={socket}
                  currentUserId={session.user.id}
                  hasLellyPass={lellyPass}
                  onBack={() => {
                    setMobileView('list')
                    setActiveId(null)
                  }}
                  onConversationChanged={loadData}
                />
              ) : (
                <EmptyState onBack={() => setMobileView('list')} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Desktop: chat window ─── */}
      <main className="hidden md:flex md:flex-1 md:flex-col">
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            socket={socket}
            currentUserId={session.user.id}
            hasLellyPass={lellyPass}
            onBack={() => setActiveId(null)}
            onConversationChanged={loadData}
          />
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  )
}

function EmptyState({ onBack }: { onBack?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-hero-dark p-8 text-center">
      {onBack && (
        <button
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-cream/5 px-3 py-1.5 font-body text-xs text-cream/60 md:hidden"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
      )}
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-warm-rose/10">
        <MessageCircle className="h-10 w-10 text-warm-rose-light/50" />
      </div>
      <h2 className="font-display text-xl font-bold text-cream mb-1">
        Your conversations
      </h2>
      <p className="font-body text-sm text-cream/50 max-w-xs">
        Select a conversation to start chatting, or send a chat request from Discover
        to connect with someone new.
      </p>
    </div>
  )
}
