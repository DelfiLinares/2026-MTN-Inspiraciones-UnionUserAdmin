# Tareas — 003 Desafíos (Frontend)

**Entradas**: `spec.md`, `plan.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`
**Base de rutas**: `frontend/` del monorepo de 002 (supuesto S-01). Tarea bloqueante: T001.
**Naturaleza**: solo frontend. No se crea código en esta fase de planificación de tareas.

---

## Convenciones

- **ID**: T001 a T103, únicos y en orden de ejecución.
- **[P]**: paralelizable con otras tareas [P] de la misma fase, siempre que sus dependencias estén completas y no compartan archivos.
- **[BLOQUEADA: X]**: no puede completarse hasta resolver el pendiente X (ver `data-model.md`, sección 9, y `plan.md`, sección 6).
- **[EXTERNA]**: depende de la API Java, fuera de esta iteración.
- Rutas sin prefijo de base son relativas a `frontend/`.

## Decisiones de alcance

- **Sin MSW**. Los mocks de API son el adaptador en memoria detrás de `DesafiosPort` (constitución 003, principio 4). La petición inicial excluye incluso mocks de servidor, por lo que no hay tareas MSW.
- **Actualizaciones optimistas**: solo en acciones no destructivas y tras decidir P-04 (T045). Eliminar y editar desafíos no usan optimistas (`research.md`, sección 3).
- **Fase 9 y fase 10 con API**: la fase 9 es [EXTERNA] y no se ejecuta en esta iteración.
- **Ubicación del código compartido**: `packages/shared/src/desafios/` (dominio, aplicación, infraestructura, hooks y componentes comunes). Cada app solo contiene su capa de funcionalidad en `apps/<app>/src/features/desafios/`.

---

## Fase 1 — Setup del frontend

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T001 | | Verificar el monorepo de 002: raíz con scripts `dev:usuario`, `dev:admin`, `test`; apps y paquete compartido. Bloqueante si no existe. | frontend/package.json, frontend/apps/usuario/package.json, frontend/apps/admin/package.json, frontend/packages/shared/package.json | — |
| T002 | [P] | Configurar proyectos de Vitest llamados `shared`, `usuario` y `admin` (requeridos por `quickstart.md`, sección 4). | frontend/vitest.workspace.ts, frontend/packages/shared/vitest.config.ts, frontend/apps/usuario/vitest.config.ts, frontend/apps/admin/vitest.config.ts | T001 |
| T003 | [P] | Definir `VITE_DESAFIOS_ADAPTER=memoria` como ejemplo en cada app y excluir `.env.local` del control de versiones. | frontend/apps/usuario/.env.example, frontend/apps/admin/.env.example, frontend/.gitignore | T001 |
| T004 | [P] | Crear el esqueleto de carpetas del módulo con sus archivos barrel vacíos. | frontend/packages/shared/src/desafios/domain/index.ts, frontend/packages/shared/src/desafios/application/ports/index.ts, frontend/packages/shared/src/desafios/application/usecases/index.ts, frontend/packages/shared/src/desafios/infrastructure/index.ts, frontend/packages/shared/src/desafios/hooks/index.ts, frontend/packages/shared/src/desafios/components/index.ts, frontend/packages/shared/src/desafios/index.ts, frontend/apps/usuario/src/features/desafios/index.ts, frontend/apps/admin/src/features/desafios/index.ts | T001 |
| T005 | [P] | Confirmar que `RolUsuario` está exportado desde el paquete compartido para reutilizarlo sin redefinirlo. | frontend/packages/shared/src/domain/enums.ts, frontend/packages/shared/src/index.ts | T001 |
| T006 | [P] | Confirmar que los componentes y servicios reutilizados de 002 están exportados: `httpClient`, `errores`, `ConfirmDialog`, `useBorradorFormulario`, `EstadosGlobales`, `Estados`, `Medio`. | frontend/packages/shared/src/services/httpClient.ts, frontend/packages/shared/src/services/errores.ts, frontend/packages/shared/src/components/ConfirmDialog.tsx, frontend/packages/shared/src/hooks/useBorradorFormulario.ts, frontend/packages/shared/src/index.ts | T001 |

---

