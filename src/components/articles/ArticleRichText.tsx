import type { JSXConverterArgs, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'

import { getMediaAlt, getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import type { ActionCardBlock, CalloutBlock, MediaFeatureBlock, Post } from '@/payload-types'

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  blocks: {
    actionCard: ({ node }: JSXConverterArgs) => {
      const fields = (node as unknown as { fields: ActionCardBlock }).fields
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
    callout: ({ node }: JSXConverterArgs) => {
      const fields = (node as unknown as { fields: CalloutBlock }).fields

      return (
        <aside className={`article-callout article-callout--${fields.tone}`}>
          {fields.eyebrow ? <span>{fields.eyebrow}</span> : null}
          <h3>{fields.title}</h3>
          <p>{fields.body}</p>
        </aside>
      )
    },
    mediaFeature: ({ node }: JSXConverterArgs) => {
      const fields = (node as unknown as { fields: MediaFeatureBlock }).fields
      const imageURL = getMediaURL(fields.media, 'hero')
      if (!imageURL) return null

      return (
        <figure className={`article-media article-media--${fields.layout}`}>
          <div>
            <Image
              alt={getMediaAlt(fields.media, fields.caption || 'Imagen del artículo')}
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

export function ArticleRichText({ data }: { data: Post['content'] }) {
  return <RichText className="article-prose" converters={converters} data={data} />
}
