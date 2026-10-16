# Plan de implementación — 003 Desafíos (Frontend)

**Spec**: `spec.md` (fuente de verdad) | **Constitution 003**: `constitution.md` v1.1.0 | **Constitution general**: `.specify/memory/constitution.md` v2.0.0
**Documentos de este plan**: `research.md`, `data-model.md`, `contracts/openapi.yaml`, `quickstart.md`
**Fecha**: 2026-10-11 | **Estado**: borrador de planificación. No se escribe código (constitution 003, principio 15).

---

## 1. Resumen

Planificar el módulo de Desafíos como frontend únicamente, en las dos aplicaciones existentes (usuario y administración), sobre el monorepo de 002 (supuesto S-01, pendiente de confirmar).

- Lógica de dominio y casos de uso compartidos en `packages/shared/src/desafios/`, detrás de un puerto `DesafiosPort`.
- Adaptador en memoria como implementación por defecto. Un adaptador HTTP queda definido para la futura integración con la API Java.
- Derivación de estado y reglas de permisos en las entidades. La API es la fuente de verdad para filtros y permisos.
- Paginación por cursor servida por la API. Ningún listado completo se filtra en memoria.
- Sin backend, sin servidores simulados y sin MSW para este módulo.

---

## 2. Contexto técnico

| Aspecto | Decisión | Fuente |
|---|---|---|
| Lenguaje | TypeScript ^5.6.3 | Precedente 002 |
| UI | React ^18.3.1, react-dom ^18.3.1 | Precedente 002 |
| Rutas | react-router-dom ^6.30.6 | Precedente 002 |
| Build | Vite ^5.4.11 | Precedente 002 |
| Estado servidor | @tanstack/react-query ^5.104.1 | Precedente 002 (D-02) |
| Pruebas | Vitest ^2.1.8, @testing-library/react ^16.1.0, jsdom ^25.0.1 | Precedente 002 |
| Mocks HTTP | Ninguno en 003 (MSW no se usa) | Constitution 003, principio 4 |
| Persistencia | Fuera del frontend (API Java) | Constitution 003, principio 3 |
| Plataforma | Navegador (Windows para desarrollo) | Entorno |
| Restricciones de rendimiento | Pendientes de A-15 | Spec RNF-02, RNF-03 |

---

## 3. Verificación de constitución

### 3.1 Constitution 003 (principios 1–15)

| # | Principio | Cumplimiento | Cómo se cumple o qué falta |
|---|---|---|---|
| 1 | La especificación manda | **Cumple con pendientes** | Cada componente y caso de uso tiene trazabilidad (sección 5). Los pendientes (sección 6) no se implementan hasta resolverse. |
| 2 | Dominio con OO real | **Cumple** | `Desafio`, `SolicitudDesafio` y `RespuestaDesafio` encapsulan estado, transiciones y permisos (`data-model.md`, sección 4). |
| 3 | API REST Java externa | **Cumple** | El frontend define el contrato (`openapi.yaml`) pero no lo implementa. |
| 4 | Sin backend, ni de prueba | **Cumple** | Los datos de ejemplo viven detrás de `DesafiosPort` (adaptador en memoria). No hay endpoints ni servidor simulado. No se usa MSW. |
| 5 | Separación por capas | **Cumple** | Dominio y aplicación en `packages/shared/src/desafios/`. UI en `features/desafios/` de cada app (`research.md`, sección 1). |
| 6 | Dos frontends separados | **Cumple** | Usuario y administración son apps distintas. Los permisos de cada una están en las entidades (`data-model.md`, sección 6). |
| 7 | Enums y value objects | **Cumple** | `EstadoSolicitudDesafio`, `EstadoDesafio`, `AmbitoDesafio`, `RolUsuario`, `RangoFechas`, `TipoFiltroDesafio` (`data-model.md`, sección 2 y 3). `AmbitoDesafio` sin valores cerrados por A-02. |
| 8 | Reglas con tests | **Cumple, con pendientes** | Matriz de pruebas en `data-model.md`, sección 8, y `research.md`, sección 10. Las reglas que dependen de A-02, A-16 o A-11 quedan con pruebas marcadas como pendientes. |
| 9 | Seguridad en el backend | **Cumple** | Los permisos se validan en la API. La UI los refleja y el frontend trata 403 como permiso denegado (`research.md`, sección 8). |
| 10 | Escalabilidad | **Cumple** | Paginación por cursor servida por la API. Filtros como parámetros de consulta. Recomendaciones de índices y Redis en `research.md`, sección 9. |
| 11 | Usabilidad y rendimiento | **Cumple** | Estado visible en listado y detalle. Carga progresiva en respuestas. Mensajes de error por campo. |
| 12 | Eficiencia del admin | **Cumple** | Acciones sensibles con estilo de peligro (`research.md`, sección 11). Publicar y aprobar son flujos cortos. |
| 13 | Confirmación explícita | **Cumple** | Confirmación antes de eliminar desafíos, solicitudes y respuestas, y antes de editar un desafío `ACTIVO` o con respuestas (`Desafio.requiereConfirmacionEdicion`). |
| 14 | Rankings en backend | **Cumple** | El frontend no calcula rankings ni estadísticas. Ver `research.md`, sección 9. |
| 15 | Sin código en planificación | **Cumple** | Solo se crean documentos en `Union/specs/003-desafios/`. |

