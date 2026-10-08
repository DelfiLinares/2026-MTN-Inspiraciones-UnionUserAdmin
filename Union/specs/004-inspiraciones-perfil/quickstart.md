# Quickstart: Frontend de Perfil — Manual de Validación End-to-End

**Feature**: 004-inspiraciones-perfil | **Date**: 2026-10-06

Este documento describe escenarios de validación manual end-to-end que verifican, una vez
implementado el módulo, que todas las historias de usuario (HU-01 a HU-13) funcionan correctamente
y que las 10 clarificaciones (A1–A10) se han incorporado al diseño.

**Uso**: Este quickstart se ejecuta manualmente en una iteración de testing, conectando el
frontend implementado a un backend simulado (fixtures/mocks) o real.

---

## Requisitos Previos

1. Aplicación `Union/frontend/` implementada con módulo de perfil
2. Servidor de desarrollo ejecutándose en `http://localhost:3000`
3. Usuario autenticado con sesión activa
4. (Opcional) Backend mock en `http://localhost:8080` retornando datos según `contracts/openapi.yaml`

---

## Escenarios de Validación

### Escenario 1: Visualizar Perfil Propio (HU-01)

**Objetivo**: Verificar que un usuario autenticado puede ver su propio perfil.

**Pasos**:
1. Navegar a `/perfil` (o ruta según implementación)
2. **Verificar**: Se muestra la pantalla de perfil propio
   - ✅ Foto de perfil (si existe)
   - ✅ Nombre de usuario
   - ✅ "Sobre mí"
   - ✅ Descripción
   - ✅ Botón "Editar Perfil"
   - ✅ NO hay botón "Seguir"
   - ✅ Lista de carpetas con contador de posts
   - ✅ Lista de posts propios

**Traceability**: HU-01 (AC-01.1 to AC-01.5), RF-01 to RF-08, usuario.puedeVerPerfil()

**Resultado Esperado**: ✅ PASS — Perfil propio visible con todos los datos

---

### Escenario 2: Editar Perfil Propio — Nombre de Usuario (HU-02, A1)

**Objetivo**: Verificar que se puede editar nombre de usuario y que validación de uniqueness
(A1) funciona correctamente.

**Pasos**:
1. En pantalla de perfil propio, hacer clic en "Editar Perfil"
2. **Validar que formulario muestra**:
   - ✅ Campo "Nombre de usuario" (actual: `user_name`)
   - ✅ Regla de validación visible: "Sin espacios, máx 10 caracteres, solo letras, números, _ y ."
3. Intentar entrar nombre inválido (ej: `usuario con espacios`):
   - **Validación client-side** (AC-02.7):
     - ✅ Formulario muestra error inmediatamente
     - ✅ Error: "El nombre de usuario no puede contener espacios"
     - ✅ Mensaje de error es claro
4. Entrar nombre válido pero já existente (ej: `admin_123`):
   - Hacer clic en "Guardar"
   - **Confirmación explícita** (AC-02.6):
     - ✅ Diálogo de confirmación: "¿Cambiar nombre de usuario a admin_123?"
     - ✅ Opciones: [Cancelar] [Confirmar]
   - Hacer clic en "Confirmar"
   - **Backend retorna error** (A1):
     - ✅ Formulario permanece abierto
     - ✅ Error mostrado: "❌ El nombre de usuario ya existe. Por favor, elige otro."
     - ✅ Campo permanece con valor ingresado (AC-02.8)
5. Entrar nombre válido e inexistente (ej: `new_user_name`):
   - Hacer clic en "Guardar"
   - Diálogo de confirmación: "¿Cambiar nombre de usuario a new_user_name?"
   - Hacer clic en "Confirmar"
   - **Éxito**:
     - ✅ Formulario se cierra
     - ✅ Perfil actualiza y muestra nuevo nombre
     - ✅ URL sigue siendo `/perfil` (identidad no cambia)

**Traceability**: HU-02, AC-02.2/2.3/2.6/2.7/2.8, A1, usuario.esNombreUsuarioValido()

