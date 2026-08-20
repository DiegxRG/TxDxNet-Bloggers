# Rendimiento — TxDxNet

> Registro de optimización de rendimiento de TxDxNet.
> Stack: Next.js 16.3.0 + React 19 + Payload CMS 3.88 + Supabase PostgreSQL/S3.
> Última actualización: 20 de agosto de 2026.

## Trabajo prioritario: recuperar animaciones visuales

La mejora de rendimiento de datos y navegación debe permanecer separada de las animaciones del cliente.
Las consultas, cache, skeletons, imágenes y navegación rápida no necesitan eliminar las transiciones
editoriales que forman parte de la experiencia de TxDxNet.

Estado: animaciones principales restauradas en código; falta validación visual en navegador.

Se recuperó o está en proceso de validación:

- Entrada por caracteres del texto del home.
- Apertura lenta y fluida del libro principal.
- Entrada escalonada y 3D de los tres volúmenes.
- Caída del header del home.
- Aparición de `Dominios XOC`, `Equipo editorial`, `Análisis y guías` y `Entrar a la biblioteca`.
- Reveal progresivo de todas las `BlogCard` al entrar al viewport.
- Reveal progresivo y tipado de las cuatro superficies XOC destacadas: `06`, `07`, `10` y `11`.
- Página Equipo con perfiles públicos controlados desde `/panel/perfil`.
- Tiempos tipográficos de artículos, dominios, servicios y previews.
- Transiciones hover/focus que ya conservaban las tarjetas y componentes cliente del panel.

Estas animaciones funcionan como mejora progresiva:

- El HTML permanece visible si no se ejecuta JavaScript.
- GSAP e `IntersectionObserver` solo preparan y animan elementos cuando el cliente está disponible.
- `prefers-reduced-motion` evita ocultar contenido y desactiva la animación.
- La carga de datos continúa ocurriendo en el servidor y no espera a que termine una transición.

Pendiente inmediato:

- Validar el home en carga fría y caliente, desktop y móvil.
- Confirmar que la secuencia completa se perciba lenta, tranquila y fluida.
- Confirmar que ninguna tarjeta quede invisible si falla la hidratación o el observer.
- Validar el menú móvil, las transiciones del panel y el preview del artículo.
- Medir que la restauración visual no cambie TTFB, consultas, LCP ni el tiempo de autenticación.

## Estado actual

La optimización está implementada en código, pero todavía falta validar el comportamiento real con
Supabase, navegador y producción. El trabajo no debe considerarse cerrado hasta completar la sección
de validación pendiente.

| Área | Estado | Nota |
|---|---|---|
| Skeletons de navegación | Implementado | 10 rutas tienen `loading.tsx`. |
| Cache público | Implementado | `unstable_cache`, tags y una hora de revalidación. |
| Consultas públicas | Parcialmente optimizado | `select` y menor `depth`; el contenido Lexical todavía se carga para calcular lectura. |
| Imágenes públicas | Implementado en código | URLs internas normalizadas y `next/image` activo. Falta validar producción. |
| Navegación del panel | Parcialmente optimizada | Consultas del editor paralelizadas; autenticación todavía depende de Supabase. |
| Animaciones del home | Restauradas en código | GSAP conserva la entrada editorial; falta revisión visual en navegador. |
| Entradas de tarjetas | Restauradas en código | `IntersectionObserver`, stagger y fallback visible. |
| Panel de dominios XOC | Rediseñado | Cuatro cards compactas alternadas con imagen, contexto y entrada por scroll. |
| Página Equipo | Implementada en código | Perfiles públicos sin email ni credenciales; datos gestionados desde el panel. |
| Tipografía editorial | Restaurada en código | Tiempos largos recuperados para títulos y copias. |
| Transiciones del panel | Conservadas | No se eliminaron las transiciones internas de los componentes cliente. |
| Desarrollo local | Mejorado | `npm run dev` usa Turbopack; webpack queda en `dev:webpack`. |
| Bundle analyzer | Configurado | Todavía no se ha ejecutado. |
| Índices PostgreSQL | Aplicados en entorno configurado | Migración corregida, registrada y verificada con `migrate:status`. |
| Core Web Vitals | Pendiente | No existe medición RUM, Lighthouse ni prueba automatizada. |

