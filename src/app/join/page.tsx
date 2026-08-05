'use client'

import { useState, useMemo, useId } from 'react'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, Search, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { ComingSoon } from './coming-soon'
import { COUNTRIES, ALLOWED_COUNTRIES, type Country } from '@/lib/lellina/countries'

/**
 * /join — Lellina country selector gate (Step 0 of signup).
 *
 * Gated country rollout. United States (Portland, Oregon) is allowed at launch.
 * Everyone else sees a "Coming soon" screen with community links + exit.
 * ZERO data saved for non-allowed countries.
 *
 * Flow:
 *   landing "Get Verified" / "Join"  →  /join  →  US? → /verify
 *                                            ↘  other  → ComingSoon (exit to /)
 */
export default function JoinPage() {
  const prefersReducedMotion = useReducedMotion()
  const router = useRouter()
  const listId = useId()

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<Country | null>(null)

  const allowed = useMemo(() => ALLOWED_COUNTRIES, [])
  const otherCountries = useMemo(
    () => COUNTRIES.filter((c) => !c.allowed),
    [],
  )

  const handleSelect = (country: Country) => {
    setSelected(country)
    setOpen(false)
  }

  const reset = () => setSelected(null)

  // ─── Per-country greeting config for the allowed confirmation state ──────
  const GREETINGS: Record<string, { flag: string; greeting: string; body: string }> = {
    US: {
      flag: '🌹',
      greeting: 'Welcome, gal!',
      body: "You're in the right place. Portland is live — let's get you verified so you can meet your galz.",
    },
  }
  const greeting = selected?.allowed ? GREETINGS[selected.code] : null

  const continueToVerify = () => {
    if (selected?.allowed) {
      try {
        sessionStorage.setItem('lellina_country', selected.code)
      } catch {
        // sessionStorage might be unavailable (private mode) — non-blocking
      }
    }
    router.push('/verify')
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-hero-dark px-4 py-10 sm:py-16">
      <div className="relative w-full max-w-md">
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <Logo size="md" variant="dark" />
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ─── STATE A: No country selected yet ─── */}
          {selected === null && (
            <motion.section
              key="select"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
            >
              <h1 className="text-center font-display text-3xl sm:text-4xl font-black text-cream leading-tight tracking-tight">
                Where are you joining from?
              </h1>

              <p className="mt-3 text-center font-body text-sm sm:text-base text-cream/70 leading-relaxed">
                Lellina is rolling out one home at a time. We start with Portland, Oregon.
              </p>

              <div className="mt-8">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      role="combobox"
                      aria-expanded={open}
                      aria-controls={listId}
                      aria-label="Select your country"
                      className="group flex h-14 w-full items-center justify-between gap-3 rounded-2xl border border-cream/15 bg-cream/5 backdrop-blur-md px-5 font-body text-base text-cream transition-all hover:border-cream/30 hover:bg-cream/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-warm-rose-light/60"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Search className="h-4 w-4 shrink-0 text-gold-light" />
                        <span className="truncate text-cream/70">Select your country…</span>
                      </span>
                      <ChevronDown
                        className="h-4 w-4 shrink-0 text-cream/50 transition-transform duration-200 group-data-[state=open]:rotate-180"
                      />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent
                    align="start"
                    sideOffset={6}
                    style={{ width: 'var(--radix-popover-trigger-width)', minWidth: 'min(20rem, calc(100vw - 2rem))' }}
                    className="z-50 overflow-hidden rounded-2xl border border-cream/15 bg-[#1A1614] p-0 text-cream shadow-2xl shadow-black/50"
                  >
                    <Command
                      id={listId}
                      className="bg-transparent"
                      filter={(value, search) => {
                        if (value.includes(search.toLowerCase())) return 1
                        return 0
                      }}
                    >
                      <CommandInput
                        placeholder="Search countries…"
                        className="text-cream placeholder:text-cream/40"
                      />
                      <CommandList className="max-h-72 overflow-y-auto">
                        <CommandEmpty className="py-6 text-center font-body text-sm text-cream/50">
                          No country found.
                        </CommandEmpty>

                        {allowed.length > 0 && (
                          <CommandGroup
                            heading="Live now"
                            className="text-cream [&_[cmdk-group-heading]]:text-gold-light"
                          >
                            {allowed.map((c) => (
                              <CountryItem
                                key={c.code}
                                country={c}
                                onSelect={handleSelect}
                              />
                            ))}
                          </CommandGroup>
                        )}

                        <CommandGroup
                          heading="Coming soon"
                          className="text-cream [&_[cmdk-group-heading]]:text-cream/50"
                        >
                          {otherCountries.map((c) => (
                            <CountryItem
                              key={c.code}
                              country={c}
                              onSelect={handleSelect}
                            />
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <p className="mt-6 text-center font-body text-xs text-cream/50">
                We don&apos;t store your selection. You&apos;re free to check back anytime.
              </p>
            </motion.section>
          )}

          {/* ─── STATE B: Allowed country (US) — warm confirmation ─── */}
          {selected?.allowed && greeting && (
            <motion.section
              key="allowed"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              className="glass-dark rounded-3xl p-6 sm:p-8"
            >
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-gold-light/30 bg-gold-light/10 text-4xl"
                aria-hidden
              >
                {greeting.flag}
              </motion.div>

              <h2 className="text-center font-display text-3xl sm:text-4xl font-black text-cream leading-tight">
                {greeting.greeting}{' '}
                <span className="text-warm-rose-light" aria-hidden>{greeting.flag}</span>
              </h2>
              <p className="mt-3 text-center font-body text-sm sm:text-base text-cream/70 leading-relaxed">
                {greeting.body}
              </p>

              <button
                type="button"
                onClick={continueToVerify}
                className="group mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.02] active:scale-100"
              >
                <Sparkles className="h-4 w-4 text-gold-light transition-transform group-hover:rotate-12" />
                Continue to verification
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={reset}
                className="mt-3 inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-cream/15 bg-transparent px-6 font-body text-sm font-medium text-cream/70 transition-all hover:bg-cream/5 hover:text-cream"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Choose a different country
              </button>

              <p className="mt-5 text-center font-body text-xs text-cream/50">
                We don&apos;t store your selection. You&apos;re free to check back anytime.
              </p>
            </motion.section>
          )}

          {/* ─── STATE C: Non-allowed country — Coming soon ─── */}
          {selected && !selected.allowed && (
            <motion.section
              key="coming-soon"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
            >
              <ComingSoon countryName={selected.name} />

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 font-body text-xs text-cream/50 transition-colors hover:text-cream/80"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Choose a different country
                </button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}

// ─── Country dropdown item ──────────────────────────────────────────
function CountryItem({
  country,
  onSelect,
}: {
  country: Country
  onSelect: (c: Country) => void
}) {
  return (
    <CommandItem
      value={`${country.name} ${country.code}`}
      onSelect={() => onSelect(country)}
      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 font-body text-sm text-cream/80 outline-none transition-colors data-[selected=true]:bg-warm-rose/20 data-[selected=true]:text-cream"
    >
      <span className="text-lg" aria-hidden>{country.flag}</span>
      <span className="flex-1 truncate">{country.name}</span>
      {country.allowed ? (
        <span className="inline-flex items-center gap-1 rounded-full border border-gold-light/40 bg-gold-light/10 px-2 py-0.5 font-body text-[10px] font-semibold uppercase tracking-wide text-gold-light">
          <span className="h-1.5 w-1.5 rounded-full bg-gold-light" aria-hidden />
          Live
        </span>
      ) : (
        <span className="font-body text-[10px] uppercase tracking-wide text-cream/40">
          Soon
        </span>
      )}
      <Check className="h-3.5 w-3.5 text-warm-rose-light opacity-0 group-data-[selected=true]:opacity-100" />
    </CommandItem>
  )
}
