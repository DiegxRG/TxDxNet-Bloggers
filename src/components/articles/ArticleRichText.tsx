import { RichText } from '@payloadcms/richtext-lexical/react'

import { articleConverters } from './article-rich-text-converters'
import type { Post } from '@/payload-types'

export function ArticleRichText({ data }: { data: Post['content'] }) {
  return <RichText className="article-prose" converters={articleConverters} data={data} />
}
