export default function ArticlePreviewLoading() {
  const widths = ['72%', '85%', '64%', '91%', '78%']

  return (
    <main className="bg-paper text-ink-950" id="contenido">
      <div className="mx-auto max-w-[860px] px-5 py-16 sm:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-8 w-8 animate-pulse rounded-full bg-ink-950/8" />
          <div className="h-4 w-32 animate-pulse rounded bg-ink-950/6" />
        </div>
        <div className="h-8 w-3/4 animate-pulse rounded bg-ink-950/8" />
        <div className="mt-4 h-5 w-full animate-pulse rounded bg-ink-950/6" />
        <div className="mt-12 space-y-4">
          {widths.map((w, i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-ink-950/6" style={{ width: w }} />
          ))}
        </div>
      </div>
    </main>
  )
}