## 1. Problemas detectados

### Panel

Los logs originales mostraron dos tipos de demora:

| Ruta o recurso | Tiempo observado | Interpretación |
|---|---:|---|
| `/panel/articulos/[id]` | 76 s | 63 s de compilación webpack y aproximadamente 5 s de aplicación. |
| `/panel/articulos` | 21 s | 16.6 s de compilación y 4.6 s de aplicación. |
| `/api/media/file/...` inicial | 70 s | 68 s de compilación inicial de la ruta. |
| `/panel` | 65 s | `payload.auth` llegó a consumir 61 s; es latencia real de autenticación o base de datos. |

La compilación inicial era propia del modo `next dev --webpack`. La latencia de `payload.auth` no se
resuelve únicamente con React o Suspense y debe validarse contra el pooler de Supabase.

### Imágenes internas de artículos

Next.js rechazaba algunas URLs como:

```text
http://localhost:3000/api/media/file/prompt11i.png
```

El endpoint podía devolver `200`, pero `next/image` bloqueaba la URL porque `localhost` resolvía a una
IP privada. El problema era de resolución de URL, no de pérdida de datos.

### Público

La portada y algunos titulares empezaban ocultos y dependían de JavaScript/GSAP para hacerse visibles.
Esto podía retrasar el LCP y dejar contenido invisible si fallaba la hidratación. Los estados iniciales
de GSAP se restauraron manteniendo el contenido visible como fallback sin JavaScript.

## 2. Cambios implementados

### 2.1 Next.js y desarrollo

`next.config.ts` incluye actualmente:

- `cacheComponents: true`.
- `partialPrefetching: true`.
- `minimumCacheTTL` de 30 días para imágenes optimizadas.
- `poweredByHeader: false`.
- `@next/bundle-analyzer` habilitado mediante `ANALYZE=true`.
- Patrones locales y remotos de imágenes.
- `instantInsights` en modo `manual-warning` para rutas dinámicas respaldadas por Payload.

`package.json` incluye:

```text
npm run dev          -> Next.js con Turbopack
npm run dev:turbopack -> Next.js con Turbopack
npm run dev:webpack   -> Next.js con webpack para diagnóstico
```

Turbopack se usa por defecto porque la compilación inicial con webpack era el mayor componente de las
demoras de desarrollo.

### 2.2 Loading states

Se crearon skeletons para estas 10 rutas:

| Archivo | Ruta |
|---|---|
| `src/app/(website)/loading.tsx` | `/` |
| `src/app/(website)/articulos/[slug]/loading.tsx` | `/articulos/:slug` |
| `src/app/(website)/articulos/preview/[id]/loading.tsx` | Preview privada |
| `src/app/(panel)/loading.tsx` | Layout del panel |
| `src/app/(panel)/panel/articulos/loading.tsx` | Lista de artículos |
| `src/app/(panel)/panel/articulos/nuevo/loading.tsx` | Nuevo artículo |
| `src/app/(panel)/panel/articulos/[id]/loading.tsx` | Editor existente |
| `src/app/(panel)/panel/biblioteca/loading.tsx` | Biblioteca |
| `src/app/(panel)/panel/biblioteca/[id]/loading.tsx` | Detalle de media |
| `src/app/(panel)/panel/perfil/loading.tsx` | Perfil |

Los anchos de skeleton son estáticos. Se eliminó `Math.random()` de `PanelPostEditor.tsx` para evitar
valores inestables durante prerendering.

### 2.3 Imágenes y media

En `src/modules/content/domain/media-url.ts` se centralizó la normalización de URLs de media.
Las URLs absolutas de `/api/media/file/...` se convierten en rutas relativas antes de llegar a
`next/image`.

