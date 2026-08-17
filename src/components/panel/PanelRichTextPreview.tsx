'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import type { ActionCardBlock, CalloutBlock, Media, MediaFeatureBlock, Post } from '@/payload-types'

function getPreviewMediaURL(media: Media | null | string | undefined, size: 'card' | 'hero' | 'thumbnail' = 'card') {
  if (!media || typeof media === 'string') return null

  const mediaURL = media.sizes?.[size]?.url || media.url
  if (!mediaURL) return null

  try {
    const parsedURL = new URL(mediaURL)
    if (parsedURL.pathname.startsWith('/api/media/file/')) {
      return `${parsedURL.pathname}${parsedURL.search}`
    }
  } catch {
    return mediaURL
  }

  return mediaURL
}

function getPreviewMediaAlt(media: Media | null | string | undefined, fallback: string) {
  return media && typeof media === 'object' ? media.alt || fallback : fallback
}

const converters = ({ defaultConverters }: any) => ({
  ...defaultConverters,
  blocks: {
    actionCard: ({ node }: any) => {
      const fields = (node as { fields: ActionCardBlock }).fields
      const safeHref = /^(https?:\/\/|mailto:|\/)/.test(fields.href) ? fields.href : '#'

      return (
        <aside className="article-action-card">
          <div>
            <span>SIGUIENTE MOVIMIENTO</span>
            <h3>{fields.title}</h3>
            {fields.body ? <p>{fields.body}</p> : null}
          </div>
          <a href={safeHref}>{fields.label} ↗</a>
        </aside>
      )
    },
    callout: ({ node }: any) => {
      const fields = (node as { fields: CalloutBlock }).fields

      return (
        <aside className={`article-callout article-callout--${fields.tone}`}>
          {fields.eyebrow ? <span>{fields.eyebrow}</span> : null}
          <h3>{fields.title}</h3>
          <p>{fields.body}</p>
        </aside>
      )
    },
    mediaFeature: ({ node }: any) => {
      const fields = (node as { fields: MediaFeatureBlock }).fields
      const imageURL = getPreviewMediaURL(fields.media, 'hero')
      if (!imageURL) return null

      return (
        <figure className={`article-media article-media--${fields.layout}`}>
          <div>
            <Image
              alt={getPreviewMediaAlt(fields.media, fields.caption || 'Imagen del artículo')}
              fill
              sizes="(max-width: 960px) 100vw, 1200px"
              src={imageURL}
            />
          </div>
          {fields.caption ? <figcaption>{fields.caption}</figcaption> : null}
        </figure>
      )
    },
  },
})

export function PanelRichTextPreview({ data }: { data: Post['content'] }) {
  return <RichText className="article-prose" converters={converters} data={data} />
}
