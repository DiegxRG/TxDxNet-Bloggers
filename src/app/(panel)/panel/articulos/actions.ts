'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { slugify } from '@/modules/content/domain/slugify'
import { parseDateTimeInput } from '@/modules/panel/server/post-editor'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Admin, Post } from '@/payload-types'
import type { Where } from 'payload'

type AdminWithAvatar = Admin & { avatar?: unknown }

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

function getRelationID(value: unknown) {
  if (!value) return null
  return typeof value === 'string' ? value : typeof value === 'object' && value !== null && 'id' in value ? String(value.id) : null
}

function parseLexicalJSON(raw: string): Record<string, unknown> | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && 'root' in (parsed as Record<string, unknown>)) {
      return parsed as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function normalizeLexicalLinks(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeLexicalLinks)
  if (!value || typeof value !== 'object') return value

  const source = value as Record<string, unknown>
  const next = Object.fromEntries(Object.entries(source).map(([key, item]) => [key, normalizeLexicalLinks(item)]))

  if (source.type === 'link' || source.type === 'autolink') {
    const directFields = {
      doc: null,
      linkType: 'custom' as const,
      newTab: Boolean(source.newTab || source.target === '_blank'),
      ...(typeof source.url === 'string' ? { url: source.url } : {}),
    }
    const storedFields = source.fields && typeof source.fields === 'object'
      ? source.fields as Record<string, unknown>
      : {}

    next.fields = {
      ...directFields,
      ...storedFields,
      doc: storedFields.doc ?? directFields.doc,
      linkType: storedFields.linkType === 'internal' ? 'internal' : directFields.linkType,
      newTab: Boolean(storedFields.newTab ?? directFields.newTab),
    }
    delete next.newTab
    delete next.rel
    delete next.target
    delete next.title
    delete next.url
    next.version = source.type === 'autolink' ? 2 : 3
  }

  return next
}

function hasLexicalContent(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const root = (value as { root?: unknown }).root
  if (!root || typeof root !== 'object') return false

  function hasNodes(nodes: unknown): boolean {
    if (!Array.isArray(nodes)) return false
    return nodes.some((node) => {
      if (!node || typeof node !== 'object') return false
      const item = node as { children?: unknown; text?: unknown; type?: unknown }
      if (typeof item.text === 'string' && item.text.trim()) return true
      if (item.type && item.type !== 'paragraph' && item.type !== 'linebreak') return true
      return hasNodes(item.children)
    })
  }

  return hasNodes((root as { children?: unknown }).children)
}

function getPayloadErrorSummary(error: unknown) {
  if (!error || typeof error !== 'object') return String(error)
  const record = error as Record<string, unknown>
  const data = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : null
  const errors = Array.isArray(data?.errors) ? data.errors : Array.isArray(record.errors) ? record.errors : []

  if (errors.length) {
    return errors.map((item) => {
      if (!item || typeof item !== 'object') return String(item)
      const entry = item as { message?: unknown; path?: unknown }
      const path = Array.isArray(entry.path) ? entry.path.join('.') : String(entry.path || 'campo')
      return `${path}: ${String(entry.message || 'valor no válido')}`
    }).join('; ')
  }

  return error instanceof Error ? error.message : String(error)
}

function isValidationError(error: unknown) {
  return /invalid|required|max|valid|resumen|seo|featured-limit/i.test(getPayloadErrorSummary(error))
}

function revalidatePublicArticle(slug: string) {
  revalidateTag('posts-list', 'hours')
  revalidateTag('posts-featured', 'hours')
  revalidateTag('post-detail', 'hours')
  revalidateTag('posts-related', 'hours')
  revalidatePath('/')
  revalidatePath('/articulos')
  revalidatePath('/sitemap.xml')
  if (slug) revalidatePath(`/articulos/${slug}`)
}

type PanelSession = Awaited<ReturnType<typeof getPanelSession>>

