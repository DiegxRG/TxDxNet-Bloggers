'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { isAllowedAdminEmail, isOwner, type AdminRole } from '@/access'
import { getPanelSession } from '@/modules/panel/server/session'

export async function updateUsersAction(formData: FormData) {
  const { payload, user } = await getPanelSession()
  if (!isOwner(user)) redirect('/panel')

  const ids = String(formData.get('userIds') || '').split(',').filter(Boolean)

  try {
    for (const id of ids) {
      const roleValue = String(formData.get(`role-${id}`) || '')
      if (!['owner', 'editor'].includes(roleValue)) continue
      const target = await payload.findByID({ collection: 'admins', id, depth: 0, user })
      if (!isAllowedAdminEmail(target.email)) continue

      await payload.update({
        collection: 'admins',
        id,
        data: { isActive: formData.get(`active-${id}`) === 'true', role: roleValue as AdminRole },
        user,
      })
    }
  } catch {
    redirect('/panel/usuarios?estado=usuario-error')
  }

  revalidatePath('/panel/usuarios')
  redirect('/panel/usuarios?estado=usuarios-guardados')
}

export async function createUserAction(formData: FormData) {
  const { payload, user } = await getPanelSession()
  if (!isOwner(user)) redirect('/panel')

  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const role = String(formData.get('role') || 'editor')
  const password = String(formData.get('password') || '')

  if (!name || !isAllowedAdminEmail(email) || !['owner', 'editor'].includes(role) || password.length < 12) {
    redirect('/panel/usuarios?estado=usuario-invalido')
  }

  try {
    await payload.create({
      collection: 'admins',
      data: { email, isActive: true, mustChangePassword: true, name, password, role: role as AdminRole },
      user,
    })
  } catch {
    redirect('/panel/usuarios?estado=usuario-error')
  }

  revalidatePath('/panel/usuarios')
  redirect('/panel/usuarios?estado=usuario-creado')
}

export async function deleteUserAction(formData: FormData) {
  const { payload, user } = await getPanelSession()
  if (!isOwner(user)) redirect('/panel')

  const id = String(formData.get('id') || '')
  if (!id || id === String(user.id)) redirect('/panel/usuarios?estado=usuario-error')

  try {
    const target = await payload.findByID({ collection: 'admins', id, depth: 0, user })
    if (!isAllowedAdminEmail(target.email)) redirect('/panel/usuarios?estado=usuario-error')
    await payload.delete({ collection: 'admins', id, user })
  } catch {
    redirect('/panel/usuarios?estado=usuario-error')
  }

  revalidatePath('/panel/usuarios')
  redirect('/panel/usuarios?estado=usuario-eliminado')
}
