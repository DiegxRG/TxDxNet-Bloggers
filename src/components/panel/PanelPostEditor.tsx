'use client'

import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Media, Post } from '@/payload-types'

import { PanelArticlePreview } from './PanelArticlePreview'
import { PanelDeletePostButton } from './PanelDeletePostButton'
import { PanelSubmitButton } from './PanelSubmitButton'

const PanelLexicalEditor = dynamic(
  () => import('./PanelLexicalEditor').then((mod) => mod.PanelLexicalEditor),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[24rem] animate-pulse rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-6">
        <div className="h-4 w-48 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-3 animate-pulse rounded bg-[var(--theme-elevation-100)]" style={{ width: `${60 + Math.random() * 40}%` }} />
          ))}
        </div>
      </div>
    ),
  },
)

export type PanelEditorMediaItem = {
  alt: string
  filename: string
  id: string
  thumbnailURL: null | string
}

type Props = {
  article: null | Post
  authorDefaults: {
    avatarURL?: null | string
    name: string
    role: string
  }
  contentLexicalValue?: DefaultTypedEditorState
  deleteAction?: (formData: FormData) => void | Promise<void>
  formAction: (formData: FormData) => void | Promise<void>
  mediaItems: PanelEditorMediaItem[]
  mode: 'create' | 'edit'
  previewCoverURL: null | string
  status: null | string
}

function getStatusAlert(status: null | string) {
  switch (status) {
    case 'creado':
      return {
        className:
          'border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.06)] text-[var(--color-blue-600)]',
        text: 'Borrador creado correctamente.',
      }
    case 'guardado':
      return {
        className:
          'border-[rgba(18,104,255,0.12)] bg-[rgba(18,104,255,0.06)] text-[var(--color-blue-600)]',
        text: 'Cambios guardados como borrador.',
      }
    case 'publicado':
      return {
        className:
          'border-[rgba(15,122,61,0.16)] bg-[rgba(15,122,61,0.08)] text-[#0f7a3d]',
        text: 'Articulo publicado correctamente.',
      }
    case 'error-publicar-portada':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'Falta imagen de portada para publicar. El borrador se guardo con exito — agrega una portada e intenta de nuevo.',
      }
    case 'error-publicar-contenido':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'Falta contenido del articulo para publicar. El borrador se guardo — escribe el contenido e intenta de nuevo.',
      }
    case 'error-publicar':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'No se pudo publicar. Revisa campos requeridos, slug unico y portada.',
      }
    case 'error-publicar-validacion':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'Revisa Resumen (obligatorio, máximo 320 caracteres) y Descripción SEO (máximo 170). El borrador sigue guardado.',
      }
    case 'error-publicar-favoritos':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'La portada admite hasta 3 favoritos. Quita el favorito de otro articulo o publica este sin marcarlo.',
      }
    case 'error-eliminar':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'No se pudo eliminar el artículo. Intenta de nuevo.',
      }
    case 'error-guardar':
    case 'error':
      return {
        className:
          'border-[rgba(255,90,24,0.16)] bg-[rgba(255,90,24,0.08)] text-[var(--txdx-orange)]',
        text: 'No se pudieron guardar los cambios. Intenta de nuevo.',
      }
    default:
      return null
  }
}

function getImageID(value: Media | null | string | undefined) {
  if (!value) return ''
  return typeof value === 'string' ? value : String(value.id)
}

type PreviewTab = 'card' | 'article'

type CharacterCounts = {
  excerpt: number
  seoDescription: number
  seoTitle: number
  title: number
}

function CharacterCounter({ max, required = false, value }: { max: number; required?: boolean; value: number }) {
  const over = value > max
  const missing = required && value === 0

  return (
    <span
      aria-live="polite"
      className={`text-xs font-semibold ${over || missing ? 'text-[var(--txdx-orange)]' : 'text-[var(--theme-elevation-500)]'}`}
    >
      {value}/{max}{over ? ' · excede el límite' : missing ? ' · obligatorio' : ''}
    </span>
  )
}

