# Rendimiento — TxDxNet

> Registro completo de la jornada de optimización de rendimiento del 20 de agosto de 2026.
> Stack: Next.js 16.3.0 + Payload CMS 3.88 + Supabase (PostgreSQL + S3)

---

## 1. Problema original

El sistema presentaba tres frentes de lentitud:

| Síntoma | Impacto |
|---|---|
| **Navegación del panel lenta** | Al navegar entre secciones del panel (`/panel/articulos`, `/panel/biblioteca`, etc.) la página quedaba en blanco sin indicación visual. Cada navegación causaba un flash de contenido vacío mientras el servidor resolvía las queries de Payload. |
| **Imágenes lentas** | Las imágenes en los artículos cargaban sin optimización (prop `unoptimized` activo), sin cache de server-side, y sin tamaños responsivos adecuados. |
| **Payload Admin lento** | El bundle de `/admin` (Payload CMS Admin) era pesado (~1MB+ de `@payloadcms/richtext-lexical`). Este bundle esResponsabilidad del equipo de Payload y no puede optimizarse externamente. |

### Objetivos

1. Hacer que la navegación del panel se sienta instantánea (loading states + cache).
2. Optimizar la carga de imágenes en el sitio público (cache TTL + `fill`/`sizes` + server-side cache).
3. Medir y documentar el estado del bundle de Payload Admin para futuras optimizaciones.

---

## 2. Plan propuesto (5 fases)

### Fase 1 — Loading states + imagen + PPR
- Crear `loading.tsx` (skeletons) para todas las rutas dinámicas del sitio y del panel.
- Habilitar `cacheComponents: true` en `next.config.ts` para Partial Prerendering (PPR).
- Eliminar `unoptimized` de las imágenes del contenido de artículos.
- Configurar `minimumCacheTTL` de 30 días para el cache de imágenes de Next.js.

### Fase 2 — Cache server-side + queries optimizadas
- Aplicar `'use cache'` + `cacheLife('hours')` + `cacheTag()` a las 4 funciones de consulta de posts públicos.
- Agregar invalidación de cache con `revalidateTag` y `revalidatePath` en las server actions del panel.
- Optimizar queries del panel con `select` (campos específicos) y `depth: 0` para reducir transferencia de datos.

### Fase 3 — Lazy-load del editor + bundle analyzer
- Convertir `PanelLexicalEditor` a carga dinámica con `next/dynamic` + `ssr: false`.
- Instalar y configurar `@next/bundle-analyzer` para medir el tamaño real de los bundles.

### Fase 4 — Índices de base de datos
- Crear migración con 6 índices compuestos/parciales en las tablas `cms.posts` y `cms.media`.

### Fase 5 — Medición y ajuste fino
- Ejecutar `ANALYZE=true npm run build` para obtener métricas reales de bundle.
- Verificar rendimiento en producción.

---

## 3. Lo que se hizo (detallado)

### 3.1 Skeletons de carga (Fase 1)

Se crearon archivos `loading.tsx` para **10 rutas** — cada uno renderiza un skeleton con `animate-pulse` que refleja la forma del contenido real de esa página:

| Archivo | Ruta | Notas |
|---|---|---|
| `src/app/(website)/loading.tsx` | `/` (home) | Skeleton de hero + grid 3 columnas |
| `src/app/(website)/articulos/[slug]/loading.tsx` | `/articulos/:slug` | Skeleton de artículo largo |
| `src/app/(website)/articulos/preview/[id]/loading.tsx` | `/articulos/preview/:id` | Skeleton de preview privado |
| `src/app/(panel)/loading.tsx` | `/panel` (layout) | Skeleton general del panel |
| `src/app/(panel)/panel/articulos/loading.tsx` | `/panel/articulos` | Skeleton de lista de artículos |
| `src/app/(panel)/panel/articulos/nuevo/loading.tsx` | `/panel/articulos/nuevo` | Skeleton del editor nuevo |
| `src/app/(panel)/panel/articulos/[id]/loading.tsx` | `/panel/articulos/:id` | Skeleton del editor existente |
| `src/app/(panel)/panel/biblioteca/loading.tsx` | `/panel/biblioteca` | Skeleton de grilla de medios |
| `src/app/(panel)/panel/biblioteca/[id]/loading.tsx` | `/panel/biblioteca/:id` | Skeleton de detalle de medio |
| `src/app/(panel)/panel/perfil/loading.tsx` | `/panel/perfil` | Skeleton del perfil |

