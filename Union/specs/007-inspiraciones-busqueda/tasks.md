# Tareas — 007 Búsqueda y Descubrimiento

**Entradas**: spec.md, plan.md, data-model.md, contracts/openapi.yaml, quickstart.md, constitution.md
**Raíz de código**: `Union/frontend/` (todas las rutas son relativas a ella). No se toca el frontend de administración (`presentation/`, `*Admin*`).
**Nota**: este documento no implica implementar nada ahora. Es solo planificación.

## Adaptaciones respecto al pedido (por la constitution)

| Pedido | Adaptación | Motivo |
|---|---|---|
| Mocks de API con MSW | Adaptador en memoria que implementa `BusquedaRepository` (T020). **No se usa MSW** ni ningún servidor/interceptor de red | Constitution IV y plan §1: sin mocks de servidor; los datos de ejemplo viven tras la interfaz de servicio |
| Actualizaciones optimistas | **No aplica**: no hay tareas de este tipo | Constitution XIV: módulo de solo lectura, sin mutaciones |
| Estado de servidor | Se resuelve con `SesionBusqueda` (application) + hook delgado, sin librería nueva salvo decisión en T001 | Plan §2 |
| Permisos | Se tratan como manejo de 401/403 (errores tipados), no como reglas de rol en el cliente | Constitution XIII: la autorización es del backend |

Si se quisiera MSW igualmente, requiere enmendar la constitution del módulo antes (no se asume).

## Revisión tras /speckit.analyze (correcciones aplicadas)

- **Numeración**: T001–T075 completa. T060, T061 y T069–T075 son tareas añadidas por el análisis (sección "Tareas añadidas" más abajo). T053–T059 y T062–T068 conservan su ID.
- **MVP**: P1 (HU-01 a HU-05) = Fases 1–6 completas excepto T050 (HU-07) y T041/T054 en lo no esencial; P2 (HU-06, HU-07) = T035, T041, T050, T039, T070, T054, T063. T057–T059 son de cierre. Cada tarea indica su HU/RF en la descripción o en la tabla final.
- **Diferida por A-02 (distancia)**: cómo llega la ubicación a la API lo decide el backend y hoy no se sabe. El filtro DISTANCIA queda **deshabilitado** y nunca se envía. Tareas en espera (no se implementan en el MVP actual): T038b, T042b, y la parte de ubicación de T060/T061. El resto (rangos, mapeo a km, `admiteFiltro`, tests de T010/T031/T069) sí se hace, porque la regla "sin ubicación no se aplica" sigue vigente.
- **Capas**: la UI nunca importa `geolocationClient`, `authService` ni `sessionGuard`; usa puertos de `application` (T060) implementados en `infrastructure` (T061). `sessionGuard` es de administración y no se usa en este módulo.
- **Duplicados**: el único dueño es `PaginaResultados.agregar` (T011/T017). `SesionBusqueda` solo lo invoca.
- **ELIMINADA**: el cliente **no** filtra ni omite; se registra como violación de contrato (T071).
- **Selector de repositorio**: variable `VITE_BUSQUEDA_REPOSITORIO` (`ejemplo` | `http`), leída solo en `src/infrastructure/config.ts` (T005/T025).
- Un TIPO de dependencia explícita nueva: cada tarea de UI depende de su test de Fase 8; cada test de Fase 8 depende solo de T002/T003 (sin ciclos). T052 ya no depende de T044 (ahora T044 depende de T052).

## Convenciones
- `[P]` = paralelizable con otras tareas `[P]` de la misma fase cuyas dependencias estén cumplidas (archivos distintos).
- Las tareas de test van **antes** de su implementación (tests primero; deben fallar antes de implementar).
- Cada tarea cita la HU/RF de spec.md que cubre.

---

## Fase 1 — Setup del frontend

