export type Locale = 'en' | 'es'

export const LOCALE_COOKIE = 'txdx-locale'
export const TIMEZONE_COOKIE = 'txdx-timezone'

export const messages = {
  en: {
    articles: 'Articles', domains: 'XOC Domains', team: 'Team', library: 'Library', explore: 'Explore', company: 'Company', followUs: 'Follow us', closeMenu: 'Close menu', openMenu: 'Open menu', tagline: 'Articles, analysis and guides for operating digital experiences with greater clarity.', socialNote: 'Analysis and guides, also on your networks.', switchTo: 'Cambiar a español',
  },
  es: {
    articles: 'Artículos', domains: 'Dominios XOC', team: 'Equipo', library: 'Biblioteca', explore: 'Explorar', company: 'Empresa', followUs: 'Síguenos', closeMenu: 'Cerrar menú', openMenu: 'Abrir menú', tagline: 'Artículos, análisis y guías para operar experiencias digitales con más claridad.', socialNote: 'Análisis y guías, también en tus redes.', switchTo: 'Switch to English',
  },
} as const

export function getMessages(locale: Locale) {
  return messages[locale]
}
