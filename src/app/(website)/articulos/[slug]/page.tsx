import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleRichText } from '@/components/articles/ArticleRichText'
import {
  estimateReadingMinutes,
  formatArticleDate,
  getMediaAlt,
  getMediaURL,
  getPublishedPostBySlug,
  getRelatedPosts,
} from '@/modules/content/infrastructure/payload/posts'

export const revalidate = 60
export const dynamicParams = true

type ArticlePageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) return { title: 'Artículo no encontrado' }

  const socialImage = getMediaURL(post.socialImage || post.coverImage, 'hero')
  const title = post.seoTitle || post.title
  const description = post.seoDescription || post.excerpt

  return {
    title,
    description,
    alternates: { canonical: post.canonicalURL || `/articulos/${post.slug}` },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'article',
      title,
      description,
      publishedTime: post.publishedAt || post.createdAt,
      authors: [post.authorName],
      images: socialImage ? [{ url: socialImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: socialImage ? [socialImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) notFound()

  const relatedPosts = await getRelatedPosts(post)
  const heroImage = getMediaURL(post.coverImage, 'hero')

  return (
    <main id="contenido" className="bg-paper text-ink-950">
      <article>
        <header className="article-hero">
          <div className="article-hero-grid" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-12 lg:py-24">
            <Link className="article-back-link" href="/articulos">
              ← Todos los insights
            </Link>
            <div className="mt-16 max-w-6xl">
              <div className="article-kicker">
                <span>INSIGHT</span>
                {post.featured ? <span>SELECCIÓN EDITORIAL</span> : null}
              </div>
              <h1>{post.title}</h1>
              <p className="article-deck">{post.excerpt}</p>
              <div className="article-byline">
                <div>
                  <span>Por</span>
                  <strong>{post.authorName}</strong>
                  {post.authorRole ? <small>{post.authorRole}</small> : null}
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

        {heroImage ? (
          <div className="article-hero-media">
            <Image
              alt={getMediaAlt(post.coverImage, post.title)}
              fill
              priority
              sizes="100vw"
              src={heroImage}
            />
          </div>
        ) : null}

        <div className="article-body-shell">
          <aside className="article-side-note">
            <span>TXDX / INSIGHT</span>
            <p>Señales técnicas traducidas a impacto operativo y decisiones accionables.</p>
          </aside>
          <ArticleRichText data={post.content} />
          <aside className="article-share-note">
            <span>FIN DE LA SEÑAL</span>
            <p>¿Este análisis se parece a un reto de tu operación?</p>
            <a href={`mailto:info@txdxsecure.com?subject=${encodeURIComponent(`Insight: ${post.title}`)}`}>
              Conversar con TxDxSecure ↗
            </a>
          </aside>
        </div>
      </article>

      {relatedPosts.length ? (
        <section className="border-t border-ink-950/15 bg-[#f0f2f6] px-5 py-24 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[1440px]">
            <div className="flex items-end justify-between gap-8">
              <div>
                <span className="section-code">CONTINUAR / 01</span>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                  Señales relacionadas
                </h2>
              </div>
              <Link className="hidden text-xs font-extrabold uppercase md:block" href="/articulos">
                Ver biblioteca ↗
              </Link>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <ArticleCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
