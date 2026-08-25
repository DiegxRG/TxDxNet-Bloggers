'use client'

import { gsap } from 'gsap'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, type ReactNode } from 'react'

import type { Dictionary } from '@/lib/locale'

import styles from './EditorialOpening.module.css'

export type OpeningStory = {
  key: string
  category: string
  title: string
  author: string
  detail: string
  href?: string
  imageAlt?: string
  imageURL?: string | null
}

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

function RevealLine({ children, accent = false }: { children: string; accent?: boolean }) {
  return (
    <span className={accent ? styles.accentLine : styles.headlineLine}>
      {children.split(' ').map((word, wordIndex) => (
        <span
          aria-hidden="true"
          className={styles.revealWord}
          key={`${word}-${wordIndex}`}
        >
          {Array.from(word).map((character, index) => (
            <span
              aria-hidden="true"
              className={styles.revealCharacter}
              data-reveal-character
              key={`${character}-${index}`}
            >
              {character}
            </span>
          ))}
        </span>
      ))}
      <span className={styles.screenReaderText}>{children}</span>
    </span>
  )
}

function StoryVolume({ copy, story, index }: { copy: Dictionary; story: OpeningStory; index: number }) {
  const volume: ReactNode = (
    <div className={styles.volumeMotion} data-ambient-volume>
      <div className={styles.volumeBook}>
        <span aria-hidden="true" className={styles.pageBlock} />
        <span aria-hidden="true" className={styles.volumeSpine}>
          <small>{String(index + 1).padStart(2, '0')}</small>
          <strong>TXDXSECURE</strong>
        </span>
        <div className={styles.volumeCover}>
          <div className={styles.coverFrame}>
            {story.imageURL ? (
              <Image
                alt={story.imageAlt || story.title}
                className={styles.coverImage}
                fill
                priority={index === 0}
                sizes="(max-width: 700px) 76vw, (max-width: 1080px) 30vw, 340px"
                src={story.imageURL}
              />
            ) : (
              <span aria-hidden="true" className={styles.coverArtwork}>
                <i />
              </span>
            )}
          </div>

          <div className={styles.volumeTopline}>
            <span>TxDxSecure</span>
            <span>Vol. {String(index + 1).padStart(2, '0')}</span>
          </div>
          <p className={styles.volumeCategory}>{story.category}</p>
          <h2>{story.title}</h2>
          <div className={styles.volumeFooter}>
            <span>{story.author}</span>
            <span>{story.href ? story.detail : copy.openingSoon}</span>
          </div>
          <span className={styles.volumeAction}>
            {story.href ? copy.openReading : story.detail}
            {story.href ? <ArrowIcon /> : <i aria-hidden="true" />}
          </span>
        </div>
      </div>
    </div>
  )

  const className = `${styles.storySlot} ${styles[`storySlot${index + 1}`]}`

  return story.href ? (
    <Link
      aria-label={`${copy.openArticleAriaPrefix} ${story.title}`}
      className={className}
      data-story-volume
      href={story.href}
    >
      {volume}
    </Link>
  ) : (
    <article
      className={className}
      data-story-volume
      tabIndex={0}
    >
      {volume}
    </article>
  )
}

