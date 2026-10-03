import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AnalyticsChart } from './analytics-chart'
import { Download, Users, Layers } from 'lucide-react'

interface AnalyticsProps {
  stats?: {
    metrics?: {
      totalDownloads: number
      totalUsers: number
      proUsers: number
      totalComponents: number
      approvedComponents: number
    }
    analytics?: {
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
}

export function Analytics({ stats }: AnalyticsProps) {
  const past7DaysData = stats?.analytics?.past7DaysData || []
  const totalClicksThisWeek = past7DaysData.reduce((acc, d) => acc + d.clicks, 0)
  const totalUniquesThisWeek = past7DaysData.reduce((acc, d) => acc + d.uniques, 0)

  const topTags =
    stats?.analytics?.topTags && stats.analytics.topTags.length > 0
      ? stats.analytics.topTags
      : [
          { name: 'Navbar', value: 12 },
          { name: 'Hero Section', value: 10 },
          { name: 'Card', value: 8 },
          { name: 'Button', value: 7 },
          { name: 'Footer', value: 5 },
        ]

  const userTiers = stats?.analytics?.userTierDistribution || [
    { name: 'Free Users', value: 85, count: 0 },
    { name: 'Pro Subscribers', value: 15, count: 0 },
  ]

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader>
          <CardTitle>Traffic & Activity Overview</CardTitle>
          <CardDescription>Weekly visitor engagement and interactions</CardDescription>
        </CardHeader>
        <CardContent className='px-6'>
          <AnalyticsChart data={past7DaysData} />
        </CardContent>
      </Card>
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Downloads</CardTitle>
            <Download className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.metrics?.totalDownloads?.toLocaleString() ?? 0}
            </div>
            <p className='text-xs text-muted-foreground'>Across all components</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Registered Users</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.metrics?.totalUsers?.toLocaleString() ?? 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats?.metrics?.proUsers ?? 0} Pro members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Est. Weekly Clicks</CardTitle>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              className='h-4 w-4 text-muted-foreground'
            >
              <path d='M3 3v18h18' />
              <path d='M7 15l4-4 4 4 4-6' />
            </svg>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalClicksThisWeek.toLocaleString()}</div>
            <p className='text-xs text-muted-foreground'>
              ~{totalUniquesThisWeek.toLocaleString()} unique visitors
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Components</CardTitle>
            <Layers className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {stats?.metrics?.totalComponents?.toLocaleString() ?? 0}
            </div>
            <p className='text-xs text-muted-foreground'>
              {stats?.metrics?.approvedComponents ?? 0} approved in store
            </p>
          </CardContent>
        </Card>
      </div>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Top Categories & Tags</CardTitle>
            <CardDescription>Most popular tags by component count</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={topTags}
              barClass='bg-primary'
              valueFormatter={(n) => `${n} components`}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>User Subscription Tiers</CardTitle>
            <CardDescription>Breakdown of free vs pro user accounts</CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleBarList
              items={userTiers.map((u) => ({
                name: `${u.name} (${u.count ?? 0})`,
                value: u.value,
              }))}
              barClass='bg-emerald-500'
              valueFormatter={(n) => `${n}%`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SimpleBarList({
  items,
  valueFormatter,
  barClass,
}: {
  items: { name: string; value: number }[]
  valueFormatter: (n: number) => string
  barClass: string
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className='space-y-4'>
      {items.map((i) => {
        const width = `${Math.round((i.value / max) * 100)}%`
        return (
          <li key={i.name} className='flex items-center justify-between gap-3'>
            <div className='min-w-0 flex-1'>
              <div className='mb-1.5 truncate text-xs font-medium text-foreground'>
                {i.name}
              </div>
              <div className='h-2 w-full rounded-full bg-muted'>
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${barClass}`}
                  style={{ width }}
                />
              </div>
            </div>
            <div className='ps-2 text-xs font-semibold tabular-nums text-muted-foreground'>
              {valueFormatter(i.value)}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
