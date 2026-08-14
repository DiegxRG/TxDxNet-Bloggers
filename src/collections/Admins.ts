import type { CollectionConfig } from 'payload'

import { admins } from '@/access'

export const Admins: CollectionConfig = {
  slug: 'admins',
  labels: {
    singular: 'Usuario editorial',
    plural: 'Equipo editorial',
  },
  admin: {
    group: 'Sistema',
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'updatedAt'],
  },
  auth: {
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    tokenExpiration: 2 * 60 * 60,
  },
  access: {
    admin: ({ req }) => Boolean(req.user),
    read: admins,
    update: ({ req, id }) =>
      Boolean(req.user && (req.user.id === id || req.user.role === 'admin')),
    delete: admins,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      defaultValue: 'editor',
      admin: {
        description:
          'El rol define qué puede hacer cada persona en el panel editorial. Administrador: acceso total. Editor: revisa, edita y publica. Autor: redacta borradores sin publicar.',
        width: '50%',
      },
      options: [
        { label: 'Administrador', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Autor', value: 'author' },
      ],
      required: true,
      access: {
        update: ({ req }) => req.user?.role === 'admin',
      },
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
  ],
}
