'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Shield, Clock, CheckCircle, XCircle, AlertCircle, Ban, MessageSquare, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface Appeal {
  id: string
  userId: string | null
  deviceFingerprint: string
  ipAddress: string
  attemptId: string | null
  userMessage: string | null
  status: string
  adminNotes: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  createdAt: string
  mediaDeleteAt: string | null
  user?: {
    email: string
    username: string | null
    createdAt: string
    bannedAt: string | null
    banReason: string | null
  }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-gold-light/20 text-gold-light border-gold-light/30', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-sage-light/20 text-sage-light border-sage-light/30', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-warm-coral/20 text-warm-coral border-warm-coral/30', icon: XCircle },
  MORE_INFO: { label: 'More Info', color: 'bg-gold-light/20 text-gold-light border-gold-light/30', icon: AlertCircle },
  BANNED: { label: 'Banned', color: 'bg-warm-coral/20 text-warm-coral border-warm-coral/30', icon: Ban },
}

export default function ManualVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [appeals, setAppeals] = useState<Appeal[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  const fetchAppeals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/appeals?status=${filter}`)
      if (res.ok) {
        const data = await res.json()
        setAppeals(data.appeals)
      }
    } catch (err) {
      toast({ title: 'Failed to load appeals', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }, [filter, toast])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/')
      return
    }
    fetchAppeals()
  }, [session, status, router, fetchAppeals])

  const reviewAppeal = async (action: string) => {
    if (!selectedAppeal) return
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/appeals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appealId: selectedAppeal.id,
          action,
          adminNotes,
        }),
      })

      if (res.ok) {
        toast({
          title: `Appeal ${action.toLowerCase()}`,
          description: 'The user has been notified.',
        })
        setSelectedAppeal(null)
        setAdminNotes('')
        fetchAppeals()
      } else {
        toast({ title: 'Failed to review appeal', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Network error', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-hero-dark flex items-center justify-center">
        <Skeleton className="h-12 w-48 bg-cream/10" />
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-hero-dark">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* ─── Back to App toggle ─── */}
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 mb-4 rounded-full border border-cream/20 bg-cream/5 px-4 py-2 font-body text-xs font-semibold text-cream transition-all hover:bg-cream/10 hover:border-cream/40"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to App
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-gold-light" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">
              Manual Verification
            </h1>
          </div>
          <p className="font-body text-cream/60 text-sm sm:text-base">
            Review appeals from users who were rejected by automated verification. Every action is audit-logged.
          </p>
        </motion.div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 tab-bar">
          {['PENDING', 'APPROVED', 'REJECTED', 'BANNED', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f
                  ? 'bg-warm-rose text-cream'
                  : 'bg-cream/5 text-cream/60 hover:bg-cream/10'
              }`}
            >
              {f === 'ALL' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Appeals list */}
          <div className="space-y-3">
            {loading ? (
              [1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full bg-cream/10 rounded-2xl" />
              ))
            ) : appeals.length === 0 ? (
              <Card className="p-8 bg-cream/5 border-cream/10">
                <p className="text-center text-cream/40 font-body">
                  No {filter.toLowerCase()} appeals. Clean as a whistle. 🌹
                </p>
              </Card>
            ) : (
              appeals.map((appeal) => {
                const statusCfg = STATUS_CONFIG[appeal.status] || STATUS_CONFIG.PENDING
                const StatusIcon = statusCfg.icon
                return (
                  <motion.button
                    key={appeal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => {
                      setSelectedAppeal(appeal)
                      setAdminNotes(appeal.adminNotes || '')
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedAppeal?.id === appeal.id
                        ? 'bg-cream/10 border-gold-light/40'
                        : 'bg-cream/5 border-cream/10 hover:bg-cream/8'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-body text-sm font-semibold text-cream truncate">
                          {appeal.user?.email || 'Unknown user'}
                        </p>
                        <p className="font-body text-xs text-cream/50 mt-1">
                          {appeal.user?.username || 'No username'} · {new Date(appeal.createdAt).toLocaleString()}
                        </p>
                        {appeal.userMessage && (
                          <p className="font-body text-xs text-cream/40 mt-2 line-clamp-2">
                            <MessageSquare className="inline h-3 w-3 mr-1" />
                            {appeal.userMessage}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={`${statusCfg.color} border`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusCfg.label}
                      </Badge>
                    </div>
                  </motion.button>
                )
              })
            )}
          </div>

          {/* Appeal detail / review panel */}
          <div>
            {selectedAppeal ? (
              <motion.div
                key={selectedAppeal.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-6 bg-cream/5 border-cream/10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-xl font-semibold text-cream">Appeal Review</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAppeal(null)}
                      className="text-cream/60 hover:text-cream"
                    >
                      Close
                    </Button>
                  </div>

                  {/* User info */}
                  <div className="space-y-2 mb-4 pb-4 border-b border-cream/10">
                    <div className="flex justify-between text-sm">
                      <span className="text-cream/50 font-body">Email</span>
                      <span className="text-cream font-body">{selectedAppeal.user?.email || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cream/50 font-body">Username</span>
                      <span className="text-cream font-body">{selectedAppeal.user?.username || '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cream/50 font-body">IP Address</span>
                      <span className="text-cream/70 font-body font-mono text-xs">{selectedAppeal.ipAddress}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-cream/50 font-body">Device</span>
                      <span className="text-cream/70 font-body font-mono text-xs truncate max-w-[200px]">
                        {selectedAppeal.deviceFingerprint.substring(0, 16)}…
                      </span>
                    </div>
                    {selectedAppeal.user?.bannedAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-cream/50 font-body">Ban Reason</span>
                        <span className="text-warm-coral font-body text-xs">{selectedAppeal.user.banReason}</span>
                      </div>
                    )}
                  </div>

                  {/* User message */}
                  {selectedAppeal.userMessage && (
                    <div className="mb-4">
                      <p className="text-xs text-cream/50 font-body mb-1">User's message:</p>
                      <p className="text-sm text-cream/80 font-body p-3 rounded-lg bg-cream/5 italic">
                        "{selectedAppeal.userMessage}"
                      </p>
                    </div>
                  )}

                  {/* Appeal media note */}
                  <div className="mb-4 p-3 rounded-lg bg-gold-light/5 border border-gold-light/20">
                    <p className="text-xs text-gold-light/80 font-body flex items-center gap-2">
                      <Eye className="h-3.5 w-3.5" />
                      Appeal media (photo, voice, video) available via the detail API.
                      Auto-deletes 7 days after review.
                    </p>
                  </div>

                  {/* Admin notes */}
                  <div className="mb-4">
                    <label className="text-xs text-cream/50 font-body mb-1 block">Admin notes (internal):</label>
                    <Textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Notes for this review…"
                      className="bg-cream/5 border-cream/10 text-cream font-body text-sm"
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => reviewAppeal('APPROVED')}
                      disabled={processing}
                      className="bg-sage hover:bg-sage-light text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => reviewAppeal('REJECTED')}
                      disabled={processing}
                      className="bg-warm-coral hover:bg-warm-coral/80 text-white"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => reviewAppeal('MORE_INFO')}
                      disabled={processing}
                      variant="outline"
                      className="border-gold-light/30 text-gold-light hover:bg-gold-light/10"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Request More
                    </Button>
                    <Button
                      onClick={() => reviewAppeal('BANNED')}
                      disabled={processing}
                      variant="outline"
                      className="border-warm-coral/30 text-warm-coral hover:bg-warm-coral/10"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Ban Device
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ) : (
              <Card className="p-8 bg-cream/5 border-cream/10 h-full flex items-center justify-center">
                <p className="text-center text-cream/40 font-body">
                  Select an appeal to review.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
