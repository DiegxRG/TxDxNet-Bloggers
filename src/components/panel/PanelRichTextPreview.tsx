'use client'

import { RichText } from '@payloadcms/richtext-lexical/react'

import { createArticleConverters } from '@/components/articles/article-rich-text-converters'
import type { Post } from '@/payload-types'

type PreviewMediaItem = {
  id: string
  thumbnailURL: null | string
}

export function PanelRichTextPreview({ data, mediaItems }: { data: Post['content']; mediaItems?: PreviewMediaItem[] }) {
  const resolveUploadURL = (id: string) => mediaItems?.find((item) => item.id === id)?.thumbnailURL || null

  return <RichText className="article-prose" converters={createArticleConverters(resolveUploadURL)} data={data} />
}