- [x] **T001** Verificar `package.json`, `vite.config.ts`, `tsconfig.json`: que existan Vitest, React Testing Library, `@testing-library/user-event`, `jsdom`; registrar en notas qué falta. Decidir si se añade alguna dependencia (no se añade librería de estado/fetching sin justificar). Archivos: `package.json`, `vite.config.ts`, `tsconfig.json`. Dep.: —
- [x] **T002** Configurar entorno de test (jsdom, `setupFiles`, alias de rutas) y script `test`. Archivos: `vite.config.ts`, `tests/setup.ts`. Dep.: T001
- [x] **T003** [P] Crear estructura de carpetas vacía del módulo: `src/domain/busqueda/`, `src/application/busqueda/`, `src/infrastructure/busqueda/`, `src/components/busqueda/`, `src/pages/busqueda/`, `tests/domain/busqueda/`, `tests/services/busqueda/`, `tests/components/busqueda/`, `tests/pages/busqueda/`. Dep.: T001
- [x] **T004** [P] Revisión hecha (hallazgos en plan.md §1). Decisiones: `Filtro.ts` y `Publicacion.ts` no se reutilizan; `FiltroPanel` no se reutiliza; `FiltroChip` se adapta (T043); `sessionGuard` no aplica (es de admin; usar `authService`/`AuthContext`); `httpClient` no soporta parámetros repetidos (T022 serializa arrays o se amplía el cliente). Archivos revisados: `src/domain/enums/TipoFiltro.ts`, `src/domain/Filtro.ts`, `src/domain/Publicacion.ts`, `src/components/filtros/*`, `src/application/ports/HttpClient.ts`, `src/infrastructure/httpClient.ts`, `src/infrastructure/geolocationClient.ts`, `src/infrastructure/sessionGuard.ts`. Dep.: T001
- [x] **T005** [P] Definir el punto único de composición/config para elegir repositorio mediante la variable `VITE_BUSQUEDA_REPOSITORIO` (`ejemplo` por defecto | `http`), sin lógica de negocio. Archivos: `src/infrastructure/config.ts`, `src/vite-env.d.ts`. Dep.: T001
- [x] **T006** [P] Revisar el constitution general (`.specify/memory/constitution.md`) y confirmar que no hay reglas adicionales (nombres, carpetas) no cubiertas en plan.md §7. Dep.: —

---

## Fase 2 — Tipos y funciones puras de dominio (reglas y validaciones)

> Prioridad máxima. Sin React ni HTTP en esta capa. Cubre constitution II, VII, IX.

### Tests primero
- [x] **T007** [P] Tests de normalización de texto (trim, colapso de espacios, máx. 100, solo espacios = vacío) — HU-02, RF-02, RF-23. Archivo: `tests/domain/busqueda/CriteriosBusqueda.normalizacion.test.ts`. Dep.: T002, T003
- [x] **T008** [P] Tests de `origen()` y `esBuscable()` (vacío→FYP, 1 carácter no busca, ≥2 → BUSQUEDA) — HU-01/02, RF-05, RF-23. Archivo: `tests/domain/busqueda/CriteriosBusqueda.origen.test.ts`. Dep.: T002, T003
- [x] **T009** [P] Tests de combinación de filtros (OR en mismo tipo, AND entre tipos y texto, sin duplicados), quitar uno, quitar por tipo, limpiar todos, inmutabilidad — HU-03, RF-12–14, RF-22. Archivo: `tests/domain/busqueda/CriteriosBusqueda.filtros.test.ts`. Dep.: T002, T003
- [x] **T010** [P] Tests de DISTANCIA: rechazada sin ubicación concedida, rangos válidos (5/25/100), CUALQUIERA equivale a no filtrar, `TIPO_CONTENIDO` solo acepta `TipoContenido` — RF-21, RF-22. Archivo: `tests/domain/busqueda/FiltroActivo.test.ts`. Dep.: T002, T003
- [x] **T011** [P] Tests de `PaginaResultados` (hayMas ⇔ cursor, `agregar` preserva orden y descarta ids repetidos, vacía) — HU-01, RF-06, RF-20. Archivo: `tests/domain/busqueda/PaginaResultados.test.ts`. Dep.: T002, T003
- [x] **T012** [P] Tests del codec URL de criterios (`CodecCriteriosUrl`): serializa/parsea query params, inválidos ignorados, rango distancia ⇄ km (`KM_25` ⇄ `25`), ubicación nunca en URL — HU-07, RF-24. Archivo: `tests/domain/busqueda/CodecCriteriosUrl.test.ts`. Dep.: T002, T003

