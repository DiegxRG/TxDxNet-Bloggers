import { EditorialOpening } from '@/components/site/EditorialOpening'
import { HomeBlogList } from '@/components/site/HomeBlogList'
import { getPublishedPosts } from '@/modules/content/infrastructure/payload/posts'

import styles from './home.module.css'

export const revalidate = 60

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M5 12h13M13 7l5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

export default async function HomePage() {
  const latestPosts = await getPublishedPosts(9)

  return (
    <main className={styles.main} id="contenido">
      <EditorialOpening posts={latestPosts} />

      <HomeBlogList />

      <section className={styles.closingSection}>
        <div className={styles.closingInner}>
          <div>
            <span>Perspectiva TxDxSecure</span>
            <h2>La tecnología importa. Entender qué hacer con ella importa más.</h2>
          </div>
          <div className={styles.closingCopy}>
            <p>
              TxDxNet conecta experiencia técnica, contexto empresarial y decisiones prácticas para
              que cada publicación sea útil más allá de la lectura.
            </p>
            <a href="mailto:info@txdxsecure.com?subject=Conversación desde TxDxNet">
              Conversar con nuestro equipo
              <ArrowIcon />
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
