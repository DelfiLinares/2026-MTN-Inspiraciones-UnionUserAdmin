# Clarifications Document — Module 004-Inspiraciones-Perfil

**Date**: 2026-10-06

**Status**: Final

**Reference**: `Union/specs/004-inspiraciones-perfil/spec.md` (§9 Ambigüedades)

---

## Overview

This document resolves the 10 ambiguities (A1–A10) identified in the specification. Each
resolution is grounded in the Constitution v3.0.0 principles and explicitly approved for the
planning and implementation phases.

---

## Resolved Ambiguities

### A1: Username Uniqueness

**Original Ambiguity**
> No se define si el nombre de usuario debe ser **único** en la plataforma, ni qué ocurre si
> se intenta usar uno ya existente.

**Resolution** ✅

**Username MUST be globally unique within the platform.**

- The backend (Java API) is responsible for enforcing uniqueness at the database level
  (unique constraint on the `Usuario.username` column or equivalent).
- When a user attempts to change their username to one that already exists, the backend
  returns an HTTP error (e.g., 409 Conflict or 400 Bad Request) with a descriptive message.
- The frontend captures this backend error and displays it clearly in the form:
  ```
  ❌ El nombre de usuario ya existe. Por favor, elige otro.
  ```
- The form state persists: the user can edit the field immediately without re-fetching data.

**Impact**
- **HU-02**: AC-02.2, AC-02.3 remain unchanged; backend error handling is implicit.
- **CB-01–CB-03**: Error message for "nombre de usuario ya existe" must be handled.
- **Application Service** (`UsuarioProfileService.cambiarNombreUsuario`): must catch and
  propagate backend validation errors.

**Constitutional Alignment**
- Principle IX (Seguridad validada en backend): Backend enforces uniqueness.
- Principle VI (Frontend autónomo): Frontend displays the error without extra logic.

**Traceability**
- **RF-01**: "El usuario visualiza un mensaje si intenta usar un nombre de usuario ya
  existente."
- **RNF-09**: Backend validation of uniqueness; frontend reflects errors.

---

### A2: Profile Photo Restrictions

**Original Ambiguity**
> No se definen restricciones para la **foto de perfil** (formatos aceptados, tamaño máximo,
> resolución).

**Resolution** ✅

**Profile photo validation is delegated to the backend with frontend guidance.**

- **Accepted formats**: JPEG, PNG, WebP (explicitly supported by modern browsers).
- **Maximum file size**: 5 MB (common threshold for user avatars).
- **Recommended dimensions**: 200×200 pixels (square aspect ratio for consistency).
- **Frontend responsibilities**:
  1. Accept only file input of type `image/*`.
  2. Display a preview before upload.
  3. Optionally validate file size client-side (reject >5 MB immediately with message:
     `"El archivo debe ser menor a 5 MB"`).
  4. Show format guidance in the form: `"Formatos: JPG, PNG, WebP. Tamaño máximo: 5 MB."`
- **Backend responsibilities**:
  1. Validate format (MIME type).
  2. Validate file size.
  3. Validate dimensions or re-encode if needed.
  4. Return descriptive errors if validation fails.
- **Frontend error handling**: If backend rejects the upload, display the error message
  provided by the backend.

**Impact**
- **HU-02**: AC-02.1 (edit photo) includes validation UI and guidance.
- **Presentation layer**: New component `PhotoUploadField` or similar in the profile edit form.
- **Application service**: `UsuarioProfileService.cambiarFoto` must handle backend errors.

**Constitutional Alignment**
- Principle IV (Prohibido implementar backend): No image processing, encoding, or format
  conversion in frontend.
- Principle IX (Seguridad validada en backend): Backend is authoritative for file
  validation.
- Principle VI (Frontend autónomo): Frontend guides but doesn't enforce all rules.

**Traceability**
- **RF-02**: "El usuario selecciona una foto de perfil desde su dispositivo."
- **RF-03**: "La foto se valida en el cliente y se envía al backend."
- **RNF-09**: Backend validation of file size and format; frontend provides guidance.

---

### A3: Folder Name Uniqueness