### Implementación
- [x] **T013** [P] Enums: añadir `TIPO_CONTENIDO` a `TipoFiltro` (valor `"tipo_contenido"`; no alterar los valores existentes ni mezclarlo con `TIPO_ARTE`, que el `Filtro.ts` viejo asocia a `tipoContenido`); crear `OrigenFeed`, `RangoDistancia`, `TipoErrorBusqueda`, `EstadoCarga`. Archivos: `src/domain/enums/TipoFiltro.ts`, `src/domain/enums/OrigenFeed.ts`, `src/domain/enums/RangoDistancia.ts`, `src/domain/enums/TipoErrorBusqueda.ts`, `src/domain/enums/EstadoCarga.ts`. Dep.: T004
- [x] **T014** `FiltroActivo` (value object con invariantes). Archivo: `src/domain/busqueda/FiltroActivo.ts`. Dep.: T013, T010
- [x] **T015** `CriteriosBusqueda` (normalización, `origen`, `esBuscable`, combinación, operaciones inmutables, `equivale`, regla de ubicación y `admiteFiltro(tipo, contexto)`). **Sin** serialización URL (va en T070). Archivo: `src/domain/busqueda/CriteriosBusqueda.ts`. Dep.: T014, T007, T008, T009, T069
- [x] **T016** [P] `PublicacionResumen` y `CatalogoFiltros`/`OpcionFiltro`. Archivos: `src/domain/busqueda/PublicacionResumen.ts`, `src/domain/busqueda/CatalogoFiltros.ts`. Dep.: T013
- [x] **T017** `PaginaResultados`. Archivo: `src/domain/busqueda/PaginaResultados.ts`. Dep.: T016, T011
- [x] **T018** [P] Errores de dominio tipados (`ErrorBusqueda` con `TipoErrorBusqueda`). Archivo: `src/domain/busqueda/ErrorBusqueda.ts`. Dep.: T013

**Punto de control**: todos los tests T007–T012 en verde.

---

## Fase 3 — Capa de servicios, cliente HTTP y datos de ejemplo (sin MSW)

### Puerto y tests primero
- [x] **T019** Puerto `BusquedaRepository` (`obtenerFyp`, `buscar`, `obtenerCatalogoFiltros`, con `signal`). Archivo: `src/application/busqueda/BusquedaRepository.ts`. Dep.: T015, T017, T018
- [x] **T020a** Datos de ejemplo y paginación por cursor opaco del adaptador en memoria `BusquedaEnMemoriaRepository` (páginas de `TAMANO_PAGINA`=20 de T075, catálogo, nunca devuelve ELIMINADA). **No es servidor ni usa MSW.** Archivos: `src/infrastructure/busqueda/BusquedaEnMemoriaRepository.ts`, `src/infrastructure/busqueda/datosEjemplo.ts`. Dep.: T019, T075
- [x] **T020b** Simulación configurable de latencia y fallos (401/403/red/429) para tests, separada de los datos. Archivo: `src/infrastructure/busqueda/simulacionFallos.ts`. Dep.: T020a
  (las dependencias "T020" de otras tareas se leen como T020a + T020b)