**Problema encontrado y resuelto:** Los archivos `loading.tsx` de artículos usaban `Math.random()` para generar anchos de línea pseudo-aleatorios. ESLint los rechazó con la regla `react-hooks/purity` (valores inestables en server components). Se resolvió reemplazando con arreglos estáticos de anchos fijos.

### 3.2 Configuración de Next.js (Fase 1)

**`next.config.ts`** — Cambios realizados:

```ts
// ANTES
const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: { /* ... */ },
  // ...
}

// DESPUÉS
const nextConfig: NextConfig = {
  cacheComponents: true,  // ← Habilita PPR + 'use cache'
  poweredByHeader: false,
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30,  // ← 30 días de cache para imágenes
    localPatterns: [ /* ... */ ],
    remotePatterns: [ /* ... */ ],
  },
  // ...
}
```

También se instaló y configuró `@next/bundle-analyzer`:

```ts
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})
// Se envuelve la config final:
export default withBundleAnalyzer(withPayload(nextConfig, { devBundleServerPackages: false }))
```

### 3.3 Optimización de imágenes (Fase 1)

**`src/components/articles/article-rich-text-converters.tsx`** — Se eliminó el prop `unoptimized` de todas las imágenes del contenido de artículos. Las imágenes ahora pasan por el pipeline de optimización de Next.js con `fill` + `sizes="..."`.

**NO se quitó** `unoptimized` del editor lexical del panel ni del campo de avatar, porque esos renderizan blob URLs o URLs locales que Next.js Image Optimization no puede procesar.

### 3.4 Cache server-side con `use cache` (Fase 2)

**`src/modules/content/infrastructure/payload/posts.ts`** — Las 4 funciones de consulta se reescribieron:

```ts
// ANTES
export async function getPublishedPosts(limit = 12): Promise<Post[]> {
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'posts', depth: 2, ... })
  return result.docs
}

// DESPUÉS
export async function getPublishedPosts(limit = 12): Promise<Post[]> {
  'use cache'
  cacheLife('hours')
  cacheTag('posts-list')
  const payload = await getPayload({ config })
  const result = await payload.find({ collection: 'posts', depth: 2, ... })
  return result.docs
}
```

| Función | Tag de cache |
|---|---|
| `getPublishedPosts` | `posts-list` |
| `getFeaturedPublishedPosts` | `posts-featured` |
| `getPublishedPostBySlug` | `post-detail` |
| `getRelatedPosts` | `posts-related` |

**Nota:** Se removió el `select` de estas funciones para evitar errores de tipo `Partial<Post>` en los consumidores. El beneficio principal de performance viene de `use cache` + `depth`, no de la selección de columnas.

### 3.5 Invalidación de cache (Fase 2)

**`src/app/(panel)/panel/articulos/actions.ts`** — Se agregó invalidación granular en las server actions:

```ts
function revalidatePublicArticle(slug: string) {
  revalidateTag('posts-list', 'hours')
  revalidateTag('posts-featured', 'hours')
  revalidateTag('post-detail', 'hours')
  revalidateTag('posts-related', 'hours')
  revalidatePath('/')
  revalidatePath('/articulos')
  revalidatePath(`/articulos/${slug}`)
  revalidatePath('/sitemap.xml')
}
```

Se llama `revalidatePublicArticle` después de:
- **Crear** un artículo publicado
- **Actualizar** un artículo (slug, estado, contenido)
- **Eliminar** un artículo

**Nota sobre `revalidateTag(tag, 'hours')`:** El segundo argumento `'hours'` es un perfil de `CacheLife` válido en Next.js 16. El tipo `CacheLifeProfiles` incluye `'default' | 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'max'`. Esto indica a Next.js la duración de revalidación al invalidar por tag.

