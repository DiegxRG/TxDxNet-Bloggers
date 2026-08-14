import { plannedArticles } from '@/data/editorial'
import {
  estimateReadingMinutes,
  formatArticleDate,
  getMediaAlt,
  getMediaURL,
} from '@/modules/content/infrastructure/payload/posts'
import type { Post } from '@/payload-types'

import {
  EditorialLibraryStage,
  type OpeningStory,
} from './EditorialLibraryStage'

export function EditorialOpening({ posts }: { posts: Post[] }) {
  const publishedStories: OpeningStory[] = posts.slice(0, 3).map((post) => ({
    key: `post-${post.id}`,
    author: post.authorName,
    category: 'Insight TxDxNet',
    detail: `${formatArticleDate(post)} · ${estimateReadingMinutes(post)} min`,
    href: `/articulos/${post.slug}`,
    imageAlt: getMediaAlt(post.coverImage, post.title),
    imageURL: getMediaURL(post.coverImage, 'card'),
    title: post.title,
  }))

  const plannedStories: OpeningStory[] = plannedArticles.map((article) => ({
    key: `planned-${article.index}`,
    author: 'Equipo TxDxSecure',
    category: article.category,
    detail: 'En edición',
    title: article.title,
  }))

  const stories = [...publishedStories, ...plannedStories].slice(0, 3)

  return <EditorialLibraryStage stories={stories} />
}
