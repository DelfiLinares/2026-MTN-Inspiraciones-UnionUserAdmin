---
description: "Task list for Frontend Administrativo (Usuarios, Publicaciones, Reportes) implementation"
---

# Tasks: Frontend Administrativo — Gestión de Usuarios, Publicaciones y Reportes

**Input**: Design documents from `specs/002-frontend-admin/`
(`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`)

**Prerequisites**: `plan.md` ✅, `spec.md` ✅, `data-model.md` ✅, `contracts/openapi.yaml` ✅,
`quickstart.md` ✅

**Status**: Planning only — **no se crea ni ejecuta código en este documento** (Principio XV de la
constitución). Cada tarea es una unidad de trabajo futuro a ejecutar en la fase `/speckit.implement`.

**Scope note**: Según `plan.md`, este feature cubre únicamente `frontend-admin/` (React). No existe
backend en este repositorio ni se crea ninguna tarea de backend: todas las tareas de "integración con
API" referencian el contrato (`contracts/openapi.yaml`) que se consumirá en una iteración futura, usando
mocks/fixtures locales al frontend (Principio IV de la constitución — prohibido implementar backend,
incluso para pruebas).

## Format: `[ID] [P?] Description`

- **[P]**: Tarea paralelizable (archivos distintos, sin dependencia de otras tareas no finalizadas de la
  misma fase).
- Cada tarea indica archivo(s) concreto(s) a crear/editar.
- Las etiquetas de trazabilidad referencian `spec.md` (`RF-XX`, `HU-XX`, `RNF-XX`, `CB-XX`),
  `data-model.md` (entidades/enums) y `contracts/openapi.yaml` (endpoints).

## Path Conventions

Según `plan.md` → Project Structure:

```text
frontend-admin/
├── src/
│   ├── presentation/{usuarios,promocion,publicaciones,reportes,shared}/
│   ├── domain/ (+ domain/enums/)
│   ├── application/ (+ application/dto/)
│   ├── infrastructure/
│   └── routes/
└── tests/{domain,application,presentation,integration}/
```

**Nota de consistencia (Clarifications Session 2026-10-01 y 2026-10-05)**: No existe una pantalla
separada de exportación (la exportación es un botón dentro de `/reportes`, Q1); `FiltroReportes` y
`ResultadoExportacion` viven en `src/application/dto/`, no en `src/domain/` (Q4); el total de pantallas
es **4**: `/usuarios`, `/promocion`, `/publicaciones`, `/reportes`.

---

## Phase 1: Setup del Frontend

**Purpose**: Inicializar el proyecto `frontend-admin/` como aplicación React separada, sin lógica de
negocio todavía. Bloquea todas las fases siguientes.

- [ ] T001 Crear la estructura de carpetas de `frontend-admin/` (`src/presentation`, `src/domain`,
  `src/domain/enums`, `src/application`, `src/infrastructure`, `tests/domain`, `tests/application`,
  `tests/presentation`, `tests/integration`) conforme a `plan.md` → Project Structure.
- [ ] T002 Inicializar el proyecto React + TypeScript en `frontend-admin/` (`frontend-admin/package.json`,
  `frontend-admin/tsconfig.json`), como aplicación separada e independiente de cualquier frontend de
  usuario final, según Technical Context de `plan.md`.
- [ ] T003 [P] Configurar el bundler/dev server (`frontend-admin/vite.config.ts`) y el punto de entrada
  (`frontend-admin/index.html`, `frontend-admin/src/main.tsx`).
- [ ] T004 [P] Configurar linting y formato (`frontend-admin/.eslintrc.cjs`, `frontend-admin/.prettierrc`)
  para hacer cumplir la separación de capas (Principio V de la constitución): reglas que prohíban
  imports de `fetch` fuera de `src/infrastructure/`.
- [ ] T005 [P] Configurar el runner de tests (`frontend-admin/vitest.config.ts`) habilitando las carpetas
  `tests/domain`, `tests/application`, `tests/presentation`, `tests/integration`, según RNF-09 de
  `spec.md`.
- [ ] T006 [P] Configurar CSS simple global (`frontend-admin/src/global.css`) sin framework de estilos
  pesado, conforme al encargo ("CSS simple") y al Technical Context de `plan.md`.
- [ ] T007 [P] Configurar variables de entorno para la URL base de la futura API
  (`frontend-admin/.env.example`, `frontend-admin/src/infrastructure/config.ts`), sin hardcodear
  endpoints, previendo la integración futura con la API Java (Principio III de la constitución).

**Checkpoint**: Proyecto `frontend-admin/` inicializado y ejecutable (pantalla en blanco), sin lógica de
negocio. Habilita Fase 2.

---

## Phase 2: Modelo de Datos y Enums

**Purpose**: Modelar el dominio de UI orientado a objetos (Principio II de la constitución) ANTES de
cualquier servicio o pantalla. Bloquea Fases 3–8.

**Trazabilidad**: `data-model.md` (todas las entidades/enums), `spec.md` RF-04, RF-11, RF-18.

### Enums (paralelizables entre sí)

- [ ] T008 [P] Crear enum `RolUsuario` (`USER`, `ADMIN`) en
  `frontend-admin/src/domain/enums/RolUsuario.ts`. Ref: `data-model.md` §Enums, RF-04.
- [ ] T009 [P] Crear enum `EstadoCuentaUsuario` (`ACTIVO`, `BANEADO`, `ELIMINADO`) en
  `frontend-admin/src/domain/enums/EstadoCuentaUsuario.ts`. Ref: RF-04.
