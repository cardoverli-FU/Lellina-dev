'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Sparkles, SearchX } from 'lucide-react'
import { ProfileCard, type DiscoverProfile } from './ProfileCard'
import { InfiniteScroll } from './InfiniteScroll'
import { FilterPanel, type FilterState, DEFAULT_FILTERS } from './FilterPanel'
import { useToast } from '@/hooks/use-toast'

/**
 * Phase 4.20 — DiscoverGrid.
 * The main discover experience: fetches profiles, manages filters,
 * handles like/pass with optimistic UI, and renders the responsive grid.
 *
 * Layout: 2-col mobile, 3-col tablet, 4-col desktop.
 */
export function DiscoverGrid() {
  const { toast } = useToast()

  // ─── State ────────────────────────────────────────────────────
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(DEFAULT_FILTERS)

  // Manual debounce (300ms) — stable, no external API mismatch risk
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedFilters(filters), 300)
    return () => clearTimeout(timer)
  }, [filters])

  const [profiles, setProfiles] = useState<DiscoverProfile[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busyUserId, setBusyUserId] = useState<string | null>(null)

  // ─── Build API URL from filter state ──────────────────────────
  const buildUrl = useCallback((pageNum: number, f: FilterState) => {
    const params = new URLSearchParams()
    params.set('page', String(pageNum))
    if (f.ageMin !== 18) params.set('ageMin', String(f.ageMin))
    if (f.ageMax !== 60) params.set('ageMax', String(f.ageMax))
    if (f.districts.length) params.set('districts', f.districts.join(','))
    if (f.tags.length) params.set('tags', f.tags.join(','))
    params.set('verified', String(f.verifiedOnly))
    return `/api/discover?${params.toString()}`
  }, [])

  // ─── Initial fetch + refetch on filter change ─────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetch(buildUrl(1, debouncedFilters))
      .then(async (res) => {
        if (res.status === 401) {
          window.location.href = '/login'
          return null
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled || !data) return
        if (data.error) {
          setError(data.error)
          return
        }
        setProfiles(data.profiles || [])
        setHasMore(data.hasMore || false)
        setTotal(data.total || 0)
        setPage(1)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load profiles. Try again.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedFilters, buildUrl])

  // ─── Load more (infinite scroll) ──────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)
    const nextPage = page + 1

    fetch(buildUrl(nextPage, debouncedFilters))
      .then((res) => res.json())
      .then((data) => {
        setProfiles((prev) => [...prev, ...(data.profiles || [])])
        setHasMore(data.hasMore || false)
        setPage(nextPage)
      })
      .catch(() => {
        toast({
          title: 'Slow connection',
          description: 'Could not load more profiles.',
          variant: 'destructive',
        })
      })
      .finally(() => setLoadingMore(false))
  }, [page, hasMore, loadingMore, debouncedFilters, buildUrl, toast])

  // ─── Like / Pass handlers (optimistic) ────────────────────────
  const handleLike = useCallback(async (userId: string) => {
    if (busyUserId) return
    setBusyUserId(userId)

    // Optimistic: remove from grid immediately
    setProfiles((prev) => prev.filter((p) => p.userId !== userId))
    setTotal((prev) => Math.max(0, prev - 1))

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: userId, action: 'LIKE' }),
      })
      const data = await res.json()

      if (data.matched) {
        toast({
          title: "It's a match! 💛",
          description: 'You both liked each other.',
        })
      }
    } catch {
      toast({
        title: 'Connection issue',
        description: 'Your like was sent — just a network hiccup.',
        variant: 'destructive',
      })
    } finally {
      setBusyUserId(null)
    }
  }, [busyUserId, toast])

  const handlePass = useCallback(async (userId: string) => {
    if (busyUserId) return
    setBusyUserId(userId)

    // Optimistic: remove from grid
    setProfiles((prev) => prev.filter((p) => p.userId !== userId))
    setTotal((prev) => Math.max(0, prev - 1))

    try {
      await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId: userId, action: 'PASS' }),
      })
    } catch {
      // Silent — pass is low-stakes
    } finally {
      setBusyUserId(null)
    }
  }, [busyUserId])

  // ─── Render ───────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-4rem)] pb-20">
      {/* ─── Top bar ─── */}
      <div className="sticky top-0 z-20 bg-hero-dark/90 backdrop-blur-md border-b border-cream/10">
        <div className="mx-auto max-w-7xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-black text-cream">Discover</h1>
              <p className="font-body text-xs text-cream/50">
                {loading ? 'Finding galz…' : `${total} ${total === 1 ? 'gal' : 'galz'} here for you`}
              </p>
            </div>
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              resultCount={total}
            />
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="mx-auto max-w-7xl px-4 py-5">
        {/* Loading state (initial) */}
        {loading && profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <Sparkles className="h-8 w-8 animate-pulse text-warm-rose-light" />
            <p className="mt-3 font-body text-sm text-cream/50">Finding galz near you…</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24">
            <SearchX className="h-8 w-8 text-warm-coral" />
            <p className="mt-3 font-body text-sm text-cream/60">{error}</p>
            <button
              onClick={() => setFilters({ ...filters })}
              className="mt-4 rounded-full bg-warm-rose px-6 py-2 font-body text-sm font-semibold text-white hover:bg-warm-rose-dark transition-colors"
            >
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && profiles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24">
            <SearchX className="h-8 w-8 text-cream/30" />
            <p className="mt-3 font-body text-sm text-cream/60 text-center">
              No galz match your filters right now.
            </p>
            <p className="mt-1 font-body text-xs text-cream/40 text-center">
              Try widening your search — the community is growing every day.
            </p>
            <button
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
              className="mt-4 rounded-full border border-cream/20 bg-cream/5 px-6 py-2 font-body text-sm text-cream hover:bg-cream/10 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}

        {/* Grid */}
        {!error && profiles.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {profiles.map((profile) => (
                  <ProfileCard
                    key={profile.id}
                    profile={profile}
                    onLike={handleLike}
                    onPass={handlePass}
                    busy={busyUserId === profile.userId}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* Infinite scroll */}
            {hasMore && (
              <InfiniteScroll
                onLoadMore={loadMore}
                hasMore={hasMore}
                loading={loadingMore}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
