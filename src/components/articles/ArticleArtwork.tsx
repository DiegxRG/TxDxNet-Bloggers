import Image from 'next/image'

import { getMediaAlt, getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import type { Post } from '@/payload-types'

import styles from './ArticleArtwork.module.css'

export function ArticleArtwork({
  post,
  priority = false,
  featured = false,
}: {
  post: Post
  priority?: boolean
  featured?: boolean
}) {
  const imageURL = getMediaURL(post.coverImage, 'card')

  return (
    <div className={`${styles.artwork} ${featured ? styles.featured : ''}`}>
      {imageURL ? (
        <div className={styles.imageFrame}>
          <Image
            alt={getMediaAlt(post.coverImage, post.title)}
            className={styles.image}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 720px"
            src={imageURL}
          />
        </div>
      ) : (
        <>
          <span aria-hidden="true" className={styles.shape} />
          <span className={styles.issue}>Insight TxDxNet</span>
          <span aria-hidden="true" className={styles.wordmark}>TxDx</span>
          <span className={styles.coverLine}>Conocimiento aplicado</span>
        </>
      )}
    </div>
  )
}
