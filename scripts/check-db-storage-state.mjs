import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { Client } from 'pg'

async function main() {
  const pg = new Client({ connectionString: process.env.DATABASE_URL })
  await pg.connect()

  const tables = await pg.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'cms'
      and table_name in ('admins', 'admins_sessions', 'posts', 'media', '_posts_v')
    order by table_name
  `)

  const counts = await pg.query(`
    select 'admins' as table_name, count(*)::int as total from cms.admins
    union all
    select 'admins_sessions' as table_name, count(*)::int as total from cms.admins_sessions
    union all
    select 'posts' as table_name, count(*)::int as total from cms.posts
    union all
    select 'media' as table_name, count(*)::int as total from cms.media
    order by table_name
  `)

  const latestMedia = await pg.query(`
    select id, filename, url, thumbnail_u_r_l, prefix, mime_type, created_at
    from cms.media
    order by created_at desc
    limit 5
  `)

  await pg.end()

  const s3 = new S3Client({
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'ca-central-1',
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
  })

  const objects = await s3.send(
    new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      MaxKeys: 20,
      Prefix: 'editorial/',
    }),
  )

  console.log(
    JSON.stringify(
      {
        tables: tables.rows.map((row) => row.table_name),
        counts: counts.rows,
        latestMedia: latestMedia.rows,
        storage: {
          bucket: process.env.S3_BUCKET,
          objectCount: objects.KeyCount || 0,
          sampleKeys: (objects.Contents || []).map((item) => item.Key),
        },
      },
      null,
      2,
    ),
  )
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