## Fase 2 — Tipos y funciones puras de dominio (permisos y validaciones)

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T007 | [P] | Enums `EstadoDesafio` (con `ELIMINADO`), `EstadoSolicitudDesafio` y `TipoFiltroDesafio`. | frontend/packages/shared/src/desafios/domain/enums/EstadoDesafio.ts, frontend/packages/shared/src/desafios/domain/enums/EstadoSolicitudDesafio.ts, frontend/packages/shared/src/desafios/domain/enums/TipoFiltroDesafio.ts | T004 |
| T008 | | Value object `RangoFechas`: invariante fin posterior a inicio y `estado(ahora, { finInclusivo })`. El parámetro `finInclusivo` deja abierto A-16. | frontend/packages/shared/src/desafios/domain/RangoFechas.ts | T007 |
| T009 | [P] | Value object `AmbitoDesafio`: valor no vacío. Sin lista cerrada; el catálogo llega de la API (A-02). | frontend/packages/shared/src/desafios/domain/AmbitoDesafio.ts | T004 |
| T010 | [P] | Value object `Foto`: formato `JPEG` o `PNG` y marca de principal. | frontend/packages/shared/src/desafios/domain/Foto.ts | T004 |
| T011 | [P] | Objeto de sesión actual: `usuarioId` y `rol` (`RolUsuario`). | frontend/packages/shared/src/desafios/domain/SesionActual.ts | T005 |
| T012 | [P] | Errores de dominio: `ErrorValidacion` (con campos), `TransicionInvalida`, `PermisoDenegado`. | frontend/packages/shared/src/desafios/domain/errores/ErroresDominio.ts | T004 |
| T013 | | Entidad `Desafio`: `estado`, `puedeEditarPor`, `puedeEliminarPor`, `requiereConfirmacionEdicion`, `aceptaRespuestas`, `marcarEliminado` y `validar` (1 a 5 fotos con exactamente una principal, al menos un ámbito, nombre, descripción, fechas). | frontend/packages/shared/src/desafios/domain/entidades/Desafio.ts | T008, T009, T010, T011, T012 |
| T014 | | Entidad `SolicitudDesafio`: `aprobar` y `rechazar` solo desde `PENDIENTE`, `puedeEditarPor`, `puedeEliminarPor` (aplica la regla de A-04 desde una sola constante) y `estaResuelta`. | frontend/packages/shared/src/desafios/domain/entidades/SolicitudDesafio.ts | T007, T011, T012 |
| T015 | [P] | Entidad `RespuestaDesafio`: `puedeEditarPor` solo para el autor (nunca ADMIN) y `puedeEliminarPor` para el autor o ADMIN. | frontend/packages/shared/src/desafios/domain/entidades/RespuestaDesafio.ts | T011, T012 |
| T016 | [P] | Pruebas unitarias de `RangoFechas`: fin posterior a inicio, estados por fecha y frontera de `finInclusivo` (ambos valores). | frontend/packages/shared/src/desafios/domain/RangoFechas.test.ts | T008 |
| T017 | [P] | Pruebas unitarias de `Desafio`: validación de fotos (1 a 5, JPEG o PNG), ámbitos, permisos de ADMIN, `requiereConfirmacionEdicion` y `aceptaRespuestas`. | frontend/packages/shared/src/desafios/domain/entidades/Desafio.test.ts | T013 |
| T018 | [P] | Pruebas unitarias de `SolicitudDesafio`: transiciones válidas e inválidas (CB-06), permisos de autor y ADMIN. | frontend/packages/shared/src/desafios/domain/entidades/SolicitudDesafio.test.ts | T014 |
| T019 | [P] | Pruebas unitarias de `RespuestaDesafio`: el autor edita, el admin no edita, el autor o el admin eliminan (RF-13, RF-14). | frontend/packages/shared/src/desafios/domain/entidades/RespuestaDesafio.test.ts | T015 |
| T020 | | Barrel del dominio con todas las exportaciones. | frontend/packages/shared/src/desafios/domain/index.ts | T008, T009, T010, T011, T012, T013, T014, T015 |

---

