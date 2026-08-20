import Image from 'next/image'
import Link from 'next/link'

export function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <Link aria-label="TxDxNet — Inicio" className="brand-mark group" href="/">
      <span className="brand-logo-wrap">
        <Image
          alt="TxDxNet"
          className="brand-logo"
          fill
          priority={priority}
          src="/logotxdx.png"
          sizes="(max-width: 620px) 44px, 54px"
        />
      </span>
      <span className="brand-copy">
        <span className="brand-name">TxDxNet</span>
        <span className="brand-powered">
          <span aria-hidden="true" className="brand-divider">/</span>
          <span>Artículos por TxDxSecure</span>
        </span>
      </span>
    </Link>
  )
}
