import Image from 'next/image'

import { getMediaAlt, getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import type { Post } from '@/payload-types'

export function ArticleArtwork({ post, priority = false }: { post: Post; priority?: boolean }) {
  const imageURL = getMediaURL(post.coverImage, 'card')

  return (
    <div className={`article-artwork article-artwork--${post.contentType}`}>
      {imageURL ? (
        <Image
          alt={getMediaAlt(post.coverImage, post.title)}
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 720px"
          src={imageURL}
        />
      ) : (
        <>
          <span className="article-artwork-grid" />
          <span className="article-artwork-orbit" />
          <span className="article-artwork-core">{post.contentType === 'domain' ? 'D' : 'S'}</span>
          <span className="article-artwork-signal" />
        </>
      )}
    </div>
  )
}
