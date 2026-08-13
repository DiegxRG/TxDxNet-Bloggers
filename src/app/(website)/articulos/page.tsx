import type { Metadata } from 'next'
import Link from 'next/link'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { PlannedArticleCard } from '@/components/articles/PlannedArticleCard'
import { InteriorHero } from '@/components/site/InteriorHero'
import { plannedArticles } from '@/data/editorial'
import {
  type ArticleMode,
  getPublishedPosts,
} from '@/modules/content/infrastructure/payload/posts'

export const metadata: Metadata = {
  title: 'Insights',
  description: 'Artículos y análisis técnicos de TxDxSecure para decisiones operacionales.',
  alternates: { canonical: '/articulos' },
}

export const revalidate = 60

const filters: Array<{ href: string; label: string; value: ArticleMode | 'all' }> = [
  { href: '/articulos', label: 'Todos', value: 'all' },
  { href: '/articulos?modo=domain', label: 'Dominios', value: 'domain' },
  { href: '/articulos?modo=service', label: 'Servicios', value: 'service' },
]

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string }>
}) {
  const { modo } = await searchParams
  const mode: ArticleMode | undefined = modo === 'domain' || modo === 'service' ? modo : undefined
  const posts = await getPublishedPosts(24, mode)
  const featuredPost = posts.find((post) => post.featured) || posts[0]
  const remainingPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : []

  return (
    <main id="contenido">
      <InteriorHero
        code="INT / 00"
        description="Análisis que conectan señales técnicas con seguridad, disponibilidad, performance y experiencia del servicio."
        eyebrow="TxDxSecure Insights"
        title="Decisiones con más contexto."
      />

      <section className="bg-paper px-5 py-20 text-ink-950 sm:px-8 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="article-library-bar">
            <div>
              <span className="section-code">BIBLIOTECA / {String(posts.length).padStart(2, '0')}</span>
              <h2>Explorar señales</h2>
            </div>
            <nav aria-label="Filtrar artículos" className="article-filters">
              {filters.map((filter) => {
                const isActive = filter.value === (mode || 'all')
                return (
                  <Link
                    aria-current={isActive ? 'page' : undefined}
                    className={isActive ? 'is-active' : undefined}
                    href={filter.href}
                    key={filter.value}
                  >
                    {filter.label}
                  </Link>
                )
              })}
            </nav>
          </div>

          {featuredPost ? (
            <>
              <div className="mt-14">
                <ArticleCard post={featuredPost} priority variant="featured" />
              </div>
              {remainingPosts.length ? (
                <div className="article-library-grid">
                  {remainingPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className="article-empty-state">
              <div>
                <span>00 / SIN SEÑALES PUBLICADAS</span>
                <h2>{mode ? 'Todavía no hay publicaciones en este modo.' : 'La biblioteca está lista.'}</h2>
                <p>
                  {mode
                    ? 'Prueba con todos los artículos o vuelve pronto para descubrir una nueva señal.'
                    : 'Los primeros análisis ya están en producción editorial. Cuando se publique uno, aparecerá aquí y en la portada automáticamente.'}
                </p>
                {mode ? <Link href="/articulos">Ver todos los insights ↗</Link> : null}
              </div>
              <div className="article-empty-signal" aria-hidden="true">
                <span />
                <strong>XOC</strong>
              </div>
            </div>
          )}
        </div>
      </section>

      {!posts.length && !mode ? (
        <section className="bg-[#f0f2f6] px-5 py-20 text-ink-950 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-12 max-w-3xl">
              <span className="section-code">PRÓXIMAS / 03</span>
              <h2 className="mt-3 font-display text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
                En la mesa editorial
              </h2>
            </div>
            <div className="grid gap-5 lg:grid-cols-3">
              {plannedArticles.map((article, index) => (
                <PlannedArticleCard article={article} index={index} key={article.index} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}
