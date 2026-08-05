'use client'

/**
 * Phase 4.6 — Online status indicator.
 * Sage dot = online. Gray dot = offline.
 */
export function OnlineStatus({ isOnline, size = 'sm' }: { isOnline: boolean; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'h-3 w-3' : 'h-2.5 w-2.5'
  return (
    <span
      className={`inline-block rounded-full ${dim} ${isOnline ? 'bg-sage' : 'bg-cream/25'}`}
      aria-label={isOnline ? 'Online' : 'Offline'}
    />
  )
}
