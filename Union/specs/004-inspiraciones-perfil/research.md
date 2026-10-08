# Phase 0 Research: Frontend de Perfil — Gestión de Perfil, Carpetas y Publicaciones Propias

**Feature**: 004-inspiraciones-perfil | **Date**: 2026-10-06

Este documento registra las decisiones técnicas tomadas para resolver los puntos abiertos de
`spec.md` (sección 9, Ambigüedades A1–A10) que impactan el diseño, sin bloquear la planificación,
y las decisiones de stack que complementan el Technical Context de `plan.md`. Todas las
clarificaciones ya han sido resueltas en `clarifications.md`; este documento documenta cómo se
incorporan al diseño frontend. Ninguna decisión aquí implica implementar backend ni código: son
decisiones de **diseño** que se reflejan en `data-model.md` y `contracts/openapi.yaml`.

---

## 1. Cliente HTTP: fetch nativo encapsulado vs. axios

**Decisión**: Encapsular un cliente HTTP único en `infrastructure/httpClient.ts`, basado en `fetch`
nativo del navegador (sin dependencia externa adicional), expuesto únicamente a través de la capa de
`application/services`.

**Justificación**: El monorepo ya tiene precedentes (`Union/frontend/src/infrastructure/httpClientAdmin.ts`)
que usan clientes HTTP encapsulados simples. Usar `fetch` nativo evita una dependencia adicional
mientras el backend real no existe todavía (Principio IV de la constitución). Si en la iteración de
integración futura se requiere interceptores más sofisticados (reintentos, refresh de token), se
puede migrar a `axios` sin romper la capa de `application/services`.

**Alternativas evaluadas**:
- `axios` (rechazado por ahora: dependencia adicional no justificada sin backend real que la requiera)
- `react-query`/`SWR` (rechazado por ahora: añade complejidad de caché de servidor que no aporta
  valor mientras no hay API real que consumir; puede reconsiderarse en iteración de integración)

**Impacto en clarificaciones**: A2 (photo upload) requerirá `multipart/form-data`; `fetch` nativo
lo soporta nativamente con `FormData` API.

---

## 2. Manejo de ausencia de backend real durante el desarrollo (General)

**Decisión**: Durante el desarrollo de este frontend (sin backend conectado), se permite el uso de
**fixtures estáticas puramente de presentación** (arrays de ejemplo en memoria, sin persistencia real
ni lógica de negocio simulada) únicamente para poblar visualmente las pantallas en desarrollo local
y en tests. Estas fixtures NO son un backend: no validan permisos, no persisten cambios entre
recargas, y se reemplazan por llamadas reales a la capa de `application/services` → `httpClient`
apuntando a la API Java en la iteración de integración futura.

**Justificación**: El Principio IV prohíbe "funciones de backend", lo cual se interpreta como lógica
de servidor (validación de permisos, persistencia, reglas de negocio ejecutadas fuera del cliente).
Un array estático de datos de muestra, usado solo para maquetar visualmente una lista de carpetas o
tabla de posts, no constituye una función de backend: es equivalente a un dato *mock* en un test de
componente. Para evitar ambigüedad futura, estas fixtures se ubican exclusivamente en `tests/` y,
si se requieren para Storybook/demo visual, en un archivo claramente nombrado (`*.fixtures.ts`),
nunca mezcladas con la lógica de `application/services`.

**Alternativas evaluadas**:
- No usar ningún dato de ejemplo hasta tener la API real (rechazado: impediría validar visualmente
  el diseño durante esta iteración)
- Levantar un servidor mock persistente tipo `json-server` (rechazado: se acerca demasiado a
  "implementar backend")

---

## 3. Resolución de A1 — Username Uniqueness

**Clarificación original**: No se define si el nombre de usuario debe ser único en la plataforma.

**Resolución aplicada**: Username MUST be globally unique. Backend enforces via database constraint.
Frontend displays backend error cleanly.

**Decisión de diseño**:
- El campo `username` en `Usuario` domain entity encapsula regla de negocio: "único en plataforma"
- `UsuarioPerfilService.cambiarNombreUsuario(nuevoUsername)` envía solicitud POST/PUT a backend
- Si backend retorna 409 Conflict o 400 Bad Request (username ya existe), el error se captura en la
  capa de servicios y se propaga a la presentación
- La pantalla de edición de perfil (`EditarPerfilForm`) recibe el error y lo muestra inline sin
  limpiar el formulario
- Mensaje de error: "❌ El nombre de usuario ya existe. Por favor, elige otro."
- AC-02.6 (confirmación explícita) se implementa como diálogo separado antes de enviar solicitud

