import type { getPanelSession } from './session'

type PanelSession = Awaited<ReturnType<typeof getPanelSession>>
type PanelPayload = PanelSession['payload']
type PanelUser = PanelSession['user']

function relationID(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return null
}

function containsMediaReference(value: unknown, mediaID: string): boolean {
  if (!value) return false
  if (typeof value === 'string') return value === mediaID
  if (Array.isArray(value)) return value.some((item) => containsMediaReference(item, mediaID))
  if (typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  if (record.id === mediaID || record.value === mediaID) return true
  return Object.values(record).some((item) => containsMediaReference(item, mediaID))
}

export async function isMediaReferenced(payload: PanelPayload, user: PanelUser, mediaID: string) {
  const [admins, posts, versions] = await Promise.all([
    payload.find({
      collection: 'admins',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      user,
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      user,
    }),
    payload.findVersions({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      pagination: false,
      user,
    }),
  ])

  const isPostReference = (post: { authorAvatar?: unknown; content?: unknown; coverImage?: unknown; socialImage?: unknown }) =>
    containsMediaReference(
      {
        authorAvatar: post.authorAvatar,
        content: post.content,
        coverImage: post.coverImage,
        socialImage: post.socialImage,
      },
      mediaID,
    )

  return admins.docs.some((admin) => relationID(admin.avatar) === mediaID) ||
    posts.docs.some(isPostReference) ||
    versions.docs.some((version) => isPostReference(version.version))
}
