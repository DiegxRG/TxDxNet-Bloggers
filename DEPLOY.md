# Deploy de TxDxNet

## Archivo

`txdxnet-deploy.zip` (41.8 MB) — build standalone de Next.js 16.3 + Payload CMS 3.88.

## Requisitos del server

- Node.js 24.x
- PostgreSQL (Supabase)
- S3 Storage (Supabase)

## Pasos

### 1. Subir el archivo al server

```bash
scp txdxnet-deploy.zip usuario@server:/ruta/app/
```

### 2. Conectar al server y descomprimir

```bash
ssh usuario@server
cd /ruta/app
unzip txdxnet-deploy.zip
```

### 3. Crear `.env.production`

```bash
nano .env.production
```

Variables necesarias:

```
NEXT_PUBLIC_SITE_URL=https://txdxnet.com
DATABASE_URL=postgresql://...
PAYLOAD_SECRET=...
PAYLOAD_DB_PUSH=false
DATABASE_POOL_MAX=5
S3_BUCKET=media
S3_ENDPOINT=https://xxx.supabase.co/storage/v1/s3
S3_REGION=ca-central-1
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
RUN_MIGRATIONS=true
```

### 4. Ejecutar migraciones (primera vez)

```bash
export PAYLOAD_CONFIG_PATH=src/payload.config.ts
npx payload migrate
```

Después de la primera vez, poner `RUN_MIGRATIONS=false` en `.env.production`.

### 5. Iniciar el servidor

```bash
export NODE_ENV=production
export NODE_OPTIONS="--no-deprecation"
export PORT=3000
export HOSTNAME=0.0.0.0
node server.js
```

### 6. Verificar

```bash
curl -I http://localhost:3000
# Debe responder 200

curl -I http://localhost:3000/panel
# Debe responder 302 (redirect a login)
```

## Actualizaciones

Para actualizar:
1. Generar un nuevo `txdxnet-deploy.zip` con `npm run build`
2. Subir y descomprimir sobre la versión anterior
3. Reiniciar `node server.js`

## Troubleshooting

- **"Server Action not found"**: El build está desactualizado. Regenerar el zip.
- **502 Bad Gateway**: El servidor Node.js no está corriendo. Verificar `node server.js`.
- **404 en rutas**: Faltan archivos estáticos. Verificar que `.next/static` y `public` estén presentes.
