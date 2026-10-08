# Tasks: Frontend de Perfil — Gestión de Perfil, Carpetas, Publicaciones Propias y Seguimiento

**Input**:
- `specs/004-inspiraciones-perfil/spec.md`
- `specs/004-inspiraciones-perfil/plan.md`
- `specs/004-inspiraciones-perfil/data-model.md`
- `specs/004-inspiraciones-perfil/contracts/openapi.yaml`
- `specs/004-inspiraciones-perfil/quickstart.md`

**Alcance**: Este documento define únicamente tareas de implementación del **frontend compartido** en
`Union/frontend/` (usuarios y administradores). No se implementa backend, API, MySQL ni lógica
server-side.

**Restricciones aplicadas**:
- No incluir creación de publicaciones.
- Incluir solo: gestión de perfil, carpetas, publicaciones propias (editar/eliminar) y seguimiento.
- Priorizar primero estructura y componentes base de interfaz.
- No ejecutar implementación en esta fase.

**Convenciones**:
- IDs únicos: `T001`, `T002`, `T003`...
- `[P]` = paralelizable (siempre que no comparta archivos con otras `[P]` del mismo bloque).
- Cada tarea incluye archivos concretos y dependencias explícitas.

---

## Fase 1 — Setup del frontend

### T001 [P] — Verificar/crear estructura de carpetas del módulo perfil en presentación
**Archivos**:
- `Union/frontend/src/presentation/perfil/`
- `Union/frontend/src/presentation/carpetas/`
- `Union/frontend/src/presentation/publicaciones/`
- `Union/frontend/src/presentation/seguimiento/`
- `Union/frontend/src/presentation/shared/`
**Descripción**: Crear/normalizar la estructura base de UI por feature según `plan.md`.
**Depende de**: Ninguna.

### T002 [P] — Verificar/crear estructura de carpeta de aplicación para perfil
**Archivos**:
- `Union/frontend/src/application/`
- `Union/frontend/src/application/ports/`
- `Union/frontend/src/application/dto/`
**Descripción**: Preparar estructura de capa application para servicios y contratos.
**Depende de**: Ninguna.

### T003 [P] — Verificar/crear estructura de tests para perfil
**Archivos**:
- `Union/frontend/tests/domain/`
- `Union/frontend/tests/services/`
- `Union/frontend/tests/integration/`
- `Union/frontend/tests/presentation/`
**Descripción**: Asegurar carpetas de test por capa.
**Depende de**: Ninguna.

### T004 [P] — Preparar archivo de variables de entorno ejemplo para módulo perfil
**Archivo**: `Union/frontend/.env.example`
**Descripción**: Agregar variables requeridas para integración frontend con API (base URL, flags de mock).
**Depende de**: Ninguna.

### T005 — Registrar endpoints base del módulo perfil en infraestructura
**Archivo**: `Union/frontend/src/infrastructure/apiEndpoints.ts`
**Descripción**: Definir paths de perfil, carpetas, publicaciones y seguimiento según `openapi.yaml`.
**Depende de**: T004.

### T006 — Revisar exportaciones compartidas de presentación para diálogos de confirmación
**Archivo**: `Union/frontend/src/presentation/shared/index.ts`
**Descripción**: Dejar preparado el barrel para componentes compartidos del módulo.
**Depende de**: T001.

---

## Fase 2 — Modelo de datos y enums

### T007 [P] — Crear/ajustar enum `RolUsuario`
**Archivo**: `Union/frontend/src/domain/enums/RolUsuario.ts`
**Descripción**: Alinear valores `USER`, `ADMIN` y uso rol-agnóstico en módulo perfil.
**Depende de**: T001.

### T008 [P] — Crear/ajustar enum `EstadoCuentaUsuario`
**Archivo**: `Union/frontend/src/domain/enums/EstadoCuentaUsuario.ts`
**Descripción**: Definir `ACTIVO`, `BANEADO`, `ELIMINADO`.
**Depende de**: T001.

