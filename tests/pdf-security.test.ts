import assert from 'node:assert/strict'
import { randomFillSync } from 'node:crypto'
import { once } from 'node:events'
import { mkdtemp, rm, writeFile, symlink } from 'node:fs/promises'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { test } from 'node:test'
import type { Payload } from 'payload'
import PDFDocument from 'pdfkit'
import sharp from 'sharp'

import type { Media, Post } from '../src/payload-types'
import {
  createArticleImages,
  createPayloadArticleImages,
  isSafeMediaFilename,
  normalizePdfImage,
  readBoundedImage,
  readLocalMediaImage,
} from '../src/modules/content/infrastructure/pdf/article-images'
import { createArticlePdfHandler } from '../src/modules/content/infrastructure/pdf/article-pdf-handler'
import { embedCoverImage, renderArticleContent } from '../src/modules/content/infrastructure/pdf/render-article-pdf'
import {
  assertPdfContentBudget,
  createPdfConcurrencyLimiter,
  PDF_LIMITS,
  PdfResourceLimitError,
} from '../src/modules/content/infrastructure/pdf/pdf-resources'

const id = 'f1234567-1234-1234-1234-123456789abc'
const signal = () => new AbortController().signal
const media = (overrides: Partial<Media> = {}): Media => ({
  id, filename: 'image.png', prefix: 'editorial', createdAt: '2026-01-01', updatedAt: '2026-01-01', ...overrides,
})
const raster = () => sharp({ create: { width: 80, height: 40, channels: 3, background: '#ff5a18' } }).png().toBuffer()
const content = (children: unknown[]) => ({ root: { type: 'root', format: '', indent: 0, version: 1, direction: null, children } }) as Post['content']
const post = (overrides: Partial<Post> = {}): Post => ({
  id, slug: 'prueba', title: 'Artículo de prueba', excerpt: 'Seguridad y funcionamiento editorial.',
  authorName: 'Equipo editorial', createdBy: id, createdAt: '2026-01-01', updatedAt: '2026-01-01',
  content: content([{ type: 'paragraph', children: [{ type: 'text', text: 'Texto normal del artículo.' }] }]),
  ...overrides,
})
const request = (requestSignal?: AbortSignal) => new Request('https://origen-no-confiable.invalid/api/articulos/prueba/pdf', { signal: requestSignal })
const params = () => ({ params: Promise.resolve({ slug: 'prueba' }) })

async function removeTestDirectory(directory: string) {
  const target = path.resolve(directory)
  assert.equal(path.dirname(target), path.resolve(os.tmpdir()))
  assert.ok(path.basename(target).startsWith('txdx-pdf-'))
  await rm(target, { recursive: true, force: true })
}

test('rutas y URLs arbitrarias no se resuelven ni llegan al lector de almacenamiento', async () => {
  let lookups = 0
  let reads = 0
  const images = createArticleImages({
    signal: signal(), findMedia: async () => { lookups++; return media() },
    readImage: async () => { reads++; return raster() },
  })
  for (const value of [
    'http://127.0.0.1/admin', 'http://169.254.169.254/latest/meta-data/', 'http://[::1]/',
    'https://externo.invalid/redirect', 'https://txdxnet.com.evil.invalid/image.png',
    '//localhost/image.png', '/api/media/file/image.png', 'data:image/png;base64,abc',
    { url: 'http://localhost/image.png', filename: 'image.png' },
  ]) assert.equal(await images.load(value), null)
  assert.equal(lookups, 0)
  assert.equal(reads, 0)
})

test('objetos poblados se vuelven a consultar por ID e ignoran URL, prefijo y filename suministrados', async () => {
  let filename = ''
  const images = createArticleImages({
    signal: signal(),
    findMedia: async (actualID) => { assert.equal(actualID, id); return media() },
    readImage: async (file) => { filename = file.filename; assert.equal(file.prefix, 'editorial'); return raster() },
  })
  const result = await images.load({ id, filename: '../secreto', url: 'http://localhost/', prefix: 'privado' })
  assert.ok(result)
  assert.equal(filename, 'image.png')
  assert.equal(images.incomplete, false)
})

