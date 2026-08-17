'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { getPanelSession } from '@/modules/panel/server/session'

export async function updateProfileAction(formData: FormData) {
  const { payload, user } = await getPanelSession()

  const name = formData.get('name')?.toString().trim() || ''
  const email = formData.get('email')?.toString().trim() || ''
  const publicTitle = formData.get('publicTitle')?.toString().trim() || ''

  if (!name || !email) {
    redirect('/panel/perfil?estado=invalido')
  }

  try {
    await payload.update({
      collection: 'admins',
      data: {
        email,
        name,
        publicTitle: publicTitle || null,
      },
      id: user.id,
      overrideAccess: false,
      user,
    })
  } catch {
    redirect('/panel/perfil?estado=error')
  }

  revalidatePath('/panel')
  revalidatePath('/panel/perfil')
  redirect('/panel/perfil?estado=guardado')
}