## Fase 3 — Capa de servicios, cliente HTTP y mocks de API (adaptador en memoria)

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T021 | | Puerto `DesafiosPort` con las 16 operaciones del modelo de datos (lectura, escritura, solicitudes y respuestas). | frontend/packages/shared/src/desafios/application/ports/DesafiosPort.ts | T020 |
| T022 | [P] | Tipos de paginación por cursor (`cursor`, `limite`, `items`, `siguienteCursor`) y DTO de lectura. | frontend/packages/shared/src/desafios/application/ports/tiposDesafios.ts | T020 |
| T023 | [P] | Casos de uso de lectura: `ListarDesafios`, `ObtenerDesafio`, `ListarAmbitos`, `ListarSolicitudes`, `ListarRespuestas`. | frontend/packages/shared/src/desafios/application/usecases/lectura/ListarDesafios.ts, frontend/packages/shared/src/desafios/application/usecases/lectura/ObtenerDesafio.ts, frontend/packages/shared/src/desafios/application/usecases/lectura/ListarAmbitos.ts, frontend/packages/shared/src/desafios/application/usecases/lectura/ListarSolicitudes.ts, frontend/packages/shared/src/desafios/application/usecases/lectura/ListarRespuestas.ts | T021, T022 |
| T024 | [P] | Casos de uso de desafío: `PublicarDesafio`, `EditarDesafio`, `EliminarDesafio`. | frontend/packages/shared/src/desafios/application/usecases/desafios/PublicarDesafio.ts, frontend/packages/shared/src/desafios/application/usecases/desafios/EditarDesafio.ts, frontend/packages/shared/src/desafios/application/usecases/desafios/EliminarDesafio.ts | T021, T013 |
| T025 | [P] | Casos de uso de solicitud: `ProponerSolicitud`, `EditarSolicitud`, `EliminarSolicitud`, `AprobarSolicitud`, `RechazarSolicitud`. | frontend/packages/shared/src/desafios/application/usecases/solicitudes/ProponerSolicitud.ts, frontend/packages/shared/src/desafios/application/usecases/solicitudes/EditarSolicitud.ts, frontend/packages/shared/src/desafios/application/usecases/solicitudes/EliminarSolicitud.ts, frontend/packages/shared/src/desafios/application/usecases/solicitudes/AprobarSolicitud.ts, frontend/packages/shared/src/desafios/application/usecases/solicitudes/RechazarSolicitud.ts | T021, T014 |
| T026 | [P] | Casos de uso de respuesta: `ResponderDesafio`, `EditarRespuesta`, `EliminarRespuesta`. | frontend/packages/shared/src/desafios/application/usecases/respuestas/ResponderDesafio.ts, frontend/packages/shared/src/desafios/application/usecases/respuestas/EditarRespuesta.ts, frontend/packages/shared/src/desafios/application/usecases/respuestas/EliminarRespuesta.ts | T021, T015 |
| T027 | | Adaptador en memoria `InMemoryDesafiosAdapter` que implementa `DesafiosPort`: paginación por cursor, filtros, control de `version` (CB-02) y errores 404 para eliminados (CB-01). | frontend/packages/shared/src/desafios/infrastructure/memoria/InMemoryDesafiosAdapter.ts | T021, T013, T014, T015, T022 |
| T028 | [P] | Datos de ejemplo del adaptador en memoria. Los ámbitos son provisionales hasta resolver A-02 y se marcan como tales en el archivo. | frontend/packages/shared/src/desafios/infrastructure/memoria/datosEjemplo.ts | T021, T009 |
| T029 | | Adaptador HTTP `HttpDesafiosAdapter` que implementa `DesafiosPort` sobre `httpClient`, con rutas de `openapi.yaml`, `If-Match` y envío multipart para desafíos (P-01, P-04). | frontend/packages/shared/src/desafios/infrastructure/http/HttpDesafiosAdapter.ts | T021, T022, T006 |
| T030 | | Mapeo de errores HTTP (400, 401, 403, 404, 409 de transición y 409 de versión) a errores de dominio y de aplicación. | frontend/packages/shared/src/desafios/infrastructure/http/mapearErrorDesafios.ts | T029, T012 |
| T031 | | Selector de adaptador según `VITE_DESAFIOS_ADAPTER` (por defecto `memoria`). | frontend/packages/shared/src/desafios/infrastructure/crearAdaptadorDesafios.ts | T027, T029, T003 |
| T032 | [P] | Pruebas del adaptador en memoria contra el contrato del puerto: paginación, filtros, permisos, 404 de eliminados. | frontend/packages/shared/src/desafios/infrastructure/memoria/InMemoryDesafiosAdapter.test.ts | T027, T028 |
| T033 | [P] | Pruebas del adaptador HTTP con `httpClient` sustituido por una función de prueba (sin servidor ni MSW): rutas, cabeceras y mapeo de errores. | frontend/packages/shared/src/desafios/infrastructure/http/HttpDesafiosAdapter.test.ts | T029, T030 |
| T034 | | Barrel del módulo compartido: puerto, casos de uso, adaptadores, entidades y selector. | frontend/packages/shared/src/desafios/index.ts | T023, T024, T025, T026, T027, T029, T031 |
| T035 | [P] | Sesiones simuladas `USER` y `ADMIN` para el modo en memoria, sin credenciales reales. | frontend/packages/shared/src/desafios/infrastructure/memoria/sesionesSimuladas.ts | T027, T011 |

