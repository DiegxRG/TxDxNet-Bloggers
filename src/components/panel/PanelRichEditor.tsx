'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

type MediaItem = {
  filename: string
  id: string
  thumbnailURL: null | string
}

type Props = {
  mediaItems: MediaItem[]
  name: string
  placeholder: string
  value: string
}

type FormatState = {
  block: 'blockquote' | 'h1' | 'h2' | 'p'
  bold: boolean
  italic: boolean
  underline: boolean
}

type SlashAction = {
  description: string
  id: string
  keywords: string[]
  label: string
}

const SLASH_ACTIONS: SlashAction[] = [
  { id: 'h1', label: 'Titulo', description: 'Titulo principal', keywords: ['titulo', 'h1', 'heading'] },
  { id: 'h2', label: 'Subtitulo', description: 'Subtitulo de seccion', keywords: ['subtitulo', 'h2'] },
  { id: 'ul', label: 'Lista', description: 'Lista con viñetas', keywords: ['lista', 'bullet'] },
  { id: 'ol', label: 'Numerada', description: 'Lista ordenada', keywords: ['numerada', 'ordenada'] },
  { id: 'callout', label: 'Callout', description: 'Bloque destacado', keywords: ['callout', 'bloque', 'quote'] },
  { id: 'divider', label: 'Separador', description: 'Linea horizontal', keywords: ['divider', 'separador', 'linea'] },
  { id: 'image', label: 'Imagen', description: 'Abrir selector de imagen', keywords: ['imagen', 'media', 'foto'] },
  { id: 'link', label: 'Link', description: 'Insertar enlace', keywords: ['link', 'url', 'enlace'] },
]

function normalizeHTML(value: string) {
  return value.trim().length > 0 ? value : '<p></p>'
}

function isLikelyURL(value: string) {
  return /^(https?:\/\/|www\.)/i.test(value.trim())
}