test('portada usa hero y vuelve al original cuando no hay variante', async () => {
  const filenames: string[] = []
  let current = media({ sizes: { hero: { filename: 'hero.png' } } })
  const images = createArticleImages({
    signal: signal(), findMedia: async () => current,
    readImage: async (file) => { filenames.push(file.filename); return raster() },
  })
  await images.load(id, 'hero')
  current = media()
  await images.load(id, 'hero')
  assert.deepEqual(filenames, ['hero.png', 'image.png'])
})

test('referencias antiguas por filename requieren un registro multimedia autorizado', async () => {
  const lookups: string[] = []
  const reads: string[] = []
  const images = createArticleImages({
    signal: signal(), findMedia: async () => null,
    findMediaByFilename: async (filename) => {
      lookups.push(filename)
      return filename === 'legacy.png' ? media({ filename: 'canonical.png' }) : null
    },
    readImage: async (file) => { reads.push(file.filename); return raster() },
  })
  assert.ok(await images.load({ filename: 'legacy.png', url: 'http://127.0.0.1/private' }))
  assert.equal(await images.load({ filename: 'missing.png' }), null)
  assert.equal(await images.load({ filename: '../secret' }), null)
  assert.deepEqual(lookups, ['legacy.png', 'missing.png'])
  assert.deepEqual(reads, ['canonical.png'])
})

test('prefijos ajenos y nombres con traversal no se leen', async () => {
  for (const invalid of ['../secret', '..\\secret', '/secret', 'C:secret', 'image.png\0', '.', '..']) {
    assert.equal(isSafeMediaFilename(invalid), false)
  }
  let reads = 0
  for (const record of [media({ prefix: 'privado' }), media({ filename: '../secret' })]) {
    const images = createArticleImages({
      signal: signal(), findMedia: async () => record,
      readImage: async () => { reads++; return raster() },
    })
    assert.equal(await images.load(id), null)
  }
  assert.equal(reads, 0)
})

test('Content-Length excesivo cancela el stream antes de consumirlo', async () => {
  let pulls = 0
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({
    pull() { pulls++ }, cancel() { cancelled = true },
  }, { highWaterMark: 0 })
  await assert.rejects(readBoundedImage(stream, PDF_LIMITS.imageBytes + 1, signal()), PdfResourceLimitError)
  assert.equal(pulls, 0)
  assert.equal(cancelled, true)
})

test('streaming cancela al superar bytes aunque Content-Length falte o mienta', async () => {
  for (const length of [undefined, 1]) {
    let pulls = 0
    let cancelled = false
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) { pulls++; controller.enqueue(new Uint8Array(1024 * 1024)) },
      cancel() { cancelled = true },
    }, { highWaterMark: 0 })
    await assert.rejects(readBoundedImage(stream, length, signal()), PdfResourceLimitError)
    assert.equal(cancelled, true)
    assert.equal(pulls, 21)
  }
})

test('cancelación detiene un cuerpo estancado y libera su lector', async () => {
  const controller = new AbortController()
  let cancelled = false
  const stream = new ReadableStream<Uint8Array>({ cancel() { cancelled = true } })
  const pending = readBoundedImage(stream, undefined, controller.signal)
  controller.abort(new Error('Cancelado'))
  await assert.rejects(pending, /Cancelado/)
  assert.equal(cancelled, true)
  assert.equal(stream.locked, false)
})

test('PNG, JPEG, WebP y TIFF válidos se normalizan; archivos falsos y dimensiones enormes se rechazan', async () => {
  const source = await raster()
  for (const format of ['png', 'jpeg', 'webp', 'tiff'] as const) {
    const converted = await sharp(source).toFormat(format).toBuffer()
    const normalized = await normalizePdfImage(converted)
    const metadata = await sharp(normalized).metadata()
    assert.equal(metadata.width, 80)
    assert.equal(metadata.height, 40)
    assert.ok(['png', 'jpeg'].includes(metadata.format || ''))
  }
  await assert.rejects(normalizePdfImage(Buffer.from('no es una imagen')))
  await assert.rejects(normalizePdfImage(source.subarray(0, 30)))
  await assert.rejects(normalizePdfImage(Buffer.from('<svg width="80" height="40"></svg>')))
  const wide = await sharp({ create: { width: 3200, height: 1600, channels: 3, background: 'white' } }).png().toBuffer()
  const resized = await sharp(await normalizePdfImage(wide)).metadata()
  assert.equal(resized.width, 2400)
  assert.equal(resized.height, 1200)
  const oversized = await sharp({ create: { width: 7000, height: 6000, channels: 3, background: 'white' } }).png().toBuffer()
  await assert.rejects(normalizePdfImage(oversized))
})

