export default function PanelProfileLoading() {
  return (
    <div className="grid gap-5" id="contenido-panel">
      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="h-3 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[0.4fr_1fr]">
        <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm">
          <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-[var(--theme-elevation-100)]" />
          <div className="mt-4 space-y-3">
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            <div className="mx-auto h-3 w-40 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
          </div>
        </div>
        <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm">
          <div className="space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-28 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
                <div className="min-h-12 w-full animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
