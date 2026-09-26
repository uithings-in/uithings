import { createFileRoute } from '@tanstack/react-router'
import { UserProfile } from '@/features/users/components/user-profile'

export const Route = createFileRoute('/_authenticated/users/$userId')({
  component: UserProfile,
})
