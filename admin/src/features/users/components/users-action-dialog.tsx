'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { SelectDropdown } from '@/components/select-dropdown'
import { Switch } from '@/components/ui/switch'
import { roles } from '../data/data'
import { type User } from '../data/schema'
import { useAuthStore } from '@/stores/auth-store'
import { API_URL } from '@/lib/api-url'

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email.').optional(),
  role: z.enum(['admin', 'user']),
  isProUser: z.boolean(),
})

type UserForm = z.infer<typeof formSchema>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
  onSuccess,
}: UserActionDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const { auth } = useAuthStore()
  const isEdit = !!currentRow

  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    values: {
      name: currentRow?.name || '',
      email: currentRow?.email || '',
      role: (currentRow?.role as 'admin' | 'user') || 'user',
      isProUser: !!currentRow?.isProUser,
    },
  })

  const onSubmit = async (values: UserForm) => {
    setSubmitting(true)
    try {
      if (isEdit && currentRow) {
        await axios.patch(
          `${API_URL}/users/${currentRow.id}`,
          {
            name: values.name,
            role: values.role,
            isProUser: values.isProUser,
          },
          { headers: { Authorization: `Bearer ${auth.accessToken}` } }
        )
        toast.success('User updated successfully')
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save user')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!submitting) {
          form.reset()
          onOpenChange(state)
        }
      }}
    >
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>{isEdit ? 'Edit User Profile' : 'User Details'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Manage permissions and status for ${currentRow.name}.`
              : 'User profile details.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            id='user-action-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4 py-2'
          >
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder='John Doe' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className='bg-muted/50 cursor-not-allowed'
                      placeholder='user@example.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Role</FormLabel>
                  <SelectDropdown
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    placeholder='Select a role'
                    items={roles.map(({ label, value }) => ({
                      label,
                      value,
                    }))}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='isProUser'
              render={({ field }) => (
                <FormItem className='flex items-center justify-between rounded-lg border p-3.5 shadow-xs'>
                  <div className='space-y-0.5'>
                    <FormLabel className='text-sm font-medium'>Pro Membership</FormLabel>
                    <p className='text-xs text-muted-foreground'>
                      Grant unlimited access to pro components & templates
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type='submit' form='user-action-form' disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
