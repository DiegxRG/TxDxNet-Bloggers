'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useDeferredValue, useMemo, useState } from 'react'

export type PanelArticleItem = {
  id: string
  title: string
  excerpt: string
  status: string
  featured: boolean
  slug: string
  coverAlt: string
  coverURL: null | string
  publishedAt: null | string
  updatedAt: string
}

type FilterKey = 'all' | 'draft' | 'featured' | 'published'

type Props = {
  initialFilter: FilterKey
  items: PanelArticleItem[]
}

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'draft', label: 'Borradores' },
  { key: 'published', label: 'Publicados' },
  { key: 'featured', label: 'Destacados' },
]

function formatDate(value: null | string) {
  if (!value) return 'Sin fecha'

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function PanelArticlesIndex({ initialFilter, items }: Props) {
  const [filter, setFilter] = useState<FilterKey>(initialFilter)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase()

    return items.filter((item) => {
      const matchesFilter =
        filter === 'all'
          ? true
          : filter === 'featured'
            ? item.featured
            : item.status === filter

      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : item.title.toLowerCase().includes(normalizedQuery) ||
            item.excerpt.toLowerCase().includes(normalizedQuery)

      return matchesFilter && matchesQuery
    })
  }, [deferredQuery, filter, items])

  return (
    <div className="txdx-my">
      <header className="txdx-my__head">
        <div>
          <h1 className="txdx-my__title">Articulos</h1>
          <p className="txdx-my__sub">
            Filtra y entra al editor solo cuando haga falta.
          </p>
        </div>
        <Link className="txdx-my__new" href="/panel/articulos/nuevo">
          Nuevo articulo
        </Link>
      </header>

      <div className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-white p-4 shadow-[0_14px_40px_rgba(7,20,45,0.05)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((entry) => {
              const active = filter === entry.key

              return (
                <button
                  className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                    active
                      ? 'border-[var(--color-blue-150)] bg-[var(--color-blue-50)] text-[var(--color-blue-600)]'
                      : 'border-[var(--theme-elevation-150)] bg-white text-[var(--theme-elevation-600)] hover:border-[var(--theme-elevation-250)] hover:text-[var(--txdx-navy)]'
                  }`}
                  key={entry.key}
                  onClick={() => setFilter(entry.key)}
                  type="button"
                >
                  {entry.label}
                </button>
              )
            })}
          </div>

          <label className="block w-full max-w-xl lg:w-[360px]">
            <span className="sr-only">Buscar articulos</span>
            <input
              className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-[var(--theme-elevation-0)] px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por titulo o resumen..."
              type="search"
              value={query}
            />
          </label>
        </div>

        <div className="mt-4 rounded-2xl border border-[rgba(18,104,255,0.08)] bg-[rgba(18,104,255,0.04)] px-4 py-3 text-sm text-[var(--theme-elevation-600)]">
          {filtered.length} {filtered.length === 1 ? 'resultado visible' : 'resultados visibles'}.
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="txdx-my__empty">
          <p className="txdx-my__empty-title">No encontramos articulos con ese filtro</p>
          <p className="txdx-my__empty-copy">
            Ajusta la busqueda o cambia de vista para recuperar tus borradores y publicaciones.
          </p>
        </div>
      ) : (
        <ul className="txdx-my__grid">
          {filtered.map((item) => {
            const previewHref = item.status === 'published' && item.slug ? `/articulos/${item.slug}` : null

            return (
              <li key={item.id}>
                <article className="txdx-my__card">
                  <div className="txdx-my__thumb relative">
                    {item.coverURL ? (
                      <Image alt={item.coverAlt} fill sizes="(max-width: 768px) 100vw, 33vw" src={item.coverURL} />
                    ) : (
                      <span className="txdx-my__thumb-fallback">TxDx</span>
                    )}
                  </div>

                  <div className="txdx-my__body">
                    <div className="txdx-my__meta flex-wrap">
                      <span
                        className={
                          item.status === 'published'
                            ? 'txdx-my__status txdx-my__status--published'
                            : 'txdx-my__status'
                        }
                      >
                        {item.status === 'published' ? 'Publicado' : 'Borrador'}
                      </span>
                      {item.featured ? (
                        <span className="rounded-full bg-[rgba(255,90,24,0.12)] px-3 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[var(--txdx-orange)]">
                          Destacado
                        </span>
                      ) : null}
                    </div>

                    <h2 className="txdx-my__card-title">{item.title}</h2>

                    <p className="line-clamp-2 text-sm leading-6 text-[var(--theme-elevation-600)]">
                      {item.excerpt}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-[var(--theme-elevation-500)]">
                      <span>{formatDate(item.updatedAt)}</span>
                      <span aria-hidden="true">/</span>
                      <span>{formatDate(item.publishedAt)}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <Link
                        className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--txdx-orange)] px-4 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
                        href={`/panel/articulos/${item.id}`}
                      >
                        Editar en panel
                      </Link>

                      {previewHref ? (
                        <Link
                          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--theme-elevation-200)] px-4 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]"
                          href={previewHref}
                          prefetch={false}
                          target="_blank"
                        >
                          Vista previa
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
