'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  'aria-label'?: string
  children?: ReactNode
  className?: string
  title?: string
}

export function LogoutButton({ 'aria-label': ariaLabel, children, className, title }: Props) {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function handleLogout() {
    setPending(true)
    await fetch('/api/admins/logout', { method: 'POST', credentials: 'include' })
    router.replace('/panel/login')
    router.refresh()
  }

  return (
    <button aria-label={ariaLabel} className={className} disabled={pending} onClick={handleLogout} title={title} type="button">
      {pending ? 'Saliendo...' : children || 'Cerrar sesion'}
    </button>
  )
}
