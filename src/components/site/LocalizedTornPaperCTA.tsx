import { TornPaperCTA } from './TornPaperCTA'
import { getMessages, resolveLocale } from '@/lib/i18n'

export async function LocalizedTornPaperCTA() {
  const locale = await resolveLocale()
  return <TornPaperCTA copy={getMessages(locale)} />
}
