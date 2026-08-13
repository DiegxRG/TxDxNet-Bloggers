import Link from 'next/link'

import { BrandMark } from './BrandMark'

const navigation = [
  { code: '01', href: '/dominios', label: 'Dominios' },
  { code: '02', href: '/servicios', label: 'Servicios' },
  { code: '03', href: '/articulos', label: 'Insights' },
]

export function SiteHeader() {
  return (
    <header className="site-header">
      <div aria-hidden="true" className="site-header-signal" />
      <div className="site-header-inner">
        <BrandMark priority />
        <nav aria-label="Navegación principal" className="site-navigation">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>{item.code}</span>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </nav>
        <div className="site-header-actions">
          <a
            className="site-contact-link"
            href="mailto:info@txdxsecure.com?subject=Conversación desde TxDxNet"
          >
            Contacto
          </a>
          <Link className="site-library-cta" href="/articulos">
            <span aria-hidden="true" className="site-library-pulse" />
            <span className="site-library-label">Abrir biblioteca</span>
            <span aria-hidden="true" className="site-library-arrow">↗</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
