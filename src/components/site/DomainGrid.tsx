'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef } from 'react'

import { domains, getDomainCopy } from '@/data/domains'
import type { Dictionary, Locale } from '@/lib/locale'

import styles from '@/app/(website)/equipo/team.module.css'

export function DomainGrid({ copy, locale }: { copy: Dictionary; locale: Locale }) {
  const gridRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const cards = Array.from(grid.querySelectorAll<HTMLElement>('[data-domain-card]'))
    cards.forEach((card) => card.classList.add(styles.motionReady))

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      cards.forEach((card) => card.classList.add(styles.isVisible))
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add(styles.isVisible)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    cards.forEach((card) => observer.observe(card))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={styles.domainGrid} ref={gridRef}>
      {domains.map((domain) => {
        const domainCopy = getDomainCopy(domain, locale)
        return (
          <article
            className={styles.domainItem}
            data-domain-card
            key={domain.id}
            style={{ '--domain-delay': `${(Number(domain.id) - 1) * 45}ms` } as React.CSSProperties}
          >
            <div className={styles.domainItemMedia}>
              {domain.image ? (
                <Image
                  alt={`${copy.surfaceAltPrefix} ${domain.id}: ${domainCopy.name}`}
                  fill
                  sizes="(max-width: 720px) 100vw, (max-width: 980px) 50vw, 30vw"
                  src={domain.image}
                />
              ) : null}
              <span aria-hidden="true" />
              <strong>{domain.id}</strong>
            </div>
            <div className={styles.domainItemCopy}>
              <span>{domainCopy.shortName}</span>
              <h3>{domainCopy.name}</h3>
              <p>{domainCopy.description}</p>
            </div>
          </article>
        )
      })}
    </div>
  )
}