**Impacto en componentes**:
- Domain: `Usuario.username` (validación de regla, no ejecutada localmente)
- Application: `UsuarioPerfilService.cambiarNombreUsuario()` (error handling)
- Presentation: `EditarPerfilForm` (error display, confirmación)
- Tests: Unitario (regla existe), aplicación (error propagación), presentación (error UI)

**Alternativas evaluadas**:
- Client-side uniqueness check (rechazado: requeriría listar todos los usuarios o hacer preflight
  request, ineficiente y redunda con validación backend)

---

## 4. Resolución de A2 — Profile Photo Restrictions

**Clarificación original**: No se definen restricciones para la foto de perfil (formatos,
tamaño máximo, resolución).

**Resolución aplicada**: JPG/PNG/WebP, max 5 MB. Backend validates format, size, dimensions.
Frontend provides guidance and optional client-side size check.

**Decisión de diseño**:
- Nuevo componente `PhotoUploadField` en `presentation/perfil/PhotoUploadField.tsx`
- Input HTML: `<input type="file" accept=".jpg,.jpeg,.png,.webp" />`
- Client-side validation: rechaza archivos >5 MB inmediatamente con mensaje "El archivo debe ser
  menor a 5 MB"
- Muestra preview de imagen seleccionada antes de upload
- Texto de orientación: "Formatos: JPG, PNG, WebP. Tamaño máximo: 5 MB."
- Upload usa `FormData` API nativa con `multipart/form-data`
- Errores del backend (formato inválido, dimensiones, etc.) se capturan en
  `UsuarioPerfilService.cambiarFoto()` y se muestran como overlay o inline message
- Si backend retorna error (400, 413, 415), form state persiste

**Impacto en componentes**:
- Infrastructure: `httpClient.ts` debe soportar `FormData` nativa
- Application: `UsuarioPerfilService.cambiarFoto(file)` (error handling para 400, 413, 415)
- Presentation: `PhotoUploadField` (preview, validation, error display), integrado en
  `EditarPerfilForm`
- Tests: Validación de client-side size check, backend error display

**Alternativas evaluadas**:
- Image cropping/resizing en frontend (rechazado: Principio IV, no procesar imágenes en frontend)
- AVIF format (rechazado: menos navegadores lo soportan en 2026; mantener JPG/PNG/WebP)

---

## 5. Resolución de A3 — Folder Name Uniqueness (Per User)

**Clarificación original**: No se define si los nombres de carpeta deben ser únicos.

**Resolución aplicada**: Folder names MUST be unique per user (not globally). Backend enforces.
Frontend displays error if duplicate within same user.

**Decisión de diseño**:
- El backend implementa unique constraint en `(usuario_id, nombre_carpeta)`
- Diálogos `CreateCarpetaDialog` y `RenameCarpetaDialog` envían solicitud POST/PUT
- Si backend retorna 409 Conflict (nombre duplicado en ese usuario), error se captura en
  `CarpetaService.crearCarpeta()` / `CarpetaService.renombrarCarpeta()`
- Error message: "Ya existe una carpeta con ese nombre en tu perfil"
- Diálogos permanecen abiertos, permitiendo corrección inmediata

**Impacto en componentes**:
- Domain: `CarpetaPost.nombre` (validación de regla per usuario)
- Application: `CarpetaService.crearCarpeta()`, `CarpetaService.renombrarCarpeta()` (error handling)
- Presentation: `CreateCarpetaDialog`, `RenameCarpetaDialog` (error display)
- Tests: Error handling para 409 Conflict

**Alternativas evaluadas**:
- Cargar lista de carpetas del usuario y validar client-side (rechazado: requiere fetch
  innecesario; backend es authoritative)

---

## 6. Resolución de A4 — Follow / Unfollow Button Behavior

**Clarificación original**: No se define si existe la acción inversa de dejar de seguir.

**Resolución aplicada**: Follow/unfollow es bidireccional. Botón único alterna entre
"Seguir" / "Dejar de seguir". Optimistic UI update con error rollback.

**Decisión de diseño**:
- Nuevo componente `FollowButton` en `presentation/seguimiento/FollowButton.tsx`
- Nuevo value object `SeguimientoRelacion` en `domain/SeguimientoRelacion.ts` (track
  `siguiendo: boolean`)
- Lógica de optimistic update:
  1. Usuario hace clic en botón (estado inicial: "Seguir" o "Dejar de seguir")
  2. Botón cambia inmediatamente a estado opuesto (optimistic)
  3. Se envía solicitud al backend: `POST /usuarios/{usuarioId}/seguimiento/toggle`
  4. Si respuesta exitosa (200): mantener estado optimistic
  5. Si error (400, 403, 500): rollback al estado anterior, mostrar toast de error
