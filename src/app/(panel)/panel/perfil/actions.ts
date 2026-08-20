'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'

import { getPanelSession } from '@/modules/panel/server/session'
import { isMediaReferenced } from '@/modules/panel/server/media-references'
import { domains } from '@/data/domains'
import type { Admin } from '@/payload-types'

type PanelSession = Awaited<ReturnType<typeof getPanelSession>>
type PanelPayload = PanelSession['payload']
type PanelUser = PanelSession['user']

const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024

function asString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() || ''
}

function asDomainIDs(formData: FormData) {
  type ExpertiseDomain = NonNullable<Admin['expertiseDomains']>[number]
  const allowed = new Set(domains.map((domain) => domain.id) as ExpertiseDomain[])
  return formData.getAll('expertiseDomains').map(String).filter((id): id is ExpertiseDomain => allowed.has(id as ExpertiseDomain))
}

async function validateAvatar(payload: PanelPayload, id: string, user: PanelUser) {
  if (!id) return null

  const media = await payload.findByID({
    collection: 'media',
    depth: 0,
    id,
    overrideAccess: false,
    user,
  })

  if (!media.mimeType?.startsWith('image/')) throw new Error('avatar-type')
  if ((media.filesize || 0) > MAX_AVATAR_FILE_SIZE) throw new Error('avatar-size')

  return String(media.id)
}

function relationID(value: unknown) {
  if (typeof value === 'string') return value
  if (value && typeof value === 'object' && 'id' in value) return String(value.id)
  return null
}

async function removeUnusedAvatar(payload: PanelPayload, user: PanelUser, mediaID: string | null) {
  if (!mediaID) return

  try {
    if (await isMediaReferenced(payload, user, mediaID)) return
    await payload.delete({ collection: 'media', id: mediaID, overrideAccess: true, user })
  } catch {
    // Never fail the profile save because cleanup is best-effort.
  }
}

async function backfillAvatar(payload: PanelPayload, user: PanelUser, avatarID: string) {
  try {
    const posts = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 1000,
      overrideAccess: false,
      pagination: false,
      user,
      where: {
        and: [{ createdBy: { equals: user.id } }, { authorAvatar: { exists: false } }],
      },
    })

    await Promise.all(
      posts.docs.map((post) =>
        payload.update({
          collection: 'posts',
          data: { authorAvatar: avatarID },
          id: post.id,
          overrideAccess: false,
          user,
        }),
      ),
    )
  } catch {
    // The profile update remains successful if historical snapshots need a retry.
  }
}

export async function updateProfileAction(formData: FormData) {
  const { payload, user } = await getPanelSession()

  const name = asString(formData, 'name')
  const email = asString(formData, 'email')
  const publicTitle = asString(formData, 'publicTitle')
  const publicBio = asString(formData, 'publicBio')
  const expertiseDomains = asDomainIDs(formData)
  const showOnTeam = formData.get('showOnTeam') === 'on'
  const avatarID = asString(formData, 'avatar')

  if (!name || !email) {
    redirect('/panel/perfil?estado=invalido')
  }

  try {
    const currentProfile = await payload.findByID({
      collection: 'admins',
      depth: 0,
      id: user.id,
      overrideAccess: false,
      user,
    })
    const previousAvatarID = relationID(currentProfile.avatar)
    const validatedAvatarID = await validateAvatar(payload, avatarID, user)

    if (validatedAvatarID) {
      await payload.update({
        collection: 'media',
        data: { purpose: 'avatar' },
        id: validatedAvatarID,
        overrideAccess: false,
        user,
      })
    }

    await payload.update({
      collection: 'admins',
      data: {
        avatar: validatedAvatarID,
        email,
        expertiseDomains,
        name,
        publicBio: publicBio || null,
        publicTitle: publicTitle || null,
        showOnTeam,
      },
      id: user.id,
      overrideAccess: false,
      user,
    })

    if (validatedAvatarID) await backfillAvatar(payload, user, validatedAvatarID)
    if (previousAvatarID && previousAvatarID !== validatedAvatarID) {
      await removeUnusedAvatar(payload, user, previousAvatarID)
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : ''
    console.error('[panel] perfil:avatar-error', {
      code,
      avatarID: avatarID || null,
    })
    const status = code === 'avatar-size' ? 'avatar-size' : code === 'avatar-type' ? 'avatar-type' : avatarID ? 'avatar-error' : 'error'
    redirect(`/panel/perfil?estado=${status}`)
  }

  revalidatePath('/panel')
  revalidatePath('/panel/perfil')
  revalidatePath('/equipo')
  revalidateTag('team-members', 'hours')
  redirect('/panel/perfil?estado=guardado')
}
