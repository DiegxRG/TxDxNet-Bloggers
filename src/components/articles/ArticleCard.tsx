import Link from 'next/link'

import { AuthorAvatar } from '@/components/site/AuthorAvatar'
import {
  estimateReadingMinutes,
  formatArticleDate,
} from '@/modules/content/infrastructure/payload/posts'
import type { Dictionary, Locale } from '@/lib/locale'
import type { Post } from '@/payload-types'

import { ArticleArtwork } from './ArticleArtwork'
import styles from './ArticleCard.module.css'

export function ArticleCard({
  copy,
  locale,
  post,
  priority = false,
  variant = 'standard',
}: {
  copy: Dictionary
  locale: Locale
  post: Post
  priority?: boolean
  variant?: 'featured' | 'standard'
}) {
  return (
    <article className={`${styles.card} ${variant === 'featured' ? styles.featured : ''}`}>
      <Link aria-label={`${copy.readAriaPrefix} ${post.title}`} className={styles.link} href={`/articulos/${post.slug}`}>
        <ArticleArtwork featured={variant === 'featured'} post={post} priority={priority} />
        <div className={styles.copy}>
          <div className={styles.meta}>
            <span>{copy.insightCategory}</span>
            <span>{estimateReadingMinutes(post)} {copy.minRead}</span>
          </div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <div className={styles.footer}>
            <span className={styles.author}>
              <AuthorAvatar media={post.authorAvatar} name={post.authorName} size="small" />
              <span>
              {post.authorName} · {formatArticleDate(post, locale)}
              </span>
            </span>
            <span aria-hidden="true">{copy.readArticle} →</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
