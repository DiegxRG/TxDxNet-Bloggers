import type { CollectionConfig } from 'payload'

import { anyone, authors, editors } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Archivo',
    plural: 'Biblioteca multimedia',
  },
  admin: {
    group: 'Contenido',
    useAsTitle: 'filename',
  },
  access: {
    read: anyone,
    // Los autores pueden subir imágenes (p. ej. la portada de sus artículos).
    create: authors,
    update: editors,
    delete: editors,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Texto alternativo',
      required: true,
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
    ],
    mimeTypes: ['image/*', 'application/pdf'],
  },
}
