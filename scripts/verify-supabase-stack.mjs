import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'
import { getPayload } from 'payload'
import { Client } from 'pg'
import { tsImport } from 'tsx/esm/api'

const TEST_FILENAME = 'txdx-supabase-stack-check.png'

async function main() {
  const configModule = await tsImport('./src/payload.config.ts', pathToFileURL(process.cwd()).toString() + '/')
  const config = configModule.default ? await configModule.default : configModule
  const payload = await getPayload({ config })
  const pg = new Client({ connectionString: process.env.DATABASE_URL })
  await pg.connect()

  const uploadPath = path.resolve('public', 'logotxdx.png')

  const createdMedia = await payload.create({
    collection: 'media',
    data: {
      alt: 'Prueba stack Supabase',
      caption: 'Verificacion automatica de storage remoto',
      credit: 'OpenCode',
    },
    filePath: uploadPath,
  })

  const mediaRow = await pg.query(
    `select id, filename, url, thumbnail_u_r_l, prefix, mime_type from cms.media where id = $1`,
    [createdMedia.id],
  )

  const summaryQuery = await pg.query(`
    select 'admins' as table_name, count(*)::int as total from cms.admins
    union all
    select 'admins_sessions' as table_name, count(*)::int as total from cms.admins_sessions
    union all
    select 'posts' as table_name, count(*)::int as total from cms.posts
    union all
    select 'media' as table_name, count(*)::int as total from cms.media
    order by table_name
  `)

  const objectKey = `editorial/${TEST_FILENAME}`
  const thumbKey = `editorial/txdx-supabase-stack-check-480x320.png`
  const cardKey = `editorial/txdx-supabase-stack-check-960x640.png`

  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ca-central-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  })

  const storageChecks = {}

  for (const key of [objectKey, thumbKey, cardKey]) {
    try {
      await s3.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }))
      storageChecks[key] = 'found'
    } catch (error) {
      storageChecks[key] = error?.name || 'missing'
    }
  }

  console.log(
    JSON.stringify(
      {
        createdMedia: {
          id: createdMedia.id,
          filename: createdMedia.filename,
          url: createdMedia.url,
          thumbnailURL: createdMedia.thumbnailURL,
        },
        mediaRow: mediaRow.rows[0],
        storageChecks,
        tableCounts: summaryQuery.rows,
      },
      null,
      2,
    ),
  )

  await pg.end()
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
