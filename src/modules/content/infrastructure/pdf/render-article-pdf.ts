import type PDFKit from 'pdfkit'

import { getMediaURL } from '@/modules/content/domain/media-url'
import type { Media, Post } from '@/payload-types'

const INK = '#07142d'
const MUTED = '#415574'
const SOFT = '#61718a'
const ACCENT = '#ff5a18'
const RULE = '#c9d3e0'

const CALLOUT_TONES: Record<string, { bar: string; background: string }> = {
  insight: { bar: '#2563eb', background: '#eff4ff' },
  security: { bar: '#0f766e', background: '#ecfdf8' },
  warning: { bar: '#b45309', background: '#fff7e8' },
  result: { bar: '#15803d', background: '#edfbf1' },
}

type TextRun = {
  kind: 'text'
  text: string
  bold: boolean
  italic: boolean
  strike: boolean
  code: boolean
  link?: string
}

type InlineRun = { kind: 'break' } | TextRun

type SequenceOptions = {
  size: number
  gap: number
  color: string
  width?: number
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function arrayOf(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function safeHref(value: string) {
  return /^(https?:\/\/|mailto:|\/)/i.test(value) ? value : ''
}

function absolutize(origin: string, url: string) {
  return /^(https?:)?\/\//i.test(url) ? url : new URL(url, origin).toString()
}

function contentWidthOf(doc: PDFKit.PDFDocument) {
  return doc.page.width - doc.page.margins.left - doc.page.margins.right
}

function bottomLimitOf(doc: PDFKit.PDFDocument) {
  return doc.page.height - doc.page.margins.bottom
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > bottomLimitOf(doc)) doc.addPage()
}

function fontFor(run: TextRun) {
  if (run.code) return 'Courier'
  if (run.bold && run.italic) return 'Helvetica-BoldOblique'
  if (run.bold) return 'Helvetica-Bold'
  if (run.italic) return 'Helvetica-Oblique'
  return 'Helvetica'
}

function collectRuns(nodes: unknown, link?: string): InlineRun[] {
  const runs: InlineRun[] = []
  for (const node of arrayOf(nodes)) {
    const record = asRecord(node)
    if (!record) continue

    if (record.type === 'linebreak') {
      runs.push({ kind: 'break' })
      continue
    }

    if (record.type === 'link' || record.type === 'autolink') {
      const fields = asRecord(record.fields)
      const url = safeHref(asString(fields?.url) || asString(record.url))
      runs.push(...collectRuns(record.children, url || undefined))
      continue
    }

    if (typeof record.text === 'string' && record.text.length > 0) {
      const format = typeof record.format === 'number' ? record.format : 0
      runs.push({
        kind: 'text',
        text: record.text,
        bold: Boolean(format & 1),
        italic: Boolean(format & 2),
        strike: Boolean(format & 4),
        code: Boolean(format & 16),
        ...(link ? { link } : {}),
      })
      continue
    }

    if (Array.isArray(record.children)) {
      runs.push(...collectRuns(record.children, link))
    }
  }
  return runs
}

function plainText(runs: InlineRun[]) {
  return runs
    .filter((run): run is TextRun => run.kind === 'text')
    .map((run) => run.text)
    .join('')
}

function writeRunSequence(
  doc: PDFKit.PDFDocument,
  runs: TextRun[],
  options: SequenceOptions,
) {
  runs.forEach((run, index) => {
    const isLast = index === runs.length - 1
    doc
      .font(fontFor(run))
      .fontSize(options.size)
      .fillColor(run.code ? MUTED : options.color)
      .text(run.text, {
        continued: !isLast,
        lineGap: options.gap,
        ...(options.width ? { width: options.width } : {}),
        ...(run.link ? { link: run.link, underline: true } : {}),
        ...(run.strike ? { strike: true } : {}),
      })
  })
}

function writeInlineLines(
  doc: PDFKit.PDFDocument,
  runs: InlineRun[],
  options: SequenceOptions,
) {
  let line: TextRun[] = []

  const flush = () => {
    if (!line.length) {
      doc.moveDown(0.5)
      return
    }
    writeRunSequence(doc, line, options)
    line = []
  }

  for (const run of runs) {
    if (run.kind === 'break') flush()
    else line.push(run)
  }
  flush()
}

function isEmbeddableRaster(buffer: Buffer) {
  if (buffer.length < 12) return false
  const isPNG =
    buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47
  const isJPEG = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  const isTIFF =
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00)
  return isPNG || isJPEG || isTIFF
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) })
    if (!response.ok) return null
    const bytes = Buffer.from(await response.arrayBuffer())
    return isEmbeddableRaster(bytes) ? bytes : null
  } catch {
    return null
  }
}

