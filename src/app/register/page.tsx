'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { signIn } from 'next-auth/react'
import { Loader2, UserPlus, ShieldCheck, ArrowRight, AlertTriangle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

type TokenState = 'checking' | 'valid' | 'invalid'

function RegisterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const token = searchParams.get('token')

  // Lazy initial: if there's no token in the URL, we can decide synchronously.
  const [tokenState, setTokenState] = useState<TokenState>(() => (token ? 'checking' : 'invalid'))

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ─── Validate the verification token ───
  useEffect(() => {
    if (!token) return // already marked 'invalid' in the lazy initializer
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/verify/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        const data = await res.json()
        if (cancelled) return
        if (res.ok && data.valid) {
          setTokenState('valid')
        } else {
          // Token expired or invalid — redirect to /verify with message
          toast({
            title: 'Verification expired',
            description: "Let's try again.",
            variant: 'destructive',
          })
          setTimeout(() => router.push('/verify'), 1200)
        }
      } catch {
        if (!cancelled) {
          toast({
            title: 'Network error',
            description: 'Could not validate your verification. Try again.',
            variant: 'destructive',
          })
          setTimeout(() => router.push('/verify'), 1200)
        }
      }
    })()
    return () => { cancelled = true }
  }, [token, router, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return

    // Validate
    const emailClean = email.trim().toLowerCase()
    const usernameClean = username.trim()
    if (!emailClean || !usernameClean || !password) {
      toast({ title: 'Almost there', description: 'All fields are required.', variant: 'destructive' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      toast({ title: 'Email looks off', description: 'Please enter a valid email.', variant: 'destructive' })
      return
    }
    if (usernameClean.length < 3) {
      toast({ title: 'Username too short', description: 'At least 3 characters.', variant: 'destructive' })
      return
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(usernameClean)) {
      toast({ title: 'Username characters', description: 'Letters, numbers, dot, dash, underscore only.', variant: 'destructive' })
      return
    }
    if (password.length < 8) {
      toast({ title: 'Password too short', description: 'At least 8 characters.', variant: 'destructive' })
      return
    }
    if (password !== confirmPassword) {
      toast({ title: 'Passwords mismatch', description: 'Please re-enter the same password twice.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      // 1) Create the user (validates + consumes token server-side)
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailClean,
          username: usernameClean,
          password,
          verificationToken: token,
          country: typeof window !== 'undefined' ? sessionStorage.getItem('lellina_country') : null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setLoading(false)
        if (data.error?.toLowerCase().includes('email')) {
          toast({ title: 'Email already taken', description: 'Try signing in instead.', variant: 'destructive' })
        } else if (data.error?.toLowerCase().includes('username')) {
          toast({ title: 'Username taken', description: 'Try a different one.', variant: 'destructive' })
        } else if (data.error?.toLowerCase().includes('token')) {
          toast({ title: 'Verification expired', description: "Let's try again.", variant: 'destructive' })
          setTimeout(() => router.push('/verify'), 1200)
        } else {
          toast({ title: 'Registration failed', description: data.error || 'Please try again.', variant: 'destructive' })
        }
        return
      }

      // 2) Auto-login via NextAuth credentials
      const signResult = await signIn('credentials', {
        identifier: emailClean,
        password,
        redirect: false,
      })

      if (!signResult || signResult.error) {
        setLoading(false)
        // Account was created but auto-login failed — send to /login
        toast({
          title: 'Account created',
          description: 'Please sign in to continue.',
        })
        setTimeout(() => router.push('/login'), 1200)
        return
      }

      // 3) Success — redirect to profile setup wizard (Phase 3).
      toast({
        title: 'Welcome to Lellina',
        description: 'You\'re verified. Let\'s set up your profile.',
      })
      router.push('/profile/setup')
      router.refresh()
    } catch {
      setLoading(false)
      toast({
        title: 'Network error',
        description: 'Could not complete registration. Try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <main className="min-h-screen bg-hero-dark flex items-center justify-center px-4 py-10">
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
          {tokenState === 'checking' && (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 text-warm-rose-light animate-spin mx-auto mb-4" />
              <p className="font-body text-sm text-cream/70">Checking your verification…</p>
            </div>
          )}

          {tokenState === 'invalid' && (
            <div className="text-center py-8">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-warm-coral/15 flex items-center justify-center">
                <AlertTriangle className="h-8 w-8 text-warm-coral" />
              </div>
              <h1 className="font-display text-2xl font-black text-cream mb-2">Verification expired.</h1>
              <p className="font-body text-sm text-cream/65 mb-6">Let&apos;s try again. It only takes a minute.</p>
              <a
                href="/verify"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-warm-rose px-8 font-display text-base font-semibold text-white shadow-lg shadow-warm-rose-deep/40 transition-all hover:bg-warm-rose-dark hover:scale-[1.03] active:scale-100"
              >
                Get verified
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}

          {tokenState === 'valid' && (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-sage-light/30 bg-sage/10 px-4 py-1.5 mb-4">
                  <ShieldCheck className="h-3.5 w-3.5 text-sage-light" />
                  <span className="font-body text-xs sm:text-sm font-medium text-cream tracking-wide">
                    Verified · Now make it official
                  </span>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-black text-cream mb-2">
                  Claim your account.
                </h1>
                <p className="font-body text-sm text-cream/65">
                  You&apos;re verified. Now make it official — claim your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                    disabled={loading}
                    required
                  />
                  <p className="font-body text-[11px] text-cream/45 pl-0.5">Gmail recommended — easier password resets.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    Username
                  </Label>
                  <Input
                    id="username"
                    type="text"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="your_handle"
                    className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                    disabled={loading}
                    required
                  />
                  <p className="font-body text-[11px] text-cream/45 pl-0.5">Letters, numbers, dot, dash, underscore. At least 3 characters.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Type it again"
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
                      Claiming…
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 text-gold-light" />
                      Claim my account
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center font-body text-xs text-cream/40">
                By creating an account, you agree to keep this space safe, kind, and women-only.
              </p>
            </>
          )}
        </div>
      </motion.div>
    </main>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-hero-dark" />}>
      <RegisterInner />
    </Suspense>
  )
}
