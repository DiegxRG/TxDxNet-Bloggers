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

### Acceso editorial

El acceso administrativo está limitado a la allowlist corporativa definida en
`src/access/index.ts`. Diego Ramos y Rolando Ricapa son `owner`; los otros siete
correos autorizados son `editor`. Los owners administran usuarios y auditoría; ambos
roles pueden crear, editar y publicar artículos.

Después de aplicar las migraciones, prepara las cuentas con:

```powershell
npm run seed:admins -- --reset-existing
```

El comando genera una contraseña temporal única por cuenta, exige cambiarla en el
primer acceso y escribe las credenciales en un archivo fuera del repositorio. No las
imprime en consola ni deben compartirse por chat. El panel de métricas está en
`/panel/metricas` y solo es visible para owners; usa datos agregados sin IP, correo ni
información personal.

La web pública vive en `/` y el panel editorial en `/admin`.

## Seguridad y verificación de los PDF

El endpoint público `/api/articulos/[slug]/pdf` resuelve las imágenes por su ID en
la colección `media`, respetando sus permisos de lectura. Las referencias
antiguas por nombre de archivo también requieren encontrar un registro de
`media`; ese nombre nunca se utiliza directamente como ruta de lectura. Las URLs
y prefijos incluidos en el JSON del artículo no se usan para descargar imágenes.
Esto conserva las referencias que guarda el editor actual: portada, uploads de
Lexical y bloques `mediaFeature`.

El lector utiliza el mismo endpoint, bucket y prefijo `editorial` configurados
para Payload mediante `S3_*`. Lee directamente con el SDK S3, sin seguir
redirecciones. En desarrollo sin S3, lee únicamente archivos del `staticDir` de
la colección, comprobando también su ruta real. No usa el origen ni las cabeceras
de la solicitud pública. No requiere variables nuevas ni migraciones.

Los límites están centralizados en
`src/modules/content/infrastructure/pdf/pdf-resources.ts`: 20 MiB por imagen,
100 MiB de imágenes leídas por documento, 40 megapíxeles por imagen de entrada,
64 imágenes, 200 páginas, 32 MiB de salida y dos generaciones simultáneas por
proceso. Las imágenes se validan y normalizan a un máximo de 2400 píxeles por
lado; su presupuesto acumulado es de 80 megapíxeles normalizados. El plazo de
generación es de 45 segundos, con 15 segundos por lectura y hasta 5 segundos
para terminar una operación nativa de conversión en curso. La concurrencia es
por proceso; varias réplicas requieren además límites en el proxy si se necesita
un límite global.

Una imagen inexistente o inválida se omite como antes, y el PDF resultante usa
`Cache-Control: no-store`. Superar un límite de recursos devuelve `422`, agotar
el plazo devuelve `504` y superar la concurrencia devuelve `503` con
`Retry-After`. La lectura se cancela al superar el límite real de bytes, incluso
sin `Content-Length` o si el tamaño declarado es incorrecto.

Ejecuta la regresión aislada, sin acceso a base de datos ni servicios productivos:

```powershell
npm run test:pdf-security
npm run lint
npm run typecheck
npm run build
```

Antes de desplegar una nueva imagen Docker, verificar en staging la publicación
y edición de artículos con una cuenta `editor`, la carga de imágenes y la
descarga de PDF con portadas y ambos tipos de imágenes del contenido. Incluir
artículos existentes para detectar referencias antiguas sin ID ni nombre de
archivo registrado en `media`, además de pruebas de imágenes faltantes, grandes y referencias
manipuladas desde la API. Nunca se descarga desde una URL arbitraria.
El despliegue no debe sobrescribir cambios locales de `docker-compose.yml`.
