import 'server-only'

export function parseDateTimeInput(value: string) {
  const normalized = value.trim()

  if (!normalized) return null

  return `${normalized}:00-05:00`
}
