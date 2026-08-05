'use client'

import { useEffect, useState } from 'react'

/**
 * LivePrice — Shows USD price (primary) with live ZAR conversion.
 *
 * Fetches the current USD→ZAR rate from /api/exchange-rate (Frankfurter.app).
 * Shows a subtle loading state, then the ZAR equivalent rounded to nearest rand.
 * Falls back gracefully if the API is unreachable.
 *
 * CONTRAST RULE (critical):
 *   - tone="light"  → dark text on LIGHT backgrounds (ivory, white, cream)
 *   - tone="dark"   → bright text on DARK backgrounds (espresso, deep rose, hero-dark)
 *   NEVER use tone="light" on a dark background — text will be invisible.
 *
 * Per docs rule: USD is the primary price — users send exactly this amount.
 * ZAR is shown only as a convenience reference.
 */
export function LivePrice({
  usd,
  variant = 'inline',
  tone = 'light',
  label,
}: {
  usd: number
  variant?: 'inline' | 'stacked' | 'badge'
  tone?: 'light' | 'dark'
  label?: string
}) {
  const [zar, setZar] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/exchange-rate')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (typeof data.rate === 'number') {
          setZar(Math.round(usd * data.rate))
        }
      })
      .catch(() => {
        // Silent fallback — don't break the UI over exchange rates
      })
    return () => {
      cancelled = true
    }
  }, [usd])

  const usdFormatted = `$${usd.toFixed(2)} USD`

  // Tone-aware color tokens
  // LIGHT tone (on ivory/white/cream bg): dark text
  // DARK tone (on espresso/deep-rose/hero-dark bg): bright text
  const primary =
    tone === 'dark' ? 'text-cream' : 'text-soft-charcoal'
  const secondary = tone === 'dark' ? 'text-cream/60' : 'text-muted-foreground'

  if (variant === 'badge') {
    return (
      <span className="inline-flex items-baseline gap-1.5">
        <span className={`font-display font-bold ${primary}`}>{usdFormatted}</span>
        {zar !== null && (
          <span className={`font-body text-xs ${secondary}`}>≈ R{zar}</span>
        )}
      </span>
    )
  }

  if (variant === 'stacked') {
    return (
      <div className="flex flex-col">
        <span className={`font-display text-3xl sm:text-4xl font-bold ${primary}`}>
          {usdFormatted}
        </span>
        {zar !== null ? (
          <span className={`font-body text-sm ${secondary} mt-0.5`}>
            ≈ R{zar} ZAR <span className="text-xs opacity-60">(live rate)</span>
          </span>
        ) : (
          <span className={`font-body text-sm ${secondary} mt-0.5 animate-pulse-soft`}>
            <span className="inline-block h-3 w-16 bg-current opacity-20 rounded" />
          </span>
        )}
      </div>
    )
  }

  // inline (default)
  return (
    <span className="inline-flex items-baseline gap-1.5 flex-wrap">
      <span className={`font-display font-semibold ${primary}`}>{usdFormatted}</span>
      {zar !== null && (
        <span className={`font-body text-sm ${secondary}`}>(≈ R{zar})</span>
      )}
      {label && <span className={`font-body text-sm ${secondary}`}>{label}</span>}
    </span>
  )
}
