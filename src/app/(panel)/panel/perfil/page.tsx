import Image from 'next/image'

import { ProfileAvatarField } from '@/components/panel/ProfileAvatarField'
import { PanelSubmitButton } from '@/components/panel/PanelSubmitButton'
import { LogoutButton } from '@/components/panel/LogoutButton'
import { BioCharacterCount } from '@/components/panel/BioCharacterCount'
import { ExpertiseDomainField } from '@/components/panel/ExpertiseDomainField'
import { domains, getDomainCopy } from '@/data/domains'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Admin, Media } from '@/payload-types'

import { changePasswordAction, updateProfileAction } from './actions'

type PanelSearchParams = Record<string, string | string[] | undefined>

type Props = {
  searchParams: Promise<PanelSearchParams>
}

/* ── Inline SVG icons ─────────────────────────────────────────────────── */

function IconUser() {
  return (
    <svg aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-7.5 7.5a7.5 7.5 0 0 1 15 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconMail() {
  return (
    <svg aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="14" rx="3" width="18" x="3" y="5" />
      <path d="m3 7 8.3 5.2a1.5 1.5 0 0 0 1.4 0L21 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconBriefcase() {
  return (
    <svg aria-hidden="true" className="h-[1.1rem] w-[1.1rem]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="13" rx="3" width="18" x="3" y="7" />
      <path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7" strokeLinecap="round" />
    </svg>
  )
}

function IconCalendar() {
  return (
    <svg aria-hidden="true" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <rect height="16" rx="3" width="16" x="4" y="4" />
      <path d="M4 10h16M9 2v4M15 2v4" strokeLinecap="round" />
    </svg>
  )
}

function IconShield() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M12 3 4 7v4.5c0 4.86 3.41 9.4 8 10.5 4.59-1.1 8-5.64 8-10.5V7l-8-4Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLogout() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export default async function PanelProfilePage({ searchParams }: Props) {
  const { payload, user } = await getPanelSession()
  const profile = (await payload.findByID({
    collection: 'admins',
    depth: 1,
    id: user.id,
    overrideAccess: false,
    user,
  })) as Admin & { avatar?: Media | null | string }
  const params = await searchParams
  const status = Array.isArray(params.estado) ? params.estado[0] : params.estado

  const memberSince = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.createdAt))

  const alert =
    status === 'guardado'
      ? {
          className:
            'border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.06)] text-[var(--color-blue-600)]',
          icon: (
            <svg aria-hidden="true" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          ),
          text: 'Perfil actualizado correctamente.',
        }
      : status === 'invalido'
        ? {
            className:
              'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
            icon: (
              <svg aria-hidden="true" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
              </svg>
            ),
            text: 'Nombre y email son obligatorios.',
          }
        : status === 'avatar-error' || status === 'avatar-size' || status === 'avatar-type'
          ? {
              className:
                'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
              icon: (
                <svg aria-hidden="true" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              ),
              text: 'La foto no es válida o supera el límite de 5 MB.',
            }
          : status === 'perfil-limite'
          ? {
              className:
                'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
              icon: (
                <svg aria-hidden="true" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              ),
              text: 'La biografía admite hasta 320 caracteres y puedes seleccionar hasta 3 dominios.',
            }
          : status === 'error'
          ? {
              className:
                'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
              icon: (
                <svg aria-hidden="true" className="h-4 w-4 flex-none" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
                </svg>
              ),
              text: 'No se pudieron guardar los cambios. Revisa si el email ya esta en uso.',
            }
          : null

  const passwordAlert =
    status === 'password-guardado'
      ? 'Contraseña actualizada correctamente.'
      : status === 'password-invalido'
        ? 'Usa una contraseña de al menos 12 caracteres y confirma el mismo valor.'
        : status === 'password-error'
          ? 'La contraseña actual no es correcta o no se pudo completar el cambio.'
          : null

  const firstName = user.name.split(' ')[0] || 'W'
  const initial = firstName.slice(0, 1).toUpperCase()
  const avatarID = typeof profile.avatar === 'string' ? profile.avatar : profile.avatar?.id || null
  const avatarURL = typeof profile.avatar === 'object' ? getMediaURL(profile.avatar, 'avatar') : null
  const expertiseDomains = profile.expertiseDomains || []
  const showOnTeam = profile.showOnTeam !== false

  return (
    <div className="grid content-start gap-6 md:gap-8" id="contenido-panel">
      {/* ── Writer hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#07142d_0%,#0b1d3d_56%,#10254f_100%)] p-5 text-white shadow-[0_24px_60px_rgba(7,20,45,0.22)] md:px-7 md:py-6">
        {/* Decorative gradient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(88,217,255,0.14),transparent_46%),radial-gradient(circle_at_15%_90%,rgba(255,90,24,0.16),transparent_42%)]" />

        {/* Signal bar */}
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--txdx-orange)_0_20%,transparent_46%_74%,var(--txdx-cyan))]" />

        <div className="relative z-10 flex flex-col items-center gap-4 text-center md:flex-row md:gap-6 md:text-left">
          {/* Avatar */}
          <div className="relative flex-none">
            <div className="relative grid h-[4.5rem] w-[4.5rem] place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] font-display text-2xl font-extrabold tracking-[-0.04em] text-white shadow-[0_14px_40px_rgba(255,90,24,0.3)]">
              {avatarURL ? (
                <Image alt={`Foto de perfil de ${user.name}`} className="object-cover" fill sizes="72px" src={avatarURL} />
              ) : (
                initial
              )}
            </div>
            {/* Online dot */}
            <span aria-hidden="true" className="absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-[#0b1d3d] bg-emerald-400 shadow-[0_0_0_3px_rgba(52,211,153,0.3)]" />
          </div>

          {/* Identity */}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-[clamp(1.4rem,2.5vw,2rem)] font-extrabold leading-[1.08] tracking-[-0.05em]">
              {user.name}
            </h1>
            {user.publicTitle ? (
              <p className="mt-1 text-sm font-semibold text-[var(--txdx-cyan)]">{user.publicTitle}</p>
            ) : null}
            <p className="mt-2 max-w-lg text-[0.82rem] leading-relaxed text-white/68">
              Tu identidad editorial aparece como firma publica en cada articulo.
            </p>
          </div>

          {/* Member badge */}
          <div className="flex flex-none items-center gap-2 rounded-full border border-white/12 bg-white/8 px-3.5 py-1.5 text-[0.82rem] font-bold text-white/90 backdrop-blur-md">
            <IconCalendar />
            <span>Desde {memberSince}</span>
          </div>
        </div>
      </section>

      {/* ── Bottom grid: form + security ────────────────────────────── */}
      <div className="grid items-start gap-6 md:gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Form section */}
        <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.05)] md:p-6">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[rgba(18,104,255,0.08)] text-[var(--txdx-blue)]">
              <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M15.232 5.232a2.828 2.828 0 1 1 4 4L7.5 20.964H3.5v-4L15.232 5.232Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h2 className="font-display text-base font-extrabold tracking-[-0.04em] text-[var(--txdx-navy)]">
              Editar firma publica
            </h2>
          </div>

          {alert ? (
            <div className={`mt-4 flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-semibold ${alert.className}`}>
              {alert.icon}
              {alert.text}
            </div>
          ) : null}

          <form action={updateProfileAction} className="mt-4 grid gap-4">
            <ProfileAvatarField initialId={avatarID} initialURL={avatarURL} name={user.name} />
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-[0.82rem] font-bold text-[var(--txdx-navy)]">Nombre publico</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]">
                    <IconUser />
                  </span>
                  <input
                    className="min-h-11 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                    defaultValue={user.name}
                    name="name"
                    required
                    type="text"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[0.82rem] font-bold text-[var(--txdx-navy)]">Email de acceso</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]">
                    <IconMail />
                  </span>
                  <input
                    className="min-h-11 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                    defaultValue={user.email}
                    name="email"
                    required
                    type="email"
                  />
                </div>
              </label>
            </div>

            <label className="block">
              <span className="mb-1.5 block text-[0.82rem] font-bold text-[var(--txdx-navy)]">Cargo publico</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-elevation-400)]">
                  <IconBriefcase />
                </span>
                <input
                  className="min-h-11 w-full rounded-xl border border-[var(--theme-elevation-200)] bg-white py-2.5 pl-10 pr-3.5 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                   defaultValue={user.publicTitle || ''}
                   maxLength={80}
                   name="publicTitle"
                  placeholder="Ej.: Ingeniero de seguridad"
                  type="text"
                />
              </div>
              <span className="mt-1.5 block text-[0.78rem] leading-5 text-[var(--theme-elevation-500)]">
                Aparece junto a tu nombre en el articulo publicado.
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-[0.82rem] font-bold text-[var(--txdx-navy)]">Biografía pública</span>
              <BioCharacterCount defaultValue={profile.publicBio || ''} />
              <span className="mt-1.5 block text-[0.78rem] leading-5 text-[var(--theme-elevation-500)]">
                Se muestra en tu perfil público del equipo. Máximo 320 caracteres.
              </span>
            </label>

            <fieldset className="rounded-xl border border-[var(--theme-elevation-200)] p-3.5">
              <legend className="px-1 text-[0.82rem] font-bold text-[var(--txdx-navy)]">Dominios XOC que dominas</legend>
              <ExpertiseDomainField
                domains={domains.map((domain) => ({ id: domain.id, name: getDomainCopy(domain, 'es').name }))}
                selected={expertiseDomains}
              />
            </fieldset>

            <label className="flex items-start gap-2 rounded-xl border border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.04)] px-3.5 py-3 text-[0.8rem] text-[var(--theme-elevation-700)]">
              <input
                className="mt-0.5 accent-[var(--txdx-blue)]"
                defaultChecked={showOnTeam}
                name="showOnTeam"
                type="checkbox"
              />
              <span>
                <strong className="block text-[var(--txdx-navy)]">Mostrar mi perfil en Equipo</strong>
                <span className="mt-0.5 block leading-5">Solo se publicarán estos datos editoriales, nunca tu email ni información de acceso.</span>
              </span>
            </label>

            <div className="pt-1">
              <PanelSubmitButton pendingLabel="Guardando cambios...">Guardar perfil</PanelSubmitButton>
            </div>
          </form>
        </section>

        {/* Security card */}
        <aside className="grid content-start gap-5">
          <section className="relative overflow-hidden rounded-[1.3rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,#07142d_0%,#0f2348_100%)] p-4 text-white shadow-[0_20px_50px_rgba(7,20,45,0.22)]" id="seguridad">
            {/* Decorative orb */}
            <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(88,217,255,0.12),transparent_70%)]" />

            <div className="relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/12 bg-white/8 text-[var(--txdx-cyan)]">
                  <IconShield />
                </span>
                <h2 className="font-display text-[0.95rem] font-extrabold tracking-[-0.04em]">
                  Seguridad y acceso
                </h2>
              </div>

              <p className="mt-3 text-[0.82rem] leading-5 text-white/68">
                Cambia tu contraseña temporal desde este mismo panel editorial.
              </p>

              {passwordAlert ? (
                <p className="mt-3 rounded-xl border border-white/12 bg-white/8 px-3 py-2 text-xs leading-5 text-white/82">{passwordAlert}</p>
              ) : null}

              <form action={changePasswordAction} className="mt-4 grid gap-2.5">
                <label className="grid gap-1 text-xs font-bold text-white/72">
                  Contraseña actual
                  <input autoComplete="current-password" className="min-h-10 rounded-xl border border-white/12 bg-white/8 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--txdx-cyan)]" name="currentPassword" required type="password" />
                </label>
                <label className="grid gap-1 text-xs font-bold text-white/72">
                  Nueva contraseña
                  <input autoComplete="new-password" className="min-h-10 rounded-xl border border-white/12 bg-white/8 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--txdx-cyan)]" minLength={12} name="newPassword" required type="password" />
                </label>
                <label className="grid gap-1 text-xs font-bold text-white/72">
                  Confirmar contraseña
                  <input autoComplete="new-password" className="min-h-10 rounded-xl border border-white/12 bg-white/8 px-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[var(--txdx-cyan)]" minLength={12} name="confirmPassword" required type="password" />
                </label>
                <PanelSubmitButton pendingLabel="Actualizando...">Actualizar contraseña</PanelSubmitButton>
              </form>

              <div className="mt-2.5 grid gap-2">
                <LogoutButton
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/14 px-3.5 text-[0.82rem] font-bold text-white/78 transition hover:bg-white/8 hover:text-white"
                >
                  <IconLogout />
                </LogoutButton>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
