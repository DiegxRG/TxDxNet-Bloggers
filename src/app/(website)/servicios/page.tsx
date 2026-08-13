import type { Metadata } from 'next'

import { InteriorHero } from '@/components/site/InteriorHero'
import { coreServices } from '@/data/services'

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
        code="CAP / 04"
        description="Activamos capacidades que convierten la arquitectura, la automatización y la ciberseguridad en resultados medibles para la organización."
        eyebrow="Core services"
        title="Diseñar bien. Operar mejor."
      />
      <section className="bg-paper px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-px overflow-hidden border border-ink-950/15 bg-ink-950/15 md:grid-cols-2">
            {coreServices.map((service, index) => (
              <article className="group min-h-[30rem] bg-paper p-7 transition hover:bg-blue-50 sm:p-10" key={service.code}>
                <div className="flex items-center justify-between text-[10px] font-extrabold tracking-[0.18em] uppercase">
                  <span className="text-signal-orange">0{index + 1} / {service.code}</span>
                  <span className="text-ink-500">{service.eyebrow}</span>
                </div>
                <div className="mt-36">
                  <h2 className="font-display text-5xl font-semibold tracking-[-0.065em] sm:text-7xl">
                    {service.name}
                  </h2>
                  <p className="mt-7 max-w-lg text-sm leading-7 text-ink-500">{service.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