test('el lector local mantiene el directorio autorizado y cancela archivos excesivos', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'txdx-pdf-test-'))
  t.after(() => removeTestDirectory(directory))
  const file = { filename: 'image.png', prefix: 'editorial' }
  const png = await raster()
  await writeFile(path.join(directory, file.filename), png)
  assert.deepEqual(await readLocalMediaImage(directory, file, signal()), png)
  await assert.rejects(readLocalMediaImage(directory, { ...file, filename: '../secret' }, signal()))
  await writeFile(path.join(directory, 'large.png'), Buffer.alloc(PDF_LIMITS.imageBytes + 1))
  await assert.rejects(readLocalMediaImage(directory, { ...file, filename: 'large.png' }, signal()), PdfResourceLimitError)
})

test('el lector local rechaza enlaces simbólicos que salen de la biblioteca', async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'txdx-pdf-symlink-'))
  t.after(() => removeTestDirectory(directory))
  const outside = path.join(directory, 'outside.png')
  const inside = path.join(directory, 'inside')
  await writeFile(outside, await raster())
  const { mkdir } = await import('node:fs/promises')
  await mkdir(inside)
  try { await symlink(outside, path.join(inside, 'link.png')) } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EPERM') { t.skip('Windows no permite symlinks en esta sesión.'); return }
    throw error
  }
  await assert.rejects(readLocalMediaImage(inside, { filename: 'link.png', prefix: 'editorial' }, signal()), /fuera/)
})

test('PDF real conserva portada, upload y mediaFeature sin contactar destinos inyectados', async (t) => {
  let connections = 0
  const server = createServer((_request, response) => { connections++; response.writeHead(302, { Location: 'http://127.0.0.1/' }); response.end() })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(() => { server.closeAllConnections(); server.close() })
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const maliciousURL = `http://127.0.0.1:${address.port}/redirect`
  const directory = await mkdtemp(path.join(os.tmpdir(), 'txdx-pdf-render-'))
  t.after(() => removeTestDirectory(directory))
  await writeFile(path.join(directory, 'image.png'), await raster())
  let lookups = 0
  const payload = {
    collections: { media: { config: { upload: { staticDir: directory } } } },
    findByID: async (options: { overrideAccess: boolean; id: string }) => {
      assert.equal(options.overrideAccess, false); assert.equal(options.id, id); lookups++; return media()
    },
    find: async () => ({ docs: [] }),
  } as unknown as Payload
  const images = createPayloadArticleImages(payload, signal(), Date.now() + 10_000)
  const doc = new PDFDocument()
  const chunks: Buffer[] = []
  doc.on('data', (chunk: Buffer) => chunks.push(chunk))
  const complete = once(doc, 'end')
  let embedded = 0
  const originalImage = doc.image.bind(doc)
  doc.image = ((...args: Parameters<typeof originalImage>) => { embedded++; return originalImage(...args) }) as typeof doc.image
  assert.equal(await embedCoverImage(doc, { id, url: maliciousURL } as Media, images), true)
  await renderArticleContent(doc, content([
    { type: 'upload', relationTo: 'media', value: id, fields: { url: maliciousURL, filename: '../secret', caption: 'Imagen normal' } },
    { type: 'block', fields: { blockType: 'mediaFeature', media: id, layout: 'wide', caption: 'Imagen destacada' } },
    { type: 'upload', relationTo: 'media', fields: { url: maliciousURL } },
    { type: 'upload', relationTo: 'admins', value: id, fields: { url: maliciousURL } },
  ]), images)
  doc.end()
  await complete
  assert.equal(Buffer.concat(chunks).subarray(0, 4).toString(), '%PDF')
  assert.equal(embedded, 3)
  assert.equal(lookups, 3)
  assert.equal(connections, 0)
})

test('presupuestos rechazan contenido profundo, texto excesivo e imágenes excesivas', async () => {
  assert.doesNotThrow(() => assertPdfContentBudget(post().content))
  assert.throws(() => assertPdfContentBudget('x'.repeat(PDF_LIMITS.textCharacters + 1)), PdfResourceLimitError)
  let deep: unknown = 'texto'
  for (let i = 0; i < PDF_LIMITS.contentDepth + 1; i++) deep = { children: [deep] }
  assert.throws(() => assertPdfContentBudget(deep), PdfResourceLimitError)
  assert.throws(() => assertPdfContentBudget(Array(PDF_LIMITS.contentValues + 1).fill(null)), PdfResourceLimitError)
  const images = createArticleImages({ signal: signal(), findMedia: async () => null, readImage: raster })
  for (let i = 0; i < PDF_LIMITS.images; i++) await images.load(id)
  await assert.rejects(images.load(id), PdfResourceLimitError)
})

