'use client'

import Image from 'next/image'

import { ContactModal } from './ContactModal'
import type { Dictionary } from '@/lib/locale'
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

export function ClosingCTA({ copy }: { copy: Dictionary }) {
  return (
    <ContactModal copy={copy}>
      {(openModal) => (
        <div className={styles.closingCopy}>
          <Image
            alt="TxDxSecure"
            className={styles.closingLogo}
            height={500}
            src="/logo_blanco.png"
            width={500}
          />
          <p>{copy.closingCtaCopy}</p>
          <button
            className={styles.closingCta}
            onClick={openModal}
            type="button"
          >
            {copy.closingCtaButton}
            <ArrowIcon />
          </button>
        </div>
      )}
    </ContactModal>
  )
}
