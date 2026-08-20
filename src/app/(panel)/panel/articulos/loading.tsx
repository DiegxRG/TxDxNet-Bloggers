export default function PanelArticlesLoading() {
  return (
    <div className="grid gap-5" id="contenido-panel">
      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="h-3 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-36 animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-[var(--theme-elevation-100)]" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-2xl border border-[var(--theme-elevation-150)] bg-white p-4 shadow-sm"
          >
            <div className="h-16 w-24 shrink-0 animate-pulse rounded-xl bg-[var(--theme-elevation-100)]" />
            <div className="min-w-0 flex-1">
              <div className="h-4 w-48 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
              <div className="mt-2 h-3 w-72 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            </div>
            <div className="hidden h-8 w-20 shrink-0 animate-pulse rounded-full bg-[var(--theme-elevation-100)] sm:block" />
          </div>
        ))}
      </div>
    </div>
  )
}
