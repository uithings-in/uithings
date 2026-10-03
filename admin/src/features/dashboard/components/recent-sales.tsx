import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export interface RecentSaleItem {
  id: string
  name: string
  email: string
  profilePicture?: string
  amount: number
  currency: string
  planName?: string
  date?: string
}

interface RecentSalesProps {
  sales?: RecentSaleItem[]
  currencySymbol?: string
}

export function RecentSales({ sales = [], currencySymbol = '₹' }: RecentSalesProps) {
  if (!sales || sales.length === 0) {
    return (
      <div className='flex h-[320px] flex-col items-center justify-center text-center text-muted-foreground'>
        <p className='text-sm'>No sales or activity recorded yet</p>
        <p className='text-xs text-muted-foreground/70'>New transactions will appear here live</p>
      </div>
    )
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  return (
    <div className='space-y-6'>
      {sales.slice(0, 5).map((sale) => {
        const symbol = sale.currency === 'USD' ? '$' : currencySymbol
        return (
          <div key={sale.id} className='flex items-center gap-4'>
            <Avatar className='h-9 w-9 border border-border/50'>
              {sale.profilePicture && (
                <AvatarImage src={sale.profilePicture} alt={sale.name} />
              )}
              <AvatarFallback className='text-xs font-semibold'>
                {getInitials(sale.name)}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-1 flex-wrap items-center justify-between gap-1'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm leading-none font-medium'>{sale.name}</p>
                  {sale.planName && (
                    <Badge variant='outline' className='text-[10px] px-1.5 py-0 h-4'>
                      {sale.planName}
                    </Badge>
                  )}
                </div>
                <p className='text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-[220px]'>
                  {sale.email}
                </p>
              </div>
              <div className='text-right'>
                <div className='text-sm font-semibold text-emerald-500'>
                  +{symbol}
                  {Number(sale.amount).toLocaleString()}
                </div>
                {sale.date && (
                  <p className='text-[10px] text-muted-foreground'>
                    {new Date(sale.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
