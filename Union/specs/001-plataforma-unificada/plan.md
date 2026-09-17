# Implementation Plan: Plataforma Unificada — Red Social de Inspiración Artística (Frontend)

**Branch**: `001-plataforma-unificada` | **Date**: 2026-09-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/Union/specs/001-plataforma-unificada/spec.md`

**Note**: Este plan corresponde únicamente al diseño técnico de **ambos frontends** (usuario y
administración). No se implementa código en esta fase, en línea con el Principio XVIII de
`.specify/memory/constitution.md` ("Prohibición de código en fases de especificación").

## Summary

El requisito principal es diseñar la arquitectura técnica de **dos aplicaciones SPA React
desacopladas** que consumen una única API REST externa (backend Java/Spring Boot + MySQL, fuera de
alcance):

- **`frontend/`** — Frontend de Usuario: implementa HU-01 a HU-09 de `spec.md` (like, publicar con
  tags, buscar/filtrar, reportar, login, registro, editar perfil, seguir, carpetas).
- **`frontend-admin/`** — Frontend de Administración/Moderación: implementa HU-10 a HU-15 de
  `spec.md` (login admin, moderación de publicaciones/reportes, gestión de usuarios, dashboard,
  gestión de desafíos, reportes/analíticas exportables).

Ambas aplicaciones son **proyectos independientes** (repos/carpetas separadas, sin código
compartido en tiempo de ejecución), pero comparten el mismo enfoque arquitectónico exigido por el
Principio III de la constitución: **4 capas estrictamente separadas** (presentación,
dominio/modelos de UI, aplicación/servicios, infraestructura), el mismo stack técnico (React +
Vite + TypeScript) y las mismas convenciones de manejo de sesión, estados de carga, confirmación de
acciones destructivas y resolución de listados vía API (nunca filtrado en memoria).

Ningún frontend implementa persistencia, generación de analytics, generación de archivos de
reportes ni integraciones externas: solo consumen los resultados expuestos por la API, según
Principio X (`spec.md`) y RF-71/RF-72 (reportes exportables) y RNF-05 (escalabilidad de listados).

## Technical Context

**Language/Version**: TypeScript 5.x sobre React 18 (Vite como build tool/dev server), en ambas
aplicaciones.

**Primary Dependencies**:
- React, React Router (navegación y guards de rutas protegidas / rutas restringidas a ADMIN).
- Cliente HTTP propio (fetch nativo envuelto en un módulo de infraestructura) — decisión y
  alternativas evaluadas en `research.md`.
- CSS simple sin frameworks de UI pesados (módulos CSS o CSS plano por componente), según stack
  compartido indicado.
- Vitest + React Testing Library para tests unitarios/integración.

**Storage**: N/A en ambos frontends (no hay persistencia propia). Toda persistencia ocurre en el
backend Java/Spring Boot + MySQL vía API REST (fuera de alcance). El único almacenamiento local
relevante es el del token de sesión (JWT) y estado efímero de UI (cache en memoria de resultados
paginados, borradores de formularios no persistidos, filtros activos).

**Testing**: Vitest + React Testing Library, con foco prioritario en las reglas de negocio de
cliente identificadas como críticas en RNF-14 del `spec.md` unificado (visibilidad de acciones
según autoría/rol, restricciones de banear/eliminar/promover, confirmación de acciones
destructivas).

**Target Platform**: Navegador web (dos SPA independientes), responsive para desktop y mobile web
en `frontend/`; `frontend-admin/` orientado a uso de escritorio/backoffice (sin requerimiento
mobile-first).

**Project Type**: Web application — **dos proyectos de frontend independientes** (`frontend/` y
`frontend-admin/`), sin incluir el backend (`backend/`) en el alcance de este plan.

**Performance Goals** (trazados a RNF de `spec.md`):
- Percepción de like/seguir optimista en ≤200ms (RNF-01).
- Publicación completada en interacción de cliente ≤60s, respuesta de creación ≤5s (RNF-02).
- Primeros resultados de búsqueda con filtros en ≤2s (RNF-03).
- Acceso admin: login → dashboard en ≤10s en condiciones normales de red (RNF-04).
- Listados (usuarios, publicaciones, reportes, desafíos) con tiempos de respuesta consistentes
  independientemente del volumen, vía paginación/filtrado server-side (RNF-05).

**Constraints** (trazados a Principios de constitución y RF/RNF de `spec.md`):
- Componentes de presentación NUNCA invocan fetch/axios directamente (Principio VI de
  constitución; RNF-15).
- Filtros y listados SIEMPRE resueltos contra la API, nunca en memoria de cliente (RNF-05, RNF-10).
- El frontend de usuario NUNCA opera con rol ADMIN ni muestra pantallas/acciones de
  moderación/administración (RF-15).
- El frontend administrativo NUNCA implementa pantallas de usuario final fuera de su alcance
  (sección "Fuera de Alcance" de `spec.md`).
- Toda acción destructiva o administrativa sensible requiere confirmación explícita (RF-57, RF-58,
  RF-59, RF-63; RNF-07).
- Toda regla de negocio de cliente identificada como crítica DEBE tener test automatizado
  (RNF-14).
- La autorización crítica (acceso a módulo admin, restricciones sobre roles) es responsabilidad del
  backend; el frontend solo refleja dicho estado (RNF-06).

**Scale/Scope**:
- `frontend/`: 8 pantallas (cuestionario, registro, login, home, desafíos, descubrir, perfil,
  editar perfil) + interacciones transversales (like, reportar, seguir, guardar en carpeta) sobre
  publicaciones; límites confirmados: 10 tags por publicación, 100 carpetas por usuario.
- `frontend-admin/`: 6 pantallas (login admin, dashboard, gestión de usuarios, moderación de
  publicaciones/reportes, gestión de desafíos, reportes/analíticas exportables).
- 10 entidades de dominio de UI en total (5 de usuario + 5 de administración, ver `data-model.md`;
  corregido en sesión de clarificación 2026-09-17 — antes decía erróneamente "9 / 4 administración").

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Evaluado contra `.specify/memory/constitution.md` (Inspiraciones Union Constitution v1.0.0):

| Principio | Verificación | Estado |
|---|---|---|
| I. La especificación manda sobre la implementación | Las 15 historias de usuario planificadas (HU-01–HU-15) y las 14 pantallas (8 usuario + 6 admin) están trazadas 1:1 a `spec.md`. No se agrega ninguna pantalla o funcionalidad no listada allí. | ✅ PASS |
| II. Dominio orientado a objetos real | `data-model.md` define **10 entidades** de UI (`Publicacion`, `Usuario`, `Filtro`, `Carpeta`, `Desafio`, `UsuarioAdmin`, `PublicacionModeracion`, `Reporte`, `DesafioPropuesto`, `ExportacionReporte`) con métodos que encapsulan reglas (`puedeEditar()`, `puedeDarLike()`, `puedeBanear()`, `puedeAprobarse()`, `puedeSerDegradado()`, etc.), no como DTOs anémicos. | ✅ PASS |
| III. Separación estricta por capas | La estructura de proyecto (sección "Project Structure") define 4 capas explícitas en `frontend/` y en `frontend-admin/`; ningún componente de presentación importa el cliente HTTP directamente. | ✅ PASS |
| IV. Frontends separados y con límites claros | `frontend/` y `frontend-admin/` son carpetas/proyectos independientes, sin acceso directo a MySQL ni responsabilidades de backend en ninguno de los dos. | ✅ PASS |
| V. Backend Java limpio y delegación correcta | Fuera de alcance de este plan (no se planifica backend); los contratos consumidos se documentan en `contracts/api-contracts.md` para que el equipo de backend los implemente sin lógica de negocio en el cliente. | ✅ PASS (N/A directo) |
| VI. Frontend en capas, sin llamadas directas desde componentes | Ambas estructuras de proyecto ubican el cliente HTTP exclusivamente en `infrastructure/`, invocado únicamente desde `services/`/`application/`. | ✅ PASS |
| VII. Enums y value objects para valores cerrados | `data-model.md` define `TipoContenido`, `EstadoPublicacion`, `TipoFiltro`, `RolUsuario`, `MotivoReporte`, `EstadoModeracion`, `EstadoDesafioPropuesto` como enums tipados en ambos frontends. | ✅ PASS |
| VIII. Tests obligatorios de reglas de negocio | Sección de Testing en Technical Context + `quickstart.md` listan explícitamente las reglas de negocio críticas de RNF-14 (`spec.md`) mapeadas a métodos de dominio testeables de forma aislada, en ambos frontends. | ✅ PASS |
| IX. Seguridad en backend, reflejo en frontend | El diseño asume que backend valida rol/sesión en cada operación sensible (RNF-06); el frontend solo oculta/deshabilita visualmente como refuerzo de UX, nunca como único control. | ✅ PASS |
| X. Escalabilidad por diseño | Todos los listados planificados (feed, descubrir, usuarios, publicaciones reportadas, reportes, desafíos) usan paginación/scroll infinito y filtros server-side (RNF-05); analíticas consumen datos ya agregados. | ✅ PASS |
| XI. UX de descubrimiento como prioridad | La pantalla Descubrir se diseña con filtros por estilo/técnica/tipo de contenido/distancia, chips removibles y estados vacíos claros (HU-03, RF-40–RF-47). | ✅ PASS |
| XII. Eficiencia operativa del frontend administrativo | El dashboard y los listados de moderación incluyen indicadores de prioridad/antigüedad (RF-65) y acceso a un reporte específico en ≤3 interacciones (RNF-13). | ✅ PASS |
| XIII. Confirmación explícita en acciones destructivas | Baneo, eliminación de usuario/publicación y promoción a ADMIN requieren modal de confirmación explícita en el diseño de ambos frontends (RF-57–RF-59, RF-63). | ✅ PASS |
| XIV. Analytics y recomendaciones fuera del frontend | El dashboard y reportes/analíticas solo visualizan datos agregados provistos por el backend (RF-55, RF-71); ningún cálculo de rankings/recomendaciones se planifica en el cliente. | ✅ PASS |
| XV. Integraciones externas con cacheo responsable | No aplica directamente a este plan (no hay integración de música/YouTube en el alcance de `spec.md` unificado); se deja constancia como N/A. | ✅ PASS (N/A) |
| XVI. Eventos y notificaciones desacoplados | No aplica directamente (no hay pantallas de notificaciones en el alcance actual de `spec.md`); se deja constancia como N/A. | ✅ PASS (N/A) |
| XVII. Reportes exportables generados en backend/procesamiento | La exportación de reportes se diseña como una llamada síncrona a la API que devuelve el archivo ya generado (RF-72); `frontend-admin/` solo dispara la solicitud y ofrece la descarga. | ✅ PASS |
| XVIII. Prohibición de código en fases de especificación | Este plan y sus artefactos asociados (`research.md`, `data-model.md`, `contracts/`, `quickstart.md`) no contienen código de producción. | ✅ PASS |

**Resultado del Gate**: Todos los principios aplicables PASAN (dos marcados N/A por no estar en el
alcance funcional de `spec.md`). No se requiere completar `Complexity Tracking`.

## Estrategia de Estado Global vs. Local

Aplicable a ambos frontends, con matices propios de cada uno:

| Tipo de estado | Ubicación | Ejemplos |
|---|---|---|
| **Estado global de sesión** (usuario autenticado, rol, token) | Contexto de React único por aplicación (`AuthContext` en `frontend/`, `AuthAdminContext` en `frontend-admin/`), inicializado en `infrastructure/` y expuesto vía `application/services`. | Usuario actual, rol, estado de expiración de sesión. |
| **Estado global de UI transversal** | Contexto o store liviano por aplicación, sin librerías externas de estado global (no mencionadas en specs originales — Principio de no agregar tecnología no especificada). | Notificaciones no bloqueantes (toasts), estado de conexión de red. |
| **Estado local de pantalla/formulario** | `useState`/`useReducer` dentro del componente de presentación o su hook de contenedor asociado en `services/`. | Formulario de publicación, formulario de edición de perfil, filtros activos de Descubrir, estado de un modal de confirmación. |
| **Estado de datos remotos paginados** | Hook de aplicación dedicado (`useInfiniteList`, `useUsuariosAdmin`, etc.) que orquesta la llamada a `services/` y mantiene el estado de páginas/scroll en el componente contenedor, nunca en un store global compartido entre pantallas. | Feed de home, resultados de Descubrir, listado de publicaciones reportadas, listado de usuarios, listado de desafíos. |
| **Estado optimista de interacción** | Encapsulado en el método del modelo de dominio correspondiente (`Publicacion.toggleLike()`, `Usuario.toggleSeguir()`), invocado desde el hook de contenedor que aplica el cambio visual antes de confirmar con la API y revierte ante error. | Like, seguir/dejar de seguir. |

No se introduce una librería de estado global (Redux, Zustand, etc.) porque ninguno de los specify
originales la menciona ni la requiere (Principio de no agregar tecnologías no especificadas,
sección 11 de `spec.md`); el alcance funcional se resuelve con Context API + hooks propios.

## Manejo de Autenticación y Tokens

- **Frontend de usuario (`frontend/`)**: soporta 3 proveedores (mail/contraseña, Google, GitHub —
  RF-01). El token (JWT, asumido por convención de mercado y por RNF-06/CB-06, sin contradecir
  `spec.md`) se almacena mediante un mecanismo seguro definido en `research.md` y se adjunta
  automáticamente a cada request desde `infrastructure/httpClient.ts` (RF-06). La expiración de
  sesión redirige a login conservando el destino original (RF-13, CB-06).
- **Frontend de administración (`frontend-admin/`)**: reutiliza el mismo mecanismo de autenticación
  de la plataforma, pero el acceso posterior al módulo administrativo se restringe exclusivamente a
  usuarios con rol ADMIN (RF-12); cualquier otro rol es rechazado con mensaje claro. Una sesión
  expirada durante una acción sensible cancela la acción en curso y redirige a login informando
  explícitamente que la acción no fue aplicada (RF-75, CB-13).
- Ambos frontends comparten el mismo contrato de autenticación de la API (`contracts/api-contracts.md`,
  sección Auth), difiriendo únicamente en la verificación de rol posterior al login.
- Ninguno de los dos frontends implementa lógica de emisión/verificación de JWT: la validación
  final de firma, expiración y rol es responsabilidad exclusiva del backend (RNF-06).

## Project Structure

### Documentation (this feature)

```text
Union/specs/001-plataforma-unificada/
├── plan.md                    # Este archivo (/speckit.plan)
├── research.md                # Fase 0 (/speckit.plan)
├── data-model.md              # Fase 1 (/speckit.plan)
├── quickstart.md              # Fase 1 (/speckit.plan)
├── contracts/
│   └── api-contracts.md       # Fase 1 (/speckit.plan)
└── tasks.md                   # Fase 2 (/speckit.tasks - NO generado por /speckit.plan)
```

### Source Code (repository root)

El repositorio final del proyecto tendrá la siguiente estructura de alto nivel. Este plan detalla
únicamente `frontend/` y `frontend-admin/`; `backend/` queda fuera de alcance (solo se documenta su
contrato de API consumido).

```text
backend/                          # Java / Spring Boot / MySQL (FUERA DE ALCANCE de este plan)
└── ...

