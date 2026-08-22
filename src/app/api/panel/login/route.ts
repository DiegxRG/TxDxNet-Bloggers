import { NextResponse } from 'next/server'

import configPromise from '@payload-config'
import { generatePayloadCookie, getPayload } from 'payload'

import type { Admin } from '@/payload-types'

const INVALID_CREDENTIALS_MESSAGE = 'El correo o la contraseña no son válidos.'
const LOCKED_ACCOUNT_MESSAGE = 'La cuenta está temporalmente bloqueada. Intenta nuevamente más tarde.'
const UNAUTHORIZED_ACCOUNT_MESSAGE = 'La cuenta no está autorizada o se encuentra inactiva.'

type LoginErrorName = 'LockedAuth' | 'APIError'

function resolveLoginFailure(error: unknown): { status: number; message: string } {
  const apiError = error as { name?: LoginErrorName; message?: string; status?: number }
  const rawMessage = typeof apiError?.message === 'string' ? apiError.message : ''
  const normalizedMessage = rawMessage.toLowerCase()

  const isLockedAccount =
    apiError?.name === 'LockedAuth' || normalizedMessage.includes('locked') || normalizedMessage.includes('bloquead')
  if (isLockedAccount) {
    return { status: 423, message: LOCKED_ACCOUNT_MESSAGE }
  }

  if (rawMessage.includes('no autorizada')) {
    return { status: 403, message: UNAUTHORIZED_ACCOUNT_MESSAGE }
  }

  const upstreamStatus = typeof apiError?.status === 'number' ? apiError.status : 401
  if (upstreamStatus >= 500) {
    return { status: 500, message: 'No se pudo validar el acceso. Intenta nuevamente.' }
  }

  return { status: 401, message: INVALID_CREDENTIALS_MESSAGE }
}

function toPublicAdmin(user: Admin) {
  return {
    email: user.email,
    id: user.id,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    name: user.name,
    publicTitle: user.publicTitle ?? null,
    role: user.role,
  }
}

export async function POST(request: Request) {
  let email = ''
  let password = ''

  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown }
    if (typeof body?.email === 'string') email = body.email.trim().toLowerCase()
    if (typeof body?.password === 'string') password = body.password
  } catch {
    return NextResponse.json({ message: INVALID_CREDENTIALS_MESSAGE }, { status: 400 })
  }

  if (!email || !password) {
    return NextResponse.json({ message: INVALID_CREDENTIALS_MESSAGE }, { status: 400 })
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const adminsConfig = payload.collections.admins.config

    const result = await payload.login({
      collection: 'admins',
      data: { email, password },
      depth: 0,
    })

    if (!result.token || !result.user) {
      console.error('[panel] login: Payload Local API no devolvió token o usuario', { status: 500 })
      return NextResponse.json(
        { message: 'No se pudo establecer la sesión. Intenta nuevamente.' },
        { status: 500 },
      )
    }

    const setCookie = generatePayloadCookie({
      collectionAuthConfig: adminsConfig.auth,
      cookiePrefix: payload.config.cookiePrefix,
      token: result.token,
    })

    const responseHeaders = new Headers({ 'content-type': 'application/json' })
    responseHeaders.append('set-cookie', setCookie)

    return new NextResponse(JSON.stringify({ user: toPublicAdmin(result.user) }), {
      headers: responseHeaders,
      status: 200,
    })} catch (error) {
    const failure = resolveLoginFailure(error)
    console.error('[panel] login: fallo de autenticación', {
      errorName: error instanceof Error ? error.name : 'unknown',
      status: failure.status,
    })
    return NextResponse.json({ message: failure.message }, { status: failure.status })
  }
}
