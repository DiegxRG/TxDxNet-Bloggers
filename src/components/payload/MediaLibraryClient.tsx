'use client'

import Link from 'next/link'
import { useMemo, useRef, useState } from 'react'

export type MediaItem = {
  id: string
  filename: string
  alt: string
  url: string | null
  thumbnailURL: string | null
  filesize: number
  mimeType: string
  width: number | null
  height: number | null
  updatedAt: string
}

type UploadDoc = {
  id: string
  filename: string
  alt?: string | null
  url?: string | null
  thumbnailURL?: string | null
  filesize?: number | null
  mimeType?: string | null
  width?: number | null
  height?: number | null
  updatedAt?: string | null
  sizes?: {
    thumbnail?: { url?: string | null }
    card?: { url?: string | null }
  }
}

function formatBytes(bytes: number) {
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

function toItem(doc: UploadDoc): MediaItem {
  const thumbnail = doc.thumbnailURL ?? doc.sizes?.thumbnail?.url ?? doc.url
  return {
    id: String(doc.id),
    filename: doc.filename,
    alt: doc.alt || '',
    url: doc.url || null,
    thumbnailURL: thumbnail || null,
    filesize: doc.filesize || 0,
    mimeType: doc.mimeType || '',
    width: doc.width || null,
    height: doc.height || null,
    updatedAt: doc.updatedAt || new Date().toISOString(),
  }
}

type Props = {
  editBasePath?: string
  editLabel?: string
  items: MediaItem[]
  total: number
}

export function MediaLibraryClient({
  editBasePath = '/admin/collections/media',
  editLabel = 'Editar',
  items,
  total,
}: Props) {
  const [files, setFiles] = useState<MediaItem[]>(items)
  const [query, setQuery] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadNames, setUploadNames] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return files
    return files.filter(
      (file) =>
        file.filename.toLowerCase().includes(q) || file.alt.toLowerCase().includes(q),
    )
  }, [files, query])

  async function uploadFiles(fileList: FileList | File[]) {
    const arr = Array.from(fileList)
    if (arr.length === 0) return

    setUploading(true)
    setUploadNames(arr.map((file) => file.name))
    setError(null)

    for (const file of arr) {
      const form = new FormData()
      form.append('file', file)

      try {
        const res = await fetch('/api/media', { method: 'POST', body: form })
        if (!res.ok) {
          setError(`No se pudo subir «${file.name}».`)
          continue
        }
        const data = (await res.json()) as UploadDoc
        setFiles((prev) => [toItem(data), ...prev])
      } catch {
        setError(`No se pudo subir «${file.name}».`)
      }
    }

    setUploading(false)
    setUploadNames([])
  }

  async function removeItem(id: string, filename: string) {
    setError(null)
    const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setFiles((prev) => prev.filter((file) => file.id !== id))
    } else {
      setError(`No se pudo eliminar «${filename}».`)
    }
  }

  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void uploadFiles(event.dataTransfer.files)
  }

  return (
    <div className="txdx-media">
      <header className="txdx-media__head">
        <div>
          <h1 className="txdx-media__title">Biblioteca multimedia</h1>
          <p className="txdx-media__sub">
            {total} {total === 1 ? 'archivo' : 'archivos'} — sube imágenes y PDFs para usarlos en tus artículos.
          </p>
        </div>
        <button
          className="txdx-media__add"
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Subiendo…' : 'Añadir archivos'}
        </button>
        <input
          ref={inputRef}
          className="txdx-media__input"
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={(event) => {
            if (event.target.files) void uploadFiles(event.target.files)
            event.target.value = ''
          }}
        />
      </header>

      {error && (
        <p className="txdx-media__error" role="alert">
          {error}
        </p>
      )}

      <div
        className={`txdx-media__dropzone${dragging ? ' txdx-media__dropzone--active' : ''}`}
        onDragEnter={(event) => {
          event.preventDefault()
          setDragging(true)
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault()
          setDragging(false)
        }}
        onDrop={onDrop}
      >
        {uploading ? (
          <p className="txdx-media__dropzone-text">
            Subiendo {uploadNames.length} {uploadNames.length === 1 ? 'archivo' : 'archivos'}…
          </p>
        ) : (
          <p className="txdx-media__dropzone-text">
            Arrastra y suelta archivos aquí, o{' '}
            <button type="button" onClick={() => inputRef.current?.click()}>
              elige archivos
            </button>
          </p>
        )}
      </div>

      <div className="txdx-media__toolbar">
        <input
          className="txdx-media__search"
          type="search"
          placeholder="Buscar por nombre o texto alternativo…"
          aria-label="Buscar en la biblioteca"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="txdx-media__count">
          {visible.length} {visible.length === 1 ? 'mostrado' : 'mostrados'}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="txdx-media__empty">
          <p className="txdx-media__empty-title">{files.length === 0 ? 'Tu biblioteca está vacía' : 'Sin resultados'}</p>
          <p className="txdx-media__empty-copy">
            {files.length === 0
              ? 'Arrastra archivos al área de arriba o usa «Añadir archivos» para comenzar.'
              : 'Prueba con otra búsqueda.'}
          </p>
        </div>
      ) : (
        <ul className="txdx-media__grid">
          {visible.map((file) => (
            <li key={file.id} className="txdx-media__tile">
              <Link
                aria-label={file.filename}
                className="txdx-media__thumb"
                href={`${editBasePath}/${file.id}`}
                prefetch={false}
              >
                {file.thumbnailURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt={file.alt || file.filename} src={file.thumbnailURL} loading="lazy" />
                ) : (
                  <span className="txdx-media__thumb-fallback">{file.mimeType === 'application/pdf' ? 'PDF' : 'IMG'}</span>
                )}
                <span className="txdx-media__thumb-zoom">{editLabel}</span>
              </Link>
              <div className="txdx-media__meta">
                <p className="txdx-media__name" title={file.filename}>
                  {file.filename}
                </p>
                <p className="txdx-media__alt">
                  {file.alt || 'Sin texto alternativo'}
                  {file.width && file.height ? ` · ${file.width}×${file.height}` : ''}
                </p>
                <p className="txdx-media__info">
                  {formatBytes(file.filesize)} · {new Date(file.updatedAt).toLocaleDateString('es')}
                </p>
                <div className="txdx-media__actions">
                  <Link href={`${editBasePath}/${file.id}`} prefetch={false}>
                    {editLabel}
                  </Link>
                  <button type="button" onClick={() => void removeItem(file.id, file.filename)}>
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
