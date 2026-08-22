'use client'

import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import type { Dictionary } from '@/lib/locale'

import styles from './ContactModal.module.css'

/* ─── SVG helpers ────────────────────────────────────────────── */

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M2 4.5C2 3.12 3.12 2 4.5 2h3C8.88 2 10 3.12 10 4.5V20c0-.83-.67-1.5-1.5-1.5h-5A1.5 1.5 0 0 1 2 17V4.5ZM14 4.5c0-1.38 1.12-2.5 2.5-2.5h3C20.88 2 22 3.12 22 4.5V17a1.5 1.5 0 0 1-1.5 1.5h-5c-.83 0-1.5.67-1.5 1.5V4.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M12 22V6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" opacity="0.4" />
    </svg>
  )
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      <path
        d="M4 7l6.94 4.34a2 2 0 0 0 2.12 0L20 7"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <rect
        height="14"
        rx="2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
        width="18"
        x="3"
        y="5"
      />
    </svg>
  )
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

/* ─── Types ──────────────────────────────────────────────────── */

type Channel = 'email' | 'whatsapp'

const WHATSAPP_NUMBER = '51942325448'
const EMAIL_DEST = 'info@txdxsecure.com'

/* ─── Component ──────────────────────────────────────────────── */

interface ContactModalProps {
  children: (openModal: () => void) => ReactNode
  copy: Dictionary
}

export function ContactModal({ children, copy }: ContactModalProps) {
  const [open, setOpen] = useState(false)
  const [channel, setChannel] = useState<Channel>('email')
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  /* Focus trap & Escape */
  useEffect(() => {
    if (!open) return

    const prev = document.activeElement as HTMLElement | null
    firstFocusRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      prev?.focus()
    }
  }, [open])

  /* Close on backdrop click */
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) setOpen(false)
    },
    [],
  )

  /* Links */
  const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(copy.whatsappPrefill)}`
  const emailLink = `mailto:${EMAIL_DEST}`
  const [emailDescriptionBefore, emailDescriptionAfter] = copy.contactEmailDescription.split('{email}')

  const openModal = useCallback(() => {
    setOpen(true)
  }, [])

  return (
    <>
      {children(openModal)}

      {/* ── Modal overlay ──────────────────────────────────── */}
      <div
        aria-labelledby="contact-modal-title"
        aria-modal="true"
        className={styles.overlay}
        data-open={open ? '' : undefined}
        onClick={handleOverlayClick}
        ref={overlayRef}
        role="dialog"
      >
        <div className={styles.book}>
          {/* Spine glow */}
          <span aria-hidden="true" className={styles.spine} />

          {/* Close button */}
          <button
            aria-label={copy.contactClose}
            className={styles.close}
            onClick={() => setOpen(false)}
            ref={firstFocusRef}
            type="button"
          >
            ✕
          </button>

          <div className={styles.pages}>
            {/* ── LEFT page ───────────────────────────── */}
            <div className={styles.pageLeft}>
              <div className={styles.leftHeader}>
                <span className={styles.leftBadge}>
                  <BookOpenIcon />
                  {copy.contactBadge}
                </span>
                <h2 className={styles.leftTitle} id="contact-modal-title">
                  {copy.contactTitle}
                </h2>
                <p className={styles.leftDescription}>
                  {copy.contactDescription}
                </p>
              </div>

              {/* Channel selector */}
              <div className={styles.channels}>
                <button
                  className={styles.channelBtn}
                  data-active={channel === 'email' ? '' : undefined}
                  onClick={() => setChannel('email')}
                  type="button"
                >
                  <MailIcon />
                  {copy.contactChannelEmail}
                </button>
                <button
                  className={styles.channelBtn}
                  data-active={channel === 'whatsapp' ? '' : undefined}
                  onClick={() => setChannel('whatsapp')}
                  type="button"
                >
                  <WhatsAppIcon />
                  WhatsApp
                </button>
              </div>

              {/* Decoration */}
              <div aria-hidden="true" className={styles.leftDecoration}>
                <span className={styles.decoLine} />
                <span className={styles.decoLabel}>TxDxSecure</span>
                <span className={styles.decoLine} />
              </div>
            </div>

            {/* ── RIGHT page ──────────────────────────── */}
            <div className={styles.pageRight}>
              {channel === 'email' && (
                <div className={styles.waView}>
                  <div className={styles.emailIconWrap}>
                    <MailIcon />
                  </div>
                  <p className={styles.waTitle}>{copy.contactEmailTitle}</p>
                  <p className={styles.waDesc}>
                    {emailDescriptionBefore}
                    {' '}
                    <strong>{EMAIL_DEST}</strong>
                    {emailDescriptionAfter}
                  </p>
                  <a
                    className={styles.emailButton}
                    href={emailLink}
                  >
                    <MailIcon />
                    <span>{copy.contactEmailButton}</span>
                    <div aria-hidden="true" className={styles.buttonFill} />
                  </a>
                </div>
              )}

              {channel === 'whatsapp' && (
                <div className={styles.waView}>
                  <div className={styles.waIconWrap}>
                    <WhatsAppIcon />
                  </div>
                  <p className={styles.waTitle}>{copy.contactWhatsappTitle}</p>
                  <p className={styles.waDesc}>
                    {copy.contactWhatsappDescription}
                  </p>
                  <a
                    className={styles.waButton}
                    href={waLink}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <WhatsAppIcon />
                    <span>{copy.contactWhatsappButton}</span>
                    <div aria-hidden="true" className={styles.buttonFill} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