frontend/                         # Frontend de Usuario (HU-01..HU-09)
├── src/
│   ├── pages/                    # PRESENTACIÓN: una carpeta por pantalla
│   │   ├── cuestionario/
│   │   ├── registro/
│   │   ├── login/
│   │   ├── home/
│   │   ├── descubrir/
│   │   ├── detalle-publicacion/  # Modal/página de detalle de publicación
│   │   ├── desafios/
│   │   ├── perfil/
│   │   ├── editar-perfil/
│   │   └── carpetas/             # Mis Carpetas / Post Guardados
│   ├── components/                # PRESENTACIÓN: componentes reutilizables entre pantallas
│   │   ├── publicacion/           #   PublicacionCard, LikeButton, ReportButton, TagChip...
│   │   ├── filtros/                #   FiltroPanel, FiltroChip...
│   │   ├── carpetas/               #   CarpetaCard, GuardarEnCarpetaModal...
│   │   └── comunes/                #   Skeleton, Spinner, EmptyState, InfiniteScrollList...
│   ├── domain/                     # DOMINIO/MODELOS DE UI (Principios II, VII de constitución)
│   │   ├── Publicacion.ts
│   │   ├── Usuario.ts
│   │   ├── Filtro.ts
│   │   ├── Carpeta.ts
│   │   ├── Desafio.ts
│   │   └── enums/
│   │       ├── TipoContenido.ts
│   │       ├── EstadoPublicacion.ts
│   │       ├── TipoFiltro.ts
│   │       ├── RolUsuario.ts
│   │       └── MotivoReporte.ts
│   ├── services/                  # APLICACIÓN/SERVICIOS (casos de uso de cliente)
│   │   ├── AuthContext.tsx
│   │   ├── authService.ts
│   │   ├── publicacionService.ts
│   │   ├── feedService.ts
│   │   ├── tagsService.ts
│   │   ├── archivoValidacion.ts
│   │   ├── usePublicacionForm.ts
│   │   ├── busquedaService.ts
│   │   ├── filtroOpcionesService.ts
│   │   ├── useDescubrirFiltros.ts
│   │   ├── useInfiniteList.ts
│   │   ├── perfilService.ts
│   │   ├── usePerfilEdicion.ts
│   │   ├── reporteService.ts
│   │   ├── desafioService.ts       # listar/proponer desafíos (HU asociada al módulo usuario)
│   │   └── carpetaService.ts
│   ├── infrastructure/             # INFRAESTRUCTURA
│   │   ├── httpClient.ts
│   │   ├── authProviders/
│   │   │   ├── mailPasswordProvider.ts
│   │   │   ├── googleProvider.ts
│   │   │   └── githubProvider.ts
│   │   ├── tokenStorage.ts
│   │   └── geolocationClient.ts
│   ├── routes/                     # Rutas + guard de rutas protegidas (requiere sesión)
│   ├── App.tsx
│   └── main.tsx
├── tests/
│   ├── domain/
│   ├── services/
│   └── components/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── package.json

