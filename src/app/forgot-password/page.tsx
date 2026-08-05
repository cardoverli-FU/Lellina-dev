'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Loader2, Mail, KeyRound, ArrowRight, Check, AlertTriangle } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

function ForgotPasswordInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Two modes: request (no token in URL) or reset (token + email in URL)
  const tokenFromUrl = searchParams.get('token')
  const emailFromUrl = searchParams.get('email')
  const isResetMode = !!(tokenFromUrl && emailFromUrl)

  // Request-state
  const [email, setEmail] = useState(emailFromUrl || '')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [senderEmail, setSenderEmail] = useState<string | null>(null)

  // Reset-state
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [resetLoading, setResetLoading] = useState(false)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (requestLoading) return

    const emailClean = email.trim().toLowerCase()
    if (!emailClean || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) {
      toast({ title: 'Email looks off', description: 'Please enter a valid email.', variant: 'destructive' })
      return
    }

    setRequestLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailClean }),
      })
      const data = await res.json()

      // Always show the same message (anti-enumeration)
      setRequestSent(true)
      if (data.senderEmail) setSenderEmail(data.senderEmail)
      if (!res.ok) {
        toast({
          title: 'Something went sideways',
          description: data.error || 'Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Network error',
        description: 'Could not reach Lellina. Check your connection.',
        variant: 'destructive',
      })
    } finally {
      setRequestLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (resetLoading) return

    if (newPassword.length < 8) {
      toast({ title: 'Password too short', description: 'At least 8 characters.', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmNewPassword) {
      toast({ title: 'Passwords mismatch', description: 'Please re-enter the same password twice.', variant: 'destructive' })
      return
    }

    setResetLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailFromUrl,
          token: tokenFromUrl,
          newPassword,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setResetLoading(false)
        toast({
          title: 'Reset failed',
          description: data.message || 'Invalid or expired token. Please request a new link.',
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Password reset',
        description: 'You can now sign in with your new password.',
      })
      setTimeout(() => router.push('/login'), 1200)
    } catch {
      setResetLoading(false)
      toast({
        title: 'Network error',
        description: 'Could not reach Lellina. Check your connection.',
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
          {/* ─── RESET MODE ─── */}
          {isResetMode ? (
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-warm-rose/20 flex items-center justify-center">
                  <KeyRound className="h-7 w-7 text-warm-rose-light" />
                </div>
                <h1 className="font-display text-3xl font-black text-cream mb-2">Pick a new password.</h1>
                <p className="font-body text-sm text-cream/65">
                  Make it a good one. Eight characters minimum.
                </p>
              </div>

              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    New password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                    disabled={resetLoading}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-cream/80 font-body text-xs uppercase tracking-wider">
                    Confirm new password
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Type it again"
                    className="h-11 bg-cream/5 border-cream/15 text-cream placeholder:text-cream/35 focus-visible:border-warm-rose-light focus-visible:ring-warm-rose-light/30"
                    disabled={resetLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full h-12 rounded-full bg-warm-rose hover:bg-warm-rose-dark text-white font-display text-base font-semibold shadow-lg shadow-warm-rose-deep/40 transition-all hover:scale-[1.02] active:scale-100"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Resetting…
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4 text-gold-light" />
                      Reset my password
                    </>
                  )}
                </Button>
              </form>
            </>
          ) : requestSent ? (
            // ─── REQUEST SENT (anti-enumeration success state) ───
            <div className="text-center py-6">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-sage/20 flex items-center justify-center">
                <Check className="h-8 w-8 text-sage-light" />
              </div>
              <h1 className="font-display text-2xl font-black text-cream mb-3">Check your inbox.</h1>
              <p className="font-body text-sm text-cream/65 mb-6">
                If that email exists, a reset link has been sent. The link expires in 1 hour.
              </p>
              {senderEmail && (
                <div className="flex items-center gap-2 rounded-xl bg-warm-rose/10 border border-warm-rose/20 px-3.5 py-3 mb-4 text-left">
                  <Mail className="h-4 w-4 text-warm-rose-light flex-shrink-0" />
                  <p className="font-body text-xs text-cream/75 leading-relaxed">
                    The email will come from <span className="font-semibold text-cream">{senderEmail}</span>
                  </p>
                </div>
              )}
              <div className="flex items-start gap-2 rounded-xl bg-cream/[0.04] border border-cream/10 px-3.5 py-3 mb-6 text-left">
                <AlertTriangle className="h-4 w-4 text-gold-light flex-shrink-0 mt-0.5" />
                <p className="font-body text-xs text-cream/55 leading-relaxed">
                  {senderEmail
                    ? <>Don&apos;t see it? Check your <span className="font-semibold text-cream/70">spam/junk folder</span> and if you use Gmail, the <span className="font-semibold text-cream/70">&quot;Promotions&quot; tab</span>. Still nothing? The email may not match an account.</>
                    : <>Don&apos;t see it? Check spam. If you use Gmail, the &quot;Promotions&quot; tab. Still nothing? The email may not match an account.</>
                  }
                </p>
              </div>
              <a
                href="/login"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-6 font-display text-sm font-semibold text-cream transition-all hover:bg-cream/10"
              >
                Back to sign in
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ) : (
            // ─── REQUEST MODE ───
            <>
              <div className="text-center mb-6">
                <div className="mx-auto mb-4 h-14 w-14 rounded-full bg-warm-rose/20 flex items-center justify-center">
                  <Mail className="h-7 w-7 text-warm-rose-light" />
                </div>
                <h1 className="font-display text-3xl font-black text-cream mb-2">Forgot your password?</h1>
                <p className="font-body text-sm text-cream/65">
                  Happens to the best of us. We&apos;ll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleRequest} className="space-y-4">
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
                    disabled={requestLoading}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={requestLoading}
                  className="w-full h-12 rounded-full bg-warm-rose hover:bg-warm-rose-dark text-white font-display text-base font-semibold shadow-lg shadow-warm-rose-deep/40 transition-all hover:scale-[1.02] active:scale-100"
                >
                  {requestLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending…
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 text-gold-light" />
                      Send reset link
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-cream/10 text-center">
                <a
                  href="/login"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-cream/25 bg-cream/5 px-6 font-display text-sm font-semibold text-cream transition-all hover:bg-cream/10"
                >
                  Back to sign in
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center font-body text-xs text-cream/40">
          For your safety, reset links expire after 1 hour.
        </p>
      </motion.div>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-hero-dark" />}>
      <ForgotPasswordInner />
    </Suspense>
  )
}
