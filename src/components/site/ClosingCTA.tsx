'use client'

import { ContactModal } from './ContactModal'
import styles from '../../app/(website)/home.module.css'

function ArrowIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M5 12h13M13 7l5 5-5 5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function ClosingCTA() {
  return (
    <ContactModal>
      {(openModal) => (
        <div className={styles.closingCopy}>
          <p>
            TxDxNet conecta experiencia técnica, contexto empresarial y decisiones prácticas para
            que cada publicación sea útil más allá de la lectura.
          </p>
          <button
            className={styles.closingCta}
            onClick={openModal}
            type="button"
          >
            Conversar con nuestro equipo
            <ArrowIcon />
          </button>
        </div>
      )}
    </ContactModal>
  )
}
