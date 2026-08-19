'use client'

import Image from 'next/image'

import { AuthorAvatar } from '@/components/site/AuthorAvatar'
import { PanelRichTextPreview } from './PanelRichTextPreview'
import type { Post } from '@/payload-types'

type ArticleData = {
  authorAvatar?: Post['authorAvatar']
  authorName?: string
  authorRole?: string
  content?: Post['content']
  excerpt?: string
  featured?: boolean
  publishedAt?: string
  title?: string
}

type Props = {
  article: null | ArticleData | Post
  authorDefaults: {
    avatarURL?: null | string
    name: string
    role: string
  }
  coverURL: null | string
  mediaItems: Array<{ id: string; thumbnailURL: null | string }>
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

function CardPreview({ article, authorDefaults, coverURL }: Omit<Props, 'mediaItems' | 'tab'>) {
  const title = article?.title || 'Titulo del articulo'
  const excerpt = article?.excerpt || 'Resumen del articulo aqui...'
  const authorName = article?.authorName || authorDefaults.name || 'Autor'
  const authorAvatar = article?.authorAvatar || authorDefaults.avatarURL
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
        <div className="mt-4 flex items-center gap-2 border-t border-[var(--theme-elevation-100)] pt-3 text-xs font-semibold text-[var(--theme-elevation-500)]">
          <AuthorAvatar media={authorAvatar} name={authorName} size="small" />
          <span>{authorName}</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>Leer articulo →</span>
        </div>
      </div>
    </div>
  )
}

function ArticlePreview({ article, authorDefaults, coverURL, mediaItems }: Omit<Props, 'tab'>) {
  const title = article?.title || 'Titulo del articulo'
  const excerpt = article?.excerpt || 'Resumen del articulo aqui...'
  const authorName = article?.authorName || authorDefaults.name || 'Autor'
  const authorRole = article?.authorRole || authorDefaults.role || ''
  const authorAvatar = article?.authorAvatar || authorDefaults.avatarURL
  const date = formatDate(article?.publishedAt)

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-[var(--theme-elevation-150)] bg-white shadow-[0_12px_30px_rgba(7,20,45,0.08)]">
      <header className="article-hero">
        <div className="article-hero-grid" />
        <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
          <span className="article-back-link">Vista previa privada</span>
          <div className={`article-hero-layout${coverURL ? '' : ' article-hero-layout--no-image'}`}>
            <div className="article-hero-copy">
              <div className="article-kicker">
                <span>INSIGHT</span>
                {article?.featured ? <span>SELECCIÓN EDITORIAL</span> : null}
              </div>
              <h1>{title}</h1>
              <p className="article-deck">{excerpt}</p>
            </div>
            {coverURL ? (
              <div className="article-hero-media">
                <Image alt="Portada preview" fill priority sizes="(max-width: 767px) 100vw, 48vw" src={coverURL} />
              </div>
            ) : null}
            <div className="article-byline">
              <div className="article-byline-author">
                <AuthorAvatar media={authorAvatar} name={authorName} size="large" />
                <div>
                  <span>Por</span>
                  <strong>{authorName}</strong>
                  {authorRole ? <small>{authorRole}</small> : null}
                </div>
              </div>
              <div>
                <span>Publicado</span>
                <strong>{date}</strong>
                <small>Vista previa</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="article-body-shell">
        <aside className="article-side-note">
          <span>TXDX / PREVIEW</span>
          <p>Esta vista usa el mismo renderizador de contenido que el artículo público.</p>
        </aside>
        {article?.content ? (
          <PanelRichTextPreview data={article.content} mediaItems={mediaItems} />
        ) : (
          <p className="article-prose">Escribe en el editor para ver el contenido aquí.</p>
        )}
        <aside className="article-share-note">
          <span>BORRADOR PRIVADO</span>
          <p>Guarda los cambios y publica cuando el contenido esté listo.</p>
        </aside>
      </div>
    </div>
  )
}

export function PanelArticlePreview({ article, authorDefaults, coverURL, mediaItems, tab }: Props) {
  if (tab === 'card') {
    return <CardPreview article={article} authorDefaults={authorDefaults} coverURL={coverURL} />
  }

  return <ArticlePreview article={article} authorDefaults={authorDefaults} coverURL={coverURL} mediaItems={mediaItems} />
}
