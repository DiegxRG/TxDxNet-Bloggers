import 'server-only'

export function startPanelMeasure(label: string) {
  const startedAt = Date.now()

  return {
    end(extra?: Record<string, unknown>) {
      const duration = Date.now() - startedAt
      console.info(`[panel] ${label} ${duration}ms${extra ? ` ${JSON.stringify(extra)}` : ''}`)
    },
  }
}