En `src/components/articles/article-rich-text-converters.tsx`:

- Se mantiene `next/image` para imágenes del contenido.
- Se normalizan `url` y `thumbnailURL` provenientes de nodos Lexical históricos.
- Se usa el nombre de archivo como fallback cuando el nodo no contiene URL.
- No se habilitó `images.dangerouslyAllowLocalIP`.

En imágenes públicas se mantienen `fill`, `sizes` y optimización de Next.js. El uso de `unoptimized`
se conserva únicamente en contextos que lo necesitan, como blob URLs del editor.

### 2.4 Experiencia pública

Se eliminó la dependencia de JavaScript para mostrar el contenido principal:

- El hero público es visible por defecto.
- El header público es visible por defecto.
- Las tarjetas de artículos son visibles aunque no se ejecute JavaScript.
- Las tarjetas de artículos y las filas de dominios se preparan en el cliente solo para su reveal visual.
- El contenido y las imágenes siguen llegando en el HTML server-rendered.
- El botón de más publicaciones usa `<details>` nativo, no estado React.
- Las animaciones de titulares conservan tiempos editoriales lentos y controlados.
- GSAP e `IntersectionObserver` quedan como mejora progresiva y no como requisito para leer la página.

También se añadió un menú móvil accesible en `SiteHeader.tsx`:

- `aria-expanded`.
- `aria-controls`.
- Cierre con Escape.
- Enlaces directos a artículos, dominios y equipo.

### 2.5 Cache y consultas públicas

`src/modules/content/infrastructure/payload/posts.ts` usa `unstable_cache` con revalidación de una hora:

| Función | Tag |
|---|---|
| `getPublishedPosts` | `posts-list` |
| `getFeaturedPublishedPosts` | `posts-featured` |
| `getPublishedPostBySlug` | `post-detail` |
| `getRelatedPosts` | `posts-related` |
| `getPublishedPostPaths` | `posts-sitemap` |

Cambios aplicados:

- Listas públicas: `depth: 1` y `select` explícito.
- Detalle público: `depth: 1` y campos necesarios para SEO, contenido y media.
- Sitemap: `depth: 0` y solo `slug`, `updatedAt`, `featured` y `noindex`.
- Portada: solicita 3 artículos recientes en lugar de 12.
- `getRelatedPosts` recibe el ID del artículo para evitar claves de cache basadas en objetos completos.

Las server actions invalidan también `posts-sitemap` después de publicar, actualizar o eliminar.

### 2.6 Panel

Se mantuvo la carga dinámica de Lexical:

```tsx
const PanelLexicalEditor = dynamic(
  () => import('./PanelLexicalEditor').then((module) => module.PanelLexicalEditor),
  { ssr: false },
)
```

Se optimizaron consultas con `select`, menor `depth` y `Promise.all`.

En particular, `src/app/(panel)/panel/articulos/[id]/page.tsx` ahora carga en paralelo:

- Perfil editorial.
- Artículo.
- Biblioteca multimedia reciente.

`src/app/(panel)/panel/articulos/nuevo/page.tsx` también carga perfil y media en paralelo.

El layout del panel solicita únicamente el avatar del perfil para reducir la carga inicial.

### 2.7 Animaciones visuales restauradas

Se restauraron las secuencias visuales sin revertir las optimizaciones de datos:

- `EditorialLibraryStage.tsx` vuelve a preparar letras, libro, páginas, volúmenes, header y footer antes de reproducir la timeline.
- Se recuperaron las duraciones editoriales largas: páginas de `0.95s`, volúmenes de `1.05s`, header de `0.75s` y copy inferior de `0.55s`.
- `BlogCard` recuperó su reveal por viewport, stagger de `90ms` y fallback visible sin JavaScript.
- `DomainFeature` aplica reveal por viewport a imágenes y contexto con stagger de `90ms`.
- Se recuperaron los tiempos tipográficos de `InteriorHero`, dominios y artículos.
- `prefers-reduced-motion` muestra el contenido estático y evita iniciar observers o GSAP.
- Las transiciones hover/focus existentes del panel no se modificaron.