### 3.2 Constitution general v2.0.0 (principios I–XV)

| # | Principio | Cumplimiento | Nota |
|---|---|---|---|
| I | La especificación manda | **Cumple** | Igual que 003, principio 1. |
| II | Dominio orientado a objetos real | **Cumple** | Igual que 003, principio 2. |
| III | La API Java no se implementa | **Cumple** | Igual que 003, principio 3. |
| IV | Prohibido implementar backend, incluso para pruebas | **Cumple, con justificación** | El adaptador en memoria no es backend: es una implementación del puerto de cliente, con datos de ejemplo. Lo permite 003, principio 4, que es más específico. No hay lógica de servidor. |
| V | Separación por capas | **Cumple** | Igual que 003, principio 5. |
| VI | Frontend administrativo autónomo y de responsabilidad acotada | **Conflicto C-01 (justificado con condición)** | El principio VI describe un frontend de administración que solo hace funciones de administración. 003 exige también una app de usuario (RF-23), y 002 ya la tiene (`apps/usuario`). Ver C-01 en la sección 7. |
| VII | Enums y value objects | **Cumple** | Igual que 003, principio 7. |
| VIII | Tests obligatorios de reglas de negocio | **Cumple** | Igual que 003, principio 8. |
| IX | Seguridad validada en backend | **Cumple** | Igual que 003, principio 9. |
| X | Escalabilidad por diseño | **Cumple** | Igual que 003, principio 10. |
| XI | Usabilidad, claridad y rendimiento | **Cumple** | Igual que 003, principio 11. |
| XII | Eficiencia operativa del administrador | **Cumple** | Igual que 003, principio 12. |
| XIII | Confirmación explícita | **Cumple** | Igual que 003, principio 13. |
| XIV | Analytics y recomendaciones fuera del frontend | **Cumple** | Igual que 003, principio 14. |
| XV | Prohibición de código en fases de especificación | **Cumple** | Igual que 003, principio 15. |

**Resultado**: 003 cumple todos sus principios, con pendientes de especificación que no se asumen. La constitución general tiene un conflicto (C-01) que requiere confirmación de gobernanza.

---

## 4. Estructura del proyecto

Monorepo de 002 (supuesto S-01). Solo se añade contenido nuevo en las rutas indicadas.

```text
Union/specs/002-inspiraciones-publicaciones/frontend/
├── packages/
│   └── shared/
│       └── src/
│           ├── desafios/                 # NUEVO (003)
│           │   ├── domain/               # entidades, value objects, enums, permisos
│           │   ├── application/          # casos de uso y puerto DesafiosPort
│           │   │   └── ports/
│           │   └── infrastructure/       # HttpDesafiosAdapter, InMemoryDesafiosAdapter
│           ├── components/               # reutilizado: ConfirmDialog, EstadosGlobales, Estados, Medio
│           ├── hooks/                    # reutilizado: useBorradorFormulario
│           └── services/                 # reutilizado: httpClient, errores
├── apps/
│   ├── usuario/
│   │   └── src/features/desafios/        # NUEVO (003): listado, detalle, solicitudes, respuestas
│   └── admin/
│       └── src/features/desafios/        # NUEVO (003): publicar, editar, eliminar, bandeja de solicitudes, moderación de respuestas
```

