'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { useMemo, useSyncExternalStore, useState } from 'react'

type UserSummary = {
  avatarURL?: null | string
  email: string
  name: string
  publicTitle?: null | string
}

type Props = {
  children: ReactNode
  user: UserSummary
}

type NavItem = {
  description: string
  href: string
  icon: ReactNode
  label: string
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/panel',
    label: 'Resumen',
    description: 'Estado editorial',
    icon: (
      <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
        <path d="M4 13h6V5H4v8Zm0 6h6v-4H4v4Zm10 0h6V11h-6v8Zm0-14v4h6V5h-6Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    href: '/panel/articulos',
    label: 'Articulos',
    description: 'Borradores y publicados',
    icon: (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M7 4.75h9.5A2.75 2.75 0 0 1 19.25 7.5v11A1.75 1.75 0 0 1 17.5 20.25H7A2.25 2.25 0 0 1 4.75 18V7A2.25 2.25 0 0 1 7 4.75Z" />
        <path d="M8.5 9.25h7M8.5 12.25h7M8.5 15.25h4.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/panel/biblioteca',
    label: 'Biblioteca',
    description: 'Imagenes editoriales',
    icon: (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M4.75 7.75A2.75 2.75 0 0 1 7.5 5h2.72a2.75 2.75 0 0 1 1.95.81l1.02 1.02c.51.52 1.22.81 1.95.81h1.36A2.75 2.75 0 0 1 19.25 10.4v6.1A2.75 2.75 0 0 1 16.5 19.25h-9A2.75 2.75 0 0 1 4.75 16.5V7.75Z" />
        <path d="m8.5 15 2.2-2.2a1 1 0 0 1 1.41 0L14 14.68l1.05-1.05a1 1 0 0 1 1.41 0L18 15.17" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/panel/perfil',
    label: 'Perfil',
    description: 'Firma y acceso',
    icon: (
      <svg aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24">
        <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 7a7 7 0 0 1 14 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

const VIEW_META = [
  {
    prefix: '/panel/articulos',
    kicker: 'Centro de articulos',
    title: 'Tus articulos editoriales',
    description: 'Filtra, revisa y publica sin perder tiempo.',
  },
  {
    prefix: '/panel/biblioteca',
    kicker: 'Biblioteca multimedia',
    title: 'Tu coleccion de archivos',
    description: 'Sube y organiza imagenes editoriales.',
  },
  {
    prefix: '/panel/perfil',
    kicker: 'Perfil editorial',
    title: 'Tu identidad como escritor',
    description: 'Ajusta tu firma publica y tu acceso.',
  },
  {
    prefix: '/panel',
    kicker: 'Workspace editorial',
    title: 'Consola editorial TxDx',
    description: 'Resumen, articulos, biblioteca y perfil en un solo lugar.',
  },
]

function getViewMeta(pathname: string) {
  return VIEW_META.find((entry) => pathname.startsWith(entry.prefix)) || VIEW_META[VIEW_META.length - 1]
}

function isItemActive(pathname: string, href: string) {
  return href === '/panel' ? pathname === href : pathname.startsWith(href)
}

const SIDEBAR_STORAGE_KEY = 'txdx-panel-sidebar-collapsed'
const SIDEBAR_CHANGE_EVENT = 'txdx-panel-sidebar-change'

function subscribeToSidebar(callback: () => void) {
  window.addEventListener(SIDEBAR_CHANGE_EVENT, callback)
  return () => window.removeEventListener(SIDEBAR_CHANGE_EVENT, callback)
}

function getSidebarSnapshot() {
  return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
}

function getSidebarServerSnapshot() {
  return false
}

export function PanelShell({ children, user }: Props) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)
  const sidebarCollapsed = useSyncExternalStore(subscribeToSidebar, getSidebarSnapshot, getSidebarServerSnapshot)
  const currentView = useMemo(() => getViewMeta(pathname), [pathname])
  const firstName = user.name.split(' ')[0] || 'Admin'
  const role = user.publicTitle || 'Administrador editorial'

  function toggleSidebar() {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(!sidebarCollapsed))
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT))
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(88,217,255,0.08),transparent_24%),linear-gradient(180deg,#eef3fb_0%,#f8fafc_45%,#eef2f8_100%)] text-[var(--txdx-navy)]">
      {navOpen ? (
        <button
          aria-label="Cerrar navegacion"
          className="fixed inset-0 z-30 bg-[rgba(7,20,45,0.45)] md:hidden"
          onClick={() => setNavOpen(false)}
          type="button"
        />
      ) : null}

      <div className={`relative md:grid ${sidebarCollapsed ? 'md:grid-cols-[4.75rem_minmax(0,1fr)]' : 'md:grid-cols-[18.5rem_minmax(0,1fr)]'}`}>
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-[18.5rem] flex-col bg-[linear-gradient(180deg,#07142d_0%,#0b1d3d_56%,#10254f_100%)] text-white shadow-[0_28px_80px_rgba(2,8,24,0.45)] transition-[transform,width] duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${
            navOpen ? 'translate-x-0' : '-translate-x-full'
          } ${sidebarCollapsed ? 'md:w-[4.75rem]' : 'md:w-[18.5rem]'}`}
        >
          <div className={`border-b border-white/10 pb-5 pt-6 ${sidebarCollapsed ? 'px-2 md:px-2' : 'px-5'}`}>
            <Link className={`flex items-center text-white ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`} href="/panel" onClick={() => setNavOpen(false)}>
              <span className="relative block h-[54px] w-[54px] shrink-0">
                <Image alt="TxDxNet" fill priority sizes="54px" src="/logotxdx.png" />
              </span>
              <span className={`${sidebarCollapsed ? 'md:hidden' : ''} min-w-0`}>
                <span className="block font-display text-xl font-extrabold tracking-[-0.05em]">
                  TxDxNet
                </span>
                <span className="mt-1 block text-[0.62rem] font-extrabold uppercase tracking-[0.26em] text-[rgba(255,255,255,0.58)]">
                  Consola editorial TxDx
                </span>
              </span>
            </Link>

            <div className={`mt-5 rounded-[1.15rem] border border-white/10 bg-white/6 py-3.5 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
              <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] font-display text-base font-extrabold text-white">
                  {user.avatarURL ? (
                    <Image alt={`Foto de perfil de ${user.name}`} className="object-cover" fill sizes="44px" src={user.avatarURL} />
                  ) : (
                    firstName.slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className={`${sidebarCollapsed ? 'md:hidden' : ''} min-w-0`}>
                  <span className="block text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-[var(--txdx-cyan)]">Sesion activa</span>
                  <span className="mt-2 block text-lg font-bold text-white">{firstName}</span>
                  <span className="mt-1 block truncate text-sm text-white/72">{role}</span>
                  <span className="mt-2 block truncate text-xs text-white/52">{user.email}</span>
                </span>
              </div>
            </div>
          </div>

          <nav className={`flex-1 overflow-y-auto py-5 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
            <p className={`${sidebarCollapsed ? 'md:hidden' : ''} px-3 text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-[rgba(255,255,255,0.42)]`}>
              Operacion diaria
            </p>

            <ul className="mt-3 space-y-2">
              {NAV_ITEMS.map((item) => {
                const active = isItemActive(pathname, item.href)

                return (
                  <li key={item.href}>
                    <Link
                      aria-label={sidebarCollapsed ? item.label : undefined}
                      className={`group flex items-center rounded-[1rem] border px-3 py-2.5 transition ${sidebarCollapsed ? 'justify-center' : 'gap-3'} ${
                        active
                          ? 'border-[rgba(88,217,255,0.18)] bg-[linear-gradient(135deg,rgba(18,104,255,0.28),rgba(255,90,24,0.18))] shadow-[0_18px_36px_rgba(2,8,24,0.24)]'
                          : 'border-transparent bg-transparent hover:border-white/8 hover:bg-white/5'
                      }`}
                      href={item.href}
                      onClick={() => setNavOpen(false)}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <span
                        className={`grid h-11 w-11 flex-none place-items-center rounded-2xl border ${
                          active
                            ? 'border-white/16 bg-white/10 text-white'
                            : 'border-white/10 bg-white/5 text-white/72 group-hover:text-white'
                        }`}
                      >
                        <span className="h-5 w-5">{item.icon}</span>
                      </span>
                      <span className={`${sidebarCollapsed ? 'md:hidden' : ''} min-w-0`}>
                        <strong className="block text-sm font-extrabold text-white">{item.label}</strong>
                        <span className="mt-1 block text-xs text-white/58">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-[rgba(7,20,45,0.08)] bg-[rgba(248,250,252,0.88)] backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1600px] items-center gap-4 px-4 py-4 md:px-8">
              <button
                aria-label="Abrir navegacion"
                className="grid h-12 w-12 place-items-center rounded-2xl border border-[rgba(7,20,45,0.08)] bg-white text-[var(--txdx-navy)] shadow-[0_10px_24px_rgba(7,20,45,0.08)] md:hidden"
                onClick={() => setNavOpen(true)}
                type="button"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>

              <button
                aria-label={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
                aria-pressed={sidebarCollapsed}
                className="hidden h-12 w-12 place-items-center rounded-2xl border border-[rgba(7,20,45,0.08)] bg-white text-[var(--txdx-navy)] shadow-[0_10px_24px_rgba(7,20,45,0.08)] transition hover:border-[rgba(18,104,255,0.2)] hover:text-[var(--txdx-blue)] md:grid"
                onClick={toggleSidebar}
                title={sidebarCollapsed ? 'Expandir barra lateral' : 'Contraer barra lateral'}
                type="button"
              >
                <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M8 5v14M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" strokeLinecap="round" />
                  <path d={sidebarCollapsed ? 'm10 9 3 3-3 3' : 'm14 9-3 3 3 3'} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div className="min-w-0 flex-1">
                <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-[var(--color-blue-500)]">
                  {currentView.kicker}
                </p>
                <div className="mt-1.5 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <h1 className="font-display text-[clamp(1.35rem,2vw,2rem)] font-extrabold tracking-[-0.05em] text-[var(--txdx-navy)]">
                      {currentView.title}
                    </h1>
                    <p className="mt-0.5 max-w-3xl text-sm leading-5 text-[var(--theme-elevation-600)]">
                      {currentView.description}
                    </p>
                  </div>
              </div>
            </div>

              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  aria-label="Ver sitio publico"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(18,104,255,0.18)] bg-[rgba(18,104,255,0.08)] px-3 text-sm font-extrabold text-[var(--color-blue-600)] transition hover:-translate-y-0.5 hover:bg-[rgba(18,104,255,0.14)] lg:px-4"
                  href="/"
                  prefetch={false}
                  title="Ver sitio publico"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3.6 9h16.8M3.6 15h16.8" strokeLinecap="round" />
                    <ellipse cx="12" cy="12" rx="4" ry="9" />
                  </svg>
                  <span className="hidden lg:inline">Ver sitio</span>
                </Link>
                <Link
                  aria-label="Cerrar sesion"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[rgba(255,90,24,0.22)] bg-[rgba(255,90,24,0.11)] px-3 text-sm font-extrabold text-[var(--txdx-orange)] transition hover:-translate-y-0.5 hover:bg-[rgba(255,90,24,0.18)] lg:px-4"
                  href="/admin/logout"
                  prefetch={false}
                  title="Cerrar sesion"
                >
                  <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="hidden lg:inline">Salir</span>
                </Link>
              </div>

              <Link
                className="group hidden items-center gap-3 rounded-full border border-[rgba(7,20,45,0.08)] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(7,20,45,0.05)] sm:flex"
                href="/panel/perfil"
              >
                <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-full bg-[linear-gradient(135deg,var(--txdx-orange),var(--color-blue-500))] font-display text-base font-extrabold text-white">
                  {user.avatarURL ? (
                    <Image alt={`Foto de perfil de ${user.name}`} className="object-cover" fill sizes="44px" src={user.avatarURL} />
                  ) : (
                    firstName.slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="hidden text-left lg:block">
                  <strong className="block text-sm font-extrabold text-[var(--txdx-navy)]">
                    {user.name}
                  </strong>
                  <span className="mt-0.5 block text-xs text-[var(--theme-elevation-500)]">
                    {role}
                  </span>
                </span>
              </Link>
            </div>
          </header>

          <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
