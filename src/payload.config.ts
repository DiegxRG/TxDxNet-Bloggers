import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Admins } from './collections/Admins'
import { AnalyticsEvents } from './collections/AnalyticsEvents'
import { AnalyticsVisitors } from './collections/AnalyticsVisitors'
import { AuditLogs } from './collections/AuditLogs'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { editorialEditor } from './editor'
import { EDITORIAL_STORAGE_PREFIX, getMediaStorageConfig } from './modules/content/infrastructure/media-storage-config'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'https://txdxnet.com'
const configuredPoolMax = Number.parseInt(process.env.DATABASE_POOL_MAX || '', 10)
const databasePoolMax = Number.isInteger(configuredPoolMax) && configuredPoolMax > 0
  ? configuredPoolMax
  : process.env.NODE_ENV === 'development'
    ? 3
    : 5
const mediaStorage = getMediaStorageConfig()

export default buildConfig({
  admin: {
    user: Admins.slug,
  },
  collections: [Admins, AnalyticsEvents, AnalyticsVisitors, AuditLogs, Media, Posts],
  graphQL: {
    disable: true,
  },
  cors: [siteURL, 'http://localhost:3000'],
  csrf: [siteURL, 'http://localhost:3000'],
  i18n: {
    fallbackLanguage: 'es',
  },
  db: postgresAdapter({
    idType: 'uuid',
    migrationDir: path.resolve(dirname, 'migrations'),
    pool: {
      connectionString: process.env.DATABASE_URL || '',
      max: databasePoolMax,
    },
    push: process.env.PAYLOAD_DB_PUSH === 'true',
    schemaName: 'cms',
  }),
  editor: editorialEditor,
  plugins: [
    s3Storage({
      enabled: Boolean(mediaStorage),
      bucket: mediaStorage?.bucket || 'media',
      clientUploads: true,
      collections: {
        media: {
          prefix: EDITORIAL_STORAGE_PREFIX,
        },
      },
      config: mediaStorage?.config || {},
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'development-only-secret-change-before-deploy',
  serverURL: siteURL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
