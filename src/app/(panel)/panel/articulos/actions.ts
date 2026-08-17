'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { slugify } from '@/modules/content/domain/slugify'
import {
  buildHTMLRichText,
  canEditSimpleContent,
  parseDateTimeInput,
} from '@/modules/panel/server/post-editor'
import { getPanelSession } from '@/modules/panel/server/session'

function asString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() || ''
}

function asNullableString(formData: FormData, key: string) {
  const value = asString(formData, key)
  return value || null
}

function asBoolean(formData: FormData, key: string) {
  return formData.get(key) === 'on'
}

async function ensureDraftSlug(candidate: string, title: string) {
  const { payload, user } = await getPanelSession()
  const base = slugify(candidate || title || 'articulo') || `articulo-${Date.now()}`

  let slug = base
  let index = 2

  for (;;) {
    const existing = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user,
      where: { slug: { equals: slug } },
    })

    if (existing.docs.length === 0) {
      return slug
    }

    slug = `${base}-${index}`
    index += 1
  }
}

export async function createPanelPostAction(formData: FormData) {
  const { payload, user } = await getPanelSession()

  const title = asString(formData, 'title') || 'Borrador sin titulo'
  const excerpt = asString(formData, 'excerpt')
  const coverImage = asNullableString(formData, 'coverImage')
  const content = asString(formData, 'contentHtml')
  const authorName = asString(formData, 'authorName') || user.name
  const authorRole = asString(formData, 'authorRole') || user.publicTitle || ''
  const slug = await ensureDraftSlug(asString(formData, 'slug'), title)
  const publishedAt = parseDateTimeInput(asString(formData, 'publishedAt'))

  try {
    const created = await payload.create({
      collection: 'posts',
      data: {
        authorName,
        authorRole: authorRole || null,
        canonicalURL: asNullableString(formData, 'canonicalURL'),
        content: await buildHTMLRichText(payload, content),
        excerpt,
        featured: asBoolean(formData, 'featured'),
        noindex: asBoolean(formData, 'noindex'),
        ...(publishedAt ? { publishedAt } : {}),
        seoDescription: asNullableString(formData, 'seoDescription'),
        seoTitle: asNullableString(formData, 'seoTitle'),
        slug,
        socialImage: asNullableString(formData, 'socialImage'),
        title,
        ...(coverImage ? { coverImage } : {}),
      },
      draft: true,
      overrideAccess: false,
      user,
    })

    revalidatePath('/panel')
    revalidatePath('/panel/articulos')
    redirect(`/panel/articulos/${created.id}?estado=creado`)
  } catch {
    redirect('/panel/articulos/nuevo?estado=error')
  }
}

export async function updatePanelPostAction(postID: string, formData: FormData) {
  const { payload, user } = await getPanelSession()
  const intent = asString(formData, 'intent') === 'publish' ? 'publish' : 'draft'
  const current = await payload.findByID({
    collection: 'posts',
    id: postID,
    depth: 1,
    overrideAccess: false,
    user,
  })

  const allowSimpleContentUpdate = formData.get('allowSimpleContentUpdate') === '1'
  const title = asString(formData, 'title') || current.title || 'Borrador sin titulo'
  const payloadData: Record<string, unknown> = {
    authorName: asString(formData, 'authorName') || user.name,
    authorRole: asString(formData, 'authorRole') || null,
    canonicalURL: asNullableString(formData, 'canonicalURL'),
    coverImage: asNullableString(formData, 'coverImage'),
    excerpt: asString(formData, 'excerpt'),
    featured: asBoolean(formData, 'featured'),
    noindex: asBoolean(formData, 'noindex'),
    publishedAt:
      parseDateTimeInput(asString(formData, 'publishedAt')) ||
      (intent === 'publish' ? new Date().toISOString() : current.publishedAt || null),
    seoDescription: asNullableString(formData, 'seoDescription'),
    seoTitle: asNullableString(formData, 'seoTitle'),
    slug: slugify(asString(formData, 'slug') || title),
    socialImage: asNullableString(formData, 'socialImage'),
    title,
  }

  if (allowSimpleContentUpdate && canEditSimpleContent(current.content)) {
    payloadData.content = await buildHTMLRichText(payload, asString(formData, 'contentHtml'))
  }

  if (intent === 'publish') {
    const hasCover = payloadData.coverImage || current.coverImage
    const hasContent = payloadData.content || current.content
    if (!hasCover || !hasContent) {
      try {
        await payload.update({
          collection: 'posts',
          data: payloadData,
          draft: true,
          id: postID,
          overrideAccess: false,
          user,
        })
        revalidatePath('/panel')
        revalidatePath('/panel/articulos')
        revalidatePath(`/panel/articulos/${postID}`)
      } catch {
        // best-effort save — still redirect with publish error
      }
      const errorEstado = !hasCover ? 'error-publicar-portada' : 'error-publicar-contenido'
      redirect(`/panel/articulos/${postID}?estado=${errorEstado}`)
    }
  }

  try {
    await payload.update({
      collection: 'posts',
      data: payloadData,
      draft: intent !== 'publish',
      id: postID,
      overrideAccess: false,
      user,
    })

    revalidatePath('/panel')
    revalidatePath('/panel/articulos')
    revalidatePath(`/panel/articulos/${postID}`)
    redirect(`/panel/articulos/${postID}?estado=${intent === 'publish' ? 'publicado' : 'guardado'}`)
  } catch {
    redirect(`/panel/articulos/${postID}?estado=${intent === 'publish' ? 'error-publicar' : 'error-guardar'}`)
  }
}
