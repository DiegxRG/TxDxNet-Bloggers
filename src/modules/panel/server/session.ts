import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { cache } from 'react'

import type { Admin } from '@/payload-types'
import { isActiveAdmin } from '@/access'

import { startPanelMeasure } from './perf'

export const getPanelPayload = cache(async () => getPayload({ config: configPromise }))

async function getAuthHeaders() {
  const cookieStore = await cookies()
  const headerList = await headers()
  const authHeaders = new Headers(headerList)

  const requestCookies = cookieStore.getAll()
  const cookieHeader = requestCookies
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ')

  if (cookieHeader) {
    authHeaders.set('cookie', cookieHeader)
  }

  return authHeaders
}

export const getPanelSession = cache(async () => {
  const measure = startPanelMeasure('auth')
  await connection()
  const payload = await getPanelPayload()
  const authHeaders = await getAuthHeaders()
  const authResult = await payload.auth({
    headers: authHeaders,
  })
  const user = authResult.user as Admin | null

  if (!user || !isActiveAdmin(user)) {
    const cookieHeader = authHeaders.get('cookie') || ''
    measure.end({
      authenticated: false,
      reason: !user ? 'no-user' : 'inactive-or-not-allowlisted',
      hasCookie: Boolean(cookieHeader),
      hasPayloadCookie: /(?:^|;\s)[^=]+-token=/.test(cookieHeader),
    })
    redirect(`/panel/login?redirect=${encodeURIComponent('/panel')}`)
  }

  measure.end({ authenticated: true, userID: user.id })
  return { payload, user }
})
