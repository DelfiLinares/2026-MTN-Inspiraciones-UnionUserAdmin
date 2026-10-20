# Plan de implementación — 007 Búsqueda y Descubrimiento

**Rama**: 007-inspiraciones-busqueda | **Fecha**: 2026-10-20
**Entradas**: [spec.md](./spec.md), [constitution.md](./constitution.md), constitution general (`.specify/memory/constitution.md`)
**Alcance**: solo Frontend de usuario (`Union/frontend`). Sin backend, sin mocks de servidor, sin tocar el frontend de administración. No se escribe código en esta fase.

## 1. Contexto técnico

| Ítem | Decisión |
|---|---|
| Lenguaje / UI | TypeScript, React, Vite, CSS simple |
| Tests | Vitest + React Testing Library |
| HTTP | Cliente existente (`infrastructure/httpClient.ts`, puerto `application/ports/HttpClient.ts`) detrás de una interfaz de servicio |
| Contrato | OpenAPI 3.0 en `contracts/openapi.yaml` |
| Datos de ejemplo | Adaptador en memoria que implementa el mismo puerto (no es un servidor) |
| Persistencia | Ninguna (sin DB ni acceso a MySQL) |
| Rendimiento | Páginas de 20, scroll infinito, debounce 400 ms, cancelación con `AbortController` |
| Objetivos de tiempo/volumen | **Pendiente** (A-18): delegado a la API; no se fijan umbrales en el frontend |

### Código existente a reutilizar (verificado en el repo)
- `domain/enums/TipoFiltro.ts`, `TipoContenido.ts`, `EstadoPublicacion.ts`: se **reutilizan**; `TipoFiltro` se **extiende** con `TIPO_CONTENIDO` (decisión de clarify). Hallazgo T004: el `Filtro.ts` existente mapea `TIPO_ARTE` a `tipoContenido` (los confunde); T013 debe evitar que esa confusión se propague. Usos actuales: `Filtro.ts`, `FiltroPanel`, `FiltroChip`, `useDescubrirFiltros` y `tests/domain/Filtro.test.ts`.
- `domain/Filtro.ts`, `domain/Publicacion.ts`: **no se reutilizan** (decisión tras T004). `Filtro` es de selección única y envía `texto`/`tipo_arte`; `Publicacion` incluye likes, edición y borrado. `FiltroActivo`, `CriteriosBusqueda` y `PublicacionResumen` son tipos nuevos; se reutilizan solo `TipoContenido` y `EstadoPublicacion`. Se mantiene la idea de `Filtro.distanciaHabilitada()` en `CriteriosBusqueda.admiteFiltro`.
- `components/filtros/FiltroPanel.tsx`: **no se reutiliza** (acoplado a `Filtro`, `OpcionesFiltro`, selección única y campo de texto propio). `FiltroChip.tsx`: **reutilizable con adaptación** (identifica el chip solo por `tipo`; con selección múltiple hay que distinguir también el valor).
- `application/ports/HttpClient.ts`, `infrastructure/httpClient.ts`: base del cliente. Hallazgos T004: respeta `AbortSignal`; lanza `HttpUnauthorizedError`, `HttpForbiddenError` y `ApiError`; **no soporta parámetros repetidos** (usa `searchParams.set` y `params` no admite arrays), por lo que `BusquedaHttpRepository` debe serializar los arrays o se amplía el cliente en una tarea aparte; el 401 solo lanza error, no redirige.
- `sessionGuard.ts`: **no aplica** (es de administración: usa `httpClientAdmin` y `RolUsuarioAdmin`). Para el 401 del usuario se usa `authService.logout()` / `AuthContext` y `RutaProtegida` como referencia de redirección a `/login`.
- `infrastructure/geolocationClient.ts`: tiene estado global de módulo; `UbicacionPort` lo envuelve (en espera por A-02).
- `pages/home/HomePage.tsx`: posible punto de montaje; la ruta final se decide en tasks.

## 2. Arquitectura por capas

```
domain/busqueda/            CriteriosBusqueda, FiltroActivo, PaginaResultados,
                            PublicacionResumen, OrigenFeed, errores de dominio
application/busqueda/       casos de uso + puerto BusquedaRepository (interfaz)
infrastructure/busqueda/    BusquedaHttpRepository (API) · BusquedaEnMemoriaRepository (ejemplo)
ui (pages/busqueda + components/busqueda)
                            PaginaBusqueda, BarraBusqueda, FeedPublicaciones,
                            PanelFiltros, ChipsFiltrosActivos, TarjetaPublicacion,
                            componentes de estado (esqueleto/vacío/error), hooks de presentación
```
Nota: la capa `ui` se materializa en `src/pages/busqueda` y `src/components/busqueda` (convención del repo).

**Puertos adicionales (application)**: `UbicacionPort` y `SesionUsuarioPort`, implementados en infraestructura sobre `geolocationClient` y `authService`/`AuthContext` (no `sessionGuard`, que es de administración). La UI no importa infraestructura directamente.

**Codec de URL**: `CodecCriteriosUrl` (dominio) serializa/parsea criterios ⇄ query params; `CriteriosBusqueda` no conoce query params.

