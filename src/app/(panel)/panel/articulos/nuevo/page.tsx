import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { plainTextToEditableHTML } from '@/modules/panel/server/post-editor'
import { startPanelMeasure } from '@/modules/panel/server/perf'
import { getPanelSession } from '@/modules/panel/server/session'

import { PanelPostEditor, type PanelEditorMediaItem } from '@/components/panel/PanelPostEditor'

import { createPanelPostAction } from '../actions'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function NewPanelArticlePage({ searchParams }: Props) {
  const measure = startPanelMeasure('articulos:nuevo')
  const { payload, user } = await getPanelSession()
  const params = await searchParams
  const status = Array.isArray(params.estado) ? params.estado[0] : params.estado || null

  const { docs } = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 12,
    overrideAccess: false,
    user,
    sort: '-createdAt',
  })

  const mediaItems: PanelEditorMediaItem[] = docs.map((doc) => ({
    id: String(doc.id),
    filename: doc.filename || String(doc.id),
    alt: doc.alt || '',
    thumbnailURL: getMediaURL(doc, 'thumbnail'),
  }))

  measure.end({ mediaItems: mediaItems.length })

  return (
    <PanelPostEditor
      article={null}
      authorDefaults={{ name: user.name || '', role: user.publicTitle || '' }}
      contentPlainText={plainTextToEditableHTML('')}
      formAction={createPanelPostAction}
      mediaItems={mediaItems}
      mode="create"
      previewCoverURL={null}
      simpleContentEnabled
      status={status}
    />
  )
}
