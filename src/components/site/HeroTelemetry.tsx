'use client'

import { useEffect, useRef } from 'react'

type TelemetrySignal = {
  direction: -1 | 1
  duration: number
  label: string
  phase: number
  tone?: 'orange'
  travel: number
}

const signals: TelemetrySignal[] = [
  { direction: 1, duration: 6200, label: 'SIG / 01', phase: 0.12, travel: 0.34 },
  { direction: -1, duration: 8100, label: 'NET / LIVE', phase: 0.58, travel: 0.29 },
  { direction: 1, duration: 7000, label: 'XOC / 03', phase: 0.34, travel: 0.38, tone: 'orange' },
  { direction: -1, duration: 5600, label: 'OBS / 04', phase: 0.81, travel: 0.25 },
  { direction: 1, duration: 9200, label: 'PKT / 05', phase: 0.47, travel: 0.33 },
  { direction: -1, duration: 6800, label: 'IR / READY', phase: 0.22, travel: 0.31, tone: 'orange' },
  { direction: 1, duration: 7600, label: 'DATA / 07', phase: 0.69, travel: 0.27 },
]

export function HeroTelemetry() {
  const telemetryRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const telemetry = telemetryRef.current

    if (!telemetry) return

    const lines = Array.from(telemetry.querySelectorAll<HTMLElement>('[data-telemetry-line]'))
    const startedAt = performance.now()
    let viewportWidth = window.innerWidth
    let animationFrame = 0

    telemetry.dataset.animation = 'running'

    const handleResize = () => {
      viewportWidth = window.innerWidth
    }

    const animate = (now: number) => {
      const elapsed = now - startedAt

      lines.forEach((line, index) => {
        const signal = signals[index]
        const progress = (elapsed / signal.duration + signal.phase) % 1
        const distance = (progress - 0.5) * viewportWidth * signal.travel * signal.direction
        const energy = Math.pow(Math.sin(progress * Math.PI), 1.35)
        const verticalDrift = Math.sin(elapsed / 1700 + index * 1.4) * 3

        line.style.opacity = String(0.2 + energy * 0.68)
        line.style.transform = `translate3d(${distance}px, ${verticalDrift}px, 0)`
      })

      animationFrame = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', handleResize)
    animationFrame = requestAnimationFrame(animate)

    if (process.env.NODE_ENV === 'development') {
      console.info('[Hero Telemetry] Movimiento activo', { signals: lines.length })
    }

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener('resize', handleResize)
      telemetry.dataset.animation = 'stopped'
    }
  }, [])

  return (
    <div aria-hidden="true" className="hero-telemetry" ref={telemetryRef}>
      {signals.map((signal) => (
        <span
          data-telemetry-line=""
          data-tone={signal.tone || 'cyan'}
          key={signal.label}
        >
          <small>{signal.label}</small>
          <i />
        </span>
      ))}
    </div>
  )
}
