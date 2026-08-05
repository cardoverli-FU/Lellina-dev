'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.8 — Chat Request Dialog
//  Modal to send a chat request from Discover profile cards.
//  Shows daily limit remaining + Lelly Pass upsell if limit reached.
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Sparkles, MessageSquarePlus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

interface ChatRequestDialogProps {
  toUserId: string
  toUserName: string
  toUserPhoto?: string
  open: boolean
  onClose: () => void
  onSent: () => void
}

export function ChatRequestDialog({
  toUserId,
  toUserName,
  toUserPhoto,
  open,
  onClose,
  onSent,
}: ChatRequestDialogProps) {
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [limits, setLimits] = useState<{
    remaining: number
    hasLellyPass: boolean
    isUnlimited: boolean
  } | null>(null)

  useEffect(() => {
    if (open) {
      fetch('/api/chat/limits')
        .then((r) => r.json())
        .then(setLimits)
        .catch(() => {})
      setMessage('')
    }
  }, [open])

  async function sendRequest() {
    if (limits && limits.remaining === 0 && !limits.isUnlimited) {
      toast.error('Daily limit reached — secure your Lelly Pass for unlimited requests')
      return
    }
    setSending(true)
    try {
      const res = await fetch('/api/chat/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toUserId, message: message.trim() || undefined }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data.error || 'Could not send request')
        return
      }
      toast.success(`Chat request sent to ${toUserName} 💛`)
      onSent()
      onClose()
    } catch {
      toast.error('Network error')
    } finally {
      setSending(false)
    }
  }

  const limitReached = limits && !limits.isUnlimited && limits.remaining === 0

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-hero-dark/80 backdrop-blur-sm p-4"
          onClick={onClose}
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
              onClick={onClose}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream/5 hover:bg-cream/10"
            >
              <X className="h-4 w-4 text-cream/60" />
            </button>

            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              {toUserPhoto ? (
                <img
                  src={toUserPhoto}
                  alt={toUserName}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warm-rose/20">
                  <span className="font-display text-lg font-bold text-warm-rose-light">
                    {toUserName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-display text-base font-bold text-cream">
                  Chat with {toUserName}
                </h3>
                <p className="font-body text-[11px] text-cream/50">
                  Send a request — she&apos;ll accept to start chatting
                </p>
              </div>
            </div>

            {limitReached ? (
              /* ─── Limit reached: Lelly upsell ─── */
              <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4 text-center">
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-gold-light" />
                <p className="font-display text-sm font-semibold text-cream">
                  You&apos;ve used your daily chat request
                </p>
                <p className="font-body text-[11px] text-cream/60 mt-1">
                  Free members get 1 chat request per day. Secure your Lelly Pass
                  for unlimited requests — and unlock unblurred photos.
                </p>
                <a
                  href="/#lelly"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warm-rose px-4 py-2 font-body text-xs font-semibold text-white transition-all hover:bg-warm-rose-dark hover:scale-[1.03]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Secure your Lelly Pass
                </a>
              </div>
            ) : (
              /* ─── Normal: message input ─── */
              <>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, 280))}
                  placeholder={`Say hi to ${toUserName}… (optional)`}
                  rows={3}
                  className="w-full resize-none rounded-2xl border border-cream/10 bg-cream/5 px-4 py-3 font-body text-sm text-cream placeholder:text-cream/30 focus:border-warm-rose/30 focus:outline-none focus:ring-1 focus:ring-warm-rose/20"
                />
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-body text-[10px] text-cream/30">
                    {message.length}/280
                  </span>
                  {limits && !limits.isUnlimited && (
                    <span className="font-body text-[10px] text-cream/40">
                      {limits.remaining} request{limits.remaining !== 1 ? 's' : ''} left today
                    </span>
                  )}
                  {limits?.isUnlimited && (
                    <span className="font-body text-[10px] text-gold-light">
                      ✨ Lelly Pass · Unlimited
                    </span>
                  )}
                </div>

                <button
                  disabled={sending}
                  onClick={sendRequest}
                  className="mt-4 w-full rounded-full bg-warm-rose py-3 font-body text-sm font-semibold text-white transition-all hover:bg-warm-rose-dark hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {sending ? (
                    'Sending…'
                  ) : (
                    <span className="inline-flex items-center gap-2">
                      <MessageSquarePlus className="h-4 w-4" />
                      Send chat request
                    </span>
                  )}
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
