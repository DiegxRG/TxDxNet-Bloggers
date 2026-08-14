/* THIS FILE WAS GENERATED FROM THE OFFICIAL PAYLOAD TEMPLATE. */
import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/manrope'
import config from '@payload-config'
import '@payloadcms/next/css'
import type { ServerFunctionClient } from 'payload'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import type { ReactNode } from 'react'

import { importMap } from './admin/importMap.js'
import '../(website)/globals.css'
import './custom.css'
import ThemeAndLayoutWrapper from '../../components/payload/ThemeAndLayoutWrapper'

const serverFunction: ServerFunctionClient = async (args) => {
  'use server'

  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

export default function PayloadLayout({ children }: { children: ReactNode }) {
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      <ThemeAndLayoutWrapper>{children}</ThemeAndLayoutWrapper>
    </RootLayout>
  )
}
