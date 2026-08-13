import type { CollectionConfig } from 'payload'

import { authors, editors, publishedOrAuthenticated } from '@/access'
import { slugify } from '@/modules/content/domain/slugify'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Artículo',
    plural: 'Artículos',
  },
  admin: {
    group: 'Contenido',
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', '_status', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articulos/${data.slug || ''}`,
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authors,
    update: authors,
    delete: editors,
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenido',
          fields: [
            { name: 'title', type: 'text', label: 'Título', required: true },
            {
              name: 'slug',
              type: 'text',
              label: 'Slug',
              required: true,
              unique: true,
              index: true,
              hooks: {
                beforeValidate: [({ value, siblingData }) => value || slugify(siblingData?.title || '')],
              },
            },
            {
              name: 'excerpt',
              type: 'textarea',
              label: 'Resumen',
              required: true,
              maxLength: 320,
            },
            { name: 'coverImage', type: 'upload', relationTo: 'media', label: 'Portada', required: true },
            { name: 'content', type: 'richText', label: 'Contenido', required: true },
          ],
        },
        {
          label: 'Clasificación',
          fields: [
            {
              name: 'contentType',
              type: 'select',
              label: 'Modo principal',
              options: [
                { label: 'Dominio', value: 'domain' },
                { label: 'Servicio', value: 'service' },
              ],
              required: true,
              index: true,
            },
            {
              name: 'primaryDomain',
              type: 'relationship',
              relationTo: 'domains',
              label: 'Dominio principal',
              admin: { condition: (_, siblingData) => siblingData?.contentType === 'domain' },
            },
            {
              name: 'primaryService',
              type: 'relationship',
              relationTo: 'services',
              label: 'Servicio principal',
              admin: { condition: (_, siblingData) => siblingData?.contentType === 'service' },
            },
            {
              name: 'relatedDomains',
              type: 'relationship',
              relationTo: 'domains',
              label: 'Dominios relacionados',
              hasMany: true,
            },
            {
              name: 'relatedServices',
              type: 'relationship',
              relationTo: 'services',
              label: 'Servicios relacionados',
              hasMany: true,
            },
            { name: 'featured', type: 'checkbox', label: 'Destacado', defaultValue: false },
            {
              name: 'publishedAt',
              type: 'date',
              label: 'Fecha de publicación',
              admin: { date: { pickerAppearance: 'dayAndTime' } },
              index: true,
            },
            { name: 'authorName', type: 'text', label: 'Nombre público del autor', required: true },
            { name: 'authorRole', type: 'text', label: 'Cargo público del autor' },
          ],
        },
        {
          label: 'SEO',
          fields: [
            { name: 'seoTitle', type: 'text', label: 'Título SEO', maxLength: 70 },
            { name: 'seoDescription', type: 'textarea', label: 'Descripción SEO', maxLength: 170 },
            { name: 'socialImage', type: 'upload', relationTo: 'media', label: 'Imagen social' },
            { name: 'canonicalURL', type: 'text', label: 'URL canónica personalizada' },
          ],
        },
      ],
    },
  ],
  versions: {
    drafts: {
      autosave: {
        interval: 1500,
      },
    },
    maxPerDoc: 30,
  },
}
