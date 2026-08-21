'use client'

import { AuthorAvatar } from './AuthorAvatar'
import type { PublicTeamMember } from '@/modules/content/infrastructure/payload/team'
import { domains } from '@/data/domains'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'

import styles from './TeamMemberCard.module.css'

export function TeamMemberCard({ index, member }: { index: number; member: PublicTeamMember }) {
  const cardRef = useRef<HTMLElement>(null)
  const expertise = new Set<string>(member.expertiseDomains || [])
  const memberDomains = domains.filter((domain) => expertise.has(domain.id)).slice(0, 3)
  const bio = member.publicBio || 'Lectura técnica y editorial para convertir señales complejas en decisiones operables.'
  const visibleBio = bio.length > 320 ? `${bio.slice(0, 317).trimEnd()}...` : bio

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return

    card.classList.add(styles.motionReady)
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !('IntersectionObserver' in window)) {
      card.classList.add(styles.isVisible)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        card.classList.add(styles.isVisible)
        observer.disconnect()
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
    )

    observer.observe(card)
    return () => observer.disconnect()
  }, [])

  return (
    <article className={styles.card} ref={cardRef} style={{ '--member-delay': `${index * 90}ms` } as CSSProperties}>
      <div className={styles.cardTopline}>
        <span>EDITORIAL / {String(index + 1).padStart(2, '0')}</span>
        <span className={styles.signal} aria-hidden="true" />
      </div>
      <div className={styles.identity}>
        <AuthorAvatar media={member.avatar} name={member.name} size="large" />
        <div>
          <h2>{member.name}</h2>
          <p>{member.publicTitle || 'Equipo editorial TxDxSecure'}</p>
        </div>
      </div>
      <p className={styles.bio}>
          {visibleBio}
      </p>
      <div className={styles.domains}>
        <span className={styles.domainsLabel}>Dominios que domina</span>
        {memberDomains.length ? (
          <div className={styles.domainList}>
            {memberDomains.map((domain, domainIndex) => (
              <span key={domain.id} style={{ '--domain-delay': `${domainIndex * 70}ms` } as CSSProperties} title={domain.name}>
                {domain.id} · {domain.shortName}
              </span>
            ))}
          </div>
        ) : (
          <span className={styles.emptyDomains}>Perfil transversal en construcción</span>
        )}
      </div>
    </article>
  )
}