---

## Fase 4 — Hooks de casos de uso (estado de servidor y actualizaciones optimistas)

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T036 | | Proveedor `DesafiosProvider` e `useDesafiosPort` para inyectar el adaptador en las dos apps. | frontend/packages/shared/src/desafios/hooks/DesafiosProvider.tsx, frontend/packages/shared/src/desafios/hooks/useDesafiosPort.ts | T034 |
| T037 | [P] | Claves de consulta: `['desafios', filtros]`, `['desafio', id]`, `['solicitudes', filtros]`, `['respuestas', desafioId]`, `['ambitos']`. | frontend/packages/shared/src/desafios/hooks/clavesDesafios.ts | T034 |
| T038 | [P] | Configuración de consultas: 2 reintentos en GET, 0 en mutaciones, `staleTime` corto y refetch al volver a la ventana (CB-05). | frontend/packages/shared/src/desafios/hooks/configuracionConsultas.ts | T001 |
| T039 | [P] | Consultas: `useListarDesafios` (`useInfiniteQuery`), `useObtenerDesafio`, `useListarAmbitos`. | frontend/packages/shared/src/desafios/hooks/useListarDesafios.ts, frontend/packages/shared/src/desafios/hooks/useObtenerDesafio.ts, frontend/packages/shared/src/desafios/hooks/useListarAmbitos.ts | T036, T037, T038, T023 |
| T040 | [P] | Consultas: `useListarSolicitudes` y `useListarRespuestas` (`useInfiniteQuery`). | frontend/packages/shared/src/desafios/hooks/useListarSolicitudes.ts, frontend/packages/shared/src/desafios/hooks/useListarRespuestas.ts | T036, T037, T038, T023 |
| T041 | [P] | Mutaciones de desafío: publicar, editar y eliminar. Invalidan claves y no usan optimistas. | frontend/packages/shared/src/desafios/hooks/useMutacionesDesafio.ts | T036, T037, T038, T024 |
| T042 | [P] | Mutaciones de solicitud: proponer, editar, eliminar, aprobar y rechazar. | frontend/packages/shared/src/desafios/hooks/useMutacionesSolicitud.ts | T036, T037, T025 |
| T043 | [P] | Mutaciones de respuesta: responder, editar y eliminar. | frontend/packages/shared/src/desafios/hooks/useMutacionesRespuesta.ts | T036, T037, T026 |
| T044 | | Pruebas de hooks con `QueryClient` y adaptador en memoria: invalidación tras mutación, paginación y reintentos. | frontend/packages/shared/src/desafios/hooks/useListarDesafios.test.tsx, frontend/packages/shared/src/desafios/hooks/useMutacionesDesafio.test.tsx | T039, T040, T041, T042, T043, T027, T028 |
| T045 | | Actualizaciones optimistas en editar solicitud propia y editar respuesta, con rollback. Solo acciones no destructivas. [BLOQUEADA: P-04] | frontend/packages/shared/src/desafios/hooks/useMutacionesSolicitud.ts, frontend/packages/shared/src/desafios/hooks/useMutacionesRespuesta.ts | T042, T043, P-04 |

---

