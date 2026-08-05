'use client'

import { useState, useCallback } from 'react'
import { LandingTabs, type TabId } from '@/components/landing/LandingTabs'
import { Hero } from '@/components/landing/Hero'
import { WhyGalzSection } from '@/components/landing/WhyGalzSection'
import { NoMenSection } from '@/components/landing/NoMenSection'
import { TrustSafety } from '@/components/landing/TrustSafety'
import { FounderStory } from '@/components/landing/FounderStory'
import { CommunityCTAs } from '@/components/landing/CommunityCTAs'
import { FAQ } from '@/components/landing/FAQ'
import { StickyMobileCTA } from '@/components/landing/StickyMobileCTA'
import { Footer } from '@/components/layout/Footer'
import { MapPin } from 'lucide-react'

/**
 * Lellina — Phase 1 Landing Page (Tabbed)
 * Galz for Galz
 *
 * Five focused tabs replace the long-scroll. Each tab shows one area.
 * Public surfaces are geographically neutral and contain NO pricing —
 * pricing lives inside the app (post-login). The Join CTA routes to /join.
 *
 * Tabs: Home · Why · Gate · Community · Galz
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('home')

  // "See how it works" from Hero → jumps to the Why tab.
  const goToWhy = useCallback(() => setActiveTab('why'), [])

  return (
    <div className="layout-shell">
      {/* Region notice banner — LIGHT bg, DARK text for max contrast */}
      <div className="w-full bg-blush-subtle border-b border-warm-rose/25 py-2.5 px-4 text-center">
        <p className="font-body text-xs text-soft-charcoal flex items-center justify-center gap-1.5 flex-wrap">
          <MapPin className="h-3.5 w-3.5 text-warm-rose flex-shrink-0" />
          <span>
            Live now in{' '}
            <span className="font-bold text-warm-rose-dark">Portland, Oregon 🌹</span>
          </span>
        </p>
      </div>
      <main className="layout-main">
        <LandingTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          panels={{
            // ─── Home: Hero only (no pricing sections publicly) ───
            home: <Hero onCtaClick={goToWhy} />,
            // ─── Why: 4 Pillars + Founder Letter ───
            why: (
              <>
                <WhyGalzSection />
                <FounderStory />
              </>
            ),
            // ─── Gate: Verification Steps + Trust & Safety ───
            gate: (
              <>
                <NoMenSection />
                <TrustSafety />
              </>
            ),
            // ─── Community: Telegram + WhatsApp + Share ───
            community: <CommunityCTAs />,
            // ─── Galz: Questions galz ask ───
            galz: <FAQ />,
          }}
        />
      </main>

      <Footer />
      <StickyMobileCTA />
    </div>
  )
}
