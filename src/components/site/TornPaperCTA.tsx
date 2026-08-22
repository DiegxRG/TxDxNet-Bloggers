'use client'

import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import type { Dictionary } from '@/lib/locale'

type PanelState = 'open' | 'tab'

export function TornPaperCTA({ copy }: { copy: Dictionary }) {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [state, setState] = useState<PanelState>('open')
  const close = useCallback(() => setState('tab'), [])

  const handleTab = useCallback(() => {
    if (state === 'tab') {
      setState('open')
    }
  }, [state])

  const rootClass = [
    'torn-paper',
    isHome ? 'torn-paper--home' : 'torn-paper--interior',
    state === 'open' ? 'torn-paper--open' : '',
    state === 'tab' ? 'torn-paper--tab' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClass}>
      <svg className="torn-paper__filters" aria-hidden="true">
        <defs>
          <filter id="torn-edge-filter">
            <feTurbulence
              baseFrequency="0.04"
              numOctaves="5"
              seed="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="7"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Collapsed tab */}
      <button
        className="torn-paper__tab"
        onClick={handleTab}
        aria-label={copy.tornOpenLabel}
        type="button"
      >
        <Image
          alt=""
          className="torn-paper__tab-logo"
          height={22}
          loading="eager"
          src="/logotxdx.png"
          width={22}
        />
        <span className="torn-paper__tab-dot" />
      </button>

      {/* Full paper sheet */}
      <div className="torn-paper__sheet">
        <button
          className="torn-paper__close"
          onClick={close}
          aria-label={copy.tornCloseLabel}
          type="button"
        >
          <svg fill="none" viewBox="0 0 24 24">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
        </button>

        <div className="torn-paper__tape" />

        <div className="torn-paper__grid" />

        <div className="torn-paper__hatch" />

        <div className="torn-paper__fold" />

        <div className="torn-paper__shine" />

        <div className="torn-paper__content">
          <span className="torn-paper__label">{copy.tornPlatformBadge}</span>
          <Image
            alt="TxDxSecure"
            className="torn-paper__logo"
            height={44}
            loading="eager"
            priority={false}
            src="/logotxdx.png"
            width={44}
          />
          <span className="torn-paper__company">TxDxSecure</span>

          <a
            className="torn-paper__btn"
            href="https://txdxsecure.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span className="torn-paper__btn-pulse" />
            <span className="torn-paper__btn-label">{copy.tornExploreButton}</span>
            <svg
              aria-hidden="true"
              className="torn-paper__btn-arrow"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                d="M7 17L17 7M17 7H7M17 7v10"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />
            </svg>
          </a>

        </div>
      </div>
    </div>
  )
}