**Documentos de planificación** (`Union/specs/003-desafios/`):
- `research.md` (decisiones y alternativas)
- `data-model.md` (dominio y casos de uso, sin DDL)
- `contracts/openapi.yaml` (contrato propuesto, con pendientes marcados)
- `quickstart.md` (cómo ejecutar y validar)
- `plan.md` (este archivo)

---

## 5. Trazabilidad

### 5.1 Historias de usuario

| Historia | Prioridad | Entidad o caso de uso | Componentes (app) | Endpoint (openapi) | Pendientes |
|---|---|---|---|---|---|
| HU-01 Publicar desafío | P1 | `PublicarDesafio`, `Desafio.validar` | admin: `features/desafios/publicar` | `POST /desafios` | A-11, A-21, P-01 |
| HU-02 Editar desafío | P1 | `EditarDesafio`, `requiereConfirmacionEdicion` | admin: `features/desafios/editar` | `PUT /desafios/{desafioId}` | P-01, P-04 |
| HU-03 Eliminar desafío | P1 | `EliminarDesafio`, `marcarEliminado` | admin: `features/desafios/eliminar` | `DELETE /desafios/{desafioId}` | A-01 resuelta |
| HU-04 Enviar solicitud | P1 | `ProponerSolicitud` | usuario: `features/desafios/solicitudes` | `POST /solicitudes` | A-08, A-19, A-20 |
| HU-05 Ver, editar, eliminar mis solicitudes | P2 | `ListarSolicitudes`, `EditarSolicitud`, `EliminarSolicitud` | usuario: `features/desafios/solicitudes` | `GET /solicitudes`, `PUT` y `DELETE /solicitudes/{solicitudId}` | A-04, A-08, P-04 |
| HU-06 Ver, aprobar o rechazar solicitudes | P1 | `ListarSolicitudes`, `AprobarSolicitud`, `RechazarSolicitud` | admin: `features/desafios/solicitudes` | `GET /solicitudes`, `POST .../aprobar`, `POST .../rechazar` | A-03 resuelta, P-03 |
| HU-07 Editar o eliminar solicitudes ajenas | P2 | `EditarSolicitud`, `EliminarSolicitud` (rol ADMIN) | admin: `features/desafios/solicitudes` | `PUT` y `DELETE /solicitudes/{solicitudId}` | A-04 |
| HU-08 Estado de mis solicitudes | P2 | `ListarSolicitudes` (filtro por autor) | usuario: `features/desafios/solicitudes` | `GET /solicitudes?estado=` | A-17 |
| HU-09 Listado de desafíos | P1 | `ListarDesafios` | usuario: `features/desafios/listado` | `GET /desafios` | A-13 |
| HU-10 Filtrar por ámbito y estado | P1 | `ListarDesafios`, `TipoFiltroDesafio` | usuario: `features/desafios/listado` (filtros en URL) | `GET /desafios?ambito=&estado=`, `GET /ambitos` | A-02 |
| HU-11 Detalle de desafío | P1 | `ObtenerDesafio` | usuario: `features/desafios/detalle` | `GET /desafios/{desafioId}` | A-01 resuelta |
| HU-12 Ver respuestas | P1 | `ListarRespuestas` | usuario: `features/desafios/respuestas` | `GET /desafios/{desafioId}/respuestas` | A-22 |
| HU-13 Filtrar por fecha | P3 | `ListarDesafios` (`TipoFiltroDesafio.FECHA`) | usuario: `features/desafios/listado` | `GET /desafios?fechaDesde=&fechaHasta=` | A-14 |
| HU-14 Enviar respuesta | P1 | `ResponderDesafio`, `aceptaRespuestas` | usuario: `features/desafios/respuestas` | `POST /desafios/{desafioId}/respuestas` | A-05 resuelta, A-10 resuelta, A-19, A-22 |
| HU-15 Editar y eliminar mis respuestas | P2 | `EditarRespuesta`, `EliminarRespuesta` | usuario: `features/desafios/respuestas` | `PUT` y `DELETE /respuestas/{respuestaId}` | A-22, P-02 |
| HU-16 Admin elimina cualquier respuesta | P2 | `EliminarRespuesta` (rol ADMIN) | admin: `features/desafios/respuestas` | `DELETE /respuestas/{respuestaId}` | P-02 |

### 5.2 Requisitos funcionales y no funcionales