- [x] **T021** [P] Mapeadores DTO ⇄ dominio según OpenAPI (`PublicacionResumenDto`, `PaginaPublicacionesDto`, `CatalogoFiltrosDto`, `ErrorDto`→`ErrorBusqueda`). Archivo: `src/infrastructure/busqueda/busquedaMappers.ts`. Dep.: T019
- [x] **T022** Cliente `BusquedaHttpRepository` (GET `/feed/fyp`, `/publicaciones/busqueda`, `/filtros/catalogo`; query params del contrato; respeta `AbortSignal`; mapea 400/401/403/429/red/5xx). Reutiliza `httpClient.ts` (respeta `AbortSignal`; **no** soporta parámetros repetidos: serializar los arrays `estilo`, `tecnica`, `tipoArte` y `tipoContenido` como claves repetidas dentro del repositorio, sin modificar el cliente compartido salvo decisión aparte). Mapea `HttpUnauthorizedError`/`HttpForbiddenError`/`ApiError`. No se conecta a ninguna API real. Usa `TAMANO_PAGINA` (T075) y la conversión de distancia a km. Archivo: `src/infrastructure/busqueda/BusquedaHttpRepository.ts`. Dep.: T019, T021, T004, T075
- [x] **T023** [P] Test de mapeadores y de errores HTTP del cliente con un `HttpClient` falso (no MSW). Archivos: `tests/services/busqueda/busquedaMappers.test.ts`, `tests/services/busqueda/BusquedaHttpRepository.test.ts`. Dep.: T021, T022
- [x] **T024** [P] (Opcional) Test de contrato: el cliente HTTP coincide con `contracts/openapi.yaml` (rutas, parámetros, esquemas). Preferir comparar rutas y nombres de parámetros leyendo el YAML con utilidades ya disponibles; añadir un validador OpenAPI solo si se justifica en T001. Archivo: `tests/services/busqueda/contrato.test.ts`. Dep.: T022, T001
- [x] **T025** Selección del repositorio en el punto de composición. Archivo: `src/infrastructure/config.ts`. Dep.: T020, T022, T005

---

## Fase 4 — Casos de uso y estado de sesión (hooks)

> Sin actualizaciones optimistas (módulo de solo lectura).

### Tests primero (contra el adaptador en memoria)
- [x] **T026** [P] Tests de `SesionBusqueda`: FYP vs búsqueda según criterios — HU-01/02, RF-05. Archivo: `tests/services/busqueda/SesionBusqueda.origen.test.ts`. Dep.: T020, T015
- [x] **T027** [P] Tests de control de concurrencia: no cargar más mientras hay carga en curso ni con `hayMas=false` — HU-01, RF-08. Archivo: `tests/services/busqueda/SesionBusqueda.paginacion.test.ts`. Dep.: T020
- [x] **T028** [P] Tests de reinicio al cambiar texto/filtros (items vacíos, cursor nulo, señal de scroll al inicio) — HU-04, RF-09. Archivo: `tests/services/busqueda/SesionBusqueda.reinicio.test.ts`. Dep.: T020
- [x] **T029** [P] Tests de respuestas obsoletas (token + cancelación con `AbortController`; respuesta tardía ignorada) — HU-02/04, RF-10. Archivo: `tests/services/busqueda/SesionBusqueda.obsoletas.test.ts`. Dep.: T020
- [x] **T030** [P] Tests de errores: 401/403/red/429, reintento de primera página y de página adicional conservando items — HU-05, RF-17–18, RF-25. Archivo: `tests/services/busqueda/SesionBusqueda.errores.test.ts`. Dep.: T020
- [x] **T031** [P] Tests de DISTANCIA sin ubicación en la sesión (no se agrega ni se envía) — RF-21. Archivo: `tests/services/busqueda/SesionBusqueda.distancia.test.ts`. Dep.: T020

