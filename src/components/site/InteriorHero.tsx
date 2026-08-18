import Image from 'next/image'

import styles from './InteriorHero.module.css'

type InteriorHeroProps = {
  code: string
  eyebrow: string
  title: string
  description: string
  showXocLogo?: boolean
  compact?: boolean
}

export function InteriorHero({
  code,
  eyebrow,
  title,
  description,
  showXocLogo = false,
  compact = false,
}: InteriorHeroProps) {
  return (
    <section className={`${styles.hero} ${compact ? styles.compact : ''}`}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span>{eyebrow}</span>
          <i aria-hidden="true" />
          <span>{code}</span>
        </div>
        <div className={styles.content}>
          <h1>{title}</h1>
          <div className={styles.description}>
            {showXocLogo ? (
              <span className={styles.xocMark}>
                <Image alt="XOC" fill sizes="160px" src="/logo_blanco.png" />
              </span>
            ) : null}
            <p>{description}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
