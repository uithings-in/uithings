import { Shield, User, Sparkles, Globe, Mail } from 'lucide-react'
import { type UserAuthProvider, type UserRole, type UserStatus } from './schema'

export const callTypes = new Map<UserStatus, string>([
  ['active', 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  ['inactive', 'bg-neutral-300/40 border-neutral-300 text-neutral-400'],
  ['invited', 'bg-sky-200/40 text-sky-900 dark:text-sky-100 border-sky-300'],
  [
    'suspended',
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const userStatuses = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Invited', value: 'invited' },
  { label: 'Suspended', value: 'suspended' },
] as const

export const authProviderColors = new Map<UserAuthProvider, { bg: string; text: string; label: string }>([
  ['google', { bg: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20', text: 'text-red-500', label: 'Google' }],
  ['local', { bg: 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20', text: 'text-blue-500', label: 'Email / Account' }],
])

export const authProviders = [
  {
    label: 'Google Account',
    value: 'google',
    icon: Globe,
  },
  {
    label: 'Email & Password',
    value: 'local',
    icon: Mail,
  },
] as const

export const roleColors = new Map<UserRole, { bg: string; text: string; label: string }>([
  ['admin', { bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', text: 'text-purple-400', label: 'Admin' }],
  ['user', { bg: 'bg-neutral-500/10 text-neutral-400 border-neutral-500/20', text: 'text-neutral-400', label: 'User' }],
])

export const roles = [
  {
    label: 'Admin',
    value: 'admin',
    icon: Shield,
  },
  {
    label: 'User',
    value: 'user',
    icon: User,
  },
] as const

export const proStatusList = [
  {
    label: 'Pro Member',
    value: 'pro',
    icon: Sparkles,
  },
  {
    label: 'Free User',
    value: 'free',
    icon: User,
  },
] as const