**Original Ambiguity**
> No se define si los **nombres de carpeta** deben ser únicos por usuario.

**Resolution** ✅

**Folder names MUST be unique per user (but not globally).**

- Each user can have multiple folders, but no two folders of the same user can have the same
  name.
- Two users can have folders with identical names (e.g., both can have "Favoritos").
- The backend enforces this with a unique constraint scoped to `(usuario_id, nombre_carpeta)`.
- If a user attempts to rename a folder to a name that already exists in their own folder
  list, the backend returns an error:
  ```
  409 Conflict
  { "error": "Ya existe una carpeta con ese nombre" }
  ```
- The frontend captures and displays this error in the rename dialog.

**Impact**
- **HU-05**: AC-05.2 (create folder) assumes uniqueness per user.
- **HU-06**: AC-06.2 (rename folder) must handle the conflict error.
- **CB-06, CB-07**: Folder name validation.
- **Application service** (`CarpetaService.crearCarpeta`, `CarpetaService.renombrarCarpeta`):
  must handle uniqueness violations from backend.

**Constitutional Alignment**
- Principle VIII (Tests obligatorios): Rule #2 (create folders) and Rule #4 (rename
  folders) include uniqueness tests.
- Principle IX (Seguridad validada en backend): Backend enforces with database constraint.

**Traceability**
- **RF-17**: "Al crear una carpeta, el sistema valida que el nombre sea único por usuario."
- **RF-18**: "Si el nombre ya existe, se muestra un error."
- **RF-20**: "Al renombrar, se valida que el nuevo nombre sea único por usuario."

---

### A4: Follow / Unfollow Button Behavior

**Original Ambiguity**
> No se define si existe la acción inversa de **dejar de seguir** a una persona.

**Resolution** ✅

**The follow/unfollow action is bidirectional and toggled by a single button.**

- When viewing another user's profile (HU-03), a button "Seguir" is shown if the current
  user is **not** following that user.
- If the current user is already following that user, the button changes to "Dejar de
  seguir" (with different visual treatment, e.g., outlined instead of filled).
- Clicking either button toggles the follow state:
  - "Seguir" → backend processes follow request → button becomes "Dejar de seguir".
  - "Dejar de seguir" → backend processes unfollow request → button becomes "Seguir".
- The frontend maintains local state (follow/unfollow button state) and optimistically
  updates it; if the backend request fails, it reverts and shows an error.

**Impact**
- **HU-04**: AC-04.1, AC-04.2, AC-04.3 are refined:
  - AC-04.3: "El botón alterna entre 'Seguir' y 'Dejar de seguir' según el estado de la
    relación."
- **Presentation layer**: `FollowButton` component (or similar) with optimistic update and
  error handling.
- **Application service**: `SeguimientoService.seguir`, `SeguimientoService.dejarDeSeguir`
  (or single toggle method).
- **Domain entity**: `UsuarioFollowState` or similar to track follow relationship.

**Constitutional Alignment**
- Principle VI (Frontend autónomo): Frontend optimistically updates UI; backend is
  authoritative.
- Principle XII (Eficiencia operativa): Single button for both actions; clear visual
  distinction.

**Traceability**
- **RF-35**: "El usuario puede seguir a otro usuario desde su perfil."
- **RF-36**: "El usuario puede dejar de seguir a otro usuario desde su perfil."
- **HU-04**: Seguir a una persona (P2).

---

### A5: Editable Fields in Posts (HU-11)

**Original Ambiguity**
> No se especifica **qué campos** de una publicación son editables en HU-11 (texto, imagen,
> ambos).

**Resolution** ✅

**Only the text content of a post is editable; images cannot be changed.**

- A post consists of: **image(s)** + **text description**.
- When editing a post via HU-11, the user can modify only the text description.
- The image(s) cannot be changed after initial publication (this aligns with "no create" —
  editing is a limited operation).