export function PanelRichEditor({ mediaItems, name, placeholder, value }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [html, setHtml] = useState(normalizeHTML(value))
  const [formatState, setFormatState] = useState<FormatState>({
    block: 'p',
    bold: false,
    italic: false,
    underline: false,
  })
  const [showMedia, setShowMedia] = useState(false)
  const [slashIndex, setSlashIndex] = useState(0)
  const [slashState, setSlashState] = useState<null | { query: string; x: number; y: number }>(null)
  const [uploadingInline, setUploadingInline] = useState(false)
  const [bubble, setBubble] = useState<null | { x: number; y: number }>(null)
  const savedRange = useRef<Range | null>(null)
  const [blockHandle, setBlockHandle] = useState<null | { x: number; y: number }>(null)
  const [blockMenuOpen, setBlockMenuOpen] = useState(false)
  const hoveredBlock = useRef<HTMLElement | null>(null)

  const BLOCK_TAGS = new Set(['p', 'h1', 'h2', 'h3', 'blockquote', 'li', 'hr'])

  const getBlockElement = (node: Node | null): HTMLElement | null => {
    let current = node
    while (current && current !== editorRef.current) {
      if (current instanceof HTMLElement && BLOCK_TAGS.has(current.tagName.toLowerCase())) {
        return current
      }
      current = current.parentNode
    }
    return null
  }

  const handleEditorMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (blockMenuOpen) return
    const editor = editorRef.current
    if (!editor) return

    const target = e.target as HTMLElement
    const block = target === editor ? null : getBlockElement(target)

    if (block && block !== editor) {
      const rect = block.getBoundingClientRect()
      const editorRect = editor.getBoundingClientRect()
      setBlockHandle({
        x: editorRect.left - rect.left + 8,
        y: rect.top - editorRect.top + 2,
      })
      hoveredBlock.current = block
    } else {
      setBlockHandle(null)
      hoveredBlock.current = null
    }
  }

  const handleEditorMouseLeave = () => {
    if (!blockMenuOpen) {
      setBlockHandle(null)
      hoveredBlock.current = null
    }
  }

  const moveBlock = (direction: 'down' | 'up') => {
    const block = hoveredBlock.current
    if (!block) return
    const sibling = direction === 'up' ? block.previousElementSibling : block.nextElementSibling
    if (!sibling || !(sibling instanceof HTMLElement)) return

    const parent = block.parentNode
    if (!parent) return

    if (direction === 'up') {
      parent.insertBefore(block, sibling)
    } else {
      parent.insertBefore(sibling, block)
    }
    syncFromEditor()
    setBlockMenuOpen(false)
    setBlockHandle(null)
  }

  const deleteBlock = () => {
    const block = hoveredBlock.current
    if (!block) return
    const parent = block.parentNode
    if (!parent) return

    const next = block.nextElementSibling || block.previousElementSibling
    block.remove()
    syncFromEditor()
    setBlockMenuOpen(false)
    setBlockHandle(null)

    if (next instanceof HTMLElement) {
      const range = document.createRange()
      range.setStart(next, 0)
      range.collapse(true)
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
  }

  const convertToBlock = (tag: 'h1' | 'h2' | 'p') => {
    const block = hoveredBlock.current
    if (!block) return
    const tagLower = block.tagName.toLowerCase()
    if (tagLower === tag) return

    const newEl = document.createElement(tag)
    newEl.innerHTML = block.innerHTML
    block.parentNode?.replaceChild(newEl, block)
    hoveredBlock.current = newEl
    syncFromEditor()
    setBlockMenuOpen(false)
  }

  const insertImageBelow = () => {
    const block = hoveredBlock.current
    if (!block) return
    const p = document.createElement('p')
    p.innerHTML = '<br />'
    block.after(p)
    setShowMedia(true)
    syncFromEditor()
    setBlockMenuOpen(false)
    setBlockHandle(null)
  }

  const visibleSlashActions = slashState
    ? SLASH_ACTIONS.filter((action) => {
        const q = slashState.query.trim().toLowerCase()
        if (!q) return true
        return [action.label, action.description, ...action.keywords].some((value) =>
          value.toLowerCase().includes(q),
        )
      })
    : []

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return
    if (editor.innerHTML !== html) {
      editor.innerHTML = html
    }
  }, [html])

  const syncFromEditor = () => {
    const editor = editorRef.current
    if (!editor) return
    setHtml(normalizeHTML(editor.innerHTML))
    updateSlashState()
    updateFormatState()
  }

  const updateFormatState = () => {
    const selection = window.getSelection()
    const editor = editorRef.current
    if (!selection || !editor || selection.rangeCount === 0) return

    const anchorNode = selection.anchorNode
    if (!anchorNode || !editor.contains(anchorNode)) return

    const bold = document.queryCommandState('bold')
    const italic = document.queryCommandState('italic')
    const underline = document.queryCommandState('underline')

    let block: FormatState['block'] = 'p'
    let currentNode: Node | null = anchorNode

    while (currentNode && currentNode !== editor) {
      if (currentNode instanceof HTMLElement) {
        const tag = currentNode.tagName.toLowerCase()
        if (tag === 'h1' || tag === 'h2' || tag === 'blockquote' || tag === 'p') {
          block = tag
          break
        }
      }

      currentNode = currentNode.parentNode
    }

    setFormatState({ block, bold, italic, underline })
  }

  const updateBubble = () => {
    const selection = window.getSelection()
    const editor = editorRef.current
    if (!selection || !editor || selection.rangeCount === 0 || selection.isCollapsed) {
      setBubble(null)
      savedRange.current = null
      return
    }

    const focusNode = selection.focusNode
    if (!focusNode || !editor.contains(focusNode)) {
      setBubble(null)
      savedRange.current = null
      return
    }

    const range = selection.getRangeAt(0)
    savedRange.current = range.cloneRange()

    const rect = range.getBoundingClientRect()
    const editorRect = editor.getBoundingClientRect()

    const x = Math.max(0, (rect.left + rect.right) / 2 - editorRect.left)
    const y = rect.top - editorRect.top - 50

    setBubble({ x, y })
  }

  const runCommand = (command: string, value?: string) => {
    const editor = editorRef.current
    if (!editor) return

    if (savedRange.current) {
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(savedRange.current)
      }
    }

    editor.focus()
    document.execCommand(command, false, value)
    syncFromEditor()
  }

  const setBlock = (tag: 'H1' | 'H2' | 'BLOCKQUOTE' | 'P') => {
    runCommand('formatBlock', tag)
  }

  const insertHTML = (snippet: string) => {
    runCommand('insertHTML', snippet)
  }

  const closeSlash = () => {
    setSlashState(null)
    setSlashIndex(0)
  }

  const updateSlashState = () => {
    const editor = editorRef.current
    const selection = window.getSelection()
    if (!editor || !selection || selection.rangeCount === 0 || !selection.isCollapsed) {
      closeSlash()
      return
    }

    const focusNode = selection.focusNode
    if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE) {
      closeSlash()
      return
    }

    const offset = selection.focusOffset
    const textValue = focusNode.textContent?.slice(0, offset) || ''
    const match = textValue.match(/(?:^|\s)\/([a-z-]*)$/i)

    if (!match) {
      closeSlash()
      return
    }

    const range = selection.getRangeAt(0).cloneRange()
    range.collapse(true)
    const rect = range.getBoundingClientRect()
    const hostRect = editor.getBoundingClientRect()

    setSlashState({
      query: match[1] || '',
      x: rect.left - hostRect.left,
      y: rect.bottom - hostRect.top + 12,
    })
    setSlashIndex(0)
  }

  const removeSlashCommandFromTextNode = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const focusNode = selection.focusNode
    if (!focusNode || focusNode.nodeType !== Node.TEXT_NODE) return

    const textNode = focusNode as Text
    const before = textNode.textContent?.slice(0, selection.focusOffset) || ''
    const after = textNode.textContent?.slice(selection.focusOffset) || ''
    const slashStart = before.lastIndexOf('/')
    if (slashStart < 0) return

    textNode.textContent = `${before.slice(0, slashStart)}${after}`
    const range = document.createRange()
    range.setStart(textNode, slashStart)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)
  }

  const runSlashAction = (actionID: string) => {
    editorRef.current?.focus()
    removeSlashCommandFromTextNode()

    switch (actionID) {
      case 'h1':
        setBlock('H1')
        break
      case 'h2':
        setBlock('H2')
        break
      case 'ul':
        runCommand('insertUnorderedList')
        break
      case 'ol':
        runCommand('insertOrderedList')
        break
      case 'callout':
        insertHTML('<blockquote><strong>Insight.</strong> Escribe aqui la idea destacada.</blockquote><p></p>')
        break
      case 'divider':
        insertHTML('<hr /><p></p>')
        break
      case 'image':
        setShowMedia(true)
        break
      case 'link':
        promptForLink()
        break
      default:
        break
    }

    closeSlash()
  }

  const promptForLink = () => {
    const selection = window.getSelection()?.toString().trim()
    const url = window.prompt('Pega la URL', 'https://')
    if (!url) return

    if (selection) {
      runCommand('createLink', url)
      return
    }

    insertHTML(`<a href="${url}">${url}</a>`)
  }

  const uploadInlineImage = async (file: File) => {
    setUploadingInline(true)

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/media', { method: 'POST', body: form })
      if (!res.ok) return

      const data = (await res.json()) as { filename?: string; id?: string; thumbnailURL?: string | null; url?: string | null }
      if (!data.id || !data.url) return

      const label = data.filename || 'Imagen'
      insertHTML(`<p><img src="${data.url}" alt="${label}" /></p>`)
    } finally {
      setUploadingInline(false)
    }
  }

  useEffect(() => {
    const handler = () => {
      updateFormatState()
      updateBubble()
    }
    document.addEventListener('selectionchange', handler)
    return () => document.removeEventListener('selectionchange', handler)
  }, [])

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const editor = editorRef.current
      if (!editor) return
      if (editor.contains(e.target as Node)) return
      setBubble(null)
      savedRange.current = null
      setBlockMenuOpen(false)
      setBlockHandle(null)
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  const toolbarButtonClass = (active = false) =>
    `inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-semibold transition ${
      active
        ? 'border-[var(--txdx-blue)] bg-[rgba(18,104,255,0.08)] text-[var(--txdx-blue)] shadow-[0_8px_18px_rgba(18,104,255,0.12)]'
        : 'border-[var(--theme-elevation-150)] bg-white text-[var(--theme-elevation-700)] hover:border-[var(--theme-elevation-250)] hover:text-[var(--txdx-navy)]'
    }`

  const handlePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const files = Array.from(event.clipboardData.files || [])
    if (files.length > 0) {
      event.preventDefault()
      await uploadInlineImage(files[0])
      return
    }

    const pasted = event.clipboardData.getData('text')
    if (!pasted || !isLikelyURL(pasted)) return
    const selected = window.getSelection()?.toString().trim()
    if (!selected) return

    event.preventDefault()
    runCommand('createLink', pasted.trim())
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    const files = Array.from(event.dataTransfer.files || [])
    if (files.length === 0) return
    event.preventDefault()
    await uploadInlineImage(files[0])
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'b') {
        event.preventDefault()
        runCommand('bold')
        return
      }
      if (event.key === 'i') {
        event.preventDefault()
        runCommand('italic')
        return
      }
      if (event.key === 'u') {
        event.preventDefault()
        runCommand('underline')
        return
      }
    }

    if (slashState && visibleSlashActions.length > 0) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setSlashIndex((current) => (current + 1) % visibleSlashActions.length)
        return
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setSlashIndex((current) => (current - 1 + visibleSlashActions.length) % visibleSlashActions.length)
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        runSlashAction(visibleSlashActions[slashIndex]?.id || visibleSlashActions[0].id)
        return
      }

      if (event.key === 'Escape') {
        event.preventDefault()
        closeSlash()
      }
    }
  }

  return (
    <div className="mt-5 rounded-[1.5rem] border border-[var(--theme-elevation-200)] bg-[var(--theme-elevation-0)] shadow-[0_10px_30px_rgba(7,20,45,0.04)]">
      <div className="sticky top-0 z-10 border-b border-[var(--theme-elevation-150)] bg-[rgba(255,255,255,0.9)] px-4 py-3 backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-2 py-2">
            <span className="px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
              Estilo
            </span>
            <select
              className="h-10 rounded-xl border border-[var(--theme-elevation-150)] bg-white px-3 text-sm font-semibold text-[var(--theme-elevation-700)] outline-none"
              onChange={(event) => {
                const value = event.target.value as 'BLOCKQUOTE' | 'H1' | 'H2' | 'P'
                setBlock(value)
              }}
              value={formatState.block.toUpperCase()}
            >
              <option value="P">Parrafo</option>
              <option value="H1">Titulo</option>
              <option value="H2">Subtitulo</option>
              <option value="BLOCKQUOTE">Callout</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-2 py-2">
            <span className="px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
              Formato
            </span>
            <button className={toolbarButtonClass(formatState.bold)} onClick={() => runCommand('bold')} title="Negrita" type="button"><strong>B</strong></button>
            <button className={toolbarButtonClass(formatState.italic)} onClick={() => runCommand('italic')} title="Itálica" type="button"><em>I</em></button>
            <button className={toolbarButtonClass(formatState.underline)} onClick={() => runCommand('underline')} title="Subrayado" type="button"><span className="underline">U</span></button>
            <button className={toolbarButtonClass()} onClick={promptForLink} title="Link" type="button">Link</button>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] px-2 py-2">
            <span className="px-2 text-[0.68rem] font-extrabold uppercase tracking-[0.16em] text-[var(--theme-elevation-500)]">
              Bloques
            </span>
            <button className={toolbarButtonClass()} onClick={() => runCommand('insertUnorderedList')} type="button">Lista</button>
            <button className={toolbarButtonClass()} onClick={() => runCommand('insertOrderedList')} type="button">1.</button>
            <button className={toolbarButtonClass(showMedia)} onClick={() => setShowMedia((current) => !current)} type="button">Imagen</button>
            <button className={toolbarButtonClass()} onClick={() => insertHTML('<hr />')} type="button">---</button>
            <button className={toolbarButtonClass()} onClick={() => runCommand('removeFormat')} type="button">Limpiar</button>
          </div>
        </div>
      </div>

      {showMedia ? (
        <div className="border-b border-[var(--theme-elevation-150)] px-4 py-4">
          <p className="text-sm font-semibold text-[var(--theme-elevation-600)]">Inserta una imagen del repositorio actual</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {mediaItems.slice(0, 6).map((item) => (
              <button
                className="overflow-hidden rounded-2xl border border-[var(--theme-elevation-150)] bg-white text-left transition hover:border-[var(--color-blue-150)]"
                key={item.id}
                onClick={() => {
                  const src = item.thumbnailURL || ''
                  if (!src) return
                  insertHTML(`<p><img src="${src}" alt="${item.filename}" /></p>`)
                  setShowMedia(false)
                }}
                type="button"
              >
                <div className="relative aspect-[16/10] bg-[var(--theme-elevation-100)]">
                  {item.thumbnailURL ? <Image alt={item.filename} fill sizes="240px" src={item.thumbnailURL} /> : null}
                </div>
                <div className="px-3 py-3 text-sm font-semibold text-[var(--txdx-navy)]">{item.filename}</div>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <div className="relative">
          <div
            className="min-h-[480px] w-full rounded-b-[1.5rem] px-6 py-5 pl-10 text-[0.96rem] leading-8 text-[var(--theme-elevation-800)] outline-none focus:ring-0 [&_blockquote]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--txdx-orange)] [&_blockquote]:bg-[rgba(255,90,24,0.06)] [&_blockquote]:px-5 [&_blockquote]:py-4 [&_blockquote]:pl-4 [&_h1]:text-4xl [&_h1]:font-extrabold [&_h1]:tracking-[-0.05em] [&_h2]:text-2xl [&_h2]:font-bold [&_img]:my-4 [&_img]:rounded-2xl [&_img]:max-h-[360px] [&_img]:w-full [&_img]:object-contain [&_p]:my-0 [&_ul]:pl-6 [&_ol]:pl-6"
            contentEditable
            data-placeholder={placeholder}
            onMouseMove={handleEditorMouseMove}
            onMouseLeave={handleEditorMouseLeave}
            onDrop={(event) => void handleDrop(event)}
            onInput={syncFromEditor}
            onKeyDown={handleKeyDown}
            onKeyUp={updateSlashState}
            onPaste={(event) => void handlePaste(event)}
            ref={editorRef}
            suppressContentEditableWarning
          />

          {slashState && visibleSlashActions.length > 0 ? (
            <div
              className="absolute z-20 w-[280px] overflow-hidden rounded-2xl border border-[var(--theme-elevation-150)] bg-white shadow-[0_18px_40px_rgba(7,20,45,0.12)]"
              style={{ left: `${Math.max(0, slashState.x)}px`, top: `${slashState.y}px` }}
            >
              <div className="border-b border-[var(--theme-elevation-150)] px-4 py-3 text-xs font-extrabold uppercase tracking-[0.18em] text-[var(--color-blue-500)]">
                Inserta rapido
              </div>
              <div className="max-h-[280px] overflow-auto py-2">
                {visibleSlashActions.map((action, index) => (
                  <button
                    className={`flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition ${
                      index === slashIndex ? 'bg-[rgba(18,104,255,0.06)]' : 'hover:bg-[var(--theme-elevation-50)]'
                    }`}
                    key={action.id}
                    onMouseDown={(event) => {
                      event.preventDefault()
                      runSlashAction(action.id)
                    }}
                    type="button"
                  >
                    <span>
                      <strong className="block text-sm text-[var(--txdx-navy)]">/{action.label.toLowerCase()}</strong>
                      <span className="mt-1 block text-xs text-[var(--theme-elevation-500)]">{action.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {bubble && !slashState ? (
            <div
              className="absolute z-30 flex items-center gap-1 rounded-2xl border border-[var(--theme-elevation-150)] bg-white px-1.5 py-1 shadow-[0_12px_32px_rgba(7,20,45,0.18)] transition-opacity"
              style={{ left: `${bubble.x}px`, top: `${bubble.y}px`, transform: 'translateX(-50%)' }}
            >
              <button
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-bold transition ${formatState.bold ? 'bg-[var(--txdx-navy)] text-white' : 'text-[var(--theme-elevation-700)] hover:bg-[var(--theme-elevation-50)]'}`}
                onMouseDown={(e) => { e.preventDefault(); runCommand('bold') }}
                title="Negrita (Ctrl+B)"
                type="button"
              >
                <strong>B</strong>
              </button>
              <button
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-bold transition ${formatState.italic ? 'bg-[var(--txdx-navy)] text-white' : 'text-[var(--theme-elevation-700)] hover:bg-[var(--theme-elevation-50)]'}`}
                onMouseDown={(e) => { e.preventDefault(); runCommand('italic') }}
                title="Itálica (Ctrl+I)"
                type="button"
              >
                <em>I</em>
              </button>
              <button
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-bold transition ${formatState.underline ? 'bg-[var(--txdx-navy)] text-white' : 'text-[var(--theme-elevation-700)] hover:bg-[var(--theme-elevation-50)]'}`}
                onMouseDown={(e) => { e.preventDefault(); runCommand('underline') }}
                title="Subrayado (Ctrl+U)"
                type="button"
              >
                <span className="underline">U</span>
              </button>
              <div className="mx-0.5 h-5 w-px bg-[var(--theme-elevation-150)]" />
              <button
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]"
                onMouseDown={(e) => { e.preventDefault(); promptForLink() }}
                title="Insertar link"
                type="button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                className="inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2.5 text-sm font-bold text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]"
                onMouseDown={(e) => { e.preventDefault(); runCommand('removeFormat') }}
                title="Limpiar formato"
                type="button"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          ) : null}

          {blockHandle && !blockMenuOpen && !slashState && !bubble ? (
            <button
              className="absolute z-10 flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--theme-elevation-200)] bg-white text-[var(--theme-elevation-400)] shadow-sm transition hover:border-[var(--color-blue-150)] hover:bg-[var(--theme-elevation-50)] hover:text-[var(--color-blue-600)]"
              style={{ left: `${Math.max(0, blockHandle.x - 14)}px`, top: `${blockHandle.y}px` }}
              onClick={(e) => {
                e.preventDefault()
                setBlockMenuOpen(true)
              }}
              onMouseDown={(e) => e.preventDefault()}
              type="button"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : null}

          {blockMenuOpen && blockHandle ? (
            <div
              className="absolute z-30 w-[200px] overflow-hidden rounded-2xl border border-[var(--theme-elevation-150)] bg-white py-1 shadow-[0_18px_40px_rgba(7,20,45,0.15)]"
              style={{ left: `${Math.max(0, blockHandle.x - 14)}px`, top: `${blockHandle.y + 32}px` }}
            >
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]" onMouseDown={(e) => { e.preventDefault(); moveBlock('up') }} type="button">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Mover arriba
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]" onMouseDown={(e) => { e.preventDefault(); moveBlock('down') }} type="button">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 5v14M19 12l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Mover abajo
              </button>
              <div className="my-1 h-px bg-[var(--theme-elevation-100)]" />
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]" onMouseDown={(e) => { e.preventDefault(); convertToBlock('h1') }} type="button">
                H1
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]" onMouseDown={(e) => { e.preventDefault(); convertToBlock('h2') }} type="button">
                H2
              </button>
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]" onMouseDown={(e) => { e.preventDefault(); convertToBlock('p') }} type="button">
                Parrafo
              </button>
              <div className="my-1 h-px bg-[var(--theme-elevation-100)]" />
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--theme-elevation-700)] transition hover:bg-[var(--theme-elevation-50)]" onMouseDown={(e) => { e.preventDefault(); insertImageBelow() }} type="button">
                Insertar imagen
              </button>
              <div className="my-1 h-px bg-[var(--theme-elevation-100)]" />
              <button className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--txdx-orange)] transition hover:bg-[rgba(255,90,24,0.06)]" onMouseDown={(e) => { e.preventDefault(); deleteBlock() }} type="button">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Eliminar bloque
              </button>
            </div>
          ) : null}
        </div>
        <input name={name} type="hidden" value={html} />
        <div className="flex items-center justify-between rounded-b-[1.5rem] border-t border-[var(--theme-elevation-150)] px-5 py-3 text-xs text-[var(--theme-elevation-500)]">
          <span>{uploadingInline ? 'Subiendo imagen...' : 'Usa / para insertar bloques, pega imagen o arrastrala al cuerpo.'}</span>
          <span>{html.replace(/<[^>]+>/g, '').trim().length} caracteres</span>
        </div>
      </div>
    </div>
  )
}
