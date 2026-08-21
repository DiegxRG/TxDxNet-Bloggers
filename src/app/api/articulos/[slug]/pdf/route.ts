import PDFDocument from 'pdfkit'

import {
  embedCoverImage,
  renderArticleContent,
} from '@/modules/content/infrastructure/pdf/render-article-pdf'
import {
  formatArticleDate,
  getPublishedPostBySlug,
} from '@/modules/content/infrastructure/payload/posts'

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
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
    size: 'A4',
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
  document
    .fillColor('#61718a')
    .fontSize(9)
    .text(`Por ${post.authorName} · Publicado ${formatArticleDate(post)}`)
  document.moveDown(2)
  document.strokeColor('#ff5a18').moveTo(54, document.y).lineTo(250, document.y).stroke()
  document.moveDown(1.5)

  const origin = new URL(request.url).origin
  await embedCoverImage(document, post.coverImage, origin)
  await renderArticleContent(document, post.content, origin)

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