### Implementación
- [x] **T032** Casos de uso `CargarFeedFyp`, `BuscarPublicaciones`, `CargarMasResultados`. Archivos: `src/application/busqueda/CargarFeedFyp.ts`, `src/application/busqueda/BuscarPublicaciones.ts`, `src/application/busqueda/CargarMasResultados.ts`. Dep.: T019, T026, T027
- [x] **T033** [P] Casos de uso `AplicarFiltro`, `QuitarFiltro`, `LimpiarFiltros` (delegan en `CriteriosBusqueda`). Archivos: `src/application/busqueda/AplicarFiltro.ts`, `src/application/busqueda/QuitarFiltro.ts`, `src/application/busqueda/LimpiarFiltros.ts`. Dep.: T015
- [x] **T034a** `SesionBusqueda` — estado y transiciones (criterios, items acumulados vía `PaginaResultados.agregar`, cursor, `EstadoCarga`, reinicio al cambiar criterios). No deduplica por su cuenta. Archivo: `src/application/busqueda/SesionBusqueda.ts`. Dep.: T032, T033, T028, T031
- [x] **T034b** Cancelación y respuestas obsoletas (token de secuencia + `AbortController`), incluida la carga adicional en curso cuando cambian los filtros. Archivo: `src/application/busqueda/ControlPeticiones.ts`. Dep.: T034a, T029
- [x] **T034c** `ReintentarCarga` y mapeo de errores tipados. Archivo: `src/application/busqueda/ReintentarCarga.ts`. Dep.: T034a, T030
- [x] **T035** [P] Caso de uso `AbrirPublicacion` (resuelve destino de navegación al detalle de otro módulo; la ruta exacta se toma de `routes/`). Archivo: `src/application/busqueda/AbrirPublicacion.ts`. Dep.: T016
- [x] **T036** [P] Caso de uso `ObtenerCatalogoFiltros` con manejo de error local. Archivo: `src/application/busqueda/ObtenerCatalogoFiltros.ts`. Dep.: T019
- [x] **T037** Hook delgado `useBusqueda` que observa `SesionBusqueda` (sin reglas de negocio). Archivo: `src/pages/busqueda/useBusqueda.ts`. Dep.: T034a, T034b, T034c, T025
- [x] **T038** [P] Hooks `useDebounce` (400 ms) y `useInfiniteScrollSentinel` (IntersectionObserver). Archivos: `src/pages/busqueda/useDebounce.ts`, `src/pages/busqueda/useInfiniteScrollSentinel.ts`. Dep.: T004
- [ ] **T038b** [EN ESPERA: A-02 diferida al backend] Hook `useUbicacionPermiso` que consume el puerto `UbicacionPort` (no importa `geolocationClient`) y su test. Archivos: `src/pages/busqueda/useUbicacionPermiso.ts`, `tests/components/busqueda/useUbicacionPermiso.test.ts`. Dep.: T060, T004
- [x] **T039** [P] Hook `useCriteriosEnUrl` (sincroniza query params ⇄ criterios usando `CodecCriteriosUrl` (T070); `replace` para texto, `push` para filtros). Archivo: `src/pages/busqueda/useCriteriosEnUrl.ts`. Dep.: T015, T070, T012

---

## Fase 5 — Componentes reutilizables de UI

> Sin reglas de negocio. Tests de cada componente antes de implementarlo (se listan en Fase 8; aquí se indica la dependencia).

- [x] **T040** [P] `BarraBusqueda` (`role="search"`, etiqueta, botón borrar, debounce vía hook). Archivos: `src/components/busqueda/BarraBusqueda.tsx`, `src/components/busqueda/busqueda.css`. Dep.: T038, T062
- [x] **T041** [P] `TarjetaPublicacion` (miniatura lazy con `aspect-ratio`, título, autor, `TipoContenido`; enlace accesible al detalle; placeholder si la imagen falla). Archivo: `src/components/busqueda/TarjetaPublicacion.tsx`. Dep.: T016, T063
- [x] **T042a** [P] `PanelFiltros` + `SelectorFiltroCatalogo` (reutiliza/adapta `FiltroPanel`; selección múltiple; error local de catálogo con reintentar). Solo consulta al dominio; sin reglas. Archivos: `src/components/busqueda/PanelFiltros.tsx`, `src/components/busqueda/SelectorFiltroCatalogo.tsx`. Dep.: T004, T036, T064
- [ ] **T042b** [EN ESPERA: A-02 diferida al backend] `ControlDistancia` (se muestra siempre deshabilitado con aviso mientras no exista mecanismo de ubicación; consulta `CriteriosBusqueda.admiteFiltro`). Archivo: `src/components/busqueda/ControlDistancia.tsx`. Dep.: T042a, T069, T038b
- [x] **T043** [P] `ChipsFiltrosActivos` (reutiliza `FiltroChip`; botón "quitar" etiquetado; "Limpiar todos"). Archivo: `src/components/busqueda/ChipsFiltrosActivos.tsx`. Dep.: T004, T064
- [ ] **T044** [P] Un componente por estado: `EsqueletoTarjetas`, `EstadoVacio` (con acción limpiar filtros), `EstadoError` (con Reintentar), `AvisoSinPermiso` (403). Archivos: `src/components/busqueda/EsqueletoTarjetas.tsx`, `src/components/busqueda/EstadoVacio.tsx`, `src/components/busqueda/EstadoError.tsx`, `src/components/busqueda/AvisoSinPermiso.tsx`. Dep.: T013, T052, T065
- [ ] **T045a** [P] `GrillaPublicaciones` (grilla de tarjetas, región `aria-live`). Archivo: `src/components/busqueda/GrillaPublicaciones.tsx`. Dep.: T041, T066
- [ ] **T045b** `FeedPublicaciones` + `PieCarga` (centinela de scroll infinito, fila de carga, botón "Cargar más" de respaldo; compone la grilla y los estados). Archivos: `src/components/busqueda/FeedPublicaciones.tsx`, `src/components/busqueda/PieCarga.tsx`. Dep.: T045a, T044, T038, T066
- [ ] **T046** [P] Barrel `index.ts` del módulo de componentes. Archivo: `src/components/busqueda/index.ts`. Dep.: T040–T045

