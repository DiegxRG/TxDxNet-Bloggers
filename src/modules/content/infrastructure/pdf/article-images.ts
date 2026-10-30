import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import type { Payload } from 'payload'
import sharp from 'sharp'

import type { Media } from '@/payload-types'

import { EDITORIAL_STORAGE_PREFIX, getMediaStorageConfig } from '../media-storage-config'
import { PDF_LIMITS, PdfResourceLimitError, waitForPdfOperation } from './pdf-resources'

export type ArticleImages = {
  load: (reference: unknown, size?: 'hero' | 'original') => Promise<Buffer | null>
  check: () => void
  readonly incomplete: boolean
}

export type StoredImage = { filename: string; filesize?: number | null; prefix: string }

type ImageDependencies = {
  findMedia: (id: string) => Promise<Media | null>
  findMediaByFilename?: (filename: string) => Promise<Media | null>
  readImage: (file: StoredImage, signal: AbortSignal) => Promise<Buffer>
  signal: AbortSignal
  deadline?: number
}

function mediaID(reference: unknown): string | null {
  const id = typeof reference === 'object' && reference !== null && 'id' in reference
    ? reference.id
    : reference
  return typeof id === 'string' && /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(id) ? id : null
}

export function isSafeMediaFilename(filename: unknown): filename is string {
  return typeof filename === 'string' && filename.length > 0 && filename.length <= 255 &&
    !/[\\/\x00-\x1f\x7f:]/.test(filename) && filename !== '.' && filename !== '..'
}

function isSupportedRaster(bytes: Buffer) {
  if (bytes.length < 12) return false
  const signature = bytes.toString('hex', 0, 4)
  return bytes.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) ||
    bytes.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')) ||
    ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6)) ||
    ['49492a00', '4d4d002a'].includes(signature) ||
    (bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') ||
    (bytes.toString('ascii', 4, 8) === 'ftyp' &&
      ['avif', 'avis', 'heic', 'heix', 'hevc', 'hevx', 'mif1', 'msf1'].includes(bytes.toString('ascii', 8, 12)))
}

