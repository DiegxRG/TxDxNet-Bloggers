'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'

type Props = {
  action: (formData: FormData) => void | Promise<void>
  compact?: boolean
  postID?: string
}

function SubmitDeleteButton() {
  const { pending } = useFormStatus()

  return (
    <button
      className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-[var(--txdx-orange)] px-4 text-sm font-extrabold text-white transition hover:bg-[#e34f13] disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? 'Eliminando…' : 'Sí, eliminar artículo'}
    </button>
  )
}

export function PanelDeletePostButton({ action, compact = false, postID }: Props) {
  const [confirming, setConfirming] = useState(false)

  if (!confirming) {
    return (
      <button
        aria-label="Eliminar articulo"
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(255,90,24,0.24)] bg-[rgba(255,90,24,0.08)] text-sm font-extrabold text-[var(--txdx-orange)] transition hover:-translate-y-0.5 hover:bg-[rgba(255,90,24,0.14)] ${compact ? 'px-3' : 'min-h-12 px-5'}`}
        onClick={() => setConfirming(true)}
        type="button"
      >
        <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Eliminar artículo
      </button>
    )
  }

  return (
    <div className="w-full rounded-2xl border border-[rgba(255,90,24,0.2)] bg-[rgba(255,90,24,0.06)] p-4 sm:w-auto sm:max-w-md">
      <p className="text-sm font-bold text-[var(--txdx-navy)]">¿Eliminar este artículo?</p>
      <p className="mt-1 text-xs leading-5 text-[var(--theme-elevation-600)]">
        Se eliminarán el borrador, la publicación y sus versiones. Las imágenes de la biblioteca se conservan.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form action={action}>
          {postID ? <input name="postID" type="hidden" value={postID} /> : null}
          <SubmitDeleteButton />
        </form>
        <button
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm font-bold text-[var(--theme-elevation-700)]"
          onClick={() => setConfirming(false)}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
