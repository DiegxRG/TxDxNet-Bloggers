# Plan de arquitectura y experiencia digital — TxDxSecure Insights

> Estado: propuesta aprobada para iniciar la fase de definición.
> Fecha: 13 de agosto de 2026.
> Este documento es la fuente de verdad inicial del proyecto y debe actualizarse cuando una decisión cambie.

### Entorno de desarrollo confirmado

- Organización Supabase: `TxDxSecure DevSecOps AI Team`.
- Proyecto: `TxDxSecure Blogger`.
- Project ref: `qfwekssxqjweujyijyyo`.
- Región: `ca-central-1`.
- PostgreSQL: 17, canal estable.
- Estado inicial verificado: proyecto saludable, sin tablas públicas, sin migraciones y sin alertas de seguridad o rendimiento.
- MCP: restringido al proyecto y en modo solo lectura durante planificación.

### Dominio público confirmado

- Dominio canónico: `https://txdxnet.com`.
- La nueva plataforma se desplegará como sitio independiente en este dominio.
- `txdxsecure.com` se conserva como presencia corporativa actual y podrá enlazar o redirigir tráfico editorial hacia TxDxNet.

## 1. Visión

Construir una plataforma editorial de TxDxSecure para publicar contenido técnico, artículos, análisis y material multimedia organizado alrededor de dos puertas de entrada:

1. **Servicios**: contenido relacionado con las soluciones y capacidades comerciales de TxDxSecure.
2. **Dominios**: contenido relacionado con las 11 superficies tecnológicas y operativas que protege y monitorea el modelo XOC.

La plataforma debe ser:

- Visualmente memorable y coherente con TxDxSecure.
- Rápida, accesible y optimizada para buscadores.
- Fácil de editar por personal no técnico.
- Segura por defecto.
- Modular y mantenible, sin complejidad operativa innecesaria.
- Preparada para crecer hacia contenido multimedia, casos de estudio, formularios y señales de participación.

## 2. Decisión arquitectónica principal

Se implementará como un **monolito modular con arquitectura hexagonal ligera**.

### Stack recomendado

- **Frontend y runtime:** Next.js con App Router.
- **Lenguaje:** TypeScript en modo estricto.
- **CMS y panel editorial:** Payload CMS integrado en la aplicación Next.js.
- **UI pública:** React y Tailwind CSS.
- **Base de datos:** PostgreSQL administrado por Supabase.
- **Archivos:** Supabase Storage mediante su interfaz compatible con S3.
- **Despliegue inicial:** Vercel.
- **Protección antiabuso:** Cloudflare Turnstile y límites de frecuencia en servidor.
- **Pruebas:** Vitest para lógica y Playwright para recorridos críticos y validación visual.
- **Calidad:** ESLint/Biome según compatibilidad definitiva del scaffolding, TypeScript y comprobaciones automáticas.

### Por qué un monolito modular

No se necesitan microservicios ni un backend separado para la primera versión. Next.js y Payload pueden compartir proyecto, despliegue, tipos y acceso al contenido. Esto reduce:

- Duplicación de modelos.
- Autenticación entre servicios.
- Costos de infraestructura.
- Complejidad de despliegue.
- Latencia por llamadas internas innecesarias.

La separación modular conserva límites claros y permite sustituir una dependencia sin mezclarla con la UI.

## 3. Vista del sistema

```text
Lectores                    Equipo TxDxSecure
   │                              │
   │ web pública                  │ /admin + autenticación
   ▼                              ▼
┌──────────────────────────────────────────────┐
│            Next.js + Payload CMS             │
│                                              │
│  Presentación → Aplicación → Dominio → Puertos│
└───────────────────────┬──────────────────────┘
                        │
           ┌────────────┴────────────┐
           ▼                         ▼
    PostgreSQL/Supabase       Supabase Storage
    artículos, estados,       imágenes, PDF,
    relaciones, versiones,    video y archivos
    comentarios y señales
```

### Flujo de publicación

1. Un editor inicia sesión en `/admin`.
2. Crea o modifica un artículo utilizando bloques editoriales.
3. Guarda un borrador, lo previsualiza o programa su publicación.
4. Payload persiste el documento y su historial en PostgreSQL.
5. Las imágenes se almacenan fuera de la base de datos; PostgreSQL conserva metadatos y relaciones.
6. Al publicar se invalida la caché correspondiente.
7. Next.js entrega el artículo optimizado y listo para indexación.

### Experiencia del panel editorial (implementado)

