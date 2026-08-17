import { notFound } from 'next/navigation'

import { PanelPostEditor, type PanelEditorMediaItem } from '@/components/panel/PanelPostEditor'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import {
  canEditSimpleContent,
  plainTextToEditableHTML,
  richTextToPlainText,
} from '@/modules/panel/server/post-editor'
import { startPanelMeasure } from '@/modules/panel/server/perf'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Media, Post } from '@/payload-types'

import { updatePanelPostAction } from '../actions'

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

  let article: Post

  try {
    article = (await payload.findByID({
      collection: 'posts',
      id,
      depth: 2,
      overrideAccess: false,
      user,
    })) as Post
  } catch {
    notFound()
  }

  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 12,
    overrideAccess: false,
    user,
    sort: '-createdAt',
  })

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
  const simpleContentEnabled = canEditSimpleContent(article.content)
  const contentPlainText = richTextToPlainText(article.content)
  const editableHTML = plainTextToEditableHTML(contentPlainText)
  const previewCoverURL = getMediaURL(article.coverImage, 'card')

  measure.end({ articleID: article.id, mediaItems: mediaItems.length, simpleContentEnabled })

  return (
    <PanelPostEditor
      article={article}
      authorDefaults={{ name: article.authorName || '', role: article.authorRole || '' }}
      contentPlainText={editableHTML}
      formAction={updatePanelPostAction.bind(null, article.id)}
      mediaItems={mediaItems}
      mode="edit"
      previewCoverURL={previewCoverURL}
      simpleContentEnabled={simpleContentEnabled}
      status={status}
    />
  )
}
