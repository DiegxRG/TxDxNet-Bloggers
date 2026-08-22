import Link from 'next/link'

import { domains, getDomainCopy } from '@/data/domains'
import type { Locale } from '@/lib/locale'

export function DomainIndex({ compact = false, locale = 'es' }: { compact?: boolean; locale?: Locale }) {
  return (
    <div className="border-t border-ink-950/15">
      {domains.map((domain) => (
        <Link
          className="domain-row group grid gap-4 border-b border-ink-950/15 py-5 transition-colors hover:bg-blue-50 md:grid-cols-[64px_1.1fr_1.2fr_32px] md:items-center md:px-4"
          href={`/dominios#dominio-${domain.id}`}
          id={compact ? undefined : `dominio-${domain.id}`}
          key={domain.id}
        >
          <span className="font-display text-sm font-bold text-signal-orange">{domain.id}</span>
          <span className="font-display text-xl font-semibold tracking-[-0.03em] text-ink-950 sm:text-2xl">
            {getDomainCopy(domain, locale).name}
          </span>
          <span className="max-w-lg text-sm leading-6 text-ink-500">{getDomainCopy(domain, locale).description}</span>
          <span
            aria-hidden="true"
            className="hidden size-8 place-items-center rounded-full border border-ink-950/15 text-sm transition group-hover:rotate-45 group-hover:border-blue-600 group-hover:bg-blue-600 group-hover:text-white md:grid"
          >
            ↗
          </span>
        </Link>
      ))}
    </div>
  )
}
