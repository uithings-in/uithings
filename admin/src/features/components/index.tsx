import { useState, useEffect } from 'react'
import axios from 'axios'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { copyToFigma } from '@/lib/clipboard'
import { Copy, Eye } from 'lucide-react'
import { API_URL } from '@/lib/api-url'

export function ComponentsModeration() {
  const [components, setComponents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [copyingId, setCopyingId] = useState<string | null>(null)
  const [actions, setActions] = useState<Record<string, string>>({})
  const { accessToken } = useAuthStore.getState().auth

  const fetchComponents = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true)
      else setLoadingMore(true)
      
      const response = await axios.get(`${API_URL}/components/admin?page=${pageNum}&limit=20`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      
      const fetchedItems = response.data.data.items
      if (pageNum === 1) {
        setComponents(fetchedItems)
      } else {
        setComponents(prev => [...prev, ...fetchedItems])
      }
      setTotalPages(response.data.data.pagination.totalPages)
      setPage(pageNum)
    } catch (error) {
      toast.error('Failed to fetch components')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchComponents(1)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Check if user scrolled near the bottom
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        if (!loading && !loadingMore && page < totalPages) {
          fetchComponents(page + 1)
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [page, totalPages, loading, loadingMore])

  const handleSaveAction = async (id: string) => {
    const action = actions[id]
    if (!action) return

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
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Component Moderation</h2>
          <p className='text-muted-foreground'>
            Review and approve components submitted by users.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">Loading...</div>
        ) : components.length === 0 ? (
          <div className="flex justify-center py-12 text-muted-foreground">No components found.</div>
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
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>{comp.name}</DialogTitle>
                          <DialogDescription>
                            Submitted by {comp.createdBy?.name || 'Unknown'}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col gap-4 py-4">
                          {comp.previewImageUrl && (
                            <div className="rounded-md overflow-hidden border bg-[#F3F3F6] p-4 dark:border-white/10">
                              <img 
                                src={comp.previewImageUrl} 
                                alt={comp.name} 
                                className="w-full h-auto object-contain max-h-[300px]"
                              />
                            </div>
                          )}
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {comp.description || 'No description provided.'}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Design Type</h4>
                              <p className="text-sm">{comp.designType || 'UI Design'}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold mb-1">Pricing</h4>
                              <p className="text-sm">{comp.pricingType}</p>
                            </div>
                          </div>
                          {comp.tags && comp.tags.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2">Tags</h4>
                              <div className="flex flex-wrap gap-2">
                                {comp.tags.map((tag: string, i: number) => (
                                  <Badge key={i} variant="secondary">{tag}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
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
    </>
  )
}
