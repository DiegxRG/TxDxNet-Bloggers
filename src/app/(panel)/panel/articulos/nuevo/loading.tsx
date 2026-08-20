export default function PanelArticleEditorLoading() {
  return (
    <div className="grid gap-5" id="contenido-panel">
      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="h-3 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
      </div>

      <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="grid gap-5 xl:grid-cols-[1fr_0.42fr]">
          <div className="grid gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
                <div className="min-h-12 w-full animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
              </div>
            ))}
          </div>
          <div className="rounded-[1.35rem] border border-[var(--theme-elevation-150)] bg-[var(--theme-elevation-50)] p-5">
            <div className="h-3 w-24 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            <div className="mt-4 space-y-4">
              <div className="h-12 w-full animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
              <div className="h-16 w-full animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-4 h-64 w-full animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm">
          <div className="h-3 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
          <div className="mt-5 grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[16/10] animate-pulse rounded-xl bg-[var(--theme-elevation-100)]" />
            ))}
          </div>
        </div>
        <div className="rounded-[1.7rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm">
          <div className="h-3 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
          <div className="mt-5 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