### 3.6 Optimización de queries del panel (Fase 2)

Cada página del panel se optimizó con `select` (campos específicos) y `depth: 0`:

**`src/app/(panel)/panel/page.tsx`** (Dashboard):
- Queries de conteo: `limit: 1` + `pagination: true` (solo usa `totalDocs`)
- Listings: `select: ['title', 'slug', 'updatedAt']` + `depth: 0`
- Todas las queries ejecutadas en `Promise.all` (paralelo)

**`src/app/(panel)/panel/articulos/page.tsx`** (Lista de artículos):
- `select: ['title', 'slug', '_status', 'updatedAt', 'publishedAt', 'featured', 'coverImage']`
- `depth: 0`

**`src/app/(panel)/panel/biblioteca/page.tsx`** (Biblioteca de medios):
- `select: ['id', 'filename', 'alt', 'url', 'filesize', 'mimeType', 'width', 'height', 'updatedAt', 'sizes']`
- `depth: 0`
- Incluye `startPanelMeasure()` para logging de rendimiento

**`src/app/(panel)/panel/perfil/page.tsx`** (Perfil):
- Queries de conteo optimizadas

**`src/app/(panel)/panel/articulos/[id]/page.tsx`** y **`nuevo/page.tsx`** (Editor):
- `select: { id, filename, alt, sizes }` en queries de medios

### 3.7 Lazy-load del editor Lexical (Fase 3)

**`src/components/panel/PanelPostEditor.tsx`** — El componente `PanelLexicalEditor` se convirtió a carga dinámica:

```ts
// ANTES
import { PanelLexicalEditor } from '@/components/panel/PanelLexicalEditor'

// DESPUÉS
import dynamic from 'next/dynamic'
const PanelLexicalEditor = dynamic(
  () => import('@/components/panel/PanelLexicalEditor').then((m) => m.PanelLexicalEditor),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 rounded-md border border-ink-950/8 p-4 text-sm text-ink-950/60">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Cargando editor...
      </div>
    ),
  },
)
```

Esto separa el bundle pesado de Lexical del bundle inicial del panel.

### 3.8 Migración de índices de base de datos (Fase 4)

**`src/migrations/20260820_120000_add_performance_indexes.ts`** — Creó 6 índices en el esquema `cms`:

| Índice | Columnas | Propósito |
|---|---|---|
| `idx_posts_status_published` | `(_status, publishedAt DESC) WHERE _status = 'published'` | Todas las queries de posts publicados |
| `idx_posts_cover_image` | `(coverImage)` | Lookup de imagen de portada |
| `idx_posts_author_avatar` | `(authorAvatar)` | Resolución de avatar del autor |
| `idx_posts_created_by` | `(createdBy)` | Queries de autoría |
| `idx_posts_featured_published` | `(featured, publishedAt DESC) WHERE _status = 'published' AND featured = true` | Posts destacados |
| `idx_media_purpose_mime` | `(purpose, mimeType)` | Filtrado de biblioteca por tipo |

Todos usan `CONCURRENTLY` para evitar bloqueos de tabla y `IF NOT EXISTS` para idempotencia.

### 3.9 Correcciones de compatibilidad con `cacheComponents`

Habilitar `cacheComponents: true` (PPR) causó una cascada de errores de build que se resolvieron uno por uno:

#### Error 1: Route segment config incompatible
```
cacheComponents is incompatible with dynamic, dynamicParams, and revalidate exports
```
**Causa:** Con PPR, las exportaciones `dynamic`, `dynamicParams` y `revalidate` de las páginas son incompatibles con `cacheComponents`.
**Solución:** Se eliminaron todas esas exportaciones de las páginas públicas. El cache ahora se maneja con `use cache` + `cacheLife` + tags.

Archivos modificados:
- `src/app/(website)/page.tsx` — eliminado `revalidate = 60`
- `src/app/(website)/articulos/page.tsx` — eliminado `revalidate = 60`
- `src/app/(website)/articulos/[slug]/page.tsx` — eliminado `revalidate = 60` y `dynamicParams = true`
- `src/app/(website)/dominios/page.tsx` — eliminado `revalidate = 3600`
- `src/app/(website)/servicios/page.tsx` — eliminado `revalidate = 3600`

