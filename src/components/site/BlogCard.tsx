'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import type { plannedArticles } from '@/data/editorial'

import styles from './BlogCard.module.css'

type PlannedArticle = (typeof plannedArticles)[number]

export function BlogCard({
  article,
  index,
}: {
  article: PlannedArticle
  index: number
}) {
  const cardRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const card = cardRef.current

    if (!card) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  const theme = article.theme ?? ((index % 4) + 1)

  return (
    <article
      className={`${styles.card} ${inView ? styles.in : ''}`}
      ref={cardRef}
      style={{ transitionDelay: `${(index % 6) * 90}ms` }}
    >
      <Link className={styles.link} href="/articulos">
        <div aria-hidden="true" className={`${styles.cover} ${styles[`theme${theme}`]}`}>
          <span className={styles.coverGrid} />
          <span className={styles.coverWordmark}>TxDx</span>
          <span className={styles.coverIndex}>{article.index}</span>
          <span className={styles.coverRing} />
          <span className={styles.coverBar} />
        </div>
        <div className={styles.copy}>
          <div className={styles.meta}>
            <span>{article.category}</span>
            <span>{article.minutes} min de lectura</span>
          </div>
          <h3>{article.title}</h3>
          <p>{article.description}</p>
          <div className={styles.footer}>
            <span>
              {article.author} · {article.date}
            </span>
            <span className={styles.read}>
              Leer artículo <i aria-hidden="true">→</i>
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
