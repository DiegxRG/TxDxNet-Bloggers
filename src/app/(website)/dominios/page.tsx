import type { Metadata } from 'next'

import { DomainIndex } from '@/components/site/DomainIndex'
import { InteriorHero } from '@/components/site/InteriorHero'

export const metadata: Metadata = {
  title: 'Los 11 dominios XOC',
  description:
    'Explora las once superficies empresariales protegidas y monitoreadas por el modelo XOC de TxDxSecure.',
  alternates: { canonical: '/dominios' },
}

export default function DomainsPage() {
  return (
    <main id="contenido">
      <InteriorHero
        code="MAP / 11"
        description="Desde las personas hasta los agentes de IA: cada dominio produce señales que solo adquieren valor cuando se observan como parte de una misma experiencia operacional."
        eyebrow="Superficies empresariales"
        title="Once superficies. Una sola operación."
      />
      <section className="bg-paper px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-16 grid gap-8 border-t border-ink-950/15 pt-5 md:grid-cols-[1fr_2fr]">
            <span className="section-code">ÍNDICE OPERACIONAL</span>
            <p className="max-w-2xl text-base leading-8 text-ink-600">
              Este índice será el acceso permanente a artículos, análisis, guías y casos asociados a
              cada superficie. Los dominios no son categorías aisladas: comparten identidades, datos,
              riesgos, dependencias y experiencia.
            </p>
          </div>
          <DomainIndex />
        </div>
      </section>
    </main>
  )
}
