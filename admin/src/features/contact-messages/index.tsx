import { useMemo, useState } from 'react'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Check,
  Inbox,
  Loader2,
  Mail,
  RefreshCw,
  Search as SearchIcon,
  Send,
  User,
  X,
} from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { API_URL } from '@/lib/api-url'
import { useAuthStore } from '@/stores/auth-store'

interface ContactMessageUser {
  _id: string
  name?: string
  email?: string
  profilePicture?: string
}

interface ContactReply {
  _id?: string
  author: 'user' | 'admin'
  body: string
  readByUser?: boolean
  readByAdmin?: boolean
  createdAt: string
}

interface ContactMessage {
  _id: string
  name: string
  email: string
  company?: string
  country: string
  subject?: string
  message: string
  status: 'submitted' | 'emailed' | 'failed' | 'replied'
  replies?: ContactReply[]
  createdAt: string
  updatedAt?: string
  userId?: ContactMessageUser | string | null
}

interface ContactMessagesResponse {
  success: boolean
  data: {
    items: ContactMessage[]
  }
}

const EMPTY_MESSAGES: ContactMessage[] = []

type FilterType = 'all' | 'awaiting' | 'replied'

function formatUpdatedTime(dateString?: string) {
  if (!dateString) return 'Updated recently'
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return 'Updated recently'
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const timeStr = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  if (isToday) {
    return `Updated ${timeStr}`
  }
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  return `Updated ${monthNames[date.getMonth()]} ${date.getDate()}, ${timeStr}`
}

