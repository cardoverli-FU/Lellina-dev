'use client'

import { useEffect } from 'react'
import { useInView } from 'react-intersection-observer'
import { Loader2 } from 'lucide-react'

/**
 * Phase 4.5 — Infinite scroll sentinel.
 * Uses react-intersection-observer (battle-tested, 5M+/week downloads).
 * Fires onLoadMore when the sentinel enters the viewport.
 */
export function InfiniteScroll({
  onLoadMore,
  hasMore,
  loading,
}: {
  onLoadMore: () => void
  hasMore: boolean
  loading: boolean
}) {
  const { ref, inView } = useInView({ threshold: 0, rootMargin: '100px' })

  useEffect(() => {
    if (inView && hasMore && !loading) {
      onLoadMore()
    }
  }, [inView, hasMore, loading, onLoadMore])

  if (!hasMore && !loading) {
    return (
      <div className="py-8 text-center">
        <p className="font-body text-sm text-cream/40">You&apos;ve seen everyone ✨</p>
      </div>
    )
  }

  return (
    <div ref={ref} className="flex h-20 items-center justify-center">
      {loading && (
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-warm-rose-light" />
          <span className="font-body text-sm text-cream/50">Loading more galz…</span>
        </div>
      )}
    </div>
  )
}
