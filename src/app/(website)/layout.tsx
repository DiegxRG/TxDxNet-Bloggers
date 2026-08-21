import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Suspense } from 'react'

import { LocalizedSiteFooter } from '@/components/site/LocalizedSiteFooter'
import { LocalizedSiteHeader } from '@/components/site/LocalizedSiteHeader'
import { SiteFooter } from '@/components/site/SiteFooter'
import { TornPaperCTA } from '@/components/site/TornPaperCTA'
import { AnalyticsTracker } from '@/components/site/AnalyticsTracker'
import { LocaleBootstrap } from '@/components/site/LocaleBootstrap'

import './globals.css'

const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com'

export const metadata: Metadata = {
  metadataBase: new URL(siteURL),
  title: {
    default: 'TxDxSecure — Ideas para operar con más claridad',
    template: '%s — TxDxSecure',
  },
  description:
    'Insights de TxDxSecure sobre ciberseguridad, redes, observabilidad, experiencia digital y los 11 dominios XOC.',
  applicationName: 'TxDxSecure',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_PE',
    siteName: 'TxDxSecure',
    title: 'TxDxSecure — Ideas para operar con más claridad',
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

export default async function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="es">
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
         <Suspense fallback={null}>
           <LocalizedSiteHeader />
        </Suspense>
        <Suspense fallback={null}>
          <TornPaperCTA />
        </Suspense>
        {children}
        <Suspense fallback={<SiteFooter locale="es" />}>
          <LocalizedSiteFooter />
        </Suspense>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <LocaleBootstrap />
      </body>
    </html>
  )
}
