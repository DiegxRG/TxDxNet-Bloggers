import { redirect } from 'next/navigation'
import type { Where } from 'payload'

import { isOwner } from '@/access'
import { getPanelSession } from '@/modules/panel/server/session'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const actions = [
  ['all', 'Todas las acciones'],
  ['auth.login', 'Inicio de sesión'],
  ['auth.login_failed', 'Login fallido'],
  ['admin.created', 'Admin creado'],
  ['admin.updated', 'Admin actualizado'],
  ['admin.deleted', 'Admin eliminado'],
  ['post.created', 'Artículo creado'],
  ['post.updated', 'Artículo actualizado'],
  ['post.published', 'Artículo publicado'],
  ['post.unpublished', 'Artículo retirado'],
  ['post.deleted', 'Artículo eliminado'],
  ['media.deleted', 'Media eliminada'],
] as const

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || ''
}

export default async function PanelAuditPage({ searchParams }: Props) {
  const { payload, user } = await getPanelSession()
  if (!isOwner(user)) redirect('/panel')

  const params = await searchParams
  const action = firstParam(params.action)
  const actor = firstParam(params.actor)
  const page = Math.max(1, Number.parseInt(firstParam(params.page) || '1', 10) || 1)
  const conditions: Where[] = []
  if (action && action !== 'all') conditions.push({ action: { equals: action } })
  if (actor) conditions.push({ actorEmail: { contains: actor } })

  const events = await payload.find({
    collection: 'audit-logs',
    depth: 0,
    limit: 25,
    page,
    overrideAccess: false,
    sort: '-createdAt',
    user,
    ...(conditions.length ? { where: { and: conditions } } : {}),
  })
  const currentPage = events.page || page

  const buildPageURL = (nextPage: number) => {
    const query = new URLSearchParams()
    if (action) query.set('action', action)
    if (actor) query.set('actor', actor)
    query.set('page', String(nextPage))
    return `/panel/auditoria?${query.toString()}`
  }

  return (
    <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6" id="contenido-panel">
      <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[var(--txdx-orange)]">Solo owners</p>
       <div className="flex flex-wrap items-end justify-between gap-4">
         <div>
           <h2 className="mt-1.5 font-display text-[1.4rem] font-extrabold tracking-[-0.04em] text-[var(--txdx-navy)]">Auditoría administrativa</h2>
           <p className="mt-1 text-sm text-[var(--theme-elevation-500)]">{events.totalDocs} eventos registrados. Se muestran 25 por página.</p>
         </div>
         <form className="flex flex-wrap items-center gap-2" method="get">
           <label>
             <span className="sr-only">Filtrar por acción</span>
             <select className="min-h-10 rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3 text-xs font-semibold text-[var(--theme-elevation-700)]" defaultValue={action || 'all'} name="action">
               {actions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
             </select>
           </label>
           <label>
             <span className="sr-only">Filtrar por correo</span>
             <input className="min-h-10 w-52 rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3 text-xs text-[var(--theme-elevation-700)]" defaultValue={actor} name="actor" placeholder="Correo del actor" type="search" />
           </label>
           <button className="min-h-10 rounded-xl bg-[var(--txdx-navy)] px-4 text-xs font-bold text-white" type="submit">Filtrar</button>
         </form>
       </div>
       <div className="mt-5 grid gap-3">
         {events.docs.length ? events.docs.map((event) => (
          <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4" key={event.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-[var(--txdx-navy)]">{event.action}</p>
              <time className="text-xs text-[var(--theme-elevation-500)]" dateTime={event.createdAt}>
                {new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(event.createdAt))}
              </time>
            </div>
            <p className="mt-1 text-sm text-[var(--theme-elevation-600)]">{event.summary}</p>
            <p className="mt-2 text-xs text-[var(--theme-elevation-500)]">{event.actorEmail}</p>
          </div>
         )) : <p className="rounded-2xl border border-dashed border-[var(--theme-elevation-200)] p-6 text-sm text-[var(--theme-elevation-500)]">No hay eventos con estos filtros.</p>}
       </div>
       {events.totalPages > 1 ? (
         <nav aria-label="Paginación de auditoría" className="mt-5 flex items-center justify-between border-t border-[var(--theme-elevation-150)] pt-4 text-sm">
           {events.hasPrevPage ? <a className="font-bold text-[var(--color-blue-600)]" href={buildPageURL(currentPage - 1)}>← Anteriores</a> : <span />}
           <span className="text-xs text-[var(--theme-elevation-500)]">Página {currentPage} de {events.totalPages}</span>
           {events.hasNextPage ? <a className="font-bold text-[var(--color-blue-600)]" href={buildPageURL(currentPage + 1)}>Siguientes →</a> : <span />}
         </nav>
       ) : null}
    </section>
  )
}
