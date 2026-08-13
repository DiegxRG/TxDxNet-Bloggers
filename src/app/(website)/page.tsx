import Link from 'next/link'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { PlannedArticleCard } from '@/components/articles/PlannedArticleCard'
import { LibraryIcon } from '@/components/icons/LibraryIcon'
import { DomainIndex } from '@/components/site/DomainIndex'
import { HeroTelemetry } from '@/components/site/HeroTelemetry'
import { SectionHeading } from '@/components/site/SectionHeading'
import { XocRadar } from '@/components/site/XocRadar'
import { plannedArticles } from '@/data/editorial'
import { capabilities, coreServices } from '@/data/services'
import { getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

const outcomes = ['Seguridad', 'Disponibilidad', 'Performance', 'Experiencia']

export const revalidate = 60

export default async function HomePage() {
  const latestPosts = await getPublishedPosts(4)
  const featuredPost = latestPosts.find((post) => post.featured) || latestPosts[0]
  const recentPosts = featuredPost
    ? latestPosts.filter((post) => post.id !== featuredPost.id)
    : []

  return (
    <main id="contenido">
      <section className="hero-shell">
        <div className="hero-grid" />
        <HeroTelemetry />
        <div className="hero-stage mx-auto grid min-h-[780px] max-w-[1440px] items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12 lg:py-20">
          <div className="hero-copy relative z-10 max-w-4xl">
            <div className="hero-eyebrow mb-8 flex items-center gap-4 text-[10px] font-extrabold tracking-[0.22em] text-blue-200 uppercase">
              <span className="status-dot" />
              TxDxNet / Biblioteca de inteligencia XOC
              <span className="h-px w-12 bg-blue-300/30" />
              Artículos · Análisis · Guías
            </div>
            <h1 className="font-display text-[clamp(4.4rem,10.3vw,9.4rem)] leading-[0.77] font-semibold tracking-[-0.078em] text-white">
              LEER.
              <br />
              ENTENDER.
              <br />
              <span className="text-signal-orange">ACTUAR.</span>
            </h1>
            <div className="hero-intro">
              <p className="text-base leading-7 text-slate-300 sm:text-lg">
                Artículos, análisis y guías de TxDxSecure para comprender riesgos, tecnologías y
                decisiones operativas a través de sus 11 dominios XOC y servicios especializados.
              </p>
              <div className="hero-actions">
                <Link className="hero-library-cta" href="/articulos">
                  <LibraryIcon className="hero-library-icon" />
                  <span>
                    <small>Biblioteca editorial</small>
                    Explorar artículos
                  </span>
                  <i aria-hidden="true">↗</i>
                </Link>
                <Link className="hero-domain-link" href="/dominios">
                  ¿Qué son los dominios XOC?
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-visual relative z-10 mx-auto w-full max-w-[590px] lg:ml-auto">
            <XocRadar />
          </div>
        </div>
        <div className="outcome-rail">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
            {outcomes.map((outcome, index) => (
              <div className="outcome-cell" key={outcome} tabIndex={0}>
                <span>0{index + 1}</span>
                <strong>{outcome}</strong>
                <i aria-hidden="true">✦</i>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="homepage-editorial bg-[#f0f2f6] px-5 py-24 text-ink-950 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <div className="homepage-editorial-heading">
            <SectionHeading
              description="Lecturas para reconocer una señal, entender su impacto y decidir el siguiente movimiento operacional."
              eyebrow="Últimos insights"
              index="001"
              title="El conocimiento también es una capacidad de respuesta."
            />
            <Link className="homepage-library-link" href="/articulos">
              Abrir biblioteca
              <span aria-hidden="true">↗</span>
            </Link>
          </div>

          {featuredPost ? (
            <div
              className={`homepage-articles-grid${recentPosts.length ? '' : ' homepage-articles-grid--single'}`}
            >
              <ArticleCard post={featuredPost} priority variant="featured" />
              {recentPosts.length ? (
                <div className="homepage-articles-secondary">
                  {recentPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              ) : null}
            </div>
          ) : (
            <>
              <div className="homepage-editorial-status">
                <span className="status-dot" />
                Primera serie en producción editorial
              </div>
              <div className="mt-8 grid gap-5 lg:grid-cols-3">
                {plannedArticles.map((article, index) => (
                  <PlannedArticleCard article={article} index={index} key={article.index} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="bg-paper px-5 py-24 text-ink-950 sm:px-8 lg:px-12 lg:py-32">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading
            description="Dos maneras de entrar al conocimiento: por la superficie tecnológica que necesitas comprender o por la capacidad que necesitas activar."
            eyebrow="Sistema editorial"
            index="002"
            title="Una red de conocimiento, no otra lista de artículos."
          />

          <div className="mt-20 grid gap-px overflow-hidden border border-ink-950/15 bg-ink-950/15 lg:grid-cols-2">
            <Link className="mode-card group bg-paper" href="/dominios">
              <span className="mode-index">MODO / 01</span>
              <div>
                <span className="mode-kicker">Explorar por</span>
                <h3>Dominios</h3>
                <p>11 superficies conectadas a la operación, la seguridad y la experiencia.</p>
              </div>
              <span className="mode-arrow" aria-hidden="true">↗</span>
            </Link>
            <Link className="mode-card mode-card-dark group" href="/servicios">
              <span className="mode-index">MODO / 02</span>
              <div>
                <span className="mode-kicker">Explorar por</span>
                <h3>Servicios</h3>
                <p>Arquitectura, automatización, ciberseguridad y ejecución especializada.</p>
              </div>
              <span className="mode-arrow" aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 pb-24 text-ink-950 sm:px-8 lg:px-12 lg:pb-36">
        <div className="mx-auto max-w-[1440px]">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <span className="section-code">MAP / SURFACE</span>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                Los 11 dominios XOC
              </h2>
            </div>
            <p className="max-w-md text-sm leading-7 text-ink-500">
              Cada superficie es protegida y monitoreada por capacidades transversales de identidad,
              observabilidad, datos, exposición y resiliencia.
            </p>
          </div>
          <DomainIndex compact />
        </div>
      </section>

      <section className="relative overflow-hidden bg-ink-950 px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36">
        <div className="transversal-glow" />
        <div className="relative mx-auto max-w-[1440px]">
          <SectionHeading
            dark
            description="No operamos dominios como silos. Correlacionamos señales y activamos capacidades que atraviesan toda la empresa."
            eyebrow="Capacidades"
            index="003"
            title="La señal atraviesa toda la organización."
          />
          <div className="mt-20 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((capability, index) => (
              <div className="capability-card" key={capability}>
                <div className="flex items-center justify-between">
                  <span>CAP / {String.fromCharCode(65 + index)}</span>
                  <span className="capability-pulse" />
                </div>
                <h3>{capability}</h3>
              </div>
            ))}
          </div>

          <div className="mt-24 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coreServices.map((service) => (
              <Link className="service-card" href="/servicios" key={service.code}>
                <div className="flex items-start justify-between">
                  <span className="service-code">{service.code}</span>
                  <span aria-hidden="true">↗</span>
                </div>
                <div>
                  <span className="service-eyebrow">{service.eyebrow}</span>
                  <h3>{service.name}</h3>
                  <p>{service.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-signal-orange px-5 py-20 text-ink-950 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div>
            <span className="text-xs font-extrabold tracking-[0.2em] uppercase">Siguiente movimiento</span>
            <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.88] font-semibold tracking-[-0.065em] sm:text-7xl lg:text-8xl">
              Convierte la complejidad en una operación visible.
            </h2>
          </div>
          <a
            className="cta-dark"
            href="mailto:info@txdxsecure.com?subject=Quiero conversar sobre XOC"
          >
            Hablar con TxDxSecure
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    </main>
  )
}