### T009 — Ajustar entidad `Usuario` según reglas HU-01/02/03 y A1/A10
**Archivo**: `Union/frontend/src/domain/Usuario.ts`
**Descripción**: Incluir validaciones de username/sobre mí/descripcion y disponibilidad de cuenta.
**Depende de**: T007, T008.

### T010 — Crear entidad de dominio `CarpetaPost`
**Archivo**: `Union/frontend/src/domain/CarpetaPost.ts`
**Descripción**: Modelar carpeta con reglas de nombre (1–15) y operaciones de negocio.
**Depende de**: T001.

### T011 — Ajustar entidad `Publicacion` para edición de texto y bloqueo de imagen (A5)
**Archivo**: `Union/frontend/src/domain/Publicacion.ts`
**Descripción**: Encapsular regla “imagen inmutable, texto editable”.
**Depende de**: T001.

### T012 — Crear value object `SeguimientoRelacion`
**Archivo**: `Union/frontend/src/domain/SeguimientoRelacion.ts`
**Descripción**: Representar estado de seguimiento con toggle inmutable.
**Depende de**: T001.

### T013 [P] — Crear DTO `ResultadoValidacion`
**Archivo**: `Union/frontend/src/application/dto/ResultadoValidacion.ts`
**Descripción**: Tipado reusable para validaciones de formulario.
**Depende de**: T002.

### T014 [P] — Crear DTO `ResultadoCarpetasPaginado`
**Archivo**: `Union/frontend/src/application/dto/ResultadoCarpetasPaginado.ts`
**Descripción**: Tipado de respuesta paginada para HU-08 / A6.
**Depende de**: T002.

### T015 [P] — Crear DTO `ActualizarPerfilPayload`
**Archivo**: `Union/frontend/src/application/dto/ActualizarPerfilPayload.ts`
**Descripción**: Tipar actualización de perfil (username, sobreMi, descripcion).
**Depende de**: T002.

### T016 [P] — Crear DTO `SubirFotoPayload`
**Archivo**: `Union/frontend/src/application/dto/SubirFotoPayload.ts`
**Descripción**: Tipar upload de foto con restricciones A2.
**Depende de**: T002.

---

## Fase 3 — Componentes y estructura de navegación

### T017 — Definir rutas de perfil propio y ajeno
**Archivo**: `Union/frontend/src/routes/AppRoutes.tsx`
**Descripción**: Agregar rutas para `/perfil` y `/perfil/:id`.
**Depende de**: T005.

### T018 — Exportar rutas actualizadas
**Archivo**: `Union/frontend/src/routes/index.ts`
**Descripción**: Asegurar exportaciones de rutas del módulo perfil.
**Depende de**: T017.

### T019 [P] — Crear contenedor de página de perfil
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilPage.tsx`
**Descripción**: Componente root que decide perfil propio vs ajeno.
**Depende de**: T001, T017.

### T020 [P] — Crear vista de perfil propio
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilPropio.tsx`
**Descripción**: Estructura base de datos personales + carpetas + publicaciones.
**Depende de**: T019.

### T021 [P] — Crear vista de perfil ajeno
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: Estructura en modo consulta + seguimiento (sin acciones de edición).
**Depende de**: T019.

### T022 [P] — Crear formulario de edición de perfil
**Archivo**: `Union/frontend/src/presentation/perfil/EditarPerfilForm.tsx`
**Descripción**: Inputs y validaciones de username/sobre mí/descripcion.
**Depende de**: T019, T009, T013.

### T023 [P] — Crear componente de subida de foto
**Archivo**: `Union/frontend/src/presentation/perfil/PhotoUploadField.tsx`
**Descripción**: Input file con restricciones `.jpg/.jpeg/.png/.webp` y 5MB (A2).
**Depende de**: T022.

