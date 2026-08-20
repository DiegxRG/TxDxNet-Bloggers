export default function WebsiteLoading() {
  return (
    <main className="bg-paper text-ink-950" id="contenido">
      <div className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="h-6 w-48 animate-pulse rounded bg-ink-950/8" />
        <div className="mt-6 h-12 w-3/4 animate-pulse rounded bg-ink-950/8" />
        <div className="mt-3 h-5 w-full animate-pulse rounded bg-ink-950/6" />
        <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-ink-950/6" />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-ink-950/8 bg-white">
              <div className="aspect-[16/10] animate-pulse bg-ink-950/6" />
              <div className="p-5">
                <div className="h-3 w-24 animate-pulse rounded bg-ink-950/6" />
                <div className="mt-3 h-5 w-full animate-pulse rounded bg-ink-950/8" />
                <div className="mt-2 h-4 w-full animate-pulse rounded bg-ink-950/6" />
                <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-ink-950/6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