Para rutas que **sí necesitan** rendering dinámico, se usó `instant = false` (la alternativa compatible con PPR):
- `src/app/(panel)/layout.tsx` — `export const instant = false`
- `src/app/(website)/articulos/preview/[id]/page.tsx` — `export const instant = false`

#### Error 2: `Date.now()` inestable en prerendering
```
Next.js encountered the unstable value `Date.now()` while prerendering
```
**Causa:** `src/modules/panel/server/perf.ts` usaba `Date.now()` para medir tiempo.
**Solución:** Se reemplazó por `performance.now()` (sugerido por Next.js).

#### Error 3: `new Date()` inestable en prerendering
```
Next.js encountered the unstable value `new Date()` while prerendering
```
**Causa:** `src/components/site/SiteFooter.tsx` usaba `new Date().getFullYear()` para el copyright.
**Solución:** Se hardcodeó `'© 2026 TxDxSecure'`. Actualización manual cada año.

#### Error 4: `usePathname()` fuera de `<Suspense>`
```
Next.js encountered URL data usePathname() in a Client Component outside of <Suspense>
```
**Causa:** `src/components/site/SiteHeader.tsx` usa `usePathname()` (hook de cliente) directamente en el layout.
**Solución:** Se envolvió `<SiteHeader />` en `<Suspense>` dentro de `src/app/(website)/layout.tsx`.

#### Error 5: `"use cache"` requiere `cacheComponents`
Al intentar deshabilitar `cacheComponents` para evitar los errores anteriores, el build falló porque todas las funciones en `posts.ts` usan `'use cache'`, que requiere esa flag habilitada.

**Solución definitiva:** Mantener `cacheComponents: true` y resolver los problemas de prerendering (errores 1-4).

---

## 4. Estado final del build

```
npm run build → ✅ Exitoso (22 páginas generadas)

Route (app)                      Revalidate  Expire
┌ ○ /                                    1h      1d
├ ○ /_not-found
├   /admin/[[...segments]]
│ └ ◐ /admin/[[...segments]]
├ ƒ /api/[...slug]
├ ƒ /api/graphql
├ ƒ /api/graphql-playground
├ ƒ /api/panel/markdown-preview
├ ƒ /api/panel/media/[id]
├ ○ /articulos                           1h      1d
├   /articulos/[slug]
│ └ ◐ /articulos/[slug]
├   /articulos/preview/[id]
│ └ ◐ /articulos/preview/[id]
├ ○ /dominios
├ ○ /icon.svg
├ ƒ /panel
├ ƒ /panel/articulos
├   /panel/articulos/[id]
│ └ ◐ /panel/articulos/[id]
├ ƒ /panel/articulos/nuevo
├ ƒ /panel/biblioteca
├   /panel/biblioteca/[id]
│ └ ◐ /panel/biblioteca/[id]
├ ƒ /panel/perfil
├ ○ /robots.txt
├ ○ /servicios
└ ○ /sitemap.xml                         1h      1d
```

| Tipo | Significado |
|---|---|
| `○` (Static) | Pre-renderizado como contenido estático |
| `◐` (Partial Prerender) | HTML estático + contenido dinámico streaming |
| `ƒ` (Dynamic) | Server-rendered on demand |

```
npm run typecheck → ✅ 0 errores
npm run lint      → ✅ Solo warnings pre-existentes en archivos .cjs y ThemeAndLayoutWrapper.tsx
```

---

## 5. Pendientes

### CRÍTICO — Migración de índices NO aplicada

El archivo `src/migrations/20260820_120000_add_performance_indexes.ts` existe localmente pero:

1. **No está registrado** en `src/migrations/index.ts` (Payload no lo conoce).
2. **No está aplicado** en Supabase (la lista de migraciones de la BD está vacía).

**Acción necesaria:**
```bash
# 1. Registrar la migración en src/migrations/index.ts
# 2. Ejecutar:
npx payload migrate
```

O ejecutar el SQL directamente en Supabase Dashboard > SQL Editor.

