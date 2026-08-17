import Link from 'next/link'

import { getPanelSession } from '@/modules/panel/server/session'

export default async function PanelDashboardPage() {
  const { payload, user } = await getPanelSession()

  const [allPosts, draftPosts, publishedPosts, mediaCount, draftDocs, publishedDocs] = await Promise.all([
    payload.count({ collection: 'posts', overrideAccess: false, user }),
    payload.count({
      collection: 'posts',
      overrideAccess: false,
      user,
      where: { _status: { equals: 'draft' } },
    }),
    payload.count({
      collection: 'posts',
      overrideAccess: false,
      user,
      where: { _status: { equals: 'published' } },
    }),
    payload.count({ collection: 'media', overrideAccess: false, user }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 5,
      overrideAccess: false,
      user,
      sort: '-updatedAt',
      where: { _status: { equals: 'draft' } },
    }),
    payload.find({
      collection: 'posts',
      depth: 0,
      limit: 4,
      overrideAccess: false,
      user,
      sort: '-publishedAt',
      where: { _status: { equals: 'published' } },
    }),
  ])

  const firstName = user.name.split(' ')[0] || 'equipo'

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
    }).format(new Date(value))

  return (
    <div className="txdx-hub" id="contenido-panel">
      <section className="txdx-hub__hero">
        <div>
          <p className="txdx-dash__eyebrow">Panel propio · Payload por dentro</p>
          <h1>
            Publica con una
            <br />
            <span>vista mas clara</span>
          </h1>
          <p className="txdx-hub__sub">
            Bienvenido, {firstName}. Todo lo importante del flujo editorial vive aqui.
          </p>
        </div>
        <div className="txdx-hub__role">{user.publicTitle || 'Administrador editorial'}</div>
      </section>

      <section aria-label="Acciones principales" className="txdx-actions">
        <Link className="txdx-action txdx-action--accent" href="/panel/articulos/nuevo">
          <span className="txdx-action__icon">+</span>
          <span>
            <strong>Nuevo articulo</strong>
            <small>Empieza rapido</small>
          </span>
        </Link>
        <Link className="txdx-action txdx-action--cyan" href="/panel/articulos?status=draft">
          <span className="txdx-action__icon">{draftPosts.totalDocs}</span>
          <span>
            <strong>Borradores</strong>
            <small>Retoma pendientes</small>
          </span>
        </Link>
        <Link className="txdx-action txdx-action--blue" href="/panel/articulos?status=published">
          <span className="txdx-action__icon">{publishedPosts.totalDocs}</span>
          <span>
            <strong>Publicados</strong>
            <small>Revisa produccion</small>
          </span>
        </Link>
        <Link className="txdx-action txdx-action--graphite" href="/panel/biblioteca">
          <span className="txdx-action__icon">{mediaCount.totalDocs}</span>
          <span>
            <strong>Biblioteca</strong>
            <small>Activos listos</small>
          </span>
        </Link>
      </section>

      <section className="txdx-hub__grid">
        <div className="txdx-panel">
          <div className="txdx-panel__head">
            <h2>Borradores recientes</h2>
            <Link href="/panel/articulos?status=draft">Ver todos</Link>
          </div>

          {draftDocs.docs.length ? (
            <ul className="txdx-draft-list">
              {draftDocs.docs.map((doc) => {
                const href = `/panel/articulos/${doc.id}`

                return (
                  <li key={doc.id}>
                    <Link className="txdx-draft" href={href} prefetch={false}>
                      <span className="txdx-draft__title">{doc.title || 'Borrador sin titulo'}</span>
                      <span className="txdx-draft__meta">
                        <span className="txdx-pill txdx-pill--draft">Borrador</span>
                        <time>{formatDate(doc.updatedAt)}</time>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="txdx-panel__empty">No tienes borradores activos.</p>
          )}
        </div>

        <div className="txdx-panel">
          <div className="txdx-panel__head">
            <h2>Radar rapido</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
                Total de articulos
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                {allPosts.totalDocs}
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
                Activos de media
              </p>
              <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                {mediaCount.totalDocs}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-[1rem] border border-[rgba(18,104,255,0.08)] bg-[rgba(18,104,255,0.04)] px-4 py-3 text-sm leading-5 text-[var(--theme-elevation-600)]">
            La composicion avanzada sigue temporalmente en Payload.
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[1.6rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-[0_14px_40px_rgba(7,20,45,0.05)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
                Publicacion reciente
              </p>
              <h2 className="mt-2 font-display text-[1.6rem] font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                Ultimos articulos publicados
              </h2>
            </div>
            <Link
              className="text-sm font-bold text-[var(--color-blue-600)]"
              href="/panel/articulos?status=published"
            >
              Ver listado completo
            </Link>
          </div>

          <div className="mt-5 space-y-3">
            {publishedDocs.docs.length ? (
              publishedDocs.docs.map((doc) => (
                <div
                  className="flex flex-col gap-3 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  key={doc.id}
                >
                  <div>
                    <p className="font-display text-lg font-bold tracking-[-0.03em] text-[var(--txdx-navy)]">
                      {doc.title}
                    </p>
                    <p className="mt-1 text-sm text-[var(--theme-elevation-500)]">
                      Publicado: {formatDate(doc.publishedAt || doc.updatedAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-[var(--theme-elevation-200)] px-4 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]"
                      href={`/articulos/${doc.slug}`}
                      prefetch={false}
                      target="_blank"
                    >
                      Vista publica
                    </Link>
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-[var(--txdx-navy)] px-4 text-sm font-bold text-white transition hover:-translate-y-0.5"
                      href={`/panel/articulos/${doc.id}`}
                    >
                      Editar en panel
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--theme-elevation-500)]">
                Todavia no hay publicaciones en produccion.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-[var(--theme-elevation-150)] bg-[linear-gradient(180deg,#07142d_0%,#10254f_100%)] p-4 text-white shadow-[0_20px_50px_rgba(7,20,45,0.24)]">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--txdx-cyan)]">
            Flujo recomendado
          </p>
          <h2 className="mt-2.5 font-display text-[1.35rem] font-extrabold tracking-[-0.05em]">Flujo recomendado</h2>

          <ol className="mt-4 space-y-3">
            <li className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5">
              <strong className="block text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--txdx-cyan)]">
                01 / Crear
              </strong>
              <p className="mt-1.5 text-sm leading-5 text-white/74">Inicia el borrador y compone sin perder el foco.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5">
              <strong className="block text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--txdx-cyan)]">
                02 / Revisar
              </strong>
              <p className="mt-1.5 text-sm leading-5 text-white/74">Revisa borradores, destacados y piezas publicadas.</p>
            </li>
            <li className="rounded-2xl border border-white/10 bg-white/6 px-4 py-3.5">
              <strong className="block text-sm font-extrabold uppercase tracking-[0.16em] text-[var(--txdx-cyan)]">
                03 / Mantener
              </strong>
              <p className="mt-1.5 text-sm leading-5 text-white/74">Ordena media y mantén tu firma publica consistente.</p>
            </li>
          </ol>
        </div>
      </section>
    </div>
  )
}
