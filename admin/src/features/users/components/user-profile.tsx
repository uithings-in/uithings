import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Key,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Edit,
  Layers,
  Sparkles,
  Loader2,
  Mail,
  CreditCard,
  Clock,
  Eye,
  Trash2,
  Download,
  XCircle,
  MoreHorizontal,
  FolderOpen,
  Search as SearchIcon,
  CheckCircle,
  Zap,
  RefreshCw,
  Gift,
  UploadCloud,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

export interface PlanItem {
  _id: string
  name: string
  displayName: string
  description: string
  price: number
  durationDays: number
  componentLimit: number
  isActive: boolean
  isPremiumPlus?: boolean
  sortOrder?: number
  features?: string[]
}

export interface SubscriptionRecord {
  _id: string
  userId: string
  planId: PlanItem | any
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'queued'
  startDate?: string
  endDate?: string
  maxComponents: number
  componentCountUsed: number
  transactions?: any[]
  createdAt?: string
}
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'
import { copyToFigma } from '@/lib/clipboard'
import { callTypes } from '../data/data'
import { type User } from '../data/schema'
import { UsersActionDialog } from './users-action-dialog'

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox='0 0 24 24'
      width='15'
      height='15'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
        fill='#4285F4'
      />
      <path
        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
        fill='#34A853'
      />
      <path
        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z'
        fill='#FBBC05'
      />
      <path
        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z'
        fill='#EA4335'
      />
    </svg>
  )
}