| Requisito | Entidad o caso de uso | Componente o capa | Endpoint o contrato | Prueba |
|---|---|---|---|---|
| RF-01 Publicar desafío completo | `PublicarDesafio` | admin, `publicar` | `POST /desafios` | Aplicación + componente |
| RF-02 Campos y fotos | `Desafio.validar`, `Foto` | dominio | `DesafioEscrituraMultipart` | Unitaria |
| RF-03 Fin posterior a inicio | `RangoFechas` | dominio, formulario | `DesafioEscritura` | Unitaria + componente |
| RF-04 Nombre, descripción, foto y ámbito | `Desafio.validar` | dominio, formulario | `DesafioEscritura` | Unitaria + componente |
| RF-05 Admin edita y elimina desafíos | `puedeEditarPor`, `puedeEliminarPor` | dominio, admin | `PUT`, `DELETE /desafios/{id}` | Unitaria + componente |
| RF-06 Estado derivado | `Desafio.estado`, `RangoFechas.estado` | dominio, listado y detalle | `estado` en `Desafio` | Unitaria (A-16) |
| RF-07 Usuario envía solicitudes | `ProponerSolicitud` | usuario, solicitudes | `POST /solicitudes` | Aplicación + componente |
| RF-08 Estados de solicitud | `EstadoSolicitudDesafio`, `aprobar`, `rechazar` | dominio | `SolicitudDesafio.estado` | Unitaria |
| RF-09 Admin ve, aprueba y rechaza | `AprobarSolicitud`, `RechazarSolicitud` | admin, solicitudes | `POST .../aprobar`, `.../rechazar` | Aplicación + componente |
| RF-10 Usuario ve, edita y elimina solo las suyas | `SolicitudDesafio.puedeEditarPor` | dominio, usuario | `GET /solicitudes` filtrado por la API | Unitaria + componente |
| RF-11 Admin edita y elimina cualquier solicitud | `SolicitudDesafio.puedeEditarPor` (ADMIN) | dominio, admin | `PUT`, `DELETE /solicitudes/{id}` | Unitaria |
| RF-12 Una respuesta por desafío, solo activo | `Desafio.aceptaRespuestas`, A-10 | dominio, respuestas | `POST /desafios/{id}/respuestas` | Unitaria + componente |
| RF-13 Usuario edita y elimina solo las suyas | `RespuestaDesafio.puedeEditarPor`, `puedeEliminarPor` | dominio, respuestas | `PUT`, `DELETE /respuestas/{id}` | Unitaria + componente |
| RF-14 Admin elimina cualquier respuesta, no la edita | `RespuestaDesafio.puedeEliminarPor` (ADMIN), `puedeEditarPor` (nunca ADMIN) | dominio, admin | `DELETE /respuestas/{id}` | Unitaria |
| RF-15 Respuestas paginadas | `ListarRespuestas` | usuario, admin, respuestas | `GET /desafios/{id}/respuestas` | Aplicación |
| RF-16 Listado con nombre, foto, ámbitos, fechas y estado | `ListarDesafios` | usuario, listado | `GET /desafios` | Aplicación + componente |
| RF-17 Filtro por ámbito y estado | `ListarDesafios`, `TipoFiltroDesafio` | usuario, listado | `GET /desafios?ambito=&estado=` | Aplicación + componente |
| RF-18 Detalle | `ObtenerDesafio` | usuario, detalle | `GET /desafios/{id}` | Componente |
| RF-19 Filtro por fecha | `ListarDesafios` (FECHA) | usuario, listado | `GET /desafios?fechaDesde=` | Pendiente (A-14) |
| RF-20 Solo admin publica | `PublicarDesafio`, `puedeEditarPor` | dominio | `POST /desafios` (403) | Unitaria + componente |
| RF-21 Permisos validados en backend y reflejados en UI | Métodos `puedeEditarPor` y similares | ambas apps | Todos los endpoints con 403 | Componente |
| RF-22 Confirmación explícita | `requiereConfirmacionEdicion`, diálogos de eliminación | ambas apps | `DELETE`, `PUT` de desafío | Componente |
| RF-23 Dos apps separadas | Estructura | `apps/usuario`, `apps/admin` | No aplica | Estructura |
| RF-24 Sesión para leer | `ListarDesafios`, `ObtenerDesafio`, `ListarRespuestas` | ambas apps, guardas de ruta | 401 en endpoints de lectura | Componente |
| RNF-01 Usabilidad | Componentes compartidos | ambas apps | No aplica | Revisión manual (`quickstart.md`) |
| RNF-02 Rendimiento | Paginación y filtros en API | ambas apps | Parámetros `cursor`, `limite` | Pendiente (A-15) |
| RNF-03 Escalabilidad | Paginación por cursor | ambas apps | Todos los listados | Recomendaciones backend |
| RNF-04 Seguridad | Permisos en entidades y API | ambas apps | 401, 403 | Unitaria + componente |
| RNF-05 Calidad | Dominio y aplicación en `shared` | `packages/shared` | No aplica | Unitaria + aplicación |
| RNF-06 Arquitectura | `DesafiosPort`, `InMemoryDesafiosAdapter` | `infrastructure` | Contrato `openapi.yaml` | Aplicación |
| RNF-07 Rankings | Ninguno en frontend | No aplica | No aplica | Revisión de código |