---

## Fase 6 — Pantallas y rutas

- [ ] **T047** `PaginaBusqueda`: compone barra, chips, panel y feed; usa `useBusqueda`, `useCriteriosEnUrl`; decide qué estado mostrar solo leyendo `EstadoCarga`/`OrigenFeed`. Archivos: `src/pages/busqueda/PaginaBusqueda.tsx`, `src/pages/busqueda/busqueda-page.css`, `src/pages/busqueda/index.ts`. Dep.: T037, T039, T046, T067
- [ ] **T048** Registrar la ruta de la página (definir ruta y su relación con `HomePage`; el destino de "abrir publicación" apunta a la ruta de detalle del otro módulo) y decidir si va protegida con `RutaProtegida`. Archivos: `src/routes/AppRoutes.tsx`, `src/routes/index.ts`. Dep.: T047
- [ ] **T049** Manejo de 401 → login usando el puerto `SesionUsuarioPort` (T060), sin importar `sessionGuard` desde la UI. Archivo: `src/pages/busqueda/PaginaBusqueda.tsx`. Dep.: T047, T030, T060, T061
- [ ] **T050** Conservación de scroll y criterios al volver del detalle (estrategia decidida en research §5: estado por encima de la ruta o `sessionStorage`). Archivos: `src/pages/busqueda/PaginaBusqueda.tsx`, `src/pages/busqueda/useRestauracionScroll.ts`. Dep.: T047, T048
- [ ] **T051** Revisar que no se rompa `HomePage` ni rutas existentes (solo verificación). Archivos: `src/pages/home/HomePage.tsx`, `src/routes/AppRoutes.tsx`. Dep.: T048

---

## Fase 7 — Estados globales, errores, accesibilidad y rendimiento

- [ ] **T052** [P] Textos de mensajes de estado (carga, vacío, errores 400/401/403/429/red) centralizados para evitar duplicación. Archivo: `src/components/busqueda/mensajes.ts`. Dep.: T013
- [ ] **T053** [P] Auditoría de accesibilidad: foco visible, navegación por teclado, etiquetas, `aria-live`, contraste AA en `busqueda.css`. Archivos: `src/components/busqueda/busqueda.css`, `src/pages/busqueda/busqueda-page.css`. Dep.: T047
- [ ] **T054** [P] Rendimiento de imágenes y layout: `loading="lazy"`, `decoding="async"`, `aspect-ratio` y esqueletos del mismo tamaño; verificar sin saltos de diseño. Archivo: `src/components/busqueda/TarjetaPublicacion.tsx`, `busqueda.css`. Dep.: T041
- [ ] **T055** [P] Verificar cancelación al desmontar la página y limpieza del observer y de timers del debounce. Archivos: `src/pages/busqueda/useBusqueda.ts`, `useInfiniteScrollSentinel.ts`. Dep.: T037, T038
- [ ] **T056** Revisión contra constitutions: ninguna regla de negocio en componentes, sin `instanceof` innecesario, sin filtrado/orden en memoria, sin funciones gigantes (checklist de plan.md §7). Dep.: T047
- [x] **T057** Revisión de pendientes: A-10, A-11, A-12, A-17, A-18, A-19 y A-20 resueltas y reflejadas en spec.md (Clarifications y sección 10); A-02 queda diferida al backend y marcada `x-pending` en el OpenAPI. Archivos: `spec.md`, `contracts/openapi.yaml`. Dep.: —
- [ ] **T058** Si se decide virtualizar (por mediciones o por A-18), crear una nueva tarea con justificación; por ahora **no se virtualiza** (research §4). Dep.: T057
- [ ] **T059** Validación manual de los 12 escenarios de `quickstart.md` con el adaptador en memoria. Dep.: T047–T055

