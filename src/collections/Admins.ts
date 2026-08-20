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
      name: 'publicBio',
      type: 'textarea',
      label: 'Biografía pública',
      admin: {
        description: 'Contexto breve para la ficha pública del equipo.',
      },
    },
    {
      name: 'expertiseDomains',
      type: 'select',
      hasMany: true,
      label: 'Dominios XOC que domina',
      options: [
        { label: '01 · Capital Humano', value: '01' },
        { label: '02 · Endpoints & Workplace', value: '02' },
        { label: '03 · Aplicaciones, APIs & Code', value: '03' },
        { label: '04 · Infraestructura de Cómputo', value: '04' },
        { label: '05 · Cloud & SaaS', value: '05' },
        { label: '06 · Infraestructura de Red', value: '06' },
        { label: '07 · Perímetro de Seguridad', value: '07' },
        { label: '08 · Servicios Externos / IPs Públicas', value: '08' },
        { label: '09 · OT / IoT', value: '09' },
        { label: '10 · Physical Security', value: '10' },
        { label: '11 · Agentic / AI Models', value: '11' },
      ],
      admin: {
        description: 'Selecciona las superficies operacionales que puedes liderar o explicar.',
      },
    },
    {
      name: 'showOnTeam',
      type: 'checkbox',
      label: 'Mostrar este perfil en Equipo',
      defaultValue: true,
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
