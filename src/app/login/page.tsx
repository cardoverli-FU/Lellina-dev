'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Loader2, LogIn, AlertTriangle, ArrowRight } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const callbackUrl = searchParams.get('callbackUrl') || '/discover'
  const errorParam = searchParams.get('error')

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [banned, setBanned] = useState(false)

  // If we got here from a NextAuth error, surface it once
  const [initialError] = useState<string | null>(() => {
    if (errorParam === 'banned') {
      setBanned(true)
      return null
    }
    if (errorParam === 'CredentialsSignin') return 'Wrong email or password.'
    if (errorParam) return 'Something went wrong. Try again.'
    return null
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    if (!identifier.trim() || !password) {
      toast({
        title: 'Almost there',
        description: 'Enter your email or username, and your password.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    setBanned(false)

    try {
      const result = await signIn('credentials', {
        identifier: identifier.trim(),
        password,
        redirect: false,
      })

      if (!result || result.error) {
        if (result?.error === 'banned') {
          setBanned(true)
        } else if (result?.error === 'CredentialsSignin') {
          toast({
            title: 'Wrong email or password',
            description: 'Double-check and try again.',
            variant: 'destructive',
          })
        } else {
          toast({
            title: 'Sign-in failed',
            description: 'Something went sideways. Try again in a moment.',
            variant: 'destructive',
          })
        }
        setLoading(false)
        return
      }

      // Success — check nighttime trap (Phase 2.6 wiring)
      try {
        const nightCheck = await fetch('/api/verify/night-check', { method: 'GET' })
        const nightData = await nightCheck.json()
        if (nightData.trigger) {
          // Nighttime trap triggered — user must re-verify
          setLoading(false)
          toast({
            title: 'Quick check',
            description: 'It\'s late — we need a quick selfie to confirm it\'s you. Just a sec.',
          })
          router.push('/verify?night=true')
          return
        }
      } catch {
        // Night check failed — allow login anyway (non-blocking)
      }

      // ─── Role-based redirect ───────────────────────────────────
      // ADMIN lands on admin panel directly.
      // Regular users land on /discover.
      // Admins can switch to the app via the "Back to App" toggle in admin nav.
      try {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        const userRole = session?.user?.role
        let target: string
        if (userRole === 'ADMIN') {
          // Admin → admin panel first
          target = callbackUrl && callbackUrl !== '/' && !callbackUrl.startsWith('/discover') ? callbackUrl : '/admin/manual-verification'
          toast({
            title: 'Welcome back, Admin',
            description: 'You\'re in the admin panel. Tap "Back to App" to browse Discover.',
          })
        } else {
          target = callbackUrl && callbackUrl !== '/' ? callbackUrl : '/discover'
          toast({
            title: 'Welcome back',
            description: 'You\'re in.',
          })
        }
        router.push(target)
        router.refresh()
      } catch {
        // Session fetch failed — redirect to discover as fallback
        toast({ title: 'Welcome back', description: 'You\'re in.' })
        router.push('/discover')
        router.refresh()
      }
    } catch {
      setLoading(false)
      toast({
        title: 'Network error',
        description: 'Could not reach Lellina. Check your connection.',
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="min-h-screen bg-hero-dark flex flex-col">
      {/* ─── Banned banner ─── */}
      {banned && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mt-6 w-[calc(100%-2rem)] max-w-md rounded-2xl border border-warm-coral/40 bg-warm-coral/15 p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warm-coral flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-display text-sm font-bold text-cream mb-1">This account is banned.</p>
              <p className="font-body text-xs text-cream/75 mb-3">
                If we got it wrong, appeal — we read every one personally.
              </p>
              <a
                href="mailto:hello@lellina.app?subject=Ban Appeal"
                className="inline-flex h-9 items-center justify-center rounded-full bg-warm-rose px-5 font-body text-xs font-semibold text-white transition-all hover:bg-warm-rose-dark"
              >
                Appeal this decision
              </a>
            </div>
          </div>
        </motion.div>
      )}

      {/* ─── Card ─── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Logo size="lg" variant="dark" />
          </div>

          <div className="glass-dark rounded-3xl border border-cream/10 p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="font-display text-3xl sm:text-4xl font-black text-cream mb-2">
                Welcome back, gal.
              </h1>
              <p className="font-body text-sm text-cream/65">
                You&apos;re already verified — just sign in.
              </p>
            </div>

            {/* ─── Initial error ─── */}
            {initialError && (
              <div className="mb-4 rounded-lg border border-warm-coral/30 bg-warm-coral/10 px-4 py-2.5">
                <p className="font-body text-xs text-cream/80">{initialError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                  Email or username
                </Label>
                <Input
                  id="identifier"
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or @yourhandle"
                  className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    Password
                  </Label>
                  <a
                    href="/forgot-password"
                    className="font-body text-xs text-warm-rose-light hover:text-cream transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-warm-rose hover:bg-warm-rose-dark text-white font-display text-base font-semibold shadow-lg shadow-warm-rose-deep/40 transition-all hover:scale-[1.02] active:scale-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 text-gold-light" />
                    Sign in
                  </>
                )}
              </Button>
            </form>

            {/* ─── New here? ─── */}
            <div className="mt-6 pt-6 border-t border-cream/10 text-center">
              <p className="font-body text-sm text-cream/65 mb-3">New to Lellina?</p>
              <a
                href="/verify"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-6 font-display text-sm font-semibold text-cream transition-all hover:bg-cream/10 hover:border-cream/40"
              >
                Get verified
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <p className="mt-6 text-center font-body text-xs text-cream/40">
            By signing in, you agree to keep this space safe, kind, and women-only.
          </p>
        </motion.div>
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-hero-dark" />}>
      <LoginInner />
    </Suspense>
  )
}