### T024 [P] — Crear componente lista de carpetas
**Archivo**: `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
**Descripción**: Render de carpeta + postCount y soporte paginado base.
**Depende de**: T010, T014.

### T025 [P] — Crear componente lista de publicaciones de perfil
**Archivo**: `Union/frontend/src/presentation/publicaciones/PublicacionList.tsx`
**Descripción**: Render de publicaciones propias/ajenas con acciones contextuales.
**Depende de**: T011.

### T026 [P] — Crear botón de seguimiento
**Archivo**: `Union/frontend/src/presentation/seguimiento/FollowButton.tsx`
**Descripción**: UI para seguir/dejar de seguir con estados visuales.
**Depende de**: T012, T021.

### T027 [P] — Crear vista de perfil no disponible
**Archivo**: `Union/frontend/src/presentation/perfil/ProfileNotFoundView.tsx`
**Descripción**: Pantalla para 404/403 de usuario baneado/eliminado (A10).
**Depende de**: T021.

### T028 — Conectar `PerfilPage` a las rutas y vistas
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilPage.tsx`
**Descripción**: Resolver lectura de parámetros y composición final de vistas.
**Depende de**: T020, T021, T027.

---

## Fase 4 — Gestión del perfil

### T029 [P] — Crear puerto `UsuarioPerfilRepository`
**Archivo**: `Union/frontend/src/application/ports/UsuarioPerfilRepository.ts`
**Descripción**: Contrato para obtener/editar perfil y subir foto.
**Depende de**: T002.

### T030 [P] — Crear servicio de aplicación `UsuarioPerfilService`
**Archivo**: `Union/frontend/src/application/UsuarioPerfilService.ts`
**Descripción**: Casos de uso HU-01/HU-02/HU-03 con validaciones de dominio.
**Depende de**: T009, T015, T016, T029.

### T031 — Implementar adaptación HTTP de perfil sobre infraestructura existente
**Archivo**: `Union/frontend/src/services/perfilService.ts`
**Descripción**: Integrar endpoints de perfil según `openapi.yaml` y mapear errores (A1/A2/A10).
**Depende de**: T005, T029.

### T032 — Integrar edición de perfil en `EditarPerfilForm`
**Archivo**: `Union/frontend/src/presentation/perfil/EditarPerfilForm.tsx`
**Descripción**: Invocar servicio, mostrar validaciones AC-02.2..AC-02.8 y conservar estado en error.
**Depende de**: T030, T031.

### T033 — Integrar upload de foto en `PhotoUploadField`
**Archivo**: `Union/frontend/src/presentation/perfil/PhotoUploadField.tsx`
**Descripción**: Flujo multipart + manejo de errores 400/413/415.
**Depende de**: T031, T032.

### T034 — Mostrar acciones contextuales en perfil propio/ajeno
**Archivos**:
- `Union/frontend/src/presentation/perfil/PerfilPropio.tsx`
- `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: En propio: botón editar; en ajeno: no mostrar edición.
**Depende de**: T020, T021, T032.

### T035 — Incorporar guardas de visualización por estado de cuenta
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilPage.tsx`
**Descripción**: Redirigir a `ProfileNotFoundView` cuando backend responda 404/403 (A10).
**Depende de**: T027, T031.

---

## Fase 5 — Gestión de carpetas

### T036 [P] — Crear puerto `CarpetaRepository`
**Archivo**: `Union/frontend/src/application/ports/CarpetaRepository.ts`
**Descripción**: Contrato para listar/crear/renombrar/eliminar carpetas y operaciones de guardado.
**Depende de**: T002.

### T037 [P] — Crear servicio de aplicación `CarpetaService`
**Archivo**: `Union/frontend/src/application/CarpetaService.ts`
**Descripción**: Casos de uso HU-05/06/07/08/09/10 + reglas A3/A6/A7/A8.
**Depende de**: T010, T014, T036.

### T038 — Implementar adaptación HTTP de carpetas sobre servicio existente
**Archivo**: `Union/frontend/src/services/carpetaService.ts`
**Descripción**: Consumir endpoints de carpetas y mapear respuestas 409/507.
**Depende de**: T005, T036.

### T039 [P] — Crear diálogo de crear carpeta
**Archivo**: `Union/frontend/src/presentation/carpetas/CreateCarpetaDialog.tsx`
**Descripción**: Flujo HU-05 con validaciones de nombre y límite.
**Depende de**: T024, T013.

