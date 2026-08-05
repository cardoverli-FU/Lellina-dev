'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, MessageCircle, Users, User, Shield } from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: typeof Compass
  enabled: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Discover', href: '/discover', icon: Compass, enabled: true },
  { label: 'Chat', href: '/chat', icon: MessageCircle, enabled: false },
  { label: 'Groups', href: '/groups', icon: Users, enabled: false },
  { label: 'Profile', href: '/profile/edit', icon: User, enabled: true },
]

/**
 * Phase 4.24 — App layout with bottom nav (mobile) + sidebar (desktop).
 * Discover → Chat → Groups → Profile
 *
 * Chat + Groups are disabled (greyed) — they ship in Phase 5 + 6.
 * Admin users get an extra "Admin" nav item (toggle to admin panel).
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

  const allItems: NavItem[] = isAdmin
    ? [...NAV_ITEMS, { label: 'Admin', href: '/admin/manual-verification', icon: Shield, enabled: true }]
    : NAV_ITEMS

  return (
    <div className="min-h-screen bg-hero-dark flex">
      {/* ─── Desktop sidebar ─── */}
      <nav className="hidden md:flex fixed left-0 top-0 z-30 h-full w-20 flex-col items-center border-r border-cream/10 bg-hero-dark py-6">
        <Link href="/" className="mb-8" title="Lellina home">
          <span className="font-display text-2xl font-black text-warm-rose-light">L</span>
        </Link>
        {allItems.map((item) => {
          const isActive = pathname.startsWith(item.href.split('?')[0])
          const Icon = item.icon

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                className="mb-2 flex w-16 flex-col items-center gap-1 py-3 opacity-30"
                title="Coming soon"
              >
                <Icon className="h-5 w-5 text-cream" />
                <span className="font-body text-[10px] text-cream">{item.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label === 'Admin' ? 'Switch to Admin panel' : item.label}
              className={`mb-2 flex w-16 flex-col items-center gap-1 rounded-xl py-3 transition-colors ${
                isActive
                  ? 'bg-warm-rose/20 text-warm-rose-light'
                  : 'text-cream/60 hover:bg-cream/5 hover:text-cream'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-body text-[10px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* ─── Content area ─── */}
      <main className="flex-1 md:ml-20 pb-16 md:pb-0">
        {children}
      </main>

      {/* ─── Mobile bottom nav ─── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex h-16 items-center justify-around border-t border-cream/10 bg-hero-dark/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {allItems.map((item) => {
          const isActive = pathname.startsWith(item.href.split('?')[0])
          const Icon = item.icon

          if (!item.enabled) {
            return (
              <div
                key={item.label}
                className="flex flex-1 flex-col items-center gap-0.5 py-2 opacity-25"
              >
                <Icon className="h-5 w-5 text-cream" />
                <span className="font-body text-[9px] text-cream">{item.label}</span>
              </div>
            )
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label === 'Admin' ? 'Switch to Admin panel' : item.label}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors ${
                isActive ? 'text-warm-rose-light' : 'text-cream/60'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-body text-[9px]">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
