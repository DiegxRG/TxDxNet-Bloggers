import { AuthorAvatar } from './AuthorAvatar'
import type { PublicTeamMember } from '@/modules/content/infrastructure/payload/team'
import { domains } from '@/data/domains'
import type { CSSProperties } from 'react'

import styles from './TeamMemberCard.module.css'

export function TeamMemberCard({ index, member }: { index: number; member: PublicTeamMember }) {
  const expertise = new Set<string>(member.expertiseDomains || [])
  const memberDomains = domains.filter((domain) => expertise.has(domain.id))

  return (
    <article className={styles.card} style={{ '--member-delay': `${index * 90}ms` } as CSSProperties}>
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
        {member.publicBio || 'Lectura técnica y editorial para convertir señales complejas en decisiones operables.'}
      </p>
      <div className={styles.domains}>
        <span className={styles.domainsLabel}>Dominios que domina</span>
        {memberDomains.length ? (
          <div className={styles.domainList}>
            {memberDomains.map((domain) => (
              <span key={domain.id} title={domain.name}>{domain.id} · {domain.shortName}</span>
            ))}
          </div>
        ) : (
          <span className={styles.emptyDomains}>Perfil transversal en construcción</span>
        )}
      </div>
    </article>
  )
}
