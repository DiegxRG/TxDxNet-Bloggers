# TxDxNet

Plataforma editorial de TxDxSecure para publicar conocimiento técnico organizado por servicios y por los 11 dominios XOC.

## Stack

- Next.js 16
- Payload CMS 3
- Tailwind CSS 4
- PostgreSQL + Supabase Storage
- TypeScript

La arquitectura y decisiones del producto están documentadas en [`PLAN_ARQUITECTURA_TXDXSECURE.md`](./PLAN_ARQUITECTURA_TXDXSECURE.md).

## Desarrollo local

1. Instala dependencias con `npm install`.
2. Ejecuta `npm run setup:env` e ingresa de forma oculta la contraseña PostgreSQL de Supabase.
3. Genera tipos e import map con `npm run generate:types` y `npm run generate:importmap`.
4. Inicia con `npm run dev`.

El configurador genera `PAYLOAD_SECRET`, codifica correctamente la contraseña y crea
`.env.local` sin mostrar sus secretos. La contraseña se encuentra o se restablece en
**Supabase > Project Settings > Database** y no debe compartirse por chat ni guardarse
en Git.

La primera apertura de `/admin` crea el esquema privado `cms` en el proyecto de
desarrollo. Antes de producción se desactiva `PAYLOAD_DB_PUSH` y se usan migraciones
versionadas.

Si una base local existente fue creada con `PAYLOAD_DB_PUSH=true` y se va a cambiar
a migraciones, ejecuta una sola vez `npm run db:baseline` y después
`npm run payload -- migrate`, y deja `PAYLOAD_DB_PUSH=false` en `.env.local`. El baseline solo acepta el marcador `dev` de Payload
y valida las columnas históricas antes de registrar el historial.

Para preparar los cuatro perfiles editoriales sobre usuarios que ya existen en
Payload, usa `npm run seed:team -- <correo-ciberseguridad> <correo-electronica> <correo-data-science> <correo-editorial>`. Puedes probar primero con `--dry-run`.
El script conserva nombres, credenciales y avatares; solo establece cargo, biografía,
dominios XOC y visibilidad pública.

La web pública vive en `/` y el panel editorial en `/admin`.