**Reinicio de paginación**: lo realiza `SesionBusqueda` (los casos de uso de filtros solo delegan en `CriteriosBusqueda`).

**Duplicados**: único dueño `PaginaResultados.agregar`. **ELIMINADA**: el cliente no la filtra; se registra como violación de contrato.
Regla de dependencias: `ui → application → domain`; `infrastructure → application(port) + domain`. El dominio no importa React ni HTTP. La elección del repositorio (HTTP o ejemplo) se hace en un único punto de composición (config), sin tocar dominio, aplicación ni componentes.

### Puerto (interfaz de servicio)
`BusquedaRepository`:
- `obtenerFyp(cursor?, signal?) → PaginaResultados`
- `buscar(criterios, cursor?, signal?) → PaginaResultados`
- `obtenerCatalogoFiltros(signal?) → CatalogoFiltros`

### Casos de uso (application)
| Caso de uso | Responsabilidad |
|---|---|
| `CargarFeedFyp` | Primera página FYP (criterios sin texto; filtros se envían si existen) |
| `BuscarPublicaciones` | Primera página con texto y/o filtros |
| `CargarMasResultados` | Siguiente página; rechaza si hay carga en curso o `hayMas=false` |
| `AplicarFiltro` / `QuitarFiltro` / `LimpiarFiltros` | Delegan en `CriteriosBusqueda` y reinician paginación |
| `ReintentarCarga` | Repite la última operación fallida (primera página o página adicional) |
| `AbrirPublicacion` | Resuelve destino de navegación al detalle (otro módulo) |

Un coordinador de estado (`SesionBusqueda`, capa application) mantiene criterios, items, cursor, estado de carga y token de petición vigente. Es el que decide FYP vs búsqueda (vía `CriteriosBusqueda.origen()`), descarta respuestas obsoletas y cancela peticiones previas. La UI solo lo observa mediante un hook delgado.

### Reglas clave y dónde viven
| Regla | Ubicación |
|---|---|
| Normalización de texto (trim, colapso de espacios, máx. 100) | `CriteriosBusqueda` |
| Texto < 2 caracteres → no dispara búsqueda; vacío → FYP | `CriteriosBusqueda.origen()` / `esBuscable()` |
| Selección múltiple OR por tipo, AND entre tipos y texto | `CriteriosBusqueda` / `FiltroActivo` |
| DISTANCIA solo con ubicación concedida; sin permiso no se agrega ni envía | `CriteriosBusqueda` (rechaza) + UI deshabilita |
| Quitar uno / limpiar todos / reinicio de paginación | `CriteriosBusqueda` + `SesionBusqueda` |
| No cargar mientras hay carga ni sin más resultados | `SesionBusqueda` |
| Descartar duplicados por id | `PaginaResultados.agregar` (sin reordenar; `SesionBusqueda` solo lo invoca) |
| Decidir si un filtro es aplicable (DISTANCIA sin ubicación) | `CriteriosBusqueda.admiteFiltro` (la UI solo consulta) |
| Query params ⇄ criterios y distancia ⇄ km | `CodecCriteriosUrl` (T070) y constantes (T075) |
| Respuestas obsoletas | `SesionBusqueda` (token + `AbortController`) |
| Mapeo 401/403/red → estado de UI | `application` (errores tipados) |

## 3. Manejo de errores en UI

| Situación | Comportamiento |
|---|---|
| Error de red / timeout / 5xx / 429 | Mensaje comprensible + botón Reintentar; items ya cargados se conservan si fue página adicional |
| 400 | Error genérico con reintentar; se registra el criterio inválido (no se asume corrección en cliente) |
| 401 | Cierre de sesión local y redirección a `/login` mediante `SesionUsuarioPort` (sobre `authService`/`AuthContext`) |
| 403 | Aviso en pantalla sin romper el resto; sin reintento automático |
| Vacío | Mensaje "sin resultados" + acción "Limpiar filtros" |
| Carga | Esqueletos (inicial) y fila de esqueleto/indicador (más resultados) |

La ocultación en UI no sustituye la autorización del backend.

## 4. Decisiones de rendimiento y URL (resumen; detalle en research.md)
- Scroll infinito con `IntersectionObserver` sobre un centinela.
- Debounce 400 ms en la barra; cancelación con `AbortController` + token de secuencia.
- Imágenes con `loading="lazy"` y relación de aspecto reservada (`aspect-ratio`).
- Virtualización: **no en esta iteración**, a reevaluar (ver research.md).
- URL: texto y filtros como query params; el cursor **no** va en la URL. Scroll restaurado al volver del detalle.

## 5. Estructura de documentación

```
specs/007-inspiraciones-busqueda/
├── constitution.md  spec.md  plan.md  research.md  data-model.md  quickstart.md
└── contracts/openapi.yaml
```

## 6. Estrategia de pruebas (Vitest + RTL)

