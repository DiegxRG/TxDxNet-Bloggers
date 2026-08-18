'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical'
import { $findMatchingParent } from '@lexical/utils'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@payloadcms/richtext-lexical/client'
import { INSERT_TABLE_COMMAND } from '@lexical/table'
import { $setBlocksType } from '@lexical/selection'
import { $createHeadingNode, $isHeadingNode, type HeadingTagType } from '@lexical/rich-text'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
} from '@lexical/list'
import { $createQuoteNode, $isQuoteNode } from '@lexical/rich-text'
import { $createParagraphNode } from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  $createCustomBlockNode,
  $createCustomUploadNode,
} from './panel-lexical-nodes'

type ActiveFormats = {
  bold: boolean
  heading: string
  italic: boolean
  list: 'ol' | 'ul' | null
  quote: boolean
  strikethrough: boolean
  underline: boolean
}

const EMPTY_FORMATS: ActiveFormats = {
  bold: false,
  heading: '',
  italic: false,
  list: null,
  quote: false,
  strikethrough: false,
  underline: false,
}

type BlockDef = {
  blockType: string
  label: string
  defaults: Record<string, unknown>
}

const BLOCKS: BlockDef[] = [
  {
    blockType: 'callout',
    label: 'Aviso técnico',
    defaults: { blockType: 'callout', tone: 'insight', eyebrow: '', title: 'Nuevo aviso', body: '' },
  },
  {
    blockType: 'mediaFeature',
    label: 'Imagen destacada',
    defaults: { blockType: 'mediaFeature', media: null, layout: 'wide', caption: '' },
  },
  {
    blockType: 'actionCard',
    label: 'Llamado a la acción',
    defaults: { blockType: 'actionCard', title: '', body: '', label: '', href: '' },
  },
  {
    blockType: 'comparisonTable',
    label: 'Cuadro comparativo',
    defaults: {
      blockType: 'comparisonTable',
      caption: '',
      headers: ['Opción A', 'Opción B'],
      rows: [{ label: 'Criterio', cells: ['Descripción', 'Descripción'] }],
      title: 'Comparativa',
    },
  },
]