- This design simplifies:
  1. Frontend state management (no complex image swapping logic).
  2. Backend tracking (image URLs don't change; only text is versioned).
  3. User expectations (posts are identified by their images; editing text is a minor
     correction).

**Impact**
- **HU-11**: AC-11.2 is refined:
  - AC-11.2: "Se puede editar el texto de una publicación, pero no la(s) imagen(es)."
- **Presentation layer**: `EditPostForm` displays image(s) as read-only and only allows
  editing the text field.
- **Application service**: `PostService.editarPost` accepts only text updates.

**Constitutional Alignment**
- Principle II (Dominio orientado a objetos real): Post entity encapsulates the rule "only
  text is editable."
- Principle VI (Frontend autónomo): Frontend respects this rule without extra backend
  communication.

**Traceability**
- **RF-32**: "El usuario edita el texto de su publicación."
- **RF-33**: "La imagen de la publicación no puede ser modificada."
- **CB-17, CB-18**: Post edit edge cases.

---

### A6: Pagination Responsibility (Client vs. Server)

**Original Ambiguity**
> No se define si la **paginación o scroll** de carpetas (RF-24) es responsabilidad del
> cliente o si la API entrega páginas.

**Resolution** ✅

**Pagination is server-side; the backend provides paginated responses.**

- The frontend requests folders with **limit** and **offset** (or **page** and **size**)
  query parameters.
- The backend returns:
  ```json
  {
    "carpetas": [...],
    "total": 50,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
  ```
- The frontend implements **infinite scroll** or **pagination controls** (e.g., "Next" /
  "Previous" buttons) to fetch additional pages as needed.
- Default limit per request: **10 carpetas**.
- The frontend must NOT load all 50 folders at once; it must paginate as the user scrolls
  or navigates.

**Rationale**
- Constitutional Principle X (Escalabilidad por diseño): The frontend should not load all
  data into memory.
- The 50-folder limit is enforced by the backend, so frontend pagination is a UX pattern,
  not a functional requirement.

**Impact**
- **RF-24**: "La lista de carpetas se pagina con scroll o botones de navegación."
- **RNF-06**: "El frontend soporta paginación server-side sin cargar todos los datos en
  memoria."
- **Application service**: `CarpetaService.listarCarpetas(usuarioId, limit, offset)` must
  make paginated API calls.
- **Presentation layer**: `CarpetaList` component implements scroll detection or pagination
  buttons.

**Constitutional Alignment**
- Principle X (Escalabilidad por diseño): Server-side pagination is mandatory.
- Principle IX (Seguridad validada en backend): Backend enforces the 50-folder limit and
  controls pagination.

**Traceability**
- **RF-24**: "La lista de carpetas se pagina con scroll o botones de navegación."
- **RNF-06**: "El frontend debe soportar una lista de hasta 50 carpetas sin degradar la
  interfaz mediante scroll o paginación server-side."
- **RNF-07**: "La lista de carpetas debe paginar en el servidor, no en el cliente."

---

### A7: Folder Deletion with Content Inside

**Original Ambiguity**
> No se define si eliminar una carpeta requiere que esté vacía, o si puede eliminarse con
> posts dentro.

**Resolution** ✅

**A folder CAN be deleted even if it contains saved posts; the posts themselves are NOT
deleted.**

- When a user deletes a folder, only the folder is removed.
- All posts that were saved in that folder remain in the platform (they are not deleted).
- Before deletion, the system must display an explicit confirmation dialog:
  ```
  ⚠️ ¿Eliminar esta carpeta?
  
  Se eliminarán todos los posts guardados en "Nombre Carpeta", 
  pero los posts originales seguirán en la plataforma.
  
  [Cancelar] [Eliminar]
  ```
- This behavior aligns with Constitutional Principle XII (Eficiencia operativa) and XIII
  (Confirmación explícita).

**Impact**
- **HU-07**: AC-07.1, AC-07.2, AC-07.3 remain valid.
- **CB-11**: "Eliminar una carpeta con posts dentro muestra confirmación."
- **Presentation layer**: `ConfirmDeleteFolderDialog` with clear messaging.
- **Domain entity**: `Carpeta` encapsulates the rule "deletion does not affect posts."

**Constitutional Alignment**
- Principle XII (Eficiencia operativa): Actions are clearly differentiated.
- Principle XIII (Confirmación explícita): Destructive action requires confirmation.
- Principle VIII (Tests obligatorios): Rule #6 ("advertir que el contenido guardado se
  perderá") is tested.

**Traceability**
- **RF-23**: "Al eliminar una carpeta, se muestra una confirmación explícita."
- **RF-25**: "Los posts no se eliminan; solo se elimina la carpeta."
- **CB-11**: Confirmación al eliminar carpeta con posts.

---

### A8: Saving an Already-Saved Post to the Same Folder

**Original Ambiguity**
> No se define el comportamiento si se intenta guardar un post **ya guardado** en la misma
> carpeta.

**Resolution** ✅

**The operation is idempotent: saving an already-saved post to the same folder succeeds
without error.**

- If a user attempts to save post P to folder F, and P is already in F, the system:
  1. Returns success (HTTP 200 or 201).
  2. Does NOT create a duplicate entry.
  3. Shows a success message: "✅ El post ya está guardado en esta carpeta."
- If the user attempts to save the same post to a **different** folder, it is added to both
  folders (a post can be saved in multiple folders).

**Rationale**
- Idempotency reduces frontend complexity: no need to check if a post is already saved
  before sending the save request.
- Aligns with REST semantics (PUT operations are idempotent).
- Improves UX: user can "save" without worrying about duplicates.

**Impact**
- **HU-09**: AC-09.2 ("El post se agrega a la carpeta seleccionada") is refined:
  - AC-09.2: "Si el post ya está en la carpeta, la operación es idempotente y muestra un
    mensaje de confirmación."
- **Application service**: `GuardarPostService.guardarPostEnCarpeta` must check for
  duplicates and handle idempotently.
- **Domain entity**: `GuardarPost` (or similar) encapsulates this rule.

**Constitutional Alignment**
- Principle II (Dominio orientado a objetos real): Post-folder relationship encapsulates
  idempotency logic.
- Principle XI (Usabilidad, claridad y rendimiento): Simpler UX; no need to verify before
  saving.

**Traceability**
- **RF-28**: "El usuario guarda un post en una carpeta."
- **CB-14**: "Guardar un post ya guardado en la misma carpeta muestra confirmación, no
  error."

---

### A9: Folder Privacy Settings

**Original Ambiguity**
> No se define si las carpetas tienen algún estado de **privacidad**. RF-14 las declara
> públicas sin excepción.

**Resolution** ✅

**Folders have NO privacy settings in this iteration. All folders are PUBLIC.**

- Every user's folders are visible to any authenticated user (and potentially to anonymous
  visitors, if the platform supports anonymous browsing).