- **Tema claro forzado** (`admin.theme: 'light'`): el panel usa siempre la paleta clara de Payload con refinamientos de `custom.css` (header con señal naranja, sidebar blanco, tarjetas claras).
- **Perfil único**: la colección `admins` se lee/edita solo a sí misma; el perfil (nombre y cargo público) se administra desde `/admin/account`.
- **Mis artículos**: vista propia en `/admin/mis-articulos` (acceso desde el sidebar) con tarjetas de cada artículo del editor (portada, estado, fecha) y atajo para crear uno nuevo. Se soporta en el campo oculto `createdBy` de `posts`, que se asigna automáticamente al crear.
- **Previsualización**: `livePreview.openByDefault: true` abre la vista previa del artículo al entrar a editar; la edición vive en otra pestaña.
- **Biblioteca multimedia tipo Dropbox**: la vista de lista de `media` se reemplaza por una rejilla con arrastrar y soltar, subida múltiple vía `/api/media`, búsqueda por nombre/`alt`, edición y borrado. El campo `alt` pasó a ser opcional.
- **SEO**: los artículos exponen título y descripción SEO, `noindex`, URL canónica e imagen social; la metadata pública (Open Graph + Twitter Cards) respeta `noindex`.

## 4. Estructura modular propuesta

```text
src/
├── app/
│   ├── (website)/
│   │   ├── page.tsx
│   │   ├── articulos/[slug]/
│   │   ├── servicios/
│   │   └── dominios/[slug]/
│   ├── (payload)/
│   │   └── admin/
│   └── api/
│       ├── comments/
│       └── reactions/
│
├── modules/
│   ├── content/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── taxonomy/
│   ├── engagement/
│   ├── media/
│   └── seo/
│
├── collections/
│   ├── Posts.ts
│   ├── Media.ts
│   └── Admins.ts
│
├── shared/
└── payload.config.ts
```

Las capas se aplicarán donde aporten valor real: publicación, permisos, consultas, comentarios, reacciones y almacenamiento. No se crearán abstracciones repetitivas para cada CRUD pequeño. `servicios` y `dominios` no son colecciones de Payload: son contenido estático en `src/data` para la web pública.

## 5. Modelo editorial

### Colección `posts`

Una única colección editorial, sin discriminador de tipo:

Campos principales:

- `title`: título público.
- `slug`: URL estable y única.
- `excerpt`: resumen para listados y SEO.
- `content`: contenido enriquecido estructurado.
- `coverImage`: relación con `media`.
- `featured`: contenido destacado.
- `status`: borrador o publicado.
- `publishedAt`: fecha de publicación.
- `readingTime`: estimación calculada.
- `seoTitle`, `seoDescription`, `socialImage` y `canonicalUrl`.

El flujo de publicación es el mínimo viable: escribir como en un procesador de textos
(Lexical con barra fija), previsualizar en la URL real y publicar en un paso.

### Taxonomía `services` y `domains` (estática)

No se administran desde Payload. Los servicios y los 11 dominios XOC viven como datos
estáticos en `src/data/services.ts` y `src/data/domains.ts` y alimentan las páginas
públicas `/servicios` y `/dominios`. Los artículos no se clasifican por taxonomía: se
ordenan por fecha y destacados, lo que mantiene la publicación ágil sin CRUDs extra.

### Otras colecciones

- `admins`: usuarios internos del equipo editorial.
- `media`: archivos, metadatos, texto alternativo y créditos.
- `comments`: comentarios anónimos moderados si se habilitan.
- `reactions`: señales anónimas por artículo.
- `redirects`: redirecciones editoriales y migraciones de URL.
- `siteSettings`: configuración global, redes, contacto y valores SEO.

## 6. Editor de contenido

El contenido se guardará como JSON estructurado de Lexical, no como HTML libre. El editor podrá incorporar:

- Párrafos, encabezados y listas.
- Imagen individual con texto alternativo obligatorio.
- Galería.
- Cita destacada.
- Avisos técnicos y de seguridad.
- Estadísticas y cifras.
- Tabla comparativa.
- Pasos o metodología.
- Fragmentos de código.
- Video o contenido embebido autorizado.
- Llamado a la acción.
- Artículos relacionados.
- Formulario de contacto.

Funciones editoriales requeridas:

- Borradores.
- Autoguardado.
- Historial y restauración de versiones.
- Vista previa en vivo.
- Publicación y despublicación programada.
- Biblioteca multimedia.
- Control de permisos por rol.
- Campos SEO y vista previa social.

## 7. Datos y almacenamiento

