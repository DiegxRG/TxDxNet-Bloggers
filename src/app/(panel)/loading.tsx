export default function PanelLoading() {
  return (
    <div className="grid gap-5 p-6 md:p-8">
      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="h-3 w-32 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-3 h-8 w-64 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-2 h-4 w-96 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-[1.5rem] border border-[var(--theme-elevation-150)] bg-white p-5 shadow-sm"
          >
            <div className="h-3 w-20 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            <div className="mt-3 h-10 w-16 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            <div className="mt-2 h-3 w-24 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
          </div>
        ))}
      </div>

      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="h-5 w-40 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-5 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-2xl border border-[var(--theme-elevation-100)] p-4">
              <div className="h-16 w-24 animate-pulse rounded-xl bg-[var(--theme-elevation-100)]" />
              <div className="flex-1">
                <div className="h-4 w-48 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
                <div className="mt-2 h-3 w-64 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
