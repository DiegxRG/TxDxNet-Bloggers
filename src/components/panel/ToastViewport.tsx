'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

const MESSAGES: Record<string, { tone: 'error' | 'success'; text: string }> = {
  'usuario-creado': { tone: 'success', text: 'Usuario creado correctamente.' },
  'usuario-eliminado': { tone: 'success', text: 'Usuario eliminado correctamente.' },
  'usuarios-guardados': { tone: 'success', text: 'Cambios de usuarios guardados.' },
  'usuario-error': { tone: 'error', text: 'No se pudo completar el cambio de usuario.' },
  'usuario-invalido': { tone: 'error', text: 'Revisa los datos y la contraseña temporal.' },
  guardado: { tone: 'success', text: 'Cambios guardados correctamente.' },
  'password-guardado': { tone: 'success', text: 'Contraseña actualizada correctamente.' },
  'password-error': { tone: 'error', text: 'No se pudo actualizar la contraseña.' },
  'perfil-limite': { tone: 'error', text: 'Revisa los límites del perfil público.' },
  creado: { tone: 'success', text: 'Borrador creado correctamente.' },
  publicado: { tone: 'success', text: 'Artículo publicado correctamente.' },
  'error-guardar': { tone: 'error', text: 'No se pudieron guardar los cambios.' },
  'error-publicar': { tone: 'error', text: 'No se pudo publicar el artículo.' },
}

export function ToastViewport() {
  const pathname = usePathname()
  const [toast, setToast] = useState<{ tone: 'error' | 'success'; text: string } | null>(null)

  useEffect(() => {
    const show = (status: string | null) => {
      const nextToast = status ? MESSAGES[status] : null
      if (!nextToast) return
      setToast(nextToast)
      window.setTimeout(() => setToast(null), 4800)
    }
    show(new URLSearchParams(window.location.search).get('estado'))
    const handleToast = (event: Event) => {
      const status = (event as CustomEvent<{ status?: string }>).detail?.status
      show(status || null)
    }
    window.addEventListener('txdx-toast', handleToast)
    return () => window.removeEventListener('txdx-toast', handleToast)
  }, [pathname])

  if (!toast) return null

  return (
    <div aria-live="polite" className={`fixed bottom-5 right-5 z-[80] max-w-sm rounded-2xl border px-4 py-3 text-sm font-bold shadow-[0_18px_50px_rgba(7,20,45,0.2)] ${toast.tone === 'success' ? 'border-[rgba(15,122,61,0.2)] bg-[#effaf2] text-[#0f7a3d]' : 'border-[rgba(255,90,24,0.2)] bg-[#fff5ef] text-[var(--txdx-orange)]'}`} role="status">
      {toast.text}
    </div>
  )
}