export function EditorialLibraryStage({ copy, stories }: { copy: Dictionary; stories: OpeningStory[] }) {
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const root = rootRef.current

    if (!root) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const siteHeader = document.querySelector<HTMLElement>('[data-site-header]')
    const selector = gsap.utils.selector(root)
    let removePointerListeners: (() => void) | undefined

    const context = gsap.context(() => {
      const headlineCharacters = selector<HTMLElement>('[data-reveal-character]')
      const storyVolumes = selector<HTMLElement>('[data-story-volume]')
      const ambientVolumes = selector<HTMLElement>('[data-ambient-volume]')
      const leftPage = selector<HTMLElement>('[data-book-page="left"]')[0]
      const rightPage = selector<HTMLElement>('[data-book-page="right"]')[0]
      const scene = selector<HTMLElement>('[data-library-scene]')[0]

      gsap.set(root, { autoAlpha: 1 })

      if (reduceMotion || storyVolumes.length === 0) return

      gsap.set(selector('[data-intro-copy]'), { autoAlpha: 0, y: 18 })
      if (siteHeader) {
        gsap.set(siteHeader, { autoAlpha: 0, yPercent: -110 })
      }
      gsap.set(headlineCharacters, {
        autoAlpha: 0,
        rotationX: -55,
        transformOrigin: '50% 100%',
        yPercent: -110,
      })
      gsap.set(selector('[data-master-book]'), {
        autoAlpha: 0,
        scale: 0.72,
        y: 130,
      })
      gsap.set(leftPage, { rotationY: 86, xPercent: 42 })
      gsap.set(rightPage, { rotationY: -86, xPercent: -42 })
      gsap.set(storyVolumes, {
        autoAlpha: 0,
        rotationX: 58,
        scale: 0.58,
        transformOrigin: '50% 100%',
        y: 250,
        z: -420,
      })

      const timeline = gsap.timeline({ defaults: { ease: 'power4.out' } })

      timeline
        .to(selector('[data-master-book]'), {
          autoAlpha: 1,
          duration: 0.72,
          scale: 1,
          y: 0,
        })
        .to(
          leftPage,
          {
            duration: 0.95,
            ease: 'expo.inOut',
            rotationY: 0,
            xPercent: 0,
          },
          '-=0.28',
        )
        .to(
          rightPage,
          {
            duration: 0.95,
            ease: 'expo.inOut',
            rotationY: 0,
            xPercent: 0,
          },
          '<',
        )
        .to(
          headlineCharacters,
          {
            autoAlpha: 1,
            duration: 0.55,
            ease: 'back.out(1.4)',
            rotationX: 0,
            stagger: 0.05,
            yPercent: 0,
          },
          '-=0.36',
        )
        .to(
          storyVolumes,
          {
            autoAlpha: 1,
            duration: 1.05,
            ease: 'back.out(1.22)',
            rotationX: 0,
            scale: 1,
            stagger: 0.13,
            y: 0,
            z: 0,
          },
          '-=0.46',
        )
        .to(
          selector('[data-master-book]'),
          { duration: 0.75, ease: 'power2.out', opacity: 0.72, scale: 0.97, y: 18 },
          '-=0.65',
        )

      if (siteHeader) {
        timeline.to(
          siteHeader,
          {
            autoAlpha: 1,
            duration: 0.75,
            ease: 'back.out(1.25)',
            yPercent: 0,
          },
          '-=0.45',
        )
      }

      timeline.to(
        selector('[data-intro-copy="support"]'),
        { autoAlpha: 1, duration: 0.55, stagger: 0.09, y: 0 },
        '-=0.3',
      )

      ambientVolumes.forEach((volume, index) => {
        gsap.to(volume, {
          delay: 1.7 + index * 0.28,
          duration: 3.6 + index * 0.35,
          ease: 'sine.inOut',
          repeat: -1,
          y: index === 1 ? -7 : -4,
          yoyo: true,
        })
      })

      if (finePointer && scene) {
        const rotateX = gsap.quickTo(scene, 'rotationX', { duration: 0.7, ease: 'power3.out' })
        const rotateY = gsap.quickTo(scene, 'rotationY', { duration: 0.7, ease: 'power3.out' })

        const handlePointerMove = (event: PointerEvent) => {
          const bounds = root.getBoundingClientRect()
          const target = event.target instanceof Element
            ? event.target.closest<HTMLElement>('[data-story-volume]')
            : null
          const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5
          const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5
          const nextRotationX = target ? 0 : relativeY * -3
          const nextRotationY = target ? 0 : relativeX * 4.5

          rotateY(nextRotationY)
          rotateX(nextRotationX)
        }

        const resetScene = () => {
          rotateX(0)
          rotateY(0)
        }

        root.addEventListener('pointermove', handlePointerMove)
        root.addEventListener('pointerleave', resetScene)

        removePointerListeners = () => {
          root.removeEventListener('pointermove', handlePointerMove)
          root.removeEventListener('pointerleave', resetScene)
        }
      }
    }, root)

    return () => {
      removePointerListeners?.()
      context.revert()
    }
  }, [])

  return (
    <section className={styles.hero} ref={rootRef}>
      <div aria-hidden="true" className={styles.ambientGrid} />
      <div className={styles.inner}>
        <header className={styles.heading}>
          <h1>
            <RevealLine>{copy.heroLinePrimary}</RevealLine>
            <RevealLine accent>{copy.heroLineAccent}</RevealLine>
          </h1>

        </header>

        <div className={styles.libraryScene} data-library-scene>
          <div aria-hidden="true" className={styles.masterBook} data-master-book>
            <div className={`${styles.bookPage} ${styles.leftPage}`} data-book-page="left" />
            <span className={styles.masterSpine} />
            <div className={`${styles.bookPage} ${styles.rightPage}`} data-book-page="right" />
          </div>

          <div className={styles.volumeShelf}>
            {stories.map((story, index) => (
              <StoryVolume copy={copy} index={index} key={story.key} story={story} />
            ))}
          </div>
          <span aria-hidden="true" className={styles.shelfEdge} />
        </div>

        <div className={styles.heroFooter} data-intro-copy="support">
          <div className={styles.footerTopics}>
            <span>{copy.domains}</span>
            <i aria-hidden="true" />
            <span>{copy.team}</span>
            <i aria-hidden="true" />
            <span>{copy.heroTopicInsights}</span>
          </div>
          <Link className={styles.libraryAction} href="/articulos">
            {copy.enterLibrary} <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  )
}
