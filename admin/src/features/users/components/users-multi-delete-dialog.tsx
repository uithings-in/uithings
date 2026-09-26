'use client'

import { useState } from 'react'
import axios from 'axios'
import { type Table } from '@tanstack/react-table'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'
import { type User } from '../data/schema'

type UserMultiDeleteDialogProps<TData> = {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: Table<TData>
  onSuccess?: () => void
}

const CONFIRM_WORD = 'DELETE'

export function UsersMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
  onSuccess,
}: UserMultiDeleteDialogProps<TData>) {
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { auth } = useAuthStore()

  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleDelete = async () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }

    const ids = selectedRows.map((row) => (row.original as User).id)
    setLoading(true)

    try {
      await axios.post(
        `${API_URL}/users/bulk-delete`,
        { ids },
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      )
      toast.success(`Successfully deleted ${ids.length} user(s)`)
      setValue('')
      table.resetRowSelection()
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete users')
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
      form='users-multi-delete-form'
      disabled={value.trim() !== CONFIRM_WORD || loading}
      title={
        <span className='text-destructive flex items-center gap-1.5'>
          <AlertTriangle className='h-5 w-5 stroke-destructive' />
          Delete {selectedRows.length}{' '}
          {selectedRows.length > 1 ? 'users' : 'user'}
        </span>
      }
      desc={
        <form
          id='users-multi-delete-form'
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className='space-y-4'
        >
          <p className='text-sm text-muted-foreground'>
            Are you sure you want to delete the selected <strong className='text-foreground'>{selectedRows.length}</strong> user(s)? <br />
            This action cannot be undone and will permanently remove them from the database.
          </p>

          <Label className='my-4 flex flex-col items-start gap-1.5'>
            <span className='text-xs font-medium'>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
              disabled={loading}
            />
          </Label>

          <Alert variant='destructive'>
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>
              Please be careful, this operation cannot be rolled back.
            </AlertDescription>
          </Alert>
        </form>
      }
      confirmText={loading ? 'Deleting...' : 'Delete Selected'}
      destructive
    />
  )
}