function formatFullTime(dateString?: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function parseCategoryAndTitle(rawSubject?: string, message?: string) {
  if (!rawSubject || !rawSubject.trim()) {
    return { category: 'General', title: 'General Inquiry' }
  }
  const trimmed = rawSubject.trim()
  const bracketMatch = trimmed.match(/^\[(.*?)\]\s*(.*)$/)
  if (bracketMatch) {
    return {
      category: bracketMatch[1] || 'Meeting',
      title: bracketMatch[2] || trimmed,
    }
  }
  const text = `${trimmed} ${message || ''}`.toLowerCase()
  if (
    text.includes('meeting') ||
    text.includes('proposal') ||
    text.includes('call') ||
    text.includes('schedule')
  ) {
    return { category: 'Meeting', title: trimmed }
  }
  if (
    text.includes('billing') ||
    text.includes('plan') ||
    text.includes('price') ||
    text.includes('subscription') ||
    text.includes('payment')
  ) {
    return { category: 'Billing', title: trimmed }
  }
  if (
    text.includes('bug') ||
    text.includes('issue') ||
    text.includes('error') ||
    text.includes('problem')
  ) {
    return { category: 'Support', title: trimmed }
  }
  if (text.includes('feedback') || text.includes('feature')) {
    return { category: 'Feedback', title: trimmed }
  }
  return { category: 'Meeting', title: trimmed }
}

function getLastReply(item?: ContactMessage | null): ContactReply | null {
  const replies = item?.replies ?? []
  return replies.length ? replies[replies.length - 1] : null
}

function hasUnreadUserReply(item?: ContactMessage | null): boolean {
  const replies = item?.replies ?? []
  return replies.some((r) => r.author === 'user' && !r.readByAdmin)
}

export function ContactMessages() {
  const accessToken = useAuthStore((state) => state.auth.accessToken)
  const queryClient = useQueryClient()

  const [filter, setFilter] = useState<FilterType>('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [replyBody, setReplyBody] = useState('')
  const [replyError, setReplyError] = useState('')
  const [notice, setNotice] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

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

  const replyMutation = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: string }) => {
      const res = await axios.post(
        `${API_URL}/contacts/${id}/replies`,
        { body },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      return res.data.data as {
        id: string
        status: ContactMessage['status']
        replies: ContactReply[]
      }
    },
    onSuccess: (updated) => {
      setReplyBody('')
      setReplyError('')
      setNotice({ type: 'success', message: 'Reply sent to user.' })
      queryClient.setQueryData(
        ['contact-messages', accessToken],
        (old: ContactMessage[] | undefined) => {
          if (!old) return old
          return old.map((m) =>
            m._id === updated.id
              ? { ...m, status: updated.status, replies: updated.replies }
              : m
          )
        }
      )
      queryClient.invalidateQueries({ queryKey: ['contact-messages'] })
    },
    onError: (error) => {
      const msg =
        error instanceof Error ? error.message : 'Could not send the reply.'
      setReplyError(msg)
      setNotice({ type: 'error', message: msg })
    },
  })

  const filteredMessages = useMemo(() => {
    let result = messages
    if (filter === 'awaiting') {
      result = messages.filter((m) => m.status !== 'replied')
    } else if (filter === 'replied') {
      result = messages.filter((m) => m.status === 'replied')
    }

    const query = search.trim().toLowerCase()
    if (!query) return result

    return result.filter((m) => {
      const { category, title } = parseCategoryAndTitle(m.subject, m.message)
      return [
        title,
        category,
        m.name,
        m.email,
        m.company,
        m.country,
        m.message,
      ]
        .filter(Boolean)
        .some((val) => String(val).toLowerCase().includes(query))
    })
  }, [messages, filter, search])

  const activeId = useMemo(() => {
    if (selectedId && filteredMessages.some((m) => m._id === selectedId)) {
      return selectedId
    }
    return filteredMessages[0]?._id ?? null
  }, [selectedId, filteredMessages])

  const selected = useMemo(
    () => messages.find((m) => m._id === activeId) ?? null,
    [messages, activeId]
  )

  const handleSendReply = () => {
    if (!selected || !replyBody.trim()) {
      setReplyError('Please enter a reply before sending.')
      return
    }
    setReplyError('')
    replyMutation.mutate({
      id: selected._id,
      body: replyBody.trim(),
    })
  }

  return (
    <>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-5 p-4 sm:p-6'>
        {/* MAIN CONTAINER (DARK CARD MATCHING REFERENCE IMAGE) */}
        <div className='flex min-h-[640px] flex-1 flex-col rounded-2xl border border-white/[0.08] bg-[#0c0c0e] p-5 shadow-2xl md:p-6 lg:p-7'>
          {/* TOP BAR / CONTROLS */}
          <div className='flex flex-wrap items-center justify-between gap-4 pb-6'>
            {/* Left: Filter Pills */}
            <div className='flex flex-wrap items-center gap-3'>
              <span className='text-sm font-medium text-neutral-400'>
                Filter:
              </span>
              <div className='flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => setFilter('all')}
                  className={`cursor-pointer rounded-lg px-3.5 py-1 text-xs font-semibold transition ${
                    filter === 'all'
                      ? 'border border-[#F97316] bg-[#1a1412] text-white'
                      : 'border border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  All
                </button>
                <button
                  type='button'
                  onClick={() => setFilter('awaiting')}
                  className={`cursor-pointer rounded-lg px-3.5 py-1 text-xs font-semibold transition ${
                    filter === 'awaiting'
                      ? 'border border-[#F97316] bg-[#1a1412] text-white'
                      : 'border border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  Awaiting
                </button>
                <button
                  type='button'
                  onClick={() => setFilter('replied')}
                  className={`cursor-pointer rounded-lg px-3.5 py-1 text-xs font-semibold transition ${
                    filter === 'replied'
                      ? 'border border-[#F97316] bg-[#1a1412] text-white'
                      : 'border border-neutral-800 bg-transparent text-neutral-400 hover:border-neutral-700 hover:text-white'
                  }`}
                >
                  Replied
                </button>
              </div>

              {/* Integrated Search Input */}
              <div className='relative ml-2'>
                <SearchIcon className='pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500' />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Search inquiries...'
                  className='h-7 w-36 rounded-lg border border-neutral-800 bg-[#141417] pr-2.5 pl-8 text-xs text-neutral-200 placeholder:text-neutral-500 outline-none transition focus:w-56 focus:border-[#F97316] sm:w-48'
                />
              </div>
            </div>

            {/* Right: Refresh & Count */}
            <div className='ml-auto flex items-center gap-3'>
              <span className='hidden text-xs text-neutral-500 sm:inline'>
                {filteredMessages.length} of {messages.length} messages
              </span>
              <button
                type='button'
                onClick={() => refetch()}
                disabled={isFetching}
                title='Refresh messages'
                className='flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-neutral-800 text-neutral-400 transition hover:bg-neutral-800 hover:text-white disabled:opacity-50'
              >
                <RefreshCw
                  size={13}
                  className={isFetching ? 'animate-spin text-[#F97316]' : ''}
                />
              </button>
            </div>
          </div>

          {/* 2-COLUMN MAIN CONTENT (LEFT: INQUIRY LIST, RIGHT: VIEW & REPLY) */}
          <div className='grid min-h-0 flex-1 grid-cols-1 gap-5 lg:grid-cols-12'>
            {/* LEFT COLUMN: MESSAGE LIST */}
            <div className='flex max-h-[620px] flex-col space-y-3 overflow-y-auto pr-1.5 lg:col-span-5 xl:col-span-4'>
              {isLoading ? (
                <div className='flex h-64 flex-col items-center justify-center gap-2 text-xs text-neutral-500'>
                  <Loader2 size={18} className='animate-spin text-[#F97316]' />
                  <span>Loading inquiries...</span>
                </div>
              ) : isError ? (
                <div className='flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-800 p-6 text-center'>
                  <p className='text-xs font-semibold text-rose-400'>
                    Failed to load contact messages.
                  </p>
                  <button
                    type='button'
                    onClick={() => refetch()}
                    className='rounded-lg bg-neutral-800 px-3 py-1.5 text-xs text-neutral-200 hover:bg-neutral-700'
                  >
                    Retry
                  </button>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className='flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-neutral-800 p-6 text-center'>
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-neutral-500'>
                    <Inbox size={18} />
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-neutral-300'>
                      {messages.length === 0
                        ? 'No contact messages yet'
                        : 'No messages match your search'}
                    </p>
                    <p className='mt-1 text-[11px] text-neutral-500'>
                      Inquiries submitted by users will appear here.
                    </p>
                  </div>
                </div>
              ) : (
                filteredMessages.map((m) => {
                  const isSelected = m._id === activeId
                  const lastReply = getLastReply(m)
                  const snippet = lastReply?.body || m.message || 'No content'
                  const { category, title } = parseCategoryAndTitle(
                    m.subject,
                    m.message
                  )
                  const updatedTime = formatUpdatedTime(
                    lastReply?.createdAt || m.updatedAt || m.createdAt
                  )
                  const unread = hasUnreadUserReply(m)

                  return (
                    <div
                      key={m._id}
                      onClick={() => setSelectedId(m._id)}
                      className={`group relative cursor-pointer rounded-xl p-4 text-left transition ${
                        isSelected
                          ? 'border-l-4 border-[#F97316] bg-[#1a1715]/95 pl-3.5 shadow-md'
                          : 'border-l-4 border-transparent pl-3.5 hover:bg-neutral-900/60'
                      }`}
                    >
                      {/* Top Row: Title + Category Pill */}
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex min-w-0 items-center gap-2'>
                          {unread && (
                            <span className='h-2 w-2 shrink-0 rounded-full bg-[#F97316]' />
                          )}
                          <h4
                            className={`truncate text-sm font-semibold transition ${
                              isSelected
                                ? 'text-white'
                                : 'text-neutral-200 group-hover:text-white'
                            }`}
                          >
                            {title}
                          </h4>
                        </div>
                        <span className='shrink-0 rounded-full bg-[#232330] px-2.5 py-0.5 text-[10.5px] font-medium text-[#9da5bd]'>
                          {category}
                        </span>
                      </div>

                      {/* Snippet Row */}
                      <p className='mt-2 line-clamp-1 truncate text-xs leading-relaxed text-neutral-400'>
                        {snippet}
                      </p>

                      {/* Footer Row: Timestamp & Sender / Status */}
                      <div className='mt-3.5 flex items-center justify-between text-[11px] font-medium text-neutral-500'>
                        <span>{updatedTime}</span>
                        <div className='flex items-center gap-2'>
                          <span className='max-w-[120px] truncate text-[10.5px] text-neutral-400'>
                            {m.name}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9.5px] font-semibold uppercase ${
                              m.status === 'replied'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-amber-500/10 text-amber-400'
                            }`}
                          >
                            {m.status === 'replied' ? 'Replied' : 'Awaiting'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* RIGHT COLUMN: VIEWING INQUIRY & INLINE REPLY */}
            <div className='flex min-h-[480px] flex-col lg:col-span-7 xl:col-span-8'>
              {selected ? (
                <div className='flex flex-1 flex-col justify-between overflow-y-auto rounded-2xl border border-white/[0.04] bg-[#121214] p-6 lg:p-8'>
                  <div className='space-y-6'>
                    {/* Header: Title, Category & Timestamp */}
                    <div>
                      <div className='flex flex-wrap items-center justify-between gap-3'>
                        <h2 className='text-lg font-bold tracking-tight text-white lg:text-xl'>
                          {
                            parseCategoryAndTitle(
                              selected.subject,
                              selected.message
                            ).title
                          }
                        </h2>
                        <span className='rounded-full bg-[#232330] px-3 py-1 text-xs font-medium text-[#9da5bd]'>
                          {
                            parseCategoryAndTitle(
                              selected.subject,
                              selected.message
                            ).category
                          }
                        </span>
                      </div>
                      <p className='mt-1 text-xs font-medium text-neutral-400'>
                        {formatUpdatedTime(
                          selected.updatedAt || selected.createdAt
                        )}
                      </p>
                    </div>

                    {/* Sender Details Pill / Bar */}
                    <div className='flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-800/80 bg-[#161619] p-3 text-xs text-neutral-300'>
                      <div className='flex items-center gap-1.5'>
                        <User size={13} className='text-[#F97316]' />
                        <span className='font-semibold text-white'>
                          {selected.name}
                        </span>
                      </div>
                      <div className='text-neutral-400'>
                        <span className='text-neutral-500'>Email:</span>{' '}
                        {selected.email}
                      </div>
                      {selected.company && (
                        <div className='text-neutral-400'>
                          <span className='text-neutral-500'>Company:</span>{' '}
                          {selected.company}
                        </div>
                      )}
                      <div className='text-neutral-400'>
                        <span className='text-neutral-500'>Country:</span>{' '}
                        {selected.country}
                      </div>
                      <span
                        className={`ml-auto rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          selected.status === 'replied'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {selected.status}
                      </span>
                    </div>

                    {/* Original Message */}
                    <div className='rounded-xl border border-white/[0.04] bg-[#161619]/60 p-5'>
                      <h4 className='text-[11px] font-bold uppercase tracking-wider text-neutral-500'>
                        Initial Request
                      </h4>
                      <p className='mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-200'>
                        {selected.message}
                      </p>
                    </div>

                    {/* Conversation Replies History */}
                    {selected.replies && selected.replies.length > 0 && (
                      <div className='space-y-4 border-t border-neutral-800/80 pt-6'>
                        <h4 className='text-xs font-bold uppercase tracking-wider text-neutral-400'>
                          Conversation History
                        </h4>
                        {selected.replies.map((reply, idx) => {
                          const fromAdmin = reply.author === 'admin'
                          return (
                            <div
                              key={reply._id || idx}
                              className={`rounded-xl border p-4 ${
                                fromAdmin
                                  ? 'border-[#F97316]/30 bg-[#181614] text-neutral-200'
                                  : 'border-neutral-800 bg-[#161619] text-neutral-300'
                              }`}
                            >
                              <div className='flex items-center justify-between text-xs font-semibold'>
                                <span
                                  className={
                                    fromAdmin
                                      ? 'text-[#F97316]'
                                      : 'text-neutral-300'
                                  }
                                >
                                  {fromAdmin
                                    ? 'Support (You)'
                                    : `User (${selected.name})`}
                                </span>
                                <span className='text-[11px] font-normal text-neutral-500'>
                                  {formatFullTime(reply.createdAt)}
                                </span>
                              </div>
                              <p className='mt-2 whitespace-pre-wrap text-xs leading-relaxed text-neutral-300'>
                                {reply.body}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Inline Direct Reply Section */}
                  <div className='mt-8 border-t border-neutral-800/80 pt-6'>
                    <div className='rounded-xl border border-neutral-800 bg-[#161619] p-3 transition focus-within:border-[#F97316]'>
                      <textarea
                        value={replyBody}
                        onChange={(e) => {
                          setReplyBody(e.target.value)
                          if (replyError) setReplyError('')
                        }}
                        rows={3}
                        placeholder={`Write reply to ${selected.name}...`}
                        className='w-full resize-none bg-transparent text-xs leading-relaxed text-neutral-200 placeholder:text-neutral-500 outline-none'
                      />
                      {replyError && (
                        <p className='mt-1 text-xs text-rose-500'>
                          {replyError}
                        </p>
                      )}
                      <div className='mt-2 flex items-center justify-between border-t border-neutral-800/60 pt-2'>
                        <span className='text-[11px] text-neutral-500'>
                          The response will be emailed to {selected.email}.
                        </span>
                        <button
                          type='button'
                          disabled={!replyBody.trim() || replyMutation.isPending}
                          onClick={handleSendReply}
                          className='inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#F97316] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#EA580C] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          {replyMutation.isPending ? (
                            <Loader2 size={12} className='animate-spin' />
                          ) : (
                            <Send size={12} />
                          )}
                          <span>Send reply</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* EMPTY STATE */
                <div className='flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-white/[0.04] bg-[#121214] p-8 text-center'>
                  <div className='flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-neutral-500'>
                    <Mail size={22} />
                  </div>
                  <div>
                    <h3 className='text-sm font-semibold text-neutral-300'>
                      No inquiry selected
                    </h3>
                    <p className='mt-1 max-w-sm text-xs text-neutral-500'>
                      Select a contact message from the left to view user
                      details, conversation history, and send a reply.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FLOATING TOAST NOTIFICATION */}
        {notice && (
          <div
            className={`fixed right-6 bottom-6 z-[140] flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold shadow-2xl backdrop-blur-md transition-all ${
              notice.type === 'success'
                ? 'border-emerald-500/30 bg-[#0f1f17] text-emerald-300'
                : 'border-rose-500/30 bg-[#251014] text-rose-300'
            }`}
          >
            {notice.type === 'success' ? (
              <Check size={15} className='text-emerald-400' />
            ) : (
              <X size={15} className='text-rose-400' />
            )}
            <span>{notice.message}</span>
          </div>
        )}
      </Main>
    </>
  )
}
