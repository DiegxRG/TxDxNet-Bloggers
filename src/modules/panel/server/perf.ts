import 'server-only'

export function startPanelMeasure(label: string) {
  const startedAt = performance.now()

  return {
    end(extra?: Record<string, unknown>) {
      const duration = Math.round(performance.now() - startedAt)
      console.info(`[panel] ${label} ${duration}ms${extra ? ` ${JSON.stringify(extra)}` : ''}`)
    },
  }
}
