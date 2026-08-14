import Link from 'next/link'
import type { AdminViewServerProps } from 'payload'

import type { Admin } from '@/payload-types'

const ROLE_META: Record<Admin['role'], { label: string; sub: string }> = {
  admin: {
    label: 'Administrador',
    sub: 'Gestiona personas, taxonomía y toda la publicación.',
  },
  editor: {
    label: 'Editor',
    sub: 'Revisa, edita y publica los artículos del equipo.',
  },
  author: {
    label: 'Autor',
    sub: 'Redacta y guarda tus borradores; el equipo editorial los publica.',
  },
}

const CAN_PUBLISH: Record<Admin['role'], boolean> = {
  admin: true,
  editor: true,
  author: false,
}

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
    text: 'El botón Publicar aparece solo para el equipo editorial. Tú escribes, ellos cierran.',
  },
]

export default async function PublicationHub({ payload, user }: AdminViewServerProps) {
  const role = user?.role ?? 'editor'
  const meta = ROLE_META[role]
  const canPublish = CAN_PUBLISH[role]

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
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
          <p className="txdx-dash__eyebrow">Panel editorial · TxDxNet</p>
          <h1>
            ¿Qué quieres hacer
            <br />
            <span>hoy?</span>
          </h1>
          <p className="txdx-hub__sub">{meta.sub}</p>
        </div>
        <span className="txdx-hub__role">{meta.label}</span>
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
        <Link className="txdx-action txdx-action--graphite" href={siteURL}>
          <span className="txdx-action__icon">↗</span>
          <span>
            <strong>Ver el sitio</strong>
            <small>txdxnet.com</small>
          </span>
        </Link>
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
          {canPublish && (
            <p className="txdx-hub__note">
              Como {meta.label.toLowerCase()}, puedes publicar directamente desde el artículo.
            </p>
          )}
        </div>
      </section>

      {role === 'admin' && (
        <section className="txdx-panel txdx-panel--taxonomy">
          <div className="txdx-panel__head">
            <h2>Taxonomía de la empresa</h2>
            <span className="txdx-pill txdx-pill--admin">Solo administradores</span>
          </div>
          <p className="txdx-panel__text">
            Los dominios y servicios son datos de la empresa. Se crean aquí una vez y el equipo
            editorial solo los elige al clasificar un artículo.
          </p>
          <div className="txdx-quick">
            <Link className="txdx-quick__btn" href={`${adminRoute}/collections/domains`}>
              Dominios
            </Link>
            <Link className="txdx-quick__btn" href={`${adminRoute}/collections/services`}>
              Servicios
            </Link>
            <Link className="txdx-quick__btn txdx-quick__btn--ghost" href={media}>
              Biblioteca multimedia
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
