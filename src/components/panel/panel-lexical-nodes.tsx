'use client'

import {
  DecoratorNode,
  $getNodeByKey,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import Image from 'next/image'
import { useEffect, useState, type ReactNode } from 'react'

type SerializedUploadNode = Spread<
  {
    type: 'upload'
    version: 3
    id: string
    relationTo: string
    value: string
    fields?: Record<string, unknown>
    format: string
  },
  SerializedLexicalNode
>

export type UploadNodeData = {
  id: string
  relationTo: string
  value: string
  fields: Record<string, unknown>
}

export class CustomUploadNode extends DecoratorNode<ReactNode> {
  __data: UploadNodeData

  static getType(): string {
    return 'upload'
  }

  static importJSON(json: SerializedUploadNode): CustomUploadNode {
    return $createCustomUploadNode({
      id: json.id,
      relationTo: json.relationTo,
      value: json.value,
      fields: json.fields ?? {},
    })
  }

  static clone(node: CustomUploadNode): CustomUploadNode {
    return new CustomUploadNode(
      { ...node.__data, fields: { ...node.__data.fields } },
      node.__key,
    )
  }

  constructor(data: UploadNodeData, key?: NodeKey) {
    super(key)
    this.__data = data
  }

  getData(): UploadNodeData {
    return this.__data
  }

  updateData(fields: Record<string, unknown>): void {
    this.getWritable().__data = { ...this.__data, fields: { ...fields } }
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-upload', 'true')
    return element
  }

  updateDOM(): false {
    return false
  }

  decorate(): ReactNode {
    return <UploadPreview data={this.__data} nodeKey={this.getKey()} />
  }

  exportJSON(): SerializedUploadNode {
    return {
      type: 'upload',
      version: 3,
      id: this.__data.id,
      relationTo: this.__data.relationTo,
      value: this.__data.value,
      fields: this.__data.fields,
      format: '',
    }
  }

  isInline(): boolean {
    return false
  }
}

export function $createCustomUploadNode(data: {
  id?: string
  relationTo: string
  value: string
  fields?: Record<string, unknown>
}): CustomUploadNode {
  return new CustomUploadNode({
    id: data.id ?? crypto.randomUUID().replace(/-/g, '').slice(0, 24),
    relationTo: data.relationTo,
    value: data.value,
    fields: data.fields ?? {},
  })
}

type SerializedBlockNode = Spread<
  {
    type: 'block'
    version: 2
    fields: Record<string, unknown>
    format: string
  },
  SerializedLexicalNode
>

export class CustomBlockNode extends DecoratorNode<ReactNode> {
  __fields: Record<string, unknown>

  static getType(): string {
    return 'block'
  }

  static importJSON(json: SerializedBlockNode): CustomBlockNode {
    return $createCustomBlockNode(json.fields)
  }

  static clone(node: CustomBlockNode): CustomBlockNode {
    return new CustomBlockNode({ ...node.__fields }, node.__key)
  }

  constructor(fields: Record<string, unknown>, key?: NodeKey) {
    super(key)
    this.__fields = fields
  }

  getFields(): Record<string, unknown> {
    return this.__fields
  }

  updateFields(fields: Record<string, unknown>): void {
    this.getWritable().__fields = { ...fields }
  }

  createDOM(): HTMLElement {
    const element = document.createElement('div')
    element.setAttribute('data-lexical-block', 'true')
    return element
  }

  updateDOM(): false {
    return false
  }

  decorate(): ReactNode {
    return <BlockPreview fields={this.__fields} nodeKey={this.getKey()} />
  }

  exportJSON(): SerializedBlockNode {
    return {
      type: 'block',
      version: 2,
      fields: this.__fields,
      format: '',
    }
  }

  isInline(): boolean {
    return false
  }
}

export function $createCustomBlockNode(fields: Record<string, unknown>): CustomBlockNode {
  return new CustomBlockNode({
    ...fields,
    id: fields.id ?? crypto.randomUUID().replace(/-/g, '').slice(0, 24),
  })
}

function UploadPreview({ data, nodeKey }: { data: UploadNodeData; nodeKey: NodeKey }) {
  const initialURL = getUploadURL(data)
  const [resolvedURL, setResolvedURL] = useState<string | null>(initialURL)
  const alt = typeof data.fields.alt === 'string' ? data.fields.alt : 'Imagen del artículo'
  const caption = typeof data.fields.caption === 'string' ? data.fields.caption : ''

  useEffect(() => {
    if (initialURL || !data.value) return

    let cancelled = false
    void fetch(`/api/media/${encodeURIComponent(data.value)}`, { credentials: 'include' })
      .then(async (response) => (response.ok ? response.json() : null))
      .then((payload: unknown) => {
        if (cancelled || !payload || typeof payload !== 'object') return
        const raw = payload as {
          doc?: { sizes?: { card?: { url?: string }; thumbnail?: { url?: string } }; url?: string }
          sizes?: { card?: { url?: string }; thumbnail?: { url?: string } }
          url?: string
        }
        const media = raw.doc ?? raw
        const url = media.sizes?.card?.url || media.sizes?.thumbnail?.url || media.url
        if (typeof url === 'string' && url) setResolvedURL(url)
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [data.value, initialURL])

  return (
    <figure className="lexical-embed-card lexical-embed-card--upload">
      {resolvedURL ? (
        <div className="lexical-embed-card__media">
          <Image alt={alt} fill sizes="(max-width: 800px) 100vw, 720px" src={resolvedURL} unoptimized />
        </div>
      ) : (
        <div className="lexical-embed-card__icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
      )}
      <div className="lexical-embed-card__body">
        <span className="lexical-embed-card__type">Imagen editorial</span>
        <span className="lexical-embed-card__detail">{alt}</span>
      </div>
      {caption ? <figcaption>{caption}</figcaption> : null}
      <EmbedControls label="imagen" nodeKey={nodeKey} />
    </figure>
  )
}

const BLOCK_LABELS: Record<string, string> = {
  callout: 'Aviso técnico',
  mediaFeature: 'Imagen destacada',
  actionCard: 'Llamado a la acción',
  comparisonTable: 'Cuadro comparativo',
}

function BlockPreview({ fields, nodeKey }: { fields: Record<string, unknown>; nodeKey: NodeKey }) {
  const blockType = String(fields.blockType ?? '')
  const label = BLOCK_LABELS[blockType] ?? blockType
  const title = String(fields.title ?? fields.blockName ?? '')
  const body = String(fields.body ?? '')

  if (blockType === 'callout') {
    const tone = String(fields.tone ?? 'insight')
    return (
      <div>
        <aside className={`article-callout article-callout--${tone}`}>
          {fields.eyebrow ? <span>{String(fields.eyebrow)}</span> : null}
          <h3>{title}</h3>
          <p>{body || 'Añade el contenido del aviso técnico.'}</p>
        </aside>
        <EmbedControls label="aviso técnico" nodeKey={nodeKey} />
      </div>
    )
  }

  if (blockType === 'actionCard') {
    return (
      <div>
        <aside className="article-action-card">
          <div>
            <span>SIGUIENTE MOVIMIENTO</span>
            <h3>{title || 'Llamado a la acción'}</h3>
            {body ? <p>{body}</p> : null}
          </div>
          <a href={typeof fields.href === 'string' ? fields.href : '#'}>{String(fields.label || 'Continuar')} →</a>
        </aside>
        <EmbedControls label="llamado a la acción" nodeKey={nodeKey} />
      </div>
    )
  }

  return (
    <div className={`lexical-embed-card lexical-embed-card--block lexical-embed-card--${blockType}`}>
      <div className="lexical-embed-card__icon" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </div>
      <div className="lexical-embed-card__body">
        <span className="lexical-embed-card__type">{label}</span>
        {title ? <strong className="lexical-embed-card__detail">{title}</strong> : null}
        {body ? <span className="lexical-embed-card__detail">{body}</span> : null}
      </div>
      <EmbedControls label={label.toLowerCase()} nodeKey={nodeKey} />
    </div>
  )
}

function EmbedControls({ label, nodeKey }: { label: string; nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext()

  const move = (direction: 'down' | 'up') => {
    editor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (!node) return
      const sibling = direction === 'up' ? node.getPreviousSibling() : node.getNextSibling()
      if (!sibling) return
      if (direction === 'up') sibling.insertBefore(node)
      else sibling.insertAfter(node)
    })
  }

  return (
    <div className="lexical-embed-card__controls" contentEditable={false}>
      <button aria-label={`Mover ${label} arriba`} onClick={(event) => { event.stopPropagation(); move('up') }} type="button">↑</button>
      <button aria-label={`Mover ${label} abajo`} onClick={(event) => { event.stopPropagation(); move('down') }} type="button">↓</button>
    </div>
  )
}

function getUploadURL(data: UploadNodeData) {
  const directURL = [data.fields.url, data.fields.thumbnailURL].find(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )
  if (directURL) return directURL

  const filename = typeof data.fields.filename === 'string' ? data.fields.filename : ''
  return filename ? `/api/media/file/${encodeURIComponent(filename)}?prefix=editorial` : null
}
