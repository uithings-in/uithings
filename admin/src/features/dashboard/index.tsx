import { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import {
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Activity,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'
import { Badge } from '@/components/ui/badge'
import { Analytics } from './components/analytics'
import { Overview } from './components/overview'
import { RecentSales, type RecentSaleItem } from './components/recent-sales'
import { DashboardNotifications } from './components/dashboard-notifications'

interface DashboardData {
  metrics: {
    totalRevenue: number
    thisMonthRevenue: number
    revenueGrowth: number
    activeSubscriptions: number
    totalSubscriptions: number
    subsGrowth: number
    totalSales: number
    thisMonthSales: number
    salesGrowth: number
    activeUsers: number
    totalUsers: number
    proUsers: number
    recent24hUsers: number
    usersGrowth: number
    totalComponents: number
    approvedComponents: number
    pendingComponents: number
    freeComponents: number
    proComponents: number
    totalDownloads: number
  }
  monthlyOverview: {
    name: string
    total: number
  }[]
  recentSales: RecentSaleItem[]
  analytics: {
    past7DaysData: {
      name: string
      date: string
      clicks: number
      uniques: number
      signups: number
      componentsAdded: number
    }[]
    topTags: {
      name: string
      value: number
    }[]
    userTierDistribution: {
      name: string
      value: number
      count: number
    }[]
  }
}

export function Dashboard() {
  const { auth } = useAuthStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(
    async (isManual = false) => {
      try {
        if (isManual) setRefreshing(true)
        else setLoading(true)
        setError(null)

        const res = await axios.get(`${API_URL}/dashboard/stats`, {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        })

        if (res.data?.success && res.data?.data) {
          setData(res.data.data)
        }
      } catch (err: any) {
        console.error('Failed to fetch live dashboard stats:', err)
        setError(
          err.response?.data?.message ||
            'Unable to connect to live database metrics'
        )
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [auth.accessToken]
  )

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const handleDownloadReport = () => {
    if (!data) return

    const rows = [
      ['Metric', 'Value'],
      ['Total Revenue (INR)', data.metrics.totalRevenue],
      ['This Month Revenue (INR)', data.metrics.thisMonthRevenue],
      ['Revenue Growth (%)', `${data.metrics.revenueGrowth}%`],
      ['Active Subscriptions', data.metrics.activeSubscriptions],
      ['Total Subscriptions', data.metrics.totalSubscriptions],
      ['Total Completed Sales', data.metrics.totalSales],
      ['Total Registered Users', data.metrics.totalUsers],
      ['Active Users', data.metrics.activeUsers],
      ['Pro Users', data.metrics.proUsers],
      ['Total Components', data.metrics.totalComponents],
      ['Approved Components', data.metrics.approvedComponents],
      ['Total Downloads', data.metrics.totalDownloads],
      [],
      ['Monthly Revenue Breakdown'],
      ['Month', 'Revenue (INR)'],
      ...data.monthlyOverview.map((m) => [m.name, m.total]),
      [],
      ['Recent Transactions / Activity'],
      ['Customer Name', 'Email', 'Plan', 'Amount (INR)', 'Date'],
      ...data.recentSales.map((s) => [
        `"${s.name}"`,
        `"${s.email}"`,
        `"${s.planName || ''}"`,
        s.amount,
        s.date || '',
      ]),
    ]

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.join(',')).join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `uithings-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const metrics = data?.metrics

  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      {/* ===== Main ===== */}
      <Main>
        <div className='mb-2 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Dashboard</h1>
            <p className='text-xs text-muted-foreground'>
              Real-time platform metrics and business performance
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => fetchStats(true)}
              disabled={loading || refreshing}
              className='gap-1.5'
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? 'animate-spin text-primary' : ''}`}
              />
              <span className='hidden sm:inline'>Refresh</span>
            </Button>
            <Button
              size='sm'
              onClick={handleDownloadReport}
              disabled={!data || loading}
              className='gap-1.5'
            >
              <Download className='h-4 w-4' />
              Download Report
            </Button>
          </div>
        </div>

        {error && !data ? (
          <div className='my-6 flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center'>
            <p className='font-semibold text-destructive mb-2'>{error}</p>
            <Button variant='outline' size='sm' onClick={() => fetchStats()}>
              Retry Connecting
            </Button>
          </div>
        ) : (
          <Tabs orientation='vertical' defaultValue='overview' className='space-y-4'>
            <div className='w-full overflow-x-auto pb-2'>
              <TabsList>
                <TabsTrigger value='overview'>Overview</TabsTrigger>
                <TabsTrigger value='analytics'>Analytics</TabsTrigger>
                <TabsTrigger value='notifications' className='gap-1.5'>
                  <span>Notifications</span>
                  {unreadNotifsCount > 0 && (
                    <Badge
                      variant='destructive'
                      className='px-1.5 py-0 text-[10px] h-4 rounded-full font-semibold'
                    >
                      {unreadNotifsCount}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value='reports' disabled>
                  Reports
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value='overview' className='space-y-4'>
              {/* Stat Cards */}
              <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
                {/* 1. Total Revenue */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Total Revenue</CardTitle>
                    <DollarSign className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    {loading && !data ? (
                      <div className='space-y-2'>
                        <Skeleton className='h-8 w-28' />
                        <Skeleton className='h-3 w-20' />
                      </div>
                    ) : (
                      <>
                        <div className='text-2xl font-bold'>
                          ₹{(metrics?.totalRevenue || 0).toLocaleString()}
                        </div>
                        <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                          {metrics && metrics.revenueGrowth >= 0 ? (
                            <span className='flex items-center text-emerald-500 font-medium'>
                              <TrendingUp className='h-3 w-3 mr-0.5' />
                              +{metrics.revenueGrowth}%
                            </span>
                          ) : (
                            <span className='flex items-center text-rose-500 font-medium'>
                              <TrendingDown className='h-3 w-3 mr-0.5' />
                              {metrics?.revenueGrowth}%
                            </span>
                          )}
                          <span>from last month</span>
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Subscriptions */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Active Subscriptions</CardTitle>
                    <Users className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    {loading && !data ? (
                      <div className='space-y-2'>
                        <Skeleton className='h-8 w-20' />
                        <Skeleton className='h-3 w-24' />
                      </div>
                    ) : (
                      <>
                        <div className='text-2xl font-bold'>
                          +{metrics?.activeSubscriptions || 0}
                        </div>
                        <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                          {metrics && metrics.subsGrowth >= 0 ? (
                            <span className='flex items-center text-emerald-500 font-medium'>
                              <TrendingUp className='h-3 w-3 mr-0.5' />
                              +{metrics.subsGrowth}%
                            </span>
                          ) : (
                            <span className='flex items-center text-rose-500 font-medium'>
                              <TrendingDown className='h-3 w-3 mr-0.5' />
                              {metrics?.subsGrowth}%
                            </span>
                          )}
                          <span>from last month</span>
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 3. Sales / Completed Orders */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Completed Sales</CardTitle>
                    <CreditCard className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    {loading && !data ? (
                      <div className='space-y-2'>
                        <Skeleton className='h-8 w-24' />
                        <Skeleton className='h-3 w-20' />
                      </div>
                    ) : (
                      <>
                        <div className='text-2xl font-bold'>
                          +{metrics?.totalSales || 0}
                        </div>
                        <p className='flex items-center gap-1 text-xs text-muted-foreground'>
                          {metrics && metrics.salesGrowth >= 0 ? (
                            <span className='flex items-center text-emerald-500 font-medium'>
                              <TrendingUp className='h-3 w-3 mr-0.5' />
                              +{metrics.salesGrowth}%
                            </span>
                          ) : (
                            <span className='flex items-center text-rose-500 font-medium'>
                              <TrendingDown className='h-3 w-3 mr-0.5' />
                              {metrics?.salesGrowth}%
                            </span>
                          )}
                          <span>from last month</span>
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* 4. Active Users */}
                <Card>
                  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                    <CardTitle className='text-sm font-medium'>Active Users</CardTitle>
                    <Activity className='h-4 w-4 text-muted-foreground' />
                  </CardHeader>
                  <CardContent>
                    {loading && !data ? (
                      <div className='space-y-2'>
                        <Skeleton className='h-8 w-20' />
                        <Skeleton className='h-3 w-28' />
                      </div>
                    ) : (
                      <>
                        <div className='text-2xl font-bold'>
                          +{metrics?.activeUsers || metrics?.totalUsers || 0}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          <span className='text-emerald-500 font-medium'>
                            +{metrics?.recent24hUsers || 0}
                          </span>{' '}
                          joined in last 24h ({metrics?.totalUsers || 0} total)
                        </p>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Chart & Recent Activity Grid */}
              <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
                <Card className='col-span-1 lg:col-span-4'>
                  <CardHeader>
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription>
                      Monthly earnings breakdown for {new Date().getFullYear()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='ps-2'>
                    {loading && !data ? (
                      <div className='h-[350px] w-full flex items-center justify-center'>
                        <Skeleton className='h-[320px] w-full' />
                      </div>
                    ) : (
                      <Overview data={data?.monthlyOverview} currencySymbol='₹' />
                    )}
                  </CardContent>
                </Card>

                <Card className='col-span-1 lg:col-span-3'>
                  <CardHeader>
                    <CardTitle>Recent Activity & Sales</CardTitle>
                    <CardDescription>
                      {metrics?.thisMonthSales
                        ? `You had ${metrics.thisMonthSales} sales this month.`
                        : 'Latest customer transactions and signups.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading && !data ? (
                      <div className='space-y-4'>
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className='flex items-center gap-4'>
                            <Skeleton className='h-9 w-9 rounded-full' />
                            <div className='space-y-1 flex-1'>
                              <Skeleton className='h-4 w-28' />
                              <Skeleton className='h-3 w-40' />
                            </div>
                            <Skeleton className='h-4 w-14' />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <RecentSales sales={data?.recentSales} currencySymbol='₹' />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value='analytics' className='space-y-4'>
              <Analytics stats={data || undefined} />
            </TabsContent>

            <TabsContent value='notifications' className='space-y-4'>
              <DashboardNotifications onUnreadCountChange={setUnreadNotifsCount} />
            </TabsContent>
          </Tabs>
        )}
      </Main>
    </>
  )
}

