import Image from 'next/image'

import { getMediaAlt, getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import type { Post } from '@/payload-types'

import styles from './ArticleArtwork.module.css'

export function ArticleArtwork({ post, priority = false }: { post: Post; priority?: boolean }) {
  const imageURL = getMediaURL(post.coverImage, 'card')
  const isDomain = post.contentType === 'domain'

  return (
    <div className={`${styles.artwork} ${isDomain ? styles.domain : styles.service}`}>
      {imageURL ? (
        <Image
          alt={getMediaAlt(post.coverImage, post.title)}
          className={styles.image}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 65vw, 720px"
          src={imageURL}
        />
      ) : (
        <>
          <span aria-hidden="true" className={styles.shape} />
          <span className={styles.issue}>{isDomain ? 'Dominio XOC' : 'Servicio TxDxSecure'}</span>
          <span aria-hidden="true" className={styles.wordmark}>TxDx</span>
          <span className={styles.coverLine}>{isDomain ? 'Perspectivas de superficie' : 'Conocimiento aplicado'}</span>
        </>
      )}
    </div>
  )
}
