import type { getPanelSession } from './session'

type PanelSession = Awaited<ReturnType<typeof getPanelSession>>
type PanelPayload = PanelSession['payload']
type PanelUser = PanelSession['user']

function containsMediaReference(value: unknown, mediaID: string): boolean {
  if (!value) return false
  if (typeof value === 'string') return value === mediaID
  if (Array.isArray(value)) return value.some((item) => containsMediaReference(item, mediaID))
  if (typeof value !== 'object') return false

  const record = value as Record<string, unknown>
  if (record.id === mediaID || record.value === mediaID) return true
  return Object.values(record).some((item) => containsMediaReference(item, mediaID))
}

function hasMediaInLexical(content: unknown, mediaID: string): boolean {
  if (!content || typeof content !== 'object') return false
  const root = content as Record<string, unknown>
  const nodes = (root.root as Record<string, unknown>)?.children ?? root.children
  return containsMediaReference(nodes, mediaID)
}

export async function isMediaReferenced(payload: PanelPayload, user: PanelUser, mediaID: string) {
  const [adminHit, coverHit, avatarHit, socialHit] = await Promise.all([
    payload.find({
      collection: 'admins',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      user,
      where: { avatar: { equals: mediaID } },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      user,
      where: { coverImage: { equals: mediaID } },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      user,
      where: { authorAvatar: { equals: mediaID } },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1,
      overrideAccess: true,
      pagination: false,
      user,
      where: { socialImage: { equals: mediaID } },
    }),
  ])

  if (adminHit.totalDocs > 0 || coverHit.totalDocs > 0 || avatarHit.totalDocs > 0 || socialHit.totalDocs > 0) {
    return true
  }

  const posts = await payload.find({
    collection: 'posts',
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
    user,
  })

  if (posts.docs.some((post) => hasMediaInLexical(post.content, mediaID))) {
    return true
  }

  const versions = await payload.findVersions({
    collection: 'posts',
    depth: 0,
    limit: 500,
    overrideAccess: true,
    pagination: false,
    user,
  })

  return versions.docs.some((v) => hasMediaInLexical((v.version as unknown as Record<string, unknown>)?.content, mediaID))
}
