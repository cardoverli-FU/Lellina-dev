'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.4 — Handle Request Bar
//  Social handles (Telegram/Instagram/Signal) hidden until mutual approval.
//  States: none → request sent → request received → accepted (handles shown)
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { Mail, Check, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { MessengerSuggest } from './MessengerSuggest'

interface HandleRequestBarProps {
  conversationId: string
  // status: null (no request) | 'PENDING_FROM_ME' | 'PENDING_FROM_THEM' | 'ACCEPTED'
  status: 'NONE' | 'PENDING_FROM_ME' | 'PENDING_FROM_THEM' | 'ACCEPTED'
  handles?: {
    telegram?: string | null
    instagram?: string | null
    signal?: string | null
    otherSocial?: string | null
  }
  onUpdate: () => void
}

export function HandleRequestBar({
  conversationId,
  status,
  handles,
  onUpdate,
}: HandleRequestBarProps) {
  const [busy, setBusy] = useState(false)

  async function action(action: 'request' | 'accept' | 'decline') {
    setBusy(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/handle-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not complete')
        return
      }
      if (action === 'request') toast.success('Handle request sent 💌')
      else if (action === 'accept') toast.success('Handles shared ✨')
      else toast.success('Handle request declined')
      onUpdate()
    } catch {
      toast.error('Network error')
    } finally {
      setBusy(false)
    }
  }

  // ACCEPTED: show handles + messenger suggest
  if (status === 'ACCEPTED' && handles) {
    return (
      <div className="px-3 py-2">
        <MessengerSuggest handles={handles} />
      </div>
    )
  }

  // PENDING_FROM_THEM: accept/decline
  if (status === 'PENDING_FROM_THEM') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-2 border-b border-cream/10 bg-gold/5 px-3 py-2"
      >
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gold-light" />
          <span className="font-body text-[11px] text-cream/80">
            She wants to share social handles
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            disabled={busy}
            onClick={() => action('accept')}
            className="inline-flex items-center gap-1 rounded-full bg-warm-rose px-3 py-1.5 font-body text-[11px] font-semibold text-white transition-all hover:bg-warm-rose-dark disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
            Accept
          </button>
          <button
            disabled={busy}
            onClick={() => action('decline')}
            className="inline-flex items-center gap-1 rounded-full bg-cream/10 px-3 py-1.5 font-body text-[11px] text-cream/70 transition-all hover:bg-cream/20 disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            Decline
          </button>
        </div>
      </motion.div>
    )
  }

  // PENDING_FROM_ME: waiting
  if (status === 'PENDING_FROM_ME') {
    return (
      <div className="flex items-center justify-center gap-2 border-b border-cream/10 bg-cream/5 px-3 py-2">
        <span className="font-body text-[11px] text-cream/50">
          💌 Handle request sent — waiting for a yes
        </span>
      </div>
    )
  }

  // NONE: offer to request
  return (
    <div className="flex items-center justify-center border-b border-cream/10 px-3 py-2">
      <button
        disabled={busy}
        onClick={() => action('request')}
        className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 font-body text-[11px] text-cream/70 transition-all hover:border-gold/30 hover:text-cream disabled:opacity-50"
      >
        <Mail className="h-3 w-3" />
        Ask to share social handles
      </button>
    </div>
  )
}
