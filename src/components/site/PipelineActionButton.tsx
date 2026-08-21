'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

type Props = {
  action: 'copy' | 'share'
  className?: string
  detail: string
  icon: ReactNode
  label: string
  shareText?: string
  style?: CSSProperties
  tone?: string
  track: string
  url: string
}

type Feedback = { kind: 'success' | 'manual'; text: string } | null

async function writeClipboard(url: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(url)
      return true
    } catch {
      // Fall through to the legacy path.
    }
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    return copied
  } catch {
    return false
  }
}

export function PipelineActionButton({ action, className, detail, icon, label, shareText, style, tone, track, url }: Props) {
  const [feedback, setFeedback] = useState<Feedback>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  function showSuccess(text: string) {
    setFeedback({ kind: 'success', text })
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setFeedback(null), 2400)
  }

  async function copyLink() {
    const copied = await writeClipboard(url)
    if (copied) {
      showSuccess('¡Enlace copiado!')
      return
    }
    setFeedback({ kind: 'manual', text: 'Copia el enlace manualmente:' })
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }

  async function handleClick() {
    if (action === 'copy') {
      await copyLink()
      return
    }

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText || label, title: label, url })
        showSuccess('¡Compartido!')
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        // Unsupported content or failure: degrade to copying the link.
      }
    }

    await copyLink()
  }

  return (
    <div className="article-pipeline__action" style={style}>
      <button aria-live="polite" className={className} data-tone={tone} onClick={handleClick} type="button">
        <span className="article-pipeline__node">{icon}</span>
        <span className="article-pipeline__step-copy">
          <strong>{label}</strong>
          <small>{feedback?.text ?? detail}</small>
        </span>
        <span className="article-pipeline__track-label">{track}</span>
      </button>
      {feedback?.kind === 'manual' ? (
        <div className="article-pipeline__manual-copy">
          <label htmlFor={`manual-copy-${track}`}>
            {feedback.text}
            <input id={`manual-copy-${track}`} readOnly ref={inputRef} value={url} />
          </label>
        </div>
      ) : null}
    </div>
  )
}
