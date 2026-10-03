import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface OverviewProps {
  data?: {
    name: string
    total: number
  }[]
  currencySymbol?: string
}

export function Overview({ data = [], currencySymbol = '₹' }: OverviewProps) {
  const chartData =
    data.length > 0
      ? data
      : [
          { name: 'Jan', total: 0 },
          { name: 'Feb', total: 0 },
          { name: 'Mar', total: 0 },
          { name: 'Apr', total: 0 },
          { name: 'May', total: 0 },
          { name: 'Jun', total: 0 },
          { name: 'Jul', total: 0 },
          { name: 'Aug', total: 0 },
          { name: 'Sep', total: 0 },
          { name: 'Oct', total: 0 },
          { name: 'Nov', total: 0 },
          { name: 'Dec', total: 0 },
        ]

  return (
    <ResponsiveContainer width='100%' height={350}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
          tickFormatter={(value) => `${currencySymbol}${value.toLocaleString()}`}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className='rounded-lg border border-border bg-card p-2 shadow-md'>
                  <p className='text-xs font-semibold text-foreground'>{label}</p>
                  <p className='text-xs font-medium text-primary'>
                    Revenue: {currencySymbol}
                    {Number(payload[0].value).toLocaleString()}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Bar
          dataKey='total'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
