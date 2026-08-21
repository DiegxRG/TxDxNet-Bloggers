import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import type { ReactNode } from 'react'

import '../(website)/globals.css'
import '../(panel)/panel/panel.css'

export const instant = false

export default function PanelAuthLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="txdx-panel-app">{children}</body>
    </html>
  )
}