---

## 6. Pendientes de planificación (P-01 a P-05)

Puntos que la spec no define y que la planificación propone o necesita. No se implementan hasta confirmarse.

| ID | Tema | Propuesta actual | Bloquea |
|---|---|---|---|
| P-01 | Transporte de las fotos al publicar o editar | `multipart/form-data` con `datos` JSON y `fotos` binarias | HU-01, HU-02 (contrato y adaptador HTTP) |
| P-02 | Editar o borrar respuestas cuando el desafío ya no está `ACTIVO` | Sin decidir. El contrato no lo permite ni lo prohíbe. | HU-15, HU-16 |
| P-03 | Efecto de aprobar una solicitud sobre la publicación | Solo cambia el estado (A-03). Publicar es un paso aparte. Sin flujo que cree un desafío automáticamente. | HU-06 |
| P-04 | Control de concurrencia (CB-02) | Campo `version` y cabecera `If-Match`, con 409 si hay conflicto | HU-02, HU-05, HU-07 |
| P-05 | Mecanismo de sesión y URL de retorno tras reautenticar | Se hereda de 002 (`sesionService` y token). Pendiente de confirmar | Todas las rutas protegidas, CB-08 |

**Pendientes de la spec que siguen abiertos** (no se asumen): A-02, A-04, A-08, A-11, A-13, A-14, A-15, A-16, A-17, A-19, A-20, A-21, A-22. Están marcados en `data-model.md`, sección 9, y en `contracts/openapi.yaml` con `x-pendiente`.

---

## 7. Seguimiento de complejidad y supuestos

| ID | Tema | Justificación | Acción requerida |
|---|---|---|---|
| S-01 | Las dos apps son las de 002 (`apps/usuario`, `apps/admin`) | 003 dice "las 2 aplicaciones React existentes" y el precedente en el workspace es el monorepo de 002 | Confirmar |
| S-02 | Stack igual que 002 | Evita introducir librerías nuevas | Ninguna |
| S-03 | Sesión heredada de 002 | No hay mecanismo de sesión definido para 003 | Confirmar (P-05) |
| C-01 | Constitution general VI y I frente a 003 | La constitución general describe una sola app de administración. 003 y 002 ya usan dos apps (usuario y admin). Esta planificación sigue 003 y 002. Para cumplir formalmente hace falta una enmienda MINOR de la constitución general o una confirmación explícita de gobernanza. | Confirmar o enmendar la constitución general antes de implementar |
| C-02 | Adaptador en memoria dentro de `shared` | Permite trabajar sin backend (003, principio 4). No es backend. | Ninguna |
| C-03 | Campos `tieneRespuestas` y `version` en `Desafio` | `tieneRespuestas` lo exige RF-22 y CB-02 necesita `version`. La spec no los expresa, así que se añaden como datos del contrato | Confirmar con el equipo de la API |

---

## 8. Documentos generados y siguiente paso

| Documento | Estado |
|---|---|
| `research.md` | Completo |
| `data-model.md` | Completo, sin DDL |
| `contracts/openapi.yaml` | Completo como borrador, con `x-pendiente` |
| `quickstart.md` | Completo |
| `plan.md` | Este documento |

**Siguiente paso recomendado**: una ronda de aclaración sobre A-02 (catálogo de ámbitos) y A-04 (editar solicitudes resueltas). Ambos bloquean la validación de etiquetas (CB-12) y las reglas de edición de solicitudes. Después, confirmar S-01, S-03 y C-01, y generar las tareas.
