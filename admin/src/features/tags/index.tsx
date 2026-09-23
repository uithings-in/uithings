import { useState, useEffect } from 'react'
import axios from 'axios'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/auth-store'
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { API_URL } from '@/lib/api-url'

interface Tag {
  _id: string
  name: string
  order: number
}

function SortableTagItem({
  tag,
  onDelete,
}: {
  tag: Tag
  onDelete: (id: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tag._id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 hover:bg-muted/50 bg-background ${
        isDragging ? 'opacity-50 shadow-md relative' : ''
      }`}
    >
      <div className='flex items-center gap-4'>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className='cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground'
        >
          <GripVertical className='h-5 w-5' />
        </button>
        <span className='font-medium'>{tag.name}</span>
      </div>
      <Button
        variant='ghost'
        size='icon'
        className='text-destructive hover:bg-destructive/10 hover:text-destructive'
        onClick={() => onDelete(tag._id)}
      >
        <Trash2 className='h-4 w-4' />
      </Button>
    </div>
  )
}

export function Tags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [newTagName, setNewTagName] = useState('')
  const [adding, setAdding] = useState(false)
  const { auth } = useAuthStore()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_URL}/tags`)
      setTags(res.data.data)
    } catch (err) {
      toast.error('Failed to load tags')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTags()
  }, [])

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTagName.trim()) return

    setAdding(true)
    try {
      const res = await axios.post(
        `${API_URL}/tags`,
        { name: newTagName },
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      setTags([...tags, res.data.data])
      setNewTagName('')
      toast.success('Tag added successfully')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add tag')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return

    try {
      await axios.delete(`${API_URL}/tags/${id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      setTags(tags.filter((t) => t._id !== id))
      toast.success('Tag deleted')
    } catch (err) {
      toast.error('Failed to delete tag')
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = tags.findIndex((t) => t._id === active.id)
      const newIndex = tags.findIndex((t) => t._id === over.id)

      const newTags = arrayMove(tags, oldIndex, newIndex)
      setTags(newTags)

      try {
        await axios.put(
          `${API_URL}/tags/reorder`,
          { orderedIds: newTags.map((t) => t._id) },
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        )
      } catch (err) {
        toast.error('Failed to save order')
        fetchTags() // revert
      }
    }
  }

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
            <h2 className='text-2xl font-bold tracking-tight'>Tag Management</h2>
            <p className='text-muted-foreground'>
              Manage the tags used for categorization. Drag and drop to change their display order.
            </p>
          </div>
        </div>

        <form onSubmit={handleAddTag} className='flex max-w-sm items-center gap-2'>
          <Input
            placeholder='New tag name (e.g. Hero Section)'
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
          />
          <Button type='submit' disabled={adding || !newTagName.trim()}>
            {adding ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : <Plus className='mr-2 h-4 w-4' />}
            Add
          </Button>
        </form>

        <div className='rounded-md border'>
          {loading ? (
            <div className='flex items-center justify-center p-8'>
              <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
            </div>
          ) : tags.length === 0 ? (
            <div className='p-8 text-center text-muted-foreground'>No tags found</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div className='divide-y flex flex-col'>
                <SortableContext
                  items={tags.map(t => t._id)}
                  strategy={verticalListSortingStrategy}
                >
                  {tags.map((tag) => (
                    <SortableTagItem key={tag._id} tag={tag} onDelete={handleDeleteTag} />
                  ))}
                </SortableContext>
              </div>
            </DndContext>
          )}
        </div>
      </Main>
    </>
  )
}
