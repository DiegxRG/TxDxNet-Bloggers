import Link from 'next/link'

import { BrandMark } from './BrandMark'

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-ink-950 text-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
        <div>
          <BrandMark />
          <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
            Conocimiento para operar superficies digitales seguras, disponibles y observables.
          </p>
        </div>
        <div>
          <p className="footer-label">Explorar</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-300">
            <Link href="/dominios">11 dominios</Link>
            <Link href="/servicios">Servicios</Link>
            <Link href="/articulos">Insights</Link>
          </div>
        </div>
        <div>
          <p className="footer-label">Empresa</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-slate-300">
            <a href="https://www.txdxsecure.com/" rel="noreferrer" target="_blank">
              TxDxSecure ↗
            </a>
            <a href="https://xoc.app/" rel="noreferrer" target="_blank">
              XOC Platform ↗
            </a>
            <a href="mailto:info@txdxsecure.com">Contacto</a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-5 py-5 text-center text-[10px] font-semibold tracking-[0.18em] text-slate-500 uppercase">
        © {new Date().getFullYear()} TxDxSecure · Transformaciones digitales seguras
      </div>
    </footer>
  )
}
