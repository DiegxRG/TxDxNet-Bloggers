import type { Metadata } from 'next'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { PlannedArticleCard } from '@/components/articles/PlannedArticleCard'
import { InteriorHero } from '@/components/site/InteriorHero'
import { plannedArticles } from '@/data/editorial'
import { getMessages, interpolate, resolveLocale } from '@/lib/i18n'
import { getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

import styles from './articles.module.css'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale()
  const copy = getMessages(locale)

  return {
    title: copy.articles,
    description: copy.articlesHeroDescription,
    alternates: { canonical: '/articulos' },
  }
}

export default async function ArticlesPage() {
  const locale = await resolveLocale()
  const copy = getMessages(locale)

  const posts = await getPublishedPosts(24)
  const featuredPost = posts.find((post) => post.featured) || posts[0]
  const remainingPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : []

  return (
    <main id="contenido">
      <InteriorHero
        code={copy.articlesCode}
        description={copy.articlesHeroDescription}
        eyebrow={copy.articlesHeroEyebrow}
        title={copy.articlesHeroTitle}
      />

      <section className={styles.library}>
        <div className={styles.container}>
          <div className={styles.libraryBar}>
            <div>
              <span>{interpolate(copy.publicationsCount, { count: String(posts.length).padStart(2, '0') })}</span>
              <h2>{copy.libraryHeading}</h2>
            </div>
          </div>

          {featuredPost ? (
            <>
              <div className={styles.featured}>
                <ArticleCard copy={copy} locale={locale} post={featuredPost} priority variant="featured" />
              </div>
              {remainingPosts.length ? (
                <div className={styles.grid}>
                  {remainingPosts.map((post) => (
                    <ArticleCard copy={copy} key={post.id} locale={locale} post={post} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div>
                <span>{copy.firstEditionBadge}</span>
                <h2>{copy.firstEditionTitle}</h2>
                <p>
                  {copy.firstEditionNote}
                </p>
              </div>
              <div className={styles.emptyAside}>
                <span>{copy.upcomingReads}</span>
                {plannedArticles.map((article) => (
                  <p key={article.index}>{article.title}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {!posts.length ? (
        <section className={styles.upcoming}>
          <div className={styles.container}>
            <div className={styles.upcomingHeading}>
              <span>{copy.upcomingKicker}</span>
              <h2>
                {copy.upcomingHeading}
              </h2>
            </div>
            <div className={styles.grid}>
              {plannedArticles.map((article, index) => (
                <PlannedArticleCard article={article} copy={copy} index={index} key={article.index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