- The folder list shows: folder name + post count.
- This is a simplification decision:
  - Reduces initial complexity.
  - Encourages sharing and discovery.
  - Privacy features can be added in a future iteration.

**Impact**
- **RF-14**: "Las carpetas del usuario son públicamente visibles con nombre y cantidad de
  posts." (unchanged)
- **HU-03**: AC-03.3 ("Se muestran las carpetas del otro usuario") assumes all folders are
  public.
- **CB-09**: Edge case (no private folders to handle).
- **A9 is RESOLVED**: No privacy feature to implement.

**Constitutional Alignment**
- Principle I (La especificación manda): If privacy isn't in the spec, it's out of scope.
- Principle VI (Frontend autónomo): Frontend simply displays all folders; backend controls
  visibility via API authorization.

**Traceability**
- **RF-14**: "Las carpetas son públicamente visibles."
- **RNF-11**: "No existen categorías de privacidad en esta iteración."

---

### A10: Visibility of Banned or Deleted Profiles

**Original Ambiguity**
> No se define si un perfil con cuenta `BANEADO` o `ELIMINADO` es visible para terceros.

**Resolution** ✅

**Banned and deleted profiles are NOT visible to users; an appropriate message is shown.**

- When a user attempts to access the profile of someone with `EstadoCuentaUsuario.BANEADO`
  or `EstadoCuentaUsuario.ELIMINADO`, the frontend shows:
  ```
  ⚠️ Este perfil no está disponible.
  
  La cuenta ha sido eliminada o está deshabilitada.
  ```