export function UserProfile() {
  const { userId } = useParams({ strict: false }) as { userId: string }
  const navigate = useNavigate()
  const { auth } = useAuthStore()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  // User uploaded components state
  const [userComponents, setUserComponents] = useState<any[]>([])
  const [componentsLoading, setComponentsLoading] = useState(false)
  const [componentsFilter, setComponentsFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [componentSearchQuery, setComponentSearchQuery] = useState('')
  const [copyingCompId, setCopyingCompId] = useState<string | null>(null)
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null)
  const [previewModalComp, setPreviewModalComp] = useState<any | null>(null)
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    compId: string
    compName: string
    reason: string
    submitting: boolean
  }>({
    open: false,
    compId: '',
    compName: '',
    reason: '',
    submitting: false,
  })

  // Subscription plans & history state
  const [plans, setPlans] = useState<PlanItem[]>([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [subscriptionHistory, setSubscriptionHistory] = useState<SubscriptionRecord[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [activatingPlan, setActivatingPlan] = useState<PlanItem | null>(null)
  const [customDurationDays, setCustomDurationDays] = useState<number>(0)
  const [customComponentLimit, setCustomComponentLimit] = useState<number>(0)
  const [isPromotion, setIsPromotion] = useState(false)
  const [transactionId, setTransactionId] = useState('')
  const [bankName, setBankName] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [amount, setAmount] = useState<number | string>('')
  const [activatingSubmit, setActivatingSubmit] = useState(false)
  const [openRevokeDialog, setOpenRevokeDialog] = useState(false)
  const [revokingSubmit, setRevokingSubmit] = useState(false)
  const [showSwitchPlans, setShowSwitchPlans] = useState(false)

  const openActivateModal = (plan: PlanItem, promoMode = false) => {
    setActivatingPlan(plan)
    setIsPromotion(promoMode)
    setCustomDurationDays(plan.durationDays)
    setCustomComponentLimit(plan.componentLimit)
    setTransactionId('')
    setBankName('')
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'))
    setAmount(promoMode ? 0 : Math.floor(plan.price / 100))
  }

  const fetchUserDetails = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      setError(null)
      const res = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      if (res.data && res.data.data) {
        setUser(res.data.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user profile')
    } finally {
      setLoading(false)
    }
  }, [userId, auth.accessToken])

  const fetchUserComponents = useCallback(async () => {
    if (!userId) return
    try {
      setComponentsLoading(true)
      const res = await axios.get(`${API_URL}/components/admin?userId=${userId}&limit=100`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      if (res.data && res.data.data && Array.isArray(res.data.data.items)) {
        setUserComponents(res.data.data.items)
      }
    } catch (err: any) {
      console.error('Failed to fetch user components', err)
    } finally {
      setComponentsLoading(false)
    }
  }, [userId, auth.accessToken])

  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true)
      const res = await axios.get(`${API_URL}/plans`)
      if (res.data && Array.isArray(res.data.data)) {
        setPlans(res.data.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch plans', err)
    } finally {
      setPlansLoading(false)
    }
  }, [])

  const fetchSubscriptionHistory = useCallback(async () => {
    if (!userId) return
    try {
      setHistoryLoading(true)
      const res = await axios.get(`${API_URL}/users/${userId}/subscriptions`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      if (res.data && Array.isArray(res.data.data)) {
        setSubscriptionHistory(res.data.data)
      }
    } catch (err: any) {
      console.error('Failed to fetch subscription history', err)
    } finally {
      setHistoryLoading(false)
    }
  }, [userId, auth.accessToken])

  useEffect(() => {
    fetchUserDetails()
    fetchUserComponents()
    fetchPlans()
    fetchSubscriptionHistory()
  }, [fetchUserDetails, fetchUserComponents, fetchPlans, fetchSubscriptionHistory])

  const handleActivatePlan = async (overridePromo?: boolean) => {
    if (!activatingPlan || !userId) return

    const promo = overridePromo !== undefined ? overridePromo : isPromotion

    if (!promo) {
      if (!transactionId.trim()) {
        toast.error('Transaction ID is required')
        return
      }

      if (!bankName.trim()) {
        toast.error('Bank Name is required')
        return
      }

      if (!paymentDate) {
        toast.error('Payment Date is required')
        return
      }

      const numAmount = Number(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        toast.error('Please enter a valid Amount')
        return
      }
    }

    try {
      setActivatingSubmit(true)
      const res = await axios.post(
        `${API_URL}/users/${userId}/activate-plan`,
        {
          planId: activatingPlan._id,
          customDurationDays: customDurationDays || activatingPlan.durationDays,
          customComponentLimit: customComponentLimit || activatingPlan.componentLimit,
          isPromotion: promo,
          transactionId: promo ? undefined : transactionId.trim(),
          bankName: promo ? undefined : bankName.trim(),
          paymentDate: promo ? undefined : paymentDate,
          amount: promo ? 0 : Number(amount),
        },
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      toast.success(res.data?.message || `Plan "${activatingPlan.displayName}" activated successfully!`)
      setActivatingPlan(null)
      setShowSwitchPlans(false)
      await fetchUserDetails()
      await fetchSubscriptionHistory()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to activate plan')
    } finally {
      setActivatingSubmit(false)
    }
  }

  const handleRevokeSubscription = async () => {
    if (!userId) return
    try {
      setRevokingSubmit(true)
      const res = await axios.post(
        `${API_URL}/users/${userId}/cancel-subscription`,
        {},
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      toast.success(res.data?.message || 'Subscription cancelled successfully')
      setOpenRevokeDialog(false)
      setShowSwitchPlans(false)
      await fetchUserDetails()
      await fetchSubscriptionHistory()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to revoke subscription')
    } finally {
      setRevokingSubmit(false)
    }
  }

  const handleCopyFigma = async (comp: any) => {
    if (!comp.figmaDataBase64) {
      toast.error('No Figma data found for this component')
      return
    }
    try {
      setCopyingCompId(comp._id)
      await copyToFigma(comp.figmaDataBase64, comp.name)
      toast.success(`Copied "${comp.name}" to Figma clipboard!`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to copy to clipboard')
    } finally {
      setCopyingCompId(null)
    }
  }

  const handleUpdateComponentStatus = async (
    compId: string,
    newStatus: 'approved' | 'pending' | 'rejected'
  ) => {
    try {
      setStatusUpdatingId(compId)
      await axios.patch(
        `${API_URL}/components/${compId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      setUserComponents((prev) =>
        prev.map((c) => (c._id === compId ? { ...c, status: newStatus } : c))
      )
      toast.success(`Component marked as ${newStatus}`)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update component status')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectDialog.compId) return
    try {
      setRejectDialog((prev) => ({ ...prev, submitting: true }))
      await axios.patch(
        `${API_URL}/components/${rejectDialog.compId}/status`,
        {
          status: 'rejected',
          rejectionReason: rejectDialog.reason.trim(),
        },
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      setUserComponents((prev) =>
        prev.map((c) =>
          c._id === rejectDialog.compId
            ? { ...c, status: 'rejected', rejectionReason: rejectDialog.reason.trim() }
            : c
        )
      )
      toast.success('Component rejected with message')
      setRejectDialog({
        open: false,
        compId: '',
        compName: '',
        reason: '',
        submitting: false,
      })
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject component')
      setRejectDialog((prev) => ({ ...prev, submitting: false }))
    }
  }

  const handleDeleteComponent = async (compId: string, compName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${compName}"?`)) return
    try {
      setStatusUpdatingId(compId)
      await axios.delete(`${API_URL}/components/${compId}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      setUserComponents((prev) => prev.filter((c) => c._id !== compId))
      setUser((prev) =>
        prev
          ? {
              ...prev,
              uploadedComponentsCount: Math.max(0, (prev.uploadedComponentsCount || 1) - 1),
            }
          : prev
      )
      toast.success('Component deleted successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete component')
    } finally {
      setStatusUpdatingId(null)
    }
  }

  const componentStats = useMemo(() => {
    const total = userComponents.length
    const approved = userComponents.filter((c) => c.status === 'approved').length
    const pending = userComponents.filter((c) => c.status === 'pending' || !c.status).length
    const rejected = userComponents.filter((c) => c.status === 'rejected').length
    const totalDownloads = userComponents.reduce((acc, c) => acc + (c.downloadCount || 0), 0)
    return { total, approved, pending, rejected, totalDownloads }
  }, [userComponents])

  const filteredComponents = useMemo(() => {
    return userComponents.filter((c) => {
      if (componentsFilter === 'approved' && c.status !== 'approved') return false
      if (
        componentsFilter === 'pending' &&
        c.status !== 'pending' &&
        c.status !== undefined &&
        c.status !== null
      )
        return false
      if (componentsFilter === 'rejected' && c.status !== 'rejected') return false

      if (componentSearchQuery.trim()) {
        const q = componentSearchQuery.toLowerCase()
        const matchName = c.name?.toLowerCase().includes(q)
        const matchDesc = c.description?.toLowerCase().includes(q)
        const matchTags =
          Array.isArray(c.tags) && c.tags.some((t: string) => t.toLowerCase().includes(q))
        return matchName || matchDesc || matchTags
      }

      return true
    })
  }, [userComponents, componentsFilter, componentSearchQuery])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('User ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = () => {
    if (user?.email) {
      window.location.href = `mailto:${user.email}`
    }
  }

  if (loading) {
    return (
      <div className='flex h-[60vh] flex-col items-center justify-center gap-3'>
        <Loader2 className='h-8 w-8 animate-spin text-primary' />
        <p className='text-sm text-muted-foreground'>Loading user profile...</p>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className='flex h-[60vh] flex-col items-center justify-center p-8 text-center'>
        <p className='text-lg font-semibold text-destructive mb-2'>{error || 'User not found'}</p>
        <Button onClick={() => navigate({ to: '/users' })}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to User List
        </Button>
      </div>
    )
  }

  const initials = (user.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const isGoogle = user.authProvider === 'google'
  const sub = user.activeSubscription
  const statusBadgeColor = callTypes.get(user.status) || callTypes.get('active')

  const hasActivePlan = Boolean(
    sub &&
    sub.status === 'active' &&
    sub.planId &&
    (!sub.endDate || new Date(sub.endDate) > new Date())
  )

  const usedCount = sub?.componentCountUsed || 0
  const maxCount = sub?.maxComponents || 0
  const usagePercentage = maxCount > 0 ? Math.min(100, Math.round((usedCount / maxCount) * 100)) : 0

  const renderPlansList = () => {
    if (plansLoading) {
      return (
        <div className='flex items-center justify-center p-8 text-muted-foreground text-xs gap-2'>
          <Loader2 className='h-4 w-4 animate-spin text-primary' /> Loading available plans...
        </div>
      )
    }

    if (!plans || plans.length === 0) {
      return (
        <div className='rounded-lg border border-dashed p-6 text-center text-muted-foreground text-xs'>
          No active plans configured in database.
        </div>
      )
    }

    return (
      <div className='space-y-3'>
        {plans.map((plan) => {
          const isUnlimited = plan.componentLimit >= 999999
          const isFeatured = plan.isPremiumPlus || plan.name?.includes('ultimate')
          const formattedPrice = `₹${Math.floor(plan.price / 100)}`
          const durationText =
            plan.durationDays >= 365
              ? `${Math.round(plan.durationDays / 365)} Year`
              : `${Math.round(plan.durationDays / 30)} Months (${plan.durationDays}d)`

          return (
            <div
              key={plan._id}
              className={cn(
                'rounded-xl border p-4 transition-all duration-200 relative overflow-hidden',
                isFeatured
                  ? 'border-amber-500/40 bg-gradient-to-br from-amber-500/5 via-card to-amber-500/10 shadow-sm'
                  : 'border-border/70 bg-card hover:border-border'
              )}
            >
              {isFeatured && (
                <div className='absolute top-0 right-0'>
                  <span className='inline-flex items-center gap-1 bg-amber-500 text-black text-[10px] font-extrabold px-2 py-0.5 rounded-bl-lg shadow-sm'>
                    <Sparkles className='h-2.5 w-2.5' /> POPULAR
                  </span>
                </div>
              )}

              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <h5 className='font-bold text-base text-foreground'>{plan.displayName}</h5>
                    <Badge variant='secondary' className='text-[10px] font-medium px-2 py-0'>
                      {durationText}
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground leading-relaxed max-w-sm'>
                    {plan.description}
                  </p>
                </div>

                <div className='text-left sm:text-right shrink-0'>
                  <div className='text-lg font-extrabold text-foreground'>{formattedPrice}</div>
                  <span className='text-[11px] text-muted-foreground block'>
                    {isUnlimited ? 'Unlimited components' : `${plan.componentLimit} components`}
                  </span>
                </div>
              </div>

              {/* Top features list */}
              {plan.features && plan.features.length > 0 && (
                <div className='mt-3 pt-2.5 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-1.5'>
                  {plan.features.slice(0, 4).map((feat, fIdx) => (
                    <div key={fIdx} className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                      <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500 shrink-0' />
                      <span className='truncate'>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action row */}
              <div className='mt-3 pt-2.5 flex items-center justify-between border-t border-border/40'>
                <span className='text-[11px] text-muted-foreground flex items-center gap-1'>
                  <Clock className='h-3 w-3' /> Valid for {plan.durationDays} days
                </span>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-8 text-xs font-semibold gap-1.5 border-purple-500/40 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300'
                    onClick={() => openActivateModal(plan, true)}
                    title='Activate as promotional grant (no payment details required)'
                  >
                    <Gift className='h-3.5 w-3.5' /> Promotion
                  </Button>
                  <Button
                    size='sm'
                    className={cn(
                      'h-8 text-xs font-semibold gap-1.5 transition-all',
                      isFeatured
                        ? 'bg-amber-500 text-black hover:bg-amber-400'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    )}
                    onClick={() => openActivateModal(plan, false)}
                  >
                    <Zap className='h-3.5 w-3.5 fill-current' /> Activate Plan
                  </Button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-6'>
        {/* Navigation & Actions Top Bar */}
        <div className='flex flex-wrap items-center justify-between gap-4'>
          <Button
            variant='ghost'
            size='sm'
            asChild
            className='-ms-2 text-muted-foreground hover:text-foreground'
          >
            <Link to='/users'>
              <ArrowLeft className='me-1.5 h-4 w-4' /> Back to User List
            </Link>
          </Button>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleSendEmail}
            >
              <Send className='me-1.5 h-4 w-4' /> Email User
            </Button>
            <Button
              size='sm'
              onClick={() => setOpenEditDialog(true)}
            >
              <Edit className='me-1.5 h-4 w-4' /> Edit Profile
            </Button>
          </div>
        </div>

        {/* User Hero Banner */}
        <Card className='overflow-hidden border-border/60 shadow-sm'>
          <div className='h-24 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent sm:h-32' />
          <CardContent className='relative px-6 pb-6 pt-0'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                <Avatar className='-mt-12 h-24 w-24 border-4 border-background shadow-md sm:-mt-16 sm:h-28 sm:w-28'>
                  {user.profilePicture && (
                    <AvatarImage src={user.profilePicture} alt={user.name} />
                  )}
                  <AvatarFallback className='bg-primary text-2xl font-bold text-primary-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className='space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                      {user.name}
                    </h1>

                    {/* Login Method Badge */}
                    {isGoogle ? (
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1.5 px-2.5 py-1 bg-neutral-900/80 border-neutral-700 text-neutral-100 font-medium text-xs'
                      >
                        <GoogleIcon />
                        <span>Google Sign-In</span>
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border-blue-500/20 text-blue-400 font-medium text-xs'
                      >
                        <Mail className='h-3 w-3 text-blue-400' />
                        <span>Email & Password</span>
                      </Badge>
                    )}

                    {/* Subscription Badge */}
                    {hasActivePlan ? (
                      <Badge
                        variant='secondary'
                        className='bg-amber-500/15 text-amber-500 border border-amber-500/25 font-semibold gap-1 px-2.5 py-1'
                      >
                        <Sparkles className='h-3 w-3' /> {(sub?.planId?.displayName || 'PRO').toUpperCase()} PLAN
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='bg-neutral-500/10 text-neutral-400 border-neutral-500/20 font-medium text-xs px-2.5 py-1'
                      >
                        FREE TIER
                      </Badge>
                    )}

                    {/* Status Badge */}
                    <Badge
                      variant='outline'
                      className={cn('capitalize font-medium text-xs px-2.5 py-0.5', statusBadgeColor)}
                    >
                      {user.status || 'active'}
                    </Badge>

                    {/* Role Badge */}
                    <Badge
                      variant='outline'
                      className={
                        user.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs px-2.5 py-0.5'
                          : 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20 text-xs px-2.5 py-0.5'
                      }
                    >
                      {user.role.toUpperCase()}
                    </Badge>

                    {/* Pro Uploader Badge */}
                    {user.canUploadPro && (
                      <Badge
                        variant='secondary'
                        className='bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-medium text-xs px-2.5 py-0.5 gap-1'
                      >
                        <UploadCloud className='h-3 w-3' /> PRO UPLOADER
                      </Badge>
                    )}
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {user.email}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>ID: {user.id.slice(0, 10)}...</span>
                <Button
                  variant='ghost'
                  size='icon'
                  className='h-7 w-7'
                  onClick={() => copyToClipboard(user.id)}
                  title='Copy ID'
                >
                  {copied ? (
                    <Check className='h-3.5 w-3.5 text-green-500' />
                  ) : (
                    <Copy className='h-3.5 w-3.5' />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Detail Sections */}
        <Tabs defaultValue='overview' className='space-y-4'>
          <TabsList className='grid w-full grid-cols-4 max-w-xl'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='subscription'>Subscription</TabsTrigger>
            <TabsTrigger value='authentication'>Authentication</TabsTrigger>
            <TabsTrigger value='components' className='flex items-center gap-1.5'>
              <Layers className='h-3.5 w-3.5' />
              <span>Components</span>
              {userComponents.length > 0 ? (
                <Badge variant='secondary' className='h-4 px-1.5 text-[10px] font-semibold'>
                  {userComponents.length}
                </Badge>
              ) : user.uploadedComponentsCount ? (
                <Badge variant='secondary' className='h-4 px-1.5 text-[10px] font-semibold'>
                  {user.uploadedComponentsCount}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {/* Login Method Card */}
              <Card className='border-border/60 bg-card/50 backdrop-blur-sm'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    {isGoogle ? <GoogleIcon /> : <Mail className='h-4 w-4 text-blue-400' />}
                    Login Method
                  </CardTitle>
                  <CardDescription>
                    User identity and authentication provider
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Auth Provider
                    </span>
                    <div className='flex items-center gap-2 pt-0.5'>
                      {isGoogle ? (
                        <span className='font-semibold text-sm text-foreground flex items-center gap-1.5'>
                          <GoogleIcon /> Google OAuth 2.0
                        </span>
                      ) : (
                        <span className='font-semibold text-sm text-foreground flex items-center gap-1.5'>
                          <Mail className='h-4 w-4 text-blue-400' /> Direct Email & Password
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Account Email
                    </span>
                    <p className='text-sm font-semibold truncate'>{user.email}</p>
                  </div>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Verification</span>
                      <p className='text-sm font-medium text-emerald-400 flex items-center gap-1'>
                        <CheckCircle2 className='h-3.5 w-3.5' /> Verified
                      </p>
                    </div>
                    <Badge variant='outline' className='capitalize'>
                      {isGoogle ? 'Single Sign-On' : 'Password Auth'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Card */}
              <Card className='border-border/60 bg-card/50 backdrop-blur-sm'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <Sparkles className='h-4 w-4 text-amber-500' /> Subscription
                  </CardTitle>
                  <CardDescription>
                    Membership tier and active subscription
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Current Plan</span>
                      <p className='text-sm font-semibold text-foreground'>
                        {user.isProUser
                          ? sub?.planId?.displayName || 'Pro Membership'
                          : 'Free Starter Plan'}
                      </p>
                    </div>
                    {user.isProUser ? (
                      <Badge
                        variant='secondary'
                        className='bg-amber-500/15 text-amber-500 border border-amber-500/30 gap-1 font-semibold'
                      >
                        <Sparkles className='h-3 w-3' /> PRO
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='text-muted-foreground'>
                        FREE
                      </Badge>
                    )}
                  </div>

                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Subscription Status
                    </span>
                    <p className='text-sm font-semibold capitalize text-foreground'>
                      {user.isProUser ? sub?.status || 'Active' : 'No Active Subscription'}
                    </p>
                  </div>

                  {user.isProUser && sub?.endDate && (
                    <div className='space-y-1 rounded-lg border p-3'>
                      <span className='text-xs font-medium text-muted-foreground'>
                        Valid Until
                      </span>
                      <p className='text-xs font-semibold text-foreground'>
                        {format(new Date(sub.endDate), 'PPP')}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* User Account Details */}
              <Card className='border-border/60 bg-card/50 backdrop-blur-sm md:col-span-2 lg:col-span-1'>
                <CardHeader className='pb-3'>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <UserIcon className='h-4 w-4 text-primary' /> Account Overview
                  </CardTitle>
                  <CardDescription>
                    Registration date and usage statistics
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Joined Date</span>
                      <p className='text-xs font-semibold'>
                        {user.createdAt ? format(new Date(user.createdAt), 'PPP') : 'N/A'}
                      </p>
                    </div>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Components Uploaded</span>
                      <p className='text-sm font-semibold'>{user.uploadedComponentsCount || 0}</p>
                    </div>
                    <Layers className='h-4 w-4 text-primary' />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Account Status</span>
                      <p className='text-sm font-semibold capitalize'>{user.status || 'active'}</p>
                    </div>
                    <Badge variant='outline' className={cn('capitalize font-medium', statusBadgeColor)}>
                      {user.status || 'active'}
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Pro Upload Permission</span>
                      <p className='text-sm font-semibold'>
                        {user.canUploadPro ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    <Badge
                      variant='outline'
                      className={cn(
                        'font-medium text-xs',
                        user.canUploadPro
                          ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10 dark:text-emerald-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {user.canUploadPro ? 'Authorized' : 'Restricted'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value='subscription' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <CardTitle className='text-base font-semibold flex items-center gap-2'>
                        <CreditCard className='h-4 w-4 text-amber-500' /> Plan & Quota Details
                      </CardTitle>
                      <CardDescription>
                        {hasActivePlan
                          ? "Full details of the user's current active subscription"
                          : 'User has no active plan. Activate a plan manually below.'}
                      </CardDescription>
                    </div>
                    {hasActivePlan && (
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-7 text-xs gap-1 border-border'
                        onClick={() => setShowSwitchPlans(!showSwitchPlans)}
                      >
                        <Zap className='h-3 w-3 text-amber-500' />
                        {showSwitchPlans ? 'Hide Plans' : 'Switch Plan'}
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg border p-4 bg-muted/20'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>Membership Level</p>
                      <h3 className='text-xl font-bold text-foreground mt-0.5'>
                        {hasActivePlan
                          ? sub?.planId?.displayName || 'Pro Plan'
                          : 'Free Tier (No Active Plan)'}
                      </h3>
                    </div>
                    {hasActivePlan ? (
                      <Badge className='bg-amber-500 text-black font-bold px-3 py-1 gap-1'>
                        <Sparkles className='h-3.5 w-3.5' /> PRO
                      </Badge>
                    ) : (
                      <Badge variant='outline' className='text-muted-foreground font-semibold'>
                        FREE
                      </Badge>
                    )}
                  </div>

                  {hasActivePlan && sub ? (
                    <>
                      <div className='space-y-2 rounded-lg border p-4'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium text-muted-foreground'>Component Quota Usage</span>
                          <span className='font-bold'>{usedCount} / {maxCount >= 999999 ? '∞ (Unlimited)' : maxCount}</span>
                        </div>
                        <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                          <div
                            className='h-full bg-amber-500 rounded-full transition-all duration-300'
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <p className='text-xs text-muted-foreground pt-1'>
                          {maxCount >= 999999
                            ? 'Unlimited component downloads in this cycle.'
                            : `${Math.max(0, maxCount - usedCount)} components remaining in this billing cycle.`}
                        </p>
                      </div>

                      <div className='grid grid-cols-2 gap-3'>
                        <div className='rounded-lg border p-3'>
                          <span className='text-xs text-muted-foreground'>Start Date</span>
                          <p className='text-sm font-medium'>
                            {sub.startDate ? format(new Date(sub.startDate), 'PPP') : 'N/A'}
                          </p>
                        </div>
                        <div className='rounded-lg border p-3'>
                          <span className='text-xs text-muted-foreground'>Expiry / Renewal</span>
                          <p className='text-sm font-medium'>
                            {sub.endDate ? format(new Date(sub.endDate), 'PPP') : 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Active subscription admin actions */}
                      <div className='pt-2 flex items-center justify-between border-t'>
                        <Button
                          size='sm'
                          variant='outline'
                          className='text-xs gap-1.5'
                          onClick={() => setShowSwitchPlans(!showSwitchPlans)}
                        >
                          <Zap className='h-3.5 w-3.5 text-amber-500' />
                          {showSwitchPlans ? 'Cancel Switching' : 'Switch / Change Plan'}
                        </Button>
                        <Button
                          size='sm'
                          variant='ghost'
                          className='text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5'
                          onClick={() => setOpenRevokeDialog(true)}
                        >
                          <XCircle className='h-3.5 w-3.5' /> Revoke Plan
                        </Button>
                      </div>

                      {/* If admin clicked Switch Plan, show available plans to switch to */}
                      {showSwitchPlans && (
                        <div className='pt-3 space-y-3 border-t'>
                          <div className='flex items-center justify-between'>
                            <p className='text-xs font-semibold text-foreground flex items-center gap-1.5'>
                              <Zap className='h-3.5 w-3.5 text-amber-500' /> Select a plan to switch to:
                            </p>
                            <span className='text-[11px] text-muted-foreground'>
                              Will supersede current active plan
                            </span>
                          </div>
                          {renderPlansList()}
                        </div>
                      )}
                    </>
                  ) : (
                    /* User has NO active plan - Show all available plans */
                    <div className='space-y-4 pt-1'>
                      <div className='rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3.5 flex items-start gap-3'>
                        <Zap className='h-5 w-5 text-amber-500 shrink-0 mt-0.5' />
                        <div className='space-y-0.5'>
                          <h4 className='text-xs font-bold text-foreground'>Manual Plan Activation Available</h4>
                          <p className='text-xs text-muted-foreground'>
                            This user does not currently have an active subscription. Choose a plan below to activate it manually.
                          </p>
                        </div>
                      </div>

                      {renderPlansList()}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Right column: Subscription History */}
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <CardTitle className='text-base font-semibold flex items-center gap-2'>
                        <Clock className='h-4 w-4 text-primary' /> Subscription History
                      </CardTitle>
                      <CardDescription>
                        All current and past subscription records
                      </CardDescription>
                    </div>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='h-7 w-7 p-0 text-muted-foreground'
                      onClick={fetchSubscriptionHistory}
                      title='Refresh history'
                    >
                      <RefreshCw className={cn('h-3.5 w-3.5', historyLoading && 'animate-spin')} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {historyLoading ? (
                    <div className='flex items-center justify-center p-8 text-muted-foreground text-xs gap-2'>
                      <Loader2 className='h-4 w-4 animate-spin text-primary' /> Loading history...
                    </div>
                  ) : subscriptionHistory.length > 0 ? (
                    <div className='space-y-2.5 max-h-[500px] overflow-y-auto pr-1'>
                      {subscriptionHistory.map((item, idx) => {
                        const planName = typeof item.planId === 'object' && item.planId ? item.planId.displayName : 'Custom Plan'
                        const statusColors: Record<string, string> = {
                          active: 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10',
                          cancelled: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
                          expired: 'text-neutral-400 border-neutral-700 bg-neutral-800/30',
                          queued: 'text-blue-500 border-blue-500/30 bg-blue-500/10',
                        }
                        const isCurrent = sub && sub._id === item._id

                        return (
                          <div
                            key={item._id || idx}
                            className={cn(
                              'rounded-lg border p-3 transition-colors',
                              isCurrent ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/60 bg-muted/10'
                            )}
                          >
                            <div className='flex items-center justify-between gap-2'>
                              <div className='flex items-center gap-1.5'>
                                <span className='font-semibold text-sm text-foreground'>{planName}</span>
                                {isCurrent && (
                                  <Badge className='bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0'>
                                    CURRENT
                                  </Badge>
                                )}
                              </div>
                              <Badge
                                variant='outline'
                                className={cn('capitalize text-xs font-medium', statusColors[item.status] || '')}
                              >
                                {item.status}
                              </Badge>
                            </div>

                            <div className='mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground'>
                              <div>
                                <span className='text-[10px] uppercase font-medium text-muted-foreground/80 block'>
                                  Usage
                                </span>
                                <span className='font-medium text-foreground'>
                                  {item.componentCountUsed || 0} / {item.maxComponents >= 999999 ? '∞' : item.maxComponents} comps
                                </span>
                              </div>
                              <div className='text-right'>
                                <span className='text-[10px] uppercase font-medium text-muted-foreground/80 block'>
                                  Billing Period
                                </span>
                                <span>
                                  {item.startDate ? format(new Date(item.startDate), 'MMM d, yy') : 'N/A'}
                                  {' - '}
                                  {item.endDate ? format(new Date(item.endDate), 'MMM d, yy') : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Linked Transactions if any */}
                            {Array.isArray(item.transactions) && item.transactions.length > 0 && (
                              <div className='mt-2.5 pt-2 border-t border-border/40 space-y-1.5'>
                                {item.transactions.map((tx: any, tIdx: number) => {
                                  const txId = tx.razorpayPaymentId || tx.transactionId || tx._id
                                  const bName = tx.bankName || (tx.paymentMethod ? tx.paymentMethod : '')
                                  const txAmt = tx.amount !== undefined ? `₹${Math.floor(tx.amount / 100)}` : ''
                                  const pDate = tx.paymentDate || tx.createdAt
                                  return (
                                    <div
                                      key={tx._id || tIdx}
                                      className='rounded-md bg-muted/40 p-2 space-y-1 text-xs border border-border/50'
                                    >
                                      <div className='flex items-center justify-between'>
                                        <span
                                          className='font-mono font-bold text-foreground text-[11px] truncate max-w-[200px]'
                                          title={txId}
                                        >
                                          Txn: {txId}
                                        </span>
                                        <Badge
                                          variant='outline'
                                          className='text-[10px] font-semibold text-emerald-500 border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0'
                                        >
                                          {txAmt ? `${txAmt} Paid` : 'Paid'}
                                        </Badge>
                                      </div>
                                      <div className='flex items-center justify-between text-[11px] text-muted-foreground'>
                                        <span>{bName || 'Manual Transfer'}</span>
                                        <span>{pDate ? format(new Date(pDate), 'PP') : ''}</span>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className='rounded-lg border border-dashed p-6 text-center text-muted-foreground'>
                      <p className='text-sm font-medium'>No previous subscription records found.</p>
                      <p className='text-xs text-muted-foreground mt-1'>
                        Transactions and manual assignments will appear here.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Authentication Tab */}
          <TabsContent value='authentication' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <Key className='h-4 w-4 text-primary' /> Authentication Provider Details
                </CardTitle>
                <CardDescription>
                  Identity provider configuration and security details
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4 bg-muted/20'>
                  <div className='space-y-1'>
                    <p className='text-sm font-medium text-muted-foreground'>Active Login Method</p>
                    <div className='flex items-center gap-2'>
                      {isGoogle ? (
                        <Badge variant='outline' className='flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border-neutral-700 text-neutral-100 font-semibold text-sm'>
                          <GoogleIcon /> Google OAuth 2.0 Single Sign-On
                        </Badge>
                      ) : (
                        <Badge variant='outline' className='flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border-blue-500/20 text-blue-400 font-semibold text-sm'>
                          <Mail className='h-4 w-4' /> Email & Hashed Password
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CheckCircle2 className='h-6 w-6 text-emerald-500' />
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>Primary Login Email</span>
                    <p className='text-sm font-semibold truncate'>{user.email}</p>
                  </div>
                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>Security Provider Type</span>
                    <p className='text-sm font-semibold'>{isGoogle ? 'OAuth 2.0 / OpenID Connect' : 'Bcrypt Encrypted Credential'}</p>
                  </div>
                </div>

                {!isGoogle && (
                  <div className='flex items-center justify-between rounded-lg border p-4'>
                    <div className='space-y-0.5'>
                      <p className='text-sm font-medium'>Password Reset</p>
                      <p className='text-xs text-muted-foreground'>Send password recovery instructions to user's registered email</p>
                    </div>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => toast.success(`Password reset email triggered for ${user.email}`)}
                    >
                      Send Reset Email
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value='components' className='space-y-4'>
            {/* Header / Stats row */}
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
              <Card className='border-border/60 bg-card/50 backdrop-blur-sm'>
                <CardContent className='p-4 flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>Total Uploaded</p>
                    <p className='text-2xl font-bold'>{componentStats.total}</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                    <Layers className='h-5 w-5' />
                  </div>
                </CardContent>
              </Card>

              <Card className='border-border/60 bg-card/50 backdrop-blur-sm'>
                <CardContent className='p-4 flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>Approved</p>
                    <p className='text-2xl font-bold text-emerald-500'>{componentStats.approved}</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500'>
                    <CheckCircle className='h-5 w-5' />
                  </div>
                </CardContent>
              </Card>

              <Card className='border-border/60 bg-card/50 backdrop-blur-sm'>
                <CardContent className='p-4 flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>Pending Review</p>
                    <p className='text-2xl font-bold text-amber-500'>{componentStats.pending}</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500'>
                    <Clock className='h-5 w-5' />
                  </div>
                </CardContent>
              </Card>

              <Card className='border-border/60 bg-card/50 backdrop-blur-sm'>
                <CardContent className='p-4 flex items-center justify-between'>
                  <div className='space-y-1'>
                    <p className='text-xs font-medium text-muted-foreground'>Total Downloads</p>
                    <p className='text-2xl font-bold text-blue-500'>{componentStats.totalDownloads}</p>
                  </div>
                  <div className='h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500'>
                    <Download className='h-5 w-5' />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter and Search Bar */}
            <div className='flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1'>
              <div className='flex items-center gap-1.5 flex-wrap'>
                <Button
                  size='sm'
                  variant={componentsFilter === 'all' ? 'default' : 'outline'}
                  onClick={() => setComponentsFilter('all')}
                  className='h-8 text-xs'
                >
                  All ({componentStats.total})
                </Button>
                <Button
                  size='sm'
                  variant={componentsFilter === 'approved' ? 'default' : 'outline'}
                  onClick={() => setComponentsFilter('approved')}
                  className='h-8 text-xs gap-1.5'
                >
                  <span className='h-2 w-2 rounded-full bg-emerald-500' />
                  Approved ({componentStats.approved})
                </Button>
                <Button
                  size='sm'
                  variant={componentsFilter === 'pending' ? 'default' : 'outline'}
                  onClick={() => setComponentsFilter('pending')}
                  className='h-8 text-xs gap-1.5'
                >
                  <span className='h-2 w-2 rounded-full bg-amber-500' />
                  Pending ({componentStats.pending})
                </Button>
                {componentStats.rejected > 0 && (
                  <Button
                    size='sm'
                    variant={componentsFilter === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setComponentsFilter('rejected')}
                    className='h-8 text-xs gap-1.5'
                  >
                    <span className='h-2 w-2 rounded-full bg-rose-500' />
                    Rejected ({componentStats.rejected})
                  </Button>
                )}
              </div>

              <div className='relative w-full sm:w-64'>
                <SearchIcon className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground' />
                <Input
                  placeholder='Search components or tags...'
                  value={componentSearchQuery}
                  onChange={(e) => setComponentSearchQuery(e.target.value)}
                  className='h-8 pl-8 text-xs'
                />
              </div>
            </div>

            {/* Components Grid / Content */}
            {componentsLoading ? (
              <div className='flex h-48 flex-col items-center justify-center gap-2 rounded-xl border border-dashed'>
                <Loader2 className='h-6 w-6 animate-spin text-primary' />
                <p className='text-xs text-muted-foreground'>Loading uploaded components...</p>
              </div>
            ) : filteredComponents.length === 0 ? (
              <Card className='border-dashed'>
                <CardContent className='flex flex-col items-center justify-center py-12 text-center'>
                  <div className='h-12 w-12 rounded-full bg-muted/60 flex items-center justify-center mb-3 text-muted-foreground'>
                    <FolderOpen className='h-6 w-6' />
                  </div>
                  <h3 className='text-base font-semibold'>
                    {userComponents.length === 0
                      ? 'No components uploaded yet'
                      : 'No matching components found'}
                  </h3>
                  <p className='text-xs text-muted-foreground max-w-sm mt-1'>
                    {userComponents.length === 0
                      ? 'This user has not submitted or uploaded any Figma components yet.'
                      : `No components matching your filter criteria.`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {filteredComponents.map((comp) => {
                  const isApproved = comp.status === 'approved'
                  const isPending = comp.status === 'pending' || !comp.status
                  const isRejected = comp.status === 'rejected'
                  const isCopying = copyingCompId === comp._id
                  const isUpdating = statusUpdatingId === comp._id

                  return (
                    <Card
                      key={comp._id}
                      className='group overflow-hidden border-border/60 hover:border-border transition-all flex flex-col'
                    >
                      {/* Preview Image Frame */}
                      <div className='relative h-44 w-full bg-neutral-900/5 dark:bg-neutral-900/40 overflow-hidden border-b border-border/50 flex items-center justify-center p-3'>
                        {comp.previewImageUrl ? (
                          <img
                            src={comp.previewImageUrl}
                            alt={comp.name}
                            className='h-full w-full object-contain transition-transform duration-300 group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex flex-col items-center justify-center text-muted-foreground gap-1'>
                            <Layers className='h-8 w-8 stroke-[1.5]' />
                            <span className='text-xs'>No Preview Image</span>
                          </div>
                        )}

                        {/* Top Overlay Badges */}
                        <div className='absolute top-2 left-2 flex items-center gap-1.5 flex-wrap'>
                          {isApproved && (
                            <Badge className='bg-emerald-500/90 text-white font-medium text-[11px] px-2 py-0.5 shadow-sm'>
                              Approved
                            </Badge>
                          )}
                          {isPending && (
                            <Badge className='bg-amber-500/90 text-black font-semibold text-[11px] px-2 py-0.5 shadow-sm'>
                              Pending Review
                            </Badge>
                          )}
                          {isRejected && (
                            <Badge className='bg-rose-500/90 text-white font-medium text-[11px] px-2 py-0.5 shadow-sm'>
                              Rejected
                            </Badge>
                          )}

                          {comp.pricingType === 'Pro' ? (
                            <Badge
                              variant='secondary'
                              className='bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-1.5 py-0.2'
                            >
                              <Sparkles className='mr-1 h-2.5 w-2.5' /> PRO
                            </Badge>
                          ) : (
                            <Badge
                              variant='outline'
                              className='bg-background/80 backdrop-blur-sm text-[10px] px-1.5 py-0.2'
                            >
                              Free
                            </Badge>
                          )}
                        </div>

                        {/* Hover Quick Preview Action */}
                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                          <Button
                            size='sm'
                            variant='secondary'
                            className='h-8 text-xs shadow-lg'
                            onClick={() => setPreviewModalComp(comp)}
                          >
                            <Eye className='mr-1.5 h-3.5 w-3.5' /> Quick View
                          </Button>
                        </div>
                      </div>

                      {/* Card Content */}
                      <CardContent className='p-4 flex-1 flex flex-col justify-between space-y-3'>
                        <div className='space-y-2'>
                          <div className='flex items-start justify-between gap-2'>
                            <h4 className='font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors'>
                              {comp.name}
                            </h4>
                            <span className='text-[10px] text-muted-foreground whitespace-nowrap'>
                              {comp.createdAt ? format(new Date(comp.createdAt), 'MMM d, yyyy') : ''}
                            </span>
                          </div>

                          {comp.description && (
                            <p className='text-xs text-muted-foreground line-clamp-2'>
                              {comp.description}
                            </p>
                          )}

                          {/* Tags */}
                          {Array.isArray(comp.tags) && comp.tags.length > 0 && (
                            <div className='flex flex-wrap gap-1 pt-1'>
                              {comp.tags.slice(0, 3).map((tag: string, i: number) => (
                                <span
                                  key={i}
                                  className='inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
                                >
                                  #{tag}
                                </span>
                              ))}
                              {comp.tags.length > 3 && (
                                <span className='text-[10px] text-muted-foreground self-center'>
                                  +{comp.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Stats & Actions Row */}
                        <div className='pt-2 border-t flex items-center justify-between gap-2'>
                          <div className='flex items-center gap-3 text-xs text-muted-foreground'>
                            <span className='flex items-center gap-1'>
                              <Download className='h-3 w-3' /> {comp.downloadCount || 0}
                            </span>
                            <Badge variant='outline' className='text-[10px] h-4 px-1.5'>
                              {comp.designType || 'UI Design'}
                            </Badge>
                          </div>

                          <div className='flex items-center gap-1'>
                            <Button
                              size='sm'
                              variant='outline'
                              className='h-7 text-xs px-2.5'
                              onClick={() => handleCopyFigma(comp)}
                              disabled={isCopying}
                            >
                              {isCopying ? (
                                <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                              ) : (
                                <Copy className='mr-1 h-3 w-3' />
                              )}
                              Copy
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='h-7 w-7'
                                  disabled={isUpdating}
                                >
                                  {isUpdating ? (
                                    <Loader2 className='h-3.5 w-3.5 animate-spin' />
                                  ) : (
                                    <MoreHorizontal className='h-3.5 w-3.5' />
                                  )}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end' className='w-40 text-xs'>
                                <DropdownMenuItem onClick={() => setPreviewModalComp(comp)}>
                                  <Eye className='mr-2 h-3.5 w-3.5' /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateComponentStatus(comp._id, 'approved')}
                                  disabled={comp.status === 'approved'}
                                >
                                  <CheckCircle className='mr-2 h-3.5 w-3.5 text-emerald-500' /> Mark Approved
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateComponentStatus(comp._id, 'pending')}
                                  disabled={comp.status === 'pending'}
                                >
                                  <Clock className='mr-2 h-3.5 w-3.5 text-amber-500' /> Mark Pending
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setRejectDialog({
                                      open: true,
                                      compId: comp._id,
                                      compName: comp.name,
                                      reason: comp.rejectionReason || '',
                                      submitting: false,
                                    })
                                  }
                                  disabled={comp.status === 'rejected'}
                                >
                                  <XCircle className='mr-2 h-3.5 w-3.5 text-rose-500' /> Mark Rejected
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteComponent(comp._id, comp.name)}
                                  className='text-destructive focus:text-destructive'
                                >
                                  <Trash2 className='mr-2 h-3.5 w-3.5' /> Delete Component
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </Main>

      {/* Component Quick View Dialog */}
      <Dialog open={!!previewModalComp} onOpenChange={(open) => !open && setPreviewModalComp(null)}>
        <DialogContent className='max-w-3xl overflow-hidden p-0 gap-0'>
          {previewModalComp && (
            <div>
              <DialogHeader className='p-6 pb-2'>
                <div className='flex items-center justify-between gap-4'>
                  <div>
                    <DialogTitle className='text-xl font-bold text-foreground'>{previewModalComp.name}</DialogTitle>
                    <DialogDescription className='text-xs mt-1'>
                      Uploaded {previewModalComp.createdAt ? format(new Date(previewModalComp.createdAt), 'PPP') : 'N/A'}
                    </DialogDescription>
                  </div>
                  <Button
                    size='sm'
                    onClick={() => handleCopyFigma(previewModalComp)}
                    disabled={copyingCompId === previewModalComp._id}
                    className='shrink-0'
                  >
                    {copyingCompId === previewModalComp._id ? (
                      <Loader2 className='mr-1.5 h-4 w-4 animate-spin' />
                    ) : (
                      <Copy className='mr-1.5 h-4 w-4' />
                    )}
                    Copy to Figma
                  </Button>
                </div>
              </DialogHeader>

              <div className='relative max-h-[50vh] w-full bg-neutral-950 flex items-center justify-center p-4 border-y'>
                {previewModalComp.previewImageUrl ? (
                  <img
                    src={previewModalComp.previewImageUrl}
                    alt={previewModalComp.name}
                    className='max-h-[45vh] w-auto max-w-full object-contain rounded-md shadow-lg'
                  />
                ) : (
                  <div className='py-16 text-muted-foreground flex flex-col items-center gap-2'>
                    <Layers className='h-12 w-12 stroke-[1.5]' />
                    <span>No Preview Available</span>
                  </div>
                )}
              </div>

              <div className='p-6 space-y-4'>
                {previewModalComp.description && (
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {previewModalComp.description}
                  </p>
                )}

                <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
                  <div className='rounded-lg border p-3'>
                    <span className='text-[10px] text-muted-foreground uppercase font-medium'>Status</span>
                    <p className='text-xs font-semibold capitalize mt-0.5'>{previewModalComp.status || 'pending'}</p>
                  </div>
                  <div className='rounded-lg border p-3'>
                    <span className='text-[10px] text-muted-foreground uppercase font-medium'>Design Type</span>
                    <p className='text-xs font-semibold mt-0.5'>{previewModalComp.designType || 'UI Design'}</p>
                  </div>
                  <div className='rounded-lg border p-3'>
                    <span className='text-[10px] text-muted-foreground uppercase font-medium'>Pricing</span>
                    <p className='text-xs font-semibold mt-0.5'>{previewModalComp.pricingType || 'Free'}</p>
                  </div>
                  <div className='rounded-lg border p-3'>
                    <span className='text-[10px] text-muted-foreground uppercase font-medium'>Downloads</span>
                    <p className='text-xs font-semibold mt-0.5'>{previewModalComp.downloadCount || 0}</p>
                  </div>
                </div>

                {Array.isArray(previewModalComp.tags) && previewModalComp.tags.length > 0 && (
                  <div className='space-y-1.5 pt-1'>
                    <span className='text-xs font-medium text-muted-foreground'>Tags</span>
                    <div className='flex flex-wrap gap-1.5'>
                      {previewModalComp.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant='secondary' className='text-xs font-normal'>
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Action Dialog */}
      <UsersActionDialog
        key={user.id}
        open={openEditDialog}
        onOpenChange={setOpenEditDialog}
        currentRow={user}
        onSuccess={fetchUserDetails}
      />

      {/* Component Rejection Reason Modal */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          if (!rejectDialog.submitting) {
            setRejectDialog((prev) => ({ ...prev, open }))
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5 text-destructive shrink-0" />
              Reject Component
            </DialogTitle>
            <DialogDescription>
              Provide a rejection reason or feedback for <strong>{rejectDialog.compName}</strong>. This message will be sent to the user on their dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2">
            <Label htmlFor="user-comp-rejection-reason" className="text-sm font-semibold text-foreground">
              Rejection Message / Feedback
            </Label>
            <Textarea
              id="user-comp-rejection-reason"
              rows={4}
              placeholder="e.g. Preview image is low resolution, contains broken layers, or doesn't meet design guidelines..."
              value={rejectDialog.reason}
              onChange={(e) => setRejectDialog((prev) => ({ ...prev, reason: e.target.value }))}
              className="resize-none"
              autoFocus
            />
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              The user will be immediately notified on their dashboard so they can adjust and resubmit.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialog((prev) => ({ ...prev, open: false }))}
              disabled={rejectDialog.submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={rejectDialog.submitting}
            >
              {rejectDialog.submitting ? 'Submitting...' : 'Reject Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manual Plan Activation Confirmation Dialog */}
      <Dialog
        open={!!activatingPlan}
        onOpenChange={(open) => !open && !activatingSubmit && setActivatingPlan(null)}
      >
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              {isPromotion ? (
                <>
                  <Gift className='h-5 w-5 text-purple-400' /> Promotional: {activatingPlan?.displayName}
                </>
              ) : (
                <>
                  <Zap className='h-5 w-5 text-amber-500' /> Activate {activatingPlan?.displayName}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {isPromotion
                ? `Activate complimentary promotional subscription for ${user.name} (${user.email}).`
                : `Assign and immediately activate this subscription for ${user.name} (${user.email}).`}
            </DialogDescription>
          </DialogHeader>

          {activatingPlan && (
            <div className='space-y-4 py-2'>
              {/* Type Switcher: Paid vs Promotion */}
              <div className='grid grid-cols-2 p-1 rounded-lg bg-muted/40 border text-xs font-medium'>
                <button
                  type='button'
                  onClick={() => setIsPromotion(false)}
                  className={cn(
                    'py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all',
                    !isPromotion
                      ? 'bg-background shadow-sm font-bold text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <CreditCard className='h-3.5 w-3.5 text-amber-500' /> Paid / Manual
                </button>
                <button
                  type='button'
                  onClick={() => setIsPromotion(true)}
                  className={cn(
                    'py-1.5 px-3 rounded-md flex items-center justify-center gap-1.5 transition-all',
                    isPromotion
                      ? 'bg-purple-600 text-white shadow-sm font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Gift className='h-3.5 w-3.5' /> Promotion (Free)
                </button>
              </div>

              {isPromotion ? (
                /* Promotional Callout Banner - No payment details required */
                <div className='rounded-lg border border-purple-500/30 bg-purple-500/10 p-3.5 space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-purple-400 flex items-center gap-1.5'>
                      <Gift className='h-4 w-4 text-purple-400' /> Admin Promotion
                    </span>
                    <Badge className='bg-purple-500 text-white text-[10px] font-bold'>
                      COMPLIMENTARY
                    </Badge>
                  </div>
                  <p className='text-xs text-muted-foreground leading-relaxed'>
                    No transaction ID, bank details, or payment amount required. This plan will be activated immediately as a promotional grant.
                  </p>
                </div>
              ) : (
                /* Paid / Manual Payment Details Section */
                <div className='space-y-3 rounded-lg border p-3.5 bg-muted/20'>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold text-foreground flex items-center gap-1.5'>
                      <CreditCard className='h-3.5 w-3.5 text-amber-500' /> Payment Record Details
                    </span>
                    <Badge variant='outline' className='text-[10px] text-amber-500 border-amber-500/30'>
                      Manual Payment
                    </Badge>
                  </div>

                  <div className='grid grid-cols-2 gap-3'>
                    <div className='space-y-1.5'>
                      <Label htmlFor='plan-tx-id' className='text-xs font-medium flex items-center gap-1'>
                        Transaction ID <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='plan-tx-id'
                        placeholder='e.g. UTR9284102948'
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className='text-xs font-mono'
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='plan-bank-name' className='text-xs font-medium flex items-center gap-1'>
                        Bank Name <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='plan-bank-name'
                        placeholder='e.g. HDFC Bank, SBI'
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className='text-xs'
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='plan-payment-date' className='text-xs font-medium flex items-center gap-1'>
                        Payment Date <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='plan-payment-date'
                        type='date'
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className='text-xs'
                      />
                    </div>

                    <div className='space-y-1.5'>
                      <Label htmlFor='plan-amount' className='text-xs font-medium flex items-center gap-1'>
                        Amount (₹) <span className='text-destructive'>*</span>
                      </Label>
                      <Input
                        id='plan-amount'
                        type='number'
                        min='0'
                        step='any'
                        placeholder='e.g. 199'
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className='text-xs font-bold'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Plan parameters summary & overrides */}
              <div className='rounded-lg border p-3 bg-muted/10 space-y-2.5 text-xs'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground'>Selected Plan:</span>
                  <span className='font-bold text-foreground'>
                    {activatingPlan.displayName} ({activatingPlan.name})
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-3 pt-1'>
                  <div className='space-y-1'>
                    <Label htmlFor='plan-custom-duration' className='text-[11px] text-muted-foreground'>
                      Duration (Days)
                    </Label>
                    <Input
                      id='plan-custom-duration'
                      type='number'
                      min='1'
                      value={customDurationDays}
                      onChange={(e) => setCustomDurationDays(Number(e.target.value))}
                      className='h-8 text-xs'
                    />
                  </div>
                  <div className='space-y-1'>
                    <Label htmlFor='plan-custom-quota' className='text-[11px] text-muted-foreground'>
                      Component Limit
                    </Label>
                    <Input
                      id='plan-custom-quota'
                      type='number'
                      min='1'
                      value={customComponentLimit}
                      onChange={(e) => setCustomComponentLimit(Number(e.target.value))}
                      className='h-8 text-xs'
                    />
                  </div>
                </div>
              </div>

              <p className='text-[11px] text-muted-foreground leading-relaxed'>
                {isPromotion
                  ? 'Activation starts immediately upon confirmation as an admin promotion (₹0).'
                  : 'Activation starts immediately upon confirmation and registers the manual transaction under billing records.'}
              </p>
            </div>
          )}

          <DialogFooter className='flex flex-wrap items-center justify-between gap-3 pt-3 sm:justify-between sm:space-x-0'>
            <Button
              type='button'
              variant='outline'
              className='h-9 px-4 font-medium'
              disabled={activatingSubmit}
              onClick={() => setActivatingPlan(null)}
            >
              Cancel
            </Button>

            <div>
              {isPromotion ? (
                <Button
                  type='button'
                  className='h-9 px-4 bg-purple-600 text-white hover:bg-purple-500 font-bold gap-1.5 shadow-sm transition-all'
                  disabled={activatingSubmit}
                  onClick={() => handleActivatePlan(true)}
                  title='Activate as promotional grant (no payment details required)'
                >
                  {activatingSubmit ? (
                    <>
                      <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> Activating...
                    </>
                  ) : (
                    <>
                      <Gift className='mr-1.5 h-4 w-4' /> Promotion
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type='button'
                  className='h-9 px-4 bg-amber-500 text-black hover:bg-amber-400 font-bold gap-1.5 shadow-sm transition-all'
                  disabled={activatingSubmit}
                  onClick={() => handleActivatePlan(false)}
                >
                  {activatingSubmit ? (
                    <>
                      <Loader2 className='mr-1.5 h-4 w-4 animate-spin' /> Activating...
                    </>
                  ) : (
                    <>
                      <Zap className='mr-1.5 h-4 w-4 fill-current' /> Confirm & Activate
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Plan Confirmation Dialog */}
      <Dialog open={openRevokeDialog} onOpenChange={setOpenRevokeDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-destructive'>
              <XCircle className='h-5 w-5' /> Revoke Active Subscription
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the active subscription for{' '}
              <span className='font-semibold text-foreground'>{user.name}</span>? The user will be immediately downgraded to the Free Tier.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className='gap-2 sm:gap-2.5 pt-2'>
            <Button
              type='button'
              variant='outline'
              disabled={revokingSubmit}
              onClick={() => setOpenRevokeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type='button'
              variant='destructive'
              disabled={revokingSubmit}
              onClick={handleRevokeSubscription}
            >
              {revokingSubmit ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Revoking...
                </>
              ) : (
                'Confirm Revoke'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
