import type { Metadata } from 'next'
import Image from 'next/image'

import { DomainGrid } from '@/components/site/DomainGrid'
import { TeamMemberCard } from '@/components/site/TeamMemberCard'
import { getMessages, interpolate, resolveLocale } from '@/lib/i18n'
import { getPublicTeamMembers } from '@/modules/content/infrastructure/payload/team'

import styles from './team.module.css'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale()
  const copy = getMessages(locale)

  return {
    title: copy.team,
    description: copy.teamHeroLead,
    alternates: { canonical: '/equipo' },
  }
}

export default async function TeamPage() {
  const locale = await resolveLocale()
  const copy = getMessages(locale)
  const members = await getPublicTeamMembers()

  return (
    <main className={styles.main} id="contenido">
      <section className={styles.hero}>
        <div aria-hidden="true" className={styles.heroGrid} />
        <div className={styles.container}>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>{copy.teamEyebrow}</span>
              <h1>{copy.teamHeroTitle}</h1>
              <p>
                {copy.teamHeroLead}
              </p>
              <div className={styles.heroMeta}>
                <span>{interpolate(copy.profilesCount, { count: members.length })}</span>
                <span>{copy.xocDomainCount}</span>
              </div>
            </div>

            <figure className={styles.heroVisual}>
              <div className={styles.heroVisualFrame}>
                <Image
                  alt={copy.teamVisualAlt}
                  className={styles.heroVisualImage}
                  fill
                  priority
                  sizes="(max-width: 980px) 100vw, 46vw"
                  src="/equipotxdxsecure.png"
                />
                <span aria-hidden="true" className={styles.heroVisualShade} />
                <span className={styles.heroVisualLabel}>{copy.teamVisualLabel}</span>
                <figcaption>{copy.teamFigcaption}</figcaption>
              </div>
            </figure>
          </div>
        </div>
      </section>

      <section className={styles.teamSection} aria-labelledby="equipo-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionCode}>{copy.whoPublishes}</span>
              <h2 id="equipo-heading">{copy.teamSurfacesTitle}</h2>
            </div>
            <p>{copy.teamSurfacesNote}</p>
          </div>

          {members.length ? (
            <div className={styles.teamGrid}>
              {members.map((member, index) => (
                <TeamMemberCard copy={copy} index={index} key={member.id} locale={locale} member={member} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>{copy.teamEmptyBadge}</span>
              <h3>{copy.teamEmptyTitle}</h3>
              <p>{copy.teamEmptyNote}</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.domainsSection} aria-labelledby="team-domains-heading">
        <div className={styles.container}>
          <div className={styles.domainsIntro}>
            <div>
              <span className={styles.sectionCode}>{copy.specialtyMap}</span>
              <h2 id="team-domains-heading">{copy.elevenDomainsTitle}</h2>
            </div>
            <div className={styles.domainsIntroAside}>
              <p>{copy.elevenDomainsAside}</p>
              <a className={styles.domainsJump} href="#team-domains-grid">{copy.viewAllDomains} <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className={styles.domainMatrix} id="team-domains-grid">
            <div className={styles.domainMatrixHead}>
              <div>
                <span>{copy.domainMatrixTag}</span>
                <h3>{copy.domainMatrixTitle}</h3>
              </div>
              <p>{copy.domainMatrixIntro}</p>
            </div>
            <DomainGrid copy={copy} locale={locale} />
          </div>
        </div>
      </section>
    </main>
  )
}
