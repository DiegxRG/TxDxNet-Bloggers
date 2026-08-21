'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type UploadedMedia = {
  alt?: string | null
  filename?: string | null
  id: string
  url?: string | null
  sizes?: {
    avatar?: { url?: string | null }
    thumbnail?: { url?: string | null }
  }
}

type UploadResponse = UploadedMedia & { doc?: UploadedMedia }

type Props = {
  initialId?: string | null
  initialURL?: string | null
  name: string
}

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']

function showToast(status: string) {
  window.dispatchEvent(new CustomEvent('txdx-toast', { detail: { status } }))
}

function getPreviewURL(media: UploadedMedia) {
  return media.sizes?.avatar?.url || media.sizes?.thumbnail?.url || media.url || null
}

function getInitial(name: string) {
  return name.trim().split(/\s+/)[0]?.slice(0, 1).toUpperCase() || 'T'
}

function formatMegabytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ProfileAvatarField({ initialId = null, initialURL = null, name }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const objectURLRef = useRef<string | null>(null)
  const [avatarID, setAvatarID] = useState(initialId || '')
  const [previewURL, setPreviewURL] = useState<string | null>(initialURL)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [selectionBase, setSelectionBase] = useState({ id: initialId || '', url: initialURL })
  const [status, setStatus] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return () => {
      if (objectURLRef.current) URL.revokeObjectURL(objectURLRef.current)
    }
  }, [])

  function clearObjectURL() {
    if (objectURLRef.current) {
      URL.revokeObjectURL(objectURLRef.current)
      objectURLRef.current = null
    }
  }

  function validateFile(file: File) {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setStatus('Usa una imagen JPG, PNG, WebP o AVIF.')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setStatus(`La foto pesa ${formatMegabytes(file.size)}. El máximo permitido es 5 MB.`)
      return false
    }

    return true
  }

  async function confirmUpload() {
    if (!pendingFile) return

    setUploading(true)
    setStatus('Subiendo foto…')
      const form = new FormData()
      form.append('file', pendingFile)
      form.append('purpose', 'avatar')

    try {
      const response = await fetch('/api/media', {
        body: form,
        credentials: 'include',
        method: 'POST',
      })
      if (!response.ok) throw new Error('upload-failed')

      const responseData = (await response.json()) as UploadResponse
      const media = responseData.doc ?? responseData
      if (!media.id) throw new Error('missing-media-id')

      clearObjectURL()
      setAvatarID(String(media.id))
      setPreviewURL(getPreviewURL(media))
      setPendingFile(null)
      setSelectionBase({ id: String(media.id), url: getPreviewURL(media) })
      setStatus('Foto lista. Guarda tu perfil para aplicarla.')
      showToast('guardado')
    } catch {
      setStatus('No se pudo subir la foto. Intenta nuevamente.')
      showToast('error-guardar')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleFileChange(file: File | undefined) {
    if (!file || !validateFile(file)) {
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    clearObjectURL()
    setSelectionBase({ id: avatarID, url: previewURL })
    objectURLRef.current = URL.createObjectURL(file)
    setPreviewURL(objectURLRef.current)
    setPendingFile(file)
    setStatus('Revisa la vista previa y confirma para subir esta foto.')
  }

  function cancelSelection() {
    clearObjectURL()
    setPendingFile(null)
    setAvatarID(selectionBase.id)
    setPreviewURL(selectionBase.url)
    setStatus(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function removeAvatar() {
    clearObjectURL()
    setPendingFile(null)
    setAvatarID('')
    setPreviewURL(null)
    setStatus('La foto se quitará al guardar el perfil.')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-4 sm:flex-row sm:items-center">
      <input name="avatar" type="hidden" value={avatarID} />
      <div className="relative h-24 w-24 flex-none self-center overflow-hidden rounded-full border-4 border-white bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] shadow-[0_12px_28px_rgba(7,20,45,0.16)] sm:self-auto">
        {previewURL ? (
          <Image
            alt={`Foto de perfil de ${name}`}
            className="h-full w-full object-cover"
            fill
            sizes="96px"
            src={previewURL}
            unoptimized
          />
        ) : (
          <span aria-hidden="true" className="grid h-full w-full place-items-center font-display text-3xl font-extrabold text-white">
            {getInitial(name)}
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <strong className="text-sm font-extrabold text-[var(--txdx-navy)]">Foto de perfil</strong>
          {uploading ? (
            <span className="rounded-full bg-[rgba(18,104,255,0.1)] px-2.5 py-1 text-[0.65rem] font-bold text-[var(--color-blue-600)]">
              Subiendo…
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs leading-5 text-[var(--theme-elevation-500)]">
          Aparecerá junto a tu nombre en los artículos publicados. Se recortará en formato circular.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex min-h-9 cursor-pointer items-center justify-center rounded-xl bg-[var(--txdx-blue)] px-3.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(18,104,255,0.24)] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[rgba(18,104,255,0.18)]">
            {previewURL ? 'Cambiar foto' : 'Elegir foto'}
            <input
              ref={inputRef}
              accept={ACCEPTED_TYPES.join(',')}
              className="sr-only"
              disabled={uploading}
              onChange={(event) => handleFileChange(event.target.files?.[0])}
              type="file"
            />
          </label>
          {pendingFile ? (
            <>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-xl bg-[var(--txdx-orange)] px-3.5 text-xs font-extrabold text-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(255,90,24,0.24)] disabled:cursor-wait disabled:opacity-60"
                disabled={uploading}
                onClick={() => void confirmUpload()}
                type="button"
              >
                Confirmar foto
              </button>
              <button
                className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3.5 text-xs font-bold text-[var(--theme-elevation-600)] transition hover:border-[var(--theme-elevation-400)]"
                disabled={uploading}
                onClick={cancelSelection}
                type="button"
              >
                Cancelar
              </button>
            </>
          ) : null}
          {!pendingFile && previewURL ? (
            <button
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3.5 text-xs font-bold text-[var(--theme-elevation-600)] transition hover:border-[var(--txdx-orange)] hover:text-[var(--txdx-orange)]"
              onClick={removeAvatar}
              type="button"
            >
              Quitar foto
            </button>
          ) : null}
        </div>
        {status ? <p className="mt-2 text-xs font-semibold text-[var(--theme-elevation-500)]" role="status">{status}</p> : null}
      </div>
    </div>
  )
}
