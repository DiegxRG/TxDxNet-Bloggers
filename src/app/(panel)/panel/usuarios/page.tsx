import { redirect } from 'next/navigation'
import Image from 'next/image'

import { isAllowedAdminEmail, isOwner } from '@/access'
import { ConfirmActionButton } from '@/components/panel/ConfirmActionButton'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { getPanelSession } from '@/modules/panel/server/session'

import { createUserAction, deleteUserAction, updateUsersAction } from './actions'

export default async function PanelUsersPage() {
  const { payload, user } = await getPanelSession()
  if (!isOwner(user)) redirect('/panel')

  const admins = await payload.find({ collection: 'admins', depth: 1, limit: 50, sort: 'name' })
  const allowedAdmins = admins.docs.filter((admin) => isAllowedAdminEmail(admin.email))
  const userIds = allowedAdmins.map((admin) => String(admin.id)).join(',')

  return (
    <div className="grid gap-5" id="contenido-panel">
      <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
        <div className="flex flex-col gap-4 border-b border-[var(--theme-elevation-150)] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-blue-500)]">
              <IconShield /> Solo owners
            </p>
            <h2 className="mt-1.5 font-display text-[1.4rem] font-extrabold tracking-[-0.04em] text-[var(--txdx-navy)]">Usuarios editoriales</h2>
            <p className="mt-2 text-sm text-[var(--theme-elevation-600)]">Crea cuentas y prepara cambios de rol o estado en una sola operación.</p>
          </div>
          <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--txdx-blue)] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5" form="usuarios-form" type="submit">
            <IconSave /> Guardar cambios
          </button>
        </div>

        <form action={createUserAction} className="mt-5 rounded-2xl border border-[rgba(18,104,255,0.16)] bg-[rgba(18,104,255,0.04)] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--color-blue-600)]">
                <IconUserPlus /> Nueva cuenta
              </p>
              <p className="mt-1 text-xs text-[var(--theme-elevation-600)]">Usa una contraseña temporal de mínimo 12 caracteres.</p>
            </div>
            <button className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border border-[var(--color-blue-500)] px-3 text-xs font-extrabold text-[var(--color-blue-600)] transition hover:bg-white" type="submit">
              <IconPlus /> Crear usuario
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <span className="relative block">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]"><IconUser /></span>
              <input className="min-h-10 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white pl-9 pr-3 text-sm" name="name" placeholder="Nombre completo" required />
            </span>
            <span className="relative block">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]"><IconMail /></span>
              <input className="min-h-10 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white pl-9 pr-3 text-sm" name="email" placeholder="correo@txdxsecure.com" required type="email" />
            </span>
            <span className="relative block">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]"><IconBriefcase /></span>
              <select className="min-h-10 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white pl-9 pr-3 text-sm" defaultValue="editor" name="role">
                <option value="editor">Editor</option>
                <option value="owner">Owner</option>
              </select>
            </span>
            <span className="relative block">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]"><IconLock /></span>
              <input className="min-h-10 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white pl-9 pr-3 text-sm" minLength={12} name="password" placeholder="Contraseña temporal" required type="password" />
            </span>
          </div>
        </form>
      </section>

      <form action={updateUsersAction} id="usuarios-form">
        <input name="userIds" type="hidden" value={userIds} />
      </form>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {allowedAdmins.map((admin) => {
            const avatarURL = getMediaURL(admin.avatar, 'avatar')
            return (
              <article className="relative rounded-[1.25rem] border border-[var(--theme-elevation-150)] bg-white p-4 shadow-[0_14px_36px_rgba(7,20,45,0.04)]" key={admin.id}>
                <form action={deleteUserAction} className="absolute right-3 top-3">
                  <input name="id" type="hidden" value={admin.id} />
                  <ConfirmActionButton
                    aria-label={`Eliminar la cuenta de ${admin.name}`}
                    className="grid h-8 w-8 place-items-center rounded-lg border border-transparent text-[var(--theme-elevation-400)] transition hover:border-[rgba(255,90,24,0.25)] hover:bg-[rgba(255,90,24,0.08)] hover:text-[var(--txdx-orange)]"
                    confirmLabel="Sí, eliminar cuenta"
                    message={`Se eliminará la cuenta de ${admin.name}. Esta acción no se puede deshacer.`}
                    title="Eliminar cuenta"
                  >
                    <IconTrash />
                  </ConfirmActionButton>
                </form>
                <div className="flex items-start gap-3">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] font-display text-xl font-extrabold text-white">
                    {avatarURL ? <Image alt={`Foto de ${admin.name}`} className="object-cover" fill sizes="56px" src={avatarURL} unoptimized /> : admin.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-[var(--txdx-navy)]">{admin.name}</p>
                    <p className="truncate text-sm text-[var(--theme-elevation-600)]">{admin.email}</p>
                    <p className="mt-1 text-xs text-[var(--theme-elevation-500)]">{admin.publicTitle || 'Sin cargo público'}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 border-t border-[var(--theme-elevation-150)] pt-4">
                  <label className="grid gap-1 text-xs font-bold text-[var(--theme-elevation-600)]">
                    <span className="inline-flex items-center gap-1.5">
                      <IconBriefcase /> Rol
                    </span>
                    <select className="min-h-10 rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3 text-sm font-bold text-[var(--txdx-navy)]" defaultValue={admin.role || 'editor'} form="usuarios-form" name={`role-${admin.id}`}>
                      <option value="editor">Editor</option>
                      <option value="owner">Owner</option>
                    </select>
                  </label>
                  <label className={`flex min-h-11 items-center justify-between rounded-xl border px-3 text-xs font-extrabold ${admin.isActive === false ? 'border-[rgba(255,90,24,0.25)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]' : 'border-[rgba(15,122,61,0.22)] bg-[rgba(15,122,61,0.08)] text-[#0f7a3d]'}`}>
                    <span className="inline-flex items-center gap-1.5">
                      {admin.isActive === false ? <IconXCircle /> : <IconCheckCircle />}
                      {admin.isActive === false ? 'Cuenta inactiva' : 'Cuenta activa'}
                    </span>
                    <input defaultChecked={admin.isActive !== false} form="usuarios-form" name={`active-${admin.id}`} type="checkbox" value="true" />
                  </label>
                </div>
              </article>
            )
          })}
      </div>
    </div>
  )
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg aria-hidden="true" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      {children}
    </svg>
  )
}

function IconShield() {
  return (
    <IconBase>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </IconBase>
  )
}

function IconSave() {
  return (
    <IconBase>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </IconBase>
  )
}

function IconUserPlus() {
  return (
    <IconBase>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </IconBase>
  )
}

function IconPlus() {
  return (
    <IconBase>
      <line x1="12" x2="12" y1="5" y2="19" />
      <line x1="5" x2="19" y1="12" y2="12" />
    </IconBase>
  )
}

function IconUser() {
  return (
    <IconBase>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </IconBase>
  )
}

function IconMail() {
  return (
    <IconBase>
      <rect height="16" rx="2" width="20" x="2" y="4" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </IconBase>
  )
}

function IconBriefcase() {
  return (
    <IconBase>
      <rect height="14" rx="2" width="20" x="2" y="7" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </IconBase>
  )
}

function IconLock() {
  return (
    <IconBase>
      <rect height="11" rx="2" ry="2" width="18" x="3" y="11" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </IconBase>
  )
}

function IconCheckCircle() {
  return (
    <IconBase>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </IconBase>
  )
}

function IconXCircle() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </IconBase>
  )
}

function IconTrash() {
  return (
    <IconBase>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </IconBase>
  )
}
