import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const migrationNames = [
  '20260814_175153',
  '20260816_124500_add_media_prefix',
  '20260817_170729_add_author_avatar',
  '20260817_223118_add_media_purpose_and_image_only',
]

const requiredTables = ['admins', 'admins_sessions', 'media', 'posts', '_posts_v', 'payload_migrations']
const requiredColumns = [
  ['media', 'prefix'],
  ['admins', 'avatar_id'],
  ['media', 'sizes_avatar_url'],
  ['media', 'sizes_avatar_width'],
  ['media', 'sizes_avatar_height'],
  ['media', 'sizes_avatar_mime_type'],
  ['media', 'sizes_avatar_filesize'],
  ['media', 'sizes_avatar_filename'],
  ['posts', 'author_avatar_id'],
  ['_posts_v', 'version_author_avatar_id'],
  ['media', 'purpose'],
]

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada.')
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await client.query('BEGIN')

    const history = await client.query('SELECT name FROM cms.payload_migrations ORDER BY id')
    const isPushBaseline = history.rows.length === 1 && history.rows[0].name === 'dev'
    if (history.rows.length && !isPushBaseline) {
      throw new Error('La tabla cms.payload_migrations ya tiene historial; no se ejecutó ningún cambio.')
    }

    const tables = await client.query(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'cms' AND table_name = ANY($1::text[])`,
      [requiredTables],
    )
    const existingTables = new Set(tables.rows.map((row) => row.table_name))
    const missingTables = requiredTables.filter((table) => !existingTables.has(table))
    if (missingTables.length) {
      throw new Error(`El esquema no coincide con una base creada por Payload push. Faltan: ${missingTables.join(', ')}`)
    }

    const columns = await client.query(
      `SELECT table_name, column_name
       FROM information_schema.columns
       WHERE table_schema = 'cms'
         AND (table_name, column_name) IN (SELECT * FROM UNNEST($1::text[], $2::text[]))`,
      [requiredColumns.map(([table]) => table), requiredColumns.map(([, column]) => column)],
    )
    const existingColumns = new Set(columns.rows.map((row) => `${row.table_name}.${row.column_name}`))
    const missingColumns = requiredColumns
      .filter(([table, column]) => !existingColumns.has(`${table}.${column}`))
      .map(([table, column]) => `${table}.${column}`)
    if (missingColumns.length) {
      throw new Error(`Faltan cambios previos del esquema: ${missingColumns.join(', ')}`)
    }

    const mediaPurposeType = await client.query(
      `SELECT EXISTS (
         SELECT 1
         FROM pg_type type
         JOIN pg_namespace namespace ON namespace.oid = type.typnamespace
         WHERE namespace.nspname = 'cms' AND type.typname = 'enum_media_purpose'
       ) AS exists`,
    )
    if (!mediaPurposeType.rows[0].exists) {
      throw new Error('Falta cms.enum_media_purpose; no se marcó el historial como baseline.')
    }

    if (isPushBaseline) {
      await client.query("DELETE FROM cms.payload_migrations WHERE name = 'dev'")
    }

    for (const name of migrationNames) {
      await client.query('INSERT INTO cms.payload_migrations (name, batch) VALUES ($1, 1)', [name])
    }

    await client.query('COMMIT')
    console.log(`Baseline registrado: ${migrationNames.length} migraciones históricas.`)
    console.log('Siguiente paso: npm run payload -- migrate')
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
