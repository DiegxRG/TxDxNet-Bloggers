import type { CollectionConfig } from 'payload'

import { isOwner, ownerOnly } from '@/access'

export const AuditLogs: CollectionConfig = {
  slug: 'audit-logs',
  labels: {
    singular: 'Evento de auditoría',
    plural: 'Auditoría',
  },
  admin: {
    group: 'Sistema',
    useAsTitle: 'summary',
    defaultColumns: ['action', 'actorEmail', 'summary', 'createdAt'],
  },
  access: {
    admin: ({ req }) => isOwner(req.user),
    create: () => false,
    read: ownerOnly,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'action',
      type: 'select',
      required: true,
      options: [
        { label: 'Inicio de sesión', value: 'auth.login' },
        { label: 'Inicio de sesión fallido', value: 'auth.login_failed' },
        { label: 'Admin creado', value: 'admin.created' },
        { label: 'Admin actualizado', value: 'admin.updated' },
        { label: 'Admin eliminado', value: 'admin.deleted' },
        { label: 'Artículo creado', value: 'post.created' },
        { label: 'Artículo actualizado', value: 'post.updated' },
        { label: 'Artículo publicado', value: 'post.published' },
        { label: 'Artículo retirado', value: 'post.unpublished' },
        { label: 'Artículo eliminado', value: 'post.deleted' },
        { label: 'Media eliminada', value: 'media.deleted' },
      ],
    },
    {
      name: 'actor',
      type: 'relationship',
      relationTo: 'admins',
      required: false,
      admin: { readOnly: true },
    },
    {
      name: 'actorEmail',
      type: 'email',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'targetCollection',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'targetID',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'summary',
      type: 'text',
      required: true,
      admin: { readOnly: true },
    },
    {
      name: 'metadata',
      type: 'json',
      admin: {
        description: 'Contexto técnico mínimo. Nunca guardar contraseñas, tokens o contenido completo.',
        readOnly: true,
      },
    },
  ],
}
