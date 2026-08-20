import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
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
  const profile = await payload.findByID({
    collection: 'admins',
    depth: 1,
    id: user.id,
    overrideAccess: false,
    user,
  })
  const params = await searchParams
  const status = Array.isArray(params.estado) ? params.estado[0] : params.estado || null

  const { docs } = await payload.find({
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
      authorDefaults={{ avatarURL: getMediaURL(profile.avatar, 'avatar'), name: user.name || '', role: user.publicTitle || '' }}
      formAction={createPanelPostAction}
      mediaItems={mediaItems}
      mode="create"
      previewCoverURL={null}
      status={status}
    />
  )
}
