import { NextResponse } from 'next/server'

import { isMediaReferenced } from '@/modules/panel/server/media-references'
import { getPanelSession } from '@/modules/panel/server/session'

type Props = {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: Request, { params }: Props) {
  const { payload, user } = await getPanelSession()
  const { id } = await params

  try {
    if (await isMediaReferenced(payload, user, id)) {
      return NextResponse.json(
        { error: 'media_in_use', message: 'Este archivo sigue referenciado por contenido editorial.' },
        { status: 409 },
      )
    }

    await payload.delete({
      collection: 'media',
      id,
      overrideAccess: false,
      user,
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('[panel] media:delete:error', error instanceof Error ? error.message : String(error))
    return NextResponse.json({ error: 'media_delete_failed' }, { status: 500 })
  }
}