type OpenedImage = { width: number; height: number }

type DocumentWithOpenImage = PDFKit.PDFDocument & {
  openImage(src: Buffer): OpenedImage
}

async function embedImageBuffer(
  doc: PDFKit.PDFDocument,
  buffer: Buffer,
  options: { widthFactor: number; maxHeight: number; caption?: string },
): Promise<boolean> {
  try {
    const image = (doc as DocumentWithOpenImage).openImage(buffer)
    const maxWidth = contentWidthOf(doc) * options.widthFactor
    const scale = Math.min(maxWidth / image.width, options.maxHeight / image.height, 1)
    const width = image.width * scale
    const height = image.height * scale

    ensureSpace(doc, height + (options.caption ? 30 : 12))

    const x = doc.page.margins.left + (contentWidthOf(doc) - width) / 2
    doc.image(buffer, x, doc.y, { width, height })
    doc.y += height + 8

    if (options.caption) {
      doc
        .font('Helvetica-Oblique')
        .fontSize(9)
        .fillColor(SOFT)
        .text(options.caption, { align: 'center', width: contentWidthOf(doc), lineGap: 1 })
      doc.moveDown(0.6)
    }
    return true
  } catch {
    return false
  }
}

async function embedImageFromURL(
  doc: PDFKit.PDFDocument,
  url: string | null,
  origin: string,
  options: { widthFactor: number; maxHeight: number; caption?: string },
): Promise<boolean> {
  if (!url) return false
  const buffer = await fetchImageBuffer(absolutize(origin, url))
  if (!buffer) return false
  return embedImageBuffer(doc, buffer, options)
}

function uploadImageSource(node: Record<string, unknown>): string | null {
  const fields = asRecord(node.fields)

  const direct = [fields?.url, fields?.thumbnailURL].find(
    (value): value is string => typeof value === 'string' && value.length > 0,
  )
  if (direct) return direct

  const value = asRecord(node.value)
  if (value) {
    const fromMedia = getMediaURL(value as unknown as Media, 'original')
    if (fromMedia) return fromMedia

    const filename = asString(value.filename)
    if (filename) return `/api/media/file/${encodeURIComponent(filename)}?prefix=editorial`
  }

  const fieldsFilename = asString(fields?.filename)
  if (fieldsFilename) return `/api/media/file/${encodeURIComponent(fieldsFilename)}?prefix=editorial`

  return null
}