test('el presupuesto total cuenta los bytes reales de todas las imágenes', async () => {
  const png = await raster()
  const padded = Buffer.concat([png, Buffer.alloc(PDF_LIMITS.imageBytes - png.length)])
  const images = createArticleImages({ signal: signal(), findMedia: async () => media(), readImage: async () => padded })
  for (let i = 0; i < PDF_LIMITS.totalImageBytes / PDF_LIMITS.imageBytes; i++) assert.ok(await images.load(id))
  await assert.rejects(images.load(id), PdfResourceLimitError)
})

test('el presupuesto acumulado de píxeles limita imágenes que comprimen mucho', async () => {
  const png = await sharp({ create: { width: 2400, height: 2400, channels: 3, background: 'white' } }).png().toBuffer()
  const images = createArticleImages({ signal: signal(), findMedia: async () => media(), readImage: async () => png })
  const permitted = Math.floor(PDF_LIMITS.totalImagePixels / (2400 * 2400))
  for (let i = 0; i < permitted; i++) assert.ok(await images.load(id))
  await assert.rejects(images.load(id), PdfResourceLimitError)
})

test('S3 usa exclusivamente bucket y prefijo configurados y rechaza redirects sin seguirlos', async (t) => {
  const png = await raster()
  let redirectedConnections = 0
  const destination = createServer((_req, response) => { redirectedConnections++; response.end(png) })
  destination.listen(0, '127.0.0.1')
  await once(destination, 'listening')
  const targetAddress = destination.address()
  assert.ok(targetAddress && typeof targetAddress === 'object')
  t.after(() => { destination.closeAllConnections(); destination.close() })
  let mode: 'normal' | 'redirect' | 'oversize' = 'normal'
  const paths: string[] = []
  const storage = createServer((req, response) => {
    paths.push(req.url || '')
    if (mode === 'redirect') {
      response.writeHead(302, { Location: `http://127.0.0.1:${targetAddress.port}/image.png` })
      response.end()
    } else if (mode === 'oversize') {
      response.writeHead(200, { 'Content-Length': String(PDF_LIMITS.imageBytes + 1), 'Content-Type': 'image/png' })
      response.end(png)
    } else {
      response.writeHead(200, { 'Content-Length': String(png.length), 'Content-Type': 'image/png' })
      response.end(png)
    }
  })
  storage.listen(0, '127.0.0.1')
  await once(storage, 'listening')
  const storageAddress = storage.address()
  assert.ok(storageAddress && typeof storageAddress === 'object')
  t.after(() => { storage.closeAllConnections(); storage.close() })
  const environment = {
    S3_ENDPOINT: `http://127.0.0.1:${storageAddress.port}`, S3_BUCKET: 'media',
    S3_ACCESS_KEY_ID: 'isolated-test-key', S3_SECRET_ACCESS_KEY: 'isolated-test-secret', S3_REGION: 'us-east-1',
  }
  const previous = Object.fromEntries(Object.keys(environment).map((key) => [key, process.env[key]]))
  Object.assign(process.env, environment)
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
  const payload = {
    collections: { media: { config: { upload: { adapter: 's3', disableLocalStorage: true } } } },
    findByID: async () => media({ url: `http://127.0.0.1:${targetAddress.port}/malicioso` }),
  } as unknown as Payload
  const images = createPayloadArticleImages(payload, signal(), Date.now() + 10_000)
  assert.ok(await images.load(id))
  mode = 'redirect'
  assert.equal(await images.load(id), null)
  assert.equal(redirectedConnections, 0)
  assert.equal(images.incomplete, true)
  mode = 'oversize'
  await assert.rejects(images.load(id), PdfResourceLimitError)
  assert.equal(paths.length, 3)
  assert.ok(paths.every((entry) => entry.split('?')[0] === '/media/editorial/image.png'))
})

