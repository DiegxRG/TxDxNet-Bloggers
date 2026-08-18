import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access'

export const Admins: CollectionConfig = {
  slug: 'admins',
  labels: {
    singular: 'Usuario editorial',
    plural: 'Equipo editorial',
  },
  admin: {
    group: 'Sistema',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'updatedAt'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    create: authenticated,
    read: ({ req, id }) => Boolean(req.user && req.user.id === id),
    update: ({ req, id }) => Boolean(req.user && req.user.id === id),
    delete: () => false,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'publicTitle',
      type: 'text',
      label: 'Cargo público',
      admin: {
        description:
          'Cargo que se muestra como firma del autor en los artículos (ej.: Ingeniero de seguridad).',
        width: '50%',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto de perfil',
      admin: {
        description: 'Foto circular que se muestra junto a tu firma en los articulos publicos.',
      },
    },
  ],
}
