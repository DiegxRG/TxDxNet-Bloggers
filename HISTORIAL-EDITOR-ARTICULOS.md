# Historial del Editor de Artículos — Panel TxDxNet

## Contexto: ¿Por qué existe el `/panel`?

El usuario (equipo editorial de TxDxSecure) necesitaba un espacio para crear y editar artículos **fuera del admin de Payload CMS**. El admin de Payload es potente pero difícil de personalizar: la UI es genérica, los componentes están tightly coupled al ecosistema Payload, y cualquier cambio visual requiereOverrides profundos.

La solución fue crear un **panel editorial custom** en la ruta `(panel)/panel/` con su propia UI, navegación y estética TxDx, manteniendo Payload como el backend (PostgreSQL + S3 + auth).

## El problema original

El panel tenía un **editor de texto rico custom** (`PanelRichEditor`) construido con `contentEditable` + `document.execCommand()`. Este approach:

1. **No soportaba imágenes inline** — las imágenes se manejaban por separado en un campo dedicado
2. **No producía formato Lexical** — Payload CMS v3 usa Lexical como editor nativo, y el campo `content` del schema Posts espera un `SerializedEditorState` (el formato JSON de Lexical)
3. **Tenía bugs de persistencia** — al guardar artículos con contenido, las imágenes inline no se serializaban correctamente y se perdían al recargar
4. **Era frágil** — `execCommand` está deprecated, tiene comportamiento inconsistente entre navegadores, y no maneja estructuras complejas (blocks, uploads, links anidados)

La necesidad era clara: **usar el editor Lexical nativo de Payload** para que el contenido producido por el panel fuera 100% compatible con el schema de la base de datos y con el renderizado público del sitio.

## El intento: integrar `RenderLexical` de Payload (Opción A)

### Qué es `RenderLexical`

`RenderLexical` es un componente `'use client'` exportado por `@payloadcms/richtext-lexical/client`. Está diseñado para renderizar el editor Lexical completo dentro del admin de Payload. Internamente hace esto:

1. Llama a una **server function** (`render-field`) via `ServerFunctionsContext`
2. La server function ejecuta `_internal_renderFieldHandler` en el servidor
3. El handler construye un **React element tree** (RSC payload) que contiene:
   - `<WatchCondition>` (wrapper de `@payloadcms/ui`)
   - `<RscEntryLexicalField>` (componente server de `@payloadcms/richtext-lexical/rsc`)
   - `<RichTextField>` (componente client de `@payloadcms/richtext-lexical/client`)
   - Todos los **feature clients**: `BoldFeatureClient`, `BlocksFeatureClient`, `FixedToolbarFeatureClient`, `UploadFeatureClient`, etc.
4. Este RSC payload se serializa y se envía al client via el wire protocol de React Server Components

### Por qué falló

El client de Next.js resuelve las referencias a client components usando el **React Client Manifest**. Este manifest se construye **en compile-time** escaneando el árbol de `'use client'` components alcanzables desde la entry point de cada ruta.

**En la ruta `(payload)/admin`**, la página `admin/[[...segments]]/page.tsx` importa `RootPage`, que transitivamente importa **todo el admin UI de Payload**. Esto registra TODOS los client components en el manifest: `WatchCondition`, `RichTextField`, `BlocksFeatureClient`, `FixedToolbarFeatureClient`, etc.

**En la ruta `(panel)/panel`**, la página solo importa `PanelPostEditor` → `PanelLexicalEditor` → `RenderLexical` + `ServerFunctionsProvider`. Estos son los ÚNICOS client components en el árbol. El manifest del `(panel)` **nunca registra** los otros ~25 client components que el RSC payload de `render-field` referencia.

Resultado: cuando el server action devuelve el RSC payload con referencias a `WatchCondition`, `BlocksFeatureClient`, etc., el client no los encuentra en su manifest y lanza:

```
Could not find the module "...@payloadcms/ui/dist/exports/client/index.js#WatchCondition"
in the React Client Manifest. This is probably a bug in the React Server Components bundler.
```

**No es un bug del bundler.** Es una limitación arquitectónica de usar `RenderLexical` fuera del admin de Payload.

### ¿Por qué los imports estáticos no funcionaron?

El primer intento fue agregar imports estáticos de todos los client components en `PanelLexicalEditor.tsx` (que es `'use client'`):

```tsx
import { WatchCondition } from '@payloadcms/ui'
import { BlocksFeatureClient, FixedToolbarFeatureClient, ... } from '@payloadcms/richtext-lexical/client'
void WatchCondition
void BlocksFeatureClient
// etc.
```