- Nuevo servicio `SeguimientoService.toggleSeguimiento(usuarioASeguidoId)` orquesta la lógica

**Impacto en componentes**:
- Domain: Nuevo `SeguimientoRelacion` value object
- Application: Nuevo `SeguimientoService.toggleSeguimiento()` (optimistic + error handling)
- Presentation: Nuevo componente `FollowButton`, integrado en `PerfilAjeno.tsx`
- Tests: Optimistic update, error rollback, state transitions

**Alternativas evaluadas**:
- Dos botones separados "Seguir" y "Dejar de seguir" (rechazado: UI redundante)
- Esperar respuesta del backend antes de actualizar UI (rechazado: pobre UX; optimistic es
  estándar)

**Nota A4**: Se diferencia visualmente el estado activo ("Dejar de seguir" con ícono de check o
fondo diferente) del estado inactivo ("Seguir").

---

## 7. Resolución de A5 — Editable Post Fields

**Clarificación original**: No se especifica qué campos de una publicación son editables (texto,
imagen, ambos).

**Resolución aplicada**: Only text is editable; images are immutable after publication.

**Decisión de diseño**:
- `Publicacion` domain entity encapsula regla: campo `texto` es mutable, campo `imagen(s)` es
  immutable
- Nuevo componente `EditPostForm` en `presentation/publicaciones/EditPostForm.tsx`
- Formulario muestra:
  - Imagen(es) en display read-only (no input, no posibilidad de cambiar)
  - Campo de texto `<textarea>` editable
- `PublicacionService.editarPost(postId, nuevoTexto)` envía solo el campo `texto` al backend
- Ignorar cualquier intento de actualizar imagen (no enviarse al backend)

**Impacto en componentes**:
- Domain: `Publicacion.texto` (mutable), `Publicacion.imagen(s)` (immutable, regla encapsulada)
- Application: `PublicacionService.editarPost(postId, nuevoTexto)` (solo texto)
- Presentation: `EditPostForm` (image read-only, text editable)
- Tests: Verificar que imagen no se envía en PATCH request

**Alternativas evaluadas**:
- Permitir cambio de imagen (rechazado: complicaría flujo, "editar" debe ser operación menor)

---

## 8. Resolución de A6 — Pagination Responsibility

**Clarificación original**: No se define si paginación es responsabilidad del cliente o si API
entrega páginas.

**Resolución aplicada**: Server-side pagination. Backend returns paginated responses.
Frontend implements infinite scroll or pagination controls.

**Decisión de diseño**:
- Endpoint en backend: `GET /usuarios/{id}/carpetas?limit=10&offset=0`
- Respuesta JSON:
  ```json
  {
    "carpetas": [...],
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
  ```
- Default limit: 10 carpetas por request
- `CarpetaService.listarCarpetas(usuarioId, limit=10, offset=0)` hace paginated call
- Componente `CarpetaList` implementa **infinite scroll**:
  - Al llegar al final de la lista, dispara carga siguiente página (offset += limit)
  - Append resultados a lista existente, sin reemplazar
  - O implementar botón "Load More" si UI lo requiere
- Nunca cargar todas las 50 carpetas en memory; máximo 50 en total, pero paginadas en chunks de 10

**Impacto en componentes**:
- Application: `CarpetaService.listarCarpetas(usuarioId, limit, offset)` (paginated calls)
- Presentation: `CarpetaList` (scroll detection or "Load More" button, state management para offset)
- Tests: Paginated API calls, scroll detection, data appending

**Alternativas evaluadas**:
- Client-side paginación sobre toda la lista (rechazado: viola Principio X, Escalabilidad)

---

## 9. Resolución de A7 — Folder Deletion with Content

**Clarificación original**: No se define si eliminar carpeta requiere que esté vacía.

**Resolución aplicada**: Can delete folder with posts inside. Posts persist. Explicit confirmation
required.

**Decisión de diseño**:
- Nuevo componente `ConfirmDeleteCarpetaDialog` en `presentation/carpetas/ConfirmDeleteCarpetaDialog.tsx`
- Diálogo muestra advertencia clara:
  ```
  ⚠️ ¿Eliminar esta carpeta?
  
  Se eliminarán todos los posts guardados en "[Nombre Carpeta]",
  pero los posts originales seguirán en la plataforma.
  
  [Cancelar] [Eliminar]
  ```
- `CarpetaService.eliminarCarpeta(carpetaId)` hace DELETE sin condición; backend maneja cascading
  delete de asociaciones `CarpetaPost`-`Publicacion`, pero no elimina `Publicacion` en sí
