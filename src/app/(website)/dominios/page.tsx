import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { DomainIcon } from '@/components/icons/DomainIcon'
import { domains } from '@/data/domains'

import { DomainCard } from './DomainCard'
import styles from './domains.module.css'

export const metadata: Metadata = {
  title: 'Los 11 dominios XOC',
  description:
    'Explora las once superficies empresariales protegidas y monitoreadas por el modelo XOC de TxDxSecure.',
  alternates: { canonical: '/dominios' },
}

const orbitNodes = [
  { label: 'Seguridad', position: styles.heroOrbitNodeTop },
  { label: 'Disponibilidad', position: styles.heroOrbitNodeRight },
  { label: 'Experiencia', position: styles.heroOrbitNodeBottom },
  { label: 'Performance', position: styles.heroOrbitNodeLeft },
]

export default function DomainsPage() {
  return (
    <main id="contenido">
      <section className={styles.hero}>
        <div aria-hidden="true" className={styles.heroGrid} />
        <div className={styles.container}>
          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Biblioteca XOC · 11 dominios</span>
              <h1>
                Explora la operación digital <em>desde once perspectivas.</em>
              </h1>
              <p>
                Cada dominio representa una superficie operacional. Juntos permiten entender la experiencia completa:
                usuarios, aplicaciones, infraestructura, riesgo, observabilidad, datos, resiliencia y seguridad.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#superficies-operacionales">
                  Explorar superficies <span aria-hidden="true">↓</span>
                </a>
                <Link className={styles.secondaryAction} href="/articulos">
                  Ir a artículos <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className={styles.heroNote}>
                <span className={styles.signalDot} />
                <span>Un mapa para leer la operación con más claridad.</span>
              </div>
            </div>

            <div className={styles.orbitStage}>
              <div aria-label="Núcleo XOC con cuatro señales operacionales" className={styles.orbit} role="img">
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
                  <span>Experience Operation Center</span>
                </div>
                {orbitNodes.map((node) => (
                  <span className={`${styles.orbitNode} ${node.position}`} key={node.label}>
                    <i />
                    {node.label}
                  </span>
                ))}
              </div>
              <div className={styles.orbitReadout}>
                <span><b>11</b> dominios</span>
                <span><b>04</b> señales</span>
                <span><b>01</b> operación</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.metricsSection} aria-label="Resumen del modelo XOC">
        <div className={styles.container}>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <DomainIcon className={styles.metricIcon} domainId="01" />
              <strong>11</strong>
              <span>Dominios XOC</span>
              <small>Superficies que se conectan.</small>
            </div>
            <div className={styles.metric}>
              <DomainIcon className={styles.metricIcon} domainId="06" />
              <strong>04</strong>
              <span>Señales operacionales</span>
              <small>Seguridad, disponibilidad, experiencia y performance.</small>
            </div>
            <div className={styles.metric}>
              <DomainIcon className={styles.metricIcon} domainId="08" />
              <strong>360°</strong>
              <span>Lectura integral</span>
              <small>Contexto antes que silos aislados.</small>
            </div>
            <div className={`${styles.metric} ${styles.metricAccent}`}>
              <DomainIcon className={styles.metricIcon} domainId="11" />
              <strong>XOC</strong>
              <span>Marco operacional</span>
              <small>Una forma de ordenar la conversación.</small>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.domainsSection} id="superficies-operacionales">
        <div className={styles.container}>
          <header className={styles.sectionHeading}>
            <div>
              <span className={styles.sectionCode}>Superficies operacionales</span>
              <h2>Once puntos de vista. Una operación conectada.</h2>
            </div>
            <div className={styles.sectionHeadingAside}>
              <span>MAPA XOC / 01—11</span>
              <p>Selecciona un dominio para explorar artículos, análisis, guías y conocimiento práctico.</p>
              <i aria-hidden="true" />
            </div>
          </header>

          <div className={styles.domainGrid}>
            {domains.slice(0, 9).map((domain, index) => <DomainCard domain={domain} index={index} key={domain.id} />)}
          </div>
          <div className={styles.domainGridFinal}>
            {domains.slice(9).map((domain, index) => <DomainCard domain={domain} index={index + 9} key={domain.id} />)}
          </div>
        </div>
      </section>

      <section className={styles.footerSection}>
        <div className={styles.container}>
          <div className={styles.footerPanel}>
            <div aria-hidden="true" className={styles.footerVisual}>
              <Image alt="" fill sizes="(max-width: 700px) 120vw, 58vw" src="/Designer__19_-removebg-preview.png" />
            </div>
            <span className={styles.eyebrow}>Una operación · once perspectivas</span>
            <h2>La claridad aparece cuando conectas las superficies.</h2>
            <p>
              El modelo XOC ayuda a pasar de una lista de equipos y riesgos a una lectura compartida de lo que la
              operación necesita proteger, observar y mejorar.
            </p>
            <Link className={styles.footerAction} href="/articulos">
              Leer el conocimiento TxDxNet <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
