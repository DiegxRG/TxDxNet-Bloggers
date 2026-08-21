import { isOwner, ownerOnly } from '@/access'

import type { CollectionConfig } from 'payload'

export const AnalyticsVisitors: CollectionConfig = {
  slug: 'analytics-visitors',
  labels: {
    singular: 'Visitante agregado',
    plural: 'Visitantes agregados',
  },
  admin: {
    group: 'Sistema',
    hidden: true,
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
      name: 'key',
      type: 'text',
      required: true,
      unique: true,
      admin: { hidden: true, readOnly: true },
    },
    {
      name: 'day',
      type: 'text',
      required: true,
      maxLength: 10,
      index: true,
      admin: { readOnly: true },
    },
  ],
}