- Confirmación es explícita y advertencia es clara (Principio XIII, A7)

**Impacto en componentes**:
- Domain: `CarpetaPost` (encapsula regla: deletion no afecta posts)
- Application: `CarpetaService.eliminarCarpeta()` (ejecuta sin condición)
- Presentation: `ConfirmDeleteCarpetaDialog` (warning message + confirmation)
- Tests: Folder deletion, error handling

**Alternativas evaluadas**:
- Requerir vaciado previo (rechazado: UX pobre, inconveniente para usuario)

---

## 10. Resolución de A8 — Idempotent Save (Already-Saved Post)

**Clarificación original**: No se define si guardar post ya guardado a misma carpeta retorna error.

**Resolución aplicada**: Idempotent operation. Returns success even if already saved. No duplicates.

**Decisión de diseño**:
- `PublicacionService.guardarPostEnCarpeta(postId, carpetaId)` detecta si post ya está en carpeta
- Si ya existe la asociación: return success con status 200, sin crear duplicado
- Mensaje al usuario: "✅ El post ya está guardado en esta carpeta"
- Si no existe: crear asociación, return 201
- REST-compliant idempotency: múltiples requests idénticas producen mismo resultado

**Impacto en componentes**:
- Domain: `GuardarPost` / relación (encapsula idempotency)
- Application: `PublicacionService.guardarPostEnCarpeta()` (duplicate detection)
- Presentation: `SavePostToCarpetaDialog` (success message para ambos casos)
- Tests: Duplicate detection, idempotent behavior

**Alternativas evaluadas**:
- Retornar error si ya guardado (rechazado: pobre UX, viola REST idempotency principles)

---

## 11. Resolución de A9 — Folder Privacy Settings

**Clarificación original**: No se define si carpetas tienen estado de privacidad.

**Resolución aplicada**: NO privacy feature. All folders are PUBLIC. Explicit non-requirement.

**Decisión de diseño**:
- `CarpetaPost` domain entity NO tiene campo `privacidad` ni estado privado/público
- No hay toggles de privacidad en la UI
- Todas las carpetas son visibles públicamente (AC-03.3 de spec)
- Marcado explícitamente como fuera de alcance en esta iteración (A9)

**Impacto en componentes**:
- Domain: No field needed; all folders public by default
- Presentation: No privacy controls to implement
- Tests: No privacy-specific tests

**Nota**: Si en futura iteración se requiere privacidad, será una enmienda a la constitución.

---

## 12. Resolución de A10 — Banned/Deleted Profile Visibility

**Clarificación original**: No se define si perfil baneado/eliminado es visible.

**Resolución aplicada**: Banned/deleted profiles NOT visible. Backend returns 404/403. Frontend shows
unavailability message.

**Decisión de diseño**:
- `UsuarioPerfilService.obtenerPerfil(usuarioId)` hace GET `/usuarios/{id}`
- Si usuario tiene `EstadoCuentaUsuario.BANEADO` o `ELIMINADO`, backend retorna 404 o 403
- Frontend captura error en servicio y propaga a presentación
- Nuevo componente `ProfileNotFoundView` en `presentation/perfil/ProfileNotFoundView.tsx`
- `PerfilPage` renderiza condicionalmente:
  - Si perfil disponible: `<PerfilPropio>` o `<PerfilAjeno>`
  - Si no disponible (404/403): `<ProfileNotFoundView>`
- Mensaje: "Este perfil no está disponible. La cuenta ha sido eliminada o está deshabilitada."
- No mostrar botón "Seguir" en perfiles no disponibles

**Impacto en componentes**:
- Domain: `Usuario` con `estado = BANEADO|ELIMINADO` es inaccesible
- Application: `UsuarioPerfilService.obtenerPerfil()` (404/403 handling)
- Presentation: `ProfileNotFoundView` (unavailability message), `PerfilPage` (conditional render)
- Tests: 404/403 error handling, ProfileNotFoundView display

**Integración con Module 002**: Ban/delete status es gestionado por admin module (002-frontend-admin);
este módulo simplemente refleja la decisión backend. Ambos módulos usan mismo enum
`EstadoCuentaUsuario`.

**Alternativas evaluadas**:
- Mostrar perfil con datos parciales (rechazado: reduce seguridad)

---

## 13. Enums & Value Objects

### RolUsuario (shared with Module 002)
```typescript
enum RolUsuario {
  USER = "USER",
  ADMIN = "ADMIN"
}
```
**Ubicación**: `domain/enums/RolUsuario.ts` (shared across `Union/frontend/` modules)

