'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.2 — Conversation List
//  Sidebar list of conversations + incoming chat requests tab.
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { MessageCircle, Inbox, ArrowLeft } from 'lucide-react'
import { useEffect, useState } from 'react'
import { GhostBadge } from './GhostBadge'

export interface ConversationItem {
  id: string
  status: string
  lastMessageAt: string | null
  lastMessagePreview: string | null
  lastMessageSender: string | null
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

export interface ChatRequestItem {
  id: string
  message: string | null
  createdAt: string
  from: {
    id: string
    profile: {
      displayName: string | null
      age: number | null
      photoUrls: string
      district: { name: string; region: string } | null
      responseRateTier: string | null
      isOnline: boolean
      lastActiveAt: string | null
    } | null
  }
}

interface ConversationListProps {
  conversations: ConversationItem[]
  requests: ChatRequestItem[]
  activeId: string | null
  onSelect: (id: string) => void
  onAcceptRequest: (id: string) => void
  onDeclineRequest: (id: string) => void
  onBack?: () => void // mobile back
}

export function ConversationList({
  conversations,
  requests,
  activeId,
  onSelect,
  onAcceptRequest,
  onDeclineRequest,
  onBack,
}: ConversationListProps) {
  const [tab, setTab] = useState<'chats' | 'requests'>('chats')

  // Auto-switch to requests tab when new ones arrive
  useEffect(() => {
    if (requests.length > 0 && tab === 'chats' && conversations.length === 0) {
      setTab('requests')
    }
  }, [requests.length, conversations.length, tab])

  return (
    <div className="flex h-full flex-col bg-hero-dark">
      {/* ─── Header ─── */}
      <div className="flex items-center gap-3 border-b border-cream/10 px-4 py-4">
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-cream/5 text-cream/60 hover:bg-cream/10 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}
        <h2 className="font-display text-lg font-bold text-cream">Chat</h2>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex border-b border-cream/10">
        <button
          onClick={() => setTab('chats')}
          className={`flex-1 py-2.5 font-body text-xs font-medium transition-colors ${
            tab === 'chats'
              ? 'text-warm-rose-light border-b-2 border-warm-rose'
              : 'text-cream/40 hover:text-cream/60'
          }`}
        >
          <MessageCircle className="h-3.5 w-3.5 inline mr-1" />
          Chats
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`flex-1 py-2.5 font-body text-xs font-medium transition-colors relative ${
            tab === 'requests'
              ? 'text-warm-rose-light border-b-2 border-warm-rose'
              : 'text-cream/40 hover:text-cream/60'
          }`}
        >
          <Inbox className="h-3.5 w-3.5 inline mr-1" />
          Requests
          {requests.length > 0 && (
            <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warm-rose px-1 text-[9px] font-bold text-white">
              {requests.length}
            </span>
          )}
        </button>
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {tab === 'chats' && (
          <>
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="mb-3 text-4xl">💬</div>
                <p className="font-body text-sm text-cream/50">
                  No conversations yet.
                </p>
                <p className="font-body text-[11px] text-cream/30 mt-1">
                  Send a chat request from Discover to start talking.
                </p>
              </div>
            ) : (
              conversations.map((conv, i) => (
                <motion.button
                  key={conv.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.3) }}
                  onClick={() => onSelect(conv.id)}
                  className={`flex w-full items-center gap-3 border-b border-cream/5 px-4 py-3 text-left transition-colors ${
                    activeId === conv.id ? 'bg-warm-rose/10' : 'hover:bg-cream/5'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {conv.otherUser.photoUrls.length > 0 ? (
                      <img
                        src={conv.otherUser.photoUrls[0]}
                        alt={conv.otherUser.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-rose/20">
                        <span className="font-display text-lg font-bold text-warm-rose-light">
                          {conv.otherUser.displayName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    {conv.otherUser.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-hero-dark bg-sage" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-display text-sm font-semibold text-cream truncate">
                          {conv.otherUser.displayName}
                        </span>
                        {conv.otherUser.age && (
                          <span className="font-body text-[11px] text-cream/40">
                            {conv.otherUser.age}
                          </span>
                        )}
                      </div>
                      {conv.lastMessageAt && (
                        <span className="font-body text-[10px] text-cream/30 flex-shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleTimeString('en', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <GhostBadge tier={conv.otherUser.responseRateTier} showLabel={false} />
                      <p className="font-body text-xs text-cream/50 truncate">
                        {conv.status === 'EXITED' && conv.lastMessagePreview
                          ? conv.lastMessagePreview
                          : conv.lastMessagePreview || 'Say hi 👋'}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </>
        )}

        {tab === 'requests' && (
          <>
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="mb-3 text-4xl">📭</div>
                <p className="font-body text-sm text-cream/50">
                  No chat requests yet.
                </p>
              </div>
            ) : (
              requests.map((req, i) => {
                const profile = req.from.profile
                const photos = profile?.photoUrls ? JSON.parse(profile.photoUrls) : []
                return (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    className="border-b border-cream/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        {photos.length > 0 ? (
                          <img
                            src={photos[0]}
                            alt={profile?.displayName || 'Profile'}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-rose/20">
                            <span className="font-display text-lg font-bold text-warm-rose-light">
                              {(profile?.displayName || '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-display text-sm font-semibold text-cream">
                            {profile?.displayName || 'Anonymous'}
                          </span>
                          {profile?.age && (
                            <span className="font-body text-[11px] text-cream/40">
                              {profile.age}
                            </span>
                          )}
                          {profile?.district && (
                            <span className="font-body text-[10px] text-cream/30">
                              · {profile.district.name}
                            </span>
                          )}
                        </div>
                        {req.message && (
                          <p className="font-body text-xs text-cream/60 mt-0.5 line-clamp-2">
                            &ldquo;{req.message}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => onAcceptRequest(req.id)}
                        className="flex-1 rounded-full bg-warm-rose py-2 font-body text-xs font-semibold text-white transition-all hover:bg-warm-rose-dark hover:scale-[1.02] active:scale-95"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => onDeclineRequest(req.id)}
                        className="flex-1 rounded-full border border-cream/15 bg-cream/5 py-2 font-body text-xs text-cream/60 transition-all hover:bg-cream/10"
                      >
                        Decline
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}
