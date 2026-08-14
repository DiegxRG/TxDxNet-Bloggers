'use client'

import { Link, useConfig } from '@payloadcms/ui'
import { formatAdminURL } from 'payload/shared'
import { usePathname } from 'next/navigation'

export default function NavMyArticles() {
  const {
    config: { routes },
  } = useConfig()
  const pathname = usePathname()

  const href = formatAdminURL({ adminRoute: routes.admin, path: '/mis-articulos' })
  const isActive = pathname.startsWith(href) && ['/', undefined].includes(pathname[href.length])

  return (
    <Link className="nav__link" href={href} prefetch={false}>
      {isActive && <div className="nav__link-indicator" />}
      <span className="nav__link-label">Mis artículos</span>
    </Link>
  )
}
