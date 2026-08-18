'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'

import { articleConverters } from '@/components/articles/article-rich-text-converters'
import type { Post } from '@/payload-types'

export function PanelRichTextPreview({ data }: { data: Post['content'] }) {
  return <RichText className="article-prose" converters={articleConverters} data={data} />
}
