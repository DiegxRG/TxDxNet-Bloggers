import Link from 'next/link'
import type { Post } from '@/payload-types'

import { ArticleCard } from '@/components/articles/ArticleCard'
import type { Dictionary, Locale } from '@/lib/locale'
import { interpolate } from '@/lib/locale'
import styles from './HomeBlogList.module.css'

export function HomeBlogList({ copy, locale, posts }: { copy: Dictionary; locale: Locale; posts: Post[] }) {
  const total = posts.length

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.kicker}>{copy.homeKicker}</span>
            <h2>{copy.homeHeading}</h2>
          </div>
          <div className={styles.headingAside}>
            <span className={styles.count}>
              {interpolate(copy.publicationsCount, { count: String(total).padStart(2, '0') })}
            </span>
            <Link className={styles.allLink} href="/articulos">
              {copy.viewAllArticles} <i aria-hidden="true">→</i>
            </Link>
          </div>
        </div>

        {posts.length ? (
          <div className={styles.grid}>
            {posts.map((post, index) => (
              <ArticleCard copy={copy} key={post.id} locale={locale} post={post} priority={index < 3} />
            ))}
          </div>
        ) : <p className={styles.empty}>{copy.noArticlesYet}</p>}

        <div className={styles.loadMore}>
          <Link className={styles.button} href="/articulos">
            {copy.viewAllArticles}
            <i aria-hidden="true">→</i>
          </Link>
          <span className={styles.progress}>{interpolate(copy.showingCount, { count: String(total).padStart(2, '0') })}</span>
        </div>
      </div>
    </section>
  )
}
