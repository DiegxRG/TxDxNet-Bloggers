import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config({ path: '.env.local' })
dotenv.config()

const profiles = [
  {
    title: 'Ingeniería en Ciberseguridad',
    bio: 'Perspectiva editorial sobre perímetro, riesgo y continuidad operativa.',
    domains: ['07', '08'],
  },
  {
    title: 'Ingeniería Electrónica',
    bio: 'Lectura de infraestructura, dispositivos y señales que conectan el mundo físico con la operación digital.',
    domains: ['06', '09', '10'],
  },
  {
    title: 'Data Science',
    bio: 'Contexto para datos, modelos y decisiones automatizadas con trazabilidad.',
    domains: ['05', '11'],
  },
  {
    title: 'Dirección editorial',
    bio: 'Articulación editorial de las superficies XOC para convertir experiencia en criterio operativo.',
    domains: ['01', '03', '11'],
  },
]

function usage() {
  console.error('Uso: npm run seed:team -- <email-ciberseguridad> <email-electronica> <email-data-science> <email-perfil-editorial> [--dry-run]')
}

async function main() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const emails = args.filter((argument) => argument !== '--dry-run')

  if (emails.length !== profiles.length) {
    usage()
    process.exitCode = 1
    return
  }

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada.')
  }

  const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
  await client.connect()

  try {
    await client.query('BEGIN')
    const matches = []

    for (const [index, email] of emails.entries()) {
      const result = await client.query(
        'SELECT id, name, email FROM cms.admins WHERE lower(email) = lower($1) LIMIT 1',
        [email],
      )
      if (!result.rows[0]) {
        throw new Error(`No existe un usuario editorial con el correo ${email}. No se modificó ningún perfil.`)
      }
      matches.push({ admin: result.rows[0], profile: profiles[index] })
    }

    const relationExists = await client.query(
      `SELECT to_regclass('cms.admins_expertise_domains') IS NOT NULL AS exists`,
    )
    if (!relationExists.rows[0].exists) {
      throw new Error('Falta cms.admins_expertise_domains. Ejecuta primero npm run payload -- migrate.')
    }

    for (const { admin, profile } of matches) {
      console.log(`${dryRun ? 'Preparado' : 'Actualizado'}: ${admin.name} -> ${profile.title}`)
      if (dryRun) continue

      await client.query(
        `UPDATE cms.admins
         SET public_title = $1, public_bio = $2, show_on_team = true, updated_at = now()
         WHERE id = $3`,
        [profile.title, profile.bio, admin.id],
      )
      await client.query('DELETE FROM cms.admins_expertise_domains WHERE parent_id = $1', [admin.id])
      for (const [order, value] of profile.domains.entries()) {
        await client.query(
          'INSERT INTO cms.admins_expertise_domains ("order", parent_id, value) VALUES ($1, $2, $3)',
          [order, admin.id, value],
        )
      }
    }

    await client.query(dryRun ? 'ROLLBACK' : 'COMMIT')
    if (!dryRun) console.log('Perfiles preparados. Las imágenes se conservan sin cambios.')
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
