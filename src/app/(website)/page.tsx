import { ClosingCTA } from '@/components/site/ClosingCTA'
import { EditorialOpening } from '@/components/site/EditorialOpening'
import { HomeBlogList } from '@/components/site/HomeBlogList'
import { getFeaturedPublishedPosts, getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

import styles from './home.module.css'

export const revalidate = 60

export default async function HomePage() {
  const [latestPosts, featuredPosts] = await Promise.all([
    getPublishedPosts(12),
    getFeaturedPublishedPosts(3),
  ])

  return (
    <main className={styles.main} id="contenido">
      <EditorialOpening featuredPosts={featuredPosts} posts={latestPosts} />

      <HomeBlogList />

      <section className={styles.closingSection}>
        <div className={styles.closingInner}>
          <div>
            <span>Perspectiva TxDxSecure</span>
            <h2>La tecnología importa. Entender qué hacer con ella importa más.</h2>
          </div>
          <ClosingCTA />
        </div>
      </section>
    </main>
  )
}