| Información | Ubicación |
|---|---|
| Artículos y contenido estructurado | PostgreSQL |
| Dominios y servicios | PostgreSQL |
| Borradores e historial | PostgreSQL |
| Comentarios y reacciones | PostgreSQL |
| Usuarios administrativos | PostgreSQL; contraseñas protegidas por el sistema de autenticación |
| Imágenes, PDF y video | Supabase Storage |
| Metadatos y relaciones de archivos | PostgreSQL |
| Código | Repositorio Git |
| Secretos | Variables de entorno; nunca en Git |

Los binarios no se guardarán dentro de PostgreSQL. Debe existir una política separada de respaldo para Storage: los respaldos de la base de datos no incluyen automáticamente los objetos almacenados.

## 8. Autenticación y participación

### Lectores

- No necesitan cuenta.
- No inician sesión para leer ni compartir.
- Podrán reaccionar anónimamente si la función se habilita.
- Los comentarios anónimos se consideran una fase posterior.

### Equipo editorial

- Autenticación obligatoria en `/admin`.
- Un solo rol: cada miembro del equipo puede crear, editar, previsualizar y publicar contenido.
- La gestión de usuarios queda en manos del propio equipo (colección `admins`).

### Reacciones anónimas

Se prefieren señales útiles para negocio en lugar de un “like” genérico:

- Me resultó útil.
- Quiero saber más.
- Es aplicable a mi organización.

Un identificador aleatorio en cookie permitirá aplicar una restricción lógica como:

```text
post_id + visitor_id + reaction_type = único
```

Se añadirán límites de frecuencia y protección antiabuso. Sin una cuenta no se puede garantizar un voto único por persona; se acepta esa limitación a cambio de eliminar fricción.

### Comentarios

No se recomiendan en el lanzamiento. Si se habilitan después:

- Nombre público.
- Email opcional, privado y nunca mostrado.
- Estado pendiente, aprobado, rechazado o spam.
- Validación Turnstile en servidor.
- Sanitización y límite de longitud.
- Rate limiting.
- Moderación previa a publicación.
- Avisos de privacidad y retención definidos.

## 9. Dirección de UI, UX y marca

### Concepto

**Editorial XOC / inteligencia operacional.** Una experiencia editorial técnica y refinada que combine la claridad de una publicación especializada con la tensión visual de un centro de operaciones.

Paleta inicial extraída del material recibido:

- Azul profundo como color dominante.
- Blanco técnico y superficies gris frío.
- Azul eléctrico para dominios transversales e interacción.
- Naranja como señal de atención y dominios de superficie.
- Negro azulado para tipografía y fondos de alta densidad.

La paleta final se obtendrá del logotipo y manual de marca oficiales cuando estén disponibles. Se definirá con tokens CSS, no con colores dispersos en componentes.

### Referencia: The Content Architecture

