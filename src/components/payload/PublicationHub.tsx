import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

const STEPS = [
  {
    n: '01',
    title: 'Escribe',
    text: 'Título, resumen, portada y contenido. La barra de formato queda fija y el texto se ve como se publicará.',
  },
  {
    n: '02',
    title: 'Revisa',
    text: 'Usa la vista previa para ver el artículo en su URL real antes de publicarlo.',
  },
  {
    n: '03',
    title: 'Publica',
    text: 'Cuando el artículo esté listo, publícalo directo desde el panel. Guarda borradores con autoguardado si prefieres seguir después.',
  },
]

export default async function PublicationHub({ payload, user }: AdminViewServerProps) {
  let counts = { total: 0, published: 0, drafts: 0 }
  let recentDrafts: Array<{ id: string; title: string; updatedAt: string }> = []
  try {
    const [all, published, drafts] = await Promise.all([
      payload.count({ collection: 'posts' }),
      payload.count({ collection: 'posts', where: { _status: { equals: 'published' } } }),
      payload.count({ collection: 'posts', where: { _status: { equals: 'draft' } } }),
    ])
    counts = {
      total: all.totalDocs,
      published: published.totalDocs,
      drafts: drafts.totalDocs,
    }

    const draftDocs = await payload.find({
      collection: 'posts',
      depth: 0,
      limit: 5,
      sort: '-updatedAt',
      where: { _status: { equals: 'draft' } },
    })
    recentDrafts = draftDocs.docs.map((doc) => ({
      id: doc.id,
      title: doc.title,
      updatedAt: doc.updatedAt,
    }))
  } catch {
    // Sin conexión: se muestran ceros y listado vacío.
  }

  const adminRoute = payload.config.routes.admin
  const postList = `${adminRoute}/collections/posts`
  const newPost = `${postList}/create`
  const media = `${adminRoute}/collections/media`
  const draftList = `${postList}?where[_status][equals]=draft`
  const publishedList = `${postList}?where[_status][equals]=published`

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Lima',
    }).format(new Date(value))

  return (
    <div className="txdx-hub">
      <section className="txdx-hub__hero">
        <div>
          <p className="txdx-dash__eyebrow">Panel editorial · TxDxSecure</p>
          <h1>
            ¿Qué quieres hacer
            <br />
            <span>hoy?</span>
          </h1>
          <p className="txdx-hub__sub">
            Bienvenido/a, {user?.name?.split(' ')[0] ?? 'equipo'}. Escribe, revisa y publica tus
            artículos.
          </p>
        </div>
      </section>

      <section className="txdx-actions" aria-label="Acciones rápidas">
        <Link className="txdx-action txdx-action--accent" href={newPost}>
          <span className="txdx-action__icon">+</span>
          <span>
            <strong>Nuevo artículo</strong>
            <small>Empezar a escribir</small>
          </span>
        </Link>
        <Link className="txdx-action txdx-action--cyan" href={draftList}>
          <span className="txdx-action__icon">{counts.drafts}</span>
          <span>
            <strong>Borradores</strong>
            <small>Continuar escribiendo</small>
          </span>
        </Link>
        <Link className="txdx-action txdx-action--blue" href={publishedList}>
          <span className="txdx-action__icon">{counts.published}</span>
          <span>
            <strong>Publicados</strong>
            <small>Ver en producción</small>
          </span>
        </Link>
        <a
          className="txdx-action txdx-action--graphite"
          href="https://txdxsecure.com/"
          rel="noreferrer"
          target="_blank"
        >
          <span className="txdx-action__icon">↗</span>
          <span>
            <strong>Conocer la empresa</strong>
            <small>txdxsecure.com</small>
          </span>
        </a>
      </section>

      <section className="txdx-hub__grid">
        <div className="txdx-panel">
          <div className="txdx-panel__head">
            <h2>En borrador</h2>
            <Link href={draftList}>Ver todos</Link>
          </div>
          {recentDrafts.length ? (
            <ul className="txdx-draft-list">
              {recentDrafts.map((draft) => (
                <li key={draft.id}>
                  <Link className="txdx-draft" href={`${postList}/${draft.id}`}>
                    <span className="txdx-draft__title">{draft.title}</span>
                    <span className="txdx-draft__meta">
                      <span className="txdx-pill txdx-pill--draft">Borrador</span>
                      <time>{formatDate(draft.updatedAt)}</time>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="txdx-panel__empty">
              No hay borradores todavía. Empieza un nuevo artículo y se guardará aquí.
            </p>
          )}
        </div>

        <div className="txdx-panel">
          <div className="txdx-panel__head">
            <h2>Cómo publicar</h2>
          </div>
          <ol className="txdx-steps">
            {STEPS.map((step) => (
              <li className="txdx-step" key={step.n}>
                <span className="txdx-step__n">{step.n}</span>
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="txdx-hub__note">
            Escribe como en un procesador de textos, previsualiza el resultado y publica cuando esté
            listo.
          </p>
        </div>
      </section>

      <section className="txdx-panel txdx-panel--taxonomy">
        <div className="txdx-panel__head">
          <h2>Recursos</h2>
        </div>
        <div className="txdx-quick">
          <Link className="txdx-quick__btn txdx-quick__btn--ghost" href={media}>
            Biblioteca multimedia
          </Link>
          <Link className="txdx-quick__btn txdx-quick__btn--ghost" href={`${adminRoute}/collections/admins`}>
            Equipo editorial
          </Link>
        </div>
      </section>
    </div>
  )
}
