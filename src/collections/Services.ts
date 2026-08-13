import type { CollectionConfig } from 'payload'

import { anyone, editors } from '@/access'
import { slugify } from '@/modules/content/domain/slugify'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Servicio',
    plural: 'Servicios',
  },
  admin: {
    group: 'Taxonomía',
    useAsTitle: 'name',
    defaultColumns: ['family', 'name', 'slug', 'featured'],
  },
  access: {
    read: anyone,
    create: editors,
    update: editors,
    delete: editors,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', label: 'Nombre', required: true },
        {
          name: 'slug',
          type: 'text',
          label: 'Slug',
          required: true,
          unique: true,
          index: true,
          hooks: {
            beforeValidate: [({ value, siblingData }) => value || slugify(siblingData?.name || '')],
          },
        },
      ],
    },
    {
      name: 'family',
      type: 'select',
      label: 'Familia',
      options: [
        { label: 'Core Service', value: 'core' },
        { label: 'Entry Service', value: 'entry' },
        { label: 'AI Service', value: 'ai' },
        { label: 'XOC', value: 'xoc' },
      ],
      required: true,
      index: true,
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Descripción breve',
      required: true,
    },
    {
      name: 'relatedDomains',
      type: 'relationship',
      relationTo: 'domains',
      label: 'Dominios relacionados',
      hasMany: true,
    },
    {
      name: 'outcomes',
      type: 'array',
      label: 'Resultados esperados',
      fields: [{ name: 'value', type: 'text', label: 'Resultado', required: true }],
    },
    { name: 'featured', type: 'checkbox', label: 'Destacado', defaultValue: false },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen principal' },
    { name: 'content', type: 'richText', label: 'Descripción completa' },
  ],
}
