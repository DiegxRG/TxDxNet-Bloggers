import PDFDocument from 'pdfkit'

import type { Post } from '@/payload-types'
import type { ArticleImages } from './article-images'
import {
  assertPdfContentBudget,
  createPdfConcurrencyLimiter,
  PDF_LIMITS,
  PdfResourceLimitError,
  waitForPdfOperation,
} from './pdf-resources'
import {
  embedCoverImage,
  renderArticleContent,
} from './render-article-pdf'

type PdfDependencies = {
  getPost: (slug: string) => Promise<Post | null>
  createImages: (signal: AbortSignal, deadline: number) => Promise<ArticleImages>
  formatDate: (post: Post) => string
  durationMs?: number
}

export function createArticlePdfHandler({ getPost, createImages, formatDate, durationMs = PDF_LIMITS.durationMs }: PdfDependencies) {
  const acquirePdfSlot = createPdfConcurrencyLimiter()
  return async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const release = acquirePdfSlot()
    if (!release) {
      return new Response('La generación de PDF está ocupada. Inténtalo de nuevo en unos segundos.', {
        status: 503,
        headers: { 'Retry-After': '5', 'Cache-Control': 'no-store' },
      })
    }

    const deadline = Date.now() + durationMs
    const controller = new AbortController()
    const signal = AbortSignal.any([request.signal, controller.signal, AbortSignal.timeout(durationMs)])
    let document: PDFKit.PDFDocument | undefined
    const abort = () => document?.destroy(signal.reason instanceof Error ? signal.reason : new Error('Generación cancelada.'))

    try {
      const { slug } = await waitForPdfOperation(params, signal)
      const post = await waitForPdfOperation(getPost(slug), signal)
      if (!post) return new Response('Artículo no encontrado', { status: 404, headers: { 'Cache-Control': 'no-store' } })
      assertPdfContentBudget([post.title, post.excerpt, post.authorName, post.content])
      const images = await waitForPdfOperation(createImages(signal, deadline), signal)

      document = new PDFDocument({
        info: { Author: post.authorName, Creator: 'TxDxNet', Title: post.title },
        margin: 54,
        size: 'A4',
      })
      const chunks: Buffer[] = []
      let bytes = 0
      let pages = 1
      const output = new Promise<Buffer>((resolve, reject) => {
        document!.on('data', (chunk: Buffer) => {
          bytes += chunk.length
          if (bytes > PDF_LIMITS.outputBytes) {
            controller.abort(new PdfResourceLimitError())
            return
          }
          chunks.push(chunk)
        })
        document!.once('end', () => {
          if (signal.aborted) reject(signal.reason)
          else resolve(Buffer.concat(chunks, bytes))
        })
        document!.once('error', reject)
      })
      // Rendering awaits image I/O before awaiting the output stream.
      void output.catch(() => {})
      signal.addEventListener('abort', abort, { once: true })
      signal.throwIfAborted()
      document.on('pageAdded', () => {
        images.check()
        if (++pages > PDF_LIMITS.pages) throw new PdfResourceLimitError()
      })

      document.fillColor('#07142d').fontSize(10).text('TXDXSECURE / INSIGHT', { characterSpacing: 1.5 })
      document.moveDown(1.5)
      document.fontSize(25).font('Helvetica-Bold').text(post.title)
      document.moveDown(0.8)
      document.fillColor('#415574').fontSize(11).font('Helvetica').text(post.excerpt)
      document.moveDown(1)
      document.fillColor('#61718a').fontSize(9).text(`Por ${post.authorName} · Publicado ${formatDate(post)}`)
      document.moveDown(2)
      document.strokeColor('#ff5a18').moveTo(54, document.y).lineTo(250, document.y).stroke()
      document.moveDown(1.5)

      await embedCoverImage(document, post.coverImage, images)
      await renderArticleContent(document, post.content, images)
      images.check()
      document.end()
      const buffer = await waitForPdfOperation(output, signal)
      images.check()
      const filename = `${post.slug || 'articulo'}.pdf`
      const body = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer
      return new Response(body, {
        headers: {
          'Cache-Control': images.incomplete ? 'no-store' : 'public, max-age=3600, s-maxage=86400',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Type': 'application/pdf',
        },
      })
    } catch (error) {
      const reason: unknown = signal.aborted ? signal.reason : error
      const limited = reason instanceof PdfResourceLimitError
      const timedOut = reason instanceof Error && reason.name === 'TimeoutError'
      const status = limited ? 422 : timedOut ? 504 : request.signal.aborted ? 408 : 500
      if (status === 500) console.error('[pdf] No se pudo generar el documento.')
      return new Response(limited ? reason.message : 'No se pudo generar el PDF. Inténtalo de nuevo.', {
        status,
        headers: { 'Cache-Control': 'no-store' },
      })
    } finally {
      signal.removeEventListener('abort', abort)
      document?.destroy()
      release()
    }
  }
}
