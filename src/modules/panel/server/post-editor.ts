import 'server-only'

import { convertHTMLToLexical, convertMarkdownToLexical, editorConfigFactory } from '@payloadcms/richtext-lexical'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { BasePayload } from 'payload'
import { JSDOM } from 'jsdom'

import { editorialEditor } from '@/editor'
import type { Post } from '@/payload-types'

type RichTextValue = Post['content']

type TextNode = {
  detail: number
  format: number
  mode: string
  style: string
  text: string
  type: 'text'
  version: 1
}

type LineBreakNode = {
  type: 'linebreak'
  version: 1
}

type ParagraphNode = {
  children: Array<LineBreakNode | TextNode>
  direction: 'ltr' | null
  format: ''
  indent: 0
  textFormat: 0
  textStyle: ''
  type: 'paragraph'
  version: 1
}

function createTextNode(text: string): TextNode {
  return {
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    text,
    type: 'text',
    version: 1,
  }
}

function createLineBreakNode(): LineBreakNode {
  return {
    type: 'linebreak',
    version: 1,
  }
}

function createParagraphNode(text: string): ParagraphNode {
  const lines = text.split('\n')
  const children: Array<LineBreakNode | TextNode> = []

  lines.forEach((line, index) => {
    children.push(createTextNode(line))

    if (index < lines.length - 1) {
      children.push(createLineBreakNode())
    }
  })

  if (children.length === 0) {
    children.push(createTextNode(''))
  }

  return {
    children,
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    type: 'paragraph',
    version: 1,
  }
}

export function buildPlainRichText(value: string): RichTextValue {
  const normalized = value.replace(/\r\n?/g, '\n').trim()
  const paragraphs = normalized.length > 0 ? normalized.split(/\n{2,}/) : ['']

  return {
    root: {
      type: 'root',
      children: paragraphs.map((paragraph) => createParagraphNode(paragraph)),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

export async function buildMarkdownRichText(payload: BasePayload, value: string): Promise<RichTextValue> {
  const normalized = value.replace(/\r\n?/g, '\n').trim()

  if (!normalized) {
    return buildPlainRichText('')
  }

  const editorConfig = await editorConfigFactory.fromEditor({
    config: payload.config,
    editor: editorialEditor,
    isRoot: true,
    parentIsLocalized: false,
  })

  return convertMarkdownToLexical({
    editorConfig,
    markdown: normalized,
  }) as RichTextValue
}

export async function buildHTMLRichText(payload: BasePayload, value: string): Promise<RichTextValue> {
  const normalized = value.trim()

  if (!normalized) {
    return buildPlainRichText('')
  }

  const editorConfig = await editorConfigFactory.fromEditor({
    config: payload.config,
    editor: editorialEditor,
    isRoot: true,
    parentIsLocalized: false,
  })

  return convertHTMLToLexical({
    editorConfig,
    html: normalized,
    JSDOM,
  }) as RichTextValue
}

export function richTextToPlainText(value: null | RichTextValue | undefined): string {
  if (!value) return ''

  try {
    return convertLexicalToPlaintext({ data: value }).trim()
  } catch {
    return ''
  }
}

export function plainTextToEditableHTML(value: string) {
  const normalized = value.replace(/\r\n?/g, '\n').trim()

  if (!normalized) {
    return '<p></p>'
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br />')}</p>`)
    .join('')
}

function isSimpleTextNode(node: unknown): node is TextNode {
  if (!node || typeof node !== 'object') return false

  const candidate = node as Partial<TextNode>

  return (
    candidate.type === 'text' &&
    typeof candidate.text === 'string' &&
    candidate.format === 0 &&
    candidate.detail === 0 &&
    candidate.mode === 'normal' &&
    candidate.style === ''
  )
}

function isSimpleLineBreakNode(node: unknown): node is LineBreakNode {
  return Boolean(node && typeof node === 'object' && (node as LineBreakNode).type === 'linebreak')
}

function isSimpleParagraphNode(node: unknown): node is ParagraphNode {
  if (!node || typeof node !== 'object') return false

  const candidate = node as Partial<ParagraphNode>

  if (
    candidate.type !== 'paragraph' ||
    !Array.isArray(candidate.children) ||
    candidate.format !== '' ||
    candidate.indent !== 0 ||
    candidate.textFormat !== 0 ||
    candidate.textStyle !== ''
  ) {
    return false
  }

  return candidate.children.every((child) => isSimpleTextNode(child) || isSimpleLineBreakNode(child))
}

export function canEditSimpleContent(value: null | RichTextValue | undefined) {
  if (!value?.root || !Array.isArray(value.root.children)) return true

  return value.root.children.every((child) => isSimpleParagraphNode(child))
}

export function formatDateTimeInput(value: null | string | undefined) {
  if (!value) return ''

  const formatter = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const parts = formatter.formatToParts(new Date(value))
  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`
}

export function parseDateTimeInput(value: string) {
  const normalized = value.trim()

  if (!normalized) return null

  return `${normalized}:00-05:00`
}
