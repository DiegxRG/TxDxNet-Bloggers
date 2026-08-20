import type { Metadata } from 'next'
import Link from 'next/link'

import { TeamMemberCard } from '@/components/site/TeamMemberCard'
import { domains } from '@/data/domains'
import { getPublicTeamMembers } from '@/modules/content/infrastructure/payload/team'

import styles from './team.module.css'

export const metadata: Metadata = {
  title: 'Equipo',
  description: 'Conoce al equipo editorial de TxDxSecure y las superficies operacionales que domina.',
  alternates: { canonical: '/equipo' },
}

export default async function TeamPage() {
  const members = await getPublicTeamMembers()

  return (
    <main className={styles.main} id="contenido">
      <section className={styles.hero}>
        <div aria-hidden="true" className={styles.heroGrid} />
        <div className={styles.container}>
          <span className={styles.eyebrow}>Equipo editorial · TxDxSecure</span>
          <h1>Las personas detrás de la lectura.</h1>
          <p>
            Perfiles que convierten experiencia en contexto, contexto en criterio y criterio en artículos para operar mejor.
          </p>
          <div className={styles.heroMeta}>
            <span>{String(members.length).padStart(2, '0')} perfiles públicos</span>
            <span>11 dominios XOC</span>
          </div>
        </div>
      </section>

      <section className={styles.teamSection} aria-labelledby="equipo-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionCode}>Quién publica</span>
              <h2 id="equipo-heading">Un equipo con superficies distintas.</h2>
            </div>
            <p>Los perfiles se gestionan desde el panel editorial. Cada persona decide qué información y dominios quiere mostrar públicamente.</p>
          </div>

          {members.length ? (
            <div className={styles.teamGrid}>
              {members.map((member, index) => <TeamMemberCard index={index} key={member.id} member={member} />)}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span>Equipo editorial en configuración</span>
              <h3>Pronto conocerás a las personas detrás de cada publicación.</h3>
              <p>Los administradores pueden completar su perfil y activar su presencia pública desde `/panel/perfil`.</p>
            </div>
          )}
        </div>
      </section>

      <section className={styles.domainsSection} aria-labelledby="team-domains-heading">
        <div className={styles.container}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionCode}>Mapa de especialidad</span>
              <h2 id="team-domains-heading">Once dominios. Una conversación completa.</h2>
            </div>
            <p>La experiencia del equipo se conecta con las once superficies que XOC observa, protege y ayuda a mejorar.</p>
          </div>
          <div className={styles.domainGrid}>
            {domains.map((domain) => (
              <div className={styles.domainItem} key={domain.id}>
                <span>{domain.id}</span>
                <div>
                  <h3>{domain.name}</h3>
                  <p>{domain.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Link className={styles.domainCta} href="/dominios">
            Explorar los cuatro dominios destacados <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
    </main>
  )
}
