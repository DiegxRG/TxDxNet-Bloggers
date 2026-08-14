import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Admins } from './collections/Admins'
import { Media } from './collections/Media'
import { Posts } from './collections/Posts'
import { editorialEditor } from './editor'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const hasS3Config = Boolean(
  process.env.S3_ENDPOINT &&
    process.env.S3_ACCESS_KEY_ID &&
    process.env.S3_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET,
)

export default buildConfig({
  admin: {
    user: Admins.slug,
    dateFormat: 'd MMM yyyy, HH:mm',
    theme: 'light',
    components: {
      beforeLogin: ['./components/payload/BeforeLogin'],
      afterLogin: ['./components/payload/AfterLogin'],
      afterNavLinks: ['./components/payload/NavMyArticles'],
      graphics: {
        Icon: {
          exportName: 'TxDxAdminIcon',
          path: './components/payload/TxDxGraphics',
        },
        Logo: {
          exportName: 'TxDxAdminLogo',
          path: './components/payload/TxDxGraphics',
        },
      },
      views: {
        dashboard: {
          Component: {
            path: './components/payload/PublicationHub',
          },
        },
        'mis-articulos': {
          Component: {
            path: './components/payload/MyArticles',
            exportName: 'default',
          },
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: '— TxDxNet',
    },
  },
  collections: [Admins, Media, Posts],
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
      max: 10,
    },
    push: process.env.PAYLOAD_DB_PUSH === 'true',
    schemaName: 'cms',
  }),
  editor: editorialEditor,
  plugins: [
    s3Storage({
      enabled: hasS3Config,
      bucket: process.env.S3_BUCKET || 'media',
      clientUploads: true,
      collections: {
        media: {
          prefix: 'editorial',
        },
      },
      config: {
        endpoint: process.env.S3_ENDPOINT,
        forcePathStyle: true,
        region: process.env.S3_REGION || 'ca-central-1',
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
      },
    }),
  ],
  secret: process.env.PAYLOAD_SECRET || 'development-only-secret-change-before-deploy',
  serverURL: siteURL,
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
