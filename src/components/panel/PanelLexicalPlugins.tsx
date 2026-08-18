'use client'

import { $generateNodesFromDOM } from '@lexical/html'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  PASTE_COMMAND,
} from 'lexical'
import { useEffect } from 'react'

import { $createCustomUploadNode, type UploadNodeData } from './panel-lexical-nodes'
import { PayloadLinkPlugins } from './payload-link'

function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url, window.location.origin)
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) || parsed.origin === window.location.origin
  } catch {
    return false
  }
}

const SAFE_PASTE_STYLES = ['background-color', 'color', 'font-style', 'font-weight', 'text-align', 'text-decoration']

function sanitizeInlineStyles(value: string) {
  const declaration = document.createElement('span').style
  declaration.cssText = value

  return SAFE_PASTE_STYLES.flatMap((property) => {
    const propertyValue = declaration.getPropertyValue(property).trim()
    if (!propertyValue || /url\s*\(|expression\s*\(|javascript:|[{};]/i.test(propertyValue)) return []
    return [`${property}: ${propertyValue}`]
  }).join('; ')
}

function sanitizePastedHTML(html: string): Document {
  const document = new DOMParser().parseFromString(html, 'text/html')

  document.querySelectorAll('script, style, meta, link, xml, o\\:p').forEach((element) => element.remove())
  document.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      if (name === 'href' && element.tagName === 'A' && isSafeURL(attribute.value)) continue
      if (name === 'alt' && element.tagName === 'IMG') continue
      if (name === 'style') {
        const safeStyle = sanitizeInlineStyles(attribute.value)
        if (safeStyle) element.setAttribute('style', safeStyle)
        else element.removeAttribute(attribute.name)
        continue
      }
      element.removeAttribute(attribute.name)
    }

    if (element.tagName === 'A') {
      const href = element.getAttribute('href')
      if (!href || !isSafeURL(href)) element.replaceWith(...Array.from(element.childNodes))
    }
  })

  document.querySelectorAll('img').forEach((image) => image.remove())
  return document
}

async function uploadImage(file: File): Promise<UploadNodeData | null> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch('/api/media', {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })
  if (!response.ok) return null

  const media = (await response.json()) as {
    alt?: string
    filename?: string
    id?: string
    sizes?: { card?: { url?: string } }
    url?: string
    doc?: { alt?: string; filename?: string; id?: string; sizes?: { card?: { url?: string } }; url?: string }
  }
  const doc = media.doc ?? media
  const id = doc.id
  if (!id) return null
  const fileURL = doc.url || media.url || (doc.filename ? `/api/media/file/${encodeURIComponent(doc.filename)}?prefix=editorial` : '')

  return {
    id,
    relationTo: 'media',
    value: id,
    fields: {
      alt: doc.alt || doc.filename || file.name,
      filename: doc.filename || file.name,
      thumbnailURL: doc.sizes?.card?.url || fileURL,
      url: fileURL,
    },
  }
}

export function PanelLexicalPlugins() {
  return (
    <>
      <PayloadLinkPlugins />
      <MarkdownShortcutPlugin />
      <TabIndentationPlugin maxIndent={4} />
      <TablePlugin hasCellBackgroundColor hasHorizontalScroll />
      <PastePlugin />
    </>
  )
}

function PastePlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand<ClipboardEvent>(
      PASTE_COMMAND,
      (event) => {
        const html = event.clipboardData?.getData('text/html') || ''
        const files = Array.from(event.clipboardData?.files || []).filter((file) => file.type.startsWith('image/'))
        if (!html && files.length === 0) return false

        event.preventDefault()
        const sanitized = html ? sanitizePastedHTML(html) : null

        if (sanitized) {
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) return
            $insertNodes($generateNodesFromDOM(editor, sanitized))
          })
        }

        if (files.length) {
          void Promise.all(files.map(uploadImage)).then((uploads) => {
            const nodes = uploads.filter(Boolean).map((data) =>
              $createCustomUploadNode({
                id: data!.id,
                relationTo: data!.relationTo,
                value: data!.value,
                fields: data!.fields,
              }),
            )
            if (!nodes.length) return
            editor.update(() => {
              const selection = $getSelection()
              if ($isRangeSelection(selection)) $insertNodes(nodes)
            })
          })
        }

        return true
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor])

  return null
}
