import type { Access, Where } from 'payload'

export type AdminRole = 'owner' | 'editor'

type AdminAccessUser = {
  collection?: string
  email?: string | null
  id?: string | null
  isActive?: boolean | null
  role?: AdminRole | null
}

const DEFAULT_ALLOWED_ADMIN_EMAILS = [
  'angelo.garcia@txdxsecure.com',
  'cristhian.morillo@txdxsecure.com',
  'steve.ricapa@txdxsecure.com',
  'rolando.ricapa@txdxsecure.com',
  'carla.ricapa@txdxsecure.com',
  'diego.ramos@txdxsecure.com',
  'anthony.callirgos@txdxsecure.com',
  'michael.caceres@txdxsecure.com',
  'ralph.ricapa@txdxsecure.com',
] as const

export const allowedAdminEmails = new Set<string>(DEFAULT_ALLOWED_ADMIN_EMAILS)

export function normalizeAdminEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isAllowedAdminEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false
  const normalizedEmail = normalizeAdminEmail(email)
  return normalizedEmail.endsWith('@txdxsecure.com') && allowedAdminEmails.has(normalizedEmail)
}

export function isActiveAdmin(user: unknown): user is AdminAccessUser {
  if (!user || typeof user !== 'object') return false
  const admin = user as AdminAccessUser
  return admin.isActive !== false && isAllowedAdminEmail(admin.email)
}

export function isOwner(user: unknown): user is AdminAccessUser & { role: 'owner' } {
  return isActiveAdmin(user) && (user as AdminAccessUser).role === 'owner'
}

export const anyone: Access = () => true

export const authenticated: Access = ({ req }) => isActiveAdmin(req.user)

export const postOwnerOrOwner: Access = ({ req }) => {
  if (!isActiveAdmin(req.user)) return false
  if (isOwner(req.user)) return true
  return {
    createdBy: {
      equals: req.user.id,
    },
  }
}

export const ownerOnly: Access = ({ req }) => isOwner(req.user)

export const ownerOrSelf: Access = ({ id, req }) => {
  if (!isActiveAdmin(req.user)) return false
  if (isOwner(req.user)) return true
  return Boolean(id && req.user.id && String(id) === String(req.user.id))
}

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (isOwner(req.user)) return true

  if (isActiveAdmin(req.user)) {
    return { createdBy: { equals: req.user.id } } as Where
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}
