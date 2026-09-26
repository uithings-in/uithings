import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table'
import { callTypes } from '../data/data'
import { type User } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const usersColumns: ColumnDef<User>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('inset-s-0 z-10 rounded-tl-[inherit] max-md:sticky w-10'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-0.5'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Name' />
    ),
    cell: ({ row }) => {
      const { id, name } = row.original
      return (
        <Link
          to='/users/$userId'
          params={{ userId: id }}
          className='font-medium text-foreground hover:text-primary hover:underline transition-colors block max-w-48 truncate'
        >
          {name || 'Anonymous User'}
        </Link>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Email' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap text-muted-foreground'>{row.getValue('email')}</div>
    ),
  },
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Join date' />
    ),
    cell: ({ row }) => {
      const date = row.original.createdAt
      return (
        <span className='text-xs text-muted-foreground whitespace-nowrap'>
          {date ? format(new Date(date), 'MMM dd, yyyy') : 'N/A'}
        </span>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      const status = row.original.status || 'active'
      const badgeColor = callTypes.get(status) || callTypes.get('active')
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize font-medium', badgeColor)}>
            {status}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableHiding: false,
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
