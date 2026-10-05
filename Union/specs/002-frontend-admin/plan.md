# Implementation Plan: Frontend Administrativo — Gestión de Usuarios, Publicaciones y Reportes

**Branch**: `002-frontend-admin` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-frontend-admin/spec.md`

**Note**: Este plan corresponde únicamente al diseño técnico. No se implementa código en esta fase,
en línea con el Principio I ("La especificación manda sobre la implementación") y el Principio XV
("Prohibición de código en fases de especificación") de `Union/.specify/memory/constitution.md`
(v2.0.0).

## Summary

El requisito principal es diseñar técnicamente un **frontend administrativo React** (`frontend-admin/`)
para la red social de inspiración artística, que permita a un administrador: gestionar usuarios
(banear, eliminar, promover a ADMIN), gestionar publicaciones de cualquier usuario (editar, eliminar)
y gestionar reportes (ver pendientes, aceptar, rechazar, exportar). El frontend consumirá en una
**iteración futura** una API REST Java ya provista externamente; dicha API **no se implementa** en
este plan ni en ningún artefacto de este speckit (Principios III y IV de la constitución).

El enfoque técnico consiste en:
- Definir el contrato de API REST (`contracts/openapi.yaml`) que el frontend consumirá cuando se
  integre con el backend Java, cubriendo las operaciones de usuarios, publicaciones y reportes
  descritas en `spec.md`.
- Modelar el dominio de UI (`data-model.md`) con entidades orientadas a objetos (`Usuario`,
  `Publicacion`, `Reporte`) y los 6 enums obligatorios (`RolUsuario`, `EstadoCuentaUsuario`,
  `EstadoPublicacion`, `EstadoModeracion`, `MotivoReporte`, `PrioridadReporte`) que encapsulan las
  reglas de permisos y transición de estados descritas en `spec.md`.
- Documentar decisiones técnicas y alternativas evaluadas (`research.md`), incluyendo cómo resolver
  las ambigüedades A1–A7 de `spec.md` de forma que no bloqueen el diseño.
- Describir el flujo de validación manual de extremo a extremo (`quickstart.md`) para verificar, una
  vez implementado y conectado a una API (real o simulada), que las historias de usuario HU-01 a
  HU-10 funcionan correctamente.

Este plan **no crea código de frontend ni de backend**. Solo produce los artefactos de diseño
técnico (`plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`),
manteniendo trazabilidad explícita con `spec.md`.

## Technical Context

**Language/Version**: TypeScript (React 18+) para `frontend-admin/`. La API REST Java (versión y
framework) es responsabilidad de una iteración futura fuera de este speckit; no se asume ni se
re-evalúa su stack aquí más allá de "API REST de Java" (dato ya fijado por el encargo y la
constitución).

**Primary Dependencies**:
- React 18+, React Router (navegación SPA entre pantallas de usuarios/publicaciones/reportes).
- Cliente HTTP encapsulado en capa de infraestructura (fetch o axios, a definir en `research.md`),
  nunca invocado directamente desde componentes de presentación.
- Librería de testing: Vitest/Jest + Testing Library (alineado con el resto del monorepo, que ya usa
  Vitest en `Admin/my-proyect/frontend-admin` y `Union/frontend`).
- CSS simple (sin framework de estilos pesado), conforme al encargo ("CSS simple").

**Storage**: Ninguno propio del frontend. Toda persistencia (usuarios, publicaciones, reportes) es
responsabilidad exclusiva de la API REST Java que se integrará en una iteración futura; el frontend
no accede directamente a MySQL ni a ninguna base de datos (Principio VI, RF-26).

**Testing**:
- Tests unitarios de dominio (reglas de negocio encapsuladas en `Usuario`, `Publicacion`, `Reporte`).
- Tests de servicios/aplicación (casos de uso de gestión de usuarios, publicaciones y reportes) con
  cliente HTTP simulado (mock), sin backend real.
- Tests de permisos y acciones administrativas (control de rol ADMIN, restricciones sobre
  banear/eliminar/promover un ADMIN, estados finales de reportes).
- Tests de integración contra los contratos definidos en `contracts/openapi.yaml` (contract testing
  con mocks/fixtures, no contra un backend real, que no existe en este speckit).

**Target Platform**: Aplicación web SPA de escritorio (navegador moderno), uso interno de
administradores/moderadores. No se requiere soporte offline ni mobile-first.

**Project Type**: Frontend único (`frontend-admin/`). No se crea backend en este speckit ni en el
repositorio final derivado de él (Principio IV de la constitución: "Prohibido implementar backend,
incluso para pruebas").

**Performance Goals**: Listados de usuarios, publicaciones y reportes diseñados asumiendo paginación
y filtrado server-side (RNF-04 de `spec.md`); el frontend no implementa paginación/filtrado en
memoria sobre listas completas. No se definen objetivos de req/s: uso interno, bajo número de
administradores concurrentes.

**Constraints**:
- El frontend no implementa ninguna lógica de negocio de backend ni función de backend, ni siquiera
  para pruebas (Principio IV; RF-25).
- Los componentes de presentación no invocan directamente al cliente HTTP; toda comunicación externa
  pasa por la capa de servicios de aplicación (RNF-07).
- Toda regla de negocio crítica listada en la sección 6 de `spec.md` debe tener tests automatizados
  (Principio VIII; RNF-09).
- Toda acción administrativa destructiva requiere confirmación explícita en la interfaz (RF-23).
- El frontend no recalcula rankings, recomendaciones ni estadísticas complejas (RF-27).

**Scale/Scope**: 4 pantallas administrativas (gestión de usuarios, gestión de publicaciones,
promoción de usuarios, revisión de reportes —con exportación integrada como acción dentro de la
misma pantalla, resuelto Clarifications Session 2026-10-01—), 3 entidades de dominio de UI
(`Usuario`, `Publicacion`, `Reporte`) + 6 enums, ~13 operaciones de API consumidas.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluado contra `Union/.specify/memory/constitution.md` (v2.0.0):

| Principio constitucional | Cumplimiento en este plan |
|---|---|
| I. La especificación manda sobre la implementación | ✅ PASS. Las 4 pantallas y 3 entidades planificadas están trazadas 1:1 a las historias de usuario (HU-01..HU-10) y requisitos (RF-01..RF-27) de `spec.md`. No se agregan pantallas ni flujos fuera de lo declarado. |
| II. Dominio orientado a objetos real | ✅ PASS. `data-model.md` define `Usuario`, `Publicacion`, `Reporte` con métodos de negocio (`puedeSerBaneado()`, `puedeSerEliminada()`, `puedeAceptarse()`, etc.), no como DTOs anémicos. |
| III. La API Java no se implementa en este speckit | ✅ PASS. `contracts/openapi.yaml` documenta únicamente el contrato que el frontend consumirá en una iteración futura; no se genera ni planifica código de servidor. |
| IV. Prohibido implementar backend, incluso para pruebas | ✅ PASS. Los tests de servicios e integración usan clientes HTTP simulados (mocks/fixtures locales al frontend), nunca un servidor real o embebido. |
| V. Separación de responsabilidades por capa | ✅ PASS. La estructura de proyecto (`frontend-admin/src/{dominio,aplicacion,presentacion,infraestructura}`) refleja explícitamente las capas exigidas. |
| VI. Frontend administrativo autónomo y de responsabilidad acotada | ✅ PASS. `frontend-admin/` es la única aplicación planificada; no incluye ninguna pantalla de usuario final ni acceso directo a MySQL. |
| VII. Enums y value objects para valores cerrados | ✅ PASS. Los 6 enums obligatorios (`EstadoPublicacion`, `RolUsuario`, `EstadoCuentaUsuario`, `EstadoModeracion`, `MotivoReporte`, `PrioridadReporte`) se documentan en `data-model.md` y se reflejan como esquemas `enum` en `contracts/openapi.yaml`. |
| VIII. Tests obligatorios de reglas de negocio | ✅ PASS (a nivel de plan). La sección de Testing de este plan y `quickstart.md` detallan qué reglas requieren test unitario/integración, trazadas a la sección 6 de `spec.md`. La ejecución real se define en la fase de tasks. |
| IX. Seguridad validada en backend, reflejada en frontend | ✅ PASS. `research.md` documenta explícitamente que ninguna restricción de UI reemplaza la autorización del backend futuro. |
| X. Escalabilidad por diseño | ✅ PASS. Todos los listados planificados en `contracts/openapi.yaml` usan paginación/filtros server-side; no se diseña ningún filtrado en memoria de listas completas. |
| XI. Usabilidad, claridad y rendimiento | ✅ PASS. Las 4 pantallas se diseñan con foco en mínima cantidad de pasos por acción (ver `quickstart.md`). |
| XII. Eficiencia operativa del administrador/moderador | ✅ PASS. La pantalla de reportes prioriza estado/prioridad visibles desde el listado (RNF-02 de `spec.md`). |
| XIII. Confirmación explícita en acciones destructivas | ✅ PASS. Todas las acciones sensibles (banear, eliminar, promover usuario; editar, eliminar publicación) se modelan con un paso de confirmación explícita en `data-model.md`/`quickstart.md`. |
| XIV. Analytics y recomendaciones fuera del frontend | ✅ PASS. No se planifica ningún cálculo de rankings/recomendaciones/estadísticas en el frontend. |
| XV. Prohibición de código en fases de especificación | ✅ PASS. Este plan no contiene código; solo documentos de diseño. |

**Resultado**: Sin violaciones. No se requiere completar la tabla de Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-admin/
├── plan.md               # Este archivo (/speckit.plan)
├── research.md           # Fase 0 (/speckit.plan)
├── data-model.md         # Fase 1 (/speckit.plan)
├── quickstart.md         # Fase 1 (/speckit.plan)
├── contracts/
│   └── openapi.yaml      # Fase 1 (/speckit.plan)
└── tasks.md              # Fase 2 (/speckit.tasks - NO generado por /speckit.plan)
```

