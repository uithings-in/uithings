'use client'

import { useState } from 'react'
import axios from 'axios'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'
import { type User } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
  onSuccess?: () => void
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  onSuccess,
}: UserDeleteDialogProps) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { auth } = useAuthStore()

  const confirmationTarget = currentRow.email

  const handleDelete = async () => {
    if (value.trim().toLowerCase() !== confirmationTarget.toLowerCase()) return

    setLoading(true)
    try {
      await axios.delete(`${API_URL}/users/${currentRow.id}`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      })
      toast.success(`User ${currentRow.name || currentRow.email} deleted successfully`)
      onOpenChange(false)
      setValue('')
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          setValue('')
          onOpenChange(v)
        }
      }}
      form='users-delete-form'
      disabled={value.trim().toLowerCase() !== confirmationTarget.toLowerCase() || loading}
      title={
        <span className='text-destructive flex items-center gap-1.5'>
          <AlertTriangle className='h-5 w-5 stroke-destructive' />
          Delete User
        </span>
      }
      desc={
        <form
          id='users-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='text-sm text-muted-foreground'>
            Are you sure you want to delete <span className='font-semibold text-foreground'>{currentRow.name}</span> (<span className='font-mono text-xs'>{currentRow.email}</span>)?
            <br />
            This will remove their account and all associated preferences permanently.
          </p>

          <Label className='block space-y-1.5'>
            <span className='text-xs font-medium'>
              Type <strong className='font-mono text-foreground'>{confirmationTarget}</strong> to confirm:
            </span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder='Enter email to confirm deletion'
              autoFocus
              disabled={loading}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              This action is immediate and cannot be undone.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText={loading ? 'Deleting...' : 'Delete User'}
      destructive
    />
  )
}