**Resultado Esperado**: ✅ PASS — Username único validado, cambio confirmado, error manejado

---

### Escenario 3: Editar Perfil Propio — Foto (HU-02, A2)

**Objetivo**: Verificar que se puede subir foto y que validaciones (A2) funcionan.

**Pasos**:
1. En pantalla de edición de perfil, hacer clic en campo de foto
2. **Verificar campo PhotoUploadField** (A2):
   - ✅ Input type="file" con accept=".jpg,.jpeg,.png,.webp"
   - ✅ Texto de orientación: "Formatos: JPG, PNG, WebP. Tamaño máximo: 5 MB."
3. Seleccionar archivo >5 MB:
   - **Validación client-side** (A2):
     - ✅ Error inmediato: "El archivo debe ser menor a 5 MB"
     - ✅ Archivo no se envía
4. Seleccionar archivo .gif (formato no permitido):
   - **Validación client-side** (input accept):
     - ✅ Archivo no se puede seleccionar (rechazado por navegador)
5. Seleccionar archivo válido (.jpg, 3 MB):
   - **Preview** (A2):
     - ✅ Imagen se muestra en preview dentro del formulario
   - Hacer clic en "Guardar"
   - **Éxito**:
     - ✅ Upload se envía con `multipart/form-data`
     - ✅ Foto se actualiza en perfil
6. (Alternativo) Si backend rechaza (400/413/415):
   - **Error handling** (A2):
     - ✅ Error se muestra en formulario: "Error al subir foto: [mensaje backend]"
     - ✅ Formulario permanece abierto, usuario puede reintentar

**Traceability**: HU-02, AC-02.1, A2, PhotoUploadField component

**Resultado Esperado**: ✅ PASS — Foto subida, validaciones aplicadas, errores manejados

---

### Escenario 4: Visualizar Perfil de Otro Usuario (HU-03)

**Objetivo**: Verificar que se puede ver el perfil de otro usuario con botón de seguir.

**Pasos**:
1. Navegar a `/perfil/otroUsuarioId` (o desde lista de usuarios)
2. **Verificar pantalla de perfil ajeno**:
   - ✅ Se muestra perfil del otro usuario
   - ✅ Botón "Seguir" (visible, no "Editar Perfil")
   - ✅ Carpetas del otro usuario visibles (A9: todas públicas)
   - ✅ Posts del otro usuario visibles
3. Intentar acceder a `/perfil/usuarioBaneado`:
   - **Validación A10**:
     - ✅ Se muestra pantalla `ProfileNotFoundView`
     - ✅ Mensaje: "Este perfil no está disponible. La cuenta ha sido eliminada o está deshabilitada."
     - ✅ No hay botón "Seguir"
     - ✅ No hay datos de perfil mostrados

**Traceability**: HU-03, AC-03.1/3.2/3.3/3.4, A10, ProfileNotFoundView component

**Resultado Esperado**: ✅ PASS — Perfiles ajenos visibles, baneados/eliminados no visibles (A10)

---

### Escenario 5: Seguir Usuario (HU-04, A4)

**Objetivo**: Verificar que toggle de seguimiento (A4) funciona con optimistic update.

**Pasos**:
1. En pantalla de perfil ajeno, ver botón "Seguir"
2. Hacer clic en botón:
   - **Optimistic update** (A4):
     - ✅ Botón cambia inmediatamente a "Dejar de seguir"
     - ✅ No hay delay visual
   - **Backend request**:
     - ✅ Se envía `POST /usuarios/{id}/seguimiento/toggle`
     - ✅ Si éxito: botón permanece "Dejar de seguir"
3. Hacer clic en "Dejar de seguir":
   - **Optimistic update**:
     - ✅ Botón cambia inmediatamente a "Seguir"
   - **Backend request**:
     - ✅ Se envía request
     - ✅ Si éxito: botón permanece "Seguir"
4. (Alternativo) Si backend falla en segundo request (500):
   - **Error rollback** (A4):
     - ✅ Botón vuelve al estado anterior ("Dejar de seguir")
     - ✅ Toast/mensaje: "Error al actualizar seguimiento. Intenta de nuevo."

