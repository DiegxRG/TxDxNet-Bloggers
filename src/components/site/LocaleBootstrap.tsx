'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { LOCALE_COOKIE, TIMEZONE_COOKIE } from '@/lib/locale'

export function LocaleBootstrap() {
  const router = useRouter()

  useEffect(() => {
    const localeCookie = document.cookie.split('; ').find((entry) => entry.startsWith(`${LOCALE_COOKIE}=`))
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const browserLocale = navigator.language.toLowerCase().startsWith('en') ? 'en' : navigator.language.toLowerCase().startsWith('es') ? 'es' : null
    const timezoneLocale = timezone && /^(America\/New_York|America\/Chicago|America\/Denver|America\/Los_Angeles|Europe\/London|Australia\/|Pacific\/Auckland)/.test(timezone) ? 'en' : 'es'
    document.documentElement.lang = localeCookie?.split('=')[1] || browserLocale || timezoneLocale

    if (localeCookie) return

    if (!timezone || document.cookie.includes(`${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}`)) return

    document.cookie = `${TIMEZONE_COOKIE}=${encodeURIComponent(timezone)}; Path=/; Max-Age=31536000; SameSite=Lax`
    router.refresh()
  }, [router])

  return null
}
