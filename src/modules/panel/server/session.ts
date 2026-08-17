import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { cache } from 'react'

import type { Admin } from '@/payload-types'

import { startPanelMeasure } from './perf'

export const getPanelPayload = cache(async () => getPayload({ config: configPromise }))

async function getAuthHeaders() {
  const [headerList, cookieStore] = await Promise.all([headers(), cookies()])
  const authHeaders = new Headers(headerList)

  if (!authHeaders.get('cookie')) {
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ')

    if (cookieHeader) {
      authHeaders.set('cookie', cookieHeader)
    }
  }

  return authHeaders
}

export const getPanelSession = cache(async () => {
  const measure = startPanelMeasure('auth')
  const payload = await getPanelPayload()
  const authHeaders = await getAuthHeaders()
  const authResult = await payload.auth({
    headers: authHeaders,
  })
  const adminCollection = payload.config.admin.user
  const user = authResult.user as Admin | null

  if (!user || user.collection !== adminCollection) {
    measure.end({ authenticated: false })
    redirect(`/admin/login?redirect=${encodeURIComponent('/panel')}`)
  }

  measure.end({ authenticated: true, userID: user.id })
  return { payload, user }
})
