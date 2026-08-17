'use client'

import Image from 'next/image'

import { PanelRichTextPreview } from './PanelRichTextPreview'
import type { Post } from '@/payload-types'

type ArticleData = {
  authorName?: string
  authorRole?: string
  content?: Post['content']
  excerpt?: string
  featured?: boolean
  htmlContent?: string
  publishedAt?: string
  title?: string
}

type Props = {
  article: null | ArticleData | Post
  authorDefaults: {
    name: string
    role: string
  }
  coverURL: null | string
  tab: 'article' | 'card'
}

function formatDate(value: null | string | undefined) {
  if (!value) return 'Sin fecha'
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function CardPreview({ article, authorDefaults, coverURL }: Omit<Props, 'tab'>) {
  const title = article?.title || 'Titulo del articulo'
  const excerpt = article?.excerpt || 'Resumen del articulo aqui...'
  const authorName = article?.authorName || authorDefaults.name || 'Autor'
  const date = formatDate(article?.publishedAt)

  return (
    <div className="mx-auto max-w-sm overflow-hidden rounded-xl border border-[var(--theme-elevation-150)] bg-white shadow-[0_12px_30px_rgba(7,20,45,0.08)]">
      <div className="relative aspect-[16/10] bg-[var(--theme-elevation-100)]">
        {coverURL ? (
          <Image alt="Portada preview" fill sizes="380px" src={coverURL} />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#07142d] to-[#0f2a52]">
            <span className="font-display text-3xl font-semibold tracking-[-0.06em] text-white/80">TxDx</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-[0.1em] text-[var(--theme-elevation-500)]">
          <span className="text-[#165fb8]">Insight TxDxNet</span>
          <span>{date}</span>
        </div>
        <h3 className="mt-3 font-display text-xl font-semibold leading-tight tracking-[-0.04em] text-[var(--color-ink-950)]">
          {title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--theme-elevation-500)]">
          {excerpt}
        </p>
        <div className="mt-4 border-t border-[var(--theme-elevation-100)] pt-3 text-xs font-semibold text-[var(--theme-elevation-500)]">
          <span>{authorName}</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>Leer articulo →</span>
        </div>
      </div>
    </div>
  )
}

function ArticlePreview({ article, authorDefaults, coverURL }: Omit<Props, 'tab'>) {
  const title = article?.title || 'Titulo del articulo'
  const excerpt = article?.excerpt || 'Resumen del articulo aqui...'
  const authorName = article?.authorName || authorDefaults.name || 'Autor'
  const authorRole = article?.authorRole || authorDefaults.role || ''
  const date = formatDate(article?.publishedAt)

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--theme-elevation-150)] bg-white shadow-[0_12px_30px_rgba(7,20,45,0.08)]">
      <div className="relative bg-[#07142d] px-6 py-10 text-white sm:px-10">
        <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-white/60">
          INSIGHT
        </span>
        {article?.featured ? (
          <span className="ml-2 inline-block rounded-full border border-[rgb(255,90,24,0.45)] px-3 py-1 text-[0.55rem] font-bold uppercase tracking-[0.12em] text-[#ff9c74]">
            SELECCION EDITORIAL
          </span>
        ) : null}
        <h1 className="mt-5 font-display text-[clamp(1.8rem,4vw,3rem)] font-semibold leading-[0.88] tracking-[-0.06em]">
          {title}
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-white/60">
          {excerpt}
        </p>
        <div className="mt-5 flex flex-wrap gap-6 border-t border-white/10 pt-4">
          <div className="grid gap-0.5">
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.09em] text-white/40">Por</span>
            <span className="text-xs font-semibold">{authorName}</span>
            {authorRole ? <span className="text-[0.6rem] text-white/40">{authorRole}</span> : null}
          </div>
          <div className="grid gap-0.5">
            <span className="text-[0.55rem] font-bold uppercase tracking-[0.09em] text-white/40">Publicado</span>
            <span className="text-xs font-semibold">{date}</span>
          </div>
        </div>
      </div>

      {coverURL ? (
        <div className="relative h-48 w-full bg-[#0b1d3d] sm:h-64">
          <Image alt="Portada preview" fill sizes="100vw" src={coverURL} />
        </div>
      ) : null}

      <div className="px-6 py-8 sm:px-10">
        {'htmlContent' in (article || {}) && (article as ArticleData).htmlContent ? (
          <div
            className="prose prose-sm max-w-none [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--txdx-orange)] [&_blockquote]:bg-[rgba(255,90,24,0.06)] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_img]:my-4 [&_img]:rounded-2xl [&_img]:max-h-[360px] [&_img]:w-full [&_img]:object-contain [&_h1]:text-3xl [&_h1]:font-extrabold [&_h1]:tracking-[-0.05em] [&_h2]:text-xl [&_h2]:font-bold [&_p]:my-2 [&_p]:leading-7 [&_ul]:pl-6 [&_ol]:pl-6"
            dangerouslySetInnerHTML={{ __html: (article as ArticleData).htmlContent! }}
          />
        ) : article?.content ? (
          <PanelRichTextPreview data={article.content} />
        ) : (
          <p className="text-sm leading-7 text-[var(--theme-elevation-500)]">
            Escribe en el editor para ver el contenido aqui.
          </p>
        )}
      </div>
    </div>
  )
}

export function PanelArticlePreview({ article, authorDefaults, coverURL, tab }: Props) {
  if (tab === 'card') {
    return <CardPreview article={article} authorDefaults={authorDefaults} coverURL={coverURL} />
  }

  return <ArticlePreview article={article} authorDefaults={authorDefaults} coverURL={coverURL} />
}
