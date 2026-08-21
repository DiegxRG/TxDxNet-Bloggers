import type { CollectionConfig } from 'payload'

import { authenticated, isActiveAdmin, postOwnerOrOwner, publishedOrAuthenticated } from '@/access'
import { recordAuditEvent } from '@/modules/audit/server/record-audit'
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
    defaultColumns: ['title', 'featured', '_status', 'publishedAt', 'updatedAt'],
    livePreview: {
      url: ({ data }) =>
        `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/articulos/${data.slug || ''}`,
      openByDefault: true,
    },
  },
  access: {
    read: publishedOrAuthenticated,
    create: authenticated,
    update: postOwnerOrOwner,
    delete: postOwnerOrOwner,
  },
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation !== 'create') return data
        const user = req.user as {
          avatar?: string | { id?: string } | null
          id?: string
          name?: string
          publicTitle?: string
        } | null
        if (!user) return data
        if (!data.createdBy) data.createdBy = user.id || ''
        if (!data.authorName) data.authorName = user.name || ''
        if (!data.authorRole) data.authorRole = user.publicTitle || ''
        if (!data.authorAvatar && user.avatar) {
          data.authorAvatar = typeof user.avatar === 'string' ? user.avatar : user.avatar.id || null
        }
        return data
      },
    ],
    afterChange: [
      async ({ context, doc, operation, previousDoc, req }) => {
        if (context.autosave === true) return
        if (!isActiveAdmin(req.user)) return

        const action =
          operation === 'create'
            ? 'post.created'
            : previousDoc?._status !== doc._status && doc._status === 'published'
              ? 'post.published'
              : previousDoc?._status !== doc._status && previousDoc?._status === 'published'
                ? 'post.unpublished'
                : 'post.updated'

        await recordAuditEvent({
          action,
          collection: 'posts',
          documentID: String(doc.id),
          metadata: { status: doc._status || null },
          payload: req.payload,
          summary: `${action === 'post.published' ? 'Publicó' : action === 'post.unpublished' ? 'Retiró' : operation === 'create' ? 'Creó' : 'Actualizó'} el artículo ${doc.title}.`,
          user: req.user,
        })
      },
    ],
    afterDelete: [
      async ({ doc, req }) => {
        if (!isActiveAdmin(req.user)) return
        await recordAuditEvent({
          action: 'post.deleted',
          collection: 'posts',
          documentID: String(doc.id),
          payload: req.payload,
          summary: `Eliminó el artículo ${doc.title || doc.id}.`,
          user: req.user,
        })
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
      admin: {
        description: 'Imagen destacada del artículo (mínimo 1200 px de ancho recomendado). Se requiere para publicar.',
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
      label: 'Publicación y autor',
      admin: {
        description: 'Se completa automáticamente; solo ajústalo si hace falta.',
        initCollapsed: true,
      },
      fields: [
        {
          name: 'featured',
          type: 'checkbox',
          label: 'Destacado',
          defaultValue: false,
          admin: { description: 'Marca el artículo para aparecer en secciones destacadas.' },
        },
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
          admin: {
            placeholder: 'Usa el título del artículo si no lo sabes',
            description: 'Máximo 70 caracteres. Si se deja vacío se usa el título.',
          },
        },
        {
          name: 'authorAvatar',
          type: 'upload',
          relationTo: 'media',
          label: 'Foto del autor',
          admin: {
            hidden: true,
          },
        },
        {
          name: 'seoDescription',
          type: 'textarea',
          label: 'Descripción SEO',
          maxLength: 170,
          admin: {
            rows: 3,
            placeholder: 'Usa el resumen si no defines uno propio',
            description: 'Máximo 170 caracteres. Si se deja vacío se usa el resumen.',
          },
        },
        {
          name: 'noindex',
          type: 'checkbox',
          label: 'No indexar en buscadores',
          defaultValue: false,
          admin: {
            description: 'Marca solo si no quieres que este artículo aparezca en Google.',
          },
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
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'admins',
      required: true,
      admin: {
        hidden: true,
      },
      access: {
        read: ({ req }) => isActiveAdmin(req.user),
      },
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
