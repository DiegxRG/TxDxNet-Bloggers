import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const admins = [
  { email: 'angelo.garcia@txdxsecure.com', name: 'Angelo Garcia', role: 'editor' },
  { email: 'cristhian.morillo@txdxsecure.com', name: 'Cristhian Morillo', role: 'editor' },
  { email: 'steve.ricapa@txdxsecure.com', name: 'Steve Ricapa', role: 'editor' },
  { email: 'rolando.ricapa@txdxsecure.com', name: 'Rolando Ricapa', role: 'owner' },
  { email: 'carla.ricapa@txdxsecure.com', name: 'Carla Ricapa', role: 'editor' },
  { email: 'diego.ramos@txdxsecure.com', name: 'Diego Ramos', role: 'owner' },
  { email: 'anthony.callirgos@txdxsecure.com', name: 'Anthony Callirgos', role: 'editor' },
  { email: 'michael.caceres@txdxsecure.com', name: 'Michael Caceres', role: 'editor' },
  { email: 'ralph.ricapa@txdxsecure.com', name: 'Ralph Ricapa', role: 'editor' },
]

function parseArgs() {
  const args = process.argv.slice(2)
  const outputIndex = args.indexOf('--output')

  return {
    dryRun: args.includes('--dry-run'),
    outputPath: outputIndex >= 0 ? args[outputIndex + 1] : null,
    resetExisting: args.includes('--reset-existing'),
  }
}

function generatePassword() {
  return crypto.randomBytes(24).toString('base64url')
}

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 25000, 512, 'sha256').toString('hex')
  return { hash, salt }
}

function getOutputPath(outputPath) {
  if (outputPath) return path.resolve(outputPath)
  return path.join(os.homedir(), `txdxnet-admin-credentials-${Date.now()}.json`)
}

async function main() {
  const { dryRun, outputPath, resetExisting } = parseArgs()

  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL no está configurada.')
  if (outputPath === '') throw new Error('Debes indicar una ruta válida después de --output.')

  const credentialsPath = getOutputPath(outputPath)
  if (fs.existsSync(credentialsPath)) {
    throw new Error(`El archivo de credenciales ya existe: ${credentialsPath}. Usa otra ruta.`)
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  const generatedCredentials = []
  let credentialsWritten = false

  try {
    await client.query('BEGIN')
    const existing = new Map()

    for (const admin of admins) {
      const result = await client.query(
        'SELECT id, email, name FROM cms.admins WHERE lower(email) = lower($1) LIMIT 1',
        [admin.email],
      )
      if (result.rows[0]) existing.set(admin.email, result.rows[0])
    }

    const existingEmails = admins.filter((admin) => existing.has(admin.email)).map((admin) => admin.email)
    if (existingEmails.length && !resetExisting) {
      throw new Error(
        `Ya existen cuentas autorizadas (${existingEmails.join(', ')}). Reejecuta con --reset-existing para generar contraseñas temporales nuevas.`,
      )
    }

    for (const admin of admins) {
      const current = existing.get(admin.email)
      const password = generatePassword()
      const passwordHash = hashPassword(password)

      if (current) {
        await client.query(
          `UPDATE cms.admins
           SET role = $1, is_active = true, must_change_password = true,
               salt = $2, hash = $3, login_attempts = 0, lock_until = NULL,
               reset_password_token = NULL, reset_password_expiration = NULL, updated_at = now()
           WHERE id = $4`,
          [admin.role, passwordHash.salt, passwordHash.hash, current.id],
        )
      } else {
        await client.query(
          `INSERT INTO cms.admins
             (name, email, role, is_active, must_change_password, salt, hash, login_attempts, created_at, updated_at)
           VALUES ($1, $2, $3, true, true, $4, $5, 0, now(), now())`,
          [admin.name, admin.email, admin.role, passwordHash.salt, passwordHash.hash],
        )
      }

      generatedCredentials.push({
        email: admin.email,
        role: admin.role,
        temporaryPassword: password,
      })
    }

    if (dryRun) {
      await client.query('ROLLBACK')
      console.log(`Dry run: ${admins.length} cuentas preparadas. No se modificó la base de datos.`)
      return
    }

    await client.query('COMMIT')
    fs.writeFileSync(
      credentialsPath,
      `${JSON.stringify({ generatedAt: new Date().toISOString(), accounts: generatedCredentials }, null, 2)}\n`,
      { encoding: 'utf8', mode: 0o600, flag: 'wx' },
    )
    credentialsWritten = true
    console.log(`Cuentas preparadas: ${admins.length}. Credenciales temporales escritas en ${credentialsPath}`)
    console.log('Entrega ese archivo por un canal seguro y elimínalo después de confirmar los cambios de contraseña.')
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // The connection may already be closed after a failed commit.
    }
    if (!credentialsWritten && fs.existsSync(credentialsPath)) fs.rmSync(credentialsPath, { force: true })
    throw error
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
