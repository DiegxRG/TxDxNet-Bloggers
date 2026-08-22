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
import { getMessages, resolveLocale } from '@/lib/i18n'
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

export const instant = false

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

  if (!post) {
    const locale = await resolveLocale()
    return { title: getMessages(locale).articleNotFoundTitle }
  }

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

  const locale = await resolveLocale()
  const copy = getMessages(locale)

  const relatedPosts = await getRelatedPosts(post)
  const heroImage = getMediaURL(post.coverImage, 'hero')
  const articleURL = new URL(`/articulos/${post.slug}`, process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com').toString()
  const shareSteps: ArticlePipelineStep[] = [
    {
      action: 'share',
      detail: copy.stepShareDetail,
      icon: <IconShareNodes />,
      label: copy.stepShareLabel,
      tone: 'native',
      track: copy.trackAmplify,
    },
    {
      action: 'copy',
      detail: copy.stepCopyDetail,
      icon: <IconLink />,
      label: copy.stepCopyLabel,
      tone: 'copy',
      track: copy.trackLink,
    },
    {
      detail: copy.stepLinkedinDetail,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="linkedin" />,
      label: 'LinkedIn',
      tone: 'linkedin',
      track: copy.trackAmplify,
    },
    {
      detail: copy.stepFacebookDetail,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="facebook" />,
      label: 'Facebook',
      tone: 'facebook',
      track: copy.trackConnect,
    },
    {
      detail: copy.stepXDetail,
      href: `https://x.com/intent/post?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="x" />,
      label: copy.labelOnX,
      tone: 'x',
      track: copy.trackSignal,
    },
    {
      detail: copy.stepWhatsappDetail,
      href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${articleURL}`)}`,
      icon: <ShareIcon network="whatsapp" />,
      label: 'WhatsApp',
      tone: 'whatsapp',
      track: copy.trackConnect,
    },
    {
      detail: copy.stepEmailDetail,
      href: `mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(articleURL)}`,
      icon: <ShareIcon network="email" />,
      label: copy.labelEmail,
      tone: 'email',
      track: copy.trackSend,
    },
    {
      detail: copy.stepInstagramDetail,
      href: 'https://www.instagram.com/txdxsecure/',
      icon: <ShareIcon network="instagram" />,
      label: 'Instagram',
      tone: 'instagram',
      track: copy.trackFollow,
    },
  ]
  const ecosystemSteps: ArticlePipelineStep[] = [
    {
      detail: copy.stepXocAppDetail,
      href: 'https://xoc.app/',
      icon: <Image alt="" height={40} src="/Logo_XOC_Vectorial.png" width={40} />,
      label: 'XOC App',
      track: copy.trackPlatform,
    },
    {
      detail: copy.stepPlayStoreDetail,
      href: 'https://play.google.com/store/apps/details?id=com.vibecode.xocapp&hl=es_PE',
      icon: <Image alt="" height={40} src="/Google_Play_2022_icon.svg.webp" width={40} />,
      label: 'Play Store',
      track: copy.trackAndroid,
    },
    {
      detail: copy.stepAppStoreDetail,
      href: 'https://apps.apple.com/uy/app/xoc/id6759814234',
      icon: <Image alt="" height={40} src="/App_Store_(iOS).svg.webp" width={40} />,
      label: 'App Store',
      track: copy.trackIos,
    },
    {
      detail: copy.stepPoliciesDetail,
      href: 'https://xoc.app/xoc-policies/index.html',
      icon: <ResourceIcon type="support" />,
      label: copy.labelPolicies,
      track: copy.trackXocResources,
    },
    {
      detail: copy.stepCompanyDetail,
      href: 'https://www.txdxsecure.com/',
      icon: <Image alt="" height={40} src="/logotxdx.png" width={70} />,
      label: 'TxDxSecure',
      track: copy.trackCompany,
    },
    {
      detail: copy.stepCapabilitiesDetail,
      href: '/dominios',
      icon: <ResourceIcon type="domains" />,
      label: copy.xocDomainCount,
      track: copy.trackTxMap,
    },
  ]

  return (
    <main id="contenido" className="bg-paper text-ink-950">
      <article>
        <header className="article-hero">
          <div className="article-hero-grid" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
            <Link className="article-back-link" href="/articulos">
              {copy.backToInsights}
            </Link>
            <div className={`article-hero-layout${heroImage ? '' : ' article-hero-layout--no-image'}`}>
              <div className="article-hero-copy">
                <div className="article-kicker">
                  <span>{copy.kickerInsight}</span>
                  {post.featured ? <span>{copy.kickerFeatured}</span> : null}
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
                    <span>{copy.byPrefix}</span>
                    <strong>{post.authorName}</strong>
                    {post.authorRole ? <small>{post.authorRole}</small> : null}
                  </div>
                </div>
                <div>
                  <span>{copy.publishedLabel}</span>
                  <strong>{formatArticleDate(post, locale)}</strong>
                  <small>{estimateReadingMinutes(post)} {copy.minRead}</small>
                </div>
                <a className="article-pdf-link" download href={`/api/articulos/${post.slug}/pdf`}>
                  {copy.downloadPdf} <span aria-hidden="true">↓</span>
                </a>
              </div>
            </div>
          </div>
        </header>

        <div className="article-body-shell">
          <ArticlePipeline
            copiedMessage={copy.linkCopiedMessage}
            copyManuallyMessage={copy.copyManuallyMessage}
            description={copy.sharePipelineDescription}
            eyebrow={copy.sharePipelineEyebrow}
            result={copy.sharePipelineResult}
            resultLabel={copy.sharePipelineResultLabel}
            sharedMessage={copy.sharedMessage}
            shareText={post.excerpt ? `${post.title} — ${post.excerpt}` : post.title}
            shareURL={articleURL}
            steps={shareSteps}
            title={copy.sharePipelineTitle}
            variant="share"
          />
          <ArticleRichText data={post.content} />
          <ArticlePipeline
            copiedMessage={copy.linkCopiedMessage}
            copyManuallyMessage={copy.copyManuallyMessage}
            description={copy.ecosystemPipelineDescription}
            eyebrow={copy.ecosystemPipelineEyebrow}
            result={copy.ecosystemPipelineResult}
            resultLabel={copy.ecosystemPipelineResultLabel}
            sharedMessage={copy.sharedMessage}
            steps={ecosystemSteps}
            title={copy.ecosystemPipelineTitle}
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
              <span className="article-section-kicker">{copy.authorSectionKicker}</span>
              <h2 id="article-author-title">{copy.authorSectionTitle}</h2>
              <p>
                {copy.authorSectionIntro}
              </p>
            </div>
            <div className="article-author-cards">
              <div className="article-author-card">
                <div aria-hidden="true" className="article-author-outline" />
                <AuthorAvatar media={post.authorAvatar} name={post.authorName} size="large" />
                <div>
                  <span className="article-card-kicker">{copy.insightAuthorKicker}</span>
                  <h3>{post.authorName}</h3>
                  {post.authorRole ? <p>{post.authorRole}</p> : null}
                  <Link href="/articulos">{copy.moreInsights} <span aria-hidden="true">↗</span></Link>
                </div>
              </div>
              <div className="article-company-card">
                <div aria-hidden="true" className="article-company-mark">
                  <Image alt="" fill sizes="72px" src="/logotxdx.png" />
                </div>
                <div>
                  <span className="article-card-kicker">{copy.sealKicker}</span>
                  <h3>TxDxSecure</h3>
                  <p>{copy.sealNote}</p>
                  <small>{copy.rightsReserved}</small>
                  <a href="https://txdxsecure.com/" rel="noreferrer" target="_blank">
                    {copy.knowTheCompany} <span aria-hidden="true">↗</span>
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
                <span className="section-code">{copy.relatedSignalsCode}</span>
                <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                  {copy.relatedSignalsTitle}
                </h2>
              </div>
              <Link className="hidden text-xs font-extrabold uppercase md:block" href="/articulos">
                {copy.viewLibrary} ↗
              </Link>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <ArticleCard copy={copy} key={relatedPost.id} locale={locale} post={relatedPost} />
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
