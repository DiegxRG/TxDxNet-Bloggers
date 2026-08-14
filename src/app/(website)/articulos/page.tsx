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

import styles from './articles.module.css'

export const metadata: Metadata = {
  title: 'Artículos',
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
        code="Artículos · Análisis · Guías"
        description="Perspectivas que conectan tecnología, seguridad y operación con preguntas reales de negocio, organizadas por dominios XOC y servicios TxDxSecure."
        eyebrow="Biblioteca TxDxNet"
        title="Ideas para decidir mejor."
      />

      <section className={styles.library}>
        <div className={styles.container}>
          <div className={styles.libraryBar}>
            <div>
              <span>{String(posts.length).padStart(2, '0')} publicaciones</span>
              <h2>Explorar la biblioteca</h2>
            </div>
            <nav aria-label="Filtrar artículos" className={styles.filters}>
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
              <div className={styles.featured}>
                <ArticleCard post={featuredPost} priority variant="featured" />
              </div>
              {remainingPosts.length ? (
                <div className={styles.grid}>
                  {remainingPosts.map((post) => (
                    <ArticleCard key={post.id} post={post} />
                  ))}
                </div>
              ) : null}
            </>
          ) : (
            <div className={styles.emptyState}>
              <div>
                <span>{mode ? 'Colección en preparación' : 'Primera edición en preparación'}</span>
                <h2>{mode ? 'Todavía no hay publicaciones en esta categoría.' : 'La biblioteca está abriendo sus primeras páginas.'}</h2>
                <p>
                  {mode
                    ? 'Prueba con todos los artículos o vuelve pronto para descubrir una nueva publicación.'
                    : 'Nuestros primeros análisis ya están en producción editorial. Cuando se publique uno, aparecerá aquí y en la portada automáticamente.'}
                </p>
                {mode ? <Link href="/articulos">Ver todos los artículos →</Link> : null}
              </div>
              <div className={styles.emptyAside}>
                <span>Próximas lecturas</span>
                {plannedArticles.map((article) => (
                  <p key={article.index}>{article.title}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {!posts.length && !mode ? (
        <section className={styles.upcoming}>
          <div className={styles.container}>
            <div className={styles.upcomingHeading}>
              <span>Próximas publicaciones</span>
              <h2>
                En la mesa editorial
              </h2>
            </div>
            <div className={styles.grid}>
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
