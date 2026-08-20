'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { LibraryIcon } from '@/components/icons/LibraryIcon'

import { BrandMark } from './BrandMark'
import styles from './SiteHeader.module.css'

const navigation = [
  { href: '/articulos', label: 'Artículos' },
  { href: '/dominios', label: 'Dominios XOC' },
  { href: '/equipo', label: 'Equipo' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const closeMenuTimeout = window.setTimeout(() => setMobileOpen(false), 0)
    return () => window.clearTimeout(closeMenuTimeout)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [mobileOpen])

  return (
    <header
      className={styles.header}
      data-header-anim={pathname === '/' ? '' : undefined}
      data-site-header
    >
      <div className={styles.inner}>
        <BrandMark priority />
        <nav aria-label="Navegación principal" className={styles.navigation}>
          {navigation.map((item) => (
            <Link
              aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className={styles.actions}>
          <Link className={styles.library} href="/articulos">
            <LibraryIcon className={styles.libraryIcon} />
            <span>Biblioteca</span>
            <span aria-hidden="true" className={styles.arrow}>→</span>
          </Link>
          <button
            aria-controls="site-mobile-nav"
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className={styles.menuToggle}
            onClick={() => setMobileOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>
      {mobileOpen ? (
        <div className={styles.mobileMenu} id="site-mobile-nav">
          <nav aria-label="Navegación móvil" className={styles.mobileNavigation}>
            {navigation.map((item) => (
              <Link
                aria-current={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'page' : undefined}
                href={item.href}
                key={item.href}
                onClick={() => setMobileOpen(false)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
