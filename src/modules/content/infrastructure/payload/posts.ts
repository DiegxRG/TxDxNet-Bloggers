import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'

import type { Domain, Media, Post, Service } from '@/payload-types'

export type ArticleMode = 'domain' | 'service'

const publishedFilter = (mode?: ArticleMode): Where => ({
  and: [
    { _status: { equals: 'published' } },
    ...(mode ? [{ contentType: { equals: mode } }] : []),
  ],
})

export async function getPublishedPosts(limit = 12, mode?: ArticleMode): Promise<Post[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      draft: false,
      limit,
      overrideAccess: false,
      sort: '-publishedAt',
      where: publishedFilter(mode),
    })

    return result.docs
  } catch (error) {
    console.error('[editorial] No se pudieron cargar los artículos publicados.', error)
    return []
  }
}

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      draft: false,
      limit: 1,
      overrideAccess: false,
      where: {
        and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
      },
    })

    return result.docs[0] || null
  } catch (error) {
    console.error(`[editorial] No se pudo cargar el artículo “${slug}”.`, error)
    return null
  }
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      limit,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { id: { not_equals: post.id } },
          { contentType: { equals: post.contentType } },
        ],
      },
    })

    return result.docs
  } catch (error) {
    console.error('[editorial] No se pudieron cargar los artículos relacionados.', error)
    return []
  }
}

export function getArticleLabel(post: Post): string {
  const relation = post.contentType === 'domain' ? post.primaryDomain : post.primaryService

  if (relation && typeof relation === 'object' && 'name' in relation) {
    return (relation as Domain | Service).name
  }

  return post.contentType === 'domain' ? 'Dominio XOC' : 'Servicio TxDxSecure'
}

export function formatArticleDate(post: Post): string {
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Lima',
    year: 'numeric',
  }).format(new Date(post.publishedAt || post.createdAt))
}

export function estimateReadingMinutes(post: Post): number {
  const collectText = (value: unknown): string[] => {
    if (!value || typeof value !== 'object') return []
    if (Array.isArray(value)) return value.flatMap(collectText)

    const record = value as Record<string, unknown>
    const ownText = typeof record.text === 'string' ? [record.text] : []
    return [...ownText, ...Object.values(record).flatMap(collectText)]
  }

  const words = collectText(post.content).join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(2, Math.ceil(words / 210))
}

export function getMediaURL(media: string | Media | null | undefined, size: 'card' | 'hero' = 'card') {
  if (!media || typeof media === 'string') return null
  return media.sizes?.[size]?.url || media.url || null
}

export function getMediaAlt(media: string | Media | null | undefined, fallback: string) {
  return media && typeof media === 'object' ? media.alt || fallback : fallback
}
