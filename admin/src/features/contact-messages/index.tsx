import { useMemo, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { RefreshCw, Search as SearchIcon } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { API_URL } from '@/lib/api-url'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

interface ContactMessageUser {
  _id: string
  name?: string
  email?: string
  profilePicture?: string
}

interface ContactMessage {
  _id: string
  name: string
  email: string
  company?: string
  country: string
  message: string
  status: 'submitted' | 'emailed' | 'failed'
  createdAt: string
  userId?: ContactMessageUser | string | null
}

interface ContactMessagesResponse {
  success: boolean
  data: {
    items: ContactMessage[]
  }
}

const EMPTY_MESSAGES: ContactMessage[] = []

function statusVariant(status: ContactMessage['status']) {
  return status === 'failed' ? 'destructive' : 'secondary'
}

export function ContactMessages() {
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['contact-messages', accessToken],
    enabled: Boolean(accessToken),
    queryFn: async () => {
      const res = await axios.get<ContactMessagesResponse>(
        `${API_URL}/contacts`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      return res.data.data.items
    },
  })

  const messages = data ?? EMPTY_MESSAGES

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return messages

    return messages.filter((message) =>
      [
        message.name,
        message.email,
        message.company,
        message.country,
        message.message,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    )
  }, [messages, search])

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>
              Contact Messages
            </h2>
            <p className='text-muted-foreground'>
              Messages submitted through the contact page.
            </p>
          </div>
          <Button
            variant='outline'
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={cn('me-2 h-4 w-4', isFetching && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>

        <div className='relative w-full max-w-sm'>
          <SearchIcon className='absolute inset-s-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Search by name, email, or message...'
            className='ps-9'
          />
        </div>

        {isLoading ? (
          <div className='grid gap-4 lg:grid-cols-2'>
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className='gap-4 py-5'>
                <CardHeader className='px-5'>
                  <Skeleton className='h-5 w-40' />
                  <Skeleton className='h-4 w-56' />
                </CardHeader>
                <CardContent className='space-y-3 px-5'>
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-3/4' />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card className='py-10'>
            <CardContent className='flex flex-col items-center gap-3 px-6 text-center'>
              <p className='font-medium'>Could not load contact messages.</p>
              <p className='text-sm text-muted-foreground'>
                Please check your connection and try again.
              </p>
              <Button variant='outline' onClick={() => refetch()}>
                Try again
              </Button>
            </CardContent>
          </Card>
        ) : filteredMessages.length === 0 ? (
          <Card className='py-10'>
            <CardContent className='px-6 text-center text-muted-foreground'>
              {messages.length === 0
                ? 'No contact messages yet.'
                : 'No messages match your search.'}
            </CardContent>
          </Card>
        ) : (
          <div className='grid gap-4 lg:grid-cols-2'>
            {filteredMessages.map((message) => (
              <Card key={message._id} className='gap-4 py-5'>
                <CardHeader className='px-5'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='min-w-0'>
                      <CardTitle className='truncate text-base'>
                        {message.name}
                      </CardTitle>
                      <p className='truncate text-sm text-muted-foreground'>
                        {message.email}
                      </p>
                    </div>
                    <Badge variant={statusVariant(message.status)}>
                      {message.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='space-y-3 px-5'>
                  <p className='line-clamp-3 text-sm whitespace-pre-wrap text-muted-foreground'>
                    {message.message}
                  </p>
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground'>
                    {message.company ? <span>{message.company}</span> : null}
                    <span>{message.country}</span>
                    <span>
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setSelected(message)}
                  >
                    View message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Main>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
      >
        <DialogContent className='sm:max-w-xl'>
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>
                  {selected.email}
                  {selected.company ? ` · ${selected.company}` : ''} ·{' '}
                  {selected.country}
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-4 text-sm'>
                <p className='whitespace-pre-wrap leading-relaxed'>
                  {selected.message}
                </p>
                <div className='flex flex-wrap items-center gap-3 text-xs text-muted-foreground'>
                  <Badge variant={statusVariant(selected.status)}>
                    {selected.status}
                  </Badge>
                  <span>
                    {new Date(selected.createdAt).toLocaleString(undefined, {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
