'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.15 — Ghost Nudge
//  After 3+ days of silence, the sender can tap "Still there? 👋"
//  Sends ONE nudge. Can't spam (1 per 24h).
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { Hand } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface GhostNudgeProps {
  conversationId: string
  onNudged: () => void
}

export function GhostNudge({ conversationId, onNudged }: GhostNudgeProps) {
  const [sending, setSending] = useState(false)

  async function sendNudge() {
    setSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/nudge`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Cannot nudge right now')
        return
      }
      toast.success('Nudge sent 👋')
      onNudged()
    } catch {
      toast.error('Network error')
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      disabled={sending}
      onClick={sendNudge}
      className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-3 py-1.5 font-body text-[11px] text-gold-light transition-all hover:bg-gold/25 hover:scale-[1.03] active:scale-95 disabled:opacity-50"
    >
      <Hand className="h-3 w-3" />
      {sending ? 'Sending…' : 'Still there? 👋'}
    </motion.button>
  )
}
