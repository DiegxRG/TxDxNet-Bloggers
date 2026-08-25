# Auditoria de recursos y dependencias de TxDxNet

Fecha de la auditoria: 25 de agosto de 2026.

## 1. Objetivo

Esta auditoria revisa el consumo de CPU, memoria, disco, red y base de datos del proyecto. Tambien
identifica dependencias, rutas, componentes y archivos sin uso, y separa los problemas confirmados de
las hipotesis que todavia requieren mediciones en produccion.

Stack revisado:

- Next.js 16.3.0 con App Router y Turbopack.
- React 19.2.8.
- Payload CMS 3.88.0.
- PostgreSQL y Storage de Supabase.
- Sharp, PDFKit, GSAP, Recharts y Lexical.

## 2. Resumen ejecutivo

No se encontro un conjunto grande de dependencias raiz que pudiera eliminarse sin afectar Payload o
funcionalidades activas. El principal consumo no procede de una sola libreria, sino de varios flujos:

- Analytics realiza varias escrituras por visita y su dashboard materializa miles de filas.
- La generacion de PDF descarga imagenes y construye el resultado completo en memoria.
- Los listados publicos cargan el contenido Lexical completo de cada articulo.
- Payload genera cuatro variantes por cada imagen, ademas del original.
- El autosave editorial escribe una version cada 1.5 segundos y conserva hasta 30 versiones.
- El panel comprueba referencias multimedia recorriendo documentos y versiones en memoria.
- `/admin` y `/panel` mantienen dos superficies editoriales parcialmente duplicadas.
- El contenedor Docker conserva herramientas y dependencias de desarrollo.
- `.next` acumula caches de webpack, Turbopack, desarrollo y analisis de bundles.

La limpieza de confianza alta retiro una API costosa sin consumidores, una dependencia directa, codigo
muerto, assets antiguos y scripts destructivos fuera del sistema de migraciones.

## 3. Mediciones realizadas

### 3.1 Build de produccion

Se ejecuto:

```powershell
npm run build -- --experimental-debug-memory-usage
```

Resultados observados:

| Metrica | Resultado |
|---|---:|
| Heap maximo reportado | 34.37 MiB |
| RSS maximo reportado | 561.02 MiB |
| Pico intermedio de persistencia Turbopack | 646.96 MiB |
| Tiempo total de GC | 13.93 ms |
| Paginas/rutas generadas antes de la limpieza | 30 |
| Paginas/rutas generadas despues de la limpieza | 29 |

El script de build permite hasta 8 GiB mediante `--max-old-space-size=8000`, pero la medicion no muestra
que el heap JavaScript necesite ese limite. El parametro no reserva 8 GiB de forma inmediata, aunque
puede ocultar futuras regresiones o permitir un crecimiento excesivo antes de fallar.

### 3.2 Disco

Mediciones aproximadas antes y despues de la limpieza:

| Directorio | Antes | Despues | Diferencia |
|---|---:|---:|---:|
| `node_modules` | 775.60 MiB | 756.18 MiB | -19.42 MiB |
| `public` | 35.81 MiB | 23.86 MiB | -11.95 MiB |

`.next` llego a superar 2 GiB durante la investigacion. Sus archivos mas grandes eran caches de webpack
y Turbopack, incluyendo caches separadas de desarrollo y produccion. Este valor representa disco local,
no memoria residente del servidor de produccion. Ejecutar analizadores y ambos bundlers incrementa esa
carpeta de forma acumulativa.

### 3.3 Bundle analyzer

`@next/bundle-analyzer` no genera informes durante builds Turbopack. El comando correcto para la version
actual es:

```powershell
npx next experimental-analyze -o
```

El resultado se escribe en `.next/diagnostics/analyze`. Para abrir la interfaz interactiva:

```powershell
npx next experimental-analyze
```

## 4. Limpieza aplicada

### 4.1 Dependencias

Se eliminaron:

- `jsdom`.
- `@types/jsdom`.
- 39 paquetes transitivos que solo eran necesarios para JSDOM.

JSDOM solo era utilizado por `/api/panel/markdown-preview`. No existian consumidores de esa API y el
endpoint no comprobaba autenticacion, no limitaba el cuerpo y ejecutaba Payload, JSDOM y conversion
Lexical por cada solicitud.

### 4.2 Ruta retirada

- `POST /api/panel/markdown-preview`.