### MEDIO — Bundle analyzer nunca ejecutado

`@next/bundle-analyzer` está instalado y configurado pero nunca se ejecutó:
```bash
ANALYZE=true npm run build
```
Esto generará reportes de tamaño de bundle en `.next/analyze/`. Permite identificar qué paquetes pesan más (se espera que `@payloadcms/richtext-lexical` sea el mayor contributor).

### MEDIO — Panel layout sin Suspense en children

`src/app/(panel)/layout.tsx` ejecuta `getPanelSession()` + `payload.findByID()` secuencialmente antes de renderizar el shell. Envolver `{children}` en `<Suspense>` permitiría que el shell se renderice mientras se resuelven los datos del usuario.

### BAJO — Year hardcoded en footer

`src/components/site/SiteFooter.tsx` tiene `'© 2026 TxDxSecure'` hardcodeado. Requiere actualización manual cada año. Alternativa: crear un componente client que use `new Date()` internamente.

### BAJO — `revalidatePath` posiblemente redundante

La función `revalidatePublicArticle` llama tanto `revalidateTag()` como `revalidatePath()` para las mismas rutas. Con la invalidación por tags funcionando correctamente, las llamadas a `revalidatePath` podrían ser redundantes (marcan la página como stale, pero el tag ya lo hace). Requiere verificación en producción.

### DESCONOCIDO — Payload Admin bundle

No se ha medido el tamaño real del bundle de `/admin`. El equipo de PayloadCMS controla este bundle. Las custom views (`PublicationHub`, `MyArticles`) contribuyen al tamaño. Sin el bundle analyzer, no hay datos concretos.

---

## 6. Archivos modificados (resumen)

| Archivo | Cambio principal |
|---|---|
| `next.config.ts` | `cacheComponents: true`, `minimumCacheTTL`, `bundleAnalyzer` |
| `src/modules/content/infrastructure/payload/posts.ts` | `use cache` + `cacheLife('hours')` + `cacheTag()` en 4 funciones |
| `src/modules/panel/server/perf.ts` | `Date.now()` → `performance.now()` |
| `src/app/(panel)/panel/articulos/actions.ts` | `revalidateTag` + `revalidatePath` en CRUD |
| `src/components/panel/PanelPostEditor.tsx` | `next/dynamic` para PanelLexicalEditor |
| `src/components/articles/article-rich-text-converters.tsx` | Eliminado `unoptimized` de imágenes |
| `src/components/site/SiteFooter.tsx` | `new Date().getFullYear()` → `2026` |
| `src/app/(website)/layout.tsx` | `<Suspense>` en SiteHeader |
| `src/app/(panel)/layout.tsx` | `export const instant = false` |
| `src/app/(website)/articulos/preview/[id]/page.tsx` | `export const instant = false` |
| `src/app/(website)/page.tsx` | Eliminado `revalidate = 60` |
| `src/app/(website)/articulos/page.tsx` | Eliminado `revalidate = 60` |
| `src/app/(website)/articulos/[slug]/page.tsx` | Eliminado `revalidate` y `dynamicParams` |
| `src/app/(website)/dominios/page.tsx` | Eliminado `revalidate = 3600` |
| `src/app/(website)/servicios/page.tsx` | Eliminado `revalidate = 3600` |
| `src/app/(panel)/panel/page.tsx` | `Promise.all` + `select` + `depth: 0` |
| `src/app/(panel)/panel/articulos/page.tsx` | `select` + `depth: 0` |
| `src/app/(panel)/panel/biblioteca/page.tsx` | `select` + `depth: 0` + `startPanelMeasure` |
| `src/app/(panel)/panel/articulos/[id]/page.tsx` | `select` en queries de medios |
| `src/app/(panel)/panel/articulos/nuevo/page.tsx` | `select` en queries de medios |
| `src/app/(panel)/panel/perfil/page.tsx` | Queries de conteo optimizadas |
| `src/migrations/20260820_120000_add_performance_indexes.ts` | 6 índices de rendimiento |
| 10 archivos `loading.tsx` | Skeletons de carga para todas las rutas |