frontend-admin/                   # Frontend de Administración (HU-10..HU-15)
├── src/
│   ├── presentation/              # PRESENTACIÓN: componentes React por pantalla
│   │   ├── login/                 # Login de Administrador
│   │   ├── dashboard/              # Dashboard / Métricas Globales
│   │   ├── usuarios/               # Gestión de Usuarios
│   │   ├── moderacion/             # Moderación de Publicaciones y Reportes
│   │   ├── desafios/                # Gestión de Desafíos Propuestos
│   │   └── reportes/                # Reportes y Analíticas
│   ├── domain/                      # DOMINIO/MODELOS DE UI
│   │   ├── UsuarioAdmin.ts
│   │   ├── PublicacionModeracion.ts
│   │   ├── Reporte.ts
│   │   ├── DesafioPropuesto.ts
│   │   └── enums/
│   │       ├── RolUsuario.ts
│   │       ├── EstadoCuentaUsuario.ts
│   │       ├── EstadoPublicacion.ts
│   │       ├── EstadoModeracion.ts
│   │       ├── MotivoReporte.ts
│   │       └── EstadoDesafioPropuesto.ts
│   ├── application/                 # APLICACIÓN/SERVICIOS
│   │   ├── AuthAdminService.ts
│   │   ├── DashboardService.ts
│   │   ├── UsuariosService.ts
│   │   ├── ModeracionService.ts
│   │   ├── DesafiosService.ts
│   │   └── ReportesAnaliticaService.ts
│   └── infrastructure/              # INFRAESTRUCTURA
│       ├── httpClient.ts
│       ├── sessionManager.ts
│       ├── sessionGuard.ts          # Guard de rutas: exige rol ADMIN + sesión válida
│       └── apiEndpoints.ts
└── tests/
    ├── domain/
    ├── application/
    ├── presentation/
    └── integration/
```

**Structure Decision**: Se adopta la variante **"Web application" (Opción 2 del template de
plan)**, extendida a **tres proyectos** (`backend/`, `frontend/`, `frontend-admin/`), de los cuales
este plan detalla exclusivamente los dos frontends. Cada uno implementa las 4 capas del Principio
III de la constitución con nomenclatura ligeramente distinta por convención heredada de los specify
originales (`pages/domain/services/infrastructure` en `frontend/`;
`presentation/domain/application/infrastructure` en `frontend-admin/`), sin que ello implique una
diferencia de responsabilidades: ambas nomenclaturas representan las mismas 4 capas obligatorias.

## Complexity Tracking

> No aplica: el Constitution Check no reportó violaciones. No se requieren excepciones ni
> justificaciones de complejidad adicional.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
