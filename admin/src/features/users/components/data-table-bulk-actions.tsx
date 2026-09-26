import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { type User } from '../data/schema'
import { UsersMultiDeleteDialog } from './users-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
  onRefresh?: () => void
}

export function DataTableBulkActions<TData>({
  table,
  onRefresh,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkEmail = () => {
    const selectedUsers = selectedRows.map((row) => row.original as User)
    const emails = selectedUsers.map((u) => u.email).filter(Boolean)
    if (emails.length === 0) return
    window.location.href = `mailto:${emails.join(',')}`
    toast.success(`Opening email client for ${emails.length} user(s)`)
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='user'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={handleBulkEmail}
              className='size-8'
              aria-label='Email selected users'
              title='Email selected users'
            >
              <Mail />
              <span className='sr-only'>Email selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Email selected users</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected users'
              title='Delete selected users'
            >
              <Trash2 />
              <span className='sr-only'>Delete selected users</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected users</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <UsersMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onSuccess={onRefresh}
      />
    </>
  )
}
