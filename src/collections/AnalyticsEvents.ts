import { isOwner, ownerOnly } from '@/access'

import type { CollectionConfig } from 'payload'

export const AnalyticsEvents: CollectionConfig = {
  slug: 'analytics-events',
  labels: {
    singular: 'Evento analítico',
    plural: 'Eventos analíticos',
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
      name: 'type',
      type: 'select',
      required: true,
      options: [
        { label: 'Visita de página', value: 'page_view' },
        { label: 'Lectura de artículo', value: 'article_read' },
      ],
      admin: { readOnly: true },
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      maxLength: 240,
      admin: { readOnly: true },
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