type LiveValues = {
  excerpt: string
  featured: boolean
  lexicalContent: DefaultTypedEditorState | undefined
  title: string
}

type PreviewArticle = {
  authorAvatar?: Post['authorAvatar']
  authorName?: string
  authorRole?: string
  content?: Post['content']
  excerpt?: string
  featured?: boolean
  publishedAt?: string
  slug?: string
  title?: string
}

function readLiveValues(form: HTMLFormElement): Omit<LiveValues, 'lexicalContent'> {
  const title = (form.elements.namedItem('title') as HTMLInputElement | null)?.value || ''
  const excerpt = (form.elements.namedItem('excerpt') as HTMLTextAreaElement | null)?.value || ''
  const featured = (form.elements.namedItem('featured') as HTMLInputElement | null)?.checked || false
  return { excerpt, featured, title }
}

export function PanelPostEditor({
  article,
  authorDefaults,
  contentLexicalValue,
  deleteAction,
  formAction,
  mediaItems,
  mode,
  previewCoverURL,
  status,
}: Props) {
  const alert = getStatusAlert(status)
  const currentCoverID = getImageID(article?.coverImage)
  const currentSocialID = getImageID(article?.socialImage)
  const isPublished = article?._status === 'published'
  const [previewTab, setPreviewTab] = useState<PreviewTab>('card')
  const [dismissedStatus, setDismissedStatus] = useState<null | string>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!status || status === dismissedStatus) return
    const timer = setTimeout(() => setDismissedStatus(status), 8000)
    return () => clearTimeout(timer)
  }, [status, dismissedStatus])
  const [liveValues, setLiveValues] = useState<LiveValues>({
    excerpt: article?.excerpt || '',
    featured: Boolean(article?.featured),
    lexicalContent: contentLexicalValue,
    title: article?.title || '',
  })
  const [characterCounts, setCharacterCounts] = useState<CharacterCounts>({
    excerpt: article?.excerpt?.length || 0,
    seoDescription: article?.seoDescription?.length || 0,
    seoTitle: article?.seoTitle?.length || 0,
    title: article?.title?.length || 0,
  })
  const [liveCoverURL, setLiveCoverURL] = useState<null | string>(previewCoverURL)
  const [selectedCoverID, setSelectedCoverID] = useState(currentCoverID)

  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleChange = (event: Event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null
      if (!target || !['coverImage', 'excerpt', 'featured', 'seoDescription', 'seoTitle', 'title'].includes(target.name)) return

      const values = readLiveValues(form)
      setLiveValues((prev) => ({ ...prev, ...values }))
      setCharacterCounts({
        excerpt: ((form.elements.namedItem('excerpt') as HTMLTextAreaElement | null)?.value || '').length,
        seoDescription: ((form.elements.namedItem('seoDescription') as HTMLTextAreaElement | null)?.value || '').length,
        seoTitle: ((form.elements.namedItem('seoTitle') as HTMLInputElement | null)?.value || '').length,
        title: ((form.elements.namedItem('title') as HTMLInputElement | null)?.value || '').length,
      })

      const coverRadio = form.elements.namedItem('coverImage') as RadioNodeList | null
      const selectedID = coverRadio?.value || ''
      setSelectedCoverID(selectedID)
      if (!selectedID) {
        setLiveCoverURL(null)
      } else {
        const match = mediaItems.find((m) => m.id === selectedID)
        setLiveCoverURL(match?.thumbnailURL || null)
      }
    }

    form.addEventListener('input', handleChange)
    form.addEventListener('change', handleChange)
    return () => {
      form.removeEventListener('input', handleChange)
      form.removeEventListener('change', handleChange)
    }
  }, [mediaItems])

  const handleLexicalChange = useCallback((state: DefaultTypedEditorState | undefined) => {
    setLiveValues((prev) => ({ ...prev, lexicalContent: state }))
  }, [])

  const previewArticle: PreviewArticle = {
    authorAvatar: article?.authorAvatar || authorDefaults.avatarURL,
    authorName: article?.authorName || authorDefaults.name,
    authorRole: article?.authorRole || authorDefaults.role,
    content: liveValues.lexicalContent || undefined,
    publishedAt: article?.publishedAt || undefined,
    slug: article?.slug,
    title: liveValues.title,
    excerpt: liveValues.excerpt,
    featured: liveValues.featured,
  }

  return (
    <div className="grid gap-5" id="contenido-panel">
      <section className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_20px_50px_rgba(7,20,45,0.06)] md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
              {mode === 'create' ? 'Nuevo borrador' : 'Editor propio'}
            </p>
            <h1 className="mt-3 font-display text-[clamp(2rem,3vw,3rem)] font-extrabold tracking-[-0.06em] text-[var(--txdx-navy)]">
              {mode === 'create' ? 'Crear articulo' : article?.title || 'Editar articulo'}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-5 text-[var(--theme-elevation-600)]">
              {mode === 'create'
                ? 'Empieza el borrador y publica cuando quede listo.'
                : 'Edita contenido, portada y ajustes desde un solo lugar.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {article?.id ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--txdx-orange)] px-5 text-sm font-extrabold text-[var(--txdx-orange)] transition hover:bg-[var(--txdx-orange)] hover:text-white"
                href={`/articulos/preview/${article.id}`}
                prefetch={false}
                target="_blank"
              >
                Vista pública
              </Link>
            ) : null}
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[var(--theme-elevation-200)] px-5 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]"
              href="/panel/articulos"
            >
              Volver a articulos
            </Link>
            {isPublished && article?.slug ? (
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[var(--txdx-orange)] px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
                href={`/articulos/${article.slug}`}
                prefetch={false}
                target="_blank"
              >
                Ver publicacion
              </Link>
            ) : null}
            {mode === 'edit' && deleteAction ? <PanelDeletePostButton action={deleteAction} /> : null}
          </div>
        </div>

        {alert && status !== dismissedStatus ? (
          <div className={`mt-6 flex items-start justify-between gap-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${alert.className}`}>
            <p>{alert.text}</p>
            <button
              className="mt-0.5 shrink-0 rounded-lg p-1 transition hover:bg-black/5"
              onClick={() => setDismissedStatus(status)}
              type="button"
              aria-label="Cerrar"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        ) : null}
      </section>

      <form action={formAction} className="grid gap-5" ref={formRef}>
        <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_18px_44px_rgba(7,20,45,0.05)] md:p-7">
          <div className="grid gap-5 xl:grid-cols-[1fr_0.42fr]">
            <div className="grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Titulo</span>
                <input
                  className={`min-h-[3.25rem] w-full rounded-2xl border bg-white px-4 text-base font-semibold text-[var(--theme-elevation-800)] outline-none transition focus:ring-4 ${characterCounts.title > 70 || characterCounts.title === 0 ? 'border-[var(--txdx-orange)] focus:border-[var(--txdx-orange)] focus:ring-[rgba(255,90,24,0.12)]' : 'border-[var(--theme-elevation-200)] focus:border-[var(--txdx-blue)] focus:ring-[rgba(18,104,255,0.12)]'}`}
                  defaultValue={article?.title || ''}
                  name="title"
                  aria-invalid={characterCounts.title > 70 || characterCounts.title === 0}
                  required
                  placeholder="Ej.: Operar con claridad en entornos hiperconectados"
                  type="text"
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter max={70} required value={characterCounts.title} />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Slug</span>
                <input
                  className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                  defaultValue={article?.slug || ''}
                  name="slug"
                  placeholder="se-genera-si-lo-dejas-vacio"
                  type="text"
                />
                <span className="mt-2 block text-sm leading-5 text-[var(--theme-elevation-500)]">
                  Si queda vacio, se genera desde el titulo.
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Resumen</span>
                <textarea
                  className={`min-h-28 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6 text-[var(--theme-elevation-800)] outline-none transition focus:ring-4 ${characterCounts.excerpt > 320 || characterCounts.excerpt === 0 ? 'border-[var(--txdx-orange)] focus:border-[var(--txdx-orange)] focus:ring-[rgba(255,90,24,0.12)]' : 'border-[var(--theme-elevation-200)] focus:border-[var(--txdx-blue)] focus:ring-[rgba(18,104,255,0.12)]'}`}
                  defaultValue={article?.excerpt || ''}
                  name="excerpt"
                  aria-invalid={characterCounts.excerpt > 320 || characterCounts.excerpt === 0}
                  required
                  placeholder="Una sintesis breve que explique por que vale la pena leerlo."
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter max={320} required value={characterCounts.excerpt} />
                </div>
              </label>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.35rem] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
                  Publicacion
                </p>
                <div className="mt-4 grid gap-4">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Fecha de publicacion</span>
                    <input
                      className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                      defaultValue={article?.publishedAt ? article.publishedAt.slice(0, 16) : ''}
                      name="publishedAt"
                      type="datetime-local"
                    />
                    <span className="mt-2 block text-xs leading-5 text-[var(--theme-elevation-500)]">
                      Si la dejas vacia, se registra automaticamente al publicar.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-elevation-150)] bg-white px-4 py-4">
                    <input className="mt-1 h-4 w-4" defaultChecked={Boolean(article?.featured)} name="featured" type="checkbox" />
                    <span>
                      <strong className="block text-sm text-[var(--txdx-navy)]">Marcar como favorito</strong>
                      <span className="mt-1 block text-xs leading-5 text-[var(--theme-elevation-500)]">
                        Aparecera en los libros destacados de la portada. Puedes tener hasta 3 favoritos publicados.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="rounded-[1.35rem] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-5">
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
                  Firma publica
                </p>
                <div className="mt-4 grid gap-2 rounded-2xl border border-[var(--theme-elevation-150)] bg-white px-4 py-3 text-sm text-[var(--theme-elevation-600)]">
                  <div className="flex items-baseline justify-between gap-3">
                    <strong className="text-xs text-[var(--theme-elevation-500)]">Autor</strong>
                    <span className="text-right font-semibold text-[var(--txdx-navy)]">{article?.authorName || authorDefaults.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <strong className="text-xs text-[var(--theme-elevation-500)]">Cargo</strong>
                    <span className="text-right text-[var(--txdx-navy)]">{article?.authorRole || authorDefaults.role || 'Sin cargo'}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-[var(--theme-elevation-500)]">
                  Viene de tu perfil editorial.
                </p>
              </div>

              <input name="authorName" type="hidden" value={article?.authorName || authorDefaults.name} />
              <input name="authorRole" type="hidden" value={article?.authorRole || authorDefaults.role} />

              <div className="flex flex-wrap gap-3 pt-1">
                {mode === 'create' ? (
                  <PanelSubmitButton pendingLabel="Creando borrador...">Crear borrador</PanelSubmitButton>
                ) : (
                  <>
                    <PanelSubmitButton name="intent" pendingLabel="Guardando..." value="draft" variant="dark">
                      Guardar borrador
                    </PanelSubmitButton>
                    <PanelSubmitButton name="intent" pendingLabel="Publicando..." value="publish">
                      Publicar
                    </PanelSubmitButton>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_18px_44px_rgba(7,20,45,0.05)] md:p-7">
          <div className="mx-auto max-w-[1280px]">
            <div className="mb-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
                Contenido
              </p>
              <h2 className="mt-2 font-display text-[1.35rem] font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                Editor del articulo
              </h2>
            </div>

            <PanelLexicalEditor
              initialValue={contentLexicalValue}
              name="contentLexical"
              onChange={handleLexicalChange}
            />
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_18px_44px_rgba(7,20,45,0.05)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
              Portada y media
            </p>
            <h2 className="mt-2 font-display text-[1.3rem] font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
              Selecciona una portada reciente
            </h2>

            <div className="mt-5 grid gap-3">
              <input
                checked={!selectedCoverID}
                className="peer sr-only"
                id="cover-none"
                name="coverImage"
                onChange={() => setSelectedCoverID('')}
                type="radio"
                value=""
              />

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  {selectedCoverID && mediaItems.find((m) => m.id === selectedCoverID)?.thumbnailURL ? (
                    <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-[var(--theme-elevation-100)]">
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="64px"
                        src={mediaItems.find((m) => m.id === selectedCoverID)?.thumbnailURL || ''}
                      />
                    </span>
                  ) : null}
                  <span className="min-w-0 text-sm font-semibold text-[var(--theme-elevation-600)]">
                    {selectedCoverID
                      ? `Portada seleccionada: ${mediaItems.find((m) => m.id === selectedCoverID)?.filename || 'imagen seleccionada'}`
                      : 'Sin portada seleccionada'}
                  </span>
                </div>
                {selectedCoverID ? (
                  <button
                    className="ml-3 shrink-0 rounded-xl border border-[var(--theme-elevation-200)] bg-white px-3 py-1.5 text-xs font-bold text-[var(--theme-elevation-600)] transition hover:border-[var(--txdx-orange)] hover:text-[var(--txdx-orange)]"
                    onClick={() => {
                      const radio = document.getElementById('cover-none') as HTMLInputElement | null
                      radio?.click()
                    }}
                    type="button"
                  >
                    Quitar portada
                  </button>
                ) : null}
              </div>

              <div aria-label="Portadas disponibles" className="flex snap-x gap-3 overflow-x-auto pb-3" role="region">
                {mediaItems.slice(0, 6).map((item) => (
                  <label className="group relative w-[min(19rem,78vw)] shrink-0 snap-start cursor-pointer" key={`cover-${item.id}`}>
                    <input
                      checked={selectedCoverID === item.id}
                      className="peer sr-only"
                      name="coverImage"
                      onChange={() => setSelectedCoverID(item.id)}
                      type="radio"
                      value={item.id}
                    />
                    <span className="absolute right-3 top-3 z-10 hidden items-center gap-1.5 rounded-full bg-[var(--txdx-blue)] px-3 py-1.5 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-white shadow-[0_8px_20px_rgba(18,104,255,0.35)] peer-checked:flex">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Elegida
                    </span>
                    <div className="overflow-hidden rounded-[1.35rem] border-2 border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] transition-all duration-200 hover:border-[var(--color-blue-150)] hover:shadow-[0_8px_24px_rgba(7,20,45,0.08)] peer-checked:border-[var(--txdx-blue)] peer-checked:shadow-[0_0_0_3px_rgba(18,104,255,0.18),0_16px_40px_rgba(18,104,255,0.2)] peer-checked:scale-[1.02]">
                      <div className="relative aspect-[16/10] bg-[var(--theme-elevation-100)]">
                        {item.thumbnailURL ? (
                          <Image alt={item.alt || item.filename} fill sizes="(max-width: 768px) 100vw, 280px" src={item.thumbnailURL} />
                        ) : (
                          <div className="grid h-full place-items-center text-sm font-extrabold text-[var(--theme-elevation-500)]">Sin preview</div>
                        )}
                      </div>
                      <div className="px-4 py-3">
                        <p className="line-clamp-2 text-sm font-bold text-[var(--txdx-navy)]">{item.filename}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              <label className="block pt-2">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Imagen social (opcional)</span>
                <select
                  className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                  defaultValue={currentSocialID}
                  name="socialImage"
                >
                  <option value="">Si la dejas vacía, se usa la portada del artículo.</option>
                  {mediaItems.map((item) => (
                    <option key={`social-${item.id}`} value={item.id}>
                      {item.filename}
                    </option>
                  ))}
                </select>
              </label>

              <Link className="text-sm font-bold text-[var(--color-blue-600)]" href="/panel/biblioteca">
                Ver biblioteca completa
              </Link>
            </div>
          </section>

          <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_18px_44px_rgba(7,20,45,0.05)]">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
              SEO y control (opcional)
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-6 text-[var(--theme-elevation-500)]">
              Puedes dejar toda esta sección vacía. El artículo usará automáticamente su título, resumen, portada y URL pública.
            </p>

            <div className="mt-5 grid gap-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Título SEO (opcional)</span>
                <input
                  autoComplete="off"
                  className={`min-h-12 w-full rounded-2xl border bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:ring-4 ${characterCounts.seoTitle > 70 ? 'border-[var(--txdx-orange)] focus:border-[var(--txdx-orange)] focus:ring-[rgba(255,90,24,0.12)]' : 'border-[var(--theme-elevation-200)] focus:border-[var(--txdx-blue)] focus:ring-[rgba(18,104,255,0.12)]'}`}
                  defaultValue={article?.seoTitle || ''}
                  name="seoTitle"
                  aria-invalid={characterCounts.seoTitle > 70}
                  type="text"
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter max={70} value={characterCounts.seoTitle} />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">Descripción SEO (opcional)</span>
                <textarea
                  autoComplete="off"
                  className={`min-h-24 w-full rounded-2xl border bg-white px-4 py-3 text-sm leading-6 text-[var(--theme-elevation-800)] outline-none transition focus:ring-4 ${characterCounts.seoDescription > 170 ? 'border-[var(--txdx-orange)] focus:border-[var(--txdx-orange)] focus:ring-[rgba(255,90,24,0.12)]' : 'border-[var(--theme-elevation-200)] focus:border-[var(--txdx-blue)] focus:ring-[rgba(18,104,255,0.12)]'}`}
                  defaultValue={article?.seoDescription || ''}
                  name="seoDescription"
                  aria-invalid={characterCounts.seoDescription > 170}
                />
                <div className="mt-1 flex justify-end">
                  <CharacterCounter max={170} value={characterCounts.seoDescription} />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-[var(--txdx-navy)]">URL canónica (opcional)</span>
                <input
                  className="min-h-12 w-full rounded-2xl border border-[var(--theme-elevation-200)] bg-white px-4 text-sm text-[var(--theme-elevation-800)] outline-none transition focus:border-[var(--txdx-blue)] focus:ring-4 focus:ring-[rgba(18,104,255,0.12)]"
                  defaultValue={article?.canonicalURL || ''}
                  name="canonicalURL"
                  type="url"
                />
              </label>

              <label className="flex items-start gap-3 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-4 py-4">
                <input className="mt-1 h-4 w-4" defaultChecked={Boolean(article?.noindex)} name="noindex" type="checkbox" />
                <span>
                  <strong className="block text-sm text-[var(--txdx-navy)]">No indexar</strong>
                  <span className="mt-1 block text-xs leading-6 text-[var(--theme-elevation-500)]">
                    Solo si no quieres que aparezca en buscadores.
                  </span>
                </span>
              </label>
            </div>
          </section>
        </div>

        <section className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-[0_18px_44px_rgba(7,20,45,0.05)] md:p-7">
          <div className="flex items-center gap-4">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
              Vista previa
            </p>
            <div className="flex gap-2">
              <button
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  previewTab === 'card'
                    ? 'bg-[var(--txdx-navy)] text-white'
                    : 'border border-[var(--theme-elevation-200)] bg-white text-[var(--theme-elevation-600)] hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]'
                }`}
                onClick={() => setPreviewTab('card')}
                type="button"
              >
                Card web
              </button>
              <button
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                  previewTab === 'article'
                    ? 'bg-[var(--txdx-navy)] text-white'
                    : 'border border-[var(--theme-elevation-200)] bg-white text-[var(--theme-elevation-600)] hover:border-[var(--color-blue-150)] hover:text-[var(--color-blue-600)]'
                }`}
                onClick={() => setPreviewTab('article')}
                type="button"
              >
                Articulo completo
              </button>
            </div>
          </div>

          <div className="mt-5">
            <PanelArticlePreview
              article={previewArticle}
              authorDefaults={authorDefaults}
              coverURL={liveCoverURL}
              mediaItems={mediaItems}
              tab={previewTab}
            />
          </div>
        </section>
      </form>
    </div>
  )
}