- [ ] T010 [P] Crear enum `EstadoPublicacion` (`ACTIVA`, `REPORTADA`, `ELIMINADA`) en
  `frontend-admin/src/domain/enums/EstadoPublicacion.ts`. Ref: RF-11.
- [ ] T011 [P] Crear enum `EstadoModeracion` (`PENDIENTE`, `EN_REVISION`, `RESUELTO`, `DESESTIMADO`) en
  `frontend-admin/src/domain/enums/EstadoModeracion.ts`. Ref: RF-18.
- [ ] T012 [P] Crear enum `MotivoReporte` (`SPAM`, `CONTENIDO_INAPROPIADO`, `PLAGIO_DERECHOS_AUTOR`,
  `VIOLENCIA`, `OTRO`) en `frontend-admin/src/domain/enums/MotivoReporte.ts`. Ref: RF-18.
- [ ] T013 [P] Crear enum `PrioridadReporte` (`ALTA`, `MEDIA`, `BAJA`) en
  `frontend-admin/src/domain/enums/PrioridadReporte.ts`. Ref: RF-18.

### Tests de reglas de dominio (escribir ANTES de las entidades; deben fallar primero)

- [ ] T014 [P] Test de reglas de `Usuario` (`puedeSerBaneado`, `puedeSerEliminado`,
  `puedeSerPromovidoAAdmin`) en `frontend-admin/tests/domain/Usuario.test.ts`. Ref: RF-01, RF-02, RF-03,
  RF-06, RF-08; reglas de negocio críticas 7 y 8 de `spec.md` §6.
- [ ] T015 [P] Test de reglas de `Publicacion` (`puedeSerEditada`, `puedeSerEliminada`, `estaActiva`,
  `estaReportada`) en `frontend-admin/tests/domain/Publicacion.test.ts`. Ref: RF-09, RF-10, RF-12.
- [ ] T016 [P] Test de reglas de `Reporte` (`estaPendiente`, `puedeAceptarse`, `puedeRechazarse`,
  `esEstadoFinal`) en `frontend-admin/tests/domain/Reporte.test.ts`. Ref: RF-15, RF-16, RF-17; regla de
  negocio crítica 9 de `spec.md` §6.

### Entidades y objetos de dominio (implementar después de que los tests de T014–T016 existan y fallen)

- [ ] T017 Implementar clase `Usuario` con sus reglas de negocio en
  `frontend-admin/src/domain/Usuario.ts` (depende de T008, T009, T014). Hace pasar T014.
- [ ] T018 Implementar clase `Publicacion` con sus reglas de negocio en
  `frontend-admin/src/domain/Publicacion.ts` (depende de T010, T015). Hace pasar T015.
- [ ] T019 Implementar clase `Reporte` con sus reglas de negocio en
  `frontend-admin/src/domain/Reporte.ts` (depende de T011, T012, T013, T016). Hace pasar T016.
- [ ] T020 [P] Implementar DTO de aplicación `FiltroReportes` en
  `frontend-admin/src/application/dto/FiltroReportes.ts` (depende de T011, T012, T013). Ref: RF-14,
  `data-model.md` §Objetos de Aplicación (ubicación confirmada: `src/application/dto/`, Clarifications
  Session 2026-10-01).
- [ ] T021 [P] Implementar DTO de aplicación `ResultadoExportacion` en
  `frontend-admin/src/application/dto/ResultadoExportacion.ts`. Ref: RF-19, RF-20, `data-model.md`
  §Objetos de Aplicación (ubicación confirmada: `src/application/dto/`, Clarifications Session
  2026-10-01).

**Checkpoint**: Dominio de UI completo y testeado de forma aislada (sin HTTP, sin React). Habilita
Fase 3.

---

## Phase 3: Componentes y Estructura de Navegación

**Purpose**: Construir el esqueleto de presentación y navegación (rutas, layout, componentes
compartidos) ANTES de cablear cualquier funcionalidad específica, priorizando la estructura visual base
según lo solicitado explícitamente.

**Trazabilidad**: `spec.md` HU-10 (acceso restringido), RF-21, RF-22; `plan.md` → Project Structure.

- [ ] T022 Definir el enrutador principal (`frontend-admin/src/routes/AppRoutes.tsx`) con rutas para las
  4 pantallas: `/usuarios`, `/promocion`, `/publicaciones`, `/reportes` (la exportación de reportes NO
  tiene ruta propia: es un botón dentro de `/reportes`, Clarifications Session 2026-10-01). Depende de
  T002, T003.
- [ ] T023 Implementar el layout general y navegación lateral/superior
  (`frontend-admin/src/presentation/shared/AppLayout.tsx`) con enlaces a las 4 pantallas. Depende de
  T022.
- [ ] T023b Definir el contrato de props de `ConfirmDialog` (`titulo`, `mensaje`, `onConfirmar`,
  `onCancelar`, `cargando?`) en un archivo de tipos
  (`frontend-admin/src/presentation/shared/ConfirmDialog.types.ts`), ANTES de implementarlo (T024) y
  antes de que los 7 consumidores (T036, T037, T044, T045, T058, T066, y la rama condicional de T057)
  lo usen, evitando que cada consumidor defina su propia forma de invocarlo (hallazgo de
  `/speckit.analyze`). Depende de T023.
- [ ] T024 [P] Implementar componente `ConfirmDialog` reutilizable
  (`frontend-admin/src/presentation/shared/ConfirmDialog.tsx`) conforme al contrato de T023b, para
  confirmación explícita de acciones destructivas (RF-23, RNF-06). Sin lógica de negocio: solo UI de
  confirmación genérica. Debe aceptar ser invocado de forma condicional por el componente consumidor
  (no toda acción sensible lo invoca incondicionalmente: ver T057, excepción de "Aceptar reporte"
  simple, Clarifications Session 2026-10-05). Depende de T023b.
