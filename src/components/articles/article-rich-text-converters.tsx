import type { JSXConverterArgs, JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import Image from 'next/image'
import type { SerializedLexicalNode } from 'lexical'

import { getMediaURL } from '@/modules/content/domain/media-url'
import type {
  ActionCardBlock,
  CalloutBlock,
  ComparisonTableBlock,
  Media,
  MediaFeatureBlock,
  Post,
} from '@/payload-types'

function safeHref(value: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(value) ? value : '#'
}

function getLinkData(node: JSXConverterArgs['node']) {
  const raw = node as unknown as {
    fields?: { linkType?: string; newTab?: boolean; url?: string }
    linkType?: string
    newTab?: boolean
    rel?: string
    target?: string
    url?: string
  }
  const fields = raw.fields || raw
  const newTab = Boolean(fields.newTab || raw.target === '_blank')
  const href = safeHref(typeof fields.url === 'string' ? fields.url : raw.url || '')

  return {
    href,
    newTab,
  }
}

function renderLink({ node, nodesToJSX }: JSXConverterArgs) {
  const { href, newTab } = getLinkData(node)
  const childNodes = (node as unknown as { children?: SerializedLexicalNode[] }).children || []
  return (
    <a href={href} rel={newTab ? 'noopener noreferrer' : undefined} target={newTab ? '_blank' : undefined}>
      {nodesToJSX({ nodes: childNodes })}
    </a>
  )
}

function mediaAlt(media: Media | string | null | undefined, fallback: string) {
  return media && typeof media === 'object' ? media.alt || fallback : fallback
}

function parseComparison(value: unknown) {
  const headers = Array.isArray((value as { headers?: unknown })?.headers)
    ? (value as { headers: unknown[] }).headers.filter((item): item is string => typeof item === 'string')
    : []
  const rows = Array.isArray((value as { rows?: unknown })?.rows)
    ? (value as { rows: unknown[] }).rows.filter(
        (item): item is { cells: string[]; label: string } =>
          Boolean(item) &&
          typeof item === 'object' &&
          typeof (item as { label?: unknown }).label === 'string' &&
          Array.isArray((item as { cells?: unknown }).cells),
      )
    : []

  return { headers, rows }
}

type UploadURLResolver = (id: string) => null | string

function getUploadURL(
  fields: Record<string, unknown>,
  value: unknown,
  resolveUploadURL?: UploadURLResolver,
) {
  const directURL = [fields.url, fields.thumbnailURL].find(
    (item): item is string => typeof item === 'string' && item.length > 0,
  )
  if (directURL) return directURL

  return typeof value === 'string' ? resolveUploadURL?.(value) || null : null
}

function renderUpload(
  { node }: JSXConverterArgs,
  resolveUploadURL?: UploadURLResolver,
) {
  const raw = node as unknown as {
    fields?: Record<string, unknown>
    value?: unknown
  }
  const fields = raw.fields || {}
  const imageURL = getUploadURL(fields, raw.value, resolveUploadURL)
  if (!imageURL) return null

  const alt = typeof fields.alt === 'string' ? fields.alt : 'Imagen del artículo'
  const caption = typeof fields.caption === 'string' ? fields.caption : ''

  return (
    <figure className="article-media article-media--wide">
      <div>
        <Image
          alt={alt}
          fill
          sizes="(max-width: 960px) 100vw, 1200px"
          src={imageURL}
          unoptimized
        />
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  )
}

export function createArticleConverters(resolveUploadURL?: UploadURLResolver): JSXConvertersFunction {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    autolink: renderLink,
    blocks: {
      actionCard: ({ node }: JSXConverterArgs) => {
        const fields = (node as unknown as { fields: ActionCardBlock }).fields
        return (
          <aside className="article-action-card">
            <div>
              <span>SIGUIENTE MOVIMIENTO</span>
              <h3>{fields.title}</h3>
              {fields.body ? <p>{fields.body}</p> : null}
            </div>
            <a href={safeHref(fields.href)}>{fields.label} →</a>
          </aside>
        )
      },
      callout: ({ node }: JSXConverterArgs) => {
        const fields = (node as unknown as { fields: CalloutBlock }).fields
        return (
          <aside className={`article-callout article-callout--${fields.tone}`}>
            {fields.eyebrow ? <span>{fields.eyebrow}</span> : null}
            <h3>{fields.title}</h3>
            <p>{fields.body}</p>
          </aside>
        )
      },
      comparisonTable: ({ node }: JSXConverterArgs) => {
        const fields = (node as unknown as { fields: ComparisonTableBlock }).fields
        const { headers, rows } = parseComparison(fields)
        if (!headers.length || !rows.length) return null

        return (
          <figure className="article-comparison">
            <figcaption>
              <strong>{fields.title}</strong>
              {fields.caption ? <span>{fields.caption}</span> : null}
            </figcaption>
            <div className="article-comparison__scroll">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Criterio</th>
                    {headers.map((header) => <th key={header} scope="col">{header}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.label}-${index}`}>
                      <th scope="row">{row.label}</th>
                      {headers.map((_, cellIndex) => <td key={`${row.label}-${cellIndex}`}>{row.cells[cellIndex] || '—'}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        )
      },
      mediaFeature: ({ node }: JSXConverterArgs) => {
        const fields = (node as unknown as { fields: MediaFeatureBlock }).fields
        const imageURL = getMediaURL(fields.media, 'hero')
        if (!imageURL) return null

        return (
          <figure className={`article-media article-media--${fields.layout}`}>
            <div>
              <Image
                alt={mediaAlt(fields.media, fields.caption || 'Imagen del artículo')}
                fill
                sizes="(max-width: 960px) 100vw, 1200px"
                src={imageURL}
              />
            </div>
            {fields.caption ? <figcaption>{fields.caption}</figcaption> : null}
          </figure>
        )
      },
    },
    link: renderLink,
    upload: (args: JSXConverterArgs) => renderUpload(args, resolveUploadURL),
  })
}

export const articleConverters: JSXConvertersFunction = createArticleConverters()

export function getArticleRichTextData(data: Post['content']) {
  return data
}