test('límite de concurrencia se recupera y liberar dos veces no abre plazas adicionales', () => {
  const acquire = createPdfConcurrencyLimiter()
  const first = acquire()!
  const second = acquire()!
  assert.equal(acquire(), null)
  first(); first()
  const third = acquire()!
  assert.equal(acquire(), null)
  second(); third()
  assert.ok(acquire())
})

test('endpoint mantiene PDF válido, 404 y no guarda PDFs con imágenes faltantes', async () => {
  let current: Post | null = post()
  const handler = createArticlePdfHandler({
    getPost: async () => current, formatDate: () => '01 ene 2026',
    createImages: async (requestSignal) => createArticleImages({ signal: requestSignal, findMedia: async () => null, readImage: raster }),
  })
  let response = await handler(request(), params())
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Content-Type'), 'application/pdf')
  assert.match(response.headers.get('Cache-Control')!, /public/)
  assert.equal(Buffer.from(await response.arrayBuffer()).subarray(0, 4).toString(), '%PDF')
  current = post({ coverImage: id })
  response = await handler(request(), params())
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  current = null
  assert.equal((await handler(request(), params())).status, 404)
})

test('endpoint responde 422 al exceder recursos y conserva la siguiente descarga normal', async () => {
  let current = post({ content: content([{ type: 'paragraph', children: [{ type: 'text', text: 'x'.repeat(PDF_LIMITS.textCharacters + 1) }] }]) })
  const handler = createArticlePdfHandler({
    getPost: async () => current, formatDate: () => '01 ene 2026',
    createImages: async (requestSignal) => createArticleImages({ signal: requestSignal, findMedia: async () => null, readImage: raster }),
  })
  assert.equal((await handler(request(), params())).status, 422)
  current = post()
  assert.equal((await handler(request(), params())).status, 200)
  current = post({ title: 'Texto extenso '.repeat(30_000) })
  assert.equal((await handler(request(), params())).status, 422)
})

test('endpoint responde 503 bajo concurrencia y vuelve a aceptar solicitudes', async () => {
  let unblock!: (value: Post | null) => void
  const pending = new Promise<Post | null>((resolve) => { unblock = resolve })
  const handler = createArticlePdfHandler({
    getPost: () => pending, formatDate: () => '',
    createImages: async () => { throw new Error('No se requieren imágenes') },
  })
  const first = handler(request(), params())
  const second = handler(request(), params())
  const busy = await handler(request(), params())
  assert.equal(busy.status, 503)
  assert.equal(busy.headers.get('Retry-After'), '5')
  unblock(null)
  assert.deepEqual((await Promise.all([first, second])).map((response) => response.status), [404, 404])
  assert.equal((await handler(request(), params())).status, 404)
})

test('un PDF real que supera 32 MiB se detiene y permite la siguiente descarga', async () => {
  const noisy = await sharp(randomFillSync(Buffer.alloc(1200 * 1200 * 3)), {
    raw: { width: 1200, height: 1200, channels: 3 },
  }).png().toBuffer()
  let current = post({ content: content(Array.from({ length: 10 }, () => ({ type: 'upload', relationTo: 'media', value: id }))) })
  const handler = createArticlePdfHandler({
    getPost: async () => current, formatDate: () => '01 ene 2026',
    createImages: async (requestSignal) => createArticleImages({ signal: requestSignal, findMedia: async () => media(), readImage: async () => noisy }),
  })
  const response = await handler(request(), params())
  assert.equal(response.status, 422)
  assert.equal(response.headers.get('Cache-Control'), 'no-store')
  current = post()
  assert.equal((await handler(request(), params())).status, 200)
})

test('endpoint respeta cancelación y timeout sin dejar ocupadas las plazas', async () => {
  let stall = true
  const handler = createArticlePdfHandler({
    getPost: async () => stall ? new Promise<Post | null>(() => {}) : null,
    formatDate: () => '', durationMs: 30,
    createImages: async () => { throw new Error('No se requieren imágenes') },
  })
  // AbortSignal.timeout does not keep Node alive on its own.
  const keepAlive = setInterval(() => {}, 1000)
  try {
    assert.equal((await handler(request(), params())).status, 504)
    const controller = new AbortController()
    const pending = handler(request(controller.signal), params())
    controller.abort()
    assert.equal((await pending).status, 408)
    stall = false
    assert.equal((await handler(request(), params())).status, 404)
  } finally { clearInterval(keepAlive) }
})
