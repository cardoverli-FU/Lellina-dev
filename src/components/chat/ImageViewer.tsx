'use client'

// ════════════════════════════════════════════════════════════════════
//  Phase 5.13 — Image Viewer (full-screen, modern, cute, animated)
//  NEVER heavy. Speediest code only. Framer Motion for buttery transitions.
//  Pinch-to-zoom on mobile, click to zoom on desktop, swipe/ESC to close.
// ════════════════════════════════════════════════════════════════════

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ImageViewerProps {
  src: string | null
  onClose: () => void
}

export function ImageViewer({ src, onClose }: ImageViewerProps) {
  const [zoomed, setZoomed] = useState(false)

  useEffect(() => {
    if (!src) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [src, onClose])

  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-hero-dark/95 backdrop-blur-md"
          onClick={onClose}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 backdrop-blur-sm transition-all hover:bg-cream/20"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-cream" />
          </button>

          {/* Image with spring entrance + zoom toggle */}
          <motion.img
            key={src}
            src={src}
            alt="Full size photo"
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{
              scale: zoomed ? 1.8 : 1,
              opacity: 1,
              y: 0,
            }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => {
              e.stopPropagation()
              setZoomed(!zoomed)
            }}
            className="max-h-[90vh] max-w-[90vw] cursor-zoom-in rounded-2xl object-contain shadow-2xl"
            draggable={false}
          />

          {/* Hint */}
          {!zoomed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-cream/10 px-4 py-2 backdrop-blur-sm"
            >
              <span className="font-body text-[11px] text-cream/70">
                Tap to zoom · ESC to close
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
