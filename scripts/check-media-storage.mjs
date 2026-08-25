/**
 * Diagnostic: compare S3 storage objects vs database media records.
 *
 * Usage:
 *   node scripts/check-media-storage.mjs
 *
 * Reads DATABASE_URL and S3_* from .env.local.
 */

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3'
import pg from 'pg'

/* ── Load .env.local ─────────────────────────────────────────────────────── */
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.trim().startsWith('#'))
    .map((l) => {
      const idx = l.indexOf('=')
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()]
    }),
)
for (const [k, v] of Object.entries(env)) {
  if (!(k in process.env)) process.env[k] = v
}

/* ── S3 client (Supabase Storage) ───────────────────────────────────────── */
const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  region: process.env.S3_REGION || 'ca-central-1',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

const BUCKET = process.env.S3_BUCKET
const PREFIX = 'editorial/'

/* ── PostgreSQL ──────────────────────────────────────────────────────────── */
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

/* ── Helpers ─────────────────────────────────────────────────────────────── */
async function listS3Objects() {
  const keys = []
  let continuationToken = undefined

  do {
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET,
      Prefix: PREFIX,
      ContinuationToken: continuationToken,
    }))
    for (const obj of res.Contents || []) {
      keys.push(obj.Key)
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuationToken)

  return keys
}

async function getDbMediaRecords() {
  const { rows } = await pool.query(`
    SELECT id, filename, url, thumbnail_u_r_l, prefix
    FROM cms.media
    ORDER BY created_at DESC
  `)
  return rows
}

function extractS3Filename(key) {
  // editorial/original-filename.png → original-filename.png
  return key.startsWith(PREFIX) ? key.slice(PREFIX.length) : key
}

function normalizeForComparison(name) {
  // Remove size suffixes like -480x320, -960x640, -256x256, -1920x1080 and extension
  return name
    .replace(/-\d+x\d+\.\w+$/, '')
    .replace(/\.\w+$/, '')
    .toLowerCase()
}

function groupByBaseFilename(keys) {
  const groups = new Map()
  for (const key of keys) {
    const name = extractS3Filename(key)
    const base = normalizeForComparison(name)
    if (!groups.has(base)) groups.set(base, [])
    groups.get(base).push(key)
  }
  return groups
}

/* ── Main ────────────────────────────────────────────────────────────────── */
async function main() {
  console.log('🔍 Comparando S3 storage vs base de datos...\n')

  // 1. List S3 objects
  console.log('📦 Listando objetos en S3...')
  const s3Keys = await listS3Objects()
  console.log(`   ${s3Keys.length} objetos encontrados en S3 (prefijo: ${PREFIX})\n`)

  // 2. List DB records
  console.log('🗄️  Consultando registros en la base de datos...')
  const dbRecords = await getDbMediaRecords()
  console.log(`   ${dbRecords.length} registros de media en la BD\n`)

  // 3. Map DB filenames to S3 keys
  const s3ByBase = groupByBaseFilename(s3Keys)
  const dbFilenames = new Set(dbRecords.map((r) => normalizeForComparison(r.filename)))

  // 4. Find orphaned S3 objects (in S3 but not referenced by any DB record)
  const orphanedS3 = []
  for (const [base, keys] of s3ByBase) {
    if (!dbFilenames.has(base)) {
      orphanedS3.push({ base, keys })
    }
  }

  // 5. Find DB records with no S3 objects
  const orphanedDb = []
  for (const record of dbRecords) {
    const normalized = normalizeForComparison(record.filename)
    const s3Group = s3ByBase.get(normalized)
    if (!s3Group || s3Group.length === 0) {
      orphanedDb.push(record)
    }
  }

  // ── Report ───────────────────────────────────────────────────────────────
  console.log('═'.repeat(70))
  console.log('📊 RESUMEN')
  console.log('═'.repeat(70))
  console.log(`  Objetos en S3:                    ${s3Keys.length}`)
  console.log(`  Registros en BD:                  ${dbRecords.length}`)
  console.log(`  Archivos huérfanos en S3:         ${orphanedS3.length}`)
  console.log(`  Registros huérfanos en BD:        ${orphanedDb.length}`)
  console.log('═'.repeat(70))

  if (orphanedS3.length > 0) {
    console.log(`\n⚠️  ARCHIVOS EN S3 SIN REFERENCIA EN BD (${orphanedS3.length}):\n`)
    let totalBytes = 0
    for (const { base, keys } of orphanedS3) {
      console.log(`  📁 ${base}`)
      for (const key of keys) {
        // Try to get file size
        try {
          const head = await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
          const size = head.ContentLength || 0
          totalBytes += size
          console.log(`     ${key}  (${(size / 1024).toFixed(1)} KB)`)
        } catch {
          console.log(`     ${key}  (tamaño desconocido)`)
        }
      }
    }
    console.log(`\n  💾 Total espacio recuperable: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`)
  }

  if (orphanedDb.length > 0) {
    console.log(`\n⚠️  REGISTROS EN BD SIN ARCHIVOS EN S3 (${orphanedDb.length}):\n`)
    for (const rec of orphanedDb) {
      console.log(`  🗄️  ${rec.filename} (id: ${rec.id})`)
      console.log(`     url: ${rec.url || 'null'}`)
      console.log(`     thumbnail: ${rec.thumbnail_u_r_l || 'null'}`)
    }
  }

  if (orphanedS3.length === 0 && orphanedDb.length === 0) {
    console.log('\n✅ Todo está sincronizado. No hay archivos huérfanos.')
  }

  await pool.end()
}

main().catch((err) => {
  console.error('❌ Error:', err.message)
  process.exit(1)
})
