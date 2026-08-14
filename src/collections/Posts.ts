import type { CollectionConfig } from 'payload'

import { authors, editors, publishedOrAuthenticated } from '@/access'
import { slugify } from '@/modules/content/domain/slugify'

const canPublish = (role: string | undefined): boolean =>
  role === 'admin' || role === 'editor'

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Artículo',
    plural: 'Artículos',
  },
  admin: {
    group: 'Contenido',
    useAsTitle: 'title',
    defaultColumns: ['title', 'contentType', 'featured', '_status', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articulos/${data.slug || ''}`,
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authors,
    // Admins y editores pueden editar y publicar. Los autores solo pueden
    // seguir trabajando sobre borradores; el botón "Publicar" se oculta solo.
    update: ({ req }) => {
      const role = req.user?.role as string | undefined
      if (!req.user) return false
      if (canPublish(role)) return true
      return { _status: { equals: 'draft' } }
    },
    delete: editors,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const user = req.user as { name?: string; publicTitle?: string } | null
        if (!user) return data
        if (!data.authorName) data.authorName = user.name || ''
        if (!data.authorRole) data.authorRole = user.publicTitle || ''
        return data
      },
    ],
  },
  defaultSort: '-publishedAt',
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
      admin: {
        placeholder: 'Ej.: Operar con claridad en un entorno hiperconectado',
        description: 'Entre 8 y 70 caracteres suele rendir mejor.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL del artículo. Se completa automáticamente desde el título.',
      },
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
      admin: {
        placeholder: 'Una frase que invite a leer el artículo…',
        description: 'Aparece en listados, tarjetas y en la vista previa social.',
        rows: 3,
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Portada',
      required: true,
      admin: {
        description: 'Imagen destacada del artículo (mínimo 1200 px de ancho recomendado).',
      },
    },
    {
      name: 'content',
      type: 'richText',
      label: 'Contenido',
      required: true,
      admin: {
        description:
          'Escribe y da formato como en un procesador de textos: la barra superior queda fija y el texto se ve tal como se publicará.',
      },
    },
    {
      type: 'collapsible',
      label: 'Clasificación (opcional)',
      admin: {
        description: 'Conecta el artículo con dominios y servicios de la empresa.',
        initCollapsed: true,
      },
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
          defaultValue: 'domain',
          admin: {
            description: '¿El artículo habla principalmente de un dominio o de un servicio?',
          },
        },
        {
          name: 'primaryDomain',
          type: 'relationship',
          relationTo: 'domains',
          label: 'Dominio principal',
          admin: {
            condition: (_, siblingData) => siblingData?.contentType === 'domain',
            description: 'El dominio XOC que da contexto al artículo.',
          },
        },
        {
          name: 'primaryService',
          type: 'relationship',
          relationTo: 'services',
          label: 'Servicio principal',
          admin: {
            condition: (_, siblingData) => siblingData?.contentType === 'service',
            description: 'El servicio de TxDxSecure que da contexto al artículo.',
          },
        },
        {
          name: 'relatedDomains',
          type: 'relationship',
          relationTo: 'domains',
          label: 'Dominios relacionados',
          hasMany: true,
          admin: { description: 'Opcional: otros dominios mencionados.' },
        },
        {
          name: 'relatedServices',
          type: 'relationship',
          relationTo: 'services',
          label: 'Servicios relacionados',
          hasMany: true,
          admin: { description: 'Opcional: otros servicios mencionados.' },
        },
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Destacado',
          defaultValue: false,
          admin: { description: 'Marca el artículo para aparecer en secciones destacadas.' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Publicación y autor',
      admin: {
        description: 'Se completa automáticamente; solo ajústalo si hace falta.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'publishedAt',
          type: 'date',
          label: 'Fecha de publicación',
          admin: {
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Cuándo se publicó o se publicará. Ordena el listado.',
          },
          index: true,
          defaultValue: () => new Date().toISOString(),
        },
        {
          name: 'authorName',
          type: 'text',
          label: 'Nombre público del autor',
          required: true,
          admin: {
            description: 'Se completa automáticamente con tu perfil editorial.',
          },
          defaultValue: ({ user }) => user?.name || '',
        },
        {
          name: 'authorRole',
          type: 'text',
          label: 'Cargo público del autor',
          admin: {
            description: 'Se completa automáticamente con tu cargo editorial.',
          },
          defaultValue: ({ user }) => user?.publicTitle || '',
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'SEO (opcional)',
      admin: {
        description: 'Opcional: afina cómo se muestra el artículo en buscadores y redes.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'seoTitle',
          type: 'text',
          label: 'Título SEO',
          maxLength: 70,
          admin: { placeholder: 'Usa el título del artículo si no lo sabes' },
        },
        {
          name: 'seoDescription',
          type: 'textarea',
          label: 'Descripción SEO',
          maxLength: 170,
          admin: { rows: 3, placeholder: 'Usa el resumen si no defines uno propio' },
        },
        {
          name: 'socialImage',
          type: 'upload',
          relationTo: 'media',
          label: 'Imagen social',
          admin: { description: 'Imagen para compartir en redes (1200 × 630 px recomendado).' },
        },
        {
          name: 'canonicalURL',
          type: 'text',
          label: 'URL canónica personalizada',
          admin: { description: 'Solo si el artículo se publica también en otro sitio.' },
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