### T040 [P] — Crear diálogo de renombrar carpeta
**Archivo**: `Union/frontend/src/presentation/carpetas/RenameCarpetaDialog.tsx`
**Descripción**: Flujo HU-06 con confirmación explícita y validación 1–15 caracteres.
**Depende de**: T024, T013.

### T041 [P] — Crear diálogo de eliminación de carpeta
**Archivo**: `Union/frontend/src/presentation/carpetas/ConfirmDeleteCarpetaDialog.tsx`
**Descripción**: Confirmación con advertencia de pérdida local de guardados (A7).
**Depende de**: T024.

### T042 — Integrar creación de carpeta en lista
**Archivo**: `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
**Descripción**: Conectar `CreateCarpetaDialog` con actualización de listado.
**Depende de**: T037, T038, T039.

### T043 — Integrar renombrado de carpeta en lista
**Archivo**: `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
**Descripción**: Conectar `RenameCarpetaDialog` + refresco de nombre.
**Depende de**: T037, T038, T040.

### T044 — Integrar eliminación de carpeta en lista
**Archivo**: `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
**Descripción**: Conectar `ConfirmDeleteCarpetaDialog` + actualización visual de cupo.
**Depende de**: T037, T038, T041.

### T045 — Implementar paginación server-side de carpetas
**Archivo**: `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
**Descripción**: Cargar por páginas (`limit/offset`) para HU-08 y A6.
**Depende de**: T037, T038, T042.

### T046 — Integrar lista de carpetas en perfil propio y ajeno
**Archivos**:
- `Union/frontend/src/presentation/perfil/PerfilPropio.tsx`
- `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: En propio con acciones; en ajeno solo consulta.
**Depende de**: T042, T043, T044, T045.

---

## Fase 6 — Gestión de publicaciones

### T047 [P] — Crear puerto `PublicacionRepository`
**Archivo**: `Union/frontend/src/application/ports/PublicacionRepository.ts`
**Descripción**: Contrato para listar, editar, eliminar y asociar publicaciones a carpetas.
**Depende de**: T002.

### T048 [P] — Crear servicio de aplicación `PublicacionService`
**Archivo**: `Union/frontend/src/application/PublicacionService.ts`
**Descripción**: Casos de uso HU-09/10/11/12/13, incluyendo A5 y A8.
**Depende de**: T011, T047.

### T049 — Implementar adaptación HTTP de publicaciones sobre servicio existente
**Archivo**: `Union/frontend/src/services/publicacionService.ts`
**Descripción**: Conectar endpoints de publicaciones y errores de actualización/eliminación.
**Depende de**: T005, T047.

### T050 [P] — Crear formulario de edición de post
**Archivo**: `Union/frontend/src/presentation/publicaciones/EditPostForm.tsx`
**Descripción**: Permitir editar solo texto; imagen solo lectura (A5).
**Depende de**: T025, T013.

### T051 [P] — Crear diálogo de confirmación para eliminar post
**Archivo**: `Union/frontend/src/presentation/publicaciones/ConfirmDeletePostDialog.tsx`
**Descripción**: Confirmación explícita para HU-12.
**Depende de**: T025.

### T052 [P] — Crear diálogo guardar post en carpeta
**Archivo**: `Union/frontend/src/presentation/publicaciones/SavePostToCarpetaDialog.tsx`
**Descripción**: Selección de carpeta + creación en flujo HU-09.
**Depende de**: T024, T039.

### T053 — Integrar edición de post en lista de publicaciones
**Archivo**: `Union/frontend/src/presentation/publicaciones/PublicacionList.tsx`
**Descripción**: Conectar `EditPostForm` + actualización en UI.
**Depende de**: T048, T049, T050.

### T054 — Integrar eliminación de post en lista de publicaciones
**Archivo**: `Union/frontend/src/presentation/publicaciones/PublicacionList.tsx`
**Descripción**: Conectar `ConfirmDeletePostDialog` + actualización del listado.
**Depende de**: T048, T049, T051.

### T055 — Integrar guardar post en carpeta con idempotencia
**Archivo**: `Union/frontend/src/presentation/publicaciones/PublicacionList.tsx`
**Descripción**: Conectar `SavePostToCarpetaDialog` y mostrar estado correcto en éxito repetido (A8).
**Depende de**: T048, T049, T052.

### T056 — Integrar quitar post de carpeta
**Archivo**: `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
**Descripción**: Permitir quitar guardado sin borrar publicación original (HU-10).
**Depende de**: T048, T049, T046.

