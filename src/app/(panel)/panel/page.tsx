import Link from 'next/link'

import { getPanelSession } from '@/modules/panel/server/session'

// Icons
function IconPlus() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  )
}
function IconPen() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.89 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.89l12.67-12.67z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.862 4.487" />
    </svg>
  )
}
function IconCheck() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconFolder() {
  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
    </svg>
  )
}
function IconClock() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
function IconArrowRight() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
    </svg>
  )
}

export default async function PanelDashboardPage() {
  const { payload, user } = await getPanelSession()

  const [allPosts, draftPosts, publishedPosts, mediaCount, draftDocs, publishedDocs] = await Promise.all([
    payload.find({
      collection: 'posts',
      draft: true,
      limit: 1,
      overrideAccess: false,
      pagination: true,
      select: {},
      user,
    }),
    payload.find({
      collection: 'posts',
      draft: true,
      limit: 1,
      pagination: true,
      overrideAccess: false,
      select: {},
      user,
      where: { _status: { equals: 'draft' } },
    }),
    payload.find({
      collection: 'posts',
      draft: false,
      limit: 1,
      pagination: true,
      overrideAccess: false,
      select: {},
      user,
      where: { _status: { equals: 'published' } },
    }),
    payload.count({
      collection: 'media',
      overrideAccess: false,
      user,
      where: {
        and: [
          { mimeType: { not_equals: 'application/pdf' } },
          { or: [{ purpose: { equals: 'editorial' } }, { purpose: { exists: false } }] },
        ],
      },
    }),
    payload.find({
      collection: 'posts',
      draft: true,
      depth: 0,
      limit: 3,
      overrideAccess: false,
      select: { title: true, slug: true, updatedAt: true },
      sort: '-updatedAt',
      user,
      where: { _status: { equals: 'draft' } },
    }),
    payload.find({
      collection: 'posts',
      draft: false,
      depth: 0,
      limit: 4,
      overrideAccess: false,
      select: { title: true, slug: true, publishedAt: true, updatedAt: true },
      sort: '-publishedAt',
      user,
      where: { _status: { equals: 'published' } },
    }),
  ])

  const firstName = user.name.split(' ')[0] || 'equipo'

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      timeZone: 'America/Lima',
    }).format(new Date(value))

  return (
    <div className="grid content-start gap-6 md:gap-8" id="contenido-panel">
      {/* ── Hero Inmersivo ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[1.5rem] border border-[rgba(255,255,255,0.12)] bg-[linear-gradient(135deg,#07142d_0%,#0b1d3d_56%,#10254f_100%)] p-6 text-white shadow-[0_24px_60px_rgba(7,20,45,0.22)] md:px-8 md:py-8">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(88,217,255,0.14),transparent_46%),radial-gradient(circle_at_15%_90%,rgba(255,90,24,0.16),transparent_42%)]" />
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,var(--txdx-orange)_0_20%,transparent_46%_74%,var(--txdx-cyan))]" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div className="max-w-xl">
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-[var(--txdx-cyan)]">
              Consola editorial TxDx
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-[1.05] tracking-[-0.04em]">
              Publica con una <br className="hidden sm:block" />
              <span className="text-[var(--color-blue-300)]">vista mas clara</span>
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-white/70">
              Bienvenido, {firstName}. Todo lo importante del flujo editorial vive aqui.
            </p>
          </div>

          <div className="flex flex-none items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-sm font-bold text-white/90 backdrop-blur-md">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_0_2px_rgba(52,211,153,0.3)]" />
            {user.publicTitle || 'Administrador editorial'}
          </div>
        </div>
      </section>

      {/* ── Bento Box Acciones ─────────────────────────────────────────── */}
      <section aria-label="Acciones principales" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Nuevo Articulo */}
        <Link
          className="group relative overflow-hidden rounded-2xl border border-[rgba(255,90,24,0.28)] bg-[linear-gradient(135deg,#fff7f2,#ffffff)] p-4 shadow-[0_10px_26px_rgba(255,90,24,0.08)] transition hover:-translate-y-1 hover:border-[var(--txdx-orange)] hover:shadow-[0_16px_34px_rgba(255,90,24,0.16)]"
          href="/panel/articulos/nuevo"
        >
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-[linear-gradient(90deg,var(--txdx-orange),var(--color-blue-500))] opacity-0 transition group-hover:opacity-100" />
          <div className="flex items-center gap-4">
            <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] text-white shadow-[0_8px_20px_rgba(255,90,24,0.3)] transition group-hover:scale-105">
              <IconPlus />
            </span>
            <div>
              <strong className="block font-display text-base font-extrabold tracking-[-0.02em] text-[var(--txdx-navy)]">
                Nuevo articulo
              </strong>
              <small className="block mt-0.5 text-[0.7rem] font-bold text-[var(--theme-elevation-500)] uppercase tracking-[0.05em]">
                Empieza rapido
              </small>
            </div>
          </div>
        </Link>

        {/* Borradores */}
        <Link
          className="group relative overflow-hidden rounded-2xl border border-[var(--theme-elevation-150)] bg-white p-4 shadow-[0_6px_20px_rgba(7,20,45,0.03)] transition hover:-translate-y-1 hover:border-[var(--txdx-cyan)] hover:shadow-[0_12px_30px_rgba(7,20,45,0.08)]"
          href="/panel/articulos?status=draft"
        >
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-[var(--txdx-cyan)] opacity-0 transition group-hover:opacity-100" />
          <div className="flex items-center gap-4">
            <span className="relative grid h-12 w-12 flex-none place-items-center rounded-xl bg-[rgba(88,217,255,0.12)] text-[var(--txdx-cyan)] transition group-hover:scale-105 group-hover:bg-[rgba(88,217,255,0.2)]">
              <IconPen />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--txdx-navy)] px-1 text-[0.65rem] font-bold text-white ring-2 ring-white">
                {draftPosts.totalDocs}
              </span>
            </span>
            <div>
              <strong className="block font-display text-base font-extrabold tracking-[-0.02em] text-[var(--txdx-navy)]">
                Borradores
              </strong>
              <small className="block mt-0.5 text-[0.7rem] font-bold text-[var(--theme-elevation-500)] uppercase tracking-[0.05em]">
                Retoma pendientes
              </small>
            </div>
          </div>
        </Link>

        {/* Publicados */}
        <Link
          className="group relative overflow-hidden rounded-2xl border border-[var(--theme-elevation-150)] bg-white p-4 shadow-[0_6px_20px_rgba(7,20,45,0.03)] transition hover:-translate-y-1 hover:border-[var(--color-blue-400)] hover:shadow-[0_12px_30px_rgba(7,20,45,0.08)]"
          href="/panel/articulos?status=published"
        >
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-[var(--color-blue-400)] opacity-0 transition group-hover:opacity-100" />
          <div className="flex items-center gap-4">
            <span className="relative grid h-12 w-12 flex-none place-items-center rounded-xl bg-[rgba(18,104,255,0.1)] text-[var(--color-blue-600)] transition group-hover:scale-105 group-hover:bg-[rgba(18,104,255,0.15)]">
              <IconCheck />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--txdx-navy)] px-1 text-[0.65rem] font-bold text-white ring-2 ring-white">
                {publishedPosts.totalDocs}
              </span>
            </span>
            <div>
              <strong className="block font-display text-base font-extrabold tracking-[-0.02em] text-[var(--txdx-navy)]">
                Publicados
              </strong>
              <small className="block mt-0.5 text-[0.7rem] font-bold text-[var(--theme-elevation-500)] uppercase tracking-[0.05em]">
                Revisa produccion
              </small>
            </div>
          </div>
        </Link>

        {/* Biblioteca */}
        <Link
          className="group relative overflow-hidden rounded-2xl border border-[var(--theme-elevation-150)] bg-white p-4 shadow-[0_6px_20px_rgba(7,20,45,0.03)] transition hover:-translate-y-1 hover:border-[var(--theme-elevation-400)] hover:shadow-[0_12px_30px_rgba(7,20,45,0.08)]"
          href="/panel/biblioteca"
        >
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-[var(--theme-elevation-500)] opacity-0 transition group-hover:opacity-100" />
          <div className="flex items-center gap-4">
            <span className="relative grid h-12 w-12 flex-none place-items-center rounded-xl bg-[var(--theme-elevation-100)] text-[var(--theme-elevation-700)] transition group-hover:scale-105 group-hover:bg-[var(--theme-elevation-150)]">
              <IconFolder />
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--txdx-navy)] px-1 text-[0.65rem] font-bold text-white ring-2 ring-white">
                {mediaCount.totalDocs}
              </span>
            </span>
            <div>
              <strong className="block font-display text-base font-extrabold tracking-[-0.02em] text-[var(--txdx-navy)]">
                Biblioteca
              </strong>
              <small className="block mt-0.5 text-[0.7rem] font-bold text-[var(--theme-elevation-500)] uppercase tracking-[0.05em]">
                Activos listos
              </small>
            </div>
          </div>
        </Link>
      </section>

      {/* ── Main Grid ─────────────────────────────────────────────────── */}
      <div className="grid items-start gap-6 md:gap-8 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1.3fr_0.7fr]">

        {/* Columna Izquierda: Borradores y Publicados */}
        <div className="grid gap-6 md:gap-8">

          {/* Borradores Recientes */}
          <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--theme-elevation-150)] pb-4">
              <div>
                <h2 className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">
                  Borradores recientes
                </h2>
              </div>
              <Link
                className="group flex items-center gap-1.5 rounded-full bg-[var(--theme-elevation-50)] px-3 py-1.5 text-[0.75rem] font-bold text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-100)] hover:text-[var(--txdx-navy)]"
                href="/panel/articulos?status=draft"
              >
                Ver todos
                <span className="transition-transform group-hover:translate-x-0.5"><IconArrowRight /></span>
              </Link>
            </div>

            <div className="mt-4">
              {draftDocs.docs.length ? (
                <ul className="grid gap-2">
                  {draftDocs.docs.map((doc) => (
                    <li key={doc.id}>
                      <Link
                        className="group flex flex-col gap-2 rounded-xl border border-transparent p-3 transition hover:bg-[rgba(18,104,255,0.03)] hover:border-[var(--color-blue-150)] sm:flex-row sm:items-center sm:justify-between"
                        href={`/panel/articulos/${doc.id}`}
                        prefetch={false}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-[0.95rem] font-bold tracking-[-0.02em] text-[var(--txdx-navy)]">
                            {doc.title || 'Borrador sin titulo'}
                          </p>
                        </div>
                        <div className="flex flex-none items-center gap-3">
                          <span className="inline-flex items-center rounded-full bg-[rgba(255,90,24,0.1)] px-2 py-0.5 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-[var(--txdx-orange)]">
                            Borrador
                          </span>
                          <span className="flex items-center gap-1.5 text-[0.75rem] font-semibold text-[var(--theme-elevation-500)]">
                            <IconClock />
                            <time>{formatDate(doc.updatedAt)}</time>
                          </span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--theme-elevation-200)] p-6 text-center">
                  <p className="text-sm font-semibold text-[var(--theme-elevation-500)]">No tienes borradores activos.</p>
                </div>
              )}
            </div>
          </section>

          {/* Ultimos Articulos Publicados */}
          <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--theme-elevation-150)] pb-4">
              <div>
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-blue-500)]">
                  Publicacion reciente
                </p>
                <h2 className="mt-1.5 font-display text-[1.2rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">
                  Ultimos publicados
                </h2>
              </div>
              <Link
                className="group flex items-center gap-1.5 rounded-full bg-[var(--theme-elevation-50)] px-3 py-1.5 text-[0.75rem] font-bold text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-100)] hover:text-[var(--txdx-navy)]"
                href="/panel/articulos?status=published"
              >
                Ver todos
                <span className="transition-transform group-hover:translate-x-0.5"><IconArrowRight /></span>
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {publishedDocs.docs.length ? (
                publishedDocs.docs.map((doc) => (
                  <div
                    className="flex flex-col gap-3 rounded-2xl border border-[var(--theme-elevation-150)] bg-white p-4 shadow-[0_4px_12px_rgba(7,20,45,0.02)] transition hover:border-[var(--color-blue-200)] sm:flex-row sm:items-center sm:justify-between"
                    key={doc.id}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-display text-[1.05rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">
                        {doc.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--theme-elevation-500)]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-blue-400)]" />
                        Publicado el {formatDate(doc.publishedAt || doc.updatedAt)}
                      </p>
                    </div>

                    <div className="flex flex-none items-center gap-2">
                      <Link
                        className="inline-flex min-h-[2.2rem] items-center justify-center rounded-xl border border-[var(--theme-elevation-200)] bg-[var(--theme-elevation-50)] px-3 text-xs font-bold text-[var(--theme-elevation-700)] transition hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]"
                        href={`/articulos/${doc.slug}`}
                        prefetch={false}
                        target="_blank"
                      >
                        Vista publica
                      </Link>
                      <Link
                        className="inline-flex min-h-[2.2rem] items-center justify-center rounded-xl bg-[var(--txdx-navy)] px-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(7,20,45,0.15)]"
                        href={`/panel/articulos/${doc.id}`}
                      >
                        Editar panel
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-[var(--theme-elevation-200)] p-6 text-center">
                  <p className="text-sm font-semibold text-[var(--theme-elevation-500)]">Todavia no hay publicaciones en produccion.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Columna Derecha: Radar y Flujo */}
        <div className="grid gap-6 md:gap-8">

          {/* Radar Rapido */}
          <section className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.04)] md:p-6">
            <h2 className="font-display text-[1.2rem] font-extrabold tracking-[-0.03em] text-[var(--txdx-navy)]">
              Radar rapido
            </h2>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[linear-gradient(135deg,#f8fafc,#f1f5f9)] p-4 shadow-inner">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
                  Total articulos
                </p>
                <p className="mt-2 font-display text-[2rem] font-extrabold leading-none tracking-[-0.05em] text-[var(--txdx-navy)]">
                  {allPosts.totalDocs}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[linear-gradient(135deg,#f8fafc,#f1f5f9)] p-4 shadow-inner">
                <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
                  Total media
                </p>
                <p className="mt-2 font-display text-[2rem] font-extrabold leading-none tracking-[-0.05em] text-[var(--txdx-navy)]">
                  {mediaCount.totalDocs}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-xl border border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.04)] p-4">
              <span className="mt-0.5 flex-none text-[var(--color-blue-500)]">
                <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </span>
              <p className="text-[0.8rem] leading-relaxed text-[var(--theme-elevation-700)]">
                La composicion avanzada de bloques y layout builder sigue temporalmente integrada nativamente en Payload CMS.
              </p>
            </div>
          </section>

          {/* Flujo Recomendado */}
          <section className="relative overflow-hidden rounded-[1.4rem] border border-[var(--txdx-navy)] bg-[linear-gradient(180deg,#07142d_0%,#0b1d3d_100%)] p-5 text-white shadow-[0_20px_50px_rgba(7,20,45,0.24)] md:p-6">
            <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[rgba(88,217,255,0.15)] blur-[30px]" />
            <div aria-hidden="true" className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[rgba(255,90,24,0.15)] blur-[30px]" />

            <div className="relative z-10">
              <p className="text-[0.65rem] font-extrabold uppercase tracking-[0.2em] text-[var(--txdx-cyan)]">
                Guia editorial
              </p>
              <h2 className="mt-1 font-display text-[1.2rem] font-extrabold tracking-[-0.03em] text-white">
                Flujo recomendado
              </h2>

              <ol className="mt-5 space-y-3">
                <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[var(--txdx-cyan)] font-display text-[0.7rem] font-extrabold text-[var(--txdx-navy)]">
                    01
                  </span>
                  <div>
                    <strong className="block text-[0.85rem] font-extrabold text-white">Crear</strong>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-white/70">Inicia el borrador y compone sin perder el foco en la estructura.</p>
                  </div>
                </li>
                <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[var(--txdx-orange)] font-display text-[0.7rem] font-extrabold text-white">
                    02
                  </span>
                  <div>
                    <strong className="block text-[0.85rem] font-extrabold text-white">Revisar</strong>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-white/70">Revisa los metadatos, borradores destacados y piezas publicadas.</p>
                  </div>
                </li>
                <li className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-[var(--color-blue-500)] font-display text-[0.7rem] font-extrabold text-white">
                    03
                  </span>
                  <div>
                    <strong className="block text-[0.85rem] font-extrabold text-white">Mantener</strong>
                    <p className="mt-1 text-[0.75rem] leading-relaxed text-white/70">Ordena tu biblioteca multimedia y mantén tu firma consistentes.</p>
                  </div>
                </li>
              </ol>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
