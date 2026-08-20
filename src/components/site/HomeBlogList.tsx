import Link from 'next/link'

import { plannedArticles } from '@/data/editorial'

import { BlogCard } from './BlogCard'
import styles from './HomeBlogList.module.css'

const PAGE_SIZE = 6

export function HomeBlogList() {
  const total = plannedArticles.length
  const visible = plannedArticles.slice(0, PAGE_SIZE)
  const remaining = plannedArticles.slice(PAGE_SIZE)

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

        {visible.length ? (
          <div className={styles.grid}>
            {visible.map((article, index) => (
              <BlogCard article={article} index={index} key={article.index} />
            ))}
          </div>
        ) : null}

        <div className={styles.loadMore}>
          {remaining.length ? (
            <details className={styles.more}>
              <summary className={styles.button}>
                Cargar más publicaciones
                <i aria-hidden="true">↓</i>
              </summary>
              <div className={styles.grid}>
                {remaining.map((article, index) => (
                  <BlogCard article={article} index={PAGE_SIZE + index} key={article.index} />
                ))}
              </div>
            </details>
          ) : (
            <Link className={styles.button} href="/articulos">
              Ver todos los artículos
              <i aria-hidden="true">→</i>
            </Link>
          )}
          <span className={styles.progress}>
            Mostrando {String(visible.length).padStart(2, '0')} de {String(total).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  )
}