- [ ] T025 [P] Implementar componente `AccionSensibleBoton` reutilizable
  (`frontend-admin/src/presentation/shared/AccionSensibleBoton.tsx`) que aplique estilo visual
  diferenciado para acciones sensibles vs. de consulta (RF-22, RNF-03).
- [ ] T026 [P] Implementar componente `EstadoVacio` reutilizable
  (`frontend-admin/src/presentation/shared/EstadoVacio.tsx`) para listados sin resultados (CB-04).
- [ ] T027 [P] Implementar componente `MensajeError` reutilizable (no bloqueante)
  (`frontend-admin/src/presentation/shared/MensajeError.tsx`) para errores de operaciones fallidas
  (AC-01.7, AC-02.6, AC-03.6, AC-05.5, AC-07.5, AC-08.5, CB-06).
- [ ] T028 [P] Implementar componente `GuardiaRolAdmin`
  (`frontend-admin/src/presentation/shared/GuardiaRolAdmin.tsx`) que envuelve las rutas administrativas y
  bloquea el acceso si la sesión simulada/real no tiene rol `ADMIN` (HU-10, AC-10.1, AC-10.3). Depende
  de T022.
- [ ] T029 [P] Crear estilos CSS base para layout, tabla de listados y botones sensibles/de consulta
  (`frontend-admin/src/presentation/shared/shared.css`), reutilizados en las 4 pantallas (CSS simple,
  conforme al encargo).
- [ ] T030 Crear las 4 páginas contenedoras vacías (placeholders) para cada pantalla:
  `frontend-admin/src/presentation/usuarios/UsuariosPage.tsx`,
  `frontend-admin/src/presentation/promocion/PromocionPage.tsx`,
  `frontend-admin/src/presentation/publicaciones/PublicacionesPage.tsx`,
  `frontend-admin/src/presentation/reportes/ReportesPage.tsx` (esta última incluye la acción de
  exportar: no existe `ExportacionPage.tsx` separada, Clarifications Session 2026-10-01). Depende de
  T022, T023.

**Checkpoint**: Navegación completa entre las 4 pantallas, con layout, guardia de rol y componentes
compartidos (confirmación, error, vacío, botón sensible) listos para ser usados. Habilita Fases 4–7 en
paralelo entre sí (cada una trabaja sobre su propia pantalla).

---

## Phase 4: Gestión de Usuarios

**Purpose**: Implementar HU-01 (banear) y HU-02 (eliminar) sobre la pantalla de usuarios.

**Trazabilidad**: `spec.md` HU-01, HU-02, RF-01, RF-02, RF-03, RF-04, RF-05; `contracts/openapi.yaml`
`/usuarios`, `/usuarios/{usuarioId}/banear`, `/usuarios/{usuarioId}/eliminar`.

- [ ] T031 [P] Definir la interfaz `HttpClient` abstracta (sin implementación real) en
  `frontend-admin/src/infrastructure/httpClient.ts`. Depende de T007.
- [ ] T032 [P] Definir `frontend-admin/src/infrastructure/apiEndpoints.ts` con las rutas de
  `/usuarios`, `/usuarios/{id}/banear`, `/usuarios/{id}/eliminar`, según `contracts/openapi.yaml`.
- [ ] T033 Test de servicio `UsuariosService.banear()` y `UsuariosService.eliminar()` con cliente HTTP
  simulado (mock) en `frontend-admin/tests/application/UsuariosService.test.ts`. Debe fallar primero
  (TDD). Incluye el caso CB-08 (fecha de baneo temporal inválida o pasada: el servicio debe rechazarla
  antes de invocar el `HttpClient`). Ref: RF-01, RF-02, RF-03, CB-01, CB-08. Depende de T031, T032.
- [ ] T034a Implementar `UsuariosService.listar()` en
  `frontend-admin/src/application/UsuariosService.ts`. Depende de T008, T009 (enums `RolUsuario`,
  `EstadoCuentaUsuario`), T017, T033.
- [ ] T034b Implementar `UsuariosService.banear()` en
  `frontend-admin/src/application/UsuariosService.ts`, delegando `puedeSerBaneado()` a la entidad
  `Usuario` y validando la fecha de baneo temporal (CB-08) antes de invocar el `HttpClient`. Depende de
  T009 (enum `EstadoCuentaUsuario`), T017, T034a. Hace pasar la porción "banear" de T033.
- [ ] T034c Implementar `UsuariosService.eliminar()` en
  `frontend-admin/src/application/UsuariosService.ts`, delegando `puedeSerEliminado()` a la entidad
  `Usuario` antes de invocar el `HttpClient`. Depende de T009 (enum `EstadoCuentaUsuario`), T017,
  T034a. Hace pasar la porción "eliminar" de T033.
- [ ] T035 Implementar tabla de listado de usuarios con búsqueda y paginación
  (`frontend-admin/src/presentation/usuarios/UsuariosTable.tsx`) consumiendo `UsuariosService.listar()`.
  Depende de T008, T009 (enums `RolUsuario`, `EstadoCuentaUsuario` para columnas/badges), T030, T034a.
  Ref: RF-05, AC-01.1.
- [ ] T036 Implementar acción "Banear" con selección de baneo temporal/permanente
  (`frontend-admin/src/presentation/usuarios/BanearUsuarioAction.tsx`), usando `AccionSensibleBoton` y
  `ConfirmDialog` (contrato de T023b). Ref: HU-01, AC-01.2, AC-01.3, AC-01.6. Depende de T024, T025,
  T034b, T035.
