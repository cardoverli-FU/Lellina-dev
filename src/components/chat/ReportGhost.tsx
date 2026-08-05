'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.17 — Report Ghost
//  After 7+ days of silence, report the other person as a ghost.
//  Closes the conversation. Accumulated flags → ghost reputation.
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { Flag, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ReportGhostProps {
  conversationId: string
  onReported: () => void
}

export function ReportGhost({ conversationId, onReported }: ReportGhostProps) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)

  async function report() {
    setSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/flag`, {
        method: 'POST',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Cannot report right now')
        return
      }
      toast.success('Reported. You can move on with peace of mind. 💛')
      setOpen(false)
      onReported()
    } catch {
      toast.error('Network error')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-warm-rose/20 bg-warm-rose/5 px-3 py-1.5 font-body text-[11px] text-warm-rose-light transition-all hover:border-warm-rose/40 hover:bg-warm-rose/10"
      >
        <Flag className="h-3 w-3" />
        Report ghosting
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-hero-dark/80 backdrop-blur-sm p-4"
            onClick={() => !sending && setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm rounded-3xl border border-warm-rose/20 bg-soft-charcoal p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !sending && setOpen(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream/5 hover:bg-cream/10"
              >
                <X className="h-4 w-4 text-cream/60" />
              </button>

              <div className="mb-4 text-center">
                <div className="mb-2 text-3xl">🚩</div>
                <h3 className="font-display text-lg font-bold text-cream">
                  Report ghosting?
                </h3>
                <p className="font-body text-xs text-cream/60 mt-2">
                  This closes the chat. She&apos;ll get a ghost flag on her profile.
                  Only report if she&apos;s been silent for 7+ days after your last message.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  disabled={sending}
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-full border border-cream/15 bg-cream/5 py-2.5 font-body text-xs text-cream/70 transition-all hover:bg-cream/10"
                >
                  Cancel
                </button>
                <button
                  disabled={sending}
                  onClick={report}
                  className="flex-1 rounded-full bg-warm-rose py-2.5 font-body text-xs font-semibold text-white transition-all hover:bg-warm-rose-dark disabled:opacity-50"
                >
                  {sending ? 'Reporting…' : 'Report'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
