import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { type User } from '../data/schema'
import { UsersActionDialog } from './users-action-dialog'

const MOCK_USER: User = {
  id: 'alex_uuid',
  name: 'Alex Smith',
  email: 'alex@smith.com',
  status: 'active',
  authProvider: 'local',
  profilePicture: '',
  role: 'admin',
  isProUser: true,
  uploadedComponentsCount: 5,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-02-02'),
}

describe('UsersActionDialog', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('add user', () => {
    it('renders title and description', async () => {
      const { getByRole, getByText } = await render(
        <UsersActionDialog open onOpenChange={vi.fn()} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /User Details/i,
      })
      const desc = getByText(/User profile details/i)

      await expect.element(title).toBeInTheDocument()
      await expect.element(desc).toBeInTheDocument()
    })
  })

  describe('edit user', () => {
    it('renders edit user dialog', async () => {
      const { getByRole, getByText } = await render(
        <UsersActionDialog open onOpenChange={vi.fn()} currentRow={MOCK_USER} />
      )

      const title = getByRole('heading', {
        level: 2,
        name: /Edit User Profile/i,
      })
      const desc = getByText(new RegExp(`Manage permissions and status for ${MOCK_USER.name}`, 'i'))

      await expect.element(title).toBeInTheDocument()
      await expect.element(desc).toBeInTheDocument()
    })
  })
})