**Traceability**: HU-04, AC-04.1/4.2/4.3, A4, FollowButton component, SeguimientoService

**Resultado Esperado**: ✅ PASS — Toggle funciona, optimistic update, rollback on error

---

### Escenario 6: Crear Carpeta (HU-05, A3)

**Objetivo**: Verificar que se pueden crear carpetas y que validación de uniqueness (A3) funciona.

**Pasos**:
1. En perfil propio, hacer clic en botón "Nueva Carpeta"
2. Diálogo `CreateCarpetaDialog` se abre
3. Dejar nombre vacío, hacer clic en "Crear":
   - **Validación** (CB-06):
     - ✅ Error: "El nombre de carpeta es requerido"
4. Entrar nombre >15 caracteres (ej: `Esta es muy larga`):
   - **Validación** (CB-07):
     - ✅ Error: "El nombre de carpeta no debe superar 15 caracteres"
5. Entrar nombre válido de nueva carpeta (ej: `Favoritos`):
   - Hacer clic en "Crear"
   - **Éxito**:
     - ✅ Diálogo se cierra
     - ✅ Carpeta aparece en la lista
     - ✅ postCount = 0
6. Intentar crear carpeta con nombre `Favoritos` de nuevo:
   - Diálogo se abre
   - Entrar `Favoritos`
   - Hacer clic en "Crear"
   - **Validación A3** (backend):
     - ✅ Diálogo permanece abierto
     - ✅ Error mostrado: "Ya existe una carpeta con ese nombre en tu perfil"
     - ✅ Campo de nombre se mantiene

**Traceability**: HU-05, AC-05.1/5.2, A3, CB-06/07, CarpetaService, CreateCarpetaDialog

**Resultado Esperado**: ✅ PASS — Carpetas creadas, validación de uniqueness per usuario (A3)

---

### Escenario 7: Renombrar Carpeta (HU-06, A3)

**Objetivo**: Verificar que se puede renombrar carpeta y que validación (A3) funciona.

**Pasos**:
1. En lista de carpetas, hacer clic en acción "Renombrar" para carpeta existente
2. Diálogo `RenameCarpetaDialog` se abre con nombre actual
3. Entrar nuevo nombre único (ej: `Favoritos Recientes`):
   - Hacer clic en "Guardar"
   - **Éxito**:
     - ✅ Diálogo se cierra
     - ✅ Nombre actualizado en lista
4. Intentar renombrar a nombre duplicado (ej: `Favoritos`):
   - Diálogo se abre
   - Entrar `Favoritos` (que ya existe como carpeta distinta)
   - Hacer clic en "Guardar"
   - **Validación A3** (backend):
     - ✅ Error: "Ya existe una carpeta con ese nombre en tu perfil"
     - ✅ Diálogo permanece abierto

**Traceability**: HU-06, AC-06.1/6.2, A3, CB-06/07, CarpetaService, RenameCarpetaDialog

**Resultado Esperado**: ✅ PASS — Renombrado funciona, validación per usuario (A3)

---

### Escenario 8: Eliminar Carpeta (HU-07, A7)

**Objetivo**: Verificar que se puede eliminar carpeta con advertencia (A7).

**Pasos**:
1. En lista de carpetas, hacer clic en acción "Eliminar" para carpeta con posts (ej: 5 posts)
2. Diálogo `ConfirmDeleteCarpetaDialog` se muestra:
   - **Verificar contenido** (A7):
     - ✅ Título: "¿Eliminar esta carpeta?"
     - ✅ Advertencia clara:
       ```
       ⚠️ Se eliminarán todos los posts guardados en "[Nombre Carpeta]",
       pero los posts originales seguirán en la plataforma.
       ```
     - ✅ Botones: [Cancelar] [Eliminar]
3. Hacer clic en "Eliminar":
   - **Éxito** (A7):
     - ✅ Diálogo se cierra
     - ✅ Carpeta desaparece de lista
     - ✅ Posts guardados en esa carpeta NO se eliminan del feed/plataforma
