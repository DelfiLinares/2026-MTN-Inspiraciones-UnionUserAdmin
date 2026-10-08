# Implementation Plan: Frontend de Perfil — Gestión de Perfil, Carpetas y Publicaciones Propias

**Branch**: `004-inspiraciones-perfil` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-inspiraciones-perfil/spec.md` + Clarifications from
`clarifications.md` (A1–A10 resolved)

**Note**: Este plan corresponde únicamente al diseño técnico. No se implementa código en esta fase,
en línea con el Principio XV ("Prohibición de código en fases de especificación") de
`Union/.specify/memory/constitution.md` (v3.0.0).

---

## Summary

El requisito principal es diseñar técnicamente un **frontend React compartido** para usuarios y
administradores que, dentro del módulo de **perfil**, permita:
1. Visualizar el perfil propio y el de otros usuarios
2. Editar datos del perfil propio (foto, nombre de usuario, sobre mí, descripción)
3. Crear, renombrar y eliminar carpetas de posts guardados
4. Guardar y quitar posts de carpetas
5. Editar y eliminar publicaciones propias
6. Seguir a otros usuarios

El frontend consumirá en una **iteración futura** una API REST Java ya provista externamente; dicha
API **no se implementa** en este plan ni en ningún artefacto de este speckit (Principios III y IV de
la constitución).

El enfoque técnico consiste en:
- Definir el contrato de API REST (`contracts/openapi.yaml`) que el frontend consumirá cuando se
  integre con el backend Java, cubriendo las operaciones de perfil, carpetas, posts y seguimiento
  descritas en `spec.md` y clarificadas en `clarifications.md`.
- Modelar el dominio de UI (`data-model.md`) con entidades orientadas a objetos (`Usuario`,
  `CarpetaPost`, `Publicacion`) y los 2 enums obligatorios (`RolUsuario`, `EstadoCuentaUsuario`)
  que encapsulan las reglas de permisos y validaciones descritas en `spec.md`.
- Documentar decisiones técnicas y clarificaciones aplicadas (`research.md`), incluyendo cómo los
  ambigüedades A1–A10 de `clarifications.md` se resuelven en el diseño sin bloquear la
  implementación.
- Describir el flujo de validación manual de extremo a extremo (`quickstart.md`) para verificar, una
  vez implementado y conectado a una API (real o simulada), que las historias de usuario HU-01 a
  HU-13 funcionan correctamente.

Este plan **no crea código de frontend ni de backend**. Solo produce los artefactos de diseño
técnico (`plan.md`, `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`),
manteniendo trazabilidad explícita con `spec.md` y `clarifications.md`.

---

## Technical Context

**Language/Version**: TypeScript (React 18+) para el frontend de perfil. Se integra en la aplicación
existente `Union/frontend/` (que ya es compartida por usuarios y administradores a partir de v3.0.0
de la constitución). La API REST Java es responsabilidad de una iteración futura fuera de este
speckit; no se asume ni se re-evalúa su stack aquí más allá de "API REST de Java".

**Primary Dependencies**:
- React 18+, React Router (navegación SPA; perfil propio, perfil ajeno, flujos de edición de
  carpetas).
- Cliente HTTP encapsulado en capa de infraestructura (fetch o axios, a definir en `research.md`),
  nunca invocado directamente desde componentes de presentación.
- Librería de testing: Vitest/Jest + Testing Library (alineado con el resto del monorepo).
- CSS simple (sin framework de estilos pesado).

**Storage**: Ninguno propio del frontend. Toda persistencia (usuarios, carpetas, posts) es
responsabilidad exclusiva de la API REST Java que se integrará en una iteración futura; el frontend
no accede directamente a MySQL ni a ninguna base de datos (Principio VI, RF-43).

**Testing**:
- Tests unitarios de dominio (reglas de negocio encapsuladas en `Usuario`, `CarpetaPost`,
  `Publicacion`).
- Tests de servicios/aplicación (casos de uso de perfil, carpetas, posts) con cliente HTTP
  simulado (mock), sin backend real.
- Tests de permisos y acciones sobre el propio perfil (restricción de edición, visibilidad de
  carpetas públicas).
- Tests de validación de campos (username, sobre mí, descripción, nombre de carpeta).
- Tests de confirmación explícita (eliminar carpeta, editar/eliminar post, cambiar username).
- Tests de integración contra los contratos definidos en `contracts/openapi.yaml` (contract
  testing con mocks/fixtures, no contra un backend real).

**Target Platform**: Aplicación web SPA de escritorio (navegador moderno), uso por usuarios y
administradores. No se requiere soporte offline ni mobile-first.

**Project Type**: Extensión de `Union/frontend/` existente (no nuevo proyecto). El módulo de perfil
se agrega a la estructura existente.

**Performance Goals**: Listados de carpetas diseñados asumiendo paginación server-side (RNF-07 de
`spec.md`); el frontend no implementa paginación en memoria sobre listas completas. Optimistic
updates para seguimiento (A4 en `clarifications.md`) mejoran UX sin afectar consistencia final.

**Constraints**:
- El frontend no implementa ninguna lógica de negocio de backend ni función de backend, ni siquiera
  para pruebas (Principio IV; RF-43).
- Los componentes de presentación no invocan directamente al cliente HTTP; toda comunicación externa
  pasa por la capa de servicios de aplicación (RNF-11).
- Toda regla de negocio crítica listada en la sección 6 de `spec.md` debe tener tests automatizados
  (Principio VIII; RNF-15).
- Toda acción destructiva requiere confirmación explícita en la interfaz (Principio XIII).
- El frontend no recalcula rankings, recomendaciones ni estadísticas complejas (RF-49).
- **Rol-agnosticidad**: Dentro de este módulo, `USER` y `ADMIN` tienen exactamente las mismas
  capacidades (Principio VI, §1.3 de `spec.md`). Las distinciones de rol pertenecen al módulo
  002-frontend-admin.

**Scale/Scope**: Módulo de perfil integrado en `Union/frontend/`, con:
- 3 pantallas (perfil propio, perfil ajeno, edición de perfil)
- 3 entidades de dominio de UI (`Usuario`, `CarpetaPost`, `Publicacion`)
- 2 enums obligatorios (`RolUsuario`, `EstadoCuentaUsuario`)
- ~30 operaciones de API consumidas (GET perfil, POST/PUT/DELETE carpetas, GET posts, etc.)

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluado contra `Union/.specify/memory/constitution.md` (v3.0.0):

| Principio constitucional | Cumplimiento en este plan |
|---|---|
| I. La especificación manda sobre la implementación | ✅ PASS. Las 3 pantallas y 3 entidades planificadas están trazadas 1:1 a las historias de usuario (HU-01..HU-13) y requisitos (RF-01..RF-49) de `spec.md`. Las 10 clarificaciones (A1–A10) de `clarifications.md` se incorporan al diseño. |
| II. Dominio orientado a objetos real | ✅ PASS. `data-model.md` define `Usuario`, `CarpetaPost`, `Publicacion` con métodos de negocio (`puedeEditarPerfil()`, `puedeCrearCarpeta()`, `puedeEditarPost()`, etc.), no como DTOs anémicos. |
| III. La API Java no se implementa en este speckit | ✅ PASS. `contracts/openapi.yaml` documenta únicamente el contrato que el frontend consumirá en una iteración futura; no se genera código de servidor. |
| IV. Prohibido implementar backend, incluso para pruebas | ✅ PASS. Los tests de servicios e integración usan clientes HTTP simulados (mocks/fixtures locales al frontend), nunca un servidor real o embebido. |
| V. Separación de responsabilidades por capa | ✅ PASS. La estructura de proyecto (`Union/frontend/src/{dominio,aplicacion,presentacion,infraestructura}`) refleja explícitamente las capas exigidas. |
| VI. Frontend autónomo y de responsabilidad acotada | ✅ PASS. El módulo de perfil es rol-agnóstico dentro de `Union/frontend/`; no incluye acceso directo a MySQL. |
| VII. Enums y value objects para valores cerrados | ✅ PASS. Los 2 enums obligatorios (`RolUsuario`, `EstadoCuentaUsuario`) se documentan en `data-model.md` y se reflejan en `contracts/openapi.yaml`. |
| VIII. Tests obligatorios de reglas de negocio | ✅ PASS (a nivel de plan). La sección de Testing detalla qué reglas requieren test unitario/integración, trazadas a las 13 reglas de sección 6 de `spec.md`. |
| IX. Seguridad validada en backend, reflejada en frontend | ✅ PASS. `research.md` documenta que validaciones de uniqueness (A1, A3) y autorización (A4, A10) las hace el backend; el frontend refleja errores sin reimplementar. |
| X. Escalabilidad por diseño | ✅ PASS. La paginación de carpetas (A6) es server-side; el frontend no carga listas completas en memoria. |
| XI. Usabilidad, claridad y rendimiento | ✅ PASS. Las 3 pantallas se diseñan con foco en mínima cantidad de pasos por acción (ver `quickstart.md`). Optimistic updates (A4) mejoran UX. |
| XII. Eficiencia operativa | ✅ PASS. Las confirmaciones explícitas (A7) son claras e informativas; eliminar carpeta advierte sobre pérdida de posts guardados sin eliminar posts reales. |
| XIII. Confirmación explícita en acciones destructivas | ✅ PASS. Eliminar carpeta, editar/eliminar post, cambiar username requieren confirmación (A1, A7). |
| XIV. Analytics y recomendaciones fuera del frontend | ✅ PASS. No se planifica ningún cálculo de rankings/recomendaciones en el frontend. |
| XV. Prohibición de código en fases de especificación | ✅ PASS. Este plan no contiene código; solo documentos de diseño. |

**Resultado**: Sin violaciones. No se requiere completar la tabla de Complexity Tracking.

---

## Project Structure

### Documentation (this feature)

```text
specs/004-inspiraciones-perfil/
├── plan.md                    # Este archivo (/speckit.plan)
├── research.md                # Fase 0 (/speckit.plan)
├── data-model.md              # Fase 1 (/speckit.plan)
├── quickstart.md              # Fase 1 (/speckit.plan)
├── contracts/
│   └── openapi.yaml           # Fase 1 (/speckit.plan)
├── spec.md                    # Especificación (reference)
├── clarifications.md          # Clarificaciones A1–A10 (reference)
├── clarifications-traceability.md  # Trazabilidad de clarificaciones (reference)
└── tasks.md                   # Fase 2 (/speckit.tasks - NOT GENERATED HERE)
```

### Source Code (repository root)

El repositorio final tendrá, para este módulo, la siguiente estructura integrada en `Union/frontend/`:

```text
Union/frontend/
├── src/
│   ├── domain/                    # Entidades de UI + enums
│   │   ├── Usuario.ts
│   │   ├── CarpetaPost.ts
│   │   ├── Publicacion.ts
│   │   ├── enums/
│   │   │   ├── RolUsuario.ts
│   │   │   └── EstadoCuentaUsuario.ts
│   │   └── SeguimientoRelacion.ts  # Value object para seguimiento (A4)
│   │
│   ├── application/               # Servicios / casos de uso
│   │   ├── UsuarioPerfilService.ts    # Editar perfil, cambiar foto, cambiar username
│   │   ├── CarpetaService.ts          # CRUD de carpetas
│   │   ├── PublicacionService.ts      # Editar/eliminar posts propios
│   │   ├── SeguimientoService.ts      # Seguir/dejar de seguir usuarios
│   │   └── dto/                       # DTOs de aplicación (no dominio)
│   │       ├── FiltroUsuarios.ts      # Para búsqueda/paginación de carpetas
│   │       └── ResultadoValidacion.ts # Para errores de validación
│   │
│   ├── presentation/              # Componentes React por funcionalidad
│   │   ├── shared/                # Layout, ConfirmDialog, ErrorMessage, etc.
│   │   ├── perfil/                # Pantalla: perfil propio/ajeno
│   │   │   ├── PerfilPage.tsx
│   │   │   ├── PerfilPropio.tsx
│   │   │   ├── PerfilAjeno.tsx
│   │   │   ├── EditarPerfilForm.tsx
│   │   │   └── PhotoUploadField.tsx (A2)
│   │   ├── carpetas/              # Componentes: gestión de carpetas
│   │   │   ├── CarpetaList.tsx
│   │   │   ├── CreateCarpetaDialog.tsx
│   │   │   ├── RenameCarpetaDialog.tsx
│   │   │   └── ConfirmDeleteCarpetaDialog.tsx (A7)
│   │   ├── publicaciones/         # Componentes: editar/eliminar posts
│   │   │   ├── PublicacionList.tsx
│   │   │   ├── EditPostForm.tsx (A5)
│   │   │   ├── ConfirmDeletePostDialog.tsx
│   │   │   └── SavePostToCarpetaDialog.tsx
│   │   └── seguimiento/           # Componentes: seguir usuario
│   │       └── FollowButton.tsx (A4)
│   │
│   ├── infrastructure/            # Cliente HTTP, sesión, endpoints
│   │   ├── httpClient.ts
│   │   ├── apiEndpoints.ts
│   │   └── sessionGuard.ts
│   │
│   └── routes/                    # Enrutador principal
│       └── AppRoutes.tsx          # Navega a /perfil, /perfil/:id, etc.
│
└── tests/
    ├── domain/                    # Tests unitarios de Usuario/CarpetaPost/Publicacion
    ├── application/               # Tests de servicios con cliente HTTP simulado
    ├── presentation/              # Tests de componentes (validaciones, confirmaciones)
    └── integration/               # Tests de integración contra contratos
