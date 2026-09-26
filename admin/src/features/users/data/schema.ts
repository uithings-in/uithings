import { z } from 'zod'

export const userStatusSchema = z.union([
  z.literal('active'),
  z.literal('inactive'),
  z.literal('invited'),
  z.literal('suspended'),
])
export type UserStatus = z.infer<typeof userStatusSchema>

export const userAuthProviderSchema = z.union([
  z.literal('google'),
  z.literal('local'),
])
export type UserAuthProvider = z.infer<typeof userAuthProviderSchema>

export const userRoleSchema = z.union([
  z.literal('admin'),
  z.literal('user'),
])
export type UserRole = z.infer<typeof userRoleSchema>

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  status: userStatusSchema.default('active'),
  authProvider: userAuthProviderSchema.default('local'),
  profilePicture: z.string().optional().default(''),
  role: userRoleSchema.default('user'),
  isProUser: z.boolean().default(false),
  activeSubscription: z.any().optional().nullable(),
  uploadedComponentsCount: z.number().optional().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>
