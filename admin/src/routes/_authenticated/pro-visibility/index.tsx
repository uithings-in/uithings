import { createFileRoute } from '@tanstack/react-router'
import { ProVisibilityControl } from '@/features/pro-visibility'

export const Route = createFileRoute('/_authenticated/pro-visibility/')({
  component: ProVisibilityControl,
})
