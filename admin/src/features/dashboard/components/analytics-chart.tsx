import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface AnalyticsChartProps {
  data?: {
    name: string
    date?: string
    clicks: number
    uniques: number
    signups?: number
    componentsAdded?: number
  }[]
}

export function AnalyticsChart({ data = [] }: AnalyticsChartProps) {
  if (data.length === 0) {
    return (
      <div className='flex h-[300px] items-center justify-center text-sm text-muted-foreground'>
        No activity data available yet.
      </div>
    )
  }

  return (
    <ResponsiveContainer width='100%' height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey='name'
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke='#888888'
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className='rounded-lg border border-border bg-card p-2.5 shadow-lg'>
                  <p className='text-xs font-semibold text-foreground mb-1'>{label}</p>
                  <div className='space-y-1 text-xs'>
                    <p className='text-primary font-medium'>
                      Clicks: {payload[0]?.value}
                    </p>
                    {payload[1] && (
                      <p className='text-muted-foreground font-medium'>
                        Unique Visitors: {payload[1]?.value}
                      </p>
                    )}
                  </div>
                </div>
              )
            }
            return null
          }}
        />
        <Area
          type='monotone'
          dataKey='clicks'
          name='Clicks'
          stroke='currentColor'
          className='text-primary'
          fill='currentColor'
          fillOpacity={0.15}
        />
        <Area
          type='monotone'
          dataKey='uniques'
          name='Unique Visitors'
          stroke='currentColor'
          className='text-muted-foreground'
          fill='currentColor'
          fillOpacity={0.1}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
