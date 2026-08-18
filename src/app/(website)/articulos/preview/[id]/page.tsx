import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleRichText } from '@/components/articles/ArticleRichText'
import { AuthorAvatar } from '@/components/site/AuthorAvatar'
import { getMediaURL } from '@/modules/content/domain/media-url'
import { estimateReadingMinutes, formatArticleDate } from '@/modules/content/infrastructure/payload/posts'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Media, Post } from '@/payload-types'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ id: string }> }

function mediaAlt(media: Media | string | null | undefined, fallback: string) {
  return media && typeof media === 'object' ? media.alt || fallback : fallback
}

export default async function ArticlePreviewPage({ params }: Props) {
  const { payload, user } = await getPanelSession()
  const { id } = await params

  let post: Post
  try {
    post = (await payload.findByID({
      collection: 'posts',
      depth: 2,
      id,
      overrideAccess: false,
      user,
    })) as Post
  } catch {
    notFound()
  }

  const heroImage = getMediaURL(post.coverImage, 'hero')

  return (
    <main id="contenido" className="bg-paper text-ink-950">
      <article>
        <header className="article-hero">
          <div className="article-hero-grid" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <div className="mb-8 flex flex-wrap items-center gap-3">
              <Link className="article-back-link" href="/panel/articulos">
                ← Volver al panel
              </Link>
              <span className="rounded-full border border-[rgba(255,156,116,0.5)] px-3 py-1 text-[0.6rem] font-extrabold uppercase tracking-[0.12em] text-[#ffb596]">
                Vista previa privada
              </span>
            </div>
            <div className={`article-hero-layout${heroImage ? '' : ' article-hero-layout--no-image'}`}>
              <div className="article-hero-copy">
                <div className="article-kicker">
                  <span>INSIGHT</span>
                  {post.featured ? <span>SELECCIÓN EDITORIAL</span> : null}
                </div>
                <h1>{post.title}</h1>
                <p className="article-deck">{post.excerpt}</p>
              </div>
              {heroImage ? (
                <div className="article-hero-media">
                  <Image alt={mediaAlt(post.coverImage, post.title)} fill priority sizes="(max-width: 767px) 100vw, 48vw" src={heroImage} />
                </div>
              ) : null}
              <div className="article-byline">
                <div className="article-byline-author">
                  <AuthorAvatar media={post.authorAvatar} name={post.authorName} size="large" />
                  <div>
                    <span>Por</span>
                    <strong>{post.authorName}</strong>
                    {post.authorRole ? <small>{post.authorRole}</small> : null}
                  </div>
                </div>
                <div>
                  <span>Publicado</span>
                  <strong>{formatArticleDate(post)}</strong>
                  <small>{estimateReadingMinutes(post)} min de lectura</small>
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
          <ArticleRichText data={post.content} />
          <aside className="article-share-note">
            <span>BORRADOR PRIVADO</span>
            <p>Guarda los cambios y publica cuando el contenido esté listo.</p>
          </aside>
        </div>
      </article>
    </main>
  )
}
