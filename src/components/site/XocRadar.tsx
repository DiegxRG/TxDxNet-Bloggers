'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'

import { DomainIcon } from '@/components/icons/DomainIcon'
import { LibraryIcon } from '@/components/icons/LibraryIcon'
import { domains } from '@/data/domains'

type RadarPosition = {
  angle: number
  radius: number
}

const radarPositions: RadarPosition[] = [
  { angle: -90, radius: 41 },
  { angle: -55, radius: 29 },
  { angle: -22, radius: 40 },
  { angle: 10, radius: 29 },
  { angle: 44, radius: 41 },
  { angle: 77, radius: 32 },
  { angle: 112, radius: 42 },
  { angle: 146, radius: 29 },
  { angle: 179, radius: 42 },
  { angle: 214, radius: 31 },
  { angle: 247, radius: 41 },
]

const radarCycleMilliseconds = 9000
const detectionWindowDegrees = 15

export function XocRadar() {
  const radarRef = useRef<HTMLElement>(null)
  const scanRef = useRef<HTMLDivElement>(null)
  const statusRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const radar = radarRef.current
    const scan = scanRef.current

    if (!radar || !scan) return

    const nodes = Array.from(radar.querySelectorAll<HTMLElement>('[data-radar-angle]'))
    const signalHints = nodes.map((node) =>
      node.querySelector<HTMLElement>('.radar-signal-hint'),
    )
    const startedAt = performance.now()
    let activeIndex = -1
    let animationFrame = 0

    radar.dataset.animation = 'running'

    if (process.env.NODE_ENV === 'development') {
      console.info('[XOC Radar] Barrido activo', {
        cycleMilliseconds: radarCycleMilliseconds,
        domains: nodes.length,
      })
    }

    const animate = (now: number) => {
      const progress = ((now - startedAt) % radarCycleMilliseconds) / radarCycleMilliseconds
      const sweepDegrees = progress * 360
      scan.style.transform = `rotate(${sweepDegrees}deg)`

      signalHints.forEach((hint, index) => {
        if (!hint) return

        const phase = now / 1350 + index * 0.82
        const driftX = Math.cos(phase) * 3
        const driftY = Math.sin(phase * 0.86) * 3
        const scale = 0.9 + (Math.sin(phase * 1.15) + 1) * 0.12

        hint.style.transform = `translate(-50%, -50%) translate(${driftX}px, ${driftY}px) scale(${scale})`
      })

      let detectedIndex = -1
      let closestDistance = Number.POSITIVE_INFINITY

      nodes.forEach((node, index) => {
        const nodeAngle = Number(node.dataset.radarAngle)
        const distance = Math.abs(((sweepDegrees - nodeAngle + 540) % 360) - 180)

        if (distance <= detectionWindowDegrees && distance < closestDistance) {
          closestDistance = distance
          detectedIndex = index
        }
      })

      if (detectedIndex !== activeIndex) {
        nodes.forEach((node, index) => {
          node.classList.toggle('is-detected', index === detectedIndex)
        })
        activeIndex = detectedIndex
      }

      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
      radar.dataset.animation = 'stopped'
    }
  }, [])

  useEffect(() => {
    const status = statusRef.current

    if (!status) return

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = status.getBoundingClientRect()
      const relativeX = (event.clientX - bounds.left) / bounds.width
      const relativeY = (event.clientY - bounds.top) / bounds.height
      const rotateY = (relativeX - 0.5) * 14
      const rotateX = (0.5 - relativeY) * 10

      status.style.setProperty('--status-rotate-x', `${rotateX.toFixed(2)}deg`)
      status.style.setProperty('--status-rotate-y', `${rotateY.toFixed(2)}deg`)
    }

    const handlePointerLeave = () => {
      status.style.setProperty('--status-rotate-x', '4deg')
      status.style.setProperty('--status-rotate-y', '-7deg')
    }

    status.addEventListener('pointermove', handlePointerMove)
    status.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      status.removeEventListener('pointermove', handlePointerMove)
      status.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [])

  return (
    <div className="xoc-radar-shell">
      <nav aria-label="Mapa de los 11 dominios XOC" className="xoc-radar" ref={radarRef}>
        <div aria-hidden="true" className="radar-orbit radar-orbit-outer" />
        <div aria-hidden="true" className="radar-orbit radar-orbit-middle" />
        <div aria-hidden="true" className="radar-orbit radar-orbit-inner" />
        <div aria-hidden="true" className="radar-cross radar-cross-x" />
        <div aria-hidden="true" className="radar-cross radar-cross-y" />
        <div aria-hidden="true" className="radar-scan" ref={scanRef}>
          <span />
        </div>

        <div aria-label="Núcleo de operación XOC" className="radar-core" role="img">
          <Image
            alt=""
            aria-hidden="true"
            className="radar-core-logo"
            height={884}
            priority
            src="/Logo_XOC_Vectorial.png"
            width={907}
          />
        </div>

        {domains.map((domain, index) => {
          const position = radarPositions[index]
          const angleInRadians = (position.angle * Math.PI) / 180
          const x = Number((50 + Math.cos(angleInRadians) * position.radius).toFixed(4))
          const y = Number((50 + Math.sin(angleInRadians) * position.radius).toFixed(4))
          const side = x < 38 ? 'right' : x > 62 ? 'left' : y < 50 ? 'bottom' : 'top'
          const radarAngle = (position.angle + 90 + 360) % 360
          const style = {
            '--node-x': `${x}%`,
            '--node-y': `${y}%`,
          } as CSSProperties

          return (
            <Link
              aria-label={`${domain.id}. ${domain.name}`}
              className={`radar-domain-node radar-domain-node--${side}`}
              data-radar-angle={radarAngle}
              href={`/dominios#dominio-${domain.id}`}
              key={domain.id}
              style={style}
            >
              <span aria-hidden="true" className="radar-signal-hint" />
              <span className="radar-node-beacon">
                <DomainIcon className="radar-node-icon" domainId={domain.id} />
                <span className="radar-node-code">{domain.id}</span>
              </span>
              <span className="radar-node-label">{domain.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="radar-status" ref={statusRef}>
        <div className="radar-status-header">
          <LibraryIcon className="radar-status-library-icon" />
          <span>Biblioteca TxDxNet</span>
          <i>Activa</i>
        </div>
        <div className="radar-status-body">
          <strong>
            02<small>/RUTAS</small>
          </strong>
          <p>
            <b>Artículos por contexto</b>
            <span>Dominios XOC y servicios TxDxSecure</span>
          </p>
        </div>
        <span aria-hidden="true" className="radar-status-meter" />
      </div>

      <div className="radar-mobile-directory">
        {domains.map((domain) => (
          <Link href={`/dominios#dominio-${domain.id}`} key={domain.id}>
            <DomainIcon domainId={domain.id} />
            <span>{domain.shortName}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