---

## Fase 8 — Tests de componentes y de páginas

> Se escriben antes de implementar su componente (T040–T047) y deben fallar al inicio.

- [x] **T062** [P] `BarraBusqueda`: debounce 400 ms (no dispara por tecla), mínimo 2 caracteres, normalización antes de emitir, borrar con un paso, etiqueta accesible y teclado — HU-02, RF-01–04, RF-23. Archivo: `tests/components/busqueda/BarraBusqueda.test.tsx`. Dep.: T002, T003
- [x] **T063** [P] `TarjetaPublicacion`: muestra miniatura, título, autor, tipo; enlace al detalle; imagen lazy con espacio reservado; placeholder en error — HU-06, RF-15, RF-26. Archivo: `tests/components/busqueda/TarjetaPublicacion.test.tsx`. Dep.: T002, T003
- [x] **T064** [P] `PanelFiltros` y `ChipsFiltrosActivos`: aplicar, múltiple, quitar uno, limpiar todos, chips visibles, DISTANCIA deshabilitada sin ubicación — HU-03, RF-11–14, RF-21. Archivo: `tests/components/busqueda/PanelFiltros.test.tsx`. Dep.: T002, T003
- [x] **T065** [P] `EstadosFeed`: esqueletos, vacío con acción "limpiar filtros", error con Reintentar, aviso 403 — HU-05, RF-17–18. Archivo: `tests/components/busqueda/EstadosFeed.test.tsx`. Dep.: T002, T003
- [x] **T066** [P] `FeedPublicaciones`: scroll infinito con `IntersectionObserver` simulado; no solicita cuando `cargando` o `hayMas=false`; orden preservado — HU-01, RF-06–08. Archivo: `tests/components/busqueda/FeedPublicaciones.test.tsx`. Dep.: T002, T003
- [x] **T067** [P] `PaginaBusqueda` (integración UI + `SesionBusqueda` + adaptador en memoria): vacío→FYP, texto→resultados, filtros combinados, reinicio al cambiar criterios, respuestas obsoletas, estados carga/vacío/error, 401 redirige, 403 aviso, URL ⇄ criterios, scroll al volver — HU-01–HU-07. Se divide por historia en archivos `tests/pages/busqueda/PaginaBusqueda.hu01.test.tsx` … `hu07.test.tsx` (un archivo por HU). Dep.: T002, T003, T020a, T020b
- [ ] **T068** Ejecutar toda la suite y verificar que ninguna regla de spec.md §7 quede sin test (matriz regla → test). Dep.: T047, T062–T067

---

## Tareas añadidas tras el análisis

