import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import type { ReactNode } from 'react'

import { PanelShell } from '@/components/panel/PanelShell'
import { getPanelSession } from '@/modules/panel/server/session'

import '../(website)/globals.css'
import './panel/panel.css'

export const dynamic = 'force-dynamic'

export default async function PanelRootLayout({ children }: { children: ReactNode }) {
  const { user } = await getPanelSession()

  return (
    <html lang="es">
      <body className="txdx-panel-app">
        <a className="skip-link" href="#contenido-panel">
          Saltar al contenido del panel
        </a>
        <PanelShell
          user={{
            email: user.email,
            name: user.name,
            publicTitle: user.publicTitle,
          }}
        >
          {children}
        </PanelShell>
      </body>
    </html>
  )
}
