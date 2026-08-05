import Link from 'next/link'
import { Logo } from '@/components/ui/Logo'
import { Send, MessageCircle, Heart, Globe } from 'lucide-react'
import { TELEGRAM_CHANNEL_URL, WHATSAPP_CHANNEL_URL, APP } from '@/lib/lellina/constants'

/**
 * Footer — Dark premium footer for a strong VIP close.
 * Sticks to bottom on short pages, pushed down naturally on long pages.
 */
export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="layout-footer bg-soft-charcoal border-t border-charcoal-soft">
      <div className="mx-auto max-w-7xl px-4 py-10 pb-28 lg:pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Logo size="sm" variant="dark" />
            <p className="font-body text-sm text-cream/60 max-w-xs">
              {APP.tagline}. The only verified women-only space.
            </p>
          </div>

          {/* Community */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream">
              Find your galz
            </h3>
            <Link
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-cream/60 transition-colors hover:text-warm-rose-light"
            >
              <Send className="h-4 w-4" />
              Telegram
            </Link>
            <Link
              href={WHATSAPP_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-body text-sm text-cream/60 transition-colors hover:text-warm-rose-light"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Link>
          </div>

          {/* Roots */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream">
              Roots
            </h3>
            <p className="inline-flex items-center gap-2 font-body text-sm text-cream/60">
              <Globe className="h-4 w-4 text-warm-rose-light" />
              Built for galz, everywhere
            </p>
            <p className="inline-flex items-center gap-2 font-body text-sm text-cream/60">
              <Heart className="h-4 w-4 text-warm-rose-light" />
              For galz, by galz
            </p>
          </div>

          {/* Promise */}
          <div className="flex flex-col gap-3">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-cream">
              The promise
            </h3>
            <p className="font-body text-sm text-cream/60">
              No men. No bots. No catfish. Just real women looking for real connection.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-charcoal-soft pt-6 sm:flex-row">
          <p className="font-body text-xs text-cream/40">
            © {year} {APP.name}. {APP.tagline}. All rights reserved.
          </p>
          <p className="font-body text-xs text-gold-light/70 italic">
            For her. By her. Only her.
          </p>
        </div>
      </div>
    </footer>
  )
}
