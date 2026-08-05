'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.16 — Ghost Badge
//  Displays the response-rate tier as a colored pill on profile cards
//  and chat headers.
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { GhostBadge as GhostBadgeType, GHOST_BADGES } from '@/lib/ghost-badges'

interface GhostBadgeProps {
  tier: string | null
  size?: 'sm' | 'md'
  showLabel?: boolean
}

export function GhostBadge({ tier, size = 'sm', showLabel = true }: GhostBadgeProps) {
  if (!tier) return null

  const meta = GHOST_BADGES[tier as keyof typeof GHOST_BADGES]
  if (!meta) return null

  const padding = size === 'md' ? 'px-2.5 py-1' : 'px-2 py-0.5'
  const textSize = size === 'md' ? 'text-[11px]' : 'text-[10px]'

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full ${meta.bgColor} ${padding} ${textSize} font-body font-medium ${meta.color}`}
    >
      {tier === 'FAST' && <span>⚡</span>}
      {tier === 'SLOW' && <span>🐌</span>}
      {tier === 'GHOST' && <span>🚩</span>}
      {tier === 'NEW' && <span>✨</span>}
      {showLabel && meta.label}
    </motion.span>
  )
}

export type { GhostBadgeType }
