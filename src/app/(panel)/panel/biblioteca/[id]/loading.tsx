export default function PanelMediaDetailLoading() {
  return (
    <div className="grid gap-5" id="contenido-panel">
      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-xl bg-[var(--theme-elevation-100)]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.4fr]">
        <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm">
          <div className="aspect-[16/10] animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
        </div>
        <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-3 w-24 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
                <div className="min-h-10 w-full animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