```

**Structure Decision**: El módulo de perfil se integra en `Union/frontend/` compartido (no nuevo
proyecto). Se adopta la arquitectura por capas (`presentation` / `domain` / `application` /
`infrastructure`) exigida por el Principio V. Dentro de `presentation/`, se agrupan por
funcionalidad (perfil, carpetas, publicaciones, seguimiento) en lugar de por pantalla, evitando
solapamiento de lógica. Las clarificaciones A2, A4, A5, A7 introducen nuevos componentes
(`PhotoUploadField`, `FollowButton`, `EditPostForm`, `ConfirmDeleteCarpetaDialog`) que se
documentan explícitamente en su sección correspondiente de este plan.

---

## Implementation Phases

Se estructura el trabajo en **5 fases**, alineadas con las fases de Module 002 y con las
clarificaciones A1–A10:

### Phase 0: Research & Technical Decisions
- **Output**: `research.md`, resolución de decisiones técnicas y ambigüedades
- **Tasks**: Definir cliente HTTP, definir cómo manejar ausencia de backend, resolver impactos de
  clarificaciones (A1–A10) en el diseño
- **Estimate**: Parte de este plan (`/speckit.plan`)

### Phase 1: Domain Model & API Contracts
- **Output**: `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`
- **Deliverables**: Entidades (`Usuario`, `CarpetaPost`, `Publicacion`), enums
  (`RolUsuario`, `EstadoCuentaUsuario`), value objects, reglas de negocio, servicios de aplicación,
  contratos de API
- **Estimate**: Parte de este plan (`/speckit.plan`)

### Phase 2: Presentation Layer Design
- **Output**: Especificación de pantallas y componentes, flujos de usuario
- **Tasks**: Diseñar pantalla de perfil propio, perfil ajeno, edición, diálogos de carpetas,
  confirmaciones (A7, A1)
- **Estimate**: Fase de `tasks.md` (tasks T020–T050)

### Phase 3: Application Services & Infrastructure
- **Output**: Implementación de servicios, cliente HTTP, manejo de errores
- **Tasks**: `UsuarioPerfilService`, `CarpetaService`, `PublicacionService`, `SeguimientoService`,
  error handling para uniqueness (A1, A3), file upload (A2), optimistic updates (A4)
- **Estimate**: Fase de `tasks.md` (tasks T051–T085)

### Phase 4: Testing & Integration
- **Output**: Tests unitarios, integración, validación contra clarificaciones
- **Tasks**: Domain tests (13 reglas), service tests (A1–A10), component tests (confirmaciones,
  validaciones), integration tests (contratos de API)
- **Estimate**: Fase de `tasks.md` (tasks T086–T120)

### Phase 5: Documentation & Validation
- **Output**: Documentación, validación manual (quickstart), cierre
- **Tasks**: Validación manual de HU-01 a HU-13, documentation review, Constitution Check final
- **Estimate**: Fase de `tasks.md` (tasks T121–T130)

---

## Key Design Decisions

### A1 Incorporation: Username Uniqueness
- Backend valida uniqueness; frontend refleja errores con mensaje claro
- Form state persiste después de error
- Confirmación explícita requerida para cambio de username (AC-02.6)

### A2 Incorporation: Profile Photo Restrictions
- Nuevo componente `PhotoUploadField` con preview
- Formatos: JPEG, PNG, WebP; max 5 MB
- Client-side size validation opcional; backend es authoritative
- Error handling en `UsuarioPerfilService.cambiarFoto()`

### A3 Incorporation: Folder Name Uniqueness
- Backend valida uniqueness por usuario
- Diálogos de crear/renombrar muestran error si nombre duplicado
- `CarpetaService` captura error 409 Conflict

### A4 Incorporation: Follow/Unfollow Toggle
- Botón único "Seguir" / "Dejar de seguir"
- Optimistic UI update: cambia estado inmediatamente
- Error rollback: si falla backend, vuelve al estado anterior
- Nuevo valor object `SeguimientoRelacion` (estado binario)

### A5 Incorporation: Editable Post Fields
- `EditPostForm` solo permite editar texto
- Campo de imagen es read-only
- `PublicacionService.editarPost()` solo envía `nuevoTexto`

### A6 Incorporation: Server-Side Pagination
- `CarpetaService.listarCarpetas(usuarioId, limit, offset)`
- Default limit: 10 carpetas por request
- Frontend implementa infinite scroll o "Load More"
- Nunca carga todas las 50 carpetas en memoria

### A7 Incorporation: Folder Deletion Safety
- Nuevo componente `ConfirmDeleteCarpetaDialog`
- Muestra advertencia: "Se eliminarán todos los posts guardados en [nombre], pero los posts originales seguirán en la plataforma"
- `CarpetaService.eliminarCarpeta()` ejecuta sin condición (posts existen o no)

### A8 Incorporation: Idempotent Save
- `PublicacionService.guardarPostEnCarpeta()` detecta duplicados
- Returns success incluso si ya estaba guardado
- Mensaje: "✅ El post ya está guardado en esta carpeta"
- No crea entrada duplicada

### A9 Incorporation: No Privacy Settings
- `CarpetaPost` NO tiene campo `privacidad`
- Todas las carpetas son públicamente visibles
- No hay toggles de privacidad en la UI
- Explícitamente fuera de alcance (A9)

### A10 Incorporation: Banned/Deleted Profile Visibility
- `UsuarioPerfilService.obtenerPerfil()` maneja 404/403
- Nuevo componente `ProfileNotFoundView`
- Mensaje: "Este perfil no está disponible. La cuenta ha sido eliminada o está deshabilitada."
- No muestra botón "Seguir" para perfiles no disponibles

---

## Complexity Tracking

> No aplica: el Constitution Check no registró violaciones que requieran justificación.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|---------------------------------------|
| N/A | N/A | N/A |

---

## Next Steps (after this plan)

1. **Phase 0 Execution**: Generate `research.md` (define client HTTP, clarification resolutions)
2. **Phase 1 Execution**: Generate `data-model.md`, `contracts/openapi.yaml`, update `quickstart.md`
3. **Phase 2**: `/speckit.tasks` to generate `tasks.md` with T001–T130+
4. **Phase 3+**: Execute tasks in order

---

**Status**: ✅ PLAN COMPLETE
**Ready for Phase 0 (research.md generation)**: YES

