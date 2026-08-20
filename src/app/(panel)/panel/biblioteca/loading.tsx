export default function PanelLibraryLoading() {
  return (
    <div className="grid gap-5" id="contenido-panel">
      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="h-3 w-36 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-3 h-8 w-56 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
      </div>

      <div className="rounded-[1.8rem] border border-[var(--theme-elevation-150)] bg-white p-6 shadow-sm md:p-7">
        <div className="flex items-center gap-3">
          <div className="h-12 w-48 animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
          <div className="h-12 w-36 animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="aspect-[4/3] animate-pulse rounded-2xl bg-[var(--theme-elevation-100)]" />
              <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
              <div className="h-2 w-1/2 animate-pulse rounded bg-[var(--theme-elevation-100)]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