- [ ] T037 Implementar acción "Eliminar" de usuario
  (`frontend-admin/src/presentation/usuarios/EliminarUsuarioAction.tsx`), usando `AccionSensibleBoton` y
  `ConfirmDialog` (contrato de T023b). Ref: HU-02, AC-02.2, AC-02.5. Depende de T024, T025, T034c, T035.
- [ ] T038 Cablear `UsuariosPage.tsx` con `UsuariosTable`, `BanearUsuarioAction` y
  `EliminarUsuarioAction`, incluyendo manejo de error no bloqueante vía `MensajeError` (AC-01.7,
  AC-02.6). Depende de T036, T037, T027.
- [ ] T039 [P] Test de componente: deshabilitación de "Banear"/"Eliminar" sobre un usuario con rol
  `ADMIN` en `frontend-admin/tests/presentation/UsuariosPage.test.tsx`. Ref: AC-01.5, AC-02.4, CB-01.
  Depende de T038.

**Checkpoint**: Pantalla de gestión de usuarios funcional (banear/eliminar) contra mocks, con reglas de
negocio testeadas end-to-end desde dominio hasta componente.

---

## Phase 5: Gestión de Publicaciones

**Purpose**: Implementar HU-04 (editar) y HU-05 (eliminar) sobre la pantalla de publicaciones.

**Trazabilidad**: `spec.md` HU-04, HU-05, RF-09, RF-10, RF-11, RF-12; `contracts/openapi.yaml`
`/publicaciones`, `/publicaciones/{id}`, `/publicaciones/{id}/eliminar`.

- [ ] T040 [P] Agregar a `frontend-admin/src/infrastructure/apiEndpoints.ts` las rutas de
  `/publicaciones`, `/publicaciones/{id}`, `/publicaciones/{id}/eliminar`. Depende de T032.
- [ ] T041 Test de servicio `PublicacionesService.editar()` y `PublicacionesService.eliminar()` con
  cliente HTTP simulado en `frontend-admin/tests/application/PublicacionesService.test.ts`. Debe fallar
  primero. Ref: RF-09, RF-10, CB-06. Depende de T040.
- [ ] T042a Implementar `PublicacionesService.listar()` en
  `frontend-admin/src/application/PublicacionesService.ts`. Depende de T010 (enum `EstadoPublicacion`),
  T018, T041.
- [ ] T042b Implementar `PublicacionesService.editar()` en
  `frontend-admin/src/application/PublicacionesService.ts`, delegando `puedeSerEditada()` a la entidad
  `Publicacion`. Depende de T010 (enum `EstadoPublicacion`), T018, T042a. Hace pasar la porción "editar"
  de T041.
- [ ] T042c Implementar `PublicacionesService.eliminar()` en
  `frontend-admin/src/application/PublicacionesService.ts`, delegando `puedeSerEliminada()` a la
  entidad `Publicacion`. Depende de T010 (enum `EstadoPublicacion`), T018, T042a. Hace pasar la porción
  "eliminar" de T041.
- [ ] T043 Implementar tabla de listado de publicaciones con filtro por estado
  (`frontend-admin/src/presentation/publicaciones/PublicacionesTable.tsx`) consumiendo
  `PublicacionesService.listar()`. Depende de T010 (enum `EstadoPublicacion` para el filtro), T030,
  T042a. Ref: RF-11.
- [ ] T044 Implementar formulario de edición de publicación
  (`frontend-admin/src/presentation/publicaciones/EditarPublicacionForm.tsx`) con confirmación
  explícita de guardado y conservación de datos ante error. Ref: HU-04, AC-04.2, AC-04.3, AC-04.4.
  Depende de T024, T042b, T043.
- [ ] T045 Implementar acción "Eliminar" de publicación
  (`frontend-admin/src/presentation/publicaciones/EliminarPublicacionAction.tsx`), usando
  `AccionSensibleBoton` y `ConfirmDialog` (contrato de T023b). Ref: HU-05, AC-05.2, AC-05.4. Depende de
  T024, T025, T042c, T043.
- [ ] T046 Cablear `PublicacionesPage.tsx` con `PublicacionesTable`, `EditarPublicacionForm` y
  `EliminarPublicacionAction`, incluyendo manejo de error no bloqueante. Ref: AC-05.5. Depende de T044,
  T045, T027.
- [ ] T047 [P] Test de componente: la acción "Eliminar" está disponible sin distinguir autor/estado
  previo de la publicación, y se distingue visualmente como sensible, en
  `frontend-admin/tests/presentation/PublicacionesPage.test.tsx`. Ref: AC-05.1, AC-05.4. Depende de T046.

**Checkpoint**: Pantalla de gestión de publicaciones funcional (editar/eliminar) contra mocks.

---

## Phase 6: Gestión de Reportes

**Purpose**: Implementar HU-06 (ver pendientes), HU-07 (aceptar), HU-08 (rechazar) y HU-09 (exportar)
sobre la pantalla única de reportes (`/reportes`, incluye el botón de exportación — no existe pantalla
separada, Clarifications Session 2026-10-01).

**Trazabilidad**: `spec.md` HU-06, HU-07, HU-08, HU-09, RF-13..RF-20; `contracts/openapi.yaml`
`/reportes`, `/reportes/{id}`, `/reportes/{id}/aceptar`, `/reportes/{id}/rechazar`,
`/reportes/exportar`.

- [ ] T048 [P] Agregar a `frontend-admin/src/infrastructure/apiEndpoints.ts` las rutas de `/reportes`,
  `/reportes/{id}`, `/reportes/{id}/aceptar`, `/reportes/{id}/rechazar`, `/reportes/exportar`. Depende
  de T032.
