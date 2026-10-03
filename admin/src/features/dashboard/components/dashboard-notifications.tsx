import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useNavigate } from '@tanstack/react-router'
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Clock,
  RefreshCw,
  Eye,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'

export interface DashboardNotification {
  _id: string
  type: string
  title: string
  message: string
  data?: {
    componentId?: string
    userId?: string
    componentName?: string
    previewImageUrl?: string
    status?: string
    pricingType?: string
    authorName?: string
    authorEmail?: string
  }
  read: boolean
  createdAt: string
  updatedAt: string
}

interface DashboardNotificationsProps {
  onUnreadCountChange?: (count: number) => void
}

export function DashboardNotifications({ onUnreadCountChange }: DashboardNotificationsProps) {
  const { auth } = useAuthStore()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<DashboardNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'unread' | 'pending'>('all')

  const fetchNotifications = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true)
      else setLoading(true)

      const res = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })

      if (res.data?.success && Array.isArray(res.data.data)) {
        setNotifications(res.data.data)
        const unread = res.data.data.filter((n: DashboardNotification) => !n.read).length
        onUnreadCountChange?.(unread)
      }
    } catch (err) {
      console.error('Failed to load notifications:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [auth.accessToken, onUnreadCountChange])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = async (id: string) => {
    try {
      await axios.patch(
        `${API_URL}/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      const unread = notifications.filter((n) => n._id !== id && !n.read).length
      onUnreadCountChange?.(unread)
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.patch(
        `${API_URL}/notifications/mark-all-read`,
        {},
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      onUnreadCountChange?.(0)
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const clearAll = async () => {
    try {
      await axios.delete(`${API_URL}/notifications/clear-all`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      setNotifications([])
      onUnreadCountChange?.(0)
    } catch (err) {
      console.error('Failed to clear notifications:', err)
    }
  }

  const deleteOne = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      const unread = notifications.filter((n) => n._id !== id && !n.read).length
      onUnreadCountChange?.(unread)
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read
    if (filter === 'pending') return n.data?.status === 'pending'
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const pendingCount = notifications.filter((n) => n.data?.status === 'pending').length

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / (1000 * 60))
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return new Date(dateStr).toLocaleDateString()
  }

  return (
    <Card className='border-border/60 bg-card/60 backdrop-blur-sm'>
      <CardHeader className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border/40'>
        <div>
          <div className='flex items-center gap-2'>
            <CardTitle className='text-lg font-semibold tracking-tight'>
              Activity & Component Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant='destructive' className='px-2 py-0 text-xs font-semibold'>
                {unreadCount} unread
              </Badge>
            )}
          </div>
          <CardDescription className='text-xs text-muted-foreground mt-1'>
            Real-time feed of newly uploaded components, approvals, and system events
          </CardDescription>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => fetchNotifications(true)}
            disabled={loading || refreshing}
            className='h-8 gap-1 text-xs'
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant='outline'
              size='sm'
              onClick={markAllAsRead}
              className='h-8 gap-1 text-xs'
            >
              <CheckCheck className='h-3.5 w-3.5' />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearAll}
              className='h-8 gap-1 text-xs text-muted-foreground hover:text-destructive'
            >
              <Trash2 className='h-3.5 w-3.5' />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Filter Tabs */}
      <div className='flex items-center gap-2 px-6 pt-4'>
        <Button
          variant={filter === 'all' ? 'secondary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('all')}
          className='h-7 rounded-full text-xs font-medium px-3'
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'secondary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('unread')}
          className='h-7 rounded-full text-xs font-medium px-3'
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'pending' ? 'secondary' : 'ghost'}
          size='sm'
          onClick={() => setFilter('pending')}
          className='h-7 rounded-full text-xs font-medium px-3'
        >
          Pending Review ({pendingCount})
        </Button>
      </div>

      <CardContent className='pt-4 pb-6 px-6'>
        {loading && notifications.length === 0 ? (
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className='flex items-start gap-4 rounded-xl border border-border/40 p-4'
              >
                <Skeleton className='h-16 w-24 rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-48' />
                  <Skeleton className='h-3 w-72' />
                  <Skeleton className='h-3 w-28' />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-14 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground mb-3'>
              <Bell className='h-7 w-7' />
            </div>
            <p className='text-sm font-semibold text-foreground'>
              No {filter !== 'all' ? filter : ''} notifications
            </p>
            <p className='text-xs text-muted-foreground mt-1 max-w-sm'>
              When users upload new components, instant notifications will appear here for you to review and manage.
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {filteredNotifications.map((notif) => {
              const comp = notif.data
              return (
                <div
                  key={notif._id}
                  className={`group relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
                    !notif.read
                      ? 'border-primary/30 bg-primary/5 hover:border-primary/50'
                      : 'border-border/40 bg-card/40 hover:border-border'
                  }`}
                >
                  <div className='flex items-start gap-3.5 flex-1 min-w-0'>
                    {/* Thumbnail or Icon */}
                    {comp?.previewImageUrl ? (
                      <div className='relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/50'>
                        <img
                          src={comp.previewImageUrl}
                          alt={comp.componentName || 'Component'}
                          className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                          onError={(e) => {
                            ;(e.currentTarget as HTMLElement).style.display = 'none'
                          }}
                        />
                      </div>
                    ) : (
                      <div className='flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
                        <Layers className='h-6 w-6' />
                      </div>
                    )}

                    {/* Details */}
                    <div className='min-w-0 flex-1 space-y-1'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className='text-xs font-semibold text-foreground truncate'>
                          {notif.title}
                        </span>
                        {!notif.read && (
                          <span className='h-2 w-2 rounded-full bg-primary animate-pulse' />
                        )}
                        {comp?.pricingType && (
                          <Badge
                            variant={comp.pricingType === 'Pro' ? 'default' : 'secondary'}
                            className='text-[10px] px-1.5 py-0 h-4'
                          >
                            {comp.pricingType}
                          </Badge>
                        )}
                        {comp?.status && (
                          <Badge
                            variant={
                              comp.status === 'approved'
                                ? 'default'
                                : comp.status === 'pending'
                                ? 'outline'
                                : 'destructive'
                            }
                            className={`text-[10px] px-1.5 py-0 h-4 ${
                              comp.status === 'pending'
                                ? 'border-amber-500/50 bg-amber-500/10 text-amber-500'
                                : comp.status === 'approved'
                                ? 'bg-emerald-500 text-white'
                                : ''
                            }`}
                          >
                            {comp.status === 'pending'
                              ? 'Pending Review'
                              : comp.status === 'approved'
                              ? 'Approved'
                              : 'Rejected'}
                          </Badge>
                        )}
                      </div>

                      <p className='text-xs text-muted-foreground line-clamp-2 leading-relaxed'>
                        {notif.message}
                      </p>

                      <div className='flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground/80 pt-0.5'>
                        {comp?.authorName && (
                          <span>
                            By: <strong className='text-foreground'>{comp.authorName}</strong>
                            {comp.authorEmail ? ` (${comp.authorEmail})` : ''}
                          </span>
                        )}
                        <span className='flex items-center gap-1'>
                          <Clock className='h-3 w-3' />
                          {formatTimeAgo(notif.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-2 self-end sm:self-center flex-shrink-0'>
                    <Button
                      variant='default'
                      size='sm'
                      onClick={() => {
                        if (!notif.read) markAsRead(notif._id)
                        navigate({ to: '/components' })
                      }}
                      className='h-8 text-xs gap-1.5 bg-primary/90 hover:bg-primary'
                    >
                      <Eye className='h-3.5 w-3.5' />
                      Review Component
                    </Button>
                    {!notif.read && (
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => markAsRead(notif._id)}
                        className='h-8 w-8 text-muted-foreground hover:text-foreground'
                        title='Mark as read'
                      >
                        <Check className='h-4 w-4' />
                      </Button>
                    )}
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={() => deleteOne(notif._id)}
                      className='h-8 w-8 text-muted-foreground hover:text-destructive'
                      title='Delete notification'
                    >
                      <Trash2 className='h-3.5 w-3.5' />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
