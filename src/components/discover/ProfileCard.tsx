'use client'

import { motion } from 'framer-motion'
import { Heart, X, MapPin, BadgeCheck, MessageSquarePlus } from 'lucide-react'
import { useState } from 'react'
import { OnlineStatus } from './OnlineStatus'
import { ChatRequestDialog } from '@/components/chat/ChatRequestDialog'
import { GhostBadge } from '@/components/chat/GhostBadge'

// ─── Types ───────────────────────────────────────────────────────────
export interface DiscoverProfile {
  id: string
  userId: string
  displayName: string | null
  age: number | null
  bio: string | null
  photoUrls: string[]
  isOnline: boolean
  lastActiveAt: string | null
  isFounder: boolean
  responseRateTier: string | null
  isVerified: boolean
  district: { name: string; region: string; country: string } | null
  tribeTags: { id: string; name: string; category: string }[]
}

interface ProfileCardProps {
  profile: DiscoverProfile
  onLike: (userId: string) => void
  onPass: (userId: string) => void
  busy?: boolean
}

/**
 * Phase 4.2 + 5.8 — Profile card for the discover grid.
 * Shows photo (or initials fallback), name, age, district, tribe tags,
 * online status, founder badge, like/pass buttons, and chat request button.
 */
export function ProfileCard({ profile, onLike, onPass, busy }: ProfileCardProps) {
  const initials = (profile.displayName || '?').charAt(0).toUpperCase()
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-cream/10 bg-cream/5"
    >
      {/* ─── Photo / Avatar ─── */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {profile.photoUrls.length > 0 ? (
          <img
            src={profile.photoUrls[0]}
            alt={profile.displayName || 'Profile photo'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-warm-rose/25 to-gold/10">
            <span className="font-display text-6xl font-black text-warm-rose-light/50">
              {initials}
            </span>
          </div>
        )}

        {/* Gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Online dot */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">
          <OnlineStatus isOnline={profile.isOnline} />
          <span className="font-body text-[10px] text-cream/90">
            {profile.isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {/* Founder badge */}
        {profile.isFounder && (
          <div className="absolute top-3 left-3 rounded-full bg-gold px-2.5 py-0.5">
            <span className="font-display text-[10px] font-bold text-soft-charcoal">Founder</span>
          </div>
        )}

        {/* Name + age overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="flex items-baseline gap-1.5">
            <h3 className="font-display text-lg font-bold text-cream truncate">
              {profile.displayName || 'Anonymous'}
            </h3>
            {profile.age && (
              <span className="font-body text-sm text-cream/70">{profile.age}</span>
            )}
            {profile.isVerified && (
              <BadgeCheck className="h-3.5 w-3.5 text-gold-light flex-shrink-0" />
            )}
          </div>
          {profile.district && (
            <div className="flex items-center gap-1 text-cream/70">
              <MapPin className="h-3 w-3" />
              <span className="font-body text-xs truncate">{profile.district.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Info section ─── */}
      <div className="p-3 space-y-2.5">
        {/* Tribe tags */}
        {profile.tribeTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {profile.tribeTags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-warm-rose/15 px-2 py-0.5 font-body text-[10px] text-warm-rose-light"
              >
                {tag.name}
              </span>
            ))}
            {profile.tribeTags.length > 3 && (
              <span className="rounded-full bg-cream/10 px-2 py-0.5 font-body text-[10px] text-cream/50">
                +{profile.tribeTags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Ghost badge (response rate tier) */}
        {profile.responseRateTier && (
          <GhostBadge tier={profile.responseRateTier} />
        )}

        {/* Like / Pass / Chat buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => onPass(profile.userId)}
            disabled={busy}
            className="flex h-10 flex-1 items-center justify-center rounded-full border border-cream/25 bg-cream/10 transition-all hover:border-cream/50 hover:bg-cream/20 disabled:opacity-50"
            aria-label="Pass"
          >
            <X className="h-4 w-4 text-cream" />
          </button>
          <button
            onClick={() => onLike(profile.userId)}
            disabled={busy}
            className="flex h-10 flex-1 items-center justify-center rounded-full bg-warm-rose transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            aria-label="Like"
          >
            <Heart className="h-4 w-4 text-white" />
          </button>
          <button
            onClick={() => setChatOpen(true)}
            disabled={busy}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-gold/30 bg-gold/10 transition-all hover:border-gold/50 hover:bg-gold/20 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
            aria-label="Send chat request"
            title="Send chat request"
          >
            <MessageSquarePlus className="h-4 w-4 text-gold-light" />
          </button>
        </div>
      </div>

      {/* Chat request dialog */}
      <ChatRequestDialog
        toUserId={profile.userId}
        toUserName={profile.displayName || 'Anonymous'}
        toUserPhoto={profile.photoUrls[0]}
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        onSent={() => {}}
      />
    </motion.div>
  )
}
