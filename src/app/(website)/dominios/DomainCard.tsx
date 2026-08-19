'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { DomainIcon } from '@/components/icons/DomainIcon'
import type { DomainItem } from '@/data/domains'

import styles from './domains.module.css'

export function DomainCard({ domain, index }: { domain: DomainItem; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null)
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

  return (
    <Link
      className={`${styles.domainCard} ${inView ? styles.domainCardIn : ''}`}
      href={`/dominios#dominio-${domain.id}`}
      id={`dominio-${domain.id}`}
      ref={cardRef}
      style={{ transitionDelay: `${(index % 3) * 140}ms` }}
    >
      {domain.image ? (
        <Image alt="" className={styles.domainImage} fill sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw" src={domain.image} />
      ) : null}
      <span aria-hidden="true" className={styles.domainCardGlow} />
      <span className={styles.domainCardGrid} />
      <div className={styles.domainCardTopline}>
        <span>{domain.id}</span>
        <span className={styles.domainCardIcon}><DomainIcon domainId={domain.id} /></span>
      </div>
      <div className={styles.domainCardContent}>
        <span className={styles.domainCardTag}>{domain.shortName}</span>
        <h3>{domain.name}</h3>
        <p>{domain.description}</p>
      </div>
    </Link>
  )
}
