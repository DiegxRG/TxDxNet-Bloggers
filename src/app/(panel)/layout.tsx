import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import type { ReactNode } from 'react'

import { PanelShell } from '@/components/panel/PanelShell'
import { getMediaURL } from '@/modules/content/infrastructure/payload/posts'
import { getPanelSession } from '@/modules/panel/server/session'

import '../(website)/globals.css'
import './panel/panel.css'

export const instant = false

export default async function PanelRootLayout({ children }: { children: ReactNode }) {
  const { payload, user } = await getPanelSession()
  const profile = await payload.findByID({
    collection: 'admins',
    depth: 1,
    id: user.id,
    overrideAccess: false,
    select: { avatar: true },
    user,
  })

  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body className="txdx-panel-app">
        <a className="skip-link" href="#contenido-panel">
          Saltar al contenido del panel
        </a>
        <PanelShell
          user={{
            email: user.email,
            name: user.name,
            publicTitle: user.publicTitle,
            avatarURL: getMediaURL(profile.avatar, 'avatar'),
          }}
        >
          {children}
        </PanelShell>
      </body>
    </html>
  )
}
