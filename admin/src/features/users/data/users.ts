import { type User } from './schema'

const firstNames = [
  'Aarav',
  'Ishita',
  'Rohan',
  'Meera',
  'Kabir',
  'Ananya',
  'Vihaan',
  'Diya',
  'Arjun',
  'Sara',
]
const lastNames = [
  'Sharma',
  'Patel',
  'Iyer',
  'Nair',
  'Bose',
  'Gupta',
  'Reddy',
  'Kapoor',
  'Mehta',
  'Singh',
]
const statuses = ['active', 'inactive', 'invited', 'suspended'] as const
const roles = ['admin', 'user'] as const

export const users: User[] = Array.from({ length: 20 }, (_, i) => {
  const firstName = firstNames[i % firstNames.length]
  const lastName = lastNames[i % lastNames.length]
  const authProvider = i % 3 === 0 ? 'local' : 'google'
  const createdAt = new Date(2025, 0, i + 1)

  return {
    id: `user-${String(i + 1).padStart(3, '0')}`,
    name: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    status: statuses[i % statuses.length],
    authProvider,
    profilePicture:
      authProvider === 'google' ? `https://i.pravatar.cc/150?u=${i + 1}` : '',
    role: roles[i % roles.length],
    isProUser: i % 4 === 0,
    canUploadPro: i % 5 === 0,
    uploadedComponentsCount: (i * 3) % 26,
    createdAt,
    updatedAt: createdAt,
  }
})