async function ensureUniquePostSlug(
  payload: PanelSession['payload'],
  user: PanelSession['user'],
  candidate: string,
  title: string,
  excludeID?: string,
) {
  const base = slugify(candidate || title || 'articulo') || `articulo-${Date.now()}`

  let slug = base
  let index = 2

  for (;;) {
    const conditions: Where[] = [{ slug: { equals: slug } }]
    if (excludeID) conditions.push({ id: { not_equals: excludeID } })

    const existing = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1,
      overrideAccess: false,
      pagination: false,
      user,
      where: { and: conditions },
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
  const content = normalizeLexicalLinks(parseLexicalJSON(asString(formData, 'contentLexical')))
  const authorName = user.name
  const authorRole = user.publicTitle || ''
  const authorAvatar = getRelationID((user as AdminWithAvatar).avatar)
  const slug = await ensureUniquePostSlug(payload, user, asString(formData, 'slug'), title)
  const publishedAt = parseDateTimeInput(asString(formData, 'publishedAt'))

  let created: Post
  try {
    created = (await payload.create({
      collection: 'posts',
      data: {
        authorName,
        authorAvatar,
        authorRole: authorRole || null,
        canonicalURL: asNullableString(formData, 'canonicalURL'),
        content: (content || {
          root: { type: 'root', children: [], direction: 'ltr', format: '', indent: 0, version: 1 },
        }) as Post['content'],
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
    })) as Post
  } catch (error) {
    console.error('[panel] articulos:create:error', getPayloadErrorSummary(error))
    redirect('/panel/articulos/nuevo?estado=error')
  }

  revalidateTag('posts-list', 'hours')
  revalidatePath('/panel')
  revalidatePath('/panel/articulos')
  redirect(`/panel/articulos/${created.id}?estado=creado`)
}

async function ensureFeaturedLimit(
  payload: PanelSession['payload'],
  user: PanelSession['user'],
  excludeID: string,
) {
  const featuredPosts = await payload.find({
    collection: 'posts',
    depth: 0,
    draft: false,
    limit: 4,
    overrideAccess: false,
    pagination: false,
    sort: '-publishedAt',
    user,
    where: {
      and: [
        { _status: { equals: 'published' } },
        { featured: { equals: true } },
        { id: { not_equals: excludeID } },
      ],
    },
  })

  if (featuredPosts.docs.length >= 3) throw new Error('featured-limit')
}

export async function updatePanelPostAction(postID: string, formData: FormData) {
  const { payload, user } = await getPanelSession()
  const intent = asString(formData, 'intent') === 'publish' ? 'publish' : 'draft'
  const current = await payload.findByID({
    collection: 'posts',
    id: postID,
    depth: 1,
    draft: true,
    overrideAccess: false,
    user,
  })
  const currentWithAvatar = current as Post & { authorAvatar?: unknown }
  const isPublishing = intent === 'publish' && current._status !== 'published'

  const title = asString(formData, 'title') || current.title || 'Borrador sin titulo'
  const payloadData: Record<string, unknown> = {
    _status: intent === 'publish' ? 'published' : 'draft',
    authorAvatar: isPublishing
      ? getRelationID((user as AdminWithAvatar).avatar)
      : getRelationID(currentWithAvatar.authorAvatar),
    authorName: isPublishing ? user.name : current.authorName || user.name,
    authorRole: isPublishing ? user.publicTitle || null : current.authorRole || null,
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
    slug: await ensureUniquePostSlug(payload, user, asString(formData, 'slug'), title, postID),
    socialImage: asNullableString(formData, 'socialImage'),
    title,
  }

  const lexicalContent = parseLexicalJSON(asString(formData, 'contentLexical'))
  if (lexicalContent) {
    payloadData.content = normalizeLexicalLinks(lexicalContent)
  }

  if (intent === 'publish') {
    const hasCover = payloadData.coverImage || current.coverImage
    const hasContent = hasLexicalContent(payloadData.content || current.content)
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
      } catch (error) {
        console.error('[panel] articulos:prepublish-save:error', {
          postID,
          error: error instanceof Error ? error.message : String(error),
        })
        // best-effort save — still redirect with publish error
      }
      const errorEstado = !hasCover ? 'error-publicar-portada' : 'error-publicar-contenido'
      redirect(`/panel/articulos/${postID}?estado=${errorEstado}`)
    }
  }

  let persistedStatus: 'draft' | 'published' | null = null

  try {
    if (intent === 'publish' && asBoolean(formData, 'featured')) {
      await ensureFeaturedLimit(payload, user, postID)
    }

    const updatedPost = await payload.update({
      collection: 'posts',
      data: payloadData,
      draft: intent !== 'publish',
      id: postID,
      overrideAccess: false,
      user,
    })
    persistedStatus = updatedPost._status || 'draft'

    console.info('[panel] articulos:update:success', {
      postID,
      intent,
      status: persistedStatus,
    })

  } catch (error) {
    const errorSummary = getPayloadErrorSummary(error)
    console.error('[panel] articulos:update:error', {
      postID,
      intent,
      error: errorSummary,
    })
    const errorEstado = errorSummary.includes('featured-limit')
      ? 'error-publicar-favoritos'
      : intent === 'publish' && isValidationError(error)
        ? 'error-publicar-validacion'
        : intent === 'publish'
          ? 'error-publicar'
          : 'error-guardar'
    redirect(`/panel/articulos/${postID}?estado=${errorEstado}`)
  }

  if (intent === 'publish' && persistedStatus !== 'published') {
    console.error('[panel] articulos:publish:unexpected-status', {
      postID,
      status: persistedStatus || 'unknown',
    })
    redirect(`/panel/articulos/${postID}?estado=error-publicar`)
  }

  revalidatePath('/panel')
  revalidatePath('/panel/articulos')
  revalidatePath(`/panel/articulos/${postID}`)
  if (intent === 'publish' || current._status === 'published') {
    revalidatePublicArticle(String(payloadData.slug || current.slug || ''))
  }
  redirect(`/panel/articulos/${postID}?estado=${intent === 'publish' ? 'publicado' : 'guardado'}`)
}

export async function deletePanelPostAction(postID: string) {
  const { payload, user } = await getPanelSession()
  let deletedSlug = ''

  try {
    const current = await payload.findByID({
      collection: 'posts',
      depth: 0,
      draft: true,
      id: postID,
      overrideAccess: false,
      user,
    })
    deletedSlug = current.slug || ''
  } catch {
    // The delete request below remains the source of truth.
  }

  try {
    await payload.delete({
      collection: 'posts',
      id: postID,
      overrideAccess: false,
      user,
    })
  } catch (error) {
    console.error('[panel] articulos:delete:error', {
      postID,
      error: error instanceof Error ? error.message : String(error),
    })
    redirect(`/panel/articulos/${postID}?estado=error-eliminar`)
  }

  revalidateTag('posts-list', 'hours')
  revalidateTag('posts-featured', 'hours')
  revalidateTag('post-detail', 'hours')
  revalidateTag('posts-related', 'hours')
  revalidatePath('/panel')
  revalidatePath('/panel/articulos')
  if (deletedSlug) revalidatePublicArticle(deletedSlug)
  redirect('/panel/articulos?estado=eliminado')
}

export async function deletePanelPostFromFormAction(formData: FormData) {
  const postID = formData.get('postID')?.toString().trim()
  if (!postID) redirect('/panel/articulos?estado=error-eliminar')
  await deletePanelPostAction(postID)
}