function drawCalloutBox(
  doc: PDFKit.PDFDocument,
  options: {
    eyebrow?: string
    title: string
    body?: string
    footer?: string
    bar: string
    background: string
  },
) {
  const width = contentWidthOf(doc)
  const left = doc.page.margins.left
  const innerX = left + 20
  const innerWidth = width - 34
  const padY = 13

  doc.font('Helvetica').fontSize(10)
  const bodyHeight = options.body ? doc.heightOfString(options.body, { width: innerWidth, lineGap: 3 }) : 0
  doc.font('Helvetica-Bold').fontSize(12.5)
  const titleHeight = options.title ? doc.heightOfString(options.title, { width: innerWidth, lineGap: 2 }) : 0
  doc.font('Helvetica').fontSize(9)
  const footerHeight = options.footer ? doc.heightOfString(options.footer, { width: innerWidth, lineGap: 2 }) : 0
  const eyebrowHeight = options.eyebrow ? 14 : 0

  const boxHeight =
    padY * 2 +
    eyebrowHeight +
    titleHeight +
    bodyHeight +
    footerHeight +
    (titleHeight ? 6 : 0) +
    (bodyHeight ? 6 : 0) +
    (footerHeight ? 6 : 0)

  ensureSpace(doc, boxHeight + 16)

  const top = doc.y
  doc.save()
  doc.roundedRect(left, top, width, boxHeight, 6).fill(options.background)
  doc.rect(left, top, 4, boxHeight).fill(options.bar)
  doc.restore()

  let y = top + padY
  if (options.eyebrow) {
    doc
      .font('Helvetica-Bold')
      .fontSize(8.5)
      .fillColor(options.bar)
      .text(options.eyebrow.toUpperCase(), innerX, y, { width: innerWidth, characterSpacing: 1.2, lineGap: 0 })
    y = doc.y + 6
  }
  if (options.title) {
    doc.font('Helvetica-Bold').fontSize(12.5).fillColor(INK).text(options.title, innerX, y, {
      width: innerWidth,
      lineGap: 2,
    })
    y = doc.y + 6
  }
  if (options.body) {
    doc.font('Helvetica').fontSize(10).fillColor(MUTED).text(options.body, innerX, y, {
      width: innerWidth,
      lineGap: 3,
    })
    y = doc.y + 6
  }
  if (options.footer) {
    doc.font('Helvetica').fontSize(9).fillColor(SOFT).text(options.footer, innerX, y, {
      width: innerWidth,
      lineGap: 2,
    })
  }

  doc.x = left
  doc.y = top + boxHeight + 14
}

function drawCallout(doc: PDFKit.PDFDocument, fields: Record<string, unknown> | null) {
  if (!fields) return
  const title = asString(fields.title)
  const body = asString(fields.body)
  if (!title && !body) return

  const tone = CALLOUT_TONES[asString(fields.tone)] ?? CALLOUT_TONES.insight
  drawCalloutBox(doc, {
    eyebrow: asString(fields.eyebrow) || undefined,
    title,
    body: body || undefined,
    bar: tone.bar,
    background: tone.background,
  })
}

function drawActionCard(doc: PDFKit.PDFDocument, fields: Record<string, unknown> | null) {
  if (!fields) return
  const title = asString(fields.title)
  if (!title) return

  const href = safeHref(asString(fields.href))
  const label = asString(fields.label)
  const footerParts = [label, href].filter(Boolean)
  drawCalloutBox(doc, {
    eyebrow: 'SIGUIENTE MOVIMIENTO',
    title,
    body: asString(fields.body) || undefined,
    footer: footerParts.length ? footerParts.join('  ·  ') : undefined,
    bar: ACCENT,
    background: '#fff4ee',
  })
}

function parseComparison(fields: Record<string, unknown> | null) {
  const headers = arrayOf(fields?.headers).filter(
    (item): item is string => typeof item === 'string',
  )
  const rows = arrayOf(fields?.rows)
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item))
    .map((item) => ({
      label: asString(item.label),
      cells: arrayOf(item.cells).map((cell) => asString(cell)),
    }))
    .filter((row) => row.label.length > 0)

  return { headers, rows }
}

