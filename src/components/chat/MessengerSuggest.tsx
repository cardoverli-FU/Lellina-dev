'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.10 — Messenger Suggest
//  In-chat prompt to move to Telegram/WhatsApp/Signal for deeper connection.
//  Shown after a handle request is accepted (handles are visible).
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { MessageCircle, Send, Phone } from 'lucide-react'

interface MessengerSuggestProps {
  handles: {
    telegram?: string | null
    instagram?: string | null
    signal?: string | null
    otherSocial?: string | null
  }
}

export function MessengerSuggest({ handles }: MessengerSuggestProps) {
  const hasAny = handles.telegram || handles.instagram || handles.signal || handles.otherSocial
  if (!hasAny) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gold/20 bg-gold/5 p-3"
    >
      <p className="font-body text-[11px] text-gold-light mb-2">
        ✨ You&apos;ve shared handles. Take it deeper when you&apos;re ready:
      </p>
      <div className="flex flex-wrap gap-2">
        {handles.telegram && (
          <a
            href={`https://t.me/${handles.telegram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#229ED9]/20 px-3 py-1.5 font-body text-[11px] text-cream transition-all hover:bg-[#229ED9]/30 hover:scale-[1.03]"
          >
            <Send className="h-3 w-3" />
            Telegram
          </a>
        )}
        {handles.signal && (
          <a
            href={`https://signal.me/#p/${handles.signal}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#3A76F0]/20 px-3 py-1.5 font-body text-[11px] text-cream transition-all hover:bg-[#3A76F0]/30 hover:scale-[1.03]"
          >
            <MessageCircle className="h-3 w-3" />
            Signal
          </a>
        )}
        {handles.instagram && (
          <a
            href={`https://instagram.com/${handles.instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E1306C]/20 px-3 py-1.5 font-body text-[11px] text-cream transition-all hover:bg-[#E1306C]/30 hover:scale-[1.03]"
          >
            <Phone className="h-3 w-3" />
            Instagram
          </a>
        )}
        {handles.otherSocial && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cream/10 px-3 py-1.5 font-body text-[11px] text-cream/70">
            {handles.otherSocial}
          </span>
        )}
      </div>
    </motion.div>
  )
}