La ruta era una superficie publica costosa y susceptible de abuso. Su eliminacion redujo el mapa de
Next.js de 30 a 29 entradas.

### 4.3 Codigo sin consumidores retirado

- `src/app/(panel)/panel/server-function.ts`.
- `src/components/icons/ServiceIcon.tsx`.
- `src/components/payload/BeforeDashboard.tsx`.
- `src/components/site/BlogCard.tsx`.
- `src/components/site/BlogCard.module.css`.
- `src/components/site/DomainIndex.tsx`.
- `src/components/site/HeroTelemetry.tsx`.
- `src/components/site/SectionHeading.tsx`.
- `src/components/site/XocRadar.tsx`.
- Exportaciones identidad o type guards sin consumidores.

Estos archivos no tenian imports, referencias declarativas de Payload ni entradas activas en su import
map. En conjunto, la limpieza retiro aproximadamente 1,449 lineas.

### 4.4 Assets retirados

- `public/service1.png`.
- `public/service2.png`.
- `public/service3.png`.
- `public/service4.png`.
- `public/equipotxdx.png`.
- `public/Designer (19).png`.
- `public/xoc-domain-map.jpeg`.
- `public/available-on-the-app-store.svg`.
- `public/Google_Play-Logo.wine.svg`.

Tambien se retiro el patron `/service*.png` de `next.config.ts`.

No se eliminaron `prompt1i.png` a `prompt11i.png` porque siguen declarados en los datos de dominios,
aunque siete no se muestran en la pagina actual. Retirarlos exige confirmar que no se reactivaran los
once dominios.

### 4.5 Scripts retirados

- `delete-user.cjs`, que borraba todos los administradores.
- `fix-db.cjs`, que alteraba directamente una columna de Payload.

No estaban expuestos en `package.json` ni formaban parte de un runbook activo. Las modificaciones de
esquema deben realizarse mediante migraciones revisadas.

## 5. Revision especifica de GraphQL

### 5.1 Uso por el codigo propio

TxDxNet no consume GraphQL desde su codigo propio.

No se encontraron:

- Consultas o mutaciones GraphQL.
- Archivos `.graphql` o `.gql`.
- Uso de `gql`.
- Apollo, Relay, urql o `graphql-request`.
- Llamadas `fetch` hacia `/api/graphql`.
- Imports propios desde `graphql` o `@payloadcms/graphql`.

El contenido publico usa la Local API de Payload mediante `getPayload()` y `payload.find()`. Los
componentes cliente usan endpoints REST como `/api/media`, `/api/admins/me` y `/api/admins/logout`.

### 5.2 Superficie HTTP activa

Actualmente existen estas rutas generadas desde la plantilla oficial de Payload:

| Ruta | Metodo | Archivo |
|---|---|---|
| `/api/graphql` | `POST`, `OPTIONS` | `src/app/(payload)/api/graphql/route.ts` |
| `/api/graphql-playground` | `GET` | `src/app/(payload)/api/graphql-playground/route.ts` |

Payload deshabilita por defecto el playground y la introspeccion en produccion, pero la API GraphQL
principal continua activa.

### 5.3 Por que no debe eliminarse el paquete `graphql`

Aunque TxDxNet no haga consultas GraphQL, `graphql@16.14.2` debe permanecer en `package.json` mientras
se utilicen Payload y `@payloadcms/next`.

`npm explain graphql` confirma que es un peer obligatorio de:

- `payload@3.88.0`.
- `@payloadcms/next@3.88.0`.
- `@payloadcms/graphql@3.88.0`.
- `graphql-http`.
- `graphql-scalars`.

Quitar la declaracion raiz no representa una eliminacion real: npm puede volver a instalarla para
satisfacer los peers, y una instalacion o un empaquetador mas estricto podria fallar. Payload tambien la
externaliza en el bundle servidor y espera una unica instancia resoluble desde la raiz.

### 5.4 Recomendacion para GraphQL

La recomendacion es mantener la dependencia, pero deshabilitar la funcionalidad HTTP si no existe un
consumidor externo confirmado.

Configuracion soportada por Payload 3.88:

```ts
buildConfig({
  graphQL: {
    disable: true,
  },
})
```

Tambien se pueden retirar los dos archivos de ruta GraphQL. Esto no rompe la Local API, REST ni Payload
Admin. Conviene hacer ambas cosas porque, en desarrollo, el playground de Payload 3.88 puede seguir
mostrandose aunque la API principal este deshabilitada.

