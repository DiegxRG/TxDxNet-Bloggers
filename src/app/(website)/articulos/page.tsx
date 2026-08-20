import type { Metadata } from 'next'

import { ArticleCard } from '@/components/articles/ArticleCard'
import { PlannedArticleCard } from '@/components/articles/PlannedArticleCard'
import { InteriorHero } from '@/components/site/InteriorHero'
import { plannedArticles } from '@/data/editorial'
import { getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

import styles from './articles.module.css'

export const metadata: Metadata = {
  title: 'Artículos',
  description: 'Artículos y análisis técnicos de TxDxSecure para decisiones operacionales.',
  alternates: { canonical: '/articulos' },
}

export default async function ArticlesPage() {
  const posts = await getPublishedPosts(24)
  const featuredPost = posts.find((post) => post.featured) || posts[0]
  const remainingPosts = featuredPost ? posts.filter((post) => post.id !== featuredPost.id) : []

  return (
    <main id="contenido">
      <InteriorHero
        code="Artículos · Análisis · Guías"
        description="Perspectivas que conectan tecnología, seguridad y operación con preguntas reales de negocio."
        eyebrow="Biblioteca TxDxSecure"
        title="Ideas para decidir mejor."
      />

      <section className={styles.library}>
        <div className={styles.container}>
          <div className={styles.libraryBar}>
            <div>
              <span>{String(posts.length).padStart(2, '0')} publicaciones</span>
              <h2>Explorar la biblioteca</h2>
            </div>
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
                <span>Primera edición en preparación</span>
                <h2>La biblioteca está abriendo sus primeras páginas.</h2>
                <p>
                  Nuestros primeros análisis ya están en producción editorial. Cuando se publique
                  uno, aparecerá aquí y en la portada automáticamente.
                </p>
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

      {!posts.length ? (
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