### Source Code (repository root)

El repositorio final del proyecto (fuera del repo meta de especificación) tendrá, para este módulo,
la siguiente estructura de alto nivel:

```text
frontend-admin/                   # Único proyecto planificado en este documento
├── src/
│   ├── routes/                  # Enrutador principal y guardia de acceso por rol
│   │   └── AppRoutes.tsx
│   ├── presentation/            # Componentes React por pantalla
│   │   ├── shared/              # Layout, ConfirmDialog, AccionSensibleBoton, guardia de rol, etc.
│   │   ├── usuarios/            # Pantalla: gestión de usuarios (banear, eliminar)
│   │   ├── promocion/           # Pantalla: promoción de usuarios a ADMIN
│   │   ├── publicaciones/       # Pantalla: gestión de publicaciones (editar, eliminar)
│   │   └── reportes/            # Pantalla: revisión de reportes (ver, aceptar, rechazar) y
│   │                             # exportación (botón "Exportar" integrado en el mismo listado,
│   │                             # sin ruta/pantalla separada — resuelto, Clarifications
│   │                             # Session 2026-10-01)
│   ├── domain/                  # Modelos de UI (dominio ligero, orientado a objetos)
│   │   ├── Usuario.ts
│   │   ├── Publicacion.ts
│   │   ├── Reporte.ts
│   │   └── enums/               # RolUsuario, EstadoCuentaUsuario, EstadoPublicacion,
│   │                             # EstadoModeracion, MotivoReporte, PrioridadReporte
│   ├── application/             # Servicios / casos de uso administrativos
│   │   ├── UsuariosService.ts
│   │   ├── PublicacionesService.ts
│   │   ├── ReportesService.ts
│   │   ├── ExportacionService.ts
│   │   └── dto/                 # Objetos de transporte/resultado (no-dominio): FiltroReportes,
│   │                             # ResultadoExportacion (resuelto, Clarifications Session 2026-10-01)
│   └── infrastructure/          # Cliente HTTP, sesión y endpoints (apuntando a API futura)
│       ├── httpClient.ts
│       ├── apiEndpoints.ts
│       └── sessionGuard.ts
└── tests/
    ├── domain/                  # Tests unitarios de reglas de Usuario/Publicacion/Reporte
    ├── application/             # Tests de servicios con cliente HTTP simulado
    ├── presentation/            # Tests de componentes (permisos visibles, confirmaciones)
    └── integration/             # Tests de integración contra contratos de la API (mocks)
```

**Structure Decision**: Se adopta un único proyecto `frontend-admin/` (sin backend ni frontend de
usuario en este speckit), con arquitectura por capas (`presentation` / `domain` / `application` /
`infrastructure`) exigida por el Principio V de la constitución. Esta estructura es consistente con
la ya usada en `Admin/my-proyect/frontend-admin` del monorepo, reutilizando convenciones probadas
(separación por pantalla dentro de `presentation/`, enums en `domain/enums/`, un servicio de
aplicación por entidad principal). **Actualización (Clarifications Session 2026-10-01)**: la
exportación de reportes (HU-09) ya no es una pantalla/ruta separada; se integra como una acción
(`ExportarReportesAction`) dentro de `presentation/reportes/`, consumiendo el mismo
`FiltroReportes` activo en el listado. `FiltroReportes` y `ResultadoExportacion` se ubican en
`application/dto/` (no en `domain/`), por tratarse de objetos de transporte de casos de uso y no de
entidades de dominio persistente.

## Complexity Tracking

> No aplica: el Constitution Check no registró violaciones que requieran justificación.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| N/A | N/A | N/A |
