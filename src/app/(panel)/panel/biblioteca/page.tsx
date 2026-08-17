import { MediaLibraryClient } from '@/components/payload/MediaLibraryClient'
import type { MediaItem } from '@/components/payload/MediaLibraryClient'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { startPanelMeasure } from '@/modules/panel/server/perf'
import { getPanelSession } from '@/modules/panel/server/session'
import type { Media } from '@/payload-types'

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function PanelMediaPage({ searchParams }: Props) {
  const measure = startPanelMeasure('biblioteca:index')
  const { payload, user } = await getPanelSession()
  const params = await searchParams

  const { docs, totalDocs } = await payload.find({
    collection: 'media',
    limit: 100,
    overrideAccess: false,
    user,
    sort: '-createdAt',
  })

  const items: MediaItem[] = docs.map((media) => {
    const data = media as unknown as Media

    return {
      id: String(data.id),
      filename: data.filename || String(data.id),
      alt: data.alt || '',
      url: getMediaURL(data, 'card'),
      thumbnailURL: getMediaURL(data, 'thumbnail'),
      filesize: data.filesize || 0,
      mimeType: data.mimeType || '',
      width: data.width || null,
      height: data.height || null,
      updatedAt: data.updatedAt,
    }
  })

  const status = Array.isArray(params.estado) ? params.estado[0] : params.estado
  const statusMessage = status === 'eliminado' ? 'Archivo eliminado correctamente.' : null

  measure.end({ docs: items.length })

  return (
    <div className="space-y-4" id="contenido-panel">
      {statusMessage ? (
        <div className="rounded-[1.5rem] border border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.06)] px-5 py-4 text-sm font-semibold text-[var(--color-blue-600)] shadow-[0_10px_30px_rgba(7,20,45,0.04)]">
          {statusMessage}
        </div>
      ) : null}
      <div className="rounded-[1.5rem] border border-[rgba(18,104,255,0.08)] bg-[rgba(18,104,255,0.04)] px-5 py-4 text-sm leading-6 text-[var(--theme-elevation-600)] shadow-[0_10px_30px_rgba(7,20,45,0.04)]">
        Sube archivos desde aqui y haz clic sobre cualquier activo para editar texto alternativo,
        leyenda y credito sin salir del panel propio.
      </div>
      <MediaLibraryClient editBasePath="/panel/biblioteca" editLabel="Gestionar" items={items} total={totalDocs} />
    </div>
  )
}
