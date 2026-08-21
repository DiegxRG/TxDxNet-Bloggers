import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { ArticleRichText } from '@/components/articles/ArticleRichText'
import { ArticlePipeline, type ArticlePipelineStep } from '@/components/site/ArticlePipeline'
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

type ArticlePageProps = {
  params: Promise<{ slug: string }>
}

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com'
const FALLBACK_SOCIAL_IMAGE = '/logotxdx.png'

function buildSocialImage(post: Awaited<ReturnType<typeof getPublishedPostBySlug>>) {
  const media = post?.socialImage || post?.coverImage
  const relativeImage = getMediaURL(media, 'hero')
  const heroSize = media && typeof media === 'object' ? media.sizes?.hero : undefined

  return {
    url: new URL(relativeImage || FALLBACK_SOCIAL_IMAGE, siteURL).toString(),
    ...(heroSize?.width && heroSize?.height ? { width: heroSize.width, height: heroSize.height } : {}),
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) return { title: 'Artículo no encontrado' }

  const socialImage = buildSocialImage(post)
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
      images: [{ ...socialImage, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [socialImage.url],
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
  const shareSteps: ArticlePipelineStep[] = [
    {
      action: 'share',
      detail: 'Compartir con tu red en un toque.',
      icon: <IconShareNodes />,
      label: 'Compartir',
      tone: 'native',
      track: 'AMPLIFICAR',
    },
    {
      action: 'copy',
      detail: 'Lleva este análisis a cualquier lado.',
      icon: <IconLink />,
      label: 'Copiar enlace',
      tone: 'copy',
      track: 'ENLAZAR',
    },
    {
      detail: 'Amplificar este análisis.',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="linkedin" />,
      label: 'LinkedIn',
      tone: 'linkedin',
      track: 'AMPLIFICAR',
    },
    {
      detail: 'Llevar la señal a tu red.',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="facebook" />,
      label: 'Facebook',
      tone: 'facebook',
      track: 'COMPARTIR',
    },
    {
      detail: 'Publicar una perspectiva.',
      href: `https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="x" />,
      label: 'En X',
      tone: 'x',
      track: 'SEÑALAR',
    },
    {
      detail: 'Enviar por WhatsApp.',
      href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${articleURL}`)}`,
      icon: <ShareIcon network="whatsapp" />,
      label: 'WhatsApp',
      tone: 'whatsapp',
      track: 'CONECTAR',
    },
    {
      detail: 'Compartir directamente.',
      href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="email" />,
      label: 'Correo',
      tone: 'email',
      track: 'ENVIAR',
    },
    {
      detail: 'Seguir la señal TxDxSecure.',
      href: 'https://www.instagram.com/txdxsecure/',
      icon: <ShareIcon network="instagram" />,
      label: 'Instagram',
      tone: 'instagram',
      track: 'SEGUIR',
    },
  ]
  const ecosystemSteps: ArticlePipelineStep[] = [
    {
      detail: 'Operación digital segura.',
      href: 'https://xoc.app/',
      icon: <Image alt="" height={40} src="/Logo_XOC_Vectorial.png" width={40} />,
      label: 'XOC App',
      track: 'PLATAFORMA',
    },
    {
      detail: 'Descargar XOC App.',
      href: 'https://play.google.com/store/apps/details?id=com.vibecode.xocapp&hl=es_PE',
      icon: <Image alt="" height={40} src="/Google_Play_2022_icon.svg.webp" width={40} />,
      label: 'Play Store',
      track: 'ANDROID',
    },
    {
      detail: 'Descargar XOC App.',
      href: 'https://apps.apple.com/uy/app/xoc/id6759814234',
      icon: <Image alt="" height={40} src="/App_Store_(iOS).svg.webp" width={40} />,
      label: 'App Store',
      track: 'IOS',
    },
    {
      detail: 'Información de la aplicación.',
      href: 'https://xoc.app/xoc-policies/index.html',
      icon: <ResourceIcon type="support" />,
      label: 'Políticas y soporte',
      track: 'RECURSOS XOC',
    },
    {
      detail: 'Conoce nuestro trabajo.',
      href: 'https://www.txdxsecure.com/',
      icon: <Image alt="" height={40} src="/logotxdx.png" width={70} />,
      label: 'TxDxSecure',
      track: 'EMPRESA',
    },
    {
      detail: 'Explorar capacidades.',
      href: '/dominios',
      icon: <ResourceIcon type="domains" />,
      label: '11 dominios XOC',
      track: 'MAPA TXDX',
    },
  ]

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
          <ArticlePipeline
            description="Pasa la señal a tu red para que una buena perspectiva no termine en una sola pantalla."
            eyebrow="Compartir esta señal"
            result="Señal distribuida"
            resultLabel="CONOCIMIENTO EN MOVIMIENTO"
            shareText={post.excerpt ? `${post.title} — ${post.excerpt}` : post.title}
            shareURL={articleURL}
            steps={shareSteps}
            title="Amplifica el insight."
            variant="share"
          />
          <ArticleRichText data={post.content} />
          <ArticlePipeline
            description="Explora las plataformas, productos y capacidades que forman el ecosistema TxDx."
            eyebrow="Ecosistema TxDx"
            result="Operación conectada"
            resultLabel="ECOSISTEMA TXDX EN MARCHA"
            steps={ecosystemSteps}
            title="Más allá de este insight."
            variant="ecosystem"
          />
        </div>

        <section aria-labelledby="article-author-title" className="article-author-section">
          <div aria-hidden="true" className="article-author-signal" />
          <div aria-hidden="true" className="article-author-floaters">
            <span className="article-author-floater article-author-floater--one">READ / 01</span>
            <span className="article-author-floater article-author-floater--two">FIELD NOTE / 02</span>
            <span className="article-author-floater article-author-floater--three">INSIGHT / TXDX</span>
          </div>
          <div className="article-author-layout">
            <div>
              <span className="article-section-kicker">AUTORÍA / TXDXSECURE</span>
              <h2 id="article-author-title">La señal detrás del análisis.</h2>
              <p>
                Conoce a la persona que comparte esta perspectiva y al sello que convierte experiencia
                técnica en conocimiento aplicable.
              </p>
            </div>
            <div className="article-author-cards">
              <div className="article-author-card">
                <div aria-hidden="true" className="article-author-outline" />
                <AuthorAvatar media={post.authorAvatar} name={post.authorName} size="large" />
                <div>
                  <span className="article-card-kicker">AUTOR DEL INSIGHT</span>
                  <h3>{post.authorName}</h3>
                  {post.authorRole ? <p>{post.authorRole}</p> : null}
                  <Link href="/articulos">Ver más insights <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
              <div className="article-company-card">
                <div aria-hidden="true" className="article-company-mark">
                  <Image alt="" fill sizes="72px" src="/logotxdx.png" />
                </div>
                <div>
                  <span className="article-card-kicker">SELLO EDITORIAL</span>
                  <h3>TxDxSecure</h3>
                  <p>El conocimiento publicado aquí forma parte de la voz y experiencia de la empresa.</p>
                  <small>© TxDxSecure · Derechos reservados</small>
                  <a href="https://txdxsecure.com/" rel="noreferrer" target="_blank">
                    Conocer la empresa <span aria-hidden="true">↗</span>
                  </a>
                </div>
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

function IconLink() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function IconShareNodes() {
  return (
    <svg aria-hidden="true" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </svg>
  )
}
