'use client'

import { useState, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Home,
  Sparkles,
  ShieldCheck,
  MessageCircle,
  Users,
  LogOut,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

/**
 * LandingTabs — Tabbed landing page shell.
 *
 * Structure:
 *   [Sticky Header: Logo + Auth Cluster (Login / Join / User Menu)]
 *   [Tab Bar: Home | Why | Gate | Community | Galz]
 *   [Active Tab Content Panel]
 *
 * Auth-aware header:
 *   - Logged out → [Login] [Join]  (visible on ALL breakpoints)
 *   - Logged in, verified → "Hey, {name}" + [Sign out]
 *   - Logged in, admin → [Admin] + [Sign out]
 *   - Logged in, unverified → [Finish verification →]
 *
 * Pricing + location are intentionally absent from public surfaces.
 * The Join CTA routes to /join (country selector → verification gate).
 */
export type TabId = 'home' | 'why' | 'gate' | 'community' | 'galz'

interface TabDef {
  id: TabId
  label: string
  icon: LucideIcon
}

const TABS: TabDef[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'why', label: 'Why', icon: Sparkles },
  { id: 'gate', label: 'Gate', icon: ShieldCheck },
  { id: 'community', label: 'Community', icon: MessageCircle },
  { id: 'galz', label: 'Galz', icon: Users },
]

interface LandingTabsProps {
  panels: Record<TabId, ReactNode>
  activeTab?: TabId
  onTabChange?: (tab: TabId) => void
}

export function LandingTabs({
  panels,
  activeTab: externalTab,
  onTabChange,
}: LandingTabsProps) {
  const prefersReducedMotion = useReducedMotion()
  const [internalTab, setInternalTab] = useState<TabId>('home')
  const activeTab = externalTab ?? internalTab

  const handleTabChange = useCallback(
    (tab: TabId) => {
      if (externalTab === undefined) setInternalTab(tab)
      onTabChange?.(tab)
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' })
      }
    },
    [externalTab, onTabChange, prefersReducedMotion]
  )

  return (
    <>
      {/* ─── Sticky Header + Tab Bar ─── */}
      <div className="sticky top-0 z-50 bg-ivory/95 backdrop-blur-md border-b border-border">
        {/* Header row */}
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-2">
            <button
              onClick={() => handleTabChange('home')}
              className="flex items-center shrink-0"
              aria-label="Lellina home"
            >
              <Logo size="sm" variant="light" />
            </button>

            <HeaderAuth />
          </div>
        </div>

        {/* Tab bar — horizontally scrollable on mobile */}
        <div className="tab-bar overflow-x-auto border-t border-border/50">
          <div className="mx-auto flex max-w-6xl min-w-max px-2 sm:px-6 lg:px-8">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex shrink-0 items-center gap-1.5 px-4 py-3 font-body text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-warm-rose'
                      : 'text-muted-foreground hover:text-soft-charcoal'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="tab-indicator"
                      className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-warm-rose"
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Tab Content Panel ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {panels[activeTab]}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

/**
 * HeaderAuth — Auth-aware right-side cluster.
 *
 *   loading          → placeholder (prevents layout shift)
 *   unauthenticated  → [Login] [Join]  (all breakpoints)
 *   authenticated    → role-based: Admin link / Finish verification / Welcome + Sign out
 */
function HeaderAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-9 w-16 animate-pulse rounded-full bg-border/60" />
        <div className="h-9 w-20 animate-pulse rounded-full bg-border/60" />
      </div>
    )
  }

  if (session && session.user) {
    const role = (session.user as { role?: string }).role
    const isVerified = (session.user as { isVerified?: boolean }).isVerified
    const username = session.user.name || session.user.email?.split('@')[0] || 'gal'

    if (role === 'ADMIN') {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/admin/manual-verification')}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-warm-rose/30 bg-warm-rose/5 px-3 sm:px-4 font-body text-xs sm:text-sm font-semibold text-warm-rose transition-all hover:bg-warm-rose/10 hover:border-warm-rose/50"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Admin
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-body text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-soft-charcoal"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )
    }

    if (isVerified) {
      return (
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-sage/10 border border-sage/30 px-3 h-9">
            <ShieldCheck className="h-3.5 w-3.5 text-sage" />
            <span className="font-body text-xs font-medium text-soft-charcoal max-w-[120px] truncate">
              {username}
            </span>
          </div>
          <div className="sm:hidden flex items-center justify-center h-9 w-9 rounded-full bg-sage/10 border border-sage/30">
            <ShieldCheck className="h-4 w-4 text-sage" />
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-body text-xs sm:text-sm font-medium text-muted-foreground transition-colors hover:text-soft-charcoal"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      )
    }

    // Logged in but NOT verified
    return (
      <button
        onClick={() => router.push('/verify')}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-warm-rose px-4 font-body text-xs sm:text-sm font-semibold text-white shadow-md transition-all hover:bg-warm-rose-dark hover:scale-[1.03]"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
        Finish verification
      </button>
    )
  }

  // Unauthenticated: Login + Join
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => router.push('/login')}
        className="inline-flex h-9 items-center rounded-full px-3 sm:px-4 font-body text-xs sm:text-sm font-semibold text-soft-charcoal transition-colors hover:text-warm-rose"
      >
        Login
      </button>
      <button
        onClick={() => router.push('/join')}
        className="inline-flex h-9 items-center gap-1.5 rounded-full bg-warm-rose px-3 sm:px-4 font-body text-xs sm:text-sm font-semibold text-white shadow-md shadow-warm-rose/20 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
      >
        <ShieldCheck className="h-3.5 w-3.5 text-gold-light" />
        <span className="hidden sm:inline">Get Verified</span>
        <span className="sm:hidden">Join</span>
      </button>
    </div>
  )
}
