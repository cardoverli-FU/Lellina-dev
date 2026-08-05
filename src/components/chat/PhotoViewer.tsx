'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.7 — Photo Viewer (inline, for Lelly users)
//  Displays a photo unblurred. Tap to open full-screen ImageViewer.
//  Lelly users can also DELETE a message (disappears for both).
// ════════════════════════════════════════════════════════════════════

import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

interface PhotoViewerProps {
  photoUrl: string
  isMine: boolean
  deletedAt?: string | Date | null
  onOpenFull?: () => void
  onDelete?: () => void
}

export function PhotoViewer({
  photoUrl,
  isMine,
  deletedAt,
  onOpenFull,
  onDelete,
}: PhotoViewerProps) {
  if (deletedAt) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-cream/5 px-3 py-2">
        <span className="font-body text-xs italic text-cream/40">
          📷 Photo deleted
        </span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-2xl"
    >
      <img
        src={photoUrl}
        alt="Shared photo"
        onClick={onOpenFull}
        className="max-h-80 w-auto max-w-full cursor-zoom-in object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        draggable={false}
      />
      {isMine && onDelete && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-hero-dark/60 opacity-0 backdrop-blur-sm transition-all hover:bg-warm-rose group-hover:opacity-100"
          aria-label="Delete photo"
        >
          <Trash2 className="h-4 w-4 text-cream" />
        </button>
      )}
    </motion.div>
  )
}
