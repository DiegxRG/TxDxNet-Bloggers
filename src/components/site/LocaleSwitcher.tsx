'use client'

import { useRouter } from 'next/navigation'

import { LOCALE_COOKIE, type Locale } from '@/lib/locale'

export function LocaleSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter()
  const nextLocale = locale === 'es' ? 'en' : 'es'

  function changeLocale() {
    document.cookie = `${LOCALE_COOKIE}=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`
    router.refresh()
  }

  return (
    <button aria-label={label} className="locale-switcher" onClick={changeLocale} type="button">
      <span aria-hidden="true">{locale === 'es' ? 'ES' : 'EN'}</span>
      <span>{nextLocale === 'es' ? 'ES' : 'EN'}</span>
    </button>
  )
}