- [ ] T049 Test de servicio `ReportesService.listar()`, `.obtenerDetalle()`, `.aceptar()`,
  `.rechazar()` con cliente HTTP simulado en `frontend-admin/tests/application/ReportesService.test.ts`.
  Debe fallar primero. Incluye un caso dedicado para `GET /reportes/{reporteId}` (detalle), cubriendo
  éxito y reporte inexistente (404). Ref: RF-15, RF-16, RF-17, CB-03. Depende de T048.
- [ ] T050a Implementar `ReportesService.listar()` (con `FiltroReportes`) en
  `frontend-admin/src/application/ReportesService.ts`. Depende de T011, T012, T013 (enums
  `EstadoModeracion`, `MotivoReporte`, `PrioridadReporte`), T019, T020, T049.
- [ ] T050b Implementar `ReportesService.obtenerDetalle()` en
  `frontend-admin/src/application/ReportesService.ts`, consumiendo `GET /reportes/{reporteId}`. Depende
  de T011 (enum `EstadoModeracion`), T019, T050a. Hace pasar la porción "detalle" de T049.
- [ ] T050c Implementar `ReportesService.aceptar()` en
  `frontend-admin/src/application/ReportesService.ts`, delegando `puedeAceptarse()` a la entidad
  `Reporte`. Depende de T011 (enum `EstadoModeracion`), T019, T050a. Hace pasar la porción "aceptar" de
  T049.
- [ ] T050d Implementar `ReportesService.rechazar()` en
  `frontend-admin/src/application/ReportesService.ts`, delegando `puedeRechazarse()` a la entidad
  `Reporte`. Debe invocar `Publicacion.reactivarSiNoQuedanReportesPendientes()` sobre la publicación
  asociada cuando no existan otros reportes `PENDIENTE`/`EN_REVISION` (AC-08.6, Clarifications Session
  2026-10-05). Depende de T011 (enum `EstadoModeracion`), T018, T019, T050a. Hace pasar la porción
  "rechazar" de T049.
- [ ] T051 Test de servicio `ExportacionService.exportar()` con cliente HTTP simulado en
  `frontend-admin/tests/application/ExportacionService.test.ts`, cubriendo éxito (con `urlDescarga`) y
  fallo (mensaje de error). Debe fallar primero. Ref: RF-19, RF-20, CB-05. Depende de T048.
- [ ] T052 [P] Implementar `ExportacionService` (exportar, respetando `FiltroReportes` activo) en
  `frontend-admin/src/application/ExportacionService.ts`, devolviendo `ResultadoExportacion`
  (`src/application/dto/`). Depende de T020, T021, T051. Hace pasar T051.
- [ ] T053 Implementar tabla de listado de reportes con columnas de estado, motivo y prioridad visibles
  (`frontend-admin/src/presentation/reportes/ReportesTable.tsx`) consumiendo `ReportesService.listar()`.
  Depende de T011, T012, T013 (enums `EstadoModeracion`, `MotivoReporte`, `PrioridadReporte` para
  columnas), T030, T050a. Ref: AC-06.1, RNF-02.
- [ ] T054 [P] Implementar panel de controles de filtro por estado, prioridad y motivo
  (`frontend-admin/src/presentation/reportes/FiltrosReportes.tsx`), cuyo estado de filtro activo
  (`FiltroReportes`) es compartido con la acción de exportar (T059) al vivir ambos en la misma pantalla
  `/reportes` (Clarifications Session 2026-10-01). Ref: AC-06.2, RF-14. Depende de T011, T012, T013,
  T020, T053.
- [ ] T055 [P] Implementar indicador visual de prioridad/estado destacado para reportes `PENDIENTE`
  (`frontend-admin/src/presentation/reportes/PrioridadBadge.tsx`,
  `frontend-admin/src/presentation/reportes/EstadoModeracionBadge.tsx`). Ref: AC-06.3, RNF-02. Depende
  de T011, T013.
- [ ] T056 Implementar panel de detalle de reporte
  (`frontend-admin/src/presentation/reportes/ReporteDetalle.tsx`) mostrando motivo, prioridad, estado y
  publicación/usuario asociado, consumiendo `ReportesService.obtenerDetalle()`. Ref: AC-06.4. Depende
  de T050b, T053.
- [ ] T057 Implementar acción "Aceptar" de reporte
  (`frontend-admin/src/presentation/reportes/AceptarReporteAction.tsx`), usando `AccionSensibleBoton`,
  deshabilitada si `esEstadoFinal()`. **No requiere `ConfirmDialog` cuando es una aceptación simple**
  (`requiereConfirmacionParaAceptar()` devuelve `false`); SÍ requiere `ConfirmDialog` (contrato de
  T023b) únicamente cuando la acción se encadena con la eliminación de la publicación asociada en el
  mismo flujo (Clarifications Session 2026-10-05, resuelve A2). Ref: HU-07, AC-07.3, AC-07.4. Depende
  de T024, T025, T050c, T056.
- [ ] T058 Implementar acción "Rechazar" de reporte
  (`frontend-admin/src/presentation/reportes/RechazarReporteAction.tsx`), usando `AccionSensibleBoton`
  y `ConfirmDialog` (contrato de T023b; `requiereConfirmacionParaRechazar()` siempre devuelve `true`),
  deshabilitada si `esEstadoFinal()`. Ref: HU-08, AC-08.3, AC-08.4. Depende de T024, T025, T050d, T056.
