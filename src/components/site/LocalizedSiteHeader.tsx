import { resolveLocale } from '@/lib/i18n'

import { SiteHeader } from './SiteHeader'

export async function LocalizedSiteHeader() {
  return <SiteHeader locale={await resolveLocale()} />
}