## Fase 5 — Componentes reutilizables de UI

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T046 | [P] | `EstadoDesafioBadge`: estado con texto y clase visual, no solo color (RNF-01). | frontend/packages/shared/src/desafios/components/EstadoDesafioBadge.tsx | T007 |
| T047 | [P] | `TarjetaDesafio`: nombre, foto principal, ámbitos, fechas y estado. | frontend/packages/shared/src/desafios/components/TarjetaDesafio.tsx | T046 |
| T048 | [P] | `FiltrosDesafio`: ámbito en selección múltiple y estado. El filtro por fecha queda fuera hasta resolver A-14. | frontend/packages/shared/src/desafios/components/FiltrosDesafio.tsx | T039, T007, T009 |
| T049 | [P] | `GaleriaFotos` para el detalle, con carga diferida de imágenes. | frontend/packages/shared/src/desafios/components/GaleriaFotos.tsx | T010 |
| T050 | [P] | `ListadoPaginado`: botón o scroll de carga progresiva, con estados de cargando, vacío y error. | frontend/packages/shared/src/desafios/components/ListadoPaginado.tsx | T036 |
| T051 | [P] | `SelectorFotos`: 1 a 5 fotos, JPEG o PNG, mensajes por campo. | frontend/packages/shared/src/desafios/components/SelectorFotos.tsx | T010, T009 |
| T052 | [P] | `ConfirmarAccionDestructiva`: envoltorio de `ConfirmDialog` con variante de peligro y textos por caso. | frontend/packages/shared/src/desafios/components/ConfirmarAccionDestructiva.tsx | T006 |
| T053 | [P] | `FormularioDesafio`: nombre, descripción, fotos, fechas y ámbitos. Muestra los errores de `Desafio.validar`. Los límites de nombre y descripción quedan provisionales hasta A-11. | frontend/packages/shared/src/desafios/components/FormularioDesafio.tsx | T013, T008, T009, T051 |
| T054 | [P] | `FormularioSolicitud`. [BLOQUEADA: A-08] (campos de la solicitud sin definir). | frontend/packages/shared/src/desafios/components/FormularioSolicitud.tsx | T014 |
| T055 | [P] | `FormularioRespuesta`. [BLOQUEADA: A-22] (formato del contenido sin definir). | frontend/packages/shared/src/desafios/components/FormularioRespuesta.tsx | T015 |
| T056 | [P] | `ListaRespuestas`: autor, contenido y acciones según los permisos de la entidad, sin lógica propia. | frontend/packages/shared/src/desafios/components/ListaRespuestas.tsx | T040, T015 |

---

## Fase 6 — Pantallas y rutas

### 6.1 App de usuario

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T057 | [P] | `ListadoDesafiosPage`: filtros reflejados en la URL, carga progresiva y estado vacío con opción de limpiar (HU-09, HU-10). | frontend/apps/usuario/src/features/desafios/listado/ListadoDesafiosPage.tsx | T039, T047, T048, T050 |
| T058 | [P] | `DetalleDesafioPage`: fotos, descripción, ámbitos, fechas, estado, respuestas. Muestra "no disponible" ante 404 (CB-01). | frontend/apps/usuario/src/features/desafios/detalle/DetalleDesafioPage.tsx | T039, T049, T056, T046 |
| T059 | [P] | `MisSolicitudesPage`: solo las solicitudes propias con su estado (HU-05, HU-08). | frontend/apps/usuario/src/features/desafios/solicitudes/MisSolicitudesPage.tsx | T040, T046 |
| T060 | [P] | `NuevaSolicitudPage`. [BLOQUEADA: A-08] | frontend/apps/usuario/src/features/desafios/solicitudes/NuevaSolicitudPage.tsx | T054 |
| T061 | [P] | `RespuestasDesafioSection`: una respuesta por usuario, solo con desafío `ACTIVO`, editar y eliminar propias. [BLOQUEADA: A-22] | frontend/apps/usuario/src/features/desafios/respuestas/RespuestasDesafioSection.tsx | T043, T056, T055 |
| T068 | | Rutas de usuario: `/desafios`, `/desafios/:desafioId`, `/desafios/mis-solicitudes`, `/desafios/solicitar`. Protegidas por sesión (RF-24, A-18). | frontend/apps/usuario/src/features/desafios/rutas.tsx, frontend/apps/usuario/src/App.tsx | T057, T058, T059, T060, T061 |

