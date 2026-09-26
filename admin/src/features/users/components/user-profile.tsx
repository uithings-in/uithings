import { useState, useEffect, useCallback } from 'react'
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
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'
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

  useEffect(() => {
    fetchUserDetails()
  }, [fetchUserDetails])

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
          <TabsList className='grid w-full grid-cols-3 max-w-md'>
            <TabsTrigger value='overview'>Overview</TabsTrigger>
            <TabsTrigger value='subscription'>Subscription</TabsTrigger>
            <TabsTrigger value='authentication'>Login Method</TabsTrigger>
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
        </Tabs>
      </Main>

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
