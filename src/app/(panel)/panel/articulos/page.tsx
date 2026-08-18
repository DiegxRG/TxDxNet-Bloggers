import { PanelArticlesIndex, type PanelArticleItem } from '@/components/panel/PanelArticlesIndex'
import { getMediaAlt, getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { startPanelMeasure } from '@/modules/panel/server/perf'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Post } from '@/payload-types'

import { deletePanelPostFromFormAction } from './actions'

type PanelSearchParams = Record<string, string | string[] | undefined>

type Props = {
  searchParams: Promise<PanelSearchParams>
}

export default async function PanelArticlesPage({ searchParams }: Props) {
  const measure = startPanelMeasure('articulos:index')
  const { payload, user } = await getPanelSession()
  const params = await searchParams
  const requestedStatus = Array.isArray(params.status) ? params.status[0] : params.status
  const initialFilter =
    requestedStatus === 'draft' || requestedStatus === 'published' || requestedStatus === 'featured'
      ? requestedStatus
      : 'all'

  const [{ docs }, { docs: publishedDocs }] = await Promise.all([
    payload.find({
      collection: 'posts',
      depth: 1,
      draft: true,
      limit: 60,
      overrideAccess: false,
      user,
      sort: '-updatedAt',
    }),
    payload.find({
      collection: 'posts',
      depth: 1,
      draft: false,
      limit: 60,
      overrideAccess: false,
      user,
      sort: '-updatedAt',
    }),
  ])

  const publishedIDs = new Set(publishedDocs.map((doc) => String(doc.id)))

  const items: PanelArticleItem[] = docs.map((doc) => {
    const post = doc as unknown as Post

    return {
      id: post.id,
      title: post.title || 'Articulo sin titulo',
      excerpt: post.excerpt || 'Sin resumen todavia.',
      status: publishedIDs.has(String(post.id)) ? 'published' : post._status || 'draft',
      featured: Boolean(post.featured),
      slug: post.slug || '',
      coverAlt: getMediaAlt(post.coverImage, post.title || 'Articulo'),
      coverURL: getMediaURL(post.coverImage, 'card'),
      publishedAt: post.publishedAt || null,
      updatedAt: post.updatedAt,
    }
  })

  measure.end({ docs: items.length, initialFilter })

  return <PanelArticlesIndex deleteAction={deletePanelPostFromFormAction} initialFilter={initialFilter} items={items} />
}
