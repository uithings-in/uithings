import { getRouteApi } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { Loader2 } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'
import { UsersDialogs } from './components/users-dialogs'
import { UsersPrimaryButtons } from './components/users-primary-buttons'
import { UsersProvider } from './components/users-provider'
import { UsersTable } from './components/users-table'
import { type User } from './data/schema'

const route = getRouteApi('/_authenticated/users/')

export function Users() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  const { auth } = useAuthStore()

  const {
    data: usersList = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<User[]>({
    queryKey: ['users', auth.accessToken],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      return res.data?.data ?? []
    },
    staleTime: 60 * 1000,
  })

  const errorMessage = error
    ? (error as any).response?.data?.message ||
      (error as Error).message ||
      'Failed to load users from database'
    : null

  return (
    <UsersProvider onRefresh={refetch}>
      <Header fixed>
        <Search className='me-auto' />
        <ThemeSwitch />
        <ConfigDrawer />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {/* Page Header */}
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>User List</h2>
            <p className='text-muted-foreground'>
              Manage your users here.
            </p>
          </div>
          <UsersPrimaryButtons />
        </div>

        {/* Content Table or Error */}
        {errorMessage ? (
          <div className='flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center'>
            <p className='font-semibold text-destructive mb-2'>{errorMessage}</p>
            <Button variant='outline' size='sm' onClick={() => refetch()}>
              Retry Loading Users
            </Button>
          </div>
        ) : loading && usersList.length === 0 ? (
          <div className='flex h-64 items-center justify-center rounded-lg border border-border/60'>
            <div className='flex flex-col items-center gap-2 text-muted-foreground'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <p className='text-sm'>Fetching database users...</p>
            </div>
          </div>
        ) : (
          <UsersTable
            data={usersList}
            search={search}
            navigate={navigate}
            onRefresh={refetch}
          />
        )}
      </Main>

      <UsersDialogs />
    </UsersProvider>
  )
}
