'use client'

import { AuthorAvatar } from './AuthorAvatar'
import type { PublicTeamMember } from '@/modules/content/infrastructure/payload/team'
import { domains, getDomainCopy } from '@/data/domains'
import type { Dictionary, Locale } from '@/lib/locale'
import { useLayoutEffect, useRef, type CSSProperties } from 'react'

import styles from './TeamMemberCard.module.css'

export function TeamMemberCard({
  copy,
  index,
  locale,
  member,
}: {
  copy: Dictionary
  index: number
  locale: Locale
  member: PublicTeamMember
}) {
  const cardRef = useRef<HTMLElement>(null)
  const expertise = new Set<string>(member.expertiseDomains || [])
  const memberDomains = domains.filter((domain) => expertise.has(domain.id)).slice(0, 3)
  const bio = member.publicBio || copy.teamFallbackBio
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
        <span>{copy.teamCardBadge} / {String(index + 1).padStart(2, '0')}</span>
        <span className={styles.signal} aria-hidden="true" />
      </div>
      <div className={styles.identity}>
        <AuthorAvatar media={member.avatar} name={member.name} size="large" />
        <div>
          <h2>{member.name}</h2>
          <p>{member.publicTitle || copy.teamFallbackRole}</p>
        </div>
      </div>
      <p className={styles.bio}>
          {visibleBio}
      </p>
      <div className={styles.domains}>
        <span className={styles.domainsLabel}>{copy.teamDomainsLabel}</span>
        {memberDomains.length ? (
          <div className={styles.domainList}>
            {memberDomains.map((domain, domainIndex) => {
              const domainCopy = getDomainCopy(domain, locale)
              return (
                <span
                  key={domain.id}
                  style={{ '--domain-delay': `${domainIndex * 70}ms` } as CSSProperties}
                  title={domainCopy.name}
                >
                  {domain.id} · {domainCopy.shortName}
                </span>
              )
            })}
          </div>
        ) : (
          <span className={styles.emptyDomains}>{copy.teamTransversalEmpty}</span>
        )}
      </div>
    </article>
  )
}
