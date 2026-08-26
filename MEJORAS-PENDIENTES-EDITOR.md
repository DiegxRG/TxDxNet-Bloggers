# Mejoras pendientes del editor

Fecha: 25 de agosto de 2026.

## 1. Eliminar tarjeta "Firma publica" del editor

**Archivo:** `src/components/panel/PanelPostEditor.tsx:383-403`

La tarjeta "Firma publica" muestra el nombre y cargo del autor en el editor. Es
informacion redundante porque ya viene del perfil del admin.

**Cambios requeridos:**

- Eliminar el div de "Firma publica" (lineas 383-400).
- Mantener los hidden inputs `authorName` y `authorRole` (lineas 402-403) para que
  el server action reciba los valores. Moverlos al inicio del form, antes del grid
  de dos columnas.
- Reducir el `gap-5` entre titulo y slug si queda excesivo espaciado al eliminar la
  tarjeta.

**Dependencia:** Ninguna. Se puede hacer en cualquier momento.

## 2. Avatar del autor: actualizar posts existentes al cambiar perfil

**Contexto:** El avatar del autor se guarda como snapshot en el post al publicar
(`posts.authorAvatar`). Si un admin sube una imagen de perfil nueva, los posts
anteriores no se actualizan automaticamente.

**Estado actual:**
- El backfill en `perfil/actions.ts:63-91` solo actualiza posts donde
  `authorAvatar IS NULL` (posts creados sin avatar).
- Posts que ya tienen un avatar conservan el valor original aunque el admin cambie
  su foto.

**Opcion A: Backfill completo (recomendada)**
- Cambiar el filtro en `backfillAvatar` para que actualice TODOS los posts del
  admin, no solo los sin avatar.
- Pro: Cambio minimo, cubre el 100% de los casos.
- Contra: Actualiza posts antiguos que podrian tener un avatar "correcto" en su
  momento.

**Opcion B: Lookup en vivo**
- Quitar `authorAvatar` de los selects publicos.
- Hacer JOIN con `admins.avatar` al renderizar cada post.
- Pro: Siempre actual, sin backfill.
- Contra: Query extra por render, complejidad de cache, el avatar puede cambiar
  sin que el editor lo note.

**Recomendacion:** Opcion A para el caso actual (2-3 admins). Opcion B solo si
hay 50+ autores con cambios frecuentes de avatar.
