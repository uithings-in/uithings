import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!fixed) return

    let frame = 0
    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(() => {
        const offset =
          document.body.scrollTop || document.documentElement.scrollTop
        setScrolled(offset > 10)
        frame = 0
      })
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [fixed])

  return (
    <header
      className={cn(
        'z-50 h-16',
        fixed &&
          'header-fixed peer/header sticky top-0 w-[inherit] bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 border-b border-border/40',
        scrolled && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'relative flex h-full items-center gap-3 p-4 sm:gap-4'
        )}
      >
        <SidebarTrigger variant='outline' className='max-md:scale-125' />
        <Separator orientation='vertical' className='h-6' />
        {children}
      </div>
    </header>
  )
}
