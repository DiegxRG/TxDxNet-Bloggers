'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getPanelSession } from '@/modules/panel/server/session'
import { isMediaReferenced } from '@/modules/panel/server/media-references'

function asString(formData: FormData, key: string) {
  return formData.get(key)?.toString().trim() || ''
}

function asNullableString(formData: FormData, key: string) {
  const value = asString(formData, key)
  return value || null
}

export async function updatePanelMediaAction(mediaID: string, formData: FormData) {
  const { payload, user } = await getPanelSession()

  try {
    await payload.update({
      collection: 'media',
      data: {
        alt: asNullableString(formData, 'alt'),
        caption: asNullableString(formData, 'caption'),
        credit: asNullableString(formData, 'credit'),
      },
      id: mediaID,
      overrideAccess: false,
      user,
    })
  } catch {
    redirect(`/panel/biblioteca/${mediaID}?estado=error`)
  }

  revalidatePath('/panel/biblioteca')
  revalidatePath(`/panel/biblioteca/${mediaID}`)
  redirect(`/panel/biblioteca/${mediaID}?estado=guardado`)
}

export async function deletePanelMediaAction(mediaID: string) {
  const { payload, user } = await getPanelSession()

  let referenced = false
  try {
    referenced = await isMediaReferenced(payload, user, mediaID)
  } catch {
    redirect(`/panel/biblioteca/${mediaID}?estado=error-eliminar`)
  }
  if (referenced) redirect(`/panel/biblioteca/${mediaID}?estado=error-en-uso`)

  try {
    await payload.delete({
      collection: 'media',
      id: mediaID,
      overrideAccess: false,
      user,
    })
  } catch {
    redirect(`/panel/biblioteca/${mediaID}?estado=error-eliminar`)
  }

  revalidatePath('/panel/biblioteca')
  redirect('/panel/biblioteca?estado=eliminado')
}
