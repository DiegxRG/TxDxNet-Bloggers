'use client'

import Image from 'next/image'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'

import type { DomainCopy } from '@/data/domains'
import type { Dictionary } from '@/lib/locale'

import styles from './domains.module.css'

export type DomainFeatureContext = {
  eyebrow: string
  focus: string[]
  intro: string
}

export function DomainFeature({
  context,
  copy,
  domainCopy,
  image,
  id,
  index,
}: {
  context: DomainFeatureContext
  copy: Dictionary
  domainCopy: DomainCopy
  image?: string
  id: string
  index: number
}) {
  const featureRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const feature = featureRef.current
    if (!feature) return

    feature.classList.add(styles.motionReady)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      feature.classList.add(styles.isVisible)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        feature.classList.add(styles.isVisible)
        observer.disconnect()
      }
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 })

    observer.observe(feature)
    return () => observer.disconnect()
  }, [])

  return (
    <article
      className={`${styles.domainFeature} ${index % 2 ? styles.domainFeatureReverse : ''}`}
      id={`dominio-${id}`}
      ref={featureRef}
      style={{ '--feature-delay': `${index * 90}ms` } as CSSProperties}
    >
      <div className={styles.domainFeatureMedia}>
        <div className={styles.domainFeatureImageFrame}>
          {image ? <Image alt={`${copy.surfaceAltPrefix} ${id}: ${domainCopy.name}`} className={styles.domainFeatureImage} fill sizes="(max-width: 760px) 100vw, 54vw" src={image} /> : null}
          <span aria-hidden="true" className={styles.domainFeatureImageShade} />
          <div className={styles.domainFeatureImageMeta}><span>{copy.domainBadge}</span></div>
          <span aria-hidden="true" className={styles.domainFeatureScanline} />
        </div>
      </div>
      <div className={styles.domainFeatureCopy}>
        <span className={styles.domainFeatureEyebrow}>{context.eyebrow}</span>
        <h3 className={styles.domainFeatureTitle}>{domainCopy.name}</h3>
        <p className={styles.domainFeatureIntro}>{context.intro}</p>
        <div className={styles.domainFeatureRule} />
        <ul className={styles.domainFeatureFocus}>{context.focus.map((item) => <li key={item}>{item}</li>)}</ul>
      </div>
    </article>
  )
}
