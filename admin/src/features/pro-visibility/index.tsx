import { useState, useEffect, useCallback, useMemo } from 'react'
import axios from 'axios'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { copyToFigma } from '@/lib/clipboard'
import {
  Crown,
  Eye,
  Search,
  Copy,
  Lock,
  Layers,
  Loader2,
} from 'lucide-react'
import { API_URL } from '@/lib/api-url'

export interface AdminProComponent {
  _id: string
  name: string
  description?: string
  tags: string[]
  previewImageUrl: string
  lightPreviewImageUrl?: string
  darkPreviewImageUrl?: string
  wireframePreviewImageUrl?: string
  designType?: string
  pricingType: 'Free' | 'Pro'
  isVisibleWithoutSubscription?: boolean
  figmaDataBase64?: string
  createdBy?: {
    _id?: string
    name?: string
    email?: string
    profilePicture?: string
  }
  status?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  downloadCount?: number
  createdAt: string
  updatedAt: string
}

export function ProVisibilityControl() {
  const [components, setComponents] = useState<AdminProComponent[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all')
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [copyingId, setCopyingId] = useState<string | null>(null)

  const { accessToken } = useAuthStore.getState().auth

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchProComponents = useCallback(
    async (
      pageNum = 1,
      searchQuery = debouncedSearch,
      status = statusFilter,
      vis = visibilityFilter
    ) => {
      try {
        if (pageNum === 1) setLoading(true)
        else setLoadingMore(true)

        let url = `${API_URL}/components/admin?page=${pageNum}&limit=50&pricingType=Pro`
        if (searchQuery.trim()) {
          url += `&q=${encodeURIComponent(searchQuery.trim())}`
        }
        if (status !== 'all') {
          url += `&status=${status}`
        }
        if (vis === 'unlocked') {
          url += `&isVisibleWithoutSubscription=true`
        } else if (vis === 'locked') {
          url += `&isVisibleWithoutSubscription=false`
        }

        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })

        const fetchedItems: AdminProComponent[] = response.data.data.items || []
        if (pageNum === 1) {
          setComponents(fetchedItems)
        } else {
          setComponents((prev) => [...prev, ...fetchedItems])
        }
        setTotalPages(response.data.data.pagination.totalPages || 1)
        setPage(pageNum)
      } catch (error) {
        toast.error('Failed to load Pro components')
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [accessToken, debouncedSearch, statusFilter, visibilityFilter]
  )

  useEffect(() => {
    fetchProComponents(1, debouncedSearch, statusFilter, visibilityFilter)
  }, [debouncedSearch, statusFilter, visibilityFilter, fetchProComponents])

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (!loading && !loadingMore && page < totalPages) {
          fetchProComponents(page + 1, debouncedSearch, statusFilter, visibilityFilter)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, totalPages, loading, loadingMore, debouncedSearch, statusFilter, visibilityFilter, fetchProComponents])

  // Toggle visibility without subscription
  const handleToggleVisibility = async (component: AdminProComponent) => {
    const nextState = !component.isVisibleWithoutSubscription
    setTogglingId(component._id)

    // Optimistic UI update
    setComponents((prev) =>
      prev.map((c) =>
        c._id === component._id
          ? { ...c, isVisibleWithoutSubscription: nextState }
          : c
      )
    )

    try {
      const response = await axios.patch(
        `${API_URL}/components/${component._id}/visibility`,
        { isVisibleWithoutSubscription: nextState },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      if (response.data.success) {
        toast.success(
          nextState
            ? `"${component.name}" is now visible to free users without subscription!`
            : `"${component.name}" is now locked to Pro subscribers only.`
        )
      }
    } catch (error: any) {
      // Revert optimistic update
      setComponents((prev) =>
        prev.map((c) =>
          c._id === component._id
            ? { ...c, isVisibleWithoutSubscription: !nextState }
            : c
        )
      )
      toast.error(
        error.response?.data?.message || 'Failed to update visibility status'
      )
    } finally {
      setTogglingId(null)
    }
  }

  // Copy Figma code
  const handleCopy = async (id: string, name: string, figmaData?: string) => {
    try {
      setCopyingId(id)
      let dataToCopy = figmaData
      if (!dataToCopy) {
        const res = await axios.get(`${API_URL}/components/${id}/data`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        dataToCopy = res.data.data.figmaDataBase64
      }

      if (!dataToCopy) {
        toast.error('Component Figma data not available')
        return
      }

      await copyToFigma(dataToCopy, name)
      toast.success('Copied component to Figma clipboard!')
    } catch (err) {
      toast.error('Failed to copy Figma data')
    } finally {
      setCopyingId(null)
    }
  }

  // Derived stats
  const stats = useMemo(() => {
    const total = components.length
    const unlocked = components.filter((c) => c.isVisibleWithoutSubscription).length
    const locked = total - unlocked
    const totalDownloads = components.reduce((sum, c) => sum + (c.downloadCount || 0), 0)
    return { total, unlocked, locked, totalDownloads }
  }, [components])

  return (
    <>
      <Header fixed>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">Pro Visibility Control</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control which Pro components are visible without subscription
            </p>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Pro Components
              </CardTitle>
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                <Crown className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Exclusive components</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-blue-500/5 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Visible to Free Users
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400">
                <Eye className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.unlocked}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Visible in gallery (subscription required to copy)</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Subscription Required
              </CardTitle>
              <div className="p-2 rounded-lg bg-slate-500/10 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.locked}</div>
              <p className="text-xs text-muted-foreground mt-1">Paid subscribers only</p>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Downloads
              </CardTitle>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Layers className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDownloads}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all Pro components</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3 rounded-xl border border-border/70 shadow-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search Pro components by name or tags..."
              className="pl-9 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Visibility Mode Selector */}
            <Select
              value={visibilityFilter}
              onValueChange={(val: any) => setVisibilityFilter(val)}
            >
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Access Levels</SelectItem>
                <SelectItem value="unlocked">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Unlocked (Free Access)
                  </span>
                </SelectItem>
                <SelectItem value="locked">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400" />
                    Subscription Only
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Approval Status */}
            <Select
              value={statusFilter}
              onValueChange={(val: any) => setStatusFilter(val)}
            >
              <SelectTrigger className="h-9 w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || visibilityFilter !== 'all' || statusFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('')
                  setVisibilityFilter('all')
                  setStatusFilter('all')
                }}
                className="h-9 text-xs"
              >
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Components Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading Pro components...</p>
          </div>
        ) : components.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-card/40">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Crown className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold">No Pro components found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {searchTerm || visibilityFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search query or filters.'
                : 'No Pro components have been uploaded to the platform yet.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {components.map((comp) => {
              const isUnlocked = Boolean(comp.isVisibleWithoutSubscription)
              const isToggling = togglingId === comp._id

              return (
                <div
                  key={comp._id}
                  className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col bg-card ${
                    isUnlocked
                      ? 'border-emerald-500/40 shadow-xs ring-1 ring-emerald-500/20'
                      : 'border-border/70 hover:border-border shadow-xs'
                  }`}
                >
                  {/* Top Preview */}
                  <div className="relative h-44 bg-[#F3F3F6] dark:bg-zinc-900/60 p-3 border-b dark:border-white/10 flex items-center justify-center overflow-hidden">
                    {comp.previewImageUrl ? (
                      <img
                        src={comp.previewImageUrl}
                        alt={comp.name}
                        className="w-full h-full object-contain transition-transform group-hover:scale-102 duration-300"
                      />
                    ) : (
                      <div className="text-xs text-muted-foreground">No Preview</div>
                    )}

                    {/* Top-left Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="flex items-center gap-1 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        <Crown className="w-3 h-3" />
                        PRO
                      </span>
                    </div>

                    {/* Top-right Status & Visibility Indicator */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                      {isUnlocked && (
                        <span className="flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs animate-in fade-in">
                          <Eye className="w-3 h-3" />
                          VISIBLE TO FREE USERS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-base line-clamp-1" title={comp.name}>
                        {comp.name}
                      </h3>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1">
                      By {comp.createdBy?.name || 'Unknown Author'}
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <Badge variant="secondary" className="text-[11px] font-normal">
                        {comp.designType || 'UI Design'}
                      </Badge>
                      {comp.tags?.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] font-normal">
                          {tag}
                        </Badge>
                      ))}
                      {(comp.tags?.length || 0) > 2 && (
                        <span className="text-[10px] text-muted-foreground">
                          +{(comp.tags?.length || 0) - 2}
                        </span>
                      )}
                    </div>

                    {/* Controlling Section: Switch Toggle */}
                    <div className="mt-4 pt-3.5 border-t border-border/70 flex flex-col gap-2">
                      <div
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                          isUnlocked
                            ? 'bg-blue-500/10 border-blue-500/30'
                            : 'bg-muted/40 border-border/50'
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                            {isUnlocked ? (
                              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                            Visible to Free Users
                          </span>
                          <span className="text-[10.5px] text-muted-foreground mt-0.5">
                            {isUnlocked
                              ? 'Visible in gallery • Subscription required to copy'
                              : 'Hidden from free users • Subscription required to copy'}
                          </span>
                        </div>

                        <Switch
                          checked={isUnlocked}
                          disabled={isToggling}
                          onCheckedChange={() => handleToggleVisibility(comp)}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Preview
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[760px] overflow-hidden">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <span>{comp.name}</span>
                              <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-500">
                                PRO
                              </Badge>
                            </DialogTitle>
                            <DialogDescription>
                              Created by {comp.createdBy?.name || 'Unknown'} •{' '}
                              {isUnlocked ? 'Unlocked for free users' : 'Subscription required'}
                            </DialogDescription>
                          </DialogHeader>

                          <div className="flex flex-col gap-4 py-2">
                            {comp.previewImageUrl && (
                              <div className="rounded-xl overflow-hidden border bg-[#F3F3F6] dark:bg-zinc-900 p-3 flex items-center justify-center min-h-[300px] max-h-[380px]">
                                <img
                                  src={comp.previewImageUrl}
                                  alt={comp.name}
                                  className="w-full h-full object-contain max-h-[340px]"
                                />
                              </div>
                            )}

                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                              <div className="text-xs">
                                <span className="font-semibold block">Free Visibility Status:</span>
                                <span className="text-muted-foreground">
                                  {isUnlocked
                                    ? 'Visible to all users on the components page without subscription'
                                    : 'Only visible to users who have an active subscription'}
                                </span>
                              </div>
                              <Switch
                                checked={isUnlocked}
                                disabled={isToggling}
                                onCheckedChange={() => handleToggleVisibility(comp)}
                              />
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1 text-xs h-8"
                        disabled={copyingId === comp._id}
                        onClick={() =>
                          handleCopy(comp._id, comp.name, comp.figmaDataBase64)
                        }
                      >
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        {copyingId === comp._id ? 'Copying...' : 'Figma'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Load more indicator */}
        {loadingMore && (
          <div className="flex justify-center py-6">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
      </Main>
    </>
  )
}