Estado de esta recomendacion: no aplicada todavia. Antes debe confirmarse que no exista un consumidor
externo fuera del repositorio.

## 6. Dependencias revisadas

### 6.1 Dependencias activas y justificadas

| Dependencia | Uso principal |
|---|---|
| Next, React y React DOM | Framework y renderizado |
| Payload y paquetes `@payloadcms/*` | CMS, Admin, PostgreSQL, Lexical y S3 |
| `graphql` | Peer obligatorio de Payload |
| `sharp` | Variantes de imagen de Payload y optimizacion Next |
| `pdfkit` | Descarga publica de articulos en PDF |
| `gsap` | Animacion editorial de portada |
| `recharts` | Graficos privados en `/panel/metricas` |
| Fuentes Bricolage y Manrope | Tipografia de marca diferenciada |
| `dotenv` | Scripts operativos de migracion y seeds |
| `cross-env` | Scripts npm multiplataforma |

### 6.2 Dependencias que merecen revision, no eliminacion automatica

| Dependencia | Motivo |
|---|---|
| `postcss` | Puede ser redundante como declaracion raiz porque Tailwind ya depende de PostCSS |
| `@next/bundle-analyzer` | Su plugin solo funciona con webpack; Turbopack usa el analyzer nativo |
| `recharts` | Paquete pesado para una sola pagina privada |
| `gsap` | Paquete localizado en una sola experiencia publica |
| `pdfkit` | Paquete servidor pesado y generacion intensiva bajo demanda |

### 6.3 Imports directos apoyados en dependencias transitivas

El repositorio importa directamente paquetes que no declara de forma directa:

- `pg` en scripts PostgreSQL.
- `@aws-sdk/client-s3` en scripts de verificacion.
- `tsx` en `scripts/verify-supabase-stack.mjs`.
- `lexical` y varios paquetes `@lexical/*` en el editor personalizado.

Actualmente funcionan por hoisting desde Payload. Esto no explica el consumo alto, pero es un riesgo de
instalacion y actualizacion. Deben declararse con versiones compatibles o sustituirse por APIs publicas
de Payload despues de revisar el contrato de versiones de Lexical.

## 7. Hallazgos de prioridad alta

### 7.1 Analytics publico

Archivo principal: `src/app/api/analytics/route.ts`.

Comportamiento confirmado:

- Cada navegacion puede crear uno o dos eventos.
- Cada navegacion intenta crear tambien un visitante diario.
- Los visitantes repetidos usan una excepcion de indice unico como flujo normal.
- No existe rate limiting visible.
- No existe proteccion anti-bot visible.
- La retencion se ejecuta oportunistamente desde una solicitud publica.
- La coordinacion de limpieza vive solo en memoria de cada instancia.

Recomendacion:

- Aplicar rate limiting y muestreo/bloqueo de bots.
- Usar `ON CONFLICT DO NOTHING` para visitantes.
- Agregar contadores diarios en lugar de una fila por evento cuando sea viable.
- Mover retencion a cron o tarea de base de datos con borrado por lotes.
- Medir escrituras por minuto, latencia y crecimiento de tablas.

### 7.2 Dashboard de metricas

Archivo: `src/modules/analytics/server/metrics.ts`.

Cada carga puede ejecutar nueve conteos, una consulta de hasta 1,000 lecturas y dos consultas de hasta
10,000 filas. La aplicacion puede materializar aproximadamente 21,000 objetos y agregarlos en Node.

Recomendacion:

- Agregar con SQL mediante `GROUP BY`.
- Usar tablas rollup diarias.
- Reducir nueve conteos a una o pocas consultas.
- Cachear el dashboard durante un intervalo corto.
- Evaluar indices `(type, created_at)` y `(type, path, created_at)` con `EXPLAIN ANALYZE`.

### 7.3 Generacion de PDF

Archivos:

- `src/app/api/articulos/[slug]/pdf/route.ts`.
- `src/modules/content/infrastructure/pdf/render-article-pdf.ts`.

Comportamiento confirmado:

- El PDF se genera nuevamente en un cache miss.
- Todos los chunks se conservan y despues se copian con `Buffer.concat`.
- Las imagenes se descargan completas mediante `arrayBuffer()`.
- No hay limite visible de cantidad o bytes de imagenes.
- Cada imagen puede esperar hasta 15 segundos.

