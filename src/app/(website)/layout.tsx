import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'

import './globals.css'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: {
    default: 'TxDxNet — Ideas para operar con más claridad',
    template: '%s — TxDxNet',
  },
  description:
    'Insights de TxDxSecure sobre ciberseguridad, redes, observabilidad, experiencia digital y los 11 dominios XOC.',
  applicationName: 'TxDxNet',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'TxDxNet',
    title: 'TxDxNet — Ideas para operar con más claridad',
    description:
      'Conocimiento para construir operaciones seguras, disponibles, observables y centradas en la experiencia.',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#f8f8f4',
}

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
