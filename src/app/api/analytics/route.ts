import crypto from 'node:crypto'

import configPromise from '@payload-config'
import { cookies } from 'next/headers'
import { after, NextResponse } from 'next/server'
import { getPayload } from 'payload'

const VISITOR_COOKIE = 'txdx_visitor'
const VISITOR_COOKIE_MAX_AGE = 90 * 24 * 60 * 60
const RETENTION_DAYS = 120
let lastCleanupAt = 0

function getLimaDay() {
  return new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Lima',
    year: 'numeric',
  }).format(new Date())
}

function isValidPath(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('/') && path.length <= 240 && !path.startsWith('//')
}

async function cleanupExpiredMetrics(payload: Awaited<ReturnType<typeof getPayload>>) {
  if (Date.now() - lastCleanupAt < 60 * 60 * 1000) return
  lastCleanupAt = Date.now()
  const before = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString()

  await Promise.all([
    payload.delete({ collection: 'analytics-events', overrideAccess: true, where: { createdAt: { less_than: before } } }),
    payload.delete({ collection: 'analytics-visitors', overrideAccess: true, where: { createdAt: { less_than: before } } }),
  ])
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const path = data?.path
    const types = Array.isArray(data?.types) ? [...new Set(data.types)] : [data?.type]

    if (
      !isValidPath(path) ||
      !types.length ||
      types.some((type) => type !== 'page_view' && type !== 'article_read')
    ) {
      return new NextResponse(null, { status: 400 })
    }
    if (path.startsWith('/admin') || path.startsWith('/panel') || path.startsWith('/articulos/preview/')) {
      return new NextResponse(null, { status: 204 })
    }

    const cookieStore = await cookies()
    const visitorCookie = cookieStore.get(VISITOR_COOKIE)?.value || crypto.randomUUID()
    const visitorHash = crypto.createHash('sha256').update(visitorCookie).digest('hex')
    const day = getLimaDay()
    after(async () => {
      try {
        const payload = await getPayload({ config: configPromise })
        await Promise.all([
          cleanupExpiredMetrics(payload),
          ...types.map((type) => payload.create({
            collection: 'analytics-events',
            data: { day, path, type },
            overrideAccess: true,
          })),
          payload.create({
            collection: 'analytics-visitors',
            data: { day, key: `${day}:${visitorHash}` },
            overrideAccess: true,
          }).catch(() => {
            // A duplicate visitor key is expected on subsequent page views that day.
          }),
        ])
      } catch (error) {
        console.error('[analytics] No se pudo registrar el evento.', error instanceof Error ? error.message : String(error))
      }
    })

    const response = new NextResponse(null, { status: 204 })
    if (!cookieStore.get(VISITOR_COOKIE)) {
      response.cookies.set({
        httpOnly: true,
        maxAge: VISITOR_COOKIE_MAX_AGE,
        name: VISITOR_COOKIE,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        value: visitorCookie,
      })
    }
    return response
  } catch (error) {
    console.error('[analytics] No se pudo registrar el evento.', error instanceof Error ? error.message : String(error))
    return new NextResponse(null, { status: 204 })
  }
}
