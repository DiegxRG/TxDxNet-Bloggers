'use client'

import Link from 'next/link'
import { useLayoutEffect, useRef } from 'react'

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

  useLayoutEffect(() => {
    const card = cardRef.current

    if (!card) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const revealClass = styles.motionReady
    const visibleClass = styles.in

    card.classList.add(revealClass)

    if (reduceMotion || !('IntersectionObserver' in window)) {
      card.classList.add(visibleClass)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          card.classList.add(visibleClass)
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
      className={styles.card}
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
