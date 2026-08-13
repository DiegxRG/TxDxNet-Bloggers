type SectionHeadingProps = {
  index: string
  eyebrow: string
  title: string
  description?: string
  dark?: boolean
}

export function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  dark = false,
}: SectionHeadingProps) {
  return (
    <div className="grid gap-8 border-t border-current/15 pt-5 md:grid-cols-[1fr_3fr]">
      <div className="flex items-start gap-4 text-xs font-bold tracking-[0.16em] uppercase">
        <span className={dark ? 'text-signal-orange' : 'text-blue-700'}>{index}</span>
        <span className={dark ? 'text-slate-400' : 'text-ink-500'}>{eyebrow}</span>
      </div>
      <div>
        <h2 className="max-w-4xl font-display text-4xl leading-[0.98] font-semibold tracking-[-0.055em] text-balance sm:text-5xl lg:text-7xl">
          {title}
        </h2>
        {description ? (
          <p className={`mt-6 max-w-2xl text-base leading-8 ${dark ? 'text-slate-400' : 'text-ink-600'}`}>
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