- [ ] T059 Cablear `ReportesPage.tsx` con `ReportesTable`, `FiltrosReportes`, `ReporteDetalle`,
  `AceptarReporteAction`, `RechazarReporteAction` y la acción de exportar (`ExportarReportesBoton.tsx`,
  usando el `FiltroReportes` activo de `FiltrosReportes` y `ExportacionService`), incluyendo manejo de
  error no bloqueante. No existe `ExportacionPage.tsx` ni ruta `/reportes/exportar` separadas
  (Clarifications Session 2026-10-01). Ref: AC-07.5, AC-08.5, AC-09.1, AC-09.2, AC-09.3, AC-09.4.
  Depende de T054, T055, T057, T058, T052, T027.
- [ ] ~~T060~~ Fusionada con T059: la acción de exportar ya no es una pantalla propia, sino un botón
  dentro de `ReportesPage.tsx` que reutiliza el `FiltroReportes` activo de `FiltrosReportes.tsx`
  (Clarifications Session 2026-10-01). Sin trabajo independiente.
- [ ] ~~T061~~ Fusionada con T059: no existe `ExportacionPage.tsx` (Clarifications Session 2026-10-01).
  Sin trabajo independiente.
- [ ] T062 [P] Test de componente: reportes en estado `RESUELTO`/`DESESTIMADO` muestran
  "Aceptar"/"Rechazar" deshabilitados de forma permanente, en
  `frontend-admin/tests/presentation/ReportesPage.test.tsx`. Ref: AC-07.4, AC-08.4, CB-03. Depende de
  T059.
- [ ] T062b [P] Test de componente: "Aceptar reporte" simple NO muestra `ConfirmDialog`, pero SÍ lo
  muestra cuando se encadena con la eliminación de la publicación asociada; "Rechazar reporte" siempre
  muestra `ConfirmDialog` y, al confirmarse, si no quedan otros reportes `PENDIENTE`/`EN_REVISION`, la
  publicación asociada vuelve a `ACTIVA`, en
  `frontend-admin/tests/presentation/ReportesPage.test.tsx`. Ref: AC-07.3, AC-08.6, resuelve A2.
  Depende de T059.

**Checkpoint**: Pantalla de reportes (listado, detalle, aceptar, rechazar, exportar) funcional contra
mocks.

---

## Phase 7: Promoción de Usuarios

**Purpose**: Implementar HU-03 (promover a administrador) sobre la pantalla de promoción.

**Trazabilidad**: `spec.md` HU-03, RF-06, RF-07, RF-08; `contracts/openapi.yaml`
`/usuarios/{usuarioId}/promover`.

- [ ] T063 Agregar a `frontend-admin/src/infrastructure/apiEndpoints.ts` la ruta
  `/usuarios/{usuarioId}/promover`. Depende de T032.
- [ ] T064 Test de servicio `UsuariosService.promover()` con cliente HTTP simulado en
  `frontend-admin/tests/application/UsuariosService.test.ts` (extiende el archivo de T033), cubriendo
  el caso no-op de promover a un usuario ya `ADMIN` sin invocar el `HttpClient`. Debe fallar primero.
  Ref: RF-06, RF-07, RF-08, CB-02. Depende de T063, T034a.
- [ ] T064b [P] Test aislado de la regla de negocio crítica #5 (`spec.md` §6): únicamente un actor con
  rol `ADMIN` puede ejecutar `UsuariosService.promover()`; un intento con actor de rol `USER` debe ser
  rechazado antes de invocar el `HttpClient`, en
  `frontend-admin/tests/application/UsuariosService.test.ts`. Debe fallar primero. Ref: regla de
  negocio crítica 5 de `spec.md` §6. Depende de T063, T034a.
- [ ] T065 Implementar `UsuariosService.promover()` en
  `frontend-admin/src/application/UsuariosService.ts`, delegando `puedeSerPromovidoAAdmin()` a la
  entidad `Usuario` y verificando que el actor autenticado tenga rol `ADMIN` antes de invocar el
  `HttpClient` (hace pasar la regla de negocio crítica #5 verificada en T064b). Depende de T008 (enum
  `RolUsuario`), T017, T064, T064b. Hace pasar T064 y T064b.
- [ ] T066 Implementar selector de usuario y acción "Promover a administrador"
  (`frontend-admin/src/presentation/promocion/PromoverUsuarioAction.tsx`), usando
  `AccionSensibleBoton` y `ConfirmDialog` (contrato de T023b), deshabilitada si el usuario seleccionado
  ya tiene rol `ADMIN`. Ref: AC-03.1, AC-03.2, AC-03.5. Depende de T024, T025, T065.
- [ ] T067 Cablear `PromocionPage.tsx` con un selector/búsqueda de usuarios con rol `USER` (reutilizando
  `UsuariosTable` o una variante filtrada) y `PromoverUsuarioAction`, incluyendo manejo de error no
  bloqueante. Ref: AC-03.6. Depende de T034a, T066, T027.
- [ ] T068 [P] Test de componente: intento de promover a un usuario ya `ADMIN` se rechaza como no-op sin
  llamar al servicio, en `frontend-admin/tests/presentation/PromocionPage.test.tsx`. Ref: AC-03.4,
  CB-02. Depende de T067.

**Checkpoint**: Pantalla de promoción de usuarios funcional contra mocks.

---

## Phase 8: Confirmaciones y Estados de Acciones

**Purpose**: Consolidar y verificar transversalmente, en las 4 pantallas ya implementadas, que toda
acción sensible requiere confirmación explícita (salvo la excepción documentada para "Aceptar reporte"
simple, Clarifications Session 2026-10-05) y que los estados de carga/error/éxito son consistentes
(Principio XIII de la constitución, RNF-06).

**Trazabilidad**: `spec.md` RF-22, RF-23, RNF-03, RNF-06; reglas de negocio críticas 6 de `spec.md` §6.