function drawComparisonTable(doc: PDFKit.PDFDocument, fields: Record<string, unknown> | null) {
  if (!fields) return
  const { headers, rows } = parseComparison(fields)
  if (!headers.length || !rows.length) return

  const title = asString(fields.title)
  const caption = asString(fields.caption)

  if (title) {
    doc.moveDown(0.3).font('Helvetica-Bold').fontSize(12.5).fillColor(INK).text(title, { lineGap: 2 })
    doc.moveDown(0.35)
  }

  const columns = ['Criterio', ...headers]
  const columnCount = columns.length
  const tableWidth = contentWidthOf(doc)
  const columnWidth = tableWidth / columnCount
  const pad = 6
  const cellText = (value: string) => (value.trim() ? value : '—')

  const measure = (value: string, bold: boolean) => {
    doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5)
    return Math.max(doc.heightOfString(cellText(value), { width: columnWidth - pad * 2, lineGap: 1 }) + pad * 2, 22)
  }

  const headerHeight = Math.max(...columns.map((column) => measure(column, true)))
  const rowHeights = rows.map((row) =>
    Math.max(measure(row.label, true), ...headers.map((_, cellIndex) => measure(row.cells[cellIndex] || '', false))),
  )

  const drawRow = (cells: string[], height: number, boldFirst: boolean, shaded: boolean) => {
    const left = doc.page.margins.left
    const rowTop = doc.y
    cells.forEach((cell, cellIndex) => {
      const x = left + cellIndex * columnWidth
      if (shaded) {
        doc.save()
        doc.rect(x, rowTop, columnWidth, height).fill('#eef2f7')
        doc.restore()
      }
      doc
        .font(boldFirst && cellIndex === 0 ? 'Helvetica-Bold' : 'Helvetica')
        .fontSize(9.5)
        .fillColor(INK)
        .text(cellText(cell), x + pad, rowTop + pad, {
          width: columnWidth - pad * 2,
          height: height - pad * 2,
          ellipsis: true,
          lineGap: 1,
        })
      doc.save()
      doc.rect(x, rowTop, columnWidth, height).lineWidth(0.75).strokeColor(RULE).stroke()
      doc.restore()
    })
    doc.y = rowTop + height
  }

  const drawHeaderRow = () => {
    drawRow(columns, headerHeight, true, true)
  }

  ensureSpace(doc, headerHeight + rowHeights[0])
  drawHeaderRow()

  rows.forEach((row, rowIndex) => {
    const cells = [row.label, ...headers.map((_, cellIndex) => row.cells[cellIndex] || '')]
    if (doc.y + rowHeights[rowIndex] > bottomLimitOf(doc)) {
      doc.addPage()
      drawHeaderRow()
    }
    drawRow(cells, rowHeights[rowIndex], true, false)
  })

  doc.x = doc.page.margins.left
  doc.moveDown(0.5)

  if (caption) {
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(SOFT).text(caption, { lineGap: 1 })
    doc.moveDown(0.5)
  }
}

async function renderList(
  doc: PDFKit.PDFDocument,
  node: Record<string, unknown>,
  origin: string,
  depth: number,
) {
  const listType = asString(node.listType) || (node.tag === 'ol' ? 'number' : 'bullet')
  const items = arrayOf(node.children)
  let index = typeof node.start === 'number' ? node.start : 1
  const baseOffset = Math.min(depth, 3) * 18

  for (const item of items) {
    const itemRecord = asRecord(item)
    if (!itemRecord) continue

    const marker =
      listType === 'number'
        ? `${index}.`
        : listType === 'check'
          ? itemRecord.checked === true
            ? '[x]'
            : '[ ]'
          : '\u2022'
    index += 1

    const children = arrayOf(itemRecord.children)
    const nestedLists = children.filter((child) => asRecord(child)?.type === 'list')
    const inlineRuns = collectRuns(children.filter((child) => asRecord(child)?.type !== 'list')).filter(
      (run): run is TextRun => run.kind === 'text',
    )

    const previousX = doc.x
    doc.x = doc.page.margins.left + baseOffset
    const itemWidth = contentWidthOf(doc) - baseOffset

    doc.font('Helvetica-Bold').fontSize(11).fillColor(ACCENT)
    doc.text(marker, { continued: inlineRuns.length > 0, width: itemWidth, lineGap: 4 })
    if (inlineRuns.length) {
      writeRunSequence(doc, inlineRuns, { size: 11, gap: 4, color: INK, width: itemWidth })
    }
    doc.x = previousX

    for (const nested of nestedLists) {
      const nestedRecord = asRecord(nested)
      if (nestedRecord) await renderList(doc, nestedRecord, origin, depth + 1)
    }
  }

  doc.moveDown(0.4)
}

