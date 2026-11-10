import { createFileRoute } from '@tanstack/react-router'
import { ContactMessages } from '@/features/contact-messages'

export const Route = createFileRoute('/_authenticated/contact-messages/')({
  component: ContactMessages,
})
