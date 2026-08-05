// ════════════════════════════════════════════════════════════════════
//  Phase 5.16 — Ghost Badge metadata (client-safe, no DB imports)
//  Shared between server lib (ghost-score.ts) and client components.
// ════════════════════════════════════════════════════════════════════

export type GhostTier = 'NEW' | 'FAST' | 'SLOW' | 'GHOST'

export interface GhostBadgeMeta {
  tier: GhostTier
  label: string
  description: string
  color: string // tailwind text class
  bgColor: string // tailwind bg class
}

export const GHOST_BADGES: Record<GhostTier, GhostBadgeMeta> = {
  NEW: {
    tier: 'NEW',
    label: 'New here',
    description: 'No reply history yet',
    color: 'text-cream/70',
    bgColor: 'bg-cream/10',
  },
  FAST: {
    tier: 'FAST',
    label: 'Replies within 24h',
    description: 'Consistently quick to reply',
    color: 'text-sage-light',
    bgColor: 'bg-sage/20',
  },
  SLOW: {
    tier: 'SLOW',
    label: 'Often takes a while',
    description: 'Replies within a few days',
    color: 'text-gold-light',
    bgColor: 'bg-gold/20',
  },
  GHOST: {
    tier: 'GHOST',
    label: 'Ghost risk 🚩',
    description: 'Often goes silent or has been flagged',
    color: 'text-warm-rose-light',
    bgColor: 'bg-warm-rose/20',
  },
}

export interface GhostBadge {
  tier: GhostTier
  score: number
  label: string
  description: string
  color: string
  bgColor: string
  flagCount: number
}