El observer solo agrega las clases de preparación durante `useLayoutEffect`. Por eso el HTML SSR es
visible si no hay hidratación, pero los usuarios con JavaScript reciben la entrada visual original.

### 2.8 Panel de dominios XOC

La sección de dominios dejó de mostrar las 11 tarjetas en una cuadrícula uniforme. Ahora presenta cuatro
superficies destacadas, en este orden:

| Posición | Dominio | Composición |
|---|---|---|
| 1 | `06 · Infraestructura de Red` | Imagen a la izquierda, contexto a la derecha. |
| 2 | `07 · Perímetro de Seguridad` | Contexto a la izquierda, imagen a la derecha. |
| 3 | `10 · Physical Security` | Imagen a la izquierda, contexto a la derecha. |
| 4 | `11 · Agentic / AI Models` | Contexto a la izquierda, imagen a la derecha. |

Cada card incluye una imagen editorial contenida, explicación de contexto, focos de lectura y enlace al dominio.
La imagen entra al viewport con escala, opacidad y scanline; el texto aparece sin recortar títulos.
El contenido permanece visible sin JavaScript y `prefers-reduced-motion` elimina el movimiento.

La métrica y el lenguaje del hero siguen indicando que XOC observa 11 dominios; el panel editorial
destaca cuatro para evitar una cuadrícula repetitiva.

### 2.9 Equipo editorial

Se reemplazó el panel público de Servicios por `/equipo`.

- La navegación principal y el footer apuntan a Equipo.
- `/servicios` redirige a `/equipo` para conservar enlaces antiguos.
- Los perfiles se originan en la colección privada `admins`.
- La consulta pública vive en `src/modules/content/infrastructure/payload/team.ts` y usa `overrideAccess`
  solo en servidor, con `select` explícito de nombre, cargo, biografía, avatar y dominios.
- Nunca se seleccionan email, password, hash, sesiones ni tokens.
- Cada administrador puede completar biografía, dominios XOC y visibilidad desde `/panel/perfil`.
- Equipo muestra los 11 dominios como mapa de especialidad y los dominios seleccionados en cada perfil.

### 2.10 Migración de índices

La migración está registrada en `src/migrations/index.ts` y fue corregida para el esquema físico real
de PostgreSQL.

La versión actual define tres índices, no seis:

| Índice | Definición | Propósito |
|---|---|---|
| `idx_posts_status_published` | `published_at DESC` parcial para `_status = 'published'` | Listados públicos publicados. |
| `idx_posts_featured_published` | `published_at DESC` parcial para publicados destacados | Portada destacada. |
| `idx_media_purpose_mime` | `(purpose, mime_type)` | Filtro de biblioteca multimedia. |

Se eliminaron de la propuesta los índices de portada, avatar y creador porque ya existen índices
equivalentes en la migración base.

La migración usa `CREATE INDEX` normal. No usa `CONCURRENTLY` porque Payload ejecuta las migraciones
dentro de una transacción y PostgreSQL no permite `CREATE INDEX CONCURRENTLY` dentro de ella.

## 3. Verificaciones realizadas

### Comandos

| Comando | Resultado |
|---|---|
| `npm run typecheck` | Correcto, 0 errores. |
| `npm run build` | Correcto. Next 16.3.0 con Turbopack; la migración de perfiles ya fue aplicada en el entorno local configurado. |
| `git diff --check` | Correcto; solo avisos de conversión LF/CRLF de Git. |
| `npm run lint` | Falla por errores preexistentes fuera de esta optimización. |

Último build exitoso:

- Compilación: aproximadamente 2.2 s en esta ejecución.
- TypeScript: aproximadamente 5.4 s en esta ejecución.
- Páginas estáticas generadas: 23.
- `cacheComponents`: habilitado.
- `partialPrefetching`: habilitado.

Los errores actuales de lint son:

