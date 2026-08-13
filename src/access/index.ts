import type { Access } from 'payload'

type EditorialUser = {
  role?: 'admin' | 'editor' | 'author' | null
}

const hasRole = (user: unknown, roles: EditorialUser['role'][]): boolean => {
  if (!user || typeof user !== 'object' || !('role' in user)) return false

  return roles.includes((user as EditorialUser).role)
}

export const anyone: Access = () => true

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const editors: Access = ({ req }) => hasRole(req.user, ['admin', 'editor'])

export const authors: Access = ({ req }) =>
  hasRole(req.user, ['admin', 'editor', 'author'])

export const admins: Access = ({ req }) => hasRole(req.user, ['admin'])

export const publishedOrAuthenticated: Access = ({ req }) => {
  if (req.user) return true

  return {
    _status: {
      equals: 'published',
    },
  }
}
