import configPromise from '@payload-config'
import type { Where } from 'payload'
import { getPayload } from 'payload'
import { unstable_cache } from 'next/cache'

import type { Locale } from '@/lib/locale'
import type { Media, Post } from '@/payload-types'

export { getMediaURL } from '@/modules/content/domain/media-url'

const publishedFilter: Where = {
  _status: { equals: 'published' },
}

const publicPostListSelect = {
  id: true,
  title: true,
  slug: true,
  excerpt: true,
  content: true,
  featured: true,
  publishedAt: true,
  authorName: true,
  authorAvatar: true,
  coverImage: true,
  createdAt: true,
  updatedAt: true,
} as const

const publicPostDetailSelect = {
  ...publicPostListSelect,
  authorRole: true,
  socialImage: true,
  seoTitle: true,
  seoDescription: true,
  noindex: true,
  canonicalURL: true,
} as const

const publicPostPathSelect = {
  slug: true,
  updatedAt: true,
  featured: true,
  noindex: true,
} as const

const getPublishedPostsCached = unstable_cache(
  async (limit: number): Promise<Post[]> => {
    try {
      const config = await configPromise
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'posts',
        depth: 1,
        draft: false,
        limit,
        overrideAccess: false,
        select: publicPostListSelect,
        sort: '-publishedAt',
        where: publishedFilter,
      })

      return result.docs as Post[]
    } catch (error) {
      console.error('[editorial] No se pudieron cargar los artículos publicados.', error)
      return []
    }
  },
  ['posts-list'],
  { revalidate: 3600, tags: ['posts-list'] },
)

export async function getPublishedPosts(limit = 12): Promise<Post[]> {
  return getPublishedPostsCached(limit)
}

const getFeaturedPublishedPostsCached = unstable_cache(
  async (limit: number): Promise<Post[]> => {
    try {
      const config = await configPromise
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'posts',
        depth: 1,
        draft: false,
        limit,
        overrideAccess: false,
        select: publicPostListSelect,
        sort: '-publishedAt',
        where: {
          and: [publishedFilter, { featured: { equals: true } }],
        },
      })

      return result.docs as Post[]
    } catch (error) {
      console.error('[editorial] No se pudieron cargar los favoritos de portada.', error)
      return []
    }
  },
  ['posts-featured'],
  { revalidate: 3600, tags: ['posts-featured'] },
)

export async function getFeaturedPublishedPosts(limit = 3): Promise<Post[]> {
  return getFeaturedPublishedPostsCached(limit)
}

const getPublishedPostBySlugCached = unstable_cache(
  async (slug: string): Promise<Post | null> => {
    try {
      const config = await configPromise
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'posts',
        depth: 1,
        draft: false,
        limit: 1,
        overrideAccess: false,
        select: publicPostDetailSelect,
        where: {
          and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
        },
      })

      return (result.docs[0] as Post | undefined) || null
    } catch (error) {
      console.error(`[editorial] No se pudo cargar el artículo "${slug}".`, error)
      return null
    }
  },
  ['post-detail'],
  { revalidate: 3600, tags: ['post-detail'] },
)

export async function getPublishedPostBySlug(slug: string): Promise<Post | null> {
  return getPublishedPostBySlugCached(slug)
}

const getRelatedPostsCached = unstable_cache(
  async (postID: string, limit: number): Promise<Post[]> => {
    try {
      const config = await configPromise
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'posts',
        depth: 1,
        draft: false,
        limit,
        overrideAccess: false,
        select: publicPostListSelect,
        sort: '-publishedAt',
        where: {
          and: [
            { _status: { equals: 'published' } },
            { id: { not_equals: postID } },
          ],
        },
      })

      return result.docs as Post[]
    } catch (error) {
      console.error('[editorial] No se pudieron cargar los artículos relacionados.', error)
      return []
    }
  },
  ['posts-related'],
  { revalidate: 3600, tags: ['posts-related'] },
)

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  return getRelatedPostsCached(post.id, limit)
}

const getPublishedPostPathsCached = unstable_cache(
  async (limit: number) => {
    try {
      const config = await configPromise
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'posts',
        depth: 0,
        draft: false,
        limit,
        overrideAccess: false,
        select: publicPostPathSelect,
        sort: '-updatedAt',
        where: publishedFilter,
      })

      return result.docs as Pick<Post, 'featured' | 'noindex' | 'slug' | 'updatedAt'>[]
    } catch (error) {
      console.error('[editorial] No se pudieron cargar las rutas del sitemap.', error)
      return []
    }
  },
  ['posts-sitemap'],
  { revalidate: 3600, tags: ['posts-sitemap', 'posts-list'] },
)

export async function getPublishedPostPaths(limit = 100) {
  return getPublishedPostPathsCached(limit)
}

export function formatArticleDate(post: Post, locale: Locale = 'es'): string {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'es-PE', {
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