- `delete-user.cjs:1-2`: imports `require` prohibidos.
- `fix-db.cjs:1-2`: imports `require` prohibidos.
- `src/components/payload/ThemeAndLayoutWrapper.tsx:14`: warning por `any`.

No son errores introducidos por esta optimización.

### Esquema de datos

Supabase confirmó 11 tablas en el esquema `cms`:

- `admins`.
- `admins_sessions`.
- `media`.
- `posts`.
- `_posts_v`.
- `payload_kv`.
- `payload_locked_documents`.
- `payload_locked_documents_rels`.
- `payload_migrations`.
- `payload_preferences`.
- `payload_preferences_rels`.

La migración `20260820_191101_add_team_profile_fields` ya creó `admins_expertise_domains`, `public_bio`
y `show_on_team` en el entorno local configurado. La consulta server-only de Equipo conserva un fallback
vacío si otro entorno todavía no tiene esas estructuras.

Los artículos están en `cms.posts`. El contenido Lexical está en `posts.content` como `jsonb`.
La metadata de imágenes está en `cms.media` y los archivos binarios en Supabase Storage, bucket
`media`.

El historial local de `cms.payload_migrations` quedó reconciliado con el esquema creado originalmente por
Payload push y las seis migraciones aparecen como ejecutadas.

## 4. Pendientes por validar

### P0 — Promover migraciones revisadas

Antes de ejecutar migraciones en otro entorno:

```sql
select name, batch, created_at
from cms.payload_migrations
order by created_at;
```

Después de revisar el SQL y confirmar que el entorno no fue creado con `PAYLOAD_DB_PUSH`:

```powershell
npx payload migrate
```

No ejecutar `db push` en producción. No ejecutar la versión antigua de la migración con nombres
camelCase ni con `CONCURRENTLY`.

Después de aplicar los índices, comprobar las consultas reales con `EXPLAIN (ANALYZE, BUFFERS)`.

### P0 — Validar imágenes en navegador y producción

Probar al menos:

- Imagen de portada.
- Imagen interna de un nodo Lexical `upload`.
- Bloque `mediaFeature`.
- Avatar de autor.
- Imagen social.

Confirmar que:

- No aparezca `localhost` ni `127.0.0.1` en HTML público.
- No haya errores de `/_next/image`.
- Las respuestas sean `2xx`.
- `Content-Type`, `Cache-Control` y tamaños sean correctos.
- Las imágenes funcionen con cache fría y caliente.

### P0 — Validar migración de perfiles de Equipo

La migración `20260820_191101_add_team_profile_fields` agrega:

- `admins.public_bio`.
- `admins.show_on_team` con valor por defecto `true`.
- Tabla relacional `admins_expertise_domains` para los dominios seleccionados.

En el entorno local configurado ya aparece como ejecutada. En otro entorno debe revisarse primero
`cms.payload_migrations`, no usar `db push` en producción y comprobar que el panel puede guardar los campos.

### P0 — Validar restauración de animaciones

Probar en carga fría y caliente, con desktop de 1440×900 y móvil de 390×844:

- `/`: header, texto por caracteres, apertura del libro, páginas, tres volúmenes y footer del hero.
- `/`: entrada de las `BlogCard` al hacer scroll y al abrir `Cargar más publicaciones`.
- `/dominios`: título, métricas y las cuatro filas alternadas `06`, `07`, `10` y `11`.
- `/equipo`: entrada del hero, tarjetas de perfiles y mapa de los 11 dominios.
- `/articulos`, `/equipo` y `/articulos/:slug`: títulos y copias con entrada tipográfica lenta.
- Preview de artículo en el panel: comprobar que la animación no bloquee el contenido.
- Panel: comprobar que las transiciones de tarjetas, botones, modal y navegación sigan presentes.
- Menú móvil: apertura, cierre, foco, Escape y reduced motion.
- CTA `ORIGEN / TXDX`: confirmar que no existan líneas diagonales ni trazos giratorios.

Confirmar además que:

- La primera respuesta HTML contiene el contenido visible.
- No haya tarjetas invisibles si se desactiva JavaScript.
- `prefers-reduced-motion: reduce` elimine desplazamientos, rotaciones, pulsos y stagger.
- La restauración visual no cambie TTFB, duración de consultas, autenticación ni carga de imágenes.

### P1 — Ejecutar bundle analyzer

En Windows:

```powershell
npx cross-env ANALYZE=true npm run build
```

Revisar `.next/analyze/` y documentar el peso real de:

- `@payloadcms/richtext-lexical`.
- `gsap`.
- Chunks de `/admin`.
- Chunks públicos.
- `PanelPostEditor`.

### P1 — Medir Web Vitals

No existen todavía mediciones reales de LCP, INP o CLS. Medir en staging o producción:

| Ruta | Dispositivo |
|---|---|
| `/` | Móvil y escritorio |
| `/articulos` | Móvil y escritorio |
| `/articulos/:slug` | Artículo con imágenes internas |
| `/dominios` | Móvil y escritorio |
| `/equipo` | Móvil y escritorio |
| `/panel` | Escritorio |
| `/panel/articulos/:id` | Escritorio |

Objetivos P75:

- LCP menor o igual a 2.5 s.
- INP menor o igual a 200 ms.
- CLS menor o igual a 0.1.

Registrar también TTFB, HTML/RSC transferido, JavaScript hidratado, CSS, bytes de imágenes y errores
de red.

### P1 — Validar la latencia de autenticación

Los logs originales mostraron `payload.auth` en aproximadamente 61 s. Si continúa después de cambiar
a Turbopack, revisar:

- Host y puerto del pooler de Supabase.
- `sslmode=require`.
- Disponibilidad y latencia de Supabase.
- `DATABASE_POOL_MAX`.
- Diferencia entre primera conexión y conexiones calientes.

No cachear respuestas de autenticación con cache público.

### P1 — Validar invalidación de cache

Probar el flujo completo:

1. Crear un borrador.
2. Publicarlo.
3. Confirmar portada, `/articulos`, sitemap y detalle.
4. Cambiar el slug.
5. Confirmar que la URL anterior no sirva contenido obsoleto.
6. Eliminar el artículo.
7. Confirmar que el detalle, listados y sitemap se actualicen.

Todavía debe comprobarse en producción si `revalidatePath` es necesario además de los tags y si el
comportamiento `stale-while-revalidate` es aceptable editorialmente.

### P2 — Optimizaciones restantes

- El layout raíz del panel todavía debe autenticarse y obtener perfil antes de renderizar el shell.
- Las consultas de lista pública todavía incluyen `content` para calcular minutos de lectura. La
  mejora definitiva sería persistir un campo `readingTime` o separar DTOs sin contenido.
- Las vistas propias de `/admin`, `MyArticles` y `MediaLibrary`, todavía hacen consultas amplias.
- El modal de contacto necesita un focus trap completo.
- GSAP todavía puede optimizarse para pausar animaciones fuera del viewport y reducir trabajo de
  `pointermove`.
- El CSS público global sigue siendo grande y debe depurarse con medición de cobertura.
- Los activos PNG grandes de `public/` deben auditarse y convertirse a WebP/AVIF cuando corresponda.
- Debe medirse si `priority` del logo compite con la imagen LCP real.
- No existe todavía una solución RUM para almacenar Web Vitals o errores de imagen.
- El bundle de Payload Admin sigue sin datos reales del analyzer.
- El año del footer está hardcodeado en `2026` y requiere actualización manual.

## 5. Runbook de verificación

Instalar dependencias si falta algún paquete:

```powershell
npm install
```

Desarrollo recomendado:

```powershell
npm run dev
```

Comparación con webpack:

```powershell
npm run dev:webpack
```

Verificación local completa:

```powershell
npm run lint
npm run typecheck
npm run build
```

La migración de Supabase debe ejecutarse por separado, después de revisar su estado remoto y aprobar
el cambio de esquema.

## 6. Archivos principales actualizados