**Esto no funciona** porque el React Client Manifest no se construye desde los imports de un componente client. Se construye desde el **árbol server-to-client** del route segment. Los server actions que devuelven RSC payload con referencias a client components necesitan que esos componentes estén en el manifest pre-compilado del route. Importarlos en un `'use client'` componente solo los agrega al client bundle del route, pero no al manifest de referencias RSC.

Es una distinción sutil pero fundamental:
- **Client bundle**: módulos que el browser descarga para ejecutar el código client
- **React Client Manifest**: mapa que traduce `moduleID#exportName` → chunk URL, usado exclusivamente por el RSC runtime para resolver referencias desde server actions

Los imports estáticos populan el bundle, no el manifest. El manifest se genera escaneando las server components del route y sus boundary server→client.

## La solución: Editor custom con `@lexical/react` (Opción B)

### Qué es `@lexical/react`

`@lexical/react` es el paquete de React bindings para el framework [Lexical](https://lexical.dev/). Proporciona:

- `LexicalComposer` — Provider que inicializa el editor con config (namespace, theme, nodes)
- `RichTextPlugin` — Plugin que habilita editing de rich text
- `ContentEditable` — Componente que renderiza el `contentEditable` div
- `HistoryPlugin` — Undo/redo
- `ListPlugin` — Listas ordenadas y con viñetas
- `OnChangePlugin` — Callback en cada cambio de estado
- `LexicalErrorBoundary` — Error boundary para plugins

### Por qué funciona fuera del admin

`@lexical/react` es un paquete **client-side puro**. No depende de:
- Server functions
- React Client Manifest de Payload
- `importMap.js` de Payload
- Providers de `@payloadcms/ui`

Solo necesita:
1. Registrar los nodos Lexical correctos (ParagraphNode, HeadingNode, UploadNode, BlockNode, etc.)
2. Usar el mismo namespace (`'lexical'`) y theme que Payload
3. Producir `SerializedEditorState` en el formato exacto que Payload espera

### Custom nodes: `CustomUploadNode` y `CustomBlockNode`

Los nodos `UploadNode` y `BlockNode` de Payload extienden `DecoratorNode`, que renderiza componentes React dentro del editor. El problema es que el `decorate()` method de Payload usa hooks de `@payloadcms/ui` (`useConfig`, `useEditDepth`, `useServerFunctions`, etc.) que no existen fuera del admin.

La solución fue crear **nodos custom** que:

1. Extienden `DecoratorNode` directamente
2. Implementan `decorate()` con renderers simples (cards informativas)
3. Serializan al **mismo formato JSON** que Payload espera:
   - Upload: `{ type: 'upload', version: 3, id, relationTo, value, format }`
   - Block: `{ type: 'block', version: 2, fields: { blockType, ... }, format }`
4. Deserializan del mismo formato via `importJSON`

Esto garantiza que:
- El contenido guardado desde el panel es **100% legible** por Payload
- El contenido existente en la BD (creado desde el admin) es **cargable** en el panel
- El renderizado público del sitio **no se ve afectado**

### Upload de imágenes

El flujo de upload usa directamente la REST API de Payload:

1. Usuario hace clic en "Imagen" → file picker se abre
2. Selecciona archivo → `POST /api/media` con `FormData`
3. Payload sube el archivo a S3 via su S3 adapter
4. Se devuelve el documento media con `id`
5. Se inserta un `CustomUploadNode` con `{ relationTo: 'media', value: id }`

No hay dependencia de `S3ClientUploadHandler` ni de ningún client component de Payload. Es un `fetch` estándar.

### Bloques (Callout, MediaFeature, ActionCard)

El toolbar tiene un dropdown "Insertar bloque" con las 3 opciones configuradas en `src/editor.ts`. Al seleccionar un bloque:

1. Se crea un `CustomBlockNode` con los campos por defecto del bloque
2. Se inserta en la posición del cursor
3. El editor muestra una card informativa (tipo + título)
4. El contenido se serializa como `{ type: 'block', version: 2, fields: { blockType: 'callout', tone: 'insight', title: '...', body: '...' } }`

Los bloques se pueden editar futuramente agregando un doble-clic que abra un drawer/modal con los campos del bloque.

## Archivos involucrados

### Creados
| Archivo | Descripción |
|---------|-------------|
| `src/components/panel/panel-lexical-nodes.tsx` | CustomUploadNode + CustomBlockNode (DecoratorNodes custom con serialize/deserialize compatible con Payload) |
| `src/components/panel/PanelLexicalToolbar.tsx` | Toolbar con formatting, headings, lists, quote, image upload, block insert, undo/redo |

### Modificados
| Archivo | Cambio |
|---------|--------|
| `src/components/panel/PanelLexicalEditor.tsx` | Reescrito: LexicalComposer + RichTextPlugin + HistoryPlugin + ListPlugin + OnChangePlugin |
| `src/components/panel/PanelPostEditor.tsx` | Removido import de `panelServerFunction` y prop `serverFunction` |
| `src/app/(panel)/panel/panel.css` | Estilos para toolbar, editor WYSIWYG, embed cards, y theme de Lexical |

### Ya no necesarios (pero no eliminados)
| Archivo | Razón |
|---------|-------|
| `src/app/(panel)/panel/server-function.ts` | Solo se usaba para `RenderLexical` via `handleServerFunctions`. Ya no tiene imports. |

### Eliminados previamente
| Archivo | Razón |
|---------|-------|
| `src/components/panel/PanelRichEditor.tsx` | Editor custom con `contentEditable` + `execCommand` (755 líneas) — reemplazado |

## El error `CustomUploadNode must implement a static clone method`

Lexical internamente necesita **clonar nodos** para operaciones como:
- Copiar/pegar selecciones
- Duplicar nodos
- Deshacer/rehacer (el historial almacena estados anteriores)

Cuando un nodo tiene argumentos requeridos en su constructor (como `CustomUploadNode(data: UploadNodeData)`), Lexical no puede crear una copia sin saber cómo pasar esos argumentos. El error:

```
CustomUploadNode (type upload) must implement a static clone method since its
constructor has 1 required arguments (expecting 0).
```

Se resuelve agregando un método estático `clone`:

```tsx
static clone(data: UploadNodeData): CustomUploadNode {
  return new CustomUploadNode({ ...data })
}
```

## Flujo completo de datos

```
┌─────────────────────────────────────────────────────────┐
│  Panel /panel/articulos/nuevo                           │
│                                                         │
│  PanelPostEditor                                        │
│    └─ PanelLexicalEditor                                │
│         └─ LexicalComposer                              │
│              ├─ PanelLexicalToolbar                     │
│              │   ├─ Formatting (bold, italic, etc.)     │
│              │   ├─ Headings (H1, H2, H3)              │
│              │   ├─ Lists (UL, OL)                      │
│              │   ├─ Quote                               │
│              │   ├─ Image Upload → POST /api/media → S3 │
│              │   ├─ Block Insert → CustomBlockNode      │
│              │   └─ Undo / Redo                         │
│              ├─ RichTextPlugin (contentEditable)        │
│              ├─ HistoryPlugin                           │
│              ├─ ListPlugin                              │
│              └─ OnChangePlugin                          │
│                   └─ onChange → hidden input             │
│                        name="contentLexical"            │
│                        value=JSON.stringify(editorState) │
└─────────────────────────────────────────────────────────┘
                           │
                    Form submit (POST)
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Server Action: createPanelPostAction                   │
│    ├─ Lee FormData "contentLexical"                     │
│    ├─ JSON.parse → SerializedEditorState                │
│    ├─ Guarda en Payload via payload.update/create       │
│    └─ content (JSON) → PostgreSQL (cms schema)          │
└─────────────────────────────────────────────────────────┘
                           │
                    Lectura pública
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│  Website txdxnet.com                                    │
│    └─ Renderiza content via Payload Lexical converters  │
│         UploadNode → <img> con S3 URL                   │
│         BlockNode → HTML del block (callout, etc.)      │
│         ParagraphNode → <p>                             │
│         HeadingNode → <h1>..<h6>                        │
│         etc.                                            │
└─────────────────────────────────────────────────────────┘
```

## Pendiente / Futuro

1. **Edición de bloques inline** — Doble-clic en un bloque abre un drawer/modal con los campos editables
2. **Link editing** — Botón de enlace con prompt de URL
3. **Image preview** — Mostrar thumbnail de la imagen subida en vez de solo el ID
4. **Drag & drop** — Reordenar bloques e imágenes con drag and drop
5. **Slash commands** — Menú emergente al escribir `/` para insertar elementos
6. **Cleanup** — Eliminar `src/app/(panel)/panel/server-function.ts` (ya no se usa)
