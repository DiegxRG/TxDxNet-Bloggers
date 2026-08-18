import Image from 'next/image'

import { getMediaURL } from '@/modules/content/domain/media-url'
import type { Media } from '@/payload-types'

type Props = {
  media?: Media | null | string
  name: string
  size?: 'card' | 'large' | 'small'
}

const SIZE_CLASSES = {
  card: 'h-9 w-9 text-xs',
  large: 'h-14 w-14 text-lg',
  small: 'h-8 w-8 text-[0.65rem]',
} as const

function getInitial(name: string) {
  return name.trim().split(/\s+/)[0]?.slice(0, 1).toUpperCase() || 'T'
}

export function AuthorAvatar({ media, name, size = 'small' }: Props) {
  const url = getMediaURL(media, 'avatar')

  return (
    <span className={`relative inline-grid flex-none place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] font-display font-extrabold text-white shadow-[0_8px_20px_rgba(7,20,45,0.14)] ${SIZE_CLASSES[size]}`}>
      {url ? (
        <Image alt={`Foto de perfil de ${name}`} className="object-cover" fill sizes={size === 'large' ? '56px' : size === 'card' ? '36px' : '32px'} src={url} />
      ) : (
        <span aria-hidden="true">{getInitial(name)}</span>
      )}
    </span>
  )
}