| Archivo | Cambio |
|---|---|
| `next.config.ts` | Cache Components, Partial Prefetching, imágenes y analyzer. |
| `package.json` | Turbopack por defecto y script `dev:webpack`. |
| `src/modules/content/domain/media-url.ts` | Normalización de URLs de media. |
| `src/components/articles/article-rich-text-converters.tsx` | Fallback y normalización de imágenes Lexical. |
| `src/modules/content/infrastructure/payload/posts.ts` | Cache, tags, `select`, `depth` y sitemap ligero. |
| `src/app/(panel)/panel/articulos/actions.ts` | Invalidación de cache pública y sitemap. |
| `src/app/(panel)/panel/articulos/[id]/page.tsx` | Consultas paralelas y campos explícitos. |
| `src/app/(panel)/panel/articulos/nuevo/page.tsx` | Perfil y media en paralelo. |
| `src/app/(website)/page.tsx` | Portada con límite de 3 artículos recientes. |
| `src/app/sitemap.ts` | Consulta específica sin contenido Lexical. |
| `src/components/site/EditorialLibraryStage.tsx` | Timeline editorial restaurada con fallback visible. |
| `src/components/site/BrandMark.tsx` | Lockup `TxDxNet / Artículos por TxDxSecure`. |
| `src/components/site/SiteHeader.tsx` | Menú móvil accesible sin CTA redundante de empresa. |
| `src/components/site/SiteHeader.module.css` | Header compacto y responsive. |
| `src/components/site/BlogCard.tsx` | Reveal progresivo, stagger y fallback visible. |
| `src/components/site/BlogCard.module.css` | Estados visible, preparado y entrada. |
| `src/components/site/HomeBlogList.tsx` | Índices de stagger conservando `<details>` nativo. |
| `src/app/(website)/dominios/domains.module.css` | Filas XOC alternadas, imágenes y estados de reveal. |
| `src/app/(website)/dominios/page.tsx` | Índices globales para stagger de tarjetas. |
| `src/app/(website)/dominios/DomainFeature.tsx` | Fila alternada con imagen, contexto y reveal por scroll. |
| `src/app/(website)/equipo/page.tsx` | Equipo editorial y mapa de 11 dominios. |
| `src/app/(website)/equipo/team.module.css` | Diseño responsive y transiciones del equipo. |
| `src/app/(website)/servicios/page.tsx` | Redirección de compatibilidad hacia Equipo. |
| `src/components/site/TeamMemberCard.tsx` | Perfil público sin campos sensibles. |
| `src/components/site/TeamMemberCard.module.css` | Tarjetas de perfiles y dominios dominados. |
| `src/modules/content/infrastructure/payload/team.ts` | Consulta server-only de perfiles públicos. |
| `src/collections/Admins.ts` | Biografía, visibilidad y dominios XOC del equipo. |
| `src/app/(panel)/panel/perfil/page.tsx` | Formulario editorial ampliado. |
| `src/app/(panel)/panel/perfil/actions.ts` | Guardado y revalidación de Equipo. |
| `src/migrations/20260820_191101_add_team_profile_fields.ts` | Campos y relación de perfiles públicos. |
| `src/components/site/InteriorHero.module.css` | Entrada tipográfica lenta restaurada. |
| `src/app/(website)/globals.css` | Entradas de artículos y copias restauradas. |
| `src/migrations/20260820_120000_add_performance_indexes.ts` | Tres índices corregidos para PostgreSQL. |
| `src/migrations/20260820_191101_add_team_profile_fields.ts` | Campos y relación de perfiles públicos. |
| `scripts/baseline-payload-migrations.mjs` | Reconciliación segura de una base local creada con Payload push. |
| `scripts/seed-team-profiles.mjs` | Seed idempotente de perfiles editoriales sobre admins existentes. |
| `src/migrations/index.ts` | Registro de migraciones de rendimiento y equipo. |
| `RENDIMIENTO.md` | Estado, evidencia y pendientes de validación. |