- **Dominio**: normalización, `origen()`, combinación OR/AND, quitar/limpiar, rechazo de DISTANCIA sin ubicación, `PaginaResultados`.
- **Aplicación** (contra adaptador en memoria): FYP vs búsqueda, bloqueo de cargas concurrentes, fin de resultados, reinicio al cambiar criterios, respuestas obsoletas, reintento, mapeo de 401/403/red.
- **Componentes**: `BarraBusqueda` (debounce, borrar, mínimo 2), `PanelFiltros` (aplicar/quitar/limpiar, DISTANCIA deshabilitada), `FeedPublicaciones` (scroll infinito con observer simulado), estados de carga/vacío/error, `TarjetaPublicacion`.
- **Contrato (opcional)**: el cliente HTTP coincide con `openapi.yaml`.
- Fuera de alcance: tests de repositorio o integración de backend.

## 7. Verificación contra constitutions

### Constitution del módulo 007
| Principio | Estado | Cómo se cumple |
|---|---|---|
| I. Especificación manda | ✅ | Todo componente/servicio traza a HU/RF (tabla §8) |
| II. OO real | ✅ | `CriteriosBusqueda`, `PaginaResultados` encapsulan reglas |
| III. API Java no implementada | ✅ | Solo contrato OpenAPI y cliente |
| IV. Sin backend | ✅ | Adaptador en memoria tras el puerto; sin servidor mock |
| V. Capas | ✅ | §2 |
| VI. Componentes limpios | ✅ | Lógica en dominio/application; hooks delgados |
| VII. Enums/VO | ✅ | `TipoFiltro`, `TipoContenido`, `EstadoPublicacion`, `OrigenFeed` |
| VIII. Patrones solo si simplifican | ✅ | Solo repositorio (puerto) y un coordinador; sin otros patrones |
| IX. Tests | ✅ | §6 |
| X. Búsqueda en backend | ✅ | Ningún filtrado/orden local; solo descarte de duplicados por id |
| XI. Scroll infinito/concurrencia | ✅ | Cursor, debounce, cancelación |
| XII. Usabilidad | ✅ | Estados, lazy, a11y, URL |
| XIII. Seguridad | ✅ | §3 |
| XIV. Solo lectura | ✅ | Sin crear/editar/likes/guardado |
| XV. Sin código ahora | ✅ | Solo documentos |

### Constitution general
Se respeta la separación frontend/backend, la ausencia de acceso a MySQL y que el frontend no recalcula rankings. **Punto a revisar**: no se pudo contrastar línea por línea el constitution general en esta sesión; validar antes de tasks que no haya una regla adicional (p. ej. convenciones de nombres o carpetas).

**Justificaciones / desviaciones**: ninguna. Se extiende `TipoFiltro` con `TIPO_CONTENIDO` por decisión de clarify (la constitution lista cuatro valores "ejemplo"; no se contradice).

## 8. Trazabilidad

| Requisito / HU | Componentes UI | Servicios / dominio | Endpoint |
|---|---|---|---|
| HU-01, RF-05–08, RF-20 (FYP + scroll) | `FeedPublicaciones`, `EstadosFeed` | `CargarFeedFyp`, `CargarMasResultados`, `SesionBusqueda`, `PaginaResultados` | `GET /feed/fyp` |
| HU-02, RF-01–05, RF-23 (búsqueda) | `BarraBusqueda` | `BuscarPublicaciones`, `CriteriosBusqueda` | `GET /publicaciones/busqueda` |
| HU-03, RF-11–14, RF-21–22 (filtros) | `PanelFiltros`, `ChipsFiltrosActivos` | `Aplicar/Quitar/LimpiarFiltros`, `FiltroActivo` | `GET /publicaciones/busqueda`, `GET /filtros/catalogo` |
| HU-04, RF-09–10 (reinicio, obsoletas) | `FeedPublicaciones`, `PaginaBusqueda` | `SesionBusqueda` | — |
| HU-05, RF-17–18, RF-25 (estados, 401/403) | `EstadosFeed` | `ReintentarCarga`, errores tipados | respuestas 400/401/403/429/5xx |
| HU-06, RF-15–16, RF-26 (tarjeta) | `TarjetaPublicacion` | `AbrirPublicacion`, `PublicacionResumen` | campos en `PublicacionResumen` |
| HU-07, RF-24 (URL/scroll) | `PaginaBusqueda` (sincroniza query params) | `CriteriosBusqueda` ⇄ query params | — |
| RF-19 (solo lectura) | — | Puerto solo con lecturas | solo `GET` |

## 9. Pendientes (no asumidos)
- A-10, A-11, A-12, A-17, A-18, A-19, A-20: **resueltas** (ver Clarifications de spec.md). Sin autocompletado, sin orden, sin "no me interesa"; usuario nuevo, tiempos, volúmenes y tope los define la API; sin conexión = error de red con reintentar.
- A-02 (ubicación): **diferida al backend**. DISTANCIA queda deshabilitada hasta que lo defina; las tareas T038b, T042b, T060 (parte ubicación) y T061 (parte ubicación) quedan en espera.
- Campos definitivos de `PublicacionResumen` y distancia de la API (origen de la ubicación del usuario): marcados `x-pending` en OpenAPI.
- Ruta definitiva de la página: se define en tasks (T048). La reutilización de `Filtro.ts`/`Publicacion.ts` ya se decidió: no se reutilizan.
