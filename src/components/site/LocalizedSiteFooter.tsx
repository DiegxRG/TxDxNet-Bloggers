import { resolveLocale } from '@/lib/i18n'

import { SiteFooter } from './SiteFooter'

export async function LocalizedSiteFooter() {
  return <SiteFooter locale={await resolveLocale()} />
}
