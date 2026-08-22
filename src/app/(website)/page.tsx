import { ClosingCTA } from '@/components/site/ClosingCTA'
import { EditorialOpening } from '@/components/site/EditorialOpening'
import { HomeBlogList } from '@/components/site/HomeBlogList'
import { getMessages, resolveLocale } from '@/lib/i18n'
import { getFeaturedPublishedPosts, getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

import styles from './home.module.css'

export const instant = false

export default async function HomePage() {
  const locale = await resolveLocale()
  const copy = getMessages(locale)

  const [latestPosts, featuredPosts] = await Promise.all([
    getPublishedPosts(6),
    getFeaturedPublishedPosts(3),
  ])

  return (
    <main className={styles.main} id="contenido">
      <EditorialOpening copy={copy} featuredPosts={featuredPosts} locale={locale} posts={latestPosts} />

      <HomeBlogList copy={copy} locale={locale} posts={latestPosts} />

      <section className={styles.closingSection}>
        <div className={styles.closingInner}>
          <div>
            <span>{copy.homeClosingEyebrow}</span>
            <h2>{copy.homeClosingTitle}</h2>
          </div>
          <ClosingCTA copy={copy} />
        </div>
      </section>
    </main>
  )
}