- [ ] T069 Auditar que las 7 acciones sensibles (banear, eliminar, promover usuario; editar, eliminar
  publicación; aceptar, rechazar reporte) usan `ConfirmDialog` de forma consistente —excepto "Aceptar
  reporte" simple, que deliberadamente no lo usa (AC-07.3)—, documentando el resultado en
  `frontend-admin/tests/presentation/ConfirmacionesTransversal.test.tsx`. Depende de T038, T046, T059,
  T067.
- [ ] T070 [P] Test transversal: las 7 acciones sensibles usan `AccionSensibleBoton` (distinción visual)
  y nunca el mismo estilo que las acciones de solo consulta, en
  `frontend-admin/tests/presentation/DistincionVisualTransversal.test.tsx`. Ref: RF-22, RNF-03. Depende
  de T025, T069.
- [ ] T071 [P] Test transversal: toda operación de red (banear, eliminar, promover, editar, aceptar,
  rechazar, exportar) muestra un estado de carga y, ante fallo, un mensaje de error no bloqueante sin
  dejar la interfaz bloqueada, en
  `frontend-admin/tests/presentation/EstadosDeCargaTransversal.test.tsx`. Ref: CB-05, CB-06. Depende de
  T038, T046, T059.
- [ ] T072 Implementar manejo uniforme de respuestas 401/403 del futuro backend (mensaje "sesión no
  válida o sin permisos") en `frontend-admin/src/infrastructure/httpClient.ts`, reflejando RNF-05 (la
  autorización real depende del backend). Depende de T031.

**Checkpoint**: Las 7 acciones sensibles tienen confirmación explícita y distinción visual consistente
en toda la aplicación; los estados de carga/error están normalizados.

---

## Phase 9: Validación de Interfaz según quickstart.md

**Purpose**: Ejecutar manualmente los 10 escenarios de `quickstart.md` contra el frontend construido con
mocks/fixtures, verificando el checklist final de reglas de negocio críticas de `spec.md` §6.

**Trazabilidad**: `quickstart.md` (Escenarios 1–10 y Checklist final).

- [ ] T073 Preparar fixtures de datos de ejemplo (usuarios, publicaciones, reportes) cubriendo los casos
  mínimos descritos en `quickstart.md` → Prerrequisitos, en
  `frontend-admin/tests/fixtures/usuarios.fixtures.ts`,
  `frontend-admin/tests/fixtures/publicaciones.fixtures.ts`,
  `frontend-admin/tests/fixtures/reportes.fixtures.ts` (uso exclusivo en `tests/`/demo visual, nunca en
  `application/services`, conforme a `research.md` §2). Depende de T017, T018, T019.
- [ ] T074 Ejecutar manualmente el Escenario 1 (banear usuario) de `quickstart.md` y registrar resultado
  en `frontend-admin/docs/validacion-manual.md`. Depende de T038, T073.
- [ ] T075 [P] Ejecutar manualmente el Escenario 2 (eliminar usuario) de `quickstart.md` y registrar
  resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T038, T073.
- [ ] T076 [P] Ejecutar manualmente el Escenario 3 (promover usuario) de `quickstart.md` y registrar
  resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T067, T073.
- [ ] T077 [P] Ejecutar manualmente el Escenario 4 (editar publicación) de `quickstart.md` y registrar
  resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T046, T073.
- [ ] T078 [P] Ejecutar manualmente el Escenario 5 (eliminar publicación) de `quickstart.md` y registrar
  resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T046, T073.
- [ ] T079 [P] Ejecutar manualmente los Escenarios 6, 7 y 8 (ver, aceptar, rechazar reportes) de
  `quickstart.md` y registrar resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T059,
  T073.
- [ ] T080 [P] Ejecutar manualmente el Escenario 9 (exportar reportes desde `/reportes`) de
  `quickstart.md` y registrar resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T059,
  T073.
- [ ] T081 [P] Ejecutar manualmente el Escenario 10 (acceso restringido) de `quickstart.md` y registrar
  resultado en `frontend-admin/docs/validacion-manual.md`. Depende de T028, T073.
- [ ] T082 Completar el Checklist final de reglas de negocio críticas de `quickstart.md` en
  `frontend-admin/docs/validacion-manual.md`, marcando cada ítem como verificado. Depende de T074–T081.

**Checkpoint**: Los 10 escenarios de `quickstart.md` fueron ejecutados manualmente y documentados; el
checklist de reglas de negocio críticas está completo.

---

## Phase 10: Revisión Final del Frontend

**Purpose**: Cierre de calidad antes de considerar la feature lista para `/speckit.implement` real:
verificar cobertura de tests, cumplimiento de la constitución y consistencia general.

**Trazabilidad**: `plan.md` → Constitution Check; `spec.md` §6 (reglas de negocio críticas), §11
(Criterio Final de Consistencia).

- [ ] T083 Ejecutar la suite completa de tests (`frontend-admin/tests/domain`,
  `frontend-admin/tests/application`, `frontend-admin/tests/presentation`,
  `frontend-admin/tests/integration`) y documentar resultado en
  `frontend-admin/docs/resultado-tests.md`. Depende de T014–T021, T033, T034a, T034b, T034c, T039,
  T041, T042a, T042b, T042c, T047, T049, T050a–T050d, T051, T052, T062, T062b, T064, T064b, T065,
  T068–T071.
- [ ] T084 [P] Revisar que las 9 reglas de negocio críticas de `spec.md` §6 tienen al menos un test
  automatizado asociado (tabla de trazabilidad regla → archivo de test), incluyendo explícitamente la
  regla #5 (ADMIN-only en `promover()`, cubierta por T064b) y la regla #9 (estado final de reporte,
  cubierta por T016/T062), documentado en `frontend-admin/docs/trazabilidad-reglas-negocio.md`. Depende
  de T083.
