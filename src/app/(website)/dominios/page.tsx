import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { DomainIcon } from '@/components/icons/DomainIcon'
import { domains, getDomainCopy } from '@/data/domains'
import { getMessages, resolveLocale } from '@/lib/i18n'

import { DomainFeature, type DomainFeatureContext } from './DomainFeature'
import styles from './domains.module.css'

export const instant = false

export async function generateMetadata(): Promise<Metadata> {
  const locale = await resolveLocale()
  const copy = getMessages(locale)

  return {
    title: copy.domainsPageMetaTitle,
    description: copy.domainsPageMetaDescription,
    alternates: { canonical: '/dominios' },
  }
}

const featuredDomainIDs = ['06', '07', '10', '11'] as const

function buildDomainContexts(copy: ReturnType<typeof getMessages>): Record<(typeof featuredDomainIDs)[number], DomainFeatureContext> {
  return {
    '06': {
      eyebrow: copy.context06Eyebrow,
      focus: [copy.context06Focus1, copy.context06Focus2, copy.context06Focus3],
      intro: copy.context06Intro,
    },
    '07': {
      eyebrow: copy.context07Eyebrow,
      focus: [copy.context07Focus1, copy.context07Focus2, copy.context07Focus3],
      intro: copy.context07Intro,
    },
    '10': {
      eyebrow: copy.context10Eyebrow,
      focus: [copy.context10Focus1, copy.context10Focus2, copy.context10Focus3],
      intro: copy.context10Intro,
    },
    '11': {
      eyebrow: copy.context11Eyebrow,
      focus: [copy.context11Focus1, copy.context11Focus2, copy.context11Focus3],
      intro: copy.context11Intro,
    },
  }
}

export default async function DomainsPage() {
  const locale = await resolveLocale()
  const copy = getMessages(locale)
  const domainContexts = buildDomainContexts(copy)

  const featuredDomains = featuredDomainIDs.flatMap((id) => {
    const domain = domains.find((item) => item.id === id)
    return domain ? [{ context: domainContexts[id], domain }] : []
  })

  const orbitNodes = [
    { label: copy.orbitSecurity, position: styles.heroOrbitNodeTop },
    { label: copy.orbitAvailability, position: styles.heroOrbitNodeRight },
    { label: copy.orbitExperience, position: styles.heroOrbitNodeBottom },
    { label: 'Performance', position: styles.heroOrbitNodeLeft },
  ]

  return (
    <main id="contenido">
      <section className={styles.hero}>
        <div aria-hidden="true" className={styles.heroGrid} />
        <div className={styles.container}>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>{copy.domainsHeroEyebrow}</span>
              <h1>
                {copy.domainsHeroTitlePlain}
                <em>{copy.domainsHeroTitleEmphasis}</em>
              </h1>
              <p>
                {copy.domainsHeroIntro}
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#superficies-operacionales">
                  {copy.exploreSurfaces} <span aria-hidden="true">↓</span>
                </a>
                <Link className={styles.secondaryAction} href="/articulos">
                  {copy.goToArticles} <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className={styles.heroNote}>
                <span className={styles.signalDot} />
                <span>{copy.domainsHeroNote}</span>
              </div>
            </div>

            <div className={styles.orbitStage}>
              <div aria-label={copy.orbitStageAria} className={styles.orbit} role="img">
                <div aria-hidden="true" className={`${styles.orbitRing} ${styles.orbitRingOuter}`} />
                <div aria-hidden="true" className={`${styles.orbitRing} ${styles.orbitRingMiddle}`} />
                <div aria-hidden="true" className={`${styles.orbitRing} ${styles.orbitRingInner}`} />
                <span aria-hidden="true" className={`${styles.orbitParticleTrack} ${styles.orbitParticleTrackOuter}`}><i /></span>
                <span aria-hidden="true" className={`${styles.orbitParticleTrack} ${styles.orbitParticleTrackMiddle}`}><i /></span>
                <span aria-hidden="true" className={`${styles.orbitParticleTrack} ${styles.orbitParticleTrackInner}`}><i /></span>
                <div aria-hidden="true" className={styles.orbitCrossHorizontal} />
                <div aria-hidden="true" className={styles.orbitCrossVertical} />
                <div className={styles.orbitCenter}>
                  <Image alt="" aria-hidden="true" height={168} src="/Logo_XOC_Vectorial.png" width={172} />
                  <span>{copy.xocCenterCaption}</span>
                </div>
                {orbitNodes.map((node) => (
                  <span className={`${styles.orbitNode} ${node.position}`} key={node.label}>
                    <i />
                    {node.label}
                  </span>
                ))}
              </div>
              <div className={styles.orbitReadout}>
                <span><b>11</b> {copy.readoutDomains}</span>
                <span><b>04</b> {copy.readoutSignals}</span>
                <span><b>01</b> {copy.readoutOperation}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metricsSection} aria-label={copy.metricsSectionAria}>
        <div className={styles.container}>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <DomainIcon className={styles.metricIcon} domainId="01" />
              <strong>11</strong>
              <span>{copy.metricDomainsSpan}</span>
              <small>{copy.metricDomainsSmall}</small>
            </div>
            <div className={styles.metric}>
              <DomainIcon className={styles.metricIcon} domainId="06" />
              <strong>04</strong>
              <span>{copy.metricSignalsSpan}</span>
              <small>{copy.metricSignalsSmall}</small>
            </div>
            <div className={styles.metric}>
              <DomainIcon className={styles.metricIcon} domainId="08" />
              <strong>360°</strong>
              <span>{copy.metricIntegralSpan}</span>
              <small>{copy.metricIntegralSmall}</small>
            </div>
            <div className={`${styles.metric} ${styles.metricAccent}`}>
              <DomainIcon className={styles.metricIcon} domainId="11" />
              <strong>XOC</strong>
              <span>{copy.metricFrameworkSpan}</span>
              <small>{copy.metricFrameworkSmall}</small>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.domainsSection} id="superficies-operacionales">
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
              <div>
                <span className={styles.sectionCode}>{copy.surfacesSectionCode}</span>
                <h2>{copy.surfacesHeading}</h2>
              </div>
              <div className={styles.sectionHeadingAside}>
                <span>{copy.surfacesAsideTag}</span>
                <p>{copy.surfacesAsideNote}</p>
                <i aria-hidden="true" />
              </div>
            </header>

          <div className={styles.domainFeatureList}>
            {featuredDomains.map(({ context, domain }, index) => (
              <DomainFeature
                context={context}
                copy={copy}
                domainCopy={getDomainCopy(domain, locale)}
                id={domain.id}
                image={domain.image}
                index={index}
                key={domain.id}
              />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.footerSection}>
        <div className={styles.container}>
          <div className={styles.footerPanel}>
            <div aria-hidden="true" className={styles.footerVisual}>
              <Image alt="" fill sizes="(max-width: 700px) 120vw, 58vw" src="/Designer__19_-removebg-preview.png" />
            </div>
            <span className={styles.eyebrow}>{copy.panelEyebrow}</span>
            <h2>{copy.panelTitle}</h2>
            <p>
              {copy.panelIntro}
            </p>
            <div className={styles.footerActions}>
              <Link className={styles.footerAction} href="/articulos">
                {copy.knowledgeLink} <span aria-hidden="true">↗</span>
              </Link>
              <Link className={styles.footerAction} href="/equipo#team-domains-grid">
                {copy.allDomainsLink} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