async function renderNode(
  doc: PDFKit.PDFDocument,
  node: unknown,
  origin: string,
  depth: number,
): Promise<void> {
  const record = asRecord(node)
  if (!record) return

  switch (record.type) {
    case 'paragraph': {
      const runs = collectRuns(record.children)
      if (!runs.some((run) => run.kind === 'text' && run.text.trim().length > 0)) {
        doc.moveDown(0.5)
        return
      }
      doc.font('Helvetica').fontSize(11).fillColor(INK)
      writeInlineLines(doc, runs, { size: 11, gap: 5, color: INK, width: contentWidthOf(doc) })
      doc.moveDown(0.7)
      return
    }
    case 'heading': {
      const tag = asString(record.tag) || 'h2'
      const size = tag === 'h1' ? 20 : tag === 'h2' ? 16 : tag === 'h3' ? 13.5 : 12
      const text = plainText(collectRuns(record.children)).trim()
      if (!text) return
      doc.moveDown(0.4)
      doc.font('Helvetica-Bold').fontSize(size).fillColor(INK).text(text, { lineGap: 2 })
      doc.moveDown(0.35)
      return
    }
    case 'quote': {
      const runs = collectRuns(record.children)
      const text = plainText(runs).trim()
      if (!text) return

      const indentWidth = contentWidthOf(doc) - 18
      doc.font('Helvetica-Oblique').fontSize(11)
      const estimatedHeight = doc.heightOfString(text, { width: indentWidth, lineGap: 4 })
      ensureSpace(doc, estimatedHeight + 14)

      const top = doc.y
      const previousX = doc.x
      doc.save()
      doc.rect(previousX + 2, top + 2, 3, estimatedHeight).fill(ACCENT)
      doc.restore()

      doc.x = previousX + 18
      doc.fillColor(MUTED)
      writeInlineLines(doc, runs, { size: 11, gap: 4, color: MUTED, width: indentWidth })
      doc.x = previousX
      doc.y = Math.max(doc.y, top + estimatedHeight) + 10
      return
    }
    case 'list':
      await renderList(doc, record, origin, depth)
      return
    case 'upload': {
      const source = uploadImageSource(record)
      const fields = asRecord(record.fields)
      const caption = asString(fields?.caption) || asString(fields?.alt) || undefined
      await embedImageFromURL(doc, source, origin, { widthFactor: 1, maxHeight: 400, caption })
      return
    }
    case 'horizontal-rule': {
      ensureSpace(doc, 24)
      doc.moveDown(0.4)
      const y = doc.y
      doc.save()
      doc.moveTo(doc.page.margins.left, y).lineTo(doc.page.margins.left + 120, y).lineWidth(1).strokeColor(RULE).stroke()
      doc.restore()
      doc.moveDown(0.7)
      return
    }
    case 'block': {
      const fields = asRecord(record.fields)
      const blockType = asString(record.blockType) || asString(fields?.blockType)
      if (blockType === 'callout') drawCallout(doc, fields)
      else if (blockType === 'actionCard') drawActionCard(doc, fields)
      else if (blockType === 'comparisonTable') drawComparisonTable(doc, fields)
      else if (blockType === 'mediaFeature') {
        const media = (fields?.media ?? null) as string | Media | null
        const layout = asString(fields?.layout)
        await embedImageFromURL(doc, getMediaURL(media, 'original'), origin, {
          widthFactor: layout === 'content' ? 0.78 : 1,
          maxHeight: 420,
          caption: asString(fields?.caption) || undefined,
        })
      }
      return
    }
    default:
      if (Array.isArray(record.children)) {
        for (const child of record.children) await renderNode(doc, child, origin, depth)
      }
  }
}

export async function renderArticleContent(
  doc: PDFKit.PDFDocument,
  content: Post['content'] | null | undefined,
  origin: string,
): Promise<void> {
  const root = asRecord(asRecord(content)?.root)
  if (!root) return

  doc.x = doc.page.margins.left
  for (const child of arrayOf(root.children)) {
    await renderNode(doc, child, origin, 0)
  }
  doc.x = doc.page.margins.left
}

export async function embedCoverImage(
  doc: PDFKit.PDFDocument,
  media: Post['coverImage'],
  origin: string,
): Promise<boolean> {
  const url = getMediaURL(media, 'hero') || getMediaURL(media, 'original')
  return embedImageFromURL(doc, url, origin, { widthFactor: 1, maxHeight: 320 })
}
