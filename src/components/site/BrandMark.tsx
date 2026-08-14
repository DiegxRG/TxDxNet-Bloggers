import Image from 'next/image'
import Link from 'next/link'

export function BrandMark({ priority = false }: { priority?: boolean }) {
  return (
    <Link aria-label="TxDxNet — Inicio" className="brand-mark group" href="/">
      <span className="brand-logo-wrap">
        <Image
          alt="TxDxSecure"
          className="brand-logo"
          height={58}
          priority={priority}
          src="/logotxdx.png"
          width={58}
        />
      </span>
      <span className="brand-copy">
        <span className="brand-name">TxDxNet</span>
        <span className="brand-powered">
          Biblioteca de TxDxSecure
        </span>
      </span>
    </Link>
  )
}
