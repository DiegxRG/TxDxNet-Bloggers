type InteriorHeroProps = {
  code: string
  eyebrow: string
  title: string
  description: string
}

export function InteriorHero({ code, eyebrow, title, description }: InteriorHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink-950 px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-28">
      <div className="hero-grid" />
      <div className="relative mx-auto max-w-[1440px]">
        <div className="flex items-center gap-4 text-[10px] font-extrabold tracking-[0.2em] text-blue-200 uppercase">
          <span className="text-signal-orange">{code}</span>
          <span>{eyebrow}</span>
        </div>
        <h1 className="mt-10 max-w-6xl font-display text-6xl leading-[0.86] font-semibold tracking-[-0.07em] text-balance sm:text-8xl lg:text-[8.7rem]">
          {title}
        </h1>
        <p className="mt-10 max-w-2xl border-l border-signal-orange pl-6 text-base leading-8 text-slate-300">
          {description}
        </p>
      </div>
    </section>
  )
}
