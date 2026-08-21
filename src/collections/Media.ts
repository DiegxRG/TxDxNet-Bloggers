import type { CollectionConfig } from 'payload'

import { anyone, authenticated, isActiveAdmin } from '@/access'
import { recordAuditEvent } from '@/modules/audit/server/record-audit'
import { isMediaReferenced } from '@/modules/panel/server/media-references'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Archivo',
    plural: 'Biblioteca multimedia',
  },
  admin: {
    group: 'Contenido',
    useAsTitle: 'filename',
    components: {
      views: {
        list: {
          Component: './components/payload/MediaLibrary',
        },
      },
    },
  },
  access: {
    read: anyone,
    create: authenticated,
    update: authenticated,
    delete: async ({ id, req }) => {
      if (!isActiveAdmin(req.user) || !id) return false

      try {
        return !(await isMediaReferenced(req.payload, req.user, String(id)))
      } catch {
        return false
      }
    },
  },
  hooks: {
    afterDelete: [
      async ({ doc, req }) => {
        if (!isActiveAdmin(req.user)) return
        await recordAuditEvent({
          action: 'media.deleted',
          collection: 'media',
          documentID: String(doc.id),
          payload: req.payload,
          summary: `Eliminó el archivo ${doc.filename || doc.id}.`,
          user: req.user,
        })
      },
    ],
  },
  fields: [
    {
      name: 'purpose',
      type: 'select',
      label: 'Uso del archivo',
      defaultValue: 'editorial',
      options: [
        { label: 'Editorial', value: 'editorial' },
        { label: 'Avatar', value: 'avatar' },
      ],
      admin: { hidden: true },
    },
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      admin: { description: 'Describe la imagen para accesibilidad y SEO.' },
    },
    {
      name: 'caption',
      type: 'textarea',
      label: 'Leyenda',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Crédito o fuente',
    },
  ],
  upload: {
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 480, height: 320, position: 'centre' },
      { name: 'card', width: 960, height: 640, position: 'centre' },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
      { name: 'avatar', width: 256, height: 256, position: 'centre' },
    ],
    mimeTypes: ['image/*'],
  },
}
