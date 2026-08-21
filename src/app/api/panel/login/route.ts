import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.text()
  const upstreamURL = new URL('/api/admins/login', request.url)
  const upstream = await fetch(upstreamURL, {
    body,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    method: 'POST',
  })

  const responseHeaders = new Headers({ 'content-type': 'application/json' })
  const headersWithSetCookie = upstream.headers as Headers & { getSetCookie?: () => string[] }
  const setCookies = headersWithSetCookie.getSetCookie?.() || []

  const responseBody = await upstream.text()
  let upstreamMessage = ''
  try {
    const parsed = JSON.parse(responseBody) as { errors?: Array<{ message?: string }> }
    upstreamMessage = parsed.errors?.[0]?.message || ''
  } catch {
    // Keep authentication errors generic when Payload does not return JSON.
  }

  for (const cookie of setCookies) responseHeaders.append('set-cookie', cookie)

  if (!setCookies.length) {
    console.error('[panel] login: Payload no devolvió Set-Cookie', { status: upstream.status })
  }

  if (upstream.status >= 400) {
    const isUnauthorizedAccount = upstreamMessage.includes('no autorizada')
    const isLockedAccount = upstreamMessage.toLowerCase().includes('locked') || upstreamMessage.toLowerCase().includes('bloquead')
    const message = isLockedAccount
      ? 'La cuenta está temporalmente bloqueada. Intenta nuevamente más tarde.'
      : isUnauthorizedAccount
        ? 'La cuenta no está autorizada o se encuentra inactiva.'
        : 'El correo o la contraseña no son válidos.'
    const status = isLockedAccount ? 423 : isUnauthorizedAccount ? 403 : 401

    return NextResponse.json({ message }, { status })
  }

  return new NextResponse(responseBody, {
    headers: responseHeaders,
    status: upstream.status,
  })
}