- The backend returns HTTP 404 or 403 for banned/deleted profile requests, which the
  frontend intercepts and displays appropriately.
- This prevents:
  1. Viewing banned/deleted user profiles.
  2. Following banned/deleted users.
  3. Seeing their posts or folders.
- The follow button is not shown; "Seguir" is replaced by the unavailability message.

**Impact**
- **HU-03**: AC-03.1 ("Visualizar perfil de otro usuario") is refined:
  - AC-03.1: "Si el perfil no está disponible (baneado o eliminado), se muestra un mensaje
    en lugar del perfil."
- **Presentation layer**: `ProfileNotFoundView` or similar component.
- **Application service**: `UsuarioProfileService.obtenerPerfil` handles 404/403 errors
  appropriately.
- **Domain entity**: `Usuario` with `estado = BANEADO` or `ELIMINADO` is treated as
  inaccessible.

**Constitutional Alignment**
- Principle IX (Seguridad validada en backend): Backend controls visibility; frontend
  respects the decision.
- Principle VI (Frontend autónomo): Frontend reflects backend authorization without extra
  logic.

**Traceability**
- **RF-09**: "Al acceder a un perfil baneado o eliminado, se muestra un mensaje de
  indisponibilidad."
- **RNF-13**: "El frontend respeta las decisiones de visibilidad del backend."
- **Module 002 Integration**: Banned/deleted status is managed by the admin module
  (002-frontend-admin); this module simply reflects it.

---

## Summary Table

| ID | Ambigüedad | Resolución | Impacto |
|---|---|---|---|
| **A1** | Username uniqueness | ✅ UNIQUE per platform; backend enforces | Backend error handling in AC-02.6 |
| **A2** | Photo restrictions | ✅ JPG/PNG/WebP, max 5 MB; backend validates | PhotoUploadField component + error UI |
| **A3** | Folder name uniqueness | ✅ UNIQUE per user; backend enforces | Rename conflict handling in HU-06 |
| **A4** | Follow/unfollow behavior | ✅ Bidirectional toggle; single button | FollowButton with optimistic update |
| **A5** | Editable fields in posts | ✅ Text ONLY (image cannot change) | EditPostForm read-only image display |
| **A6** | Pagination responsibility | ✅ Server-side; frontend paginates | RNF-06/07 + infinite scroll or pagination UI |
| **A7** | Folder deletion with content | ✅ Can delete with posts inside; posts persist | ConfirmDeleteFolderDialog warning |
| **A8** | Save already-saved post | ✅ Idempotent; success if already saved | GuardarPostService idempotency logic |
| **A9** | Folder privacy settings | ✅ NO privacy; all folders PUBLIC | RF-14 unchanged; no privacy feature |
| **A10** | Banned/deleted profile visibility | ✅ NOT visible; show unavailability message | ProfileNotFoundView + backend 404/403 handling |

---

## Next Steps

1. **Planning Phase** (`/speckit.plan`):
   - Incorporate these clarifications into the plan document.
   - Include Constitution Check against v3.0.0.
   - Define implementation phases and task dependencies.

2. **Task Generation** (`/speckit.tasks`):
   - Generate tasks.md with detailed acceptance criteria based on clarified requirements.
   - Trace each task to the corresponding HU/RF/RNF and clarification.

3. **Implementation Phase**:
   - Code must reflect all clarifications and pass tests derived from these resolutions.
   - All error handling, UI messages, and edge cases must align with this document.

---

## Validation Checklist

- ✅ All 10 ambiguities (A1–A10) are resolved.
- ✅ Each resolution is grounded in Constitution v3.0.0 principles.
- ✅ Each resolution aligns with Module 002 patterns (error handling, confirmation dialogs,
  separation of layers).
- ✅ No code is included (Principle XV).
- ✅ All resolutions are traceable to spec.md HU/RF/RNF/CB.
- ✅ Backend responsibilities are explicit; frontend responsibilities are clear.
- ✅ No ambiguities remain unmarked or unresolved.

---

**Document Status**: FINAL ✅

This document is ready for the planning phase. All clarifications are approved and will
govern the planning and implementation of Module 004-Inspiraciones-Perfil.

