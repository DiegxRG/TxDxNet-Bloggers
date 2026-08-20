export default function ArticleLoading() {
  const widths = ['75%', '88%', '62%', '93%', '71%', '85%', '68%', '90%', '77%', '80%', '66%', '94%']

  return (
    <main className="bg-paper text-ink-950" id="contenido">
      <article>
        <header className="article-hero">
          <div className="article-hero-grid" />
          <div className="relative mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12 lg:py-14">
            <div className="h-4 w-36 animate-pulse rounded bg-white/20" />
            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1fr]">
              <div>
                <div className="h-4 w-20 animate-pulse rounded bg-white/15" />
                <div className="mt-4 h-10 w-full animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-10 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="mt-4 h-5 w-full animate-pulse rounded bg-white/10" />
                <div className="mt-2 h-5 w-2/3 animate-pulse rounded bg-white/10" />
              </div>
              <div className="aspect-[16/10] animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[860px] px-5 py-16 sm:px-8">
          <div className="space-y-4">
            {widths.map((w, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-ink-950/6" style={{ width: w }} />
            ))}
          </div>
        </div>
      </article>
    </main>
  )
}
