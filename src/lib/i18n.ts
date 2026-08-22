import { cookies, headers } from 'next/headers'

import { LOCALE_COOKIE, TIMEZONE_COOKIE, type Locale } from './locale'

export { getMessages, interpolate, LOCALE_COOKIE, messages, TIMEZONE_COOKIE } from './locale'
export type { Dictionary, Locale } from './locale'

function normalizeLocale(value: string | undefined) {
  return value?.toLowerCase().startsWith('en') ? 'en' : value?.toLowerCase().startsWith('es') ? 'es' : null
}

function browserLocale(acceptLanguage: string | null) {
  const candidates = (acceptLanguage || '').split(',').map((part) => part.split(';')[0].trim())
  for (const candidate of candidates) {
    const locale = normalizeLocale(candidate)
    if (locale) return locale
  }
  return null
}

function timezoneLocale(timezone: string | undefined) {
  if (timezone === 'America/Lima') return 'es' as const
  if (timezone && /^(America\/New_York|America\/Chicago|America\/Denver|America\/Los_Angeles|Europe\/London|Australia\/|Pacific\/Auckland)/.test(timezone)) return 'en' as const
  return null
}

export async function resolveLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const explicit = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value)
  if (explicit) return explicit

  const headerStore = await headers()
  const browser = browserLocale(headerStore.get('accept-language'))
  if (browser) return browser

  return timezoneLocale(cookieStore.get(TIMEZONE_COOKIE)?.value) || 'es'
}
