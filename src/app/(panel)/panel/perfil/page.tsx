import Link from 'next/link'

import { PanelSubmitButton } from '@/components/panel/PanelSubmitButton'
import { getPanelSession } from '@/modules/panel/server/session'

import { updateProfileAction } from './actions'

type PanelSearchParams = Record<string, string | string[] | undefined>

type Props = {
  searchParams: Promise<PanelSearchParams>
}

export default async function PanelProfilePage({ searchParams }: Props) {
  const { payload, user } = await getPanelSession()
  const params = await searchParams
  const status = Array.isArray(params.estado) ? params.estado[0] : params.estado

  const [drafts, published, total] = await Promise.all([
    payload.count({
      collection: 'posts',
      overrideAccess: false,
      user,
      where: {
        and: [{ _status: { equals: 'draft' } }, { createdBy: { equals: user.id } }],
      },
    }),
    payload.count({
      collection: 'posts',
      overrideAccess: false,
      user,
      where: {
        and: [{ _status: { equals: 'published' } }, { createdBy: { equals: user.id } }],
      },
    }),
    payload.count({
      collection: 'posts',
      overrideAccess: false,
      user,
      where: { createdBy: { equals: user.id } },
    }),
  ])

  const memberSince = new Intl.DateTimeFormat('es-PE', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(user.createdAt))

  const alert =
    status === 'guardado'
      ? {
          className:
            'border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.06)] text-[var(--color-blue-600)]',
          text: 'Perfil actualizado correctamente.',
        }
      : status === 'invalido'
        ? {
            className:
              'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
            text: 'Nombre y email son obligatorios.',
          }
        : status === 'error'
          ? {
              className:
                'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
              text: 'No se pudieron guardar los cambios. Revisa si el email ya esta en uso.',
            }
          : null

  return (
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.78fr]" id="contenido-panel">
      <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_20px_50px_rgba(7,20,45,0.06)] md:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
          Perfil editorial
        </p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[clamp(2rem,3vw,3rem)] font-extrabold tracking-[-0.06em] text-[var(--txdx-navy)]">
              {user.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--theme-elevation-600)]">
              Esta informacion se usa en la firma publica de tus articulos.
            </p>
          </div>

          <div className="rounded-2xl border border-[rgba(18,104,255,0.08)] bg-[rgba(18,104,255,0.04)] px-4 py-3 text-sm font-semibold text-[var(--theme-elevation-600)]">
            Activo desde {memberSince}
          </div>
        </div>

        {alert ? (
          <div className={`mt-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${alert.className}`}>
            {alert.text}
          </div>
        ) : null}

        <form action={updateProfileAction} className="mt-6 grid gap-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Nombre publico</span>
              <input
                className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                defaultValue={user.name}
                name="name"
                required
                type="text"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Email de acceso</span>
              <input
                className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                defaultValue={user.email}
                name="email"
                required
                type="email"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Cargo publico</span>
            <input
              className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
              defaultValue={user.publicTitle || ''}
              name="publicTitle"
              placeholder="Ej.: Ingeniero de seguridad"
              type="text"
            />
            <span className="mt-2 block text-sm leading-6 text-[var(--theme-elevation-500)]">
              Aparece junto a tu nombre en el articulo publicado.
            </span>
          </label>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <PanelSubmitButton pendingLabel="Guardando cambios...">Guardar perfil</PanelSubmitButton>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--theme-elevation-200)] px-5 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]"
              href="/admin/account"
              prefetch={false}
            >
              Abrir seguridad avanzada
            </Link>
          </div>
        </form>
      </section>

      <aside className="grid gap-5">
        <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_20px_50px_rgba(7,20,45,0.06)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
            Tu huella editorial
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
                Total de piezas
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                {total.totalDocs}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
                Publicadas
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                {published.totalDocs}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
                Borradores
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                {drafts.totalDocs}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.35rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(180deg,#07142d_0%,#0f2348_100%)] p-5 text-white shadow-[0_24px_60px_rgba(7,20,45,0.24)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--txdx-cyan)]">
            Seguridad y acceso
          </p>
          <h2 className="mt-2.5 font-display text-[1.2rem] font-extrabold tracking-[-0.05em]">Seguridad</h2>
          <p className="mt-3 text-sm leading-5 text-white/74">Password y ajustes sensibles siguen en Payload.</p>
          <div className="mt-4 grid gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-4 text-sm font-extrabold text-[var(--txdx-navy)] transition hover:-translate-y-0.5"
              href="/admin/account"
              prefetch={false}
            >
              Gestionar password y seguridad
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/14 px-4 text-sm font-bold text-white/78 transition hover:bg-white/8 hover:text-white"
              href="/admin/logout"
              prefetch={false}
            >
              Cerrar sesion
            </Link>
          </div>
        </section>
      </aside>
    </div>
  )
}
