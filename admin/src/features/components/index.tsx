import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { copyToFigma } from '@/lib/clipboard'
import { Copy, Eye, AlertTriangle, Search, X } from 'lucide-react'
import { API_URL } from '@/lib/api-url'

const REJECTION_PRESETS = [
  {
    id: 'copied',
    title: 'Copied / Unoriginal Work',
    message:
      'This submission was rejected because it appears to be copied. We require all components to be completely original, and third-party designs are not permitted. Please only submit your own unique work.',
  },
  {
    id: 'layer-structure',
    title: 'Disorganized Layers & Naming',
    message:
      'This component was rejected because the layer structure is disorganized and lacks proper naming conventions. Please organize your layers into a clean hierarchy and ensure all elements are clearly labeled.',
  },
  {
    id: 'auto-layout',
    title: 'Auto Layout & Responsiveness',
    message:
      'This component was rejected because it does not respond correctly to resizing. Please ensure you are using proper auto layout constraints and responsive grid systems so the design adapts smoothly.',
  },
  {
    id: 'custom',
    title: 'Custom Message',
    message: '',
  },
]

export function ComponentsModeration() {
  const [components, setComponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [actions, setActions] = useState<Record<string, string>>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [rejectDialog, setRejectDialog] = useState<{
    open: boolean
    compId: string
    compName: string
    selectedPreset: string
    customReason: string
    reason: string
    submitting: boolean
  }>({
    open: false,
    compId: '',
    compName: '',
    selectedPreset: 'copied',
    customReason: '',
    reason: REJECTION_PRESETS[0].message,
    submitting: false,
  })
  const { accessToken } = useAuthStore.getState().auth

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const fetchComponents = useCallback(async (pageNum = 1, searchQuery = debouncedSearch, status = statusFilter) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)
      
      let url = `${API_URL}/components/admin?page=${pageNum}&limit=20`
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`
      }
      if (status !== 'all') {
        url += `&status=${status}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      const fetchedItems = response.data.data.items || []
      if (pageNum === 1) {
        setComponents(fetchedItems)
      } else {
        setComponents(prev => [...prev, ...fetchedItems])
      }
      setTotalPages(response.data.data.pagination.totalPages || 1)
      setPage(pageNum)
    } catch (error) {
      toast.error('Failed to fetch components')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [accessToken, debouncedSearch, statusFilter])

  useEffect(() => {
    fetchComponents(1, debouncedSearch, statusFilter)
  }, [debouncedSearch, statusFilter, fetchComponents])

  useEffect(() => {
    const handleScroll = () => {
      // Check if user scrolled near the bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (!loading && !loadingMore && page < totalPages) {
          fetchComponents(page + 1, debouncedSearch, statusFilter)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, totalPages, loading, loadingMore, debouncedSearch, statusFilter, fetchComponents])

  const handleSaveAction = async (id: string) => {
    const action = actions[id]
    if (!action) return

    const targetComp = components.find((c) => c._id === id)

    if (action === 'rejected') {
      const existingReason = targetComp?.rejectionReason || ''
      const matchingPreset = REJECTION_PRESETS.find(
        (p) => p.id !== 'custom' && p.message === existingReason
      )
      const defaultPresetId = matchingPreset
        ? matchingPreset.id
        : existingReason
        ? 'custom'
        : 'copied'
      const defaultReason = matchingPreset
        ? matchingPreset.message
        : existingReason || REJECTION_PRESETS[0].message

      setRejectDialog({
        open: true,
        compId: id,
        compName: targetComp?.name || 'Component',
        selectedPreset: defaultPresetId,
        customReason: defaultPresetId === 'custom' ? existingReason : '',
        reason: defaultReason,
        submitting: false,
      })
      return
    }

    try {
      if (action === 'delete') {
        if (!confirm('Are you sure you want to delete this component permanently?')) return
        await axios.delete(`${API_URL}/components/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        setComponents(prev => prev.filter(c => c._id !== id))
        toast.success('Component deleted')
      } else {
        await axios.patch(`${API_URL}/components/${id}/status`, { status: action }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        })
        setComponents(prev => prev.map(c => c._id === id ? { ...c, status: action } : c))
        toast.success(`Component ${action}`)
      }
    } catch (error) {
      toast.error('Failed to perform action')
    }
  }

  const handleConfirmReject = async () => {
    if (!rejectDialog.compId) return
    const finalReason = rejectDialog.reason.trim()
    if (!finalReason) {
      toast.error('Please select or enter a rejection reason')
      return
    }
    try {
      setRejectDialog(prev => ({ ...prev, submitting: true }))
      await axios.patch(
        `${API_URL}/components/${rejectDialog.compId}/status`,
        {
          status: 'rejected',
          rejectionReason: finalReason,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      setComponents(prev =>
        prev.map(c =>
          c._id === rejectDialog.compId
            ? { ...c, status: 'rejected', rejectionReason: finalReason }
            : c
        )
      )
      toast.success('Component rejected with message')
      setRejectDialog({
        open: false,
        compId: '',
        compName: '',
        selectedPreset: 'copied',
        customReason: '',
        reason: REJECTION_PRESETS[0].message,
        submitting: false,
      })
    } catch (error) {
      toast.error('Failed to reject component')
      setRejectDialog(prev => ({ ...prev, submitting: false }))
    }
  }

  const handleCopy = async (id: string, name: string, figmaDataBase64: string) => {
    try {
      setCopyingId(id)
      await copyToFigma(figmaDataBase64, name)
      toast.success('Copied to Figma clipboard!')
    } catch (error) {
      console.error(error)
      toast.error('Failed to copy to clipboard')
    } finally {
      setCopyingId(null)
    }
  }

  return (
    <>
      <Header fixed>
        <div className='me-auto' />
        <ThemeSwitch />
        <ProfileDropdown />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Component Moderation</h2>
            <p className='text-muted-foreground text-sm'>
              Review and approve components submitted by users.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-72 lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search components, tags, design..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-8 h-10 w-full rounded-xl bg-card border-border shadow-xs focus-visible:ring-1"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => setStatusFilter(val as any)}
            >
              <SelectTrigger className="h-10 w-[140px] rounded-xl bg-card border-border shadow-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : components.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center border rounded-2xl bg-card/50">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-base font-medium">No components found</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter to find what you are looking for.'
                : 'There are currently no components available to moderate.'}
            </p>
            {(searchTerm || statusFilter !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all')
                }}
              >
                Clear search & filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {components.map((comp) => (
              <div key={comp._id} className="group relative rounded-2xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
                {/* Preview Image */}
                <div className="relative h-48 bg-[#F3F3F6] p-4 border-b dark:border-white/10">
                  {comp.previewImageUrl ? (
                    <img 
                      src={comp.previewImageUrl} 
                      alt={comp.name} 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Preview</div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      comp.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                      comp.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                      'bg-yellow-100 text-yellow-700 border border-yellow-200'
                    }`}>
                      {comp.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{comp.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">by {comp.createdBy?.name || 'Unknown'}</p>
                  
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="secondary" className="text-xs">{comp.designType || 'UI Design'}</Badge>
                    <Badge variant="outline" className="text-xs">{comp.pricingType}</Badge>
                  </div>

                  <div className="mt-auto pt-6 flex flex-wrap gap-2">
                    {/* View Button */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex-1"
                        >
                          <Eye className="w-4 h-4 mr-1.5" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px] overflow-hidden">
                        <DialogHeader>
                          <DialogTitle>{comp.name}</DialogTitle>
                          <DialogDescription>
                            Submitted by {comp.createdBy?.name || 'Unknown'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-3">
                          {comp.previewImageUrl && (
                            <div className="rounded-md overflow-hidden border bg-[#F3F3F6] p-3 dark:border-white/10 flex items-center justify-center min-h-[340px] max-h-[380px]">
                              <img 
                                src={comp.previewImageUrl} 
                                alt={comp.name} 
                                className="w-full h-full object-contain max-h-[350px]"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {comp.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="flex flex-wrap sm:flex-nowrap items-start gap-[60px]">
                            <div className="shrink-0">
                              <h4 className="text-sm font-semibold mb-1">Design Type</h4>
                              <p className="text-sm text-muted-foreground">{comp.designType || 'UI Design'}</p>
                            </div>
                            <div className="shrink-0">
                              <h4 className="text-sm font-semibold mb-1">Platform</h4>
                              <p className="text-sm text-muted-foreground">
                                {comp.platform
                                  ? comp.platform.charAt(0).toUpperCase() + comp.platform.slice(1).toLowerCase()
                                  : comp.tags?.some((t: string) => t.toLowerCase() === 'app')
                                  ? 'App'
                                  : 'Web'}
                              </p>
                            </div>
                            <div className="shrink-0">
                              <h4 className="text-sm font-semibold mb-1">Pricing</h4>
                              <p className="text-sm text-muted-foreground capitalize">{comp.pricingType}</p>
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold mb-1">Tags</h4>
                              {(() => {
                                const displayTags = (comp.tags || []).filter(
                                  (tag: string) => !['web', 'app'].includes(tag.toLowerCase())
                                )
                                return displayTags.length > 0 ? (
                                  <div className="flex flex-wrap gap-1.5 items-center">
                                    {displayTags.map((tag: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-xs whitespace-nowrap">{tag}</Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">None</p>
                                )
                              })()}
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Copy Button */}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      disabled={copyingId === comp._id}
                      onClick={() => handleCopy(comp._id, comp.name, comp.figmaDataBase64)}
                    >
                      <Copy className="w-4 h-4 mr-1.5" />
                      {copyingId === comp._id ? 'Copying...' : 'Figma'}
                    </Button>
                  </div>

                  {/* Moderation Actions */}
                  <div className="mt-2 flex items-center gap-2 border-t pt-3">
                    <select
                      className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      value={actions[comp._id] || ""}
                      onChange={(e) => setActions({ ...actions, [comp._id]: e.target.value })}
                    >
                      <option value="" disabled>Select Action...</option>
                      <option value="approved">Approve (Public)</option>
                      <option value="rejected">Reject (Private)</option>
                      <option value="delete">Delete (Remove)</option>
                    </select>
                    <Button 
                      size="sm"
                      onClick={() => handleSaveAction(comp._id)}
                      disabled={!actions[comp._id] || (actions[comp._id] === comp.status && actions[comp._id] !== 'delete')}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {loadingMore && (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </Main>

      {/* Component Rejection Reason Modal */}
      <Dialog
        open={rejectDialog.open}
        onOpenChange={(open) => {
          if (!rejectDialog.submitting) {
            setRejectDialog((prev) => ({ ...prev, open }))
          }
        }}
      >
        <DialogContent className="sm:max-w-[580px] max-h-[92vh] overflow-y-auto rounded-2xl p-6">
          <DialogHeader className="pb-1">
            <DialogTitle className="flex items-center gap-2 text-destructive text-lg font-bold">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              Reject Component
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground pt-1">
              Provide a rejection reason or feedback for <strong className="text-foreground">{rejectDialog.compName}</strong>. This message will be sent to the creator on their dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="rejection-preset-select" className="text-sm font-semibold text-foreground">
                Rejection Reason
              </Label>
              <Select
                value={rejectDialog.selectedPreset}
                onValueChange={(val) => {
                  const preset = REJECTION_PRESETS.find((p) => p.id === val)
                  if (preset) {
                    if (preset.id === 'custom') {
                      setRejectDialog((prev) => ({
                        ...prev,
                        selectedPreset: 'custom',
                        reason: prev.customReason || '',
                      }))
                    } else {
                      setRejectDialog((prev) => ({
                        ...prev,
                        selectedPreset: preset.id,
                        reason: preset.message,
                      }))
                    }
                  }
                }}
              >
                <SelectTrigger id="rejection-preset-select" className="w-full h-11 px-3.5 rounded-xl bg-card border-border shadow-xs text-sm">
                  <SelectValue placeholder="Select a rejection reason..." />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {REJECTION_PRESETS.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id} className="cursor-pointer py-2.5">
                      <span className="font-medium text-sm">{preset.title}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="rejection-message" className="text-sm font-semibold text-foreground">
                  Rejection Message / Feedback
                </Label>
                {rejectDialog.selectedPreset !== 'custom' && (
                  <span className="text-xs text-muted-foreground">Editable</span>
                )}
              </div>
              <Textarea
                id="rejection-message"
                rows={4}
                placeholder="Enter or customize rejection message..."
                value={rejectDialog.reason}
                onChange={(e) => {
                  const newText = e.target.value
                  const matchingPreset = REJECTION_PRESETS.find(
                    (p) => p.id !== 'custom' && p.message === newText
                  )
                  setRejectDialog((prev) => ({
                    ...prev,
                    reason: newText,
                    customReason: newText,
                    selectedPreset: matchingPreset ? matchingPreset.id : 'custom',
                  }))
                }}
                className="w-full resize-none text-sm rounded-xl border-border bg-card/60 p-3.5 leading-relaxed focus-visible:ring-1 focus-visible:ring-destructive/50"
              />
            </div>

            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              The author will be immediately notified with this message so they can adjust and resubmit.
            </p>
          </div>

          <DialogFooter className="pt-3 border-t border-border flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5 rounded-xl border-border bg-background hover:bg-muted font-medium text-sm transition-all"
              onClick={() => setRejectDialog((prev) => ({ ...prev, open: false }))}
              disabled={rejectDialog.submitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-sm shadow-md shadow-red-600/20 hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
              onClick={handleConfirmReject}
              disabled={rejectDialog.submitting || !rejectDialog.reason.trim()}
            >
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {rejectDialog.submitting ? 'Rejecting...' : 'Reject Component'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