**Nota**: En este módulo, rol NO condiciona capacidades (Principio VI, §1.3 de spec).
Ambos roles tienen idénticas capacidades sobre perfil propio. Distinciones de rol pertenecen a
módulo 002-frontend-admin.

### EstadoCuentaUsuario (shared with Module 002)
```typescript
enum EstadoCuentaUsuario {
  ACTIVO = "ACTIVO",
  BANEADO = "BANEADO",
  ELIMINADO = "ELIMINADO"
}
```
**Ubicación**: `domain/enums/EstadoCuentaUsuario.ts` (shared across modules)

**Impacto en A10**: Solo cuentas `ACTIVO` pueden tener perfil visible.

### SeguimientoRelacion (New value object for A4)
```typescript
export class SeguimientoRelacion {
  constructor(
    public usuarioId: string,
    public usuarioASeguidoId: string,
    public siguiendo: boolean
  ) {}

  toggle(): SeguimientoRelacion {
    return new SeguimientoRelacion(
      this.usuarioId,
      this.usuarioASeguidoId,
      !this.siguiendo
    );
  }
}
```
**Ubicación**: `domain/SeguimientoRelacion.ts`

---

## 14. API Contract Structure (contracts/openapi.yaml)

La estructura del contrato será:
- `/usuarios/{id}` - GET (obtener perfil, A10)
- `/usuarios/{id}` - PUT (editar datos, A1)
- `/usuarios/{id}/foto` - POST (cambiar foto, A2)
- `/usuarios/{id}/carpetas` - GET (listar carpetas, paginadas A6)
- `/usuarios/{id}/carpetas` - POST (crear carpeta, A3)
- `/usuarios/{id}/carpetas/{carpetaId}` - PUT (renombrar, A3)
- `/usuarios/{id}/carpetas/{carpetaId}` - DELETE (eliminar, A7)
- `/usuarios/{id}/publicaciones` - GET (listar posts propios)
- `/usuarios/{id}/publicaciones/{postId}` - PUT (editar post, A5)
- `/usuarios/{id}/publicaciones/{postId}` - DELETE (eliminar post)
- `/usuarios/{id}/publicaciones/{postId}/carpetas` - POST (guardar post en carpeta, A8)
- `/usuarios/{id}/publicaciones/{postId}/carpetas/{carpetaId}` - DELETE (quitar post de carpeta)
- `/usuarios/{id}/seguimiento/toggle` - POST (seguir/dejar de seguir, A4)

Se documenta en OpenAPI 3.0 con esquemas, ejemplos de request/response, códigos de error (404 para
A10, 409 para A1/A3, 413 para A2, etc.).

---

## Summary Table: Clarifications → Design Decisions

| Clarif. | Original Ambiguity | Resolution | Design Impact |
|---|---|---|---|
| **A1** | Username uniqueness undefined | UNIQUE globally; backend enforces | Error handling in form, confirmation dialog |
| **A2** | Photo format/size undefined | JPG/PNG/WebP, 5 MB max; backend validates | PhotoUploadField component, multipart upload |
| **A3** | Folder name uniqueness undefined | UNIQUE per user; backend enforces | Error handling in create/rename dialogs |
| **A4** | Unfollow action undefined | Bidirectional toggle; optimistic update | FollowButton component, SeguimientoRelacion value object |
| **A5** | Editable post fields undefined | Text only; image immutable | EditPostForm read-only image, Publicacion domain rule |
| **A6** | Pagination responsibility undefined | Server-side; frontend paginates | CarpetaService paginated calls, CarpetaList infinite scroll |
| **A7** | Folder deletion with content undefined | Can delete with warning; posts persist | ConfirmDeleteCarpetaDialog, clear warning message |
| **A8** | Already-saved post behavior undefined | Idempotent; no duplicates; success message | GuardarPostService idempotency logic |
| **A9** | Folder privacy settings undefined | NO feature; all public | No privacidad field in CarpetaPost, no UI controls |
| **A10** | Banned/deleted profile visibility undefined | NOT visible; 404/403; unavailability message | ProfileNotFoundView, conditional rendering in PerfilPage |

---

## Next Steps (after research)

1. **Phase 1**: Generate `data-model.md` with full entity/enum/value object definitions
2. **Phase 1**: Generate `contracts/openapi.yaml` with all endpoints and error codes
3. **Phase 1**: Update `quickstart.md` with end-to-end validation flows
4. **Phase 2+**: `/speckit.tasks` to generate task breakdown

---

**Status**: ✅ RESEARCH COMPLETE
**Ready for Phase 1 (data-model.md generation)**: YES

