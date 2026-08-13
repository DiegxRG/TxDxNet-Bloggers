import type { plannedArticles } from '@/data/editorial'

type PlannedArticle = (typeof plannedArticles)[number]

export function PlannedArticleCard({ article, index }: { article: PlannedArticle; index: number }) {
  return (
    <article className="editorial-card">
      <div className="editorial-card-top">
        <span>{article.index}</span>
        <span>EN PREPARACIÓN</span>
      </div>
      <div className={`editorial-graphic editorial-graphic-${index + 1}`}>
        <span />
      </div>
      <p className="editorial-category">{article.category}</p>
      <h3>{article.title}</h3>
      <p className="editorial-description">{article.description}</p>
    </article>
  )
}
