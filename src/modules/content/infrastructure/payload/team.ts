import 'server-only'

import configPromise from '@payload-config'
import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'

import type { Admin } from '@/payload-types'

export type PublicTeamMember = Pick<Admin, 'avatar' | 'expertiseDomains' | 'id' | 'name' | 'publicBio' | 'publicTitle'>

const publicTeamSelect = {
  id: true,
  name: true,
  publicTitle: true,
  publicBio: true,
  expertiseDomains: true,
  avatar: true,
} as const

const getPublicTeamMembersCached = unstable_cache(
  async (): Promise<PublicTeamMember[]> => {
    try {
      const config = await configPromise
      const payload = await getPayload({ config })
      const result = await payload.find({
        collection: 'admins',
        depth: 1,
        limit: 50,
        overrideAccess: true,
        pagination: false,
        select: publicTeamSelect,
        sort: 'name',
        where: { showOnTeam: { not_equals: false } },
      })

      return result.docs as PublicTeamMember[]
    } catch (error) {
      console.error('[team] No se pudieron cargar los perfiles públicos.', error)
      return []
    }
  },
  ['team-members'],
  { revalidate: 3600, tags: ['team-members'] },
)

export async function getPublicTeamMembers() {
  return getPublicTeamMembersCached()
}
