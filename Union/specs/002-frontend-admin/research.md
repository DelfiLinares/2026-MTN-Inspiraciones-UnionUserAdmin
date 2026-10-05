# Phase 0 Research: Frontend Administrativo — Gestión de Usuarios, Publicaciones y Reportes

**Feature**: 002-frontend-admin | **Date**: 2026-10-01

Este documento registra las decisiones técnicas tomadas para resolver los puntos abiertos de
`spec.md` (sección 9, Ambigüedades A1–A7) que impactan el diseño, sin bloquear la planificación, y
las decisiones de stack que complementan el Technical Context de `plan.md`. Ninguna decisión aquí
implica implementar backend ni código: son decisiones de **diseño** que luego se reflejan en
`data-model.md` y `contracts/openapi.yaml`.

## 1. Cliente HTTP: fetch nativo encapsulado vs. axios

**Decisión**: Encapsular un cliente HTTP único en `infrastructure/httpClient.ts`, basado en `fetch`
nativo del navegador (sin dependencia externa adicional), expuesto únicamente a través de la capa de
`application/services`.

**Justificación**: El monorepo ya tiene precedentes (`Admin/my-proyect/frontend-admin`,
`Union/frontend/src/infrastructure/httpClientAdmin.ts`) que usan clientes HTTP encapsulados simples.
Usar `fetch` nativo evita una dependencia adicional mientras el backend real no existe todavía
(Principio IV de la constitución). Si en la iteración de integración futura se requiere
interceptores más sofisticados (reintentos, refresh de token), se puede migrar a `axios` sin romper
la capa de `application/services`, que es quien conoce el contrato, no los componentes.

**Alternativas evaluadas**: `axios` (rechazado por ahora: dependencia adicional no justificada sin
backend real que la requiera); `react-query`/`SWR` (rechazado por ahora: añade complejidad de caché
de servidor que no aporta valor mientras no hay API real que consumir; puede reconsiderarse en la
iteración de integración).

## 2. Manejo de ausencia de backend real durante el desarrollo del frontend (A4)

**Decisión**: Durante el desarrollo de este frontend (sin backend conectado), se permite el uso de
**fixtures estáticas puramente de presentación** (arrays de ejemplo en memoria, sin persistencia real
ni lógica de negocio simulada) únicamente para poblar visualmente las pantallas en desarrollo local y
en tests. Estas fixtures NO son un backend: no validan permisos, no persisten cambios entre
recargas, y se reemplazan por llamadas reales a la capa de `application/services` → `httpClient`
apuntando a la API Java en la iteración de integración futura.

**Justificación**: El Principio IV prohíbe "funciones de backend", lo cual se interpreta como lógica
de servidor (validación de permisos, persistencia, reglas de negocio ejecutadas fuera del cliente).
Un array estático de datos de muestra, usado solo para maquetar visualmente una tabla o formulario,
no constituye una función de backend: es equivalente a un dato *mock* en un test de componente. Para
evitar ambigüedad futura, estas fixtures se ubican exclusivamente en `tests/` y, si se requieren para
Storybook/demo visual, en un archivo claramente nombrado (`*.fixtures.ts`), nunca mezcladas con la
lógica de `application/services`.

