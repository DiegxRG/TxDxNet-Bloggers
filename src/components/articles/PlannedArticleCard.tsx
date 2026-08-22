import type { plannedArticles } from '@/data/editorial'
import type { Dictionary } from '@/lib/locale'

import styles from './PlannedArticleCard.module.css'

type PlannedArticle = (typeof plannedArticles)[number]

export function PlannedArticleCard({ article, copy, index }: { article: PlannedArticle; copy: Dictionary; index: number }) {
  return (
    <article className={styles.card}>
      <div aria-hidden="true" className={`${styles.cover} ${styles[`cover${index + 1}`]}`}>
        <span>TxDxSecure</span>
        <strong>{String(index + 1).padStart(2, '0')}</strong>
        <i>Perspectivas para una operación más clara.</i>
      </div>
      <div className={styles.copy}>
        <div className={styles.meta}>
          <span>{article.category}</span>
          <span>{copy.openingSoon}</span>
        </div>
        <h3>{article.title}</h3>
        <p>{article.description}</p>
        <footer>
          <span>{copy.byTxTeam}</span>
          <span aria-hidden="true">{copy.inPreparation}</span>
        </footer>
      </div>
    </article>
  )
}
