'use client'

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { ConfirmDialog } from './ConfirmDialog'

type Props = {
  'aria-label'?: string
  children: ReactNode
  className?: string
  confirmLabel?: string
  message: string
  title?: string
}

export function ConfirmActionButton({ 'aria-label': ariaLabel, children, className, confirmLabel, message, title }: Props) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <button
        aria-label={ariaLabel}
        className={className}
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
        ref={buttonRef}
        type="submit"
      >
        {children}
      </button>
      <ConfirmDialog
        confirmLabel={confirmLabel}
        message={message}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false)
          buttonRef.current?.form?.requestSubmit()
        }}
        open={open}
        title={title}
      />
    </>
  )
}
