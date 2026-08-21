import { cookies, headers } from 'next/headers'

export type Locale = 'en' | 'es'

export const LOCALE_COOKIE = 'txdx-locale'
export const TIMEZONE_COOKIE = 'txdx-timezone'

export const messages = {
  en: {
    articles: 'Articles',
    domains: 'XOC Domains',
    team: 'Team',
    library: 'Library',
    explore: 'Explore',
    company: 'Company',
    followUs: 'Follow us',
    interface: 'Interface',
    closeMenu: 'Close menu',
    openMenu: 'Open menu',
    tagline: 'Articles, analysis and guides for operating digital experiences with greater clarity.',
    socialNote: 'Analysis and guides, also on your networks.',
    switchTo: 'Cambiar a español',
  },
  es: {
    articles: 'Artículos',
    domains: 'Dominios XOC',
    team: 'Equipo',
    library: 'Biblioteca',
    explore: 'Explorar',
    company: 'Empresa',
    followUs: 'Síguenos',
    interface: 'Interfaz',
    closeMenu: 'Cerrar menú',
    openMenu: 'Abrir menú',
    tagline: 'Artículos, análisis y guías para operar experiencias digitales con más claridad.',
    socialNote: 'Análisis y guías, también en tus redes.',
    switchTo: 'Switch to English',
  },
} as const

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

export function getMessages(locale: Locale) {
  return messages[locale]
}
