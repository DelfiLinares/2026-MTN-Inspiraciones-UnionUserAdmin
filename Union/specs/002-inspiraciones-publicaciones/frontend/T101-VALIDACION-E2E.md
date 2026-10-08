# T101 — Validación End-to-End (Fase 10)

**Objetivo**: Verificar que un usuario `USER` puede crear, editar y borrar una publicación con confirmación explícita.

**Requisitos**: 
- API real disponible (`VITE_USE_MOCKS=false`, `VITE_API_URL` apuntando al backend Java).
- Usuario autenticado con rol `USER`.
- Completadas T001-T100 (Fases 1-9).

**Dependencias**: T099 (integración con API real).

---

## Checklist de Validación Manual

### Punto 1: Crear publicación

1. Abre la app de usuario: `npm run dev -w apps/usuario`
2. Navega a `/publicaciones/nueva` (página "Crear publicación")
3. Completa el formulario:
   - **Título**: "Inspiración 01"
   - **Descripción**: "Esta es mi primera publicación de prueba"
   - **Archivo**: sube una imagen o video (formato válido, tamaño < límite)
4. Haz clic en "Crear"
5. **Validación**:
   - ✅ Redirección a página de detalle (`/publicaciones/{id}`)
   - ✅ Título y descripción visibles
   - ✅ Archivo (imagen/video) cargado correctamente
   - ✅ Contador de likes = 0
   - ✅ Botones disponibles: "Editar", "Borrar", "Reportar" (NO aparece botón "Like")

---

### Punto 2: Editar publicación

1. En la página de detalle, haz clic en "Editar"
2. Navega a página de edición (`/publicaciones/{id}/editar`)
3. **Validación**: 
   - ✅ Formulario precargado con datos actuales
4. Modifica:
   - **Título**: "Inspiración 01 — Actualizada"
   - **Descripción**: "Cambié la descripción"
5. Haz clic en "Guardar cambios"
6. **Validación**:
   - ✅ Redirección a detalle
   - ✅ Título y descripción nuevas visibles
   - ✅ Sin errores de red (si API falla, ver mensaje claro)

---

### Punto 3: Borrar publicación con confirmación

1. En página de detalle, haz clic en "Borrar"
2. **Validación**:
   - ✅ Aparece diálogo de confirmación
   - ✅ Texto: "¿Está seguro que desea borrar esta publicación? Esta acción es irreversible."
   - ✅ Botones: "Borrar" (color rojo/destructivo) y "Cancelar"
3. Haz clic en "Borrar"
4. **Validación**:
   - ✅ Diálogo desaparece
   - ✅ Redirección a `/mis-publicaciones` (lista de mis publicaciones)
   - ✅ Publicación NO aparece en la lista
   - ✅ Si hay mensaje de éxito, es visible y desaparece tras 3-5 segundos

---

## Validaciones adicionales (cobertura de HU-01, HU-02, HU-03)

### HU-01: Crear publicación
- ✅ Validación de campos obligatorios (título, descripción, archivo)
- ✅ Validación de tamaño de archivo (< límite, RF-02)
- ✅ Validación de formato (IMAGEN, VIDEO, AUDIO; RF-02)
- ✅ Mensajes de error por campo si falla

### HU-02: Editar publicación
- ✅ Solo el autor puede editar (RF-06)
- ✅ Si accedes con otro usuario a `/publicaciones/{id}/editar`, recibe 403
- ✅ Cambios se guardan inmediatamente en servidor

### HU-03: Borrar publicación
- ✅ Diálogo de confirmación explícita (RF-28)
- ✅ Solo el autor puede borrar (RF-06)
- ✅ Si accedes con otro usuario, botón "Borrar" NO aparece
- ✅ Tras borrar, publicación eliminada (disponible=false en BD)

---

## Casos borde (Fase 8, pero validables aquí)

- [ ] **Editar y borrar en sesión paralela**: abre otra pestaña, modifica publicación en la otra, vuelve a la primera. ¿Se revalida? (T089)
- [ ] **Red caída durante borrado**: falla la solicitud, diálogo revierte, se muestra mensaje de error, opción de reintentar. (D-10, T090)
- [ ] **409 Duplicado**: si intentas crear con mismo título/contenido inmediatamente, ¿qué ocurre? (T091)
- [ ] **401 Sesión expirada**: si se expira sesión durante edición, ¿se conserva borrador? (T092)

---

## Criterios de aceptación

| Criterio | Validación |
|----------|-----------|
| **Crear** | Formulario válido → redirect a detalle, datos visibles, sin errores |
| **Editar** | Cambios se guardan, datos reflejan en detalle, solo autor puede hacerlo |
| **Borrar** | Diálogo explícito, confirmación requerida, solo autor, publicación eliminada tras confirmar |
| **Permisos** | RF-06 (solo autor), RF-28 (confirmación visible), RF-01 a RF-05 (validación) |
| **Mensajes** | RF-28 (visibles, en español, claros) |
| **Red** | D-10, D-11 (errores revertidos y recuperables) |

---

## Notas

- **Testeo automatizado**: ya cubierto por T082 (`GestionPublicacion.test.tsx`, 43 tests).
- **Testeo E2E manual**: este checklist (T101).
- **Integración API real**: depende de T099 (backend Java disponible).

**Resultado**: marca los ✅ según valides cada punto. Si todos pasan, **Checkpoint F10 alcanzado** para HU-01/HU-02/HU-03.
