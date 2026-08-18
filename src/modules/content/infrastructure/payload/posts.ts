import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'

import type { Media, Post } from '@/payload-types'

export { getMediaURL } from '@/modules/content/domain/media-url'

const publishedFilter: Where = {
  _status: { equals: 'published' },
}

export async function getPublishedPosts(limit = 12): Promise<Post[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      draft: false,
      limit,
      overrideAccess: false,
      sort: '-publishedAt',
      where: publishedFilter,
    })

    return result.docs
  } catch (error) {
    console.error('[editorial] No se pudieron cargar los artículos publicados.', error)
    return []
  }
}

export async function getFeaturedPublishedPosts(limit = 3): Promise<Post[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      depth: 2,
      draft: false,
      limit,
      overrideAccess: false,
      sort: '-publishedAt',
      where: {
        and: [publishedFilter, { featured: { equals: true } }],
      },
    })

    return result.docs
  } catch (error) {
    console.error('[editorial] No se pudieron cargar los favoritos de portada.', error)
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
        ],
      },
    })

    return result.docs
  } catch (error) {
    console.error('[editorial] No se pudieron cargar los artículos relacionados.', error)
    return []
  }
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

export function getMediaAlt(media: string | Media | null | undefined, fallback: string) {
  return media && typeof media === 'object' ? media.alt || fallback : fallback
}