**Alternativas evaluadas**: No usar ningún dato de ejemplo hasta tener la API real (rechazado:
impediría validar visualmente el diseño de las 5 pantallas durante esta iteración); levantar un
servidor mock persistente tipo `json-server` (rechazado: se acerca demasiado a "implementar
backend", y el Principio IV es explícito en prohibirlo "incluso para pruebas").

## 3. Resolución de A1 — Auto-gestión de un ADMIN

**Decisión de diseño**: La regla se modela como: "ningún usuario con rol `ADMIN` puede ser baneado o
eliminado desde este frontend, sin excepción", sin necesidad de una comparación especial de
identidad `actorId === objetivoId`. Dado que el propio administrador autenticado siempre tiene rol
`ADMIN`, queda cubierto automáticamente por la regla general (ver `Usuario.puedeSerBaneado()` /
`Usuario.puedeSerEliminado()` en `data-model.md`).

**Justificación**: Simplifica la regla de negocio a una única condición sobre el rol del usuario
objetivo, evitando lógica adicional de comparación de sesión en el dominio de UI. Se documenta como
decisión de diseño, no como respuesta definitiva de producto; si en una futura clarificación se
habilitara un flujo de "auto-degradación" previo, esta regla debería revisarse.

## 4. Resolución de A2 — Relación entre "aceptar reporte" y "eliminar publicación"

**Decisión de diseño (actualizada, Clarifications Session 2026-10-05)**: Se modelan como **acciones
independientes a nivel de ejecución** (aceptar un reporte nunca dispara automáticamente la
eliminación de la publicación asociada), pero **su requisito de confirmación es condicional**:
- "Aceptar" un reporte, cuando únicamente cambia su `EstadoModeracion` a `RESUELTO` sin ninguna
  acción adicional, **no requiere confirmación explícita** (se ejecuta directamente al hacer clic).
- Si, en el mismo flujo, el administrador decide además eliminar la publicación asociada (acción
  independiente de HU-05), esa eliminación sí requiere su propia confirmación explícita, igual que
  cualquier otra eliminación de publicación.

**Justificación**: Mantener la independencia de ejecución evita acoplar dos acciones sensibles
distintas en una sola confirmación (lo cual ocultaría al administrador el alcance real de lo que
confirma). Eximir de confirmación al "aceptar" simple reduce fricción operativa (Principio XI,
Principio XII) para la acción de menor riesgo (cambiar un estado de moderación interno, sin impacto
visible para el usuario final), reservando la confirmación explícita para las acciones realmente
destructivas o de impacto externo (eliminar publicación, rechazar reporte — que revierte el estado
de la publicación a `ACTIVA`, con impacto visible).

**Alternativas evaluadas**: Encadenar automáticamente "aceptar reporte" → "eliminar publicación"
(rechazado: reduce la claridad de la confirmación explícita y agrega una acción destructiva no
solicitada explícitamente por el admin en ese momento); exigir confirmación siempre en "aceptar"
igual que en "rechazar" (rechazado en la clarificación del 2026-10-05, por considerarse fricción
innecesaria para un cambio de estado sin acción destructiva asociada).

## 5. Resolución de A3 — Formato y sincronía de la exportación de reportes

**Decisión de diseño**: Se modela la exportación de reportes como una operación **síncrona** desde la
perspectiva del frontend: la solicitud se mantiene en estado de carga hasta que la API responde con
un resultado (éxito con URL de descarga, o error). El formato exacto del archivo (extensión,
columnas) se trata como un detalle opaco de infraestructura: el frontend solo necesita una URL de
descarga (`urlDescarga: string`) y, opcionalmente, un nombre de archivo sugerido
(`nombreArchivoSugerido: string`), sin asumir su extensión o contenido interno. **Actualización
(Clarifications Session 2026-10-01)**: se confirmó además que no existe una pantalla separada de
exportación con selección propia de filtros; el botón "Exportar" vive dentro de la misma pantalla
de listado de reportes (`/reportes`) y reutiliza el `FiltroReportes` activo en ese momento (AC-09.1).

**Justificación**: Esta decisión es consistente con el precedente ya documentado en
`Union/specs/001-plataforma-unificada/spec.md` (HU-15, A11) para el mismo tipo de operación en el
proyecto hermano, evitando introducir un patrón distinto sin justificación. Tratar la URL como
opaca permite no bloquear el diseño del contrato (`contracts/openapi.yaml`) a la espera de una
decisión de formato de archivo que corresponde a la API Java real. Disparar la exportación desde la
misma pantalla de listado evita duplicar el estado del filtro entre dos rutas distintas, eliminando
la necesidad de un mecanismo de estado compartido entre pantallas.

**Alternativas evaluadas**: Modelar la exportación como asíncrona con polling de estado (rechazado:
el encargo de `spec.md` no describe un estado intermedio observable por el usuario, y agregar
polling sin requisito explícito viola el Principio I, "la especificación manda"); mantener una
pantalla de exportación separada con selección propia de filtros (rechazado en la clarificación del
2026-10-01, por duplicar innecesariamente la lógica de filtrado ya existente en `/reportes`).

## 6. Resolución de A5 — Concurrencia y recursos inexistentes

**Decisión de diseño**: Todas las llamadas de `application/services` que ejecutan una acción sobre un
recurso específico (banear, eliminar, promover un usuario; editar, eliminar una publicación;
aceptar, rechazar un reporte) deben contemplar una respuesta de error de tipo "recurso no encontrado"
o "conflicto de estado", mostrando un mensaje genérico no bloqueante y ofreciendo recargar el
listado. No se implementa en este frontend ningún mecanismo de bloqueo optimista/pesimista adicional
(por ejemplo, versión de fila); se delega el control de concurrencia real al backend futuro.

**Justificación**: Es la solución mínima que no bloquea el diseño de las 5 pantallas y es coherente
con RNF-05 (seguridad/autorización real en backend) y con el patrón ya usado en los specify hermanos
del monorepo para errores de red. Evita introducir complejidad (locks, ETags) no solicitada por el
encargo.

## 7. Resolución de A6 — Reversión de baneo y vencimiento de baneo temporal

**Decisión de diseño**: Fuera de alcance de esta iteración. El frontend solo expone la acción
"Banear" (temporal o permanente); no expone ninguna acción de "revertir baneo" ni gestiona
vencimientos. Se asume que, si el backend futuro soporta reversión automática o manual, esa
funcionalidad se agregará como una historia de usuario nueva en una iteración posterior.

**Justificación**: El encargo original (`spec.md` §10, Fuera de Alcance) ya declara esto
explícitamente fuera de alcance; se documenta aquí solo para dejar registro de la decisión de diseño
correspondiente (Principio I: no agregar funcionalidad no trazada a un requisito).

## 8. Resolución de A7 — Degradar un ADMIN a USER

**Decisión de diseño**: Fuera de alcance de esta iteración. El frontend solo expone la acción
"Promover a administrador" (HU-03); no se diseña ninguna pantalla ni acción de "degradar". El modelo
de dominio de `Usuario` no incluye ningún método `puedeSerDegradado()` en esta versión.

**Justificación**: El encargo original del usuario (`/speckit.specify`) solo menciona "promover", y
el Principio I prohíbe implementar funcionalidad no trazada a un requisito explícito. Si una futura
iteración lo requiere, se agregará como nueva historia de usuario con su propio RF y criterios de
aceptación.

## 9. Testing: estrategia de mocks para tests de integración

**Decisión**: Los tests de integración (`tests/integration/`) validan que la capa de
`application/services` construye correctamente las peticiones HTTP (URL, método, body, headers) y
procesa correctamente las respuestas (éxito y error) **contra fixtures basadas en los esquemas de
`contracts/openapi.yaml`**, usando un servidor HTTP simulado en memoria (por ejemplo, interceptando
`fetch` con un mock) en lugar de un servidor real. No se levanta ningún proceso de servidor, ni
siquiera en modo "mock server" persistente, para no incurrir en "implementar backend... para
pruebas" (Principio IV).

**Justificación**: Permite verificar el contrato sin violar la prohibición constitucional de
implementar backend, incluso de prueba. Es consistente con la estrategia ya usada en
`Admin/my-proyect/frontend-admin` y `Union/frontend` (tests de integración con cliente HTTP
simulado).

## 10. Resolución — Ubicación de `FiltroReportes` y `ResultadoExportacion` (capa de aplicación)

**Decisión de diseño (Clarifications Session 2026-10-01)**: `FiltroReportes` y
`ResultadoExportacion` se ubican en `src/application/dto/`, como objetos de transporte/resultado de
casos de uso de la capa de aplicación, **no** en `src/domain/` junto a las entidades (`Usuario`,
`Publicacion`, `Reporte`). `data-model.md` los documenta en su sección "Objetos de Aplicación
(no-dominio)" precisamente para reflejar esta distinción de capa.

**Justificación**: Ambos objetos no encapsulan invariantes de negocio persistentes del dominio (no
representan una "cosa" del mundo del negocio con identidad y reglas propias), sino estructuras de
soporte para un caso de uso específico (filtrar un listado, representar el resultado de una
operación de exportación). Ubicarlos en `domain/` diluiría la distinción de capas exigida por el
Principio V de la constitución y por RNF-07 de `spec.md`.

**Alternativas evaluadas**: Ubicarlos en `src/domain/` junto a las entidades (rechazado en la
clarificación del 2026-10-01: mezclaría objetos de transporte de corta vida con entidades de
dominio persistente, dificultando distinguir cuáles clases representan reglas de negocio reales).

## 11. Resumen de decisiones

| # | Tema | Decisión | Ambigüedad resuelta |
|---|------|----------|----------------------|
| 1 | Cliente HTTP | `fetch` nativo encapsulado en `infrastructure/httpClient.ts` | — |
| 2 | Datos de ejemplo sin backend | Fixtures estáticas solo en `tests/`/demo visual, nunca en `application/services` | A4 |
| 3 | Auto-gestión de ADMIN | Regla única "ADMIN nunca puede ser baneado/eliminado" cubre auto-acción; cerrada sin excepciones | A1 |
| 4 | Aceptar reporte vs. eliminar publicación | Acciones independientes a nivel de ejecución; confirmación condicional (aceptar simple no la requiere, eliminar sí) | A2 |
| 5 | Exportación de reportes | Síncrona; disparada desde `/reportes` (sin pantalla separada); `urlDescarga` tratada como opaca | A3 (parcial) |
| 6 | Concurrencia / recurso inexistente | Error genérico no bloqueante + recarga de listado; sin locks | A5 |
| 7 | Reversión de baneo | Fuera de alcance de esta iteración | A6 |
| 8 | Degradar ADMIN a USER | Fuera de alcance de esta iteración | A7 |
| 9 | Tests de integración | Mocks de `fetch` basados en `contracts/openapi.yaml`, sin servidor real | — |
| 10 | Ubicación de `FiltroReportes`/`ResultadoExportacion` | `src/application/dto/`, no `src/domain/` | — |
| 11 | Reversión de estado de publicación al rechazar reporte | `Publicacion` vuelve a `ACTIVA` si no quedan otros reportes pendientes/en revisión | — (nueva, 2026-10-01) |

**No se implementó código como parte de este documento de investigación.**
