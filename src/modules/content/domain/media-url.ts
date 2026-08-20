import type { Media } from '@/payload-types'

export function normalizeMediaURL(value: string | null | undefined) {
  if (!value) return null

  try {
    const parsedURL = new URL(value)

    if (parsedURL.pathname.startsWith('/api/media/file/')) {
      return `${parsedURL.pathname}${parsedURL.search}`
    }
  } catch {
    // Relative and non-standard URLs can be returned unchanged.
  }

  return value
}

export function getMediaURL(
  media: string | Media | null | undefined,
  size: 'avatar' | 'card' | 'hero' | 'original' | 'thumbnail' = 'card',
) {
  if (!media) return null
  if (typeof media === 'string') {
    return /^(https?:\/\/|\/)/i.test(media) ? normalizeMediaURL(media) : null
  }

  const mediaURL = size === 'original' ? media.url : media.sizes?.[size]?.url || media.url
  return normalizeMediaURL(mediaURL)
}
