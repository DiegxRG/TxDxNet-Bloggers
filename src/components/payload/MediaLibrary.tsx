import type { ListViewServerProps } from 'payload'

import type { Media } from '@/payload-types'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'

import { MediaLibraryClient } from './MediaLibraryClient'

export default async function MediaLibrary(props: ListViewServerProps) {
  const { payload } = props

  const { docs } = await payload.find({
    collection: 'media',
    limit: 100,
    sort: '-createdAt',
    where: {
      and: [
        { mimeType: { not_equals: 'application/pdf' } },
        { or: [{ purpose: { equals: 'editorial' } }, { purpose: { exists: false } }] },
      ],
    },
  })

  const items = docs.map((media) => {
    const data = media as unknown as Media
    return {
      id: String(data.id),
      filename: data.filename || String(data.id),
      alt: data.alt || '',
      url: getMediaURL(data, 'card'),
      thumbnailURL: getMediaURL(data, 'thumbnail'),
      filesize: data.filesize || 0,
      mimeType: data.mimeType || '',
      width: data.width || null,
      height: data.height || null,
      updatedAt: data.updatedAt,
    }
  })

  return <MediaLibraryClient items={items} />
}
