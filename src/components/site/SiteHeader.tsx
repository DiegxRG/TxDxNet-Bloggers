'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { LibraryIcon } from '@/components/icons/LibraryIcon'

import { BrandMark } from './BrandMark'
import styles from './SiteHeader.module.css'

const navigation = [
  { href: '/articulos', label: 'Artículos' },
  { href: '/dominios', label: 'Dominios XOC' },
  { href: '/servicios', label: 'Servicios' },
]

export function SiteHeader() {
  const pathname = usePathname()

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
            <Link href={item.href} key={item.href}>
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
        </div>
      </div>
    </header>
  )
}
