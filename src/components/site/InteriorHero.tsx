import styles from './InteriorHero.module.css'

type InteriorHeroProps = {
  code: string
  eyebrow: string
  title: string
  description: string
}

export function InteriorHero({ code, eyebrow, title, description }: InteriorHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span>{eyebrow}</span>
          <i aria-hidden="true" />
          <span>{code}</span>
        </div>
        <div className={styles.content}>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
    </section>
  )
}
