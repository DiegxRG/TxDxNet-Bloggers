'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  cancelLabel?: string
  confirmLabel?: string
  message: string
  onCancel: () => void
  onConfirm: () => void
  open: boolean
  title?: string
}

export function ConfirmDialog({
  cancelLabel = 'Cancelar',
  confirmLabel = 'Sí, eliminar',
  message,
  onCancel,
  onConfirm,
  open,
  title = 'Confirma la acción',
}: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    cancelRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onCancel])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[999] grid place-items-center px-4" role="presentation">
      <button
        aria-label="Cerrar diálogo"
        className="absolute inset-0 cursor-default bg-[rgba(7,20,45,0.55)] backdrop-blur-sm"
        onClick={onCancel}
        tabIndex={-1}
        type="button"
      />
      <div
        aria-describedby="confirm-dialog-message"
        aria-labelledby="confirm-dialog-title"
        aria-modal="true"
        className="relative w-full max-w-sm rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_30px_90px_rgba(2,8,24,0.35)] md:p-6"
        role="dialog"
      >
        <div className="flex items-start gap-3.5">
          <span aria-hidden="true" className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-[rgba(255,90,24,0.1)] text-[var(--txdx-orange)]">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
              <path d="M12 9v4M12 17h.01" />
            </svg>
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-base font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]" id="confirm-dialog-title">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-[var(--theme-elevation-600)]" id="confirm-dialog-message">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--theme-elevation-200)] px-3 text-sm font-extrabold text-[var(--txdx-navy)] transition hover:bg-[var(--theme-elevation-50)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-blue-500)]"
            onClick={onCancel}
            ref={cancelRef}
            type="button"
          >
            {cancelLabel}
          </button>
          <button
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[var(--txdx-orange)] px-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#e64d0f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--txdx-orange)]"
            onClick={onConfirm}
            type="button"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