export function PanelLexicalToolbar() {
  const [editor] = useLexicalComposerContext()
  const [formats, setFormats] = useState<ActiveFormats>(EMPTY_FORMATS)
  const [showBlocks, setShowBlocks] = useState(false)
  const [showTables, setShowTables] = useState(false)
  const blocksRef = useRef<HTMLDivElement>(null)
  const tablesRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const sel = $getSelection()
        if (!$isRangeSelection(sel)) {
          setFormats(EMPTY_FORMATS)
          return
        }

        let heading = ''
        const parent = sel.anchor.getNode().getParent()
        if (parent && $isHeadingNode(parent)) {
          heading = parent.getTag()
        }

        let list: 'ol' | 'ul' | null = null
        if (parent && $isListNode(parent)) {
          list = parent.getListType() === 'number' ? 'ol' : 'ul'
        }

        setFormats({
          bold: sel.hasFormat('bold'),
          heading,
          italic: sel.hasFormat('italic'),
          list,
          quote: parent ? $isQuoteNode(parent) : false,
          strikethrough: sel.hasFormat('strikethrough'),
          underline: sel.hasFormat('underline'),
        })
      })
    })
  }, [editor])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (blocksRef.current && !blocksRef.current.contains(e.target as Node)) {
        setShowBlocks(false)
      }
      if (tablesRef.current && !tablesRef.current.contains(e.target as Node)) {
        setShowTables(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const toggleHeading = useCallback(
    (tag: HeadingTagType) => {
      editor.update(() => {
        const sel = $getSelection()
        if (!$isRangeSelection(sel)) return
        const parent = sel.anchor.getNode().getParent()
        if (parent && $isHeadingNode(parent) && parent.getTag() === tag) {
          $setBlocksType(sel, $createParagraphNode)
        } else {
          $setBlocksType(sel, () => $createHeadingNode(tag))
        }
      })
    },
    [editor],
  )

  const toggleQuote = useCallback(() => {
    editor.update(() => {
      const sel = $getSelection()
      if (!$isRangeSelection(sel)) return
      const parent = sel.anchor.getNode().getParent()
      if (parent && $isQuoteNode(parent)) {
        $setBlocksType(sel, $createParagraphNode)
      } else {
        $setBlocksType(sel, $createQuoteNode)
      }
    })
  }, [editor])

  const toggleList = useCallback(
    (type: 'ol' | 'ul') => {
      if (formats.list === type) {
        editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
      } else if (type === 'ol') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
      } else {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
      }
    },
    [editor, formats.list],
  )

  const toggleLink = useCallback(() => {
    let currentURL = ''
    let hasSelection = false

    editor.getEditorState().read(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection) || selection.isCollapsed()) return
      hasSelection = true
      const parent = $findMatchingParent(selection.anchor.getNode(), (node) => $isLinkNode(node))
      if (parent && $isLinkNode(parent)) {
        const fields = parent.getFields()
        currentURL = typeof fields.url === 'string' ? fields.url : ''
      }
    })

    if (!hasSelection) {
      window.alert('Selecciona el texto que quieres convertir en enlace.')
      return
    }

    const value = window.prompt('URL del enlace', currentURL)
    if (value === null) return
    const url = value.trim()
    if (!url) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
      return
    }
    if (!/^(https?:\/\/|mailto:|\/)/i.test(url)) {
      window.alert('Usa una URL http, https, mailto o una ruta interna.')
      return
    }
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
      fields: { doc: null, linkType: 'custom', newTab: false, url },
      text: null,
    })
  }, [editor])

  const insertBlock = useCallback(
    (block: BlockDef) => {
      editor.update(() => {
        const sel = $getSelection()
        if (!$isRangeSelection(sel)) return
        const node = $createCustomBlockNode({ ...block.defaults })
        sel.insertNodes([node])
      })
      setShowBlocks(false)
    },
    [editor],
  )

  const insertTable = useCallback(
    (rows: string, columns: string) => {
      editor.dispatchCommand(INSERT_TABLE_COMMAND, { columns, rows, includeHeaders: true })
      setShowTables(false)
    },
    [editor],
  )

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      e.target.value = ''

      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/media', {
          method: 'POST',
          body: fd,
          credentials: 'include',
        })
        if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
        const media = (await res.json()) as {
          alt?: string
          filename?: string
          id?: string
          sizes?: { card?: { url?: string } }
          url?: string
          doc?: {
            alt?: string
            filename?: string
            id?: string
            sizes?: { card?: { url?: string } }
            url?: string
          }
        }
        const doc = media.doc ?? media
        const mediaID = doc.id
        if (!mediaID) throw new Error('Media response did not include an id')
        const fileURL = doc.url || media.url || (doc.filename ? `/api/media/file/${encodeURIComponent(doc.filename)}?prefix=editorial` : '')

        editor.update(() => {
          const sel = $getSelection()
          if (!$isRangeSelection(sel)) return
          const node = $createCustomUploadNode({
            id: mediaID,
            relationTo: 'media',
            value: mediaID,
            fields: {
              alt: doc.alt || doc.filename || file.name,
              caption: '',
              filename: doc.filename || file.name,
              thumbnailURL: doc.sizes?.card?.url || fileURL,
              url: fileURL,
            },
          })
          sel.insertNodes([node])
        })
      } catch {
        alert('No se pudo subir la imagen. Intenta de nuevo.')
      } finally {
        setUploading(false)
      }
    },
    [editor],
  )

  return (
    <div className="panel-toolbar">
      <div className="panel-toolbar__row">
        <div className="panel-toolbar__group">
          <TBtn active={formats.bold} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} title="Negrita (Ctrl+B)">
            <strong>B</strong>
          </TBtn>
          <TBtn active={formats.italic} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} title="Cursiva (Ctrl+I)">
            <em>I</em>
          </TBtn>
          <TBtn active={formats.underline} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} title="Subrayado (Ctrl+U)">
            <span style={{ textDecoration: 'underline' }}>U</span>
          </TBtn>
          <TBtn active={formats.strikethrough} onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')} title="Tachado">
            <span style={{ textDecoration: 'line-through' }}>S</span>
          </TBtn>
          <TBtn onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')} title="Código inline">
            <span className="font-mono text-xs">&lt;/&gt;</span>
          </TBtn>
        </div>

        <Divider />

        <div className="panel-toolbar__group">
          <TBtn active={formats.heading === 'h1'} onClick={() => toggleHeading('h1')} title="Encabezado 1">
            H1
          </TBtn>
          <TBtn active={formats.heading === 'h2'} onClick={() => toggleHeading('h2')} title="Encabezado 2">
            H2
          </TBtn>
          <TBtn active={formats.heading === 'h3'} onClick={() => toggleHeading('h3')} title="Encabezado 3">
            H3
          </TBtn>
        </div>

        <Divider />

        <div className="panel-toolbar__group">
          <TBtn active={formats.list === 'ul'} onClick={() => toggleList('ul')} title="Lista con viñetas">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>
          </TBtn>
          <TBtn active={formats.list === 'ol'} onClick={() => toggleList('ol')} title="Lista numerada">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="3" y="8" fontSize="7" fill="currentColor" stroke="none">1</text><text x="3" y="14" fontSize="7" fill="currentColor" stroke="none">2</text><text x="3" y="20" fontSize="7" fill="currentColor" stroke="none">3</text></svg>
          </TBtn>
        </div>

        <Divider />

        <div className="panel-toolbar__group">
          <TBtn active={formats.quote} onClick={toggleQuote} title="Cita">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" /></svg>
          </TBtn>
          <TBtn onClick={toggleLink} title="Insertar o editar enlace (Ctrl+K)">
            <span aria-hidden="true">↗</span>
          </TBtn>
        </div>

        <Divider />

        <div className="panel-toolbar__group">
          <TBtn
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            title="Insertar imagen"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
          </TBtn>
          <div className="panel-toolbar__relative" ref={tablesRef}>
            <TBtn active={showTables} onClick={() => setShowTables((value) => !value)} title="Insertar tabla">
              <span aria-hidden="true">▦</span>
            </TBtn>
            {showTables ? (
              <div className="panel-toolbar__dropdown">
                <p className="panel-toolbar__dropdown-label">Tamaño de tabla</p>
                {[
                  ['2', '2'],
                  ['3', '3'],
                  ['3', '4'],
                  ['4', '4'],
                  ['5', '4'],
                ].map(([rows, columns]) => (
                  <button
                    className="panel-toolbar__dropdown-item"
                    key={`${rows}-${columns}`}
                    onClick={() => insertTable(rows, columns)}
                    type="button"
                  >
                    {rows} × {columns} con encabezado
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            type="file"
          />
          <div className="panel-toolbar__relative" ref={blocksRef}>
            <TBtn active={showBlocks} onClick={() => setShowBlocks(!showBlocks)} title="Insertar bloque">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </TBtn>
            {showBlocks ? (
              <div className="panel-toolbar__dropdown">
                {BLOCKS.map((b) => (
                  <button
                    className="panel-toolbar__dropdown-item"
                    key={b.blockType}
                    onClick={() => insertBlock(b)}
                    type="button"
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <Divider />

        <div className="panel-toolbar__group">
          <TBtn onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)} title="Deshacer (Ctrl+Z)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" /></svg>
          </TBtn>
          <TBtn onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)} title="Rehacer (Ctrl+Shift+Z)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.13-9.36L23 10" /></svg>
          </TBtn>
        </div>
      </div>
    </div>
  )
}

function TBtn({
  active,
  disabled,
  onClick,
  title,
  children,
}: {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      className={`panel-toolbar__btn${active ? ' panel-toolbar__btn--active' : ''}`}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault()
        onClick()
      }}
      title={title}
      type="button"
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span className="panel-toolbar__divider" />
}
