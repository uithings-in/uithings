import { useEffect, useRef } from 'react'
import { useRouterState } from '@tanstack/react-router'
import LoadingBar, { type LoadingBarRef } from 'react-top-loading-bar'

export function NavigationProgress() {
  const ref = useRef<LoadingBarRef>(null)
  const status = useRouterState({ select: (state) => state.status })

  useEffect(() => {
    if (status === 'pending') {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [status])

  return (
    <LoadingBar
      color='var(--muted-foreground)'
      ref={ref}
      shadow={true}
      height={2}
    />
  )
}