### 6.2 App de administración

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T062 | [P] | `PublicarDesafioPage` (solo ADMIN) con `FormularioDesafio` (HU-01). | frontend/apps/admin/src/features/desafios/publicar/PublicarDesafioPage.tsx | T053, T041 |
| T063 | [P] | `EditarDesafioPage`: confirmación si el desafío está `ACTIVO` o tiene respuestas (HU-02, CB-02). | frontend/apps/admin/src/features/desafios/editar/EditarDesafioPage.tsx | T053, T041, T052 |
| T064 | [P] | `ListadoDesafiosAdminPage`: acciones de editar y eliminar con confirmación (HU-03). | frontend/apps/admin/src/features/desafios/listado/ListadoDesafiosAdminPage.tsx | T039, T041, T052 |
| T065 | [P] | `BandejaSolicitudesPage`: solicitudes `PENDIENTE` paginadas, aprobar y rechazar. Muestra CB-03 y CB-06 (HU-06). | frontend/apps/admin/src/features/desafios/solicitudes/BandejaSolicitudesPage.tsx | T040, T042 |
| T066 | [P] | `DetalleSolicitudAdminPage`: editar y eliminar cualquier solicitud con confirmación (HU-07). | frontend/apps/admin/src/features/desafios/solicitudes/DetalleSolicitudAdminPage.tsx | T042, T052 |
| T067 | [P] | `ModeracionRespuestasSection`: solo eliminar, nunca editar (HU-16, RF-14). | frontend/apps/admin/src/features/desafios/respuestas/ModeracionRespuestasSection.tsx | T040, T043, T052 |
| T069 | | Rutas de administración: `/desafios`, `/desafios/nuevo`, `/desafios/:desafioId/editar`, `/solicitudes`, `/solicitudes/:solicitudId`. Protegidas por rol ADMIN. | frontend/apps/admin/src/features/desafios/rutas.tsx, frontend/apps/admin/src/App.tsx | T062, T063, T064, T065, T066, T067, T035 |

---

## Fase 7 — Estados globales, manejo de errores, accesibilidad y performance

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T070 | | `MensajeErrorDesafio`: 400 por campo, 401 con retorno a acceso, 403 "permiso denegado", 404 "no disponible", 409 de conflicto o transición (CB-02, CB-06, CB-07). | frontend/packages/shared/src/desafios/components/MensajeErrorDesafio.tsx | T030, T012 |
| T071 | [P] | Conservación del borrador ante sesión caducada en los tres formularios (CB-08). Los formularios de solicitud y respuesta quedan [BLOQUEADA: A-08 y A-22]. | frontend/packages/shared/src/desafios/components/FormularioDesafio.tsx, frontend/packages/shared/src/desafios/components/FormularioSolicitud.tsx, frontend/packages/shared/src/desafios/components/FormularioRespuesta.tsx | T053, T054, T055, T006 |
| T072 | [P] | Estados globales: vacío (CB-09, HU-10), cargando y error de red, con los de `EstadosGlobales` de 002. | frontend/packages/shared/src/desafios/components/EstadoVacioDesafios.tsx | T050, T070 |
| T073 | [P] | Accesibilidad de componentes: foco en diálogos, `aria-live` para errores, etiquetas en filtros, tarjetas operables con teclado, texto además de color. | frontend/packages/shared/src/desafios/components/TarjetaDesafio.tsx, frontend/packages/shared/src/desafios/components/ConfirmarAccionDestructiva.tsx, frontend/packages/shared/src/desafios/components/FiltrosDesafio.tsx, frontend/packages/shared/src/desafios/components/EstadoDesafioBadge.tsx | T046, T047, T048, T052 |
| T074 | [P] | Rendimiento: sin filtrado en memoria, `React.memo` en tarjetas, carga diferida de imágenes y refetch controlado. El objetivo medible queda pendiente de A-15. | frontend/packages/shared/src/desafios/components/TarjetaDesafio.tsx, frontend/packages/shared/src/desafios/hooks/configuracionConsultas.ts | T038, T047, T039 |

---

