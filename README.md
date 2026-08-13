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

La web pública vive en `/` y el panel editorial en `/admin`.