- [ ] **T060** Puertos de `application` para dependencias de infraestructura: `UbicacionPort` (permiso/posición; **en espera por A-02**, solo se define la interfaz mínima) y `SesionUsuarioPort` (ante 401: ir a login). Archivos: `src/application/busqueda/UbicacionPort.ts`, `src/application/busqueda/SesionUsuarioPort.ts`. Dep.: T004
- [ ] **T061** Adaptadores de infraestructura: `UbicacionAdapter` sobre `geolocationClient.ts` (en espera por A-02) y `SesionUsuarioAdapter` sobre `authService`/`AuthContext` (logout local y redirección a `/login`, igual que `RutaProtegida`); **no** usa `sessionGuard` (es de administración). No modifica el comportamiento existente. Archivos: `src/infrastructure/busqueda/UbicacionAdapter.ts`, `src/infrastructure/busqueda/SesionUsuarioAdapter.ts`. Dep.: T060
- [ ] **T069** Tests de dominio de `admiteFiltro(tipo, contexto)` (DISTANCIA sin ubicación = no; resto = sí), y de la regla de texto de 1 carácter (`esBuscable()` falso, `origen()` = FYP; ver spec Clarifications). Archivo: `tests/domain/busqueda/CriteriosBusqueda.admision.test.ts`. Dep.: T002, T003
- [x] **T070** `CodecCriteriosUrl` (parseo/serialización de criterios ⇄ query params; mapeo `RangoDistancia` ⇄ km; ignora inválidos). Capa de dominio, separada de `CriteriosBusqueda`. Archivo: `src/domain/busqueda/CodecCriteriosUrl.ts`. Dep.: T015, T012
- [ ] **T071** Test RF-16: el adaptador en memoria nunca devuelve ELIMINADA y la UI/sesión **no** filtra ni omite items (renderiza lo recibido); si llega una ELIMINADA se registra como violación de contrato. Archivo: `tests/services/busqueda/EliminadasContrato.test.ts`. Dep.: T020a, T034a
- [ ] **T072** Scroll al inicio al cambiar texto o filtros (CA-04.2): comportamiento en el contenedor de la lista disparado por el cambio de criterios, sin reglas de negocio. Archivo: `src/pages/busqueda/useScrollAlInicio.ts`. Dep.: T037, T038
- [ ] **T073** Test CA-04.2: cambiar criterios lleva el scroll al inicio y reinicia la lista. Archivo: `tests/pages/busqueda/PaginaBusqueda.hu04.test.tsx`. Dep.: T002, T003
- [ ] **T074a** Test RF-19 (solo lectura): el puerto `BusquedaRepository` no expone operaciones de escritura y `BusquedaHttpRepository` solo emite GET. Archivo: `tests/services/busqueda/SoloLectura.test.ts`. Dep.: T022
- [ ] **T074b** (alias interno) Consolidar el hook de scroll como dependencia de T072; no añade archivos. Dep.: T038
- [ ] **T075** Constantes y reglas de soporte en dominio/aplicación: `TAMANO_PAGINA`=20, `DEBOUNCE_MS`=400, `MIN_CARACTERES`=2, `MAX_CARACTERES`=100, y mapeo `RangoDistancia` ⇄ km, con tests. Archivos: `src/domain/busqueda/constantes.ts`, `tests/domain/busqueda/constantes.test.ts`. Dep.: T013

**Test adicional en T029/T030**: cambio de filtros durante una carga adicional (la respuesta pendiente se descarta) y error local de catálogo (T036/T042a).

## Dependencias entre fases

```
Fase 1 → Fase 2 (tests T007–T012 → impl T013–T018)
Fase 2 → Fase 3 (puerto T019 requiere dominio)
Fase 3 (T020) → Fase 4 (tests de sesión contra el adaptador)
Fase 4 → Fase 6; Fase 5 → Fase 6
Fase 8 (tests de componentes) se escribe antes de Fase 5/6
Fase 7 al final, tras Fase 6
```

## Orden sugerido (camino crítico)
T001 → T002 → T007–T012 → T013 → T014 → T015 → T016–T018 → T019 → T020 → T026–T031 → T032–T034 → T037 → T062–T066 → T040–T046 → T047 → T048 → T049/T050 → Fase 7 → T068.

## Trazabilidad rápida

| HU / RF | Tareas |
|---|---|
| HU-01, RF-05–08, RF-20 | T008, T011, T017, T026, T027, T032, T045, T066 |
| HU-02, RF-01–05, RF-23 | T007, T008, T015, T029, T038, T040, T062 |
| HU-03, RF-11–14, RF-21–22 | T009, T010, T014, T033, T042, T043, T064 |
| HU-04, RF-09–10 | T028, T029, T034 |
| HU-05, RF-17–18, RF-25 | T030, T044, T049, T065 |
| HU-06, RF-15–16, RF-26 | T035, T041, T054, T063 |
| HU-07, RF-24 | T012, T039, T050 |
| RF-16 (ELIMINADA no se muestra) | T020a, T071 |
| RF-19 (solo lectura) | T019 (puerto solo con lecturas), T074a, T056 |
| CA-04.2 (scroll al inicio) | T072, T073 |
| Separación de capas (ubicación/sesión) | T060, T061 |
| Constantes y mapeo de distancia | T075, T070, T012 |
| Tareas de soporte sin HU directa | T001–T006, T051, T052, T055, T057–T059, T068 |