## Fase 8 — Tests de componentes y de páginas

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T075 | [P] | Pruebas de `EstadoDesafioBadge` y `TarjetaDesafio`: texto del estado y datos mostrados. | frontend/packages/shared/src/desafios/components/EstadoDesafioBadge.test.tsx, frontend/packages/shared/src/desafios/components/TarjetaDesafio.test.tsx | T046, T047 |
| T076 | [P] | Pruebas de `FiltrosDesafio`: sincronización con la URL y limpieza de filtros (HU-10). | frontend/packages/shared/src/desafios/components/FiltrosDesafio.test.tsx | T048 |
| T077 | [P] | Pruebas de `FormularioDesafio`: validación por campo, fin posterior a inicio, formato de foto y ámbito vacío (RF-02 a RF-04). | frontend/packages/shared/src/desafios/components/FormularioDesafio.test.tsx | T053 |
| T078 | [P] | Pruebas de `EditarDesafioPage`: confirmación al editar un desafío activo o con respuestas (RF-22). | frontend/apps/admin/src/features/desafios/editar/EditarDesafioPage.test.tsx | T063, T052 |
| T079 | [P] | Pruebas de `ListadoDesafiosPage`: filtros, carga progresiva, estado vacío y acceso sin sesión (RF-24). | frontend/apps/usuario/src/features/desafios/listado/ListadoDesafiosPage.test.tsx | T057 |
| T080 | [P] | Pruebas de `DetalleDesafioPage`: 404 como "no disponible" (CB-01), sin acción de responder si no está `ACTIVO`, estado vacío de respuestas (CB-09). | frontend/apps/usuario/src/features/desafios/detalle/DetalleDesafioPage.test.tsx | T058 |
| T081 | [P] | Pruebas de `MisSolicitudesPage`: solo se ven las solicitudes propias (RF-10). | frontend/apps/usuario/src/features/desafios/solicitudes/MisSolicitudesPage.test.tsx | T059 |
| T082 | [P] | Pruebas de `BandejaSolicitudesPage`: aprobar y rechazar, mensajes de CB-03 y CB-06. | frontend/apps/admin/src/features/desafios/solicitudes/BandejaSolicitudesPage.test.tsx | T065, T066 |
| T083 | [P] | Pruebas de `RespuestasDesafioSection`: una respuesta por usuario, solo con desafío `ACTIVO`, no editar respuestas ajenas (CB-07). | frontend/apps/usuario/src/features/desafios/respuestas/RespuestasDesafioSection.test.tsx | T061 |
| T084 | [P] | Pruebas de `ModeracionRespuestasSection`: el admin elimina y no ve la acción de editar (RF-14). | frontend/apps/admin/src/features/desafios/respuestas/ModeracionRespuestasSection.test.tsx | T067 |
| T085 | [P] | Pruebas de permisos por rol en ambas apps: `USER` no ve publicar (RF-20), ni acciones sobre lo ajeno (RF-21). | frontend/apps/usuario/src/features/desafios/permisosPorRol.test.tsx, frontend/apps/admin/src/features/desafios/permisosPorRol.test.tsx | T068, T069 |
| T086 | [P] | Pruebas de conservación del borrador ante sesión caducada (CB-08). | frontend/packages/shared/src/desafios/components/FormularioDesafio.borrador.test.tsx | T071 |
| T087 | [P] | Pruebas de accesibilidad con Testing Library: roles, nombres accesibles y `aria-live` (sin nueva dependencia). | frontend/apps/usuario/src/features/desafios/accesibilidad.test.tsx, frontend/apps/admin/src/features/desafios/accesibilidad.test.tsx | T073, T068, T069 |
| T088 | | Ejecutar `typecheck`, `lint` y `test` del monorepo. Corregir fallos antes de la fase 9. | frontend/package.json | T075, T076, T077, T078, T079, T080, T081, T082, T083, T084, T085, T086, T087 |

---

## Fase 9 — Integración con la API real [EXTERNA]

