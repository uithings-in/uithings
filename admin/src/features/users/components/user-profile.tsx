import { useState } from 'react'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  User as UserIcon,
  Calendar,
  Shield,
  Key,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Edit,
  Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
import { callTypes } from '../data/data'
import { users } from '../data/users'
import { UsersActionDialog } from './users-action-dialog'

export function UserProfile() {
  const { userId } = useParams({ strict: false }) as { userId: string }
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const [openEditDialog, setOpenEditDialog] = useState(false)

  // Find user by ID or use first user as fallback for demo
  const user = users.find((u) => u.id === userId) || users[0]

  if (!user) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-8'>
        <p className='text-lg font-semibold text-muted-foreground'>User not found</p>
        <Button className='mt-4' onClick={() => navigate({ to: '/users' })}>
          <ArrowLeft className='mr-2 h-4 w-4' /> Back to Users
        </Button>
      </div>
    )
  }

  const fullName = `${user.firstName} ${user.lastName}`
  const initials = `${user.firstName[0] || ''}${user.lastName[0] || ''}`.toUpperCase()
  const badgeColor = callTypes.get(user.status)

  // Deterministic uploaded component count based on user ID
  const uploadedComponentsCount =
    ((user.id.charCodeAt(0) * 7 + user.id.charCodeAt(user.id.length - 1) * 3) % 45) + 1

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('User ID copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = () => {
    window.location.href = `mailto:${user.email}`
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
          <div className='h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent sm:h-32' />
          <CardContent className='relative px-6 pb-6 pt-0'>
            <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center'>
                <Avatar className='-mt-12 h-24 w-24 border-4 border-background shadow-md sm:-mt-16 sm:h-28 sm:w-28'>
                  <AvatarFallback className='bg-primary text-2xl font-bold text-primary-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <div className='space-y-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                      {fullName}
                    </h1>
                    <Badge
                      variant='outline'
                      className={cn('capitalize font-medium', badgeColor)}
                    >
                      {user.status}
                    </Badge>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    {user.email}
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                <span>ID: {user.id.slice(0, 8)}...</span>
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
            <TabsTrigger value='activity'>Activity</TabsTrigger>
            <TabsTrigger value='security'>Security</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value='overview' className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {/* Personal Information */}
              <Card className='lg:col-span-2'>
                <CardHeader>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <UserIcon className='h-4 w-4 text-primary' /> Personal Information
                  </CardTitle>
                  <CardDescription>
                    User contact and identity details
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-4 sm:grid-cols-2'>
                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      First Name
                    </span>
                    <p className='text-sm font-semibold'>{user.firstName}</p>
                  </div>
                  <div className='space-y-1 rounded-lg border p-3'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Last Name
                    </span>
                    <p className='text-sm font-semibold'>{user.lastName}</p>
                  </div>
                  <div className='space-y-1 rounded-lg border p-3 sm:col-span-2'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Email Address
                    </span>
                    <p className='text-sm font-semibold truncate'>{user.email}</p>
                  </div>
                  <div className='space-y-1 rounded-lg border p-3 sm:col-span-2'>
                    <span className='text-xs font-medium text-muted-foreground'>
                      Total Components Uploaded
                    </span>
                    <div className='flex items-center gap-2 pt-0.5'>
                      <Layers className='h-4 w-4 text-primary' />
                      <p className='text-sm font-semibold'>{uploadedComponentsCount} components</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className='text-base font-semibold flex items-center gap-2'>
                    <Shield className='h-4 w-4 text-primary' /> Account Status
                  </CardTitle>
                  <CardDescription>
                    System access & status
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Status</span>
                      <p className='text-sm font-medium capitalize'>{user.status}</p>
                    </div>
                    <Badge variant='outline' className={cn('capitalize', badgeColor)}>
                      {user.status}
                    </Badge>
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Email Verified</span>
                      <p className='text-sm font-medium'>Verified</p>
                    </div>
                    <CheckCircle2 className='h-5 w-5 text-green-500' />
                  </div>

                  <div className='flex items-center justify-between rounded-lg border p-3'>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-muted-foreground'>Created Date</span>
                      <p className='text-xs font-medium text-muted-foreground'>
                        {format(new Date(user.createdAt), 'PPP')}
                      </p>
                    </div>
                    <Calendar className='h-4 w-4 text-muted-foreground' />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value='activity' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <Activity className='h-4 w-4 text-primary' /> Recent Activity
                </CardTitle>
                <CardDescription>
                  Recent user actions and audit trail
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='relative space-y-4 ps-6 before:absolute before:bottom-0 before:left-2.5 before:top-2 before:w-0.5 before:bg-border'>
                  <div className='relative'>
                    <div className='absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground'>
                      &bull;
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Logged into Admin Dashboard</p>
                      <p className='text-xs text-muted-foreground'>Today at 10:45 AM &bull; IP: 192.168.1.42</p>
                    </div>
                  </div>
                  <div className='relative'>
                    <div className='absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground'>
                      &bull;
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Profile updated</p>
                      <p className='text-xs text-muted-foreground'>
                        {format(new Date(user.updatedAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className='relative'>
                    <div className='absolute -left-6 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px] text-muted-foreground'>
                      &bull;
                    </div>
                    <div>
                      <p className='text-sm font-medium'>Account created</p>
                      <p className='text-xs text-muted-foreground'>
                        {format(new Date(user.createdAt), 'PPP')}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value='security' className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base font-semibold flex items-center gap-2'>
                  <Key className='h-4 w-4 text-primary' /> Security & Credentials
                </CardTitle>
                <CardDescription>
                  Manage authentication, passwords, and sessions
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>Password</p>
                    <p className='text-xs text-muted-foreground'>Last changed 30 days ago</p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => toast.info('Password reset link sent to ' + user.email)}
                  >
                    Send Password Reset
                  </Button>
                </div>

                <div className='flex items-center justify-between rounded-lg border p-4'>
                  <div className='space-y-0.5'>
                    <p className='text-sm font-medium'>Two-Factor Authentication (2FA)</p>
                    <p className='text-xs text-muted-foreground'>Add an extra layer of security to the account</p>
                  </div>
                  <Badge variant='outline' className='text-muted-foreground'>Disabled</Badge>
                </div>
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
      />
    </>
  )
}
