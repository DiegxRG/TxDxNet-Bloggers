import type { AdminViewServerProps } from 'payload'
import Link from 'next/link'

import type { Post } from '@/payload-types'
import { getMediaAlt, getMediaURL } from '@/modules/content/infrastructure/payload/posts'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}

export default async function MyArticles({ initPageResult }: AdminViewServerProps) {
  const { req } = initPageResult
  const user = req.user as { id?: string } | null

  const { docs } = await req.payload.find({
    collection: 'posts',
    depth: 1,
    limit: 50,
    sort: '-updatedAt',
    where: user ? { createdBy: { equals: user.id } } : { id: { exists: false } },
  })

  const adminRoute = '/admin'

  return (
    <div className="txdx-my">
      <header className="txdx-my__head">
        <div>
          <h1 className="txdx-my__title">Mis artículos</h1>
          <p className="txdx-my__sub">
            {docs.length === 0
              ? 'Todavía no has escrito nada.'
              : `${docs.length} ${docs.length === 1 ? 'artículo' : 'artículos'} ${docs.length === 1 ? 'guardado' : 'guardados'} por ti.`}
          </p>
        </div>
        <Link className="txdx-my__new" href={`${adminRoute}/collections/posts/create`}>
          Nuevo artículo
        </Link>
      </header>

      {docs.length === 0 ? (
        <div className="txdx-my__empty">
          <p className="txdx-my__empty-title">Empieza a escribir</p>
          <p className="txdx-my__empty-copy">
            Crea tu primer artículo desde el botón «Nuevo artículo» y publícalo para toda la audiencia.
          </p>
        </div>
      ) : (
        <ul className="txdx-my__grid">
          {docs.map((post) => {
            const data = post as unknown as Post
            const imageURL = getMediaURL(data.coverImage, 'card')
            const imageAlt = getMediaAlt(data.coverImage, data.title)
            const status = data._status || 'draft'
            const statusClass =
              status === 'published' ? 'txdx-my__status txdx-my__status--published' : 'txdx-my__status'

            return (
              <li key={data.id}>
                <Link className="txdx-my__card" href={`${adminRoute}/collections/posts/${data.id}`}>
                  <div className="txdx-my__thumb">
                    {imageURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={imageAlt} src={imageURL} />
                    ) : (
                      <span className="txdx-my__thumb-fallback">TxDx</span>
                    )}
                  </div>
                  <div className="txdx-my__body">
                    <div className="txdx-my__meta">
                      <span className={statusClass}>{STATUS_LABELS[status] || status}</span>
                      {data.publishedAt && <time>{new Date(data.publishedAt).toLocaleDateString('es')}</time>}
                    </div>
                    <h2 className="txdx-my__card-title">{data.title}</h2>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