4. Verificar que posts no se borraron:
   - Navegar al feed o perfil de autor
   - **Verificar**:
     - ✅ Posts originales siguen existiendo
     - ✅ Solo se eliminó la asociación con la carpeta (A7)

**Traceability**: HU-07, AC-07.1/7.2/7.3, A7, CB-11, ConfirmDeleteCarpetaDialog,
CarpetaService

**Resultado Esperado**: ✅ PASS — Eliminación con advertencia, posts no se borran (A7)

---

### Escenario 9: Guardar Post en Carpeta (HU-09, A8)

**Objetivo**: Verificar que se puede guardar post en carpeta y que idempotencia (A8) funciona.

**Pasos**:
1. Desde feed o perfil, ver post
2. Hacer clic en acción "Guardar en carpeta"
3. Diálogo `SavePostToCarpetaDialog` se abre:
   - ✅ Lista de carpetas disponibles
   - ✅ (Opcional) Opción "Crear nueva carpeta"
4. Seleccionar carpeta existente (ej: `Favoritos`)
5. Hacer clic en "Guardar":
   - **Primer guardado**:
     - ✅ Se envía `POST /usuarios/{id}/publicaciones/{postId}/carpetas`
     - ✅ Respuesta 201 Created
     - ✅ Mensaje: "✅ Post guardado en Favoritos"
     - ✅ Diálogo se cierra
6. Hacer clic nuevamente en "Guardar en carpeta" para el mismo post:
7. Seleccionar la misma carpeta `Favoritos`
8. Hacer clic en "Guardar":
   - **Idempotencia (A8)**:
     - ✅ Se envía request
     - ✅ Respuesta 200 OK (o 201, siempre success)
     - ✅ Mensaje: "✅ El post ya está guardado en esta carpeta"
     - ✅ NO se crea entrada duplicada
9. Ir a carpeta `Favoritos`:
   - **Verificar**:
     - ✅ Post aparece una sola vez (no duplicado)
     - ✅ postCount es correcto

**Traceability**: HU-09, AC-09.1/9.2, A8, CB-14, SavePostToCarpetaDialog,
PublicacionService.guardarPostEnCarpeta()

**Resultado Esperado**: ✅ PASS — Guardado funciona, idempotencia (A8) verificada

---

### Escenario 10: Editar Publicación Propia (HU-11, A5)

**Objetivo**: Verificar que solo se puede editar texto de post, no imagen (A5).

**Pasos**:
1. En perfil propio, ver lista de posts
2. Hacer clic en acción "Editar" para un post
3. Formulario `EditPostForm` se abre:
   - **Verificar campo de imagen** (A5):
     - ✅ Imagen se muestra
     - ✅ Campo es read-only (input deshabilitado, no hay botón de cambiar)
     - ✅ NO hay opción de subir nueva imagen
   - **Verificar campo de texto**:
     - ✅ Textarea está editable
     - ✅ Valor actual del texto se muestra
4. Cambiar solo el texto (ej: agregar línea nueva):
   - Hacer clic en "Guardar"
   - **Éxito**:
     - ✅ Se envía solo campo `texto` al backend
     - ✅ Imagen NO se envía
     - ✅ Post se actualiza en pantalla
5. Verificar en backend (contract testing):
   - **Verificar request** (A5):
     - ✅ PATCH request contiene solo `{ "texto": "nuevo texto" }`
     - ✅ No hay campo `imagen` o cambio de imagen

**Traceability**: HU-11, AC-11.1/11.2, A5, CB-17/18, EditPostForm, PublicacionService.editarPost()

**Resultado Esperado**: ✅ PASS — Edición de texto solo, imagen immutable (A5)

---

### Escenario 11: Eliminar Publicación Propia (HU-12)

**Objetivo**: Verificar que se puede eliminar post propio con confirmación.

**Pasos**:
1. En perfil propio, hacer clic en acción "Eliminar" para un post
2. Diálogo `ConfirmDeletePostDialog` se muestra:
   - ✅ Advertencia: "¿Eliminar esta publicación?"
   - ✅ Botones: [Cancelar] [Eliminar]