No se ejecuta en esta iteración. Requiere la API Java.

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T089 | | [EXTERNA] Resolver con el equipo de API los pendientes: A-02, A-04, A-08, A-11, A-14, A-16, A-17, A-19, A-20, A-21, A-22 y P-01 a P-05. | Union/specs/003-desafios/spec.md, Union/specs/003-desafios/plan.md, Union/specs/003-desafios/contracts/openapi.yaml | T088 |
| T090 | [P] | Quitar los `x-pendiente` de `openapi.yaml` según las decisiones de T089. | Union/specs/003-desafios/contracts/openapi.yaml | T089 |
| T091 | | Configurar `VITE_DESAFIOS_ADAPTER=http` y la URL base que ya usa `httpClient`. | frontend/apps/usuario/.env.example, frontend/apps/admin/.env.example | T089, T031 |
| T092 | | [EXTERNA] Prueba de humo de lectura: `GET /ambitos`, `GET /desafios` paginado, `GET /desafios/{id}` y `GET /desafios/{id}/respuestas`. | frontend/packages/shared/src/desafios/infrastructure/http/HttpDesafiosAdapter.ts | T091 |
| T093 | | [EXTERNA] Ajustar el mapeo de errores reales (400, 401, 403, 404, 409) a los mensajes de la UI. | frontend/packages/shared/src/desafios/infrastructure/http/mapearErrorDesafios.ts | T092, T030 |
| T094 | [P] | [EXTERNA] Subida de fotos en `multipart` y validación de formato y tamaño con el backend (P-01, CB-11). | frontend/packages/shared/src/desafios/infrastructure/http/HttpDesafiosAdapter.ts | T091, T090 |
| T095 | [P] | [EXTERNA] Control de concurrencia con `If-Match` y aviso de conflicto de versión (P-04, CB-02). | frontend/packages/shared/src/desafios/infrastructure/http/HttpDesafiosAdapter.ts, frontend/apps/admin/src/features/desafios/editar/EditarDesafioPage.tsx | T091, T090 |
| T096 | [P] | [EXTERNA] Pruebas de contrato contra `openapi.yaml` con un validador. Requiere aprobar la dependencia (`research.md`, sección 10). | frontend/packages/shared/src/desafios/infrastructure/http/contrato.test.ts | T090 |

---

## Fase 10 — Validación end-to-end según `quickstart.md`

| ID | Paralela | Tarea | Archivos | Depende de |
|---|---|---|---|---|
| T097 | | Verificar requisitos y configuración (`quickstart.md`, secciones 1 y 2): dependencias instaladas y `.env.local` con `VITE_DESAFIOS_ADAPTER=memoria`. | frontend/apps/usuario/.env.example, frontend/apps/admin/.env.example, frontend/.gitignore | T001, T003 |
| T098 | | Ejecutar `npm test` y los proyectos `shared`, `usuario` y `admin` (`quickstart.md`, sección 4). | frontend/package.json | T088 |
| T099 | [P] | Validación manual como ADMIN con `npm run dev:admin` (`quickstart.md`, sección 5.1). | frontend/apps/admin/src/features/desafios/rutas.tsx | T069, T098, T097 |
| T100 | [P] | Validación manual como USER con `npm run dev:usuario` (`quickstart.md`, sección 5.2). | frontend/apps/usuario/src/features/desafios/rutas.tsx | T068, T098, T097 |
| T101 | | Validación de fechas (`quickstart.md`, sección 5.3). La frontera de día de fin queda [BLOQUEADA: A-16]. | frontend/packages/shared/src/desafios/domain/RangoFechas.ts | T100 |
| T102 | | Comprobar en la pestaña de red del navegador que ninguna petición sale a un backend en modo `memoria`. | frontend/packages/shared/src/desafios/infrastructure/crearAdaptadorDesafios.ts | T099, T100 |
| T103 | | Cumplir los criterios de salida de `quickstart.md`, sección 6. Los pendientes siguen marcados como pendientes. | Union/specs/003-desafios/quickstart.md | T098, T099, T100, T101, T102 |

---

## Resumen de bloqueos

| Pendiente | Tareas afectadas |
|---|---|
| S-01 (monorepo de 002 no encontrado en el workspace) | T001 y todas las rutas de `frontend/` |
| A-02 (catálogo de ámbitos) | T028, T048, T009 |
| A-04 (editar o eliminar solicitudes resueltas) | T014, T066 |
| A-08 (campos de solicitud) | T054, T060, T071 |
| A-11 (longitudes de nombre y descripción) | T053 |
| A-14 (filtro por fecha) | T048 |
| A-15 (objetivos de rendimiento) | T074 |
| A-16 (frontera de `ACTIVO`) | T008, T101 |
| A-22 (contenido de respuesta) | T055, T061, T071 |
| P-02 (editar o borrar respuestas no activas) | T061, T067 |
| P-03 (efecto de aprobar en publicación) | T065 |
| P-04 (concurrencia con `version` e `If-Match`) | T045, T063, T095 |
| P-05 (mecanismo de sesión) | T068, T069 |
| Constitución general (C-01) | Confirmación de gobernanza antes de la fase 1 |
