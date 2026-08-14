import Link from 'next/link'
import type { Payload } from 'payload'

import type { Admin } from '@/payload-types'

type Props = {
  payload: Payload
  user?: Admin | null
}

export default async function BeforeDashboard({ payload, user }: Props) {
  let totals = { total: 0, published: 0, drafts: 0 }
  try {
    const [all, published] = await Promise.all([
      payload.count({ collection: 'posts' }),
      payload.count({
        collection: 'posts',
        where: { _status: { equals: 'published' } },
      }),
    ])
    totals = {
      total: all.totalDocs,
      published: published.totalDocs,
      drafts: Math.max(0, all.totalDocs - published.totalDocs),
    }
  } catch {
    // Sin conexión a base de datos: se muestran ceros.
  }

  const adminRoute = payload.config.routes.admin
  const postList = `${adminRoute}/collections/posts`
  const newPost = `${postList}/create`
  const media = `${adminRoute}/collections/media`

  return (
    <div className="txdx-dash">
      <div className="txdx-dash__head">
        <span className="txdx-dash__signal" aria-hidden="true" />
        <p className="txdx-dash__eyebrow">Panel editorial · TxDxNet</p>
        <h2 className="txdx-dash__title">
          Bienvenido/a, {user?.name?.split(' ')[0] ?? 'equipo'}.
        </h2>
        <p className="txdx-dash__sub">
          Escribe, revisa y publica tus artículos con la vista previa en vivo.
        </p>
      </div>

      <div className="txdx-stats" role="list" aria-label="Resumen de artículos">
        <div className="txdx-stat" role="listitem">
          <div className="txdx-stat__value">{totals.total}</div>
          <div className="txdx-stat__label">Artículos</div>
        </div>
        <div className="txdx-stat" role="listitem">
          <div className="txdx-stat__value">{totals.published}</div>
          <div className="txdx-stat__label">Publicados</div>
        </div>
        <div className="txdx-stat txdx-stat--accent" role="listitem">
          <div className="txdx-stat__value">{totals.drafts}</div>
          <div className="txdx-stat__label">Borradores</div>
        </div>
      </div>

      <div className="txdx-quick">
        <Link className="txdx-quick__btn" href={newPost}>
          + Nuevo artículo
        </Link>
        <Link className="txdx-quick__btn txdx-quick__btn--ghost" href={postList}>
          Ver artículos
        </Link>
        <Link className="txdx-quick__btn txdx-quick__btn--ghost" href={media}>
          Biblioteca multimedia
        </Link>
      </div>
    </div>
  )
}
