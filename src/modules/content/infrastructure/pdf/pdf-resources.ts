export const PDF_LIMITS = {
  imageBytes: 20 * 1024 * 1024,
  totalImageBytes: 100 * 1024 * 1024,
  imagePixels: 40_000_000,
  totalImagePixels: 80_000_000,
  imageDimension: 16_384,
  imageOutputDimension: 2400,
  images: 64,
  outputBytes: 32 * 1024 * 1024,
  pages: 200,
  contentValues: 20_000,
  contentDepth: 64,
  textCharacters: 500_000,
  durationMs: 45_000,
  imageDurationMs: 15_000,
  concurrentGenerations: 2,
} as const

export class PdfResourceLimitError extends Error {
  constructor() {
    super('El artículo supera los límites de generación del PDF.')
    this.name = 'PdfResourceLimitError'
  }
}

export function assertPdfContentBudget(content: unknown) {
  const pending = [{ value: content, depth: 0 }]
  let values = 0
  let characters = 0
  while (pending.length) {
    const { value, depth } = pending.pop()!
    if (++values > PDF_LIMITS.contentValues || depth > PDF_LIMITS.contentDepth) {
      throw new PdfResourceLimitError()
    }
    if (typeof value === 'string') characters += value.length
    if (characters > PDF_LIMITS.textCharacters) throw new PdfResourceLimitError()
    if (value && typeof value === 'object') {
      const children = Object.values(value)
      if (children.length + pending.length + values > PDF_LIMITS.contentValues) {
        throw new PdfResourceLimitError()
      }
      for (const child of children) pending.push({ value: child, depth: depth + 1 })
    }
  }
}

export function createPdfConcurrencyLimiter(maximum = PDF_LIMITS.concurrentGenerations) {
  let active = 0
  return () => {
    if (active >= maximum) return null
    active++
    let released = false
    return () => {
      if (!released) active--
      released = true
    }
  }
}

export function waitForPdfOperation<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason)
    if (signal.aborted) abort()
    else signal.addEventListener('abort', abort, { once: true })
    operation.then(resolve, reject).finally(() => signal.removeEventListener('abort', abort))
  })
}