Recomendacion:

- Limitar concurrencia, cantidad y bytes de imagenes.
- Permitir solo hosts de confianza.
- Usar derivados reducidos de Payload en lugar de originales.
- Generar y persistir el PDF al publicar, identificado por `updatedAt`.
- Transmitir la salida si se mantiene la generacion bajo demanda.

### 7.4 Listados con contenido Lexical completo

`src/modules/content/infrastructure/payload/posts.ts` incluye `content: true` en
`publicPostListSelect`. Esto afecta portada, `/articulos`, destacados y relacionados.

Consecuencias:

- PostgreSQL lee y Payload deserializa rich text que las tarjetas no renderizan.
- La cache almacena copias grandes de los mismos documentos.
- Las claves varian segun limites y articulos relacionados.

El contenido se usa para calcular minutos de lectura. La mejora recomendada es persistir
`readingMinutes` al guardar/publicar y retirarlo del select de tarjetas. Este cambio requiere una
migracion revisada y regenerar tipos Payload.

### 7.5 Procesamiento de imagenes

`src/collections/Media.ts` genera cuatro variantes por upload:

- 480 x 320.
- 960 x 640.
- 1920 x 1080.
- 256 x 256.

Tambien se conserva el original y Next puede volver a optimizar los derivados bajo demanda.

Recomendacion:

- Definir limite global de bytes y megapixeles antes de Sharp.
- Revisar si todo archivo necesita las cuatro variantes.
- Definir calidad y formatos modernos.
- Medir CPU y hit rate de `/_next/image`.
- Mantener prioridad solo para el LCP real.

### 7.6 Referencias multimedia

`src/modules/panel/server/media-references.ts` carga hasta 1,000 admins, 1,000 posts y 1,000 versiones,
y recorre los objetos en memoria antes de permitir un borrado.

El limite actual tiene dos problemas: consume memoria y puede omitir una referencia posterior al
documento 1,000.

Recomendacion:

- Consultar relaciones directas con filtros SQL/Payload.
- Seleccionar solo campos relevantes.
- Mantener una tabla de referencias para uploads embebidos en Lexical.
- Paginar correctamente si se conserva el escaneo.

### 7.7 Backfill de avatar

`src/app/(panel)/panel/perfil/actions.ts` puede lanzar hasta 1,000 actualizaciones con `Promise.all`,
mientras el pool PostgreSQL permite cinco conexiones por instancia.

Recomendacion:

- Procesar lotes pequenos con concurrencia limitada.
- Usar una actualizacion masiva cuando los hooks no sean necesarios.
- Evitar versiones y auditoria para migraciones tecnicas mediante contexto explicito.

### 7.8 Autosave y versiones

`src/collections/Posts.ts` configura autosave cada 1,500 ms y hasta 30 versiones por documento. Cada
guardado serializa contenido Lexical y escribe una version aunque la auditoria omita autosaves.

Recomendacion:

- Medir tamano y crecimiento de `_posts_v`.
- Aumentar el intervalo a 5-15 segundos despues de validar UX.
- Revisar si son necesarias 30 versiones completas.

## 8. Hallazgos de prioridad media

### 8.1 Invalidacion de cache

Las server actions del panel invalidan tags globales de listas, destacados, detalles, relacionados y
sitemap. Publicar desde Payload Admin o REST no pasa necesariamente por esas actions.

Recomendacion:

- Centralizar invalidacion en hooks `afterChange` y `afterDelete` de Posts.
- Usar tags por documento o slug.
- Reservar tags globales para listados.
- Omitir autosaves y cambios que no alteran contenido publico.

### 8.2 Dos back offices

`/admin` y `/panel` administran articulos, medios y usuarios con interfaces y consultas paralelas.

Esto aumenta:

- Codigo cliente y servidor.
- Consultas duplicadas.
- Superficie de pruebas.
- Riesgo de reglas de acceso divergentes.

Debe definirse cual experiencia es canonica antes de eliminar rutas. No se aplico ninguna eliminacion
porque es una decision de producto.

### 8.3 Fronteras cliente

Componentes destacados:

- `PanelShell` hidrata la carcasa completa del panel.
- `EditorialLibraryStage` carga GSAP en portada.
- `DomainFeature` y `TeamMemberCard` son cliente principalmente por animaciones de entrada.
- `TornPaperCTA` se hidrata en todas las paginas publicas.
- `ThemeAndLayoutWrapper` envuelve todo Payload Admin para una excepcion de ruta.

Recomendacion:

- Mantener markup estable en Server Components.
- Aislar menu, modal, observer y animacion en islas pequenas.
- Pausar GSAP cuando la pagina este oculta o el hero salga del viewport.
- Limitar `pointermove` con RAF y evitar lecturas de layout por evento.
- Cargar Recharts dinamicamente en la ruta privada.

### 8.4 Docker

El `Dockerfile` actual usa una sola etapa. La imagen final conserva dependencias de desarrollo, codigo
fuente y herramientas de build.

Recomendacion:

- Adoptar un build multi-stage.
- Evaluar `output: 'standalone'` con Payload y migraciones.
- Separar, si es necesario, la ejecucion de migraciones de la imagen runtime.
- Comparar tamano, tiempo de pull y cold start antes y despues.

### 8.5 Observabilidad

No se encontro instrumentacion para medir:

- Pool PostgreSQL.
- Consultas lentas.
- Hit/miss de cache.
- Memoria y duracion de PDF.
- CPU de Sharp.
- Tamano de uploads.
- Core Web Vitals reales.

Recomendacion:

- Logging estructurado y configurable por entorno.
- Sampling de logs del panel.
- OpenTelemetry o instrumentacion equivalente.
- `EXPLAIN (ANALYZE, BUFFERS)` para consultas de analytics.
- RUM para LCP, INP y CLS.

## 9. Elementos que no deben eliminarse sin decision adicional

- `/servicios`, porque funciona como redireccion de compatibilidad hacia `/equipo`.
- Los once prompts de dominios, porque siguen declarados como contenido disponible.
- GSAP, porque mantiene la experiencia editorial de portada.
- Recharts, porque alimenta metricas privadas.
- PDFKit, mientras exista descarga PDF.
- Sharp, porque Payload y Next procesan imagenes.
- GraphQL como paquete, porque Payload lo exige como peer.
- `/admin` o `/panel`, hasta definir el back office canonico.

## 10. Orden recomendado de ejecucion

1. Confirmar consumidores externos y deshabilitar las rutas GraphQL si no existen.
2. Proteger y redisenar analytics, incluida la retencion.
3. Sustituir agregaciones en memoria por SQL o rollups.
4. Persistir `readingMinutes` y aligerar selects publicos.
5. Limitar generacion y cachear PDFs por version.
6. Limitar uploads y revisar las cuatro variantes Sharp.
7. Reescribir comprobacion de referencias multimedia.
8. Limitar concurrencia del backfill de avatar.
9. Ajustar autosave y retencion de versiones con datos reales.
10. Centralizar invalidacion de cache en hooks Payload.
11. Elegir entre `/admin` y `/panel` como experiencia canonica.
12. Crear Docker multi-stage.
13. Reducir fronteras cliente y medir bundles por ruta.
14. Reducir gradualmente el limite de heap del build despues de medir CI frio.

## 11. Verificaciones

Despues de la limpieza se ejecutaron:

```powershell
npm run lint
npm run typecheck
npm run build
git diff --check
```

Resultados:

| Verificacion | Estado |
|---|---|
| ESLint | Correcto |
| TypeScript strict | Correcto |
| Build Next.js 16.3.0 | Correcto |
| Mapa de rutas sin markdown preview | Correcto |
| Diff whitespace | Correcto; solo avisos esperados LF/CRLF |

## 12. Limitaciones de esta auditoria

Los hallazgos de codigo, dependencias y rutas estan confirmados estaticamente. Todavia hacen falta datos
de produccion para atribuir porcentajes exactos de CPU, RAM o latencia a cada causa.

Mediciones pendientes:

- Trafico y tasa de escritura de analytics.
- Tamano de tablas, indices y bloat.
- Duracion de queries mediante `EXPLAIN ANALYZE`.
- Memoria concurrente durante varias generaciones de PDF.
- CPU de Sharp con uploads reales.
- RSS del servidor despues de solicitar todas las rutas.
- Waterfall, JavaScript transferido y Core Web Vitals por dispositivo.
- Tamano final de la imagen Docker.

No deben promoverse cambios de esquema remoto sin generar y revisar previamente una migracion.