### T057 — Integrar publicaciones en perfil propio y ajeno
**Archivos**:
- `Union/frontend/src/presentation/perfil/PerfilPropio.tsx`
- `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: En propio con editar/eliminar; en ajeno solo visualización.
**Depende de**: T053, T054, T055.

---

## Fase 7 — Visualización de perfiles y seguimiento

### T058 [P] — Crear puerto `SeguimientoRepository`
**Archivo**: `Union/frontend/src/application/ports/SeguimientoRepository.ts`
**Descripción**: Contrato para toggle de seguimiento.
**Depende de**: T002.

### T059 [P] — Crear servicio `SeguimientoService`
**Archivo**: `Union/frontend/src/application/SeguimientoService.ts`
**Descripción**: Encapsular follow/unfollow con estrategia optimistic update + rollback (A4).
**Depende de**: T012, T058.

### T060 — Implementar adaptación HTTP de seguimiento
**Archivo**: `Union/frontend/src/services/busquedaService.ts`
**Descripción**: Incorporar operación de toggle seguimiento o integrar endpoint equivalente existente.
**Depende de**: T005, T058.

### T061 — Integrar `FollowButton` en perfil ajeno
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: Mostrar botón seguir/dejar de seguir y ocultarlo en perfil propio.
**Depende de**: T026, T059, T060.

### T062 — Implementar feedback visual de seguimiento
**Archivo**: `Union/frontend/src/presentation/seguimiento/FollowButton.tsx`
**Descripción**: Estados loading/error/success y rollback ante falla.
**Depende de**: T059, T061.

### T063 — Validar navegación a perfil ajeno desde publicaciones
**Archivo**: `Union/frontend/src/presentation/publicaciones/PublicacionList.tsx`
**Descripción**: Click en foto/username navega a `/perfil/:id` (AC-03.2 y AC-03.3).
**Depende de**: T017, T057.

### T064 — Unificar lógica “propio vs ajeno” en `PerfilPage`
**Archivo**: `Union/frontend/src/presentation/perfil/PerfilPage.tsx`
**Descripción**: Resolver permisos de acciones por contexto, no por rol.
**Depende de**: T034, T061, T063.

---

## Fase 8 — Confirmaciones y estados de acciones

### T065 [P] — Reusar modal compartido para confirmaciones sensibles
**Archivo**: `Union/frontend/src/presentation/shared/ConfirmacionAccionSensibleModal.tsx`
**Descripción**: Estandarizar confirmación para renombrar, eliminar carpeta, editar y eliminar post.
**Depende de**: T006.

### T066 [P] — Crear helper de mensajes de error de perfil
**Archivo**: `Union/frontend/src/presentation/perfil/perfilErrorMessages.ts`
**Descripción**: Centralizar mensajes para A1/A2/A10 y validaciones AC-02.*.
**Depende de**: T032, T033.

### T067 [P] — Crear helper de mensajes de error de carpetas
**Archivo**: `Union/frontend/src/presentation/carpetas/carpetaErrorMessages.ts`
**Descripción**: Centralizar mensajes para A3/A6/A7 y límite 50 carpetas.
**Depende de**: T042, T043, T044.

### T068 [P] — Crear helper de mensajes de error de publicaciones
**Archivo**: `Union/frontend/src/presentation/publicaciones/publicacionErrorMessages.ts`
**Descripción**: Centralizar mensajes para A5/A8 y errores HU-11/HU-12.
**Depende de**: T053, T054, T055.

### T069 — Integrar confirmación explícita en cambio de username
**Archivo**: `Union/frontend/src/presentation/perfil/EditarPerfilForm.tsx`
**Descripción**: Confirmar antes de persistir cambio de nombre (AC-02.6).
**Depende de**: T065, T032.

### T070 — Integrar confirmación explícita en renombrado de carpeta
**Archivo**: `Union/frontend/src/presentation/carpetas/RenameCarpetaDialog.tsx`
**Descripción**: Confirmación previa a ejecutar HU-06.
**Depende de**: T065, T040.

### T071 — Integrar confirmación explícita en eliminación de carpeta
**Archivo**: `Union/frontend/src/presentation/carpetas/ConfirmDeleteCarpetaDialog.tsx`
**Descripción**: Mantener advertencia completa de A7.
**Depende de**: T065, T041.

### T072 — Integrar confirmación explícita en edición de publicación
**Archivo**: `Union/frontend/src/presentation/publicaciones/EditPostForm.tsx`
**Descripción**: Confirmar antes de guardar cambios de texto (HU-11).
**Depende de**: T065, T050.

### T073 — Integrar confirmación explícita en eliminación de publicación
**Archivo**: `Union/frontend/src/presentation/publicaciones/ConfirmDeletePostDialog.tsx`
**Descripción**: Confirmar antes de borrar (HU-12).
**Depende de**: T065, T051.

### T074 — Integrar estados de loading/empty/error en vistas de perfil
**Archivos**:
- `Union/frontend/src/presentation/perfil/PerfilPropio.tsx`
- `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: Homogeneizar estados de UI para cargas y errores de API.
**Depende de**: T066, T064.