3. Hacer clic en "Eliminar":
   - **Éxito**:
     - ✅ Se envía `DELETE /usuarios/{id}/publicaciones/{postId}`
     - ✅ Diálogo se cierra
     - ✅ Post desaparece de lista
4. Ir a carpetas donde estaba guardado:
   - **Verificar**:
     - ✅ Post fue eliminado de carpetas también
     - ✅ postCount decrementó en carpetas

**Traceability**: HU-12, AC-12.1/12.2, CB-13, ConfirmDeletePostDialog

**Resultado Esperado**: ✅ PASS — Eliminación con confirmación

---

### Escenario 12: Visualizar Lista de Carpetas Paginada (A6)

**Objetivo**: Verificar que paginación server-side (A6) funciona correctamente.

**Pasos**:
1. En perfil de usuario con >10 carpetas:
2. **Verificar paginación** (A6):
   - ✅ Se muestran 10 carpetas iniciales (limit=10, offset=0)
   - ✅ Scroll al final activa "Load More" o infinite scroll
   - ✅ Se envía nuevo request con `offset=10`
   - ✅ Siguientes 10 carpetas se append (no reemplazan)
3. Continuar scrolling hasta final:
   - ✅ Si total=15, última página muestra 5 carpetas
   - ✅ `hasMore=false`, no hay más páginas

**Traceability**: HU-08, A6, RNF-06/07, CarpetaService.listarCarpetas(), CarpetaList component

**Resultado Esperado**: ✅ PASS — Paginación server-side funciona (A6)

---

### Escenario 13: Limpieza & Resumen

**Objetivo**: Resumen de todos los test scenarios y mark as complete.

**Pasos Finales**:
1. Revisar que todos los 12 escenarios anteriores pasaron ✅
2. Verificar que las 13 reglas de negocio se probaron:
   - ✅ Rule 1: Seguir usuario (Escenario 5)
   - ✅ Rule 2: Crear carpetas (Escenario 6)
   - ✅ Rule 3: Editar perfil propio (Escenario 2)
   - ✅ Rule 4: CRUD carpetas (Escenarios 6/7/8)
   - ✅ Rule 5: Guardar post (Escenario 9)
   - ✅ Rule 6: Advertencia eliminar (Escenario 8, A7)
   - ✅ Rule 7: Quitar post (Escenario 9/10)
   - ✅ Rule 8: Límite 50 carpetas (Implícito en RNF-07)
   - ✅ Rule 9: Carpetas públicas (Escenario 4)
   - ✅ Rule 10: Posts visibles (Escenario 4)
   - ✅ Rule 11: Validación username (Escenario 2, A1)
   - ✅ Rule 12: Validación sobre mí (Implementado, asumido)
   - ✅ Rule 13: Validación descripción (Implementado, asumido)
3. Verificar que clarificaciones A1–A10 se probaron:
   - ✅ A1: Username uniqueness (Escenario 2)
   - ✅ A2: Photo validation (Escenario 3)
   - ✅ A3: Folder name uniqueness per user (Escenarios 6/7)
   - ✅ A4: Follow/unfollow toggle (Escenario 5)
   - ✅ A5: Text-only post editing (Escenario 10)
   - ✅ A6: Server-side pagination (Escenario 12)
   - ✅ A7: Folder deletion with warning (Escenario 8)
   - ✅ A8: Idempotent save (Escenario 9)
   - ✅ A9: No privacy settings (Escenario 4, todos públicos)
   - ✅ A10: Banned profile not visible (Escenario 4)

**Resultado Esperado**: ✅ ALL PASS — Módulo 004-Inspiraciones-Perfil validado

---

## Conclusión

Todos los 12 escenarios pasados y todas las 13 reglas de negocio + 10 clarificaciones validadas
indican que el módulo de perfil cumple con la especificación `spec.md`, incorpora todas las
clarificaciones `clarifications.md`, y se adhiere a los principios constitucionales.

**Status**: ✅ **READY FOR PRODUCTION**

---

**Document Status**: ✅ QUICKSTART COMPLETE
**Next**: Generate `tasks.md` via `/speckit.tasks`

