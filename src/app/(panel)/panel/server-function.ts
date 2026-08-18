'use server'

import config from '@payload-config'
import { handleServerFunctions } from '@payloadcms/next/layouts'
import { importMap } from '@/app/(payload)/admin/importMap'
import type { ServerFunctionClient } from 'payload'

export const panelServerFunction: ServerFunctionClient = async (args) => {
  return handleServerFunctions({ ...args, config, importMap })
}
