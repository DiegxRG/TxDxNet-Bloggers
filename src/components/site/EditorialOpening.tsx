import {
  estimateReadingMinutes,
  formatArticleDate,
  getMediaAlt,
  getMediaURL,
} from '@/modules/content/infrastructure/payload/posts'
import type { Dictionary, Locale } from '@/lib/locale'
import type { Post } from '@/payload-types'

import {
  EditorialLibraryStage,
  type OpeningStory,
} from './EditorialLibraryStage'

type Props = {
  copy: Dictionary
  featuredPosts?: Post[]
  locale: Locale
  posts: Post[]
}

export function EditorialOpening({ copy, featuredPosts = [], locale, posts }: Props) {
  const favoritePosts = featuredPosts.length ? featuredPosts : posts.filter((post) => post.featured).slice(0, 3)
  const favoriteIDs = new Set(favoritePosts.map((post) => String(post.id)))
  const selectedPosts = [
    ...favoritePosts,
    ...posts.filter((post) => !favoriteIDs.has(String(post.id))),
  ].slice(0, 3)

  const publishedStories: OpeningStory[] = selectedPosts.map((post) => ({
    key: `post-${post.id}`,
    author: post.authorName,
    category: copy.insightCategory,
    detail: `${formatArticleDate(post, locale)} · ${estimateReadingMinutes(post)} ${copy.minRead}`,
    href: `/articulos/${post.slug}`,
    imageAlt: getMediaAlt(post.coverImage, post.title),
    imageURL: getMediaURL(post.coverImage, 'card'),
    title: post.title,
  }))

  return <EditorialLibraryStage copy={copy} stories={publishedStories} />
}
