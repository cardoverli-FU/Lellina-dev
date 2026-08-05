'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ShieldCheck, LogOut, LayoutDashboard } from 'lucide-react'

/**
 * StickyMobileCTA — Mobile-only floating CTA bar.
 *
 * Auth-aware:
 *   - Logged out → [Login] [Join]
 *   - Logged in, admin → [Admin] [Sign out]
 *   - Logged in, verified → [Sign out]
 *   - Logged in, unverified → [Finish verification]
 *
 * No pricing shown publicly. Mobile only (hidden on lg+).
 * Safe-area-inset-bottom support.
 */
export function StickyMobileCTA() {
  const prefersReducedMotion = useReducedMotion()
  const [visible, setVisible] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const isAuthed = status === 'authenticated' && !!session?.user
  const role = (session?.user as { role?: string } | undefined)?.role
  const isAdmin = isAuthed && role === 'ADMIN'
  const isVerified = (session?.user as { isVerified?: boolean } | undefined)?.isVerified

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
        >
          <div className="border-t border-gold/30 bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-end gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
              {!isAuthed && (
                <>
                  <button
                    onClick={() => router.push('/login')}
                    className="inline-flex h-9 items-center rounded-full px-3 font-body text-xs font-semibold text-soft-charcoal transition-colors hover:text-warm-rose"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/join')}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-warm-rose px-3.5 font-display text-xs font-semibold text-white shadow-md active:scale-95"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
                    Join
                  </button>
                </>
              )}

              {isAuthed && isAdmin && (
                <>
                  <button
                    onClick={() => router.push('/admin/manual-verification')}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-warm-rose/30 bg-warm-rose/5 px-3.5 font-display text-xs font-semibold text-warm-rose"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Admin
                  </button>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted-foreground"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              )}

              {isAuthed && !isAdmin && !isVerified && (
                <button
                  onClick={() => router.push('/verify')}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-warm-rose px-3.5 font-display text-xs font-semibold text-white shadow-md active:scale-95"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
                  Finish verification
                </button>
              )}

              {isAuthed && !isAdmin && isVerified && (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-warm-rose/30 bg-white px-3.5 font-display text-xs font-semibold text-warm-rose-dark"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