- [ ] T085 [P] Revisar que ningún componente de `frontend-admin/src/presentation/` invoca `fetch`
  directamente (grep de verificación), conforme a RNF-07, documentado en
  `frontend-admin/docs/revision-separacion-capas.md`. Depende de T038, T046, T059, T067.
- [ ] T086 [P] Revisar que ninguna parte del frontend accede a MySQL, implementa persistencia propia o
  recalcula rankings/recomendaciones/estadísticas (RF-25, RF-26, RF-27), documentado en
  `frontend-admin/docs/revision-fuera-de-alcance.md`. Depende de T083.
- [ ] T087 Re-validar la tabla de Constitution Check de `plan.md` contra el estado final del frontend
  construido, actualizando `specs/002-frontend-admin/plan.md` si se detectó alguna desviación durante
  la implementación. Depende de T084, T085, T086.
- [ ] T088 Actualizar `specs/002-frontend-admin/tasks.md` marcando todas las tareas completadas y
  registrar cualquier ambigüedad adicional detectada durante la implementación como nueva fila en
  `spec.md` §9 (Ambigüedades), si corresponde. Depende de T087.

**Checkpoint**: Frontend administrativo completo, testeado y verificado contra la constitución y la
especificación; listo para la iteración futura de integración con la API Java real.

---

## Resumen de Dependencias entre Fases

```text
Fase 1 (Setup)
   └─> Fase 2 (Modelo de Datos y Enums)
         └─> Fase 3 (Componentes y Navegación)
               ├─> Fase 4 (Gestión de Usuarios) ─────┐
               ├─> Fase 5 (Gestión de Publicaciones) ┤
               ├─> Fase 6 (Gestión de Reportes) ──────┼─> Fase 8 (Confirmaciones y Estados)
               └─> Fase 7 (Promoción de Usuarios) ───┘         └─> Fase 9 (Validación quickstart)
                                                                        └─> Fase 10 (Revisión Final)
```

Las Fases 4, 5, 6 y 7 pueden trabajarse en paralelo entre sí una vez completada la Fase 3, ya que cada
una opera sobre archivos y pantallas distintas (`usuarios/`, `publicaciones/`, `reportes/` —incluye la
acción de exportar—, `promocion/`), con la única dependencia compartida de `apiEndpoints.ts` (T032), que
debe completarse antes de T040, T048 y T063 respectivamente.

## Total de Tareas

**88 identificadores base** (T001–T088), más las subtareas introducidas en revisiones posteriores:
`T023b`, `T034a/b/c`, `T042a/b/c`, `T050a/b/c/d`, `T062b`, `T064b`. `T060` y `T061` quedaron fusionadas
con `T059` (sin trabajo independiente) tras resolver, vía `/speckit.clarify`, que la exportación de
reportes no tiene pantalla ni ruta propias (Clarifications Session 2026-10-01). `T034`, `T042` y `T050`
quedaron reemplazadas íntegramente por sus respectivas subtareas por operación (ya no tienen trabajo
propio bajo su ID original).

Total de unidades de trabajo reales: **97** (88 identificadores base, de los cuales 5 quedaron sin
trabajo propio —`T034`, `T042`, `T050`, `T060`, `T061`, reemplazadas/fusionadas en sus subtareas o en
`T059`— más 14 subtareas nuevas: `T023b`, `T034a/b/c`, `T042a/b/c`, `T050a/b/c/d`, `T062b`, `T064b`),
distribuidas en 10 fases según lo solicitado. Ninguna tarea implica crear ni ejecutar código como parte
de este documento (Principio XV de la constitución); son unidades de trabajo para la fase
`/speckit.implement`.

**Nota de consistencia (`/speckit.clarify`, 2026-10-01 y 2026-10-05)**: Este documento fue actualizado
para reflejar las 5 decisiones de la sesión de clarificación: (1) exportación sin pantalla propia —T022,
T030, T059, T060/T061 fusionadas—; (2) reactivación automática de publicación al rechazar el último
reporte pendiente —T050d, T062b—; (3) cierre total de A1 sin excepciones —sin cambios de tareas, ya
cubierto por T014/T039—; (4) `FiltroReportes`/`ResultadoExportacion` en `src/application/dto/` —T020,
T021, T052—; (5) confirmación condicional para "Aceptar reporte" —T024, T057, T062b, T069—.

**Correcciones del reporte `/speckit.analyze` aplicadas en esta revisión** (ya no están pendientes):
(a) `T034`, `T042` y `T050` divididas en subtareas por operación (`T034a/b/c`, `T042a/b/c`,
`T050a/b/c/d`) para reducir su granularidad y permitir TDD por operación; (b) dependencias explícitas de
enums agregadas en `T035`, `T043`, `T053`, `T054` (y en las nuevas subtareas de servicio); (c) contrato
de `ConfirmDialog` extraído a una tarea previa dedicada (`T023b`) consumida explícitamente por los 7
puntos de uso; (d) test aislado de la regla de negocio crítica #5 (ADMIN-only en `promover()`) agregado
como `T064b`; (e) test dedicado para `GET /reportes/{reporteId}` (detalle) incorporado a `T049`/`T050b`;
(f) validación de CB-08 (fecha de baneo inválida) incorporada a `T033`/`T034b`. Todas las referencias
cruzadas en `T067`, `T083` y `T084` fueron actualizadas para apuntar a los nuevos IDs.
validación de CB-08) quedan pendientes para una revisión posterior independiente.
