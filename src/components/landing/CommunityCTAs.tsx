'use client'

import { motion } from 'framer-motion'
import { Send, MessageCircle, Share2, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  TELEGRAM_CHANNEL_URL,
  WHATSAPP_CHANNEL_URL,
  APP,
  SECTION_IDS,
} from '@/lib/lellina/constants'

/**
 * CommunityCTAs (Tasks 1.7 + 1.8 + 1.9)
 * Telegram CTA + WhatsApp CTA + Share CTA.
 * Framing: "Find your galz before we launch."
 */
export function CommunityCTAs() {
  return (
    <section
      id={SECTION_IDS.community}
      className="relative bg-blush-subtle py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <p className="font-body text-sm uppercase tracking-[0.2em] text-warm-rose mb-3">
            Before we launch
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-soft-charcoal leading-tight">
            Find your <span className="text-lellina-gradient">galz</span> early.
          </h2>
          <p className="mt-5 font-body text-lg text-muted-foreground max-w-xl mx-auto">
            The first 500 are already gathering. Don&apos;t wait for the door to open —
            be on the inside when it does.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <TelegramCTA />
          <WhatsAppCTA />
        </div>

        <div className="mt-8">
          <ShareCTA />
        </div>
      </div>
    </section>
  )
}

function TelegramCTA() {
  return (
    <motion.a
      href={TELEGRAM_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="group relative flex flex-col gap-4 rounded-3xl border border-warm-rose/20 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-warm-rose/40"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#229ED9]/10 text-[#229ED9] transition-transform group-hover:scale-110">
        <Send className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold text-soft-charcoal">Telegram</h3>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Early updates from the founder. First dibs when the door opens.
        </p>
      </div>
      <span className="inline-flex items-center gap-1 font-body text-sm font-medium text-warm-rose-dark">
        Join the channel
        <Send className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.a>
  )
}

function WhatsAppCTA() {
  return (
    <motion.a
      href={WHATSAPP_CHANNEL_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="group relative flex flex-col gap-4 rounded-3xl border border-sage/20 bg-white p-7 shadow-sm transition-all hover:shadow-md hover:-translate-y-1 hover:border-sage/40"
    >
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366] transition-transform group-hover:scale-110">
        <MessageCircle className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-display text-2xl font-bold text-soft-charcoal">WhatsApp</h3>
        <p className="mt-1 font-body text-sm text-muted-foreground">
          Whisper network. Real talk. The galz you actually know.
        </p>
      </div>
      <span className="inline-flex items-center gap-1 font-body text-sm font-medium text-sage">
        Follow the channel
        <MessageCircle className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
      </span>
    </motion.a>
  )
}

function ShareCTA() {
  const [copied, setCopied] = useState(false)

  const shareText = `${APP.name} — ${APP.tagline}. The only verified women-only space. ${APP.url}`
  const shareData = {
    title: `${APP.name} — ${APP.tagline}`,
    text: shareText,
    url: APP.url,
  }

  const handleShare = async () => {
    // 1. Try native Web Share API (mobile-first)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // User cancelled or share failed — fall through to clipboard
      }
    }
    // 2. Clipboard fallback
    try {
      await navigator.clipboard.writeText(`${shareText} ${APP.url}`)
      setCopied(true)
      toast.success('Link copied. Share it with your galz.')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Could not copy. Try long-pressing the link.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-4 rounded-3xl border border-gold/20 bg-gradient-to-br from-cream to-white p-7 text-center sm:flex-row sm:justify-between sm:text-left"
    >
      <div className="flex items-center gap-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10 text-gold-deep">
          <Share2 className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-soft-charcoal">
            Bring your galz with you
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            The more galz you bring, the more galz there are for everyone.
          </p>
        </div>
      </div>
      <button
        onClick={handleShare}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-soft-charcoal px-6 font-body text-sm font-medium text-white transition-all hover:bg-charcoal-soft active:scale-95"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-sage-light" />
            Copied
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share {APP.name}
          </>
        )}
      </button>
    </motion.div>
  )
}