### T075 — Integrar estados de loading/empty/error en carpetas/publicaciones
**Archivos**:
- `Union/frontend/src/presentation/carpetas/CarpetaList.tsx`
- `Union/frontend/src/presentation/publicaciones/PublicacionList.tsx`
**Descripción**: Consolidar feedback de interfaz para acciones y listados.
**Depende de**: T067, T068.

---

## Fase 9 — Validación de interfaz según `quickstart.md`

### T076 [P] — Tests de dominio de `Usuario`
**Archivo**: `Union/frontend/tests/domain/Usuario.test.ts`
**Descripción**: Validar reglas de username/sobre mí/descripcion y disponibilidad por estado.
**Depende de**: T009.

### T077 [P] — Tests de dominio de `CarpetaPost`
**Archivo**: `Union/frontend/tests/domain/CarpetaPost.test.ts`
**Descripción**: Validar reglas de nombre y operaciones de carpeta.
**Depende de**: T010.

### T078 [P] — Tests de dominio de `Publicacion`
**Archivo**: `Union/frontend/tests/domain/Publicacion.test.ts`
**Descripción**: Validar edición de texto e inmutabilidad de imagen (A5).
**Depende de**: T011.

### T079 [P] — Tests de dominio de `SeguimientoRelacion`
**Archivo**: `Union/frontend/tests/domain/SeguimientoRelacion.test.ts`
**Descripción**: Validar toggle bidireccional y consistencia de estado.
**Depende de**: T012.

### T080 [P] — Tests de servicio de perfil
**Archivo**: `Union/frontend/tests/services/perfilService.test.ts`
**Descripción**: Cubrir HU-01/02/03 y manejo de errores A1/A2/A10.
**Depende de**: T031, T032, T033, T035.

### T081 [P] — Tests de servicio de carpetas
**Archivo**: `Union/frontend/tests/services/carpetaService.test.ts`
**Descripción**: Cubrir HU-05/06/07/08 y reglas A3/A6/A7.
**Depende de**: T038, T042, T043, T044, T045.

### T082 [P] — Tests de servicio de publicaciones
**Archivo**: `Union/frontend/tests/services/publicacionService.test.ts`
**Descripción**: Cubrir HU-09/10/11/12 y regla A8.
**Depende de**: T049, T053, T054, T055, T056.

