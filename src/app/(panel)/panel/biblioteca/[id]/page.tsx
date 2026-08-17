import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { PanelSubmitButton } from '@/components/panel/PanelSubmitButton'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { startPanelMeasure } from '@/modules/panel/server/perf'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Media } from '@/payload-types'

import { deletePanelMediaAction, updatePanelMediaAction } from './actions'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return '—'

  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unit = 0

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }

  return `${value.toFixed(value >= 10 || unit === 0 ? 0 : 1)} ${units[unit]}`
}

function getAlert(status: null | string) {
  switch (status) {
    case 'guardado':
      return {
        className:
          'border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.06)] text-[var(--color-blue-600)]',
        text: 'Metadata actualizada correctamente.',
      }
    case 'error':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'No se pudieron guardar los cambios.',
      }
    case 'error-eliminar':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'No se pudo eliminar el archivo. Revisa si sigue siendo necesario en alguna pieza.',
      }
    default:
      return null
  }
}

export default async function PanelMediaDetailPage({ params, searchParams }: Props) {
  const measure = startPanelMeasure('biblioteca:detail')
  const { payload, user } = await getPanelSession()
  const { id } = await params
  const query = await searchParams
  const status = Array.isArray(query.estado) ? query.estado[0] : query.estado || null

  let media: Media

  try {
    media = (await payload.findByID({
      collection: 'media',
      id,
      depth: 0,
      overrideAccess: false,
      user,
    })) as Media
  } catch {
    notFound()
  }

  const alert = getAlert(status)
  const thumbnailURL = getMediaURL(media, 'card') || getMediaURL(media, 'thumbnail') || media.url || null
  const isPDF = media.mimeType === 'application/pdf'
  const updatedAt = new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Lima',
  }).format(new Date(media.updatedAt))

  measure.end({ mediaID: media.id, isPDF })

  return (
    <div className="grid gap-5 xl:grid-cols-[1.02fr_0.98fr]" id="contenido-panel">
      <section className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_20px_50px_rgba(7,20,45,0.06)] md:p-7 xl:self-start">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
              Activo multimedia
            </p>
            <h1 className="mt-3 break-words font-display text-[clamp(2rem,3vw,3rem)] font-extrabold tracking-[-0.06em] text-[var(--txdx-navy)]">
              {media.filename || 'Archivo sin nombre'}
            </h1>
          </div>

          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--theme-elevation-200)] px-4 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]"
            href="/panel/biblioteca"
          >
            Volver a biblioteca
          </Link>
        </div>

        {alert ? (
          <div className={`mt-5 rounded-2xl border px-4 py-3 text-sm font-semibold ${alert.className}`}>
            {alert.text}
          </div>
        ) : null}

        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
          Preview
        </p>
        <div className="mt-5 overflow-hidden rounded-[1.6rem] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)]">
          <div className="relative aspect-[16/10] bg-[var(--theme-elevation-100)]">
            {thumbnailURL && !isPDF ? (
              <Image alt={media.alt || media.filename || 'Preview'} fill sizes="(max-width: 1200px) 100vw, 720px" src={thumbnailURL} />
            ) : (
              <div className="grid h-full place-items-center px-6 text-center">
                <div>
                  <p className="font-display text-4xl font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                    {isPDF ? 'PDF' : 'FILE'}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-[var(--theme-elevation-600)]">
                    {isPDF
                      ? 'El archivo es un PDF. Abre el activo para revisar el documento completo.'
                      : 'No hay miniatura disponible para este archivo.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
              Tipo
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--txdx-navy)]">{media.mimeType || 'Desconocido'}</p>
          </div>
          <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
              Peso
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--txdx-navy)]">{formatBytes(media.filesize)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
              Dimensiones
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--txdx-navy)]">
              {media.width && media.height ? `${media.width} × ${media.height}` : 'No aplica'}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[var(--theme-elevation-500)]">
              Ultima actualizacion
            </p>
            <p className="mt-2 text-sm font-bold text-[var(--txdx-navy)]">{updatedAt}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 content-start">
      <section className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_20px_50px_rgba(7,20,45,0.06)] md:p-7">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
          Metadata editorial
        </p>
        <h2 className="mt-2 font-display text-[1.45rem] font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
          Describe la imagen una sola vez
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--theme-elevation-600)]">
          El campo importante es `alt`: se usa cuando publiques esta imagen en un articulo.
        </p>

        <form action={updatePanelMediaAction.bind(null, media.id)} className="mt-6 grid gap-5">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Texto alternativo</span>
            <input
              className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
              defaultValue={media.alt || ''}
              name="alt"
              placeholder="Describe que aparece en la imagen"
              type="text"
            />
            <span className="mt-2 block text-sm leading-6 text-[var(--theme-elevation-500)]">
              Describe la imagen para accesibilidad. No suele verse en pantalla, pero si acompana al
              contenido publicado.
            </span>
          </label>

          <details className="rounded-[1.4rem] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-4 py-4">
            <summary className="cursor-pointer list-none text-sm font-bold text-[var(--txdx-navy)] [&::-webkit-details-marker]:hidden">
              Metadatos opcionales
            </summary>
            <p className="mt-2 text-sm leading-6 text-[var(--theme-elevation-500)]">
              Usa esto solo si necesitas dar contexto adicional o registrar la fuente.
            </p>

            <div className="mt-4 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Leyenda</span>
                <textarea
                  className="min-h-24 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 py-3 text-sm leading-6 text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                  defaultValue={media.caption || ''}
                  name="caption"
                  placeholder="Contexto corto si la imagen lo necesita"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Credito o fuente</span>
                <input
                  className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                  defaultValue={media.credit || ''}
                  name="credit"
                  placeholder="Autor, equipo o fuente"
                  type="text"
                />
              </label>
            </div>
          </details>

          <div className="flex flex-wrap gap-3 pt-2">
            <PanelSubmitButton pendingLabel="Guardando metadata...">Guardar cambios</PanelSubmitButton>
          </div>
        </form>
      </section>

      <section className="rounded-[1.35rem] border border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.06)] p-5 shadow-[0_20px_50px_rgba(7,20,45,0.05)] md:p-6">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--txdx-orange)]">
          Zona delicada
        </p>
        <h2 className="mt-2 font-display text-[1.2rem] font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
          Eliminar archivo
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--theme-elevation-700)]">
          Borra este activo solo si estas seguro de que no se utiliza en articulos, vistas sociales o
          bloques del contenido. La eliminacion es permanente.
        </p>

        <form action={deletePanelMediaAction.bind(null, media.id)} className="mt-4">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[rgba(255,90,24,0.22)] bg-[rgba(255,90,24,0.14)] px-5 text-sm font-extrabold text-[var(--txdx-orange)] transition hover:-translate-y-0.5 hover:bg-[rgba(255,90,24,0.18)]"
            type="submit"
          >
            Eliminar archivo definitivamente
          </button>
        </form>
      </section>
      </div>
    </div>
  )
}
