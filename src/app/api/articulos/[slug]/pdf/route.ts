import PDFDocument from 'pdfkit'

import { getPublishedPostBySlug } from '@/modules/content/infrastructure/payload/posts'

function collectText(value: unknown): string[] {
  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) return value.flatMap(collectText)

  const record = value as Record<string, unknown>
  const ownText = typeof record.text === 'string' ? [record.text] : []
  return [...ownText, ...Object.values(record).flatMap(collectText)]
}

function getArticleText(content: unknown) {
  return collectText(content).join(' ').replace(/\s+/g, ' ').trim()
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPublishedPostBySlug(slug)

  if (!post) return new Response('Artículo no encontrado', { status: 404 })

  const document = new PDFDocument({
    info: {
      Author: post.authorName,
      Creator: 'TxDxNet',
      Title: post.title,
    },
    margin: 54,
  })
  const chunks: Buffer[] = []
  const output = new Promise<Buffer>((resolve) => {
    document.on('data', (chunk: Buffer) => chunks.push(chunk))
    document.on('end', () => resolve(Buffer.concat(chunks)))
  })

  document.fillColor('#07142d').fontSize(10).text('TXDXSECURE / INSIGHT', { characterSpacing: 1.5 })
  document.moveDown(1.5)
  document.fontSize(25).font('Helvetica-Bold').text(post.title)
  document.moveDown(0.8)
  document.fillColor('#415574').fontSize(11).font('Helvetica').text(post.excerpt)
  document.moveDown(1)
  document.fillColor('#61718a').fontSize(9).text(`Por ${post.authorName} · Publicado ${post.publishedAt || post.createdAt}`)
  document.moveDown(2)
  document.strokeColor('#ff5a18').moveTo(54, document.y).lineTo(250, document.y).stroke()
  document.moveDown(1.5)
  document.fillColor('#07142d').fontSize(11).font('Helvetica').text(getArticleText(post.content), { align: 'left', lineGap: 5 })
  document.end()

  const buffer = await output
  const filename = `${post.slug || 'articulo'}.pdf`
  const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer

  return new Response(body, {
    headers: {
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': 'application/pdf',
    },
  })
}
