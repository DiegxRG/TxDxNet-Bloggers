import type { plannedArticles } from '@/data/editorial'

import styles from './PlannedArticleCard.module.css'

type PlannedArticle = (typeof plannedArticles)[number]

export function PlannedArticleCard({ article, index }: { article: PlannedArticle; index: number }) {
  return (
    <article className={styles.card}>
      <div aria-hidden="true" className={`${styles.cover} ${styles[`cover${index + 1}`]}`}>
        <span>TxDxNet</span>
        <strong>{String(index + 1).padStart(2, '0')}</strong>
        <i>Perspectivas para una operación más clara.</i>
      </div>
      <div className={styles.copy}>
        <div className={styles.meta}>
          <span>{article.category}</span>
          <span>Próximamente</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <footer>
          <span>Equipo TxDxSecure</span>
          <span aria-hidden="true">En preparación</span>
        </footer>
      </div>
    </article>
  )
}
