import type { CollectionConfig } from 'payload'

import { anyone, editors } from '@/access'
import { slugify } from '@/modules/content/domain/slugify'

export const Domains: CollectionConfig = {
  slug: 'domains',
  labels: {
    singular: 'Dominio',
    plural: 'Dominios',
  },
  admin: {
    group: 'Taxonomía',
    useAsTitle: 'name',
    defaultColumns: ['order', 'name', 'slug', 'featured'],
  },
  access: {
    read: anyone,
    create: editors,
    update: editors,
    delete: editors,
  },
  defaultSort: 'order',
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
      name: 'shortDescription',
      type: 'textarea',
      label: 'Descripción breve',
      required: true,
    },
    {
      type: 'row',
      fields: [
        { name: 'order', type: 'number', label: 'Orden', required: true, min: 1, max: 99 },
        {
          name: 'accent',
          type: 'select',
          label: 'Acento',
          defaultValue: 'orange',
          options: [
            { label: 'Naranja', value: 'orange' },
            { label: 'Azul', value: 'blue' },
            { label: 'Cian', value: 'cyan' },
            { label: 'Grafito', value: 'graphite' },
          ],
          required: true,
        },
        { name: 'featured', type: 'checkbox', label: 'Destacado', defaultValue: false },
      ],
    },
    { name: 'iconKey', type: 'text', label: 'Clave de ícono' },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Imagen principal' },
    { name: 'content', type: 'richText', label: 'Descripción completa' },
  ],
}
