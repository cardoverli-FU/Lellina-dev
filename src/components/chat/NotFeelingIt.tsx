'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.14 — "Not Feeling It" Kind Exit
//  One-tap polite exit. Sends a pre-written kind message + closes chat.
//  Replaces ghosting with grace.
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { Heart, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

const PRESET_MESSAGES = [
  "Hey, I don't think we're a match. Wishing you well! 💛",
  "I've enjoyed chatting, but I don't feel the spark. You deserve someone who's all in. 💛",
  "Thank you for the conversation — I don't think we're the right fit. Take care! 💛",
  "You're lovely, but I'm not feeling the connection. Wishing you the best! 💛",
]

interface NotFeelingItProps {
  conversationId: string
  onExited: () => void
}

export function NotFeelingIt({ conversationId, onExited }: NotFeelingItProps) {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)

  async function sendExit(message?: string) {
    setSending(true)
    try {
      const res = await fetch(`/api/chat/conversations/${conversationId}/not-feeling-it`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message ? { message } : {}),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        toast.error(data.error || 'Could not send')
        return
      }
      toast.success('Kind message sent. Chat closed. 💛')
      setOpen(false)
      onExited()
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
        className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 font-body text-[11px] text-cream/70 transition-all hover:border-warm-rose/30 hover:text-cream"
      >
        <Heart className="h-3 w-3" />
        Not feeling it
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-hero-dark/80 backdrop-blur-sm p-4"
            onClick={() => !sending && setOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative w-full max-w-md rounded-3xl border border-cream/10 bg-soft-charcoal p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => !sending && setOpen(false)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream/5 hover:bg-cream/10"
              >
                <X className="h-4 w-4 text-cream/60" />
              </button>

              <div className="mb-4 text-center">
                <div className="mb-2 text-3xl">💛</div>
                <h3 className="font-display text-lg font-bold text-cream">
                  Not feeling it?
                </h3>
                <p className="font-body text-xs text-cream/60 mt-1">
                  That&apos;s okay. Let her down kindly — no ghosting.
                </p>
              </div>

              <div className="space-y-2">
                {PRESET_MESSAGES.map((msg) => (
                  <button
                    key={msg}
                    disabled={sending}
                    onClick={() => sendExit(msg)}
                    className="block w-full rounded-2xl border border-cream/10 bg-cream/5 p-3 text-left font-body text-xs text-cream/80 transition-all hover:border-warm-rose/30 hover:bg-warm-rose/10 disabled:opacity-50"
                  >
                    {msg}
                  </button>
                ))}
              </div>

              <button
                disabled={sending}
                onClick={() => sendExit()}
                className="mt-3 w-full rounded-full bg-warm-rose py-2.5 font-body text-xs font-semibold text-white transition-all hover:bg-warm-rose-dark disabled:opacity-50"
              >
                {sending ? 'Sending…' : 'Send & close chat'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
