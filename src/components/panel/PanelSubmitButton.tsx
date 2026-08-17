'use client'

import { useFormStatus } from 'react-dom'

type Props = {
  children: string
  className?: string
  name?: string
  pendingLabel: string
  value?: string
  variant?: 'dark' | 'outline' | 'primary'
}

const VARIANT_CLASSNAMES: Record<NonNullable<Props['variant']>, string> = {
  primary:
    'bg-[var(--txdx-orange)] text-white shadow-[0_16px_40px_rgba(255,90,24,0.28)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(255,90,24,0.34)]',
  dark:
    'bg-[var(--txdx-navy)] text-white shadow-[0_16px_40px_rgba(7,20,45,0.18)] hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(7,20,45,0.24)]',
  outline:
    'border border-[var(--theme-elevation-200)] bg-white text-[var(--theme-elevation-700)] hover:-translate-y-0.5 hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]',
}

export function PanelSubmitButton({
  children,
  className,
  name,
  pendingLabel,
  value,
  variant = 'primary',
}: Props) {
  const { pending } = useFormStatus()

  return (
    <button
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-extrabold transition disabled:translate-y-0 disabled:cursor-wait disabled:opacity-70 ${VARIANT_CLASSNAMES[variant]} ${className || ''}`}
      disabled={pending}
      name={name}
      type="submit"
      value={value}
    >
      {pending ? pendingLabel : children}
    </button>
  )
}
