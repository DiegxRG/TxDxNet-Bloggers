import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleRichText } from '@/components/articles/ArticleRichText'
import { ResourceIcon } from '@/components/icons/ResourceIcon'
import { AuthorAvatar } from '@/components/site/AuthorAvatar'
import { ShareIcon } from '@/components/site/ShareIcon'
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
  const articleURL = new URL(`/articulos/${post.slug}`, process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com').toString()

  return (
    <main id="contenido" className="bg-paper text-ink-950">
      <article>
        <header className="article-hero">
          <div className="article-hero-grid" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
            <Link className="article-back-link" href="/articulos">
              ← Todos los insights
            </Link>
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
                  <Image
                    alt={getMediaAlt(post.coverImage, post.title)}
                    fill
                    priority
                    sizes="(max-width: 767px) 100vw, 48vw"
                    src={heroImage}
                  />
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
          <aside aria-label="Compartir artículo" className="article-share-rail">
            <span>Compartir esta señal</span>
            <div className="article-share-links">
              <a
                aria-label="Compartir en LinkedIn"
                className="article-share-link"
                data-network="linkedin"
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleURL)}`}
                rel="noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="article-share-icon"><ShareIcon network="linkedin" /></span>
                <span>LinkedIn</span>
              </a>
              <a
                aria-label="Compartir en Facebook"
                className="article-share-link"
                data-network="facebook"
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleURL)}`}
                rel="noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="article-share-icon"><ShareIcon network="facebook" /></span>
                <span>Facebook</span>
              </a>
              <a
                aria-label="Compartir en X"
                className="article-share-link"
                data-network="x"
                href={`https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleURL)}`}
                rel="noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="article-share-icon"><ShareIcon network="x" /></span>
                <span>En X</span>
              </a>
              <a
                aria-label="Compartir en WhatsApp"
                className="article-share-link"
                data-network="whatsapp"
                href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${articleURL}`)}`}
                rel="noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="article-share-icon"><ShareIcon network="whatsapp" /></span>
                <span>WhatsApp</span>
              </a>
              <a
                aria-label="Compartir por correo"
                className="article-share-link"
                data-network="email"
                href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(articleURL)}`}
              >
                <span aria-hidden="true" className="article-share-icon"><ShareIcon network="email" /></span>
                <span>Correo</span>
              </a>
              <a
                aria-label="Seguir a TxDxSecure en Instagram"
                className="article-share-link article-share-link--follow"
                data-network="instagram"
                href="https://www.instagram.com/txdxsecure/"
                rel="noreferrer"
                target="_blank"
              >
                <span aria-hidden="true" className="article-share-icon"><ShareIcon network="instagram" /></span>
                <span>Instagram</span>
              </a>
            </div>
          </aside>
          <ArticleRichText data={post.content} />
          <aside aria-label="Explorar el ecosistema TxDx" className="article-resource-panel">
            <span>ECOSISTEMA TXDX</span>
            <h2>Más allá de este insight.</h2>
            <p>Conoce las plataformas, productos y espacios donde seguimos construyendo.</p>
            <div className="article-resource-links">
              <a href="https://xoc.app/" rel="noreferrer" target="_blank">
                <span className="article-resource-logo article-resource-logo--xoc">
                  <Image alt="Logo XOC" height={64} src="/Logo_XOC_Vectorial.png" width={64} />
                </span>
                <span>PLATAFORMA</span>
                <strong>XOC App</strong>
                <small>Operación digital segura ↗</small>
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.vibecode.xocapp&hl=es_PE" rel="noreferrer" target="_blank">
                <span className="article-resource-logo article-resource-logo--store">
                  <Image alt="Disponible en Google Play" height={32} src="/Google_Play-Logo.wine.svg" width={120} />
                </span>
                <span>ANDROID</span>
                <strong>Play Store</strong>
                <small>Descargar XOC App ↗</small>
              </a>
              <a href="https://apps.apple.com/uy/app/xoc/id6759814234" rel="noreferrer" target="_blank">
                <span className="article-resource-logo article-resource-logo--store">
                  <Image alt="Disponible en App Store" height={32} src="/available-on-the-app-store.svg" width={94} />
                </span>
                <span>IOS</span>
                <strong>App Store</strong>
                <small>Descargar XOC App ↗</small>
              </a>
              <a href="https://xoc.app/xoc-policies/index.html" rel="noreferrer" target="_blank">
                <span className="article-resource-logo article-resource-logo--icon">
                  <ResourceIcon type="support" />
                </span>
                <span>RECURSOS XOC</span>
                <strong>Políticas y soporte</strong>
                <small>Información de la aplicación ↗</small>
              </a>
              <a href="https://www.txdxsecure.com/" rel="noreferrer" target="_blank">
                <span className="article-resource-logo article-resource-logo--company">
                  <Image alt="Logo TxDxSecure" height={48} src="/logotxdx.png" width={120} />
                </span>
                <span>EMPRESA</span>
                <strong>TxDxSecure</strong>
                <small>Conoce nuestro trabajo ↗</small>
              </a>
              <a href="/dominios">
                <span className="article-resource-logo article-resource-logo--icon">
                  <ResourceIcon type="domains" />
                </span>
                <span>MAPA TXDX</span>
                <strong>11 dominios XOC</strong>
                <small>Explorar capacidades ↗</small>
              </a>
            </div>
          </aside>
        </div>

        <section aria-labelledby="article-author-title" className="article-author-section">
          <div className="article-author-layout">
            <div>
              <span className="article-section-kicker">AUTORÍA / TXDXNET</span>
              <h2 id="article-author-title">La señal detrás del análisis.</h2>
              <p>
                Conoce a la persona que comparte esta perspectiva y convierte experiencia técnica en
                conocimiento aplicable.
              </p>
            </div>
            <div className="article-author-card">
              <AuthorAvatar media={post.authorAvatar} name={post.authorName} size="large" />
              <div>
                <h3>{post.authorName}</h3>
                {post.authorRole ? <p>{post.authorRole}</p> : null}
                <Link href="/articulos">Ver más insights <span aria-hidden="true">↗</span></Link>
              </div>
            </div>
          </div>
        </section>
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