### T083 [P] — Tests de servicio de seguimiento
**Archivo**: `Union/frontend/tests/services/seguimientoService.test.ts`
**Descripción**: Cubrir HU-04 con optimistic update y rollback (A4).
**Depende de**: T059, T060, T062.

### T084 — Test de integración flujo perfil propio (quickstart escenarios 1–3)
**Archivo**: `Union/frontend/tests/integration/FlujoPerfilPropio.test.ts`
**Descripción**: Validar visualización + edición de datos + foto con errores de servidor.
**Depende de**: T080, T074.

### T085 — Test de integración flujo perfil ajeno y seguimiento (escenarios 4–5)
**Archivo**: `Union/frontend/tests/integration/FlujoPerfilAjenoSeguimiento.test.ts`
**Descripción**: Validar perfil ajeno, follow/unfollow, estado baneado/eliminado.
**Depende de**: T083, T061, T064.

### T086 — Test de integración flujo carpetas (escenarios 6–8, 12)
**Archivo**: `Union/frontend/tests/integration/FlujoCarpetasPerfil.test.ts`
**Descripción**: Validar crear/renombrar/eliminar, advertencias y paginación.
**Depende de**: T081, T075.

### T087 — Test de integración flujo publicaciones y guardado en carpetas (escenarios 9–11)
**Archivo**: `Union/frontend/tests/integration/FlujoPublicacionesPerfil.test.ts`
**Descripción**: Validar guardar idempotente, editar texto, eliminar publicación y quitar de carpeta.
**Depende de**: T082, T075.

### T088 — Checklist manual de quickstart completo
**Archivo**: `Union/specs/004-inspiraciones-perfil/quickstart.md`
**Descripción**: Ejecutar y marcar validación de los 13 escenarios del quickstart al cierre de implementación.
**Depende de**: T084, T085, T086, T087.

---

## Fase 10 — Revisión final del frontend

### T089 — Revisión de trazabilidad final Spec → Tasks → Tests
**Archivos**:
- `Union/specs/004-inspiraciones-perfil/tasks.md`
- `Union/specs/004-inspiraciones-perfil/spec.md`
- `Union/specs/004-inspiraciones-perfil/quickstart.md`
**Descripción**: Verificar cobertura de HU-01..HU-13, AC, A1–A10 y restricciones de alcance.
**Depende de**: T088.

### T090 — Revisión de cumplimiento de restricciones de alcance
**Archivos**:
- `Union/frontend/src/presentation/`
- `Union/frontend/src/application/`
- `Union/frontend/src/services/`
- `Union/frontend/src/infrastructure/`
**Descripción**: Confirmar ausencia de creación de publicaciones, backend, MySQL o lógica server-side.
**Depende de**: T089.

### T091 — Revisión de consistencia de permisos (rol-agnóstico)
**Archivos**:
- `Union/frontend/src/presentation/perfil/PerfilPage.tsx`
- `Union/frontend/src/presentation/perfil/PerfilPropio.tsx`
- `Union/frontend/src/presentation/perfil/PerfilAjeno.tsx`
**Descripción**: Verificar que permisos dependen de “propio vs ajeno” y no de `USER/ADMIN`.
**Depende de**: T090.

### T092 — Cierre de fase: reporte de estado y pendientes
**Archivo**: `Union/specs/004-inspiraciones-perfil/tasks.md`
**Descripción**: Actualizar estado final de ejecución de tareas en iteración de implementación.
**Depende de**: T091.

---

## Resumen de cobertura

- **Total tareas**: 92
- **Fases**: 10 (según solicitud)
- **Paralelizables `[P]`**: 38
- **Scope cubierto**:
  - ✅ Gestión de perfil
  - ✅ Gestión de carpetas
  - ✅ Gestión de publicaciones propias (editar/eliminar)
  - ✅ Seguimiento de perfiles
  - ✅ Validación por quickstart
- **Scope excluido**:
  - ✅ Creación de publicaciones (excluida)
  - ✅ Backend/API/MySQL (excluidos)
