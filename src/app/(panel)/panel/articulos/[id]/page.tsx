import { notFound } from 'next/navigation'

import { PanelPostEditor, type PanelEditorMediaItem } from '@/components/panel/PanelPostEditor'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { startPanelMeasure } from '@/modules/panel/server/perf'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Media, Post } from '@/payload-types'

import { deletePanelPostAction, updatePanelPostAction } from '../actions'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function normalizeMediaItem(media: Media) {
  return {
    id: String(media.id),
    filename: media.filename || String(media.id),
    alt: media.alt || '',
    thumbnailURL: getMediaURL(media, 'thumbnail'),
  }
}

export default async function PanelArticleDetailPage({ params, searchParams }: Props) {
  const measure = startPanelMeasure('articulos:detail')
  const { payload, user } = await getPanelSession()
  const { id } = await params
  const query = await searchParams
  const status = Array.isArray(query.estado) ? query.estado[0] : query.estado || null

  const [profile, articleResult, { docs }] = await Promise.all([
    payload.findByID({
      collection: 'admins',
      depth: 1,
      id: user.id,
      overrideAccess: false,
      select: { avatar: true },
      user,
    }),
    payload.findByID({
      collection: 'posts',
      id,
      depth: 1,
      draft: true,
      overrideAccess: false,
      select: {
        _status: true,
        authorAvatar: true,
        authorName: true,
        authorRole: true,
        canonicalURL: true,
        content: true,
        coverImage: true,
        excerpt: true,
        featured: true,
        id: true,
        noindex: true,
        publishedAt: true,
        seoDescription: true,
        seoTitle: true,
        slug: true,
        socialImage: true,
        title: true,
      },
      user,
    }).catch(() => null),
    payload.find({
      collection: 'media',
      depth: 0,
      limit: 12,
      overrideAccess: false,
      select: { id: true, filename: true, alt: true, sizes: true },
      user,
      sort: '-createdAt',
      where: {
        and: [
          { mimeType: { not_equals: 'application/pdf' } },
          { or: [{ purpose: { equals: 'editorial' } }, { purpose: { exists: false } }] },
        ],
      },
    }),
  ])

  if (!articleResult) notFound()
  const article = articleResult as Post

  const mediaMap = new Map<string, PanelEditorMediaItem>()

  docs.forEach((doc) => {
    const item = normalizeMediaItem(doc as Media)
    mediaMap.set(item.id, item)
  })

  ;[article.coverImage, article.socialImage].forEach((media) => {
    if (media && typeof media === 'object') {
      const item = normalizeMediaItem(media as Media)
      mediaMap.set(item.id, item)
    }
  })

  const mediaItems = Array.from(mediaMap.values())
  const previewCoverURL = getMediaURL(article.coverImage, 'card')

  measure.end({ articleID: article.id, mediaItems: mediaItems.length })

  return (
    <PanelPostEditor
      article={article}
      authorDefaults={{ avatarURL: getMediaURL(profile.avatar, 'avatar'), name: article.authorName || '', role: article.authorRole || '' }}
      contentLexicalValue={article.content || undefined}
      deleteAction={deletePanelPostAction.bind(null, article.id)}
      formAction={updatePanelPostAction.bind(null, article.id)}
      mediaItems={mediaItems}
      mode="edit"
      previewCoverURL={previewCoverURL}
      status={status}
    />
  )
}
