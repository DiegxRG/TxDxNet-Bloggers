import Link from 'next/link'

import {
  estimateReadingMinutes,
  formatArticleDate,
  getArticleLabel,
} from '@/modules/content/infrastructure/payload/posts'
import type { Post } from '@/payload-types'

import { ArticleArtwork } from './ArticleArtwork'

export function ArticleCard({
  post,
  priority = false,
  variant = 'standard',
}: {
  post: Post
  priority?: boolean
  variant?: 'featured' | 'standard'
}) {
  return (
    <article className={`article-card article-card--${variant} group`}>
      <Link aria-label={`Leer: ${post.title}`} href={`/articulos/${post.slug}`}>
        <ArticleArtwork post={post} priority={priority} />
        <div className="article-card-copy">
          <div className="article-card-meta">
            <span>{getArticleLabel(post)}</span>
            <span>{estimateReadingMinutes(post)} min</span>
          </div>
          <h3>{post.title}</h3>
          <p>{post.excerpt}</p>
          <div className="article-card-footer">
            <span>{formatArticleDate(post)}</span>
            <span aria-hidden="true">Leer ↗</span>
          </div>
        </div>
      </Link>
    </article>
  )
}