La referencia [contentarchitecture.dev](https://www.contentarchitecture.dev/#the-repo) se utilizará por sus principios, no para copiar su interfaz:

- Hero tipográfico con una proposición fuerte.
- Secciones numeradas que producen ritmo y orientación.
- Arquitectura y capacidades convertidas en narrativa visual.
- Jerarquía editorial marcada.
- Densidad controlada, contraste alto y sensación de producto serio.
- El repositorio/estructura mostrado como elemento de confianza.
- Llamados a la acción integrados en la historia, no aislados como botones genéricos.

En TxDxSecure, el equivalente memorable será el **mapa vivo XOC**: 11 superficies, capacidades transversales y cuatro resultados — seguridad, disponibilidad, performance y experiencia.

### Estructura conceptual de la portada

1. Hero con propuesta de valor de TxDxSecure y entrada al conocimiento.
2. Señal XOC: seguridad, disponibilidad, performance y experiencia.
3. Dos recorridos destacados: explorar por Servicio o por Dominio.
4. Mapa interactivo/editorial de los 11 dominios.
5. Capacidades y servicios principales.
6. Artículos destacados y publicaciones recientes.
7. Casos, metodología o evidencia técnica.
8. CTA de diagnóstico, conversación o demo.

### Principios UX

- Una acción principal por sección.
- Lectura cómoda en móvil y escritorio.
- Navegación por taxonomía comprensible, sin depender del diagrama.
- Buscador accesible desde todo el sitio.
- Filtros persistentes y URLs compartibles.
- Indicadores de lectura, fecha y categoría consistentes.
- Animaciones con propósito y respeto por `prefers-reduced-motion`.
- Contraste, foco visible, teclado y semántica conforme a WCAG 2.2 AA.
- Imágenes con texto alternativo obligatorio desde el CMS.

### Tailwind y componentes

- Tailwind para layout, responsive, estados y tokens.
- Variables CSS para color, tipografía, espaciado, radios y movimiento.
- Componentes públicos propios de TxDxSecure.
- Radix UI solo como primitivas accesibles cuando aporte valor.
- No se copiará el aspecto predeterminado de una biblioteca de componentes.
- Motion se utilizará para momentos de alto impacto, no para animar todo.
- Payload conservará su base administrativa y recibirá branding específico.

## 10. Identidad pública investigada

Fuentes públicas consultadas:

- [Sitio oficial TxDxSecure](https://www.txdxsecure.com/)
- [Perfil empresarial en LinkedIn](https://pe.linkedin.com/company/txdxsecure)
- [XOC Platform](https://xoc.app/)

Síntesis que debe orientar la voz y el contenido:

- Empresa peruana especializada en arquitecturas de red digitales, seguras e inteligentes.
- Propuesta: transformaciones digitales seguras para la empresa.
- Énfasis en automatización de T&I/OT, eficiencia, disponibilidad y rendimiento.
- Experiencia declarada de más de 20/25 años en el equipo.
- Core Services: arquitectura, DevNet/automatización, ciberseguridad y deployment.
- Evolución hacia XOC: convergencia de SOC, NOC y APM con automatización e IA.
- Oferta actual adicional en evaluaciones, hardening, resiliencia, performance, criptografía ágil y agentes de IA.

### Oportunidad editorial

La nueva plataforma debe ordenar y simplificar esta amplitud. El visitante no debería recibir una lista extensa sin contexto. Cada servicio debe explicar:

1. Qué problema de negocio resuelve.
2. En qué dominios actúa.
3. Qué evidencia o resultado entrega.
4. Qué artículo, caso o recurso amplía la explicación.
5. Cuál es el siguiente paso comercial apropiado.

## 11. SEO, distribución y rendimiento

- Renderizado en servidor para contenido editorial.
- Metadata por artículo y taxonomía.
- Datos estructurados `Organization`, `BlogPosting`, `BreadcrumbList` y `Service` cuando corresponda.
- Sitemap XML.
- RSS.
- Open Graph y tarjetas sociales.
- URLs legibles y estables.
- Redirecciones administrables.
- Canonical URL.
- Optimización y transformación de imágenes.
- Presupuesto de JavaScript y Core Web Vitals como criterio de aceptación.
- Caché con revalidación al publicar.

## 12. Seguridad

- MCP de Supabase solo para desarrollo, nunca conectado directamente a datos reales de producción.
- Servidor MCP restringido a un proyecto específico una vez creado o identificado.
- Modo solo lectura para exploración; escritura habilitada únicamente durante migraciones revisadas.
- Aprobación manual para herramientas de escritura.
- Secretos fuera del repositorio.
- Validación de entrada en servidor.
- Control de acceso en cada colección y operación.
- Publicación pública únicamente de documentos con estado publicado.
- Rate limiting para formularios, reacciones y comentarios.
- Cabeceras de seguridad y CSP.
- Dependencias auditadas y actualizaciones controladas.
- Logs sin datos personales o secretos.
- Revisión de políticas de privacidad antes de analítica, cookies o comentarios.

## 13. MCP y skills para acelerar el proyecto

### MCP previsto

- **Supabase MCP:** esquema, migraciones, tipos, asesores y diagnóstico. Comenzará en modo solo lectura y se limitará al proyecto de desarrollo.
- **Context7 MCP:** documentación de versiones instaladas de Next.js, Tailwind y librerías; queda configurado a nivel de proyecto.
- **Next.js DevTools MCP:** errores, rutas y estado del runtime cuando exista el scaffolding.
- **Browser/Playwright:** screenshots, recorridos y validación visual del sitio local.

### Skills previstas

- `frontend-design`: dirección visual y ejecución de UI distintiva; ya disponible.
- `browser:control-in-app-browser`: inspección de referencias y QA visual; ya disponible, aunque el navegador no estuvo expuesto en la sesión de planificación.
- `supabase`: guía oficial de producto.
- `supabase-postgres-best-practices`: esquema, consultas, conexiones y RLS.
- `playwright`: pruebas end-to-end.
- `screenshot`: evidencia visual cuando sea útil.
- `security-best-practices`: revisión defensiva del frontend/backend.
- `vercel-deploy`: publicación de previews y producción.

No se encontró una skill oficial específica para Next.js o Tailwind en el catálogo curado revisado. Para esas tecnologías se usarán documentación oficial, Context7 y reglas del repositorio. Cuando el sistema visual sea aprobado, se podrá crear una skill propia de `txdxsecure-design-system` para preservar decisiones de marca y evitar inconsistencias entre sesiones.

## 14. Fases de entrega

### Fase 0 — Fundaciones

- Validar logotipo, colores, tipografías y activos oficiales.
- Confirmar si la plataforma reemplaza la web actual o vive como sección/subdominio.
- Confirmar taxonomía definitiva de servicios.
- Crear proyecto Supabase de desarrollo.
- Restringir MCP al proyecto de desarrollo.
- Inicializar Git y documentación del repositorio.
- Definir variables de entorno y estrategia de despliegue.

### Fase 1 — CMS y modelo de contenido

- Scaffolding de Next.js y Payload.
- PostgreSQL y Storage.
- Colecciones y permisos (un solo rol editorial).
- Dominios y servicios como datos estáticos.
- Editor por bloques.
- Borradores, versiones, preview y publicación.

### Fase 2 — Sitio público

- Sistema visual.
- Portada.
- Índice de artículos.
- Páginas de dominios y servicios.
- Página individual de artículo.
- Búsqueda y filtros.
- Responsive y accesibilidad.

### Fase 3 — SEO, calidad y operación

- Metadata, schemas, sitemap y RSS.
- Caché y revalidación.
- Pruebas unitarias, integración y E2E.
- Revisión visual en navegadores y tamaños clave.
- Seguridad, performance y observabilidad.
- Preview de despliegue y aceptación.

### Fase 4 — Participación opcional

- Reacciones anónimas útiles.
- Medición de conversión.
- Comentarios moderados solo si existe demanda real.
- Newsletter o suscripciones si se aprueba una estrategia editorial.

## 15. Alcance recomendado del MVP

Incluye:

1. Web pública sin registro.
2. Portada editorial.
3. Exploración por Servicios y Dominios.
4. Los 11 dominios precargados.
5. Buscador y filtros.
6. Artículos individuales.
7. Panel administrativo protegido.
8. Editor por bloques y biblioteca multimedia.
9. Borradores, preview, versiones y publicación programada.
10. SEO técnico completo.
11. Formulario de contacto protegido.
12. Reacción anónima “Me resultó útil”, si no retrasa el núcleo editorial.

No incluye inicialmente:

- Registro de lectores.
- Perfiles públicos de lectores.
- Comentarios abiertos.
- Microservicios.
- Aplicación móvil nueva.
- Personalización basada en seguimiento invasivo.

## 16. Decisiones pendientes

- ¿La plataforma reemplazará `txdxsecure.com`, vivirá en `/insights` o en un subdominio?
- ¿Cuál es la lista comercial definitiva de Servicios? (hoy estática en `src/data/services.ts`)
- ¿Los seis dominios transversales XOC serán capacidades, servicios o una taxonomía adicional?
- ¿Qué logotipo y variantes tienen aprobación oficial?
- ¿Qué fuentes tipográficas están licenciadas?
- ¿Se habilitarán reacciones en el MVP?
- ¿Qué proveedor de email enviará notificaciones y formularios?
- ¿Qué política de respaldo se aplicará a Supabase Storage?
- ¿Qué datos de analítica son realmente necesarios?

## 17. Referencias técnicas

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Tailwind CSS con Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
- [Payload Admin Panel](https://payloadcms.com/docs/admin/overview)
- [Payload Drafts](https://payloadcms.com/docs/versions/drafts)
- [Payload Live Preview](https://payloadcms.com/docs/live-preview)
- [Payload Rich Text Blocks](https://payloadcms.com/docs/rich-text/blocks)
- [Payload PostgreSQL](https://payloadcms.com/docs/database/postgres)
- [Payload Storage Adapters](https://payloadcms.com/docs/upload/storage-adapters)
- [Supabase PostgreSQL](https://supabase.com/docs/guides/database/overview)
- [Supabase Storage](https://supabase.com/docs/guides/storage)
- [Supabase MCP](https://supabase.com/docs/guides/ai-tools/mcp)
- [Codex MCP](https://developers.openai.com/codex/mcp)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/get-started/)

## 18. Criterio de inicio de implementación

El scaffolding podrá comenzar cuando estén confirmados estos cuatro elementos:

1. Ubicación pública del nuevo sitio.
2. Proyecto Supabase de desarrollo.
3. Taxonomía inicial de servicios.
4. Activos oficiales mínimos: logotipo y colores aprobados.

Mientras alguno permanezca pendiente, se pueden preparar componentes técnicos reversibles, pero no se debe congelar el sistema visual ni cargar datos de producción.
