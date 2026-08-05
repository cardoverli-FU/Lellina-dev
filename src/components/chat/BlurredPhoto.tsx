'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.6 — Blurred Photo (Free users receive blurred)
//  Free users see a blurred photo with a "Unlock with Lelly Pass" overlay.
//  Lelly users see the photo unblurred (handled by parent via hasLellyPass).
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'

interface BlurredPhotoProps {
  photoUrl: string
  onUnlock?: () => void // opens Lelly Pass modal
}

export function BlurredPhoto({ photoUrl, onUnlock }: BlurredPhotoProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Blurred photo */}
      <img
        src={photoUrl}
        alt="Locked photo"
        className="h-64 w-full object-cover blur-2xl scale-110"
        draggable={false}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-hero-dark/60" />

      {/* Unlock CTA */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-warm-rose/30 backdrop-blur-sm"
        >
          <Lock className="h-6 w-6 text-cream" />
        </motion.div>
        <p className="font-display text-sm font-semibold text-cream text-center">
          Photo unlocked with Lelly Pass
        </p>
        <p className="font-body text-[11px] text-cream/60 text-center max-w-[200px]">
          She sent you a photo. Secure your Lelly Pass to see it.
        </p>
        {onUnlock && (
          <button
            onClick={onUnlock}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-warm-rose px-4 py-2 font-body text-xs font-semibold text-white transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Unlock
          </button>
        )}
      </div>
    </div>
  )
}
