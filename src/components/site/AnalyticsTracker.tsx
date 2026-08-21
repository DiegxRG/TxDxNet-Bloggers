'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

export function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/panel') || pathname.startsWith('/articulos/preview/')) return
    if (navigator.doNotTrack === '1') return

    const storageKey = `txdx-analytics:${pathname}`
    if (window.sessionStorage.getItem(storageKey)) return
    window.sessionStorage.setItem(storageKey, '1')

    const events = pathname.startsWith('/articulos/') ? ['page_view', 'article_read'] : ['page_view']
    void fetch('/api/analytics', {
      body: JSON.stringify({ path: pathname, types: events }),
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      method: 'POST',
    }).catch(() => undefined)
  }, [pathname])

  return null
}
