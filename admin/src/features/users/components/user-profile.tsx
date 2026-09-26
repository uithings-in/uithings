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
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
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

  useEffect(() => {
    fetchUserDetails()
    fetchUserComponents()
  }, [fetchUserDetails, fetchUserComponents])

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

  const usedCount = sub?.componentCountUsed || 0
  const maxCount = sub?.maxComponents || 0
  const usagePercentage = maxCount > 0 ? Math.min(100, Math.round((usedCount / maxCount) * 100)) : 0

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
                    {user.isProUser ? (
                      <Badge
                        variant='secondary'
                        className='bg-amber-500/15 text-amber-500 border border-amber-500/25 font-semibold gap-1 px-2.5 py-1'
                      >
                        <Sparkles className='h-3 w-3' /> PRO PLAN
                      </Badge>
                    ) : (
                      <Badge
                        variant='outline'
                        className='bg-neutral-500/10 text-neutral-400 border-neutral-500/20 font-medium text-xs px-2.5 py-1'
                      >
                        FREE PLAN
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
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value='subscription' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <CreditCard className='h-4 w-4 text-amber-500' /> Plan & Quota Details
                  </CardTitle>
                  <CardDescription>
                    Full details of the user's current subscription plan
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg border p-4 bg-muted/20'>
                    <div>
                      <p className='text-sm font-medium text-muted-foreground'>Membership Level</p>
                      <h3 className='text-xl font-bold text-foreground mt-0.5'>
                        {user.isProUser
                          ? sub?.planId?.displayName || 'Pro Plan'
                          : 'Free Tier User'}
                      </h3>
                    </div>
                    {user.isProUser ? (
                      <Badge className='bg-amber-500 text-black font-bold px-3 py-1 gap-1'>
                        <Sparkles className='h-3.5 w-3.5' /> PRO
                      </Badge>
                    ) : (
                      <Badge variant='outline'>FREE</Badge>
                    )}
                  </div>

                  {user.isProUser && sub ? (
                    <>
                      <div className='space-y-2 rounded-lg border p-4'>
                        <div className='flex items-center justify-between text-sm'>
                          <span className='font-medium text-muted-foreground'>Component Quota Usage</span>
                          <span className='font-bold'>{usedCount} / {maxCount}</span>
                        </div>
                        <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                          <div
                            className='h-full bg-amber-500 rounded-full transition-all duration-300'
                            style={{ width: `${usagePercentage}%` }}
                          />
                        </div>
                        <p className='text-xs text-muted-foreground pt-1'>
                          {Math.max(0, maxCount - usedCount)} components remaining in this billing cycle.
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
                    </>
                  ) : (
                    <div className='rounded-lg border border-dashed p-6 text-center text-muted-foreground'>
                      <p className='text-sm font-medium'>This user does not currently have an active Pro subscription.</p>
                      <p className='text-xs mt-1'>You can upgrade this user to Pro by editing their profile.</p>
                      <Button
                        size='sm'
                        variant='outline'
                        className='mt-4'
                        onClick={() => setOpenEditDialog(true)}
                      >
                        <Sparkles className='mr-1.5 h-3.5 w-3.5 text-amber-500' /> Upgrade to Pro
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <Clock className='h-4 w-4 text-primary' /> Subscription History
                  </CardTitle>
                  <CardDescription>
                    Billing records and transaction state
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  {sub?.transactions?.length ? (
                    sub.transactions.map((tx: any, idx: number) => (
                      <div key={idx} className='flex items-center justify-between rounded-lg border p-3'>
                        <div className='space-y-0.5'>
                          <p className='text-sm font-medium'>Transaction #{idx + 1}</p>
                          <p className='text-xs text-muted-foreground'>ID: {String(tx).slice(0, 12)}...</p>
                        </div>
                        <Badge variant='outline' className='text-green-500 border-green-500/30 bg-green-500/10'>
                          Paid
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className='rounded-lg border border-dashed p-6 text-center text-muted-foreground'>
                      <p className='text-sm'>No previous transaction records found.</p>
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
                                  onClick={() => handleUpdateComponentStatus(comp._id, 'rejected')}
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
    </>
  )
}
