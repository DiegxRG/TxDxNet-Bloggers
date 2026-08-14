import type { Metadata } from 'next'
import Link from 'next/link'

import { InteriorHero } from '@/components/site/InteriorHero'
import { coreServices } from '@/data/services'

import styles from './services.module.css'

export const metadata: Metadata = {
  title: 'Servicios',
  description:
    'Arquitectura, automatización, ciberseguridad y deployment especializado por TxDxSecure.',
  alternates: { canonical: '/servicios' },
}

export default function ServicesPage() {
  return (
    <main id="contenido">
      <InteriorHero
        code={`${coreServices.length} capacidades`}
        description="Conoce cómo aplicamos arquitectura, automatización y ciberseguridad, y encuentra publicaciones que convierten la experiencia técnica en decisiones útiles para la organización."
        eyebrow="Servicios TxDxSecure"
        title="Conocimiento que se convierte en ejecución."
      />
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.intro}>
            <span>Áreas de conocimiento aplicado</span>
            <h2>De la experiencia técnica a una solución comprensible.</h2>
            <p>
              Cada servicio reúne experiencia, metodología y publicaciones para ayudarte a
              comprender el problema antes de elegir una respuesta.
            </p>
          </div>
          <div className={styles.grid}>
            {coreServices.map((service, index) => (
              <article className={styles.card} key={service.code}>
                <div className={styles.cardMeta}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <span>{service.eyebrow}</span>
                </div>
                <h2>{service.name}</h2>
                <p>{service.description}</p>
                <Link href="/articulos?modo=service">Explorar artículos relacionados →</Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