// Bounds apply to the bytes actually read, including when Content-Length is absent or false.
export async function readBoundedImage(
  stream: ReadableStream<Uint8Array>,
  contentLength: number | null | undefined,
  signal: AbortSignal,
): Promise<Buffer> {
  const reader = stream.getReader()
  const chunks: Buffer[] = []
  let bytes = 0
  try {
    signal.throwIfAborted()
    if (contentLength != null && (!Number.isSafeInteger(contentLength) || contentLength < 0 || contentLength > PDF_LIMITS.imageBytes)) {
      throw new PdfResourceLimitError()
    }
    while (true) {
      const chunk = await waitForPdfOperation(reader.read(), signal)
      signal.throwIfAborted()
      if (chunk.done) break
      bytes += chunk.value.byteLength
      if (bytes > PDF_LIMITS.imageBytes) throw new PdfResourceLimitError()
      chunks.push(Buffer.from(chunk.value))
    }
    return Buffer.concat(chunks, bytes)
  } finally {
    // Cancelling closes the underlying S3/file stream on oversized and stalled responses.
    await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

export async function normalizePdfImage(bytes: Buffer): Promise<Buffer> {
  if (!bytes.length || bytes.length > PDF_LIMITS.imageBytes) throw new PdfResourceLimitError()
  // Reject SVG and other document formats before invoking an image parser.
  if (!isSupportedRaster(bytes)) throw new Error('Formato de imagen no admitido.')
  const image = sharp(bytes, { limitInputPixels: PDF_LIMITS.imagePixels, failOn: 'warning' })
  const metadata = await image.metadata()
  if (!metadata.width || !metadata.height || metadata.width > PDF_LIMITS.imageDimension ||
    metadata.height > PDF_LIMITS.imageDimension || metadata.width * metadata.height > PDF_LIMITS.imagePixels ||
    !['png', 'jpeg', 'webp', 'avif', 'heif', 'tiff', 'gif'].includes(metadata.format || '')) {
    throw new Error('Formato o dimensiones de imagen no admitidos.')
  }
  const normalized = image.rotate().resize({
    width: PDF_LIMITS.imageOutputDimension,
    height: PDF_LIMITS.imageOutputDimension,
    fit: 'inside',
    withoutEnlargement: true,
  }).timeout({ seconds: 5 })
  const result = await (metadata.format === 'jpeg' ? normalized.jpeg({ quality: 90 }) : normalized.png()).toBuffer()
  if (result.length > PDF_LIMITS.imageBytes) throw new PdfResourceLimitError()
  return result
}

export function createArticleImages({ findMedia, findMediaByFilename, readImage, signal, deadline = Date.now() + PDF_LIMITS.durationMs }: ImageDependencies): ArticleImages {
  let images = 0
  let totalBytes = 0
  let totalPixels = 0
  let incomplete = false
  const check = () => {
    signal.throwIfAborted()
    if (Date.now() >= deadline) throw new DOMException('Tiempo de generación agotado.', 'TimeoutError')
  }
  return {
    check,
    get incomplete() { return incomplete },
    async load(reference, size = 'original') {
      check()
      if (reference == null) return null
      if (++images > PDF_LIMITS.images) throw new PdfResourceLimitError()
      const id = mediaID(reference)
      const legacyFilename = !id && reference && typeof reference === 'object' &&
        !('id' in reference) && 'filename' in reference && isSafeMediaFilename(reference.filename)
        ? reference.filename : null
      if (!id && !(legacyFilename && findMediaByFilename)) { incomplete = true; return null }
      try {
        // Legacy names are lookup keys only. Paths and metadata always come from the CMS record.
        const lookup = id ? findMedia(id) : findMediaByFilename!(legacyFilename!)
        const media = await waitForPdfOperation(lookup, signal)
        check()
        if (!media || (media.prefix && media.prefix !== EDITORIAL_STORAGE_PREFIX)) {
          incomplete = true
          return null
        }
        const variant = size === 'hero' && media.sizes?.hero?.filename ? media.sizes.hero : media
        if (!isSafeMediaFilename(variant.filename)) { incomplete = true; return null }
        if (variant.filesize != null && variant.filesize > PDF_LIMITS.imageBytes) throw new PdfResourceLimitError()
        const imageSignal = AbortSignal.any([signal, AbortSignal.timeout(PDF_LIMITS.imageDurationMs)])
        const bytes = await waitForPdfOperation(readImage({
          filename: variant.filename,
          filesize: variant.filesize,
          prefix: EDITORIAL_STORAGE_PREFIX,
        }, imageSignal), imageSignal)
        totalBytes += bytes.length
        if (bytes.length > PDF_LIMITS.imageBytes || totalBytes > PDF_LIMITS.totalImageBytes) throw new PdfResourceLimitError()
        check()
        // Let bounded native decoding finish before releasing the generation slot.
        const normalized = await normalizePdfImage(bytes)
        const dimensions = await sharp(normalized).metadata()
        totalPixels += (dimensions.width || 0) * (dimensions.height || 0)
        if (totalPixels > PDF_LIMITS.totalImagePixels) throw new PdfResourceLimitError()
        check()
        return normalized
      } catch (error) {
        check()
        if (error instanceof PdfResourceLimitError) throw error
        incomplete = true
        return null
      }
    },
  }
}

export async function readLocalMediaImage(directory: string, file: StoredImage, signal: AbortSignal) {
  if (!isSafeMediaFilename(file.filename)) throw new Error('Nombre de archivo no admitido.')
  const root = await realpath(path.resolve(directory))
  const filename = await realpath(path.join(root, file.filename))
  if (path.dirname(filename) !== root) throw new Error('Archivo fuera de la biblioteca multimedia.')
  const info = await stat(filename)
  if (!info.isFile()) throw new Error('Archivo multimedia no válido.')
  signal.throwIfAborted()
  const stream = createReadStream(filename, { signal, highWaterMark: 64 * 1024 })
  return readBoundedImage(Readable.toWeb(stream) as ReadableStream<Uint8Array>, info.size, signal)
}

let storageClient: S3Client | undefined

export function createPayloadArticleImages(payload: Payload, signal: AbortSignal, deadline: number): ArticleImages {
  const upload = payload.collections.media.config.upload
  return createArticleImages({
    signal,
    deadline,
    findMedia: (id) => payload.findByID({ collection: 'media', id, depth: 0, disableErrors: true, overrideAccess: false }),
    findMediaByFilename: async (filename) => {
      const result = await payload.find({
        collection: 'media', depth: 0, limit: 1, pagination: false, overrideAccess: false,
        where: { filename: { equals: filename } },
      })
      return result.docs[0] || null
    },
    readImage: async (file, imageSignal) => {
      if (upload.adapter === 's3') {
        const storage = getMediaStorageConfig()
        if (!storage) throw new Error('Almacenamiento multimedia no configurado.')
        storageClient ??= new S3Client({ ...storage.config, maxAttempts: 1, followRegionRedirects: false })
        const object = await storageClient.send(new GetObjectCommand({
          Bucket: storage.bucket,
          Key: `${EDITORIAL_STORAGE_PREFIX}/${file.filename}`,
        }), { abortSignal: imageSignal })
        if (!object.Body) throw new Error('Archivo multimedia vacío.')
        return readBoundedImage(object.Body.transformToWebStream(), object.ContentLength, imageSignal)
      }
      if (upload.disableLocalStorage || upload.adapter) throw new Error('Almacenamiento multimedia no admitido.')
      return readLocalMediaImage(upload.staticDir || 'media', file, imageSignal)
    },
  })
}
