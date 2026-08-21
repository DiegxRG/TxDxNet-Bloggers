import Link from 'next/link'
import type { Post } from '@/payload-types'

import { ArticleCard } from '@/components/articles/ArticleCard'
import styles from './HomeBlogList.module.css'

export function HomeBlogList({ posts }: { posts: Post[] }) {
  const total = posts.length

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.heading}>
          <div>
            <span className={styles.kicker}>Biblioteca TxDxSecure</span>
            <h2>Últimos análisis y guías</h2>
          </div>
          <div className={styles.headingAside}>
            <span className={styles.count}>
              {String(total).padStart(2, '0')} publicaciones
            </span>
            <Link className={styles.allLink} href="/articulos">
              Ver todos los artículos <i aria-hidden="true">→</i>
            </Link>
          </div>
        </div>

        {posts.length ? (
          <div className={styles.grid}>
            {posts.map((post, index) => (
              <ArticleCard key={post.id} post={post} priority={index < 3} />
            ))}
          </div>
        ) : <p className={styles.empty}>Todavía no hay artículos publicados.</p>}

        <div className={styles.loadMore}>
          <Link className={styles.button} href="/articulos">
            Ver todos los artículos
            <i aria-hidden="true">→</i>
          </Link>
          <span className={styles.progress}>Mostrando {String(total).padStart(2, '0')} publicados</span>
        </div>
      </div>
    </section>
  )
}
