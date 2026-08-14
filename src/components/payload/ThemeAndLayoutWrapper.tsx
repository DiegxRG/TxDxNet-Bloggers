'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import BeforeLogin from './BeforeLogin'

export default function ThemeAndLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  if (pathname === '/admin/create-first-user') {
    return (
      <div className="custom-create-first-user-layout">
        {/* Renderizamos el panel directamente dentro del flujo para que CSS lo atrape */}
        <BeforeLogin payload={{ config: { serverURL: '/' } } as any} />
        <div className="custom-create-first-user-right">
          {children}
        </div>
      </div>
    )
  }

  return children
}
