# Tasks: Plataforma Unificada — Red Social de Inspiración Artística (Frontend)

**Input**: `spec.md`, `plan.md`, `data-model.md`, `contracts/api-contracts.md`, `quickstart.md`
(Union/specs/001-plataforma-unificada)

**Alcance de este documento**: Únicamente planificación de tareas (`/speckit.tasks`). **No se
implementa código ni se ejecuta ninguna tarea en esta fase**, conforme al Principio XVIII de
`.specify/memory/constitution.md`. Cada tarea describe qué archivo(s) concretos deberá crear o
modificar el equipo de implementación cuando se autorice el paso a `/speckit.implement`.

**Convenciones**:
- `[P]` = tarea paralelizable (no depende de que otra tarea marcada termine antes; toca archivos
  distintos a otras tareas `[P]` del mismo bloque).
- Sin `[P]` = tarea secuencial: depende de una tarea anterior explícitamente listada en
  "Depende de".
- Dos proyectos independientes: `Usuario/my-project/backend_usuario/frontend/` (frontend de
  usuario, HU-01..HU-09) y `Admin/my-proyect/frontend-admin/` (frontend de administración,
  HU-10..HU-15) — rutas tomadas de la estructura real del repositorio y de `plan.md`.
- Prioridad exigida por el usuario: **dominio y tests de reglas de negocio primero**, luego
  infraestructura, luego aplicación/servicios, luego presentación, luego integración/polish.

---

## Fase 0 — Setup y Configuración Base

### T001 [P] — Confirmar estructura de carpetas del frontend de usuario
**Archivos**: `Usuario/my-project/backend_usuario/frontend/src/domain/`,
`.../src/domain/enums/`, `.../src/services/`, `.../src/infrastructure/`, `.../src/pages/`,
`.../src/components/`, `.../tests/domain/`, `.../tests/services/`, `.../tests/components/`
**Descripción**: Verificar/crear la estructura de directorios de 4 capas descrita en `plan.md`
(sección "Project Structure") para `frontend/`. No crear archivos de código, solo la jerarquía de
carpetas necesaria para las tareas siguientes.
**Depende de**: Ninguna.

### T002 [P] — Confirmar estructura de carpetas del frontend de administración
**Archivos**: `Admin/my-proyect/frontend-admin/src/domain/`, `.../src/domain/enums/`,
`.../src/application/`, `.../src/infrastructure/`, `.../src/presentation/`, `.../tests/domain/`,
`.../tests/application/`, `.../tests/presentation/`, `.../tests/integration/` 
**Descripción**: Verificar la estructura de 4 capas ya presente (`domain/application/
infrastructure/presentation`) descrita en `plan.md`, ajustando nombres de subcarpetas por pantalla
(`usuarios/`, `moderacion/`, `desafios/`, `reportes/`, `dashboard/`, `login/`) si faltan.
**Depende de**: Ninguna.

### T003 [P] — Definir variables de entorno de `frontend/`
**Archivos**: `Usuario/my-project/backend_usuario/frontend/.env.example`
**Descripción**: Documentar `VITE_API_BASE_URL`, `VITE_AUTH_GOOGLE_REDIRECT_URL`,
`VITE_AUTH_GITHUB_REDIRECT_URL`, `VITE_GEOLOCATION_ENABLED_DEFAULT` según `quickstart.md` sección 2.
**Depende de**: Ninguna.

### T004 [P] — Definir variables de entorno de `frontend-admin/`
**Archivos**: `Admin/my-proyect/frontend-admin/.env.example`
**Descripción**: Documentar `VITE_API_BASE_URL`, `VITE_SESSION_EXPIRY_REDIRECT` según
`quickstart.md` sección 2.
**Depende de**: Ninguna.

---

## Fase 1 — Enums y Contratos de Tipos (Dominio Base)

> Estos enums son prerequisito de las entidades de dominio (Fase 2) y de sus tests (Fase 3).

### T005 [P] — Enum `TipoContenido`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/enums/TipoContenido.ts`
**Descripción**: Definir enum con valores `IMAGEN, VIDEO, MUSICA, TUTORIAL, ESCULTURA, DIGITAL`
según `data-model.md`.
**Depende de**: T001.

### T006 [P] — Enum `EstadoPublicacion` (usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/enums/EstadoPublicacion.ts`
**Descripción**: Valores `ACTIVA, REPORTADA, ELIMINADA`.
**Depende de**: T001.

### T007 [P] — Enum `TipoFiltro`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/enums/TipoFiltro.ts`
**Descripción**: Valores `estilo, tecnica, tipo_arte, distancia`.
**Depende de**: T001.

### T008 [P] — Enum `RolUsuario` (vista usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/enums/RolUsuario.ts`
**Descripción**: Valor `USER` únicamente, según restricción RF-15/A14.
**Depende de**: T001.

### T009 [P] — Tipo `MotivoReporte` (vista usuario, interfaz abierta)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/enums/MotivoReporte.ts`
**Descripción**: Interfaz `{ codigo: string; etiqueta: string }` (vocabulario abierto provisto por
backend), según `data-model.md`.
**Depende de**: T001.

### T010 [P] — Enum `RolUsuario` (vista administración)
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/RolUsuario.ts`
**Descripción**: Valores `USER, ADMIN`.
**Depende de**: T002.

### T011 [P] — Enum `EstadoCuentaUsuario`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/EstadoCuentaUsuario.ts`
**Descripción**: Valores `ACTIVO, BANEADO, ELIMINADO`.
**Depende de**: T002.

### T012 [P] — Enum `EstadoPublicacion` (vista administración)
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/EstadoPublicacion.ts`
**Descripción**: Valores `ACTIVA, REPORTADA, ELIMINADA` (misma semántica que T006, entidad
independiente por separación de proyectos — Principio IV).
**Depende de**: T002.

### T013 [P] — Enum `EstadoModeracion`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/EstadoModeracion.ts`
**Descripción**: Valores `PENDIENTE, EN_REVISION, RESUELTO, DESESTIMADO` (estado del reporte).
**Depende de**: T002.

### T014 [P] — Enum `MotivoReporte` (vista administración, cerrado)
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/MotivoReporte.ts`
**Descripción**: Valores `SPAM, CONTENIDO_INAPROPIADO, PLAGIO_DERECHOS_AUTOR, VIOLENCIA, OTRO`.
**Depende de**: T002.

### T015 [P] — Enum `EstadoDesafioPropuesto`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/EstadoDesafioPropuesto.ts`
**Descripción**: Valores `PENDIENTE, APROBADO, RECHAZADO`.
**Depende de**: T002.

---

## Fase 2 — Entidades de Dominio (Modelos de UI con Reglas de Negocio)

> Prioridad máxima solicitada por el usuario. Cada entidad encapsula las reglas descritas en
> `data-model.md`; ningún método realiza llamadas HTTP.

### T016 [P] — Entidad `Publicacion`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/Publicacion.ts`
**Descripción**: Propiedades (`id, autorId, tipoContenido, estado, tags, cantidadLikes,
likeDelUsuarioActual, reportadaPorUsuarioActual`) y métodos `esPropia()`, `puedeDarLike()`,
`puedeReportar()`, `puedeEditar()`, `puedeEliminar()`, `toggleLike()` (RF-30 a RF-35).
**Depende de**: T005, T006.

### T017 [P] — Entidad `Usuario` (dominio del frontend de usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/Usuario.ts`
**Descripción**: Propiedades y métodos `esUsuarioActual()`, `puedeMostrarBotonSeguir()`,
`toggleSeguir()` (RF-37, RF-39).
**Depende de**: T008.

### T018 [P] — Entidad `Filtro`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/Filtro.ts`
**Descripción**: Métodos `distanciaHabilitada()`, `activos()`, `aQueryParams()`, `quitar(tipo)`
(RF-40, RF-42, RF-45).
**Depende de**: T007.

### T019 [P] — Entidad `Carpeta`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/Carpeta.ts`
**Descripción**: Métodos `puedeEliminarse()`, `puedeRenombrarse()` (regla de dueño). El límite de
100 carpetas se deja documentado como regla de colección a validar en el servicio (Fase 4), no en
esta entidad.
**Depende de**: T001.

### T020 [P] — Entidad `Desafio` (participación, frontend de usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/domain/Desafio.ts`
**Descripción**: Método `puedeParticiparUsuarioActual(autenticado)`.
**Depende de**: T001.

### T021 [P] — Entidad `UsuarioAdmin`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/UsuarioAdmin.ts`
**Descripción**: Métodos `esElPropioAdministrador()`, `puedeSerBaneado()`, `puedeSerEliminado()`,
`puedeSerPromovido()`, `puedeSerDegradado()` (RF-57 a RF-59, RF-76, CB-11, CB-12). El método
`puedeSerDegradado(adminActualId)` retorna `true` solo si `rol === ADMIN` y no es el propio
administrador (agregado en clarificación 2026-09-17, resuelve **A8**).
**Depende de**: T010, T011.

### T022 [P] — Entidad `PublicacionModeracion`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/PublicacionModeracion.ts`
**Descripción**: Métodos `estaReportada()`, `puedeEliminarse()`.
**Depende de**: T012, T014.

### T023 [P] — Entidad `Reporte`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/Reporte.ts`
**Descripción**: Métodos `estaPendiente()`, `puedeResolverseSinEliminar()`,
`antiguedadEnDias(fechaActual)` (RF-64, RF-65). La propiedad `prioridad` se tipa como
`PrioridadReporte` (enum, ver T025B), no como unión de strings.
**Depende de**: T013, T014, T025B.

### T024 [P] — Entidad `DesafioPropuesto`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/DesafioPropuesto.ts`
**Descripción**: Métodos `estaPendiente()`, `puedeAprobarse()`, `puedeRechazarse()` (CB-15:
transición final irreversible).
**Depende de**: T015.

### T025 [P] — Entidad `ExportacionReporte`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/ExportacionReporte.ts`
**Descripción**: Método `fueExitosa()` (RF-71 a RF-74).
**Depende de**: T002.

### T025B [P] — Enum `PrioridadReporte`
**Archivo**: `Admin/my-proyect/frontend-admin/src/domain/enums/PrioridadReporte.ts`
**Descripción**: Enum `{ ALTA, MEDIA, BAJA }` (RF-65). Agregado en clarificación 2026-09-17 para
reemplazar la unión de strings previa en `Reporte.prioridad`, conforme al Principio VII de la
constitución (enums para valores cerrados). Requiere actualizar la propiedad `prioridad` de la
entidad `Reporte` (T023) para tipar contra este enum.
**Depende de**: T002.

---

## Fase 3 — Tests de Dominio (Reglas de Negocio Críticas — RNF-14)

> Segunda prioridad exigida por el usuario. Todos estos tests son unitarios, aislados, sin mocks de
> red (las entidades no dependen de HTTP).

### T026 [P] — Tests de `Publicacion`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/domain/Publicacion.test.ts`
**Descripción**: Casos: no puede dar like/reportar publicación propia; no puede dar like sin
autenticar; no puede reportar dos veces; `toggleLike()` invierte estado y ajusta contador.
**Depende de**: T016.

### T027 [P] — Tests de `Usuario` (dominio de usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/domain/Usuario.test.ts`
**Descripción**: Casos: botón "Seguir" ausente en perfil propio; `toggleSeguir()` actualiza
contador de forma optimista en ambos sentidos.
**Depende de**: T017.

### T028 [P] — Tests de `Filtro`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/domain/Filtro.test.ts`
**Descripción**: Casos: distancia deshabilitada sin geolocalización; `activos()` refleja
exactamente los filtros seteados; `quitar()` no muta la instancia original.
**Depende de**: T018.

### T029 [P] — Tests de `Carpeta`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/domain/Carpeta.test.ts`
**Descripción**: Casos: solo el dueño puede eliminar/renombrar; un no-dueño no puede.
**Depende de**: T019.

### T030 [P] — Tests de `Desafio` (participación)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/domain/Desafio.test.ts`
**Descripción**: Caso: participación requiere `autenticado = true`.
**Depende de**: T020.

### T031 [P] — Tests de `UsuarioAdmin`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/domain/UsuarioAdmin.test.ts`
**Descripción**: Casos: no se puede banear/eliminar a un ADMIN ni a uno mismo; promover a un ADMIN
ya existente es no-op (`puedeSerPromovido() === false`); `puedeSerDegradado()` es `true` para un
ADMIN distinto del actual y `false` si es el propio administrador o si el objetivo no es ADMIN
(caso agregado en clarificación 2026-09-17, RF-76).
**Depende de**: T021.

### T031B [P] — Tests de `Reporte.prioridad` como enum
**Archivo**: `Admin/my-proyect/frontend-admin/tests/domain/Reporte.test.ts`
**Descripción**: Extiende T033: verifica que `prioridad` solo acepta valores de `PrioridadReporte`
y que `antiguedadEnDias()`/`puedeResolverseSinEliminar()` no se ven afectados por el cambio de
tipo. Puede fusionarse con T033 en implementación si se prefiere un único archivo de test.
**Depende de**: T023, T025B.

### T032 [P] — Tests de `PublicacionModeracion`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/domain/PublicacionModeracion.test.ts`
**Descripción**: Casos: no se puede eliminar una publicación ya `ELIMINADA`; `estaReportada()`
refleja el estado correctamente.
**Depende de**: T022.

### T033 [P] — Tests de `Reporte`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/domain/Reporte.test.ts`
**Descripción**: Casos: `puedeResolverseSinEliminar()` solo si está pendiente/en revisión;
`antiguedadEnDias()` calcula correctamente la diferencia de fechas.
**Depende de**: T023.

### T034 [P] — Tests de `DesafioPropuesto`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/domain/DesafioPropuesto.test.ts`
**Descripción**: Caso crítico CB-15: una vez `APROBADO` o `RECHAZADO`, `puedeAprobarse()` y
`puedeRechazarse()` devuelven `false` de forma permanente.
**Depende de**: T024.

### T035 [P] — Tests de `ExportacionReporte`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/domain/ExportacionReporte.test.ts`
**Descripción**: Casos: `fueExitosa()` es `false` si hay `errorMensaje` aunque `disponible = true`.
**Depende de**: T025.

**Checkpoint de Fase 3**: Ninguna tarea de Fase 4 en adelante debe comenzar hasta que T026–T035
estén diseñadas (y, en la fase de implementación real, en verde), por ser la prioridad de negocio
más alta del proyecto.

---

## Fase 4 — Infraestructura (Cliente HTTP, Sesión, Proveedores)

### T036 — Cliente HTTP base de `frontend/`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/infrastructure/httpClient.ts`
**Descripción**: Wrapper de `fetch` que adjunta `Authorization: Bearer <token>` automáticamente
(RF-06) y expone métodos genéricos consumidos únicamente desde `services/`. El token se obtiene
mediante inyección tardía (el cliente invoca `tokenStorage.getToken()` en cada request, sin
importar `tokenStorage` en tiempo de construcción), evitando dependencia circular.
**Depende de**: T003, T037 (lectura de token — dependencia explícita agregada en clarificación
2026-09-17, corrige inconsistencia detectada en `/speckit.analyze`).

### T037 [P] — Almacenamiento seguro de token (`frontend/`)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/infrastructure/tokenStorage.ts`
**Descripción**: Guardar/leer/borrar el token de sesión de forma segura.
**Depende de**: T003.

### T038 [P] — Proveedor mail/contraseña
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/infrastructure/authProviders/mailPasswordProvider.ts`
**Descripción**: Llama a `POST /auth/login` según `contracts/api-contracts.md` sección A.
**Depende de**: T036.

### T039 [P] — Proveedor Google
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/infrastructure/authProviders/googleProvider.ts`
**Descripción**: Inicia redirección a `GET /auth/google` y procesa `GET /auth/callback`.
**⚠️ Bloqueada parcialmente por B1** (diferida explícitamente, no resuelta en clarificación
2026-09-17): implementar parseo defensivo que soporte tanto `?token=...` como `?code=...&error=...`
hasta que backend confirme el formato final.
**Depende de**: T036.

### T040 [P] — Proveedor GitHub
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/infrastructure/authProviders/githubProvider.ts`
**Descripción**: Análogo a T039 para `GET /auth/github`.
**⚠️ Bloqueada parcialmente por B1** (mismo criterio de parseo defensivo que T039).
**Depende de**: T036.

### T041 [P] — Cliente de geolocalización
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/infrastructure/geolocationClient.ts`
**Descripción**: Expone si la geolocalización está activa y las coordenadas actuales, consumido por
`Filtro`/servicios de búsqueda (RF-45). DEBE suscribirse a cambios de permiso (Permissions API /
evento de revocación) para notificar a los consumidores si el usuario revoca el permiso durante la
sesión (cobertura de **CB-10**, agregada en clarificación 2026-09-17).
**Depende de**: T003.

### T042 — Cliente HTTP base de `frontend-admin/`
**Archivo**: `Admin/my-proyect/frontend-admin/src/infrastructure/httpClient.ts`
**Descripción**: Análogo a T036 para el proyecto administrativo; el token se obtiene mediante
inyección tardía desde `sessionManager` (sin importarlo en tiempo de construcción, evitando
dependencia circular — corrección de clarificación 2026-09-17).
**Depende de**: T004.

### T043 [P] — Endpoints de administración
**Archivo**: `Admin/my-proyect/frontend-admin/src/infrastructure/apiEndpoints.ts`
**Descripción**: Constantes de rutas descritas en `contracts/api-contracts.md` sección C
(dashboard, usuarios, moderación, desafíos, reportes/analíticas).
**Depende de**: T042.

### T044 [P] — Gestor de sesión admin
**Archivo**: `Admin/my-proyect/frontend-admin/src/infrastructure/sessionManager.ts`
**Descripción**: Maneja token, expiración y cancelación de acciones en curso ante expiración
(RF-75, CB-13).
**Depende de**: T042.

### T045 — Guard de rutas administrativas
**Archivo**: `Admin/my-proyect/frontend-admin/src/infrastructure/sessionGuard.ts`
**Descripción**: Exige sesión válida + rol `ADMIN` (`GET /auth/me`); rechaza con mensaje claro si
el rol no es ADMIN (AC-10.2).
**Depende de**: T044, T010.

---

## Fase 5 — Aplicación / Servicios (Casos de Uso de Cliente)

> Cada servicio orquesta llamadas a infraestructura y aplica las reglas de las entidades de
> dominio (Fase 2); no contiene reglas de negocio propias más allá de la orquestación.

### T046 [P] — `authService` (frontend usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/authService.ts`
**Descripción**: Login, registro, logout, verificación de sesión (`GET /auth/me`), usando T036,
T037, T038. DEBE manejar la respuesta `403 { error: "CUENTA_BANEADA" | "CUENTA_ELIMINADA" }` de
`POST /auth/login` mostrando el mensaje específico correspondiente sin continuar el flujo de login
(RF-77, cobertura de **A10**, agregada en clarificación 2026-09-17).
**Depende de**: T036, T037, T038.

### T047 [P] — `AuthContext`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/AuthContext.tsx`
**Descripción**: Contexto de React que expone usuario actual, rol y estado de sesión a los
componentes de presentación, consumiendo `authService`.
**Depende de**: T046.

### T048 [P] — `publicacionService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/publicacionService.ts`
**Descripción**: Crear publicación, like/unlike (con reversión ante error, usando `Publicacion`),
reportar publicación (RF-21–RF-36). El toggle de like DEBE serializar/debounce llamadas
consecutivas antes de que la anterior responda, evitando estados inconsistentes entre el contador
visible y el estado real (cobertura de **CB-02**, agregada en clarificación 2026-09-17). La
creación de publicación DEBE soportar reintento manual tras error de red sin perder los datos ya
adjuntados (cobertura de **CB-01**).
**Depende de**: T036, T016.

### T049 [P] — `archivoValidacion`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/archivoValidacion.ts`
**Descripción**: Validación de extensión/MIME en cliente antes de subir (AC-02.4); tamaño máximo
queda exclusivamente en backend.
**Depende de**: T005.

### T050 [P] — `tagsService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/tagsService.ts`
**Descripción**: Autocompletado de tags (`GET /tags/autocompletado`), límite de 10 por publicación.
**Depende de**: T036.

### T051 — `usePublicacionForm`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/usePublicacionForm.ts`
**Descripción**: Hook de contenedor del formulario de publicación (HU-02), orquesta T048–T050.
DEBE advertir al usuario antes de cerrar la pestaña o navegar fuera si hay datos sin enviar
(cobertura de **CB-09**, agregada en clarificación 2026-09-17; usar `beforeunload` + guard de
navegación interna).
**Depende de**: T048, T049, T050, T005.

### T052 [P] — `busquedaService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/busquedaService.ts`
**Descripción**: Resuelve búsqueda/filtros siempre contra la API (`GET /publicaciones`), nunca en
memoria (RNF-05).
**Depende de**: T036, T018.

### T053 [P] — `filtroOpcionesService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/filtroOpcionesService.ts`
**Descripción**: Obtiene opciones de filtro (`GET /publicaciones/opciones-filtro`).
**Depende de**: T036.

### T054 [P] — `useInfiniteList`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/useInfiniteList.ts`
**Descripción**: Hook genérico de paginación/scroll infinito reutilizable por feed y Descubrir.
DEBE exponer un estado explícito de "fin de resultados" (`hasMore = false`) para que la presentación
muestre un indicador de fin de lista en vez de un spinner infinito (cobertura de **CB-05**, agregada
en clarificación 2026-09-17).
**Depende de**: T036.

### T055 — `useDescubrirFiltros`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/useDescubrirFiltros.ts`
**Descripción**: Orquesta `Filtro`, `busquedaService`, `filtroOpcionesService`,
`geolocationClient` y `useInfiniteList` para la pantalla Descubrir (HU-03).
**Depende de**: T052, T053, T054, T041.

### T056 [P] — `feedService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/feedService.ts`
**Descripción**: Obtiene el feed de home paginado (`GET /publicaciones/feed`).
**Depende de**: T036, T054.

### T057 [P] — `perfilService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/perfilService.ts`
**Descripción**: `PATCH /perfil`, `GET /usuarios/{id}` (RF-16–RF-20).
**Depende de**: T036, T017.

### T058 — `usePerfilEdicion`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/usePerfilEdicion.ts`
**Descripción**: Hook de edición de perfil con advertencia de cambios sin guardar (AC-06.5) y
previsualización de foto (AC-06.6).
**Depende de**: T057.

### T059 [P] — `reporteService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/reporteService.ts`
**Descripción**: Obtiene motivos de reporte y envía reportes (`GET /motivos-reporte`,
`POST /publicaciones/{id}/reportes`).
**Depende de**: T036, T009.

### T060 [P] — `desafioService` (usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/desafioService.ts`
**Descripción**: Listar desafíos y proponer nuevos (`GET /desafios`,
`POST /desafios/propuestas`).
**⚠️ Bloqueada parcialmente por B2** (diferida explícitamente): implementar `contenidoFormulario`
como `Record<string, unknown>` genérico, sin asumir campos específicos hasta que backend confirme
el contrato.
**Depende de**: T036, T020.

### T061 [P] — `carpetaService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/carpetaService.ts`
**Descripción**: CRUD de carpetas y gestión de posts guardados, valida el límite de 100 carpetas
sobre la colección completa (RF-52) antes de permitir crear una nueva. DEBE exponer el estado de
carga de la lista de carpetas para que la presentación bloquee la acción "guardar en carpeta" hasta
que dicha lista esté disponible (cobertura de **CB-03**, agregada en clarificación 2026-09-17).
**Depende de**: T036, T019.

### T062 [P] — Follow/unfollow (extensión de `perfilService` o servicio dedicado)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/services/perfilService.ts`
**Descripción**: Agregar `seguirUsuario`/`dejarDeSeguir` (`POST/DELETE /usuarios/{id}/seguir`),
usando `Usuario.toggleSeguir()` para el cambio optimista.
**Depende de**: T057, T017.

### T063 [P] — `AuthAdminService`
**Archivo**: `Admin/my-proyect/frontend-admin/src/application/AuthAdminService.ts`
**Descripción**: Login admin + verificación de rol vía `GET /auth/me`, delegando en
`sessionGuard`/`sessionManager` (T044, T045).
**Depende de**: T042, T044, T045.

### T064 [P] — `DashboardService`
**Archivo**: `Admin/my-proyect/frontend-admin/src/application/DashboardService.ts`
**Descripción**: Obtiene los 7 indicadores de `GET /admin/dashboard` (RF-54, RF-55), sin recalcular
nada en cliente.
**Depende de**: T042, T043.

### T065 [P] — `UsuariosService`
**Archivo**: `Admin/my-proyect/frontend-admin/src/application/UsuariosService.ts`
**Descripción**: Búsqueda paginada, banear, eliminar, promover y **degradar** (RF-76), usando
reglas de `UsuarioAdmin` antes de invocar la API (T021). Incluye `degradarUsuario()` →
`POST /admin/usuarios/{id}/degradar` (agregado en clarificación 2026-09-17).
**Depende de**: T042, T043, T021.

### T066 [P] — `ModeracionService`
**Archivo**: `Admin/my-proyect/frontend-admin/src/application/ModeracionService.ts`
**Descripción**: Listado de publicaciones reportadas (una fila por reporte individual, resuelto
**A1**), detalle de reporte, eliminar publicación, resolver reporte sin eliminar, usando
`PublicacionModeracion` y `Reporte` (T022, T023); la moderación NO distingue el rol del autor de la
publicación (RF-80, resuelto **A7**).
**Depende de**: T042, T043, T022, T023.

### T067 [P] — `DesafiosService` (admin)
**Archivo**: `Admin/my-proyect/frontend-admin/src/application/DesafiosService.ts`
**Descripción**: Listado, detalle, aprobar/rechazar desafíos propuestos, usando
`DesafioPropuesto` (T024).
**Depende de**: T042, T043, T024.

### T068 [P] — `ReportesAnaliticaService`
**Archivo**: `Admin/my-proyect/frontend-admin/src/application/ReportesAnaliticaService.ts`
**Descripción**: Obtiene analíticas agregadas y dispara exportación síncrona contra
`POST /admin/reportes-analiticas/exportaciones` (path corregido/unificado en clarificación
2026-09-17), usando `ExportacionReporte` (T025).
**⚠️ Bloqueada parcialmente por B3 y B5** (diferidas explícitamente): tratar la respuesta de
`/admin/analiticas` como `Record<string, unknown>` genérico y `urlDescarga` como URL opaca, sin
asumir estructura ni formato de archivo.
**Depende de**: T042, T043, T025.

---

## Fase 6 — Tests de Aplicación / Servicios

### T069 [P] — Tests `authService` / `AuthContext`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/authService.test.ts`
**Descripción**: Login exitoso/fallido, expiración de sesión, redirección post-login (RF-13,
CB-06); caso crítico: login rechazado con mensaje específico si la cuenta está BANEADO/ELIMINADO
(RF-77, AC-04.9, agregado en clarificación 2026-09-17).
**Depende de**: T046, T047.

### T070 [P] — Tests `publicacionService` (like/reportar con reversión)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/publicacionService.test.ts`
**Descripción**: Caso crítico: ante fallo de API, el like se revierte visualmente (AC-01.3); clics
consecutivos de like/unlike antes de la respuesta no generan estado inconsistente (CB-02, agregado
en clarificación 2026-09-17).
**Depende de**: T048.

### T071 [P] — Tests `usePublicacionForm`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/usePublicacionForm.test.ts`
**Descripción**: Bloqueo de envío sin archivo adjunto, validación de tipo inválido, máx. 10 tags;
advertencia de cambios sin guardar al intentar salir con datos pendientes (CB-09, agregado en
clarificación 2026-09-17).
**Depende de**: T051.

### T072 [P] — Tests `useDescubrirFiltros` / `busquedaService`
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/useDescubrirFiltros.test.ts`
**Descripción**: Verifica que cada cambio de filtro dispara una nueva consulta a la API (nunca
filtrado en memoria), y que el filtro de distancia queda deshabilitado sin geolocalización.
**Depende de**: T055.

### T073 [P] — Tests `carpetaService` (límite de 100)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/carpetaService.test.ts`
**Descripción**: Caso crítico: al alcanzar 100 carpetas, se impide crear una adicional (AC-09.6);
la acción de guardar en carpeta está bloqueada mientras la lista de carpetas está cargando (CB-03,
agregado en clarificación 2026-09-17).
**Depende de**: T061.

### T074 [P] — Tests `perfilService` (seguir/dejar de seguir)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/perfilService.test.ts`
**Descripción**: Actualización optimista de seguidores y reversión ante error (AC-08.3, AC-08.4).
**Depende de**: T062.

### T075 [P] — Tests `AuthAdminService` / `sessionGuard`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/application/AuthAdminService.test.ts`
**Descripción**: Rechazo de rol no-ADMIN (AC-10.2), expiración de sesión cancela acción en curso
(CB-13).
**Depende de**: T063, T045.

### T076 [P] — Tests `UsuariosService` (reglas de rol)
**Archivo**: `Admin/my-proyect/frontend-admin/tests/application/UsuariosService.test.ts`
**Descripción**: Caso crítico: banear/eliminar deshabilitado sobre ADMIN o uno mismo; promover a
ADMIN existente rechazado como no-op (AC-12.5, AC-12.6); degradar a otro ADMIN requiere
confirmación y es rechazado si el objetivo es el propio administrador (AC-12.8, RF-76, agregado en
clarificación 2026-09-17).
**Depende de**: T065.

### T077 [P] — Tests `ModeracionService`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/application/ModeracionService.test.ts`
**Descripción**: Resolver reporte sin eliminar no cambia el estado de la publicación (AC-11.6).
**Depende de**: T066.

### T078 [P] — Tests `DesafiosService` (admin)
**Archivo**: `Admin/my-proyect/frontend-admin/tests/application/DesafiosService.test.ts`
**Descripción**: Caso crítico: aprobar/rechazar deshabilitado permanentemente tras decisión
(AC-14.5).
**Depende de**: T067.

### T079 [P] — Tests `ReportesAnaliticaService`
**Archivo**: `Admin/my-proyect/frontend-admin/tests/application/ReportesAnaliticaService.test.ts`
**Descripción**: Manejo de fallo de exportación con mensaje exacto "Error: Reporte no generado."
(RF-74).
**Depende de**: T068.

---

## Fase 7 — Presentación (Pantallas y Componentes)

> Solo se listan una vez que dominio+servicios están definidos. Cada pantalla consume exclusivamente
> hooks/servicios de la Fase 5, nunca `httpClient` directamente (Principio VI).

### T080 [P] — Componentes de publicación reutilizables
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/components/publicacion/`
(`PublicacionCard.tsx`, `LikeButton.tsx`, `ReportButton.tsx`, `TagChip.tsx`)
**Descripción**: Presentación pura, reciben props y callbacks de los hooks de servicios.
**Depende de**: T048, T059.

### T081 [P] — Componentes de filtros
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/components/filtros/`
(`FiltroPanel.tsx`, `FiltroChip.tsx`)
**Descripción**: Renderizan `Filtro.activos()` como chips removibles.
**Depende de**: T018.

### T082 [P] — Componentes de carpetas
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/components/carpetas/`
(`CarpetaCard.tsx`, `GuardarEnCarpetaModal.tsx`)
**Descripción**: Presentación de carpetas y flujo de guardado.
**Depende de**: T061.

### T083 [P] — Componentes comunes
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/components/comunes/`
(`Skeleton.tsx`, `Spinner.tsx`, `EmptyState.tsx`, `InfiniteScrollList.tsx`)
**Descripción**: Estados de carga/vacío reutilizables en todas las pantallas.
**Depende de**: T001.

### T084 — Pantalla Login
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/login/`
**Descripción**: HU-04, tres opciones de login, bloqueo de submit, redirección post-login; muestra
mensaje específico si la cuenta está BANEADO/ELIMINADO (AC-04.9, agregado en clarificación
2026-09-17). Si la cuenta autenticada tiene rol ADMIN, redirige/rechaza el acceso a `frontend/`
(RF-78, resuelto **A14**).
**Depende de**: T046, T047.

### T085 — Pantalla Registro
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/registro/`
**Descripción**: HU-05, validaciones en tiempo real de contraseña.
**Depende de**: T046.

### T086 [P] — Pantalla Cuestionario (onboarding)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/cuestionario/`
**Descripción**: Flujo posterior a registro exitoso (AC-05.4).
**Depende de**: T085.

### T087 — Pantalla Home (feed)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/home/`
**Descripción**: Usa `feedService`, `useInfiniteList`, `PublicacionCard`.
**Depende de**: T056, T080, T083.

### T088 — Pantalla Descubrir
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/descubrir/`
**Descripción**: HU-03, usa `useDescubrirFiltros`, `FiltroPanel`, `EmptyState`, `Skeleton`.
**Depende de**: T055, T081, T083.

### T089 [P] — Pantalla/modal Detalle de Publicación
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/detalle-publicacion/`
**Descripción**: Vista ampliada con like/reportar/guardar en carpeta.
**Depende de**: T080, T082.

### T090 — Pantalla Desafíos (usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/desafios/`
**Descripción**: Listado y propuesta de desafíos, usa `desafioService`.
**Depende de**: T060.

### T091 — Pantalla Perfil
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/perfil/`
**Descripción**: Muestra datos, botón seguir (condicional), carpetas públicas.
**Depende de**: T057, T062, T082.

### T092 — Pantalla Editar Perfil
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/editar-perfil/`
**Descripción**: HU-06, usa `usePerfilEdicion`, advertencia de cambios sin guardar.
**Depende de**: T058.

### T093 — Pantalla Carpetas (Mis Carpetas)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/pages/carpetas/`
**Descripción**: HU-09, listado propio con paginación, creación/eliminación con advertencia.
**Depende de**: T061, T082.

### T094 — Rutas y guard de rutas protegidas (`frontend/`)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/src/routes/`, `App.tsx`, `main.tsx`
**Descripción**: Define rutas protegidas (requieren sesión) y públicas; integra `AuthContext`. DEBE
rechazar/redirigir a cualquier cuenta con rol ADMIN que intente operar en `frontend/` (RF-78,
resuelto **A14**, agregado en clarificación 2026-09-17), reforzando lo ya aplicado en T084.
**Depende de**: T084–T093.

### T095 [P] — Pantalla Login Admin
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/login/`
**Descripción**: HU-10, rechazo de rol no-ADMIN con mensaje claro; muestra mensaje específico si la
cuenta está BANEADO/ELIMINADO (RF-77, AC-04.9 aplicado también al login admin, agregado en
clarificación 2026-09-17).
**Depende de**: T063.

### T096 — Pantalla Dashboard
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/dashboard/`
**Descripción**: HU-13, 7 indicadores de `DashboardService`.
**Depende de**: T064.

### T096B [P] — Componente común `ConfirmacionAccionSensibleModal`
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/shared/ConfirmacionAccionSensibleModal.tsx`
**Descripción**: Modal de confirmación explícita reutilizable por toda acción sensible del módulo
administrativo (banear, eliminar, promover, degradar, eliminar publicación, resolver reporte,
aprobar/rechazar desafío), cumpliendo RNF-07 y RF-60/RNF-08 (diferenciación visual) de forma
centralizada en un único componente en vez de duplicarlo por pantalla. Agregado en clarificación
2026-09-17 (hallazgo de `/speckit.analyze`, punto 6).
**Depende de**: T002.

### T097A — Pantalla Gestión de Usuarios: listado y búsqueda
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/usuarios/UsuariosListado.tsx`
**Descripción**: HU-12, búsqueda paginada de usuarios resuelta contra la API (RF-56). Sin acciones
sensibles en este componente (solo lectura). Dividido de la tarea original T097 en clarificación
2026-09-17 (hallazgo de `/speckit.analyze`, punto 6).
**Depende de**: T065.

### T097B — Pantalla Gestión de Usuarios: acciones sensibles
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/usuarios/UsuarioAccionesSensibles.tsx`
**Descripción**: Botones banear/eliminar/promover/degradar (RF-57–RF-59, RF-76), cada uno
disparando `ConfirmacionAccionSensibleModal` (T096B) antes de ejecutar; deshabilitados según reglas
de `UsuarioAdmin` (rol ADMIN o uno mismo). Diferenciación visual (AC-12.7).
**Depende de**: T065, T096B, T097A.

### T098A — Pantalla Moderación: listado y detalle
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/moderacion/ModeracionListado.tsx`,
`ModeracionDetalleReporte.tsx`
**Descripción**: HU-11, listado paginado con una fila por reporte individual (RF-61) y componente
de detalle de reporte (motivo, publicación, reportante, prioridad/antigüedad — RF-65). Sin acciones
sensibles en este componente. Dividido de la tarea original T098 en clarificación 2026-09-17.
**Depende de**: T066.

### T098B — Pantalla Moderación: acciones sensibles
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/moderacion/ModeracionAcciones.tsx`
**Descripción**: Botones "eliminar publicación" y "resolver sin eliminar" (RF-63, RF-64), cada uno
disparando `ConfirmacionAccionSensibleModal` (T096B) antes de ejecutar.
**Depende de**: T066, T096B, T098A.

### T099 — Pantalla Gestión de Desafíos (admin)
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/desafios/`
**Descripción**: HU-14, listado pendientes, aprobar/rechazar deshabilitado tras decisión
(AC-14.5), usando `ConfirmacionAccionSensibleModal` (T096B) antes de ejecutar cada acción.
**Depende de**: T067, T096B.

### T100 — Pantalla Reportes y Analíticas
**Archivo**: `Admin/my-proyect/frontend-admin/src/presentation/reportes/`
**Descripción**: HU-15, visualización de analíticas y botón de exportación síncrona con manejo de
error, tratando la estructura de analíticas y `urlDescarga` como genéricas (ver bloqueos B3/B5 en
T068).
**Depende de**: T068.

### T101 — Rutas y guard de rutas administrativas
**Archivo**: `Admin/my-proyect/frontend-admin/src/AppRouter.tsx`, `RequireAdmin.tsx`
**Descripción**: Integra `sessionGuard` (T045) en todas las rutas del módulo admin.
**Depende de**: T095, T096, T096B, T097A, T097B, T098A, T098B, T099, T100, T045.

---

## Fase 8 — Tests de Integración/Presentación y Cierre

### T102 [P] — Tests de integración de flujo de publicación (frontend usuario)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/presentation/` (o carpeta de
integración equivalente si se crea)
**Descripción**: Flujo completo mockeado: crear publicación → aparece en perfil sin recargar
(AC-02.7).
**Depende de**: T087, T091.

### T103 [P] — Tests de integración de moderación (frontend admin)
**Archivo**: `Admin/my-proyect/frontend-admin/tests/integration/`
**Descripción**: Flujo: login ADMIN → dashboard → listado reportadas → eliminar con confirmación
→ estado ELIMINADA reflejado en UI.
**Depende de**: T096, T098A, T098B.

### T104 [P] — Tests de integración de gestión de usuarios (frontend admin)
**Archivo**: `Admin/my-proyect/frontend-admin/tests/integration/`
**Descripción**: Flujo: buscar usuario → intentar banear a un ADMIN (bloqueado) → banear a un USER
(con confirmación) → reflejo de `estadoCuenta`; incluye caso de degradar a otro ADMIN (RF-76,
agregado en clarificación 2026-09-17).
**Depende de**: T097A, T097B.

### T105 [P] — Actualización de `quickstart.md` con smoke test ejecutado
**Archivo**: `Union/specs/001-plataforma-unificada/quickstart.md`
**Descripción**: Marcar el checklist de la sección 7 una vez validados manualmente los flujos de la
sección 5 (solo tras implementación real, no en esta fase).
**Depende de**: T094, T101.

### T106 — Revisión cruzada de trazabilidad HU ↔ Tareas
**Archivo**: `Union/specs/001-plataforma-unificada/tasks.md` (este documento)
**Descripción**: Verificar que las 15 historias de usuario (HU-01 a HU-15) tienen al menos una
tarea de dominio, una de servicio y una de presentación asociada, antes de autorizar
`/speckit.implement`.
**Depende de**: T001–T105.

---

## Fase 9 — Casos Borde Dedicados (derivados de `/speckit.analyze`, clarificación 2026-09-17)

> Tareas de test de integración explícitas para los casos borde que el reporte de `/speckit.analyze`
> señaló como no cubiertos. Las correcciones funcionales correspondientes ya se aplicaron dentro de
> T041, T048, T051, T054, T061 (ver notas agregadas en cada una); estas tareas verifican el
> comportamiento de punta a punta.

### T107 [P] — Test de integración: reintento tras pérdida de conexión (CB-01)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/publicacionService.test.ts`
**Descripción**: Simula error de red durante la subida de una publicación; verifica que el
formulario conserva los datos y permite reintentar sin perderlos.
**Depende de**: T048.

### T108 [P] — Test de integración: like/unlike en rápida sucesión (CB-02)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/publicacionService.test.ts`
**Descripción**: Dispara like y unlike antes de que la primera llamada responda; verifica que el
contador final es consistente con el último estado solicitado (complementa T070).
**Depende de**: T048.

### T109 [P] — Test de integración: guardar en carpeta mientras carga la lista (CB-03)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/components/GuardarEnCarpetaModal.test.tsx`
**Descripción**: Verifica que la acción "guardar en carpeta" está deshabilitada y muestra estado de
carga mientras `carpetaService` aún no resolvió la lista de carpetas del usuario.
**Depende de**: T061, T082.

### T110 [P] — Test de integración: fin de scroll infinito (CB-05)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/components/InfiniteScrollList.test.tsx`
**Descripción**: Verifica que al llegar al final de los resultados se muestra un indicador de "fin
de resultados" y no un spinner infinito.
**Depende de**: T054, T083.

### T111 [P] — Test de integración: revocación de geolocalización en sesión (CB-10)
**Archivo**: `Usuario/my-project/backend_usuario/frontend/tests/services/useDescubrirFiltros.test.ts`
**Descripción**: Simula revocación del permiso de geolocalización durante la sesión; verifica que
el filtro de distancia se deshabilita automáticamente y se notifica al usuario (complementa T072).
**Depende de**: T041, T055.

### T112 — Revisión de cobertura RNF-07/RNF-14 sobre acciones destructivas
**Archivo**: `Admin/my-proyect/frontend-admin/tests/presentation/ConfirmacionAccionSensibleModal.test.tsx`
**Descripción**: Test dedicado al componente común (T096B): verifica que el 100% de las acciones
sensibles (banear, eliminar, promover, degradar, eliminar publicación, aprobar/rechazar desafío)
pasan por este modal antes de ejecutarse, y que cancelar el modal no ejecuta la acción.
**Depende de**: T096B, T097B, T098B, T099.

---

## Resumen de Dependencias por Fase

```
Fase 0 (Setup)
   └─> Fase 1 (Enums)
          └─> Fase 2 (Entidades de dominio)
                 └─> Fase 3 (Tests de dominio) ── CHECKPOINT: prioridad máxima
                        └─> Fase 4 (Infraestructura)
                               └─> Fase 5 (Servicios/Aplicación)
                                      └─> Fase 6 (Tests de servicios)
                                             └─> Fase 7 (Presentación)
                                                    └─> Fase 8 (Integración y cierre)
                                                           └─> Fase 9 (Casos borde dedicados)
```

`frontend/` y `frontend-admin/` avanzan en **paralelo** entre sí en cada fase (son proyectos
independientes, Principio IV); las dependencias arriba son internas a cada proyecto.

**Nota de cierre (clarificación 2026-09-17)**: Esta versión de `tasks.md` incorpora las
correcciones solicitadas tras `/speckit.analyze`: enum `PrioridadReporte` (T025B), método
`puedeSerDegradado()` (T021) y su endpoint (`UsuariosService`, T065), bloqueo de login para cuentas
BANEADO/ELIMINADO (T046, T084, T095), restricción de ADMIN fuera de `frontend/` (T084, T094),
división de T097/T098 en subtareas, componente común de confirmación (T096B), cobertura de CB-01,
CB-02, CB-03, CB-05, CB-09, CB-10 (T107–T111), corrección de dependencias circulares de
`httpClient` (T036, T042), y marcado explícito de tareas parcialmente bloqueadas por ambigüedades
de API diferidas (B1, B2, B3, B5) en T039, T040, T060, T068.

## Sugerencia de Agrupación para Ejecución Paralela

- **Grupo A (paralelo)**: T005–T015, T025B (todos los enums, 12 tareas `[P]`).
- **Grupo B (paralelo, tras Grupo A)**: T016–T025 (todas las entidades de dominio, 10 tareas `[P]`).
- **Grupo C (paralelo, tras Grupo B)**: T026–T035, T031B (todos los tests de dominio, 11 tareas
  `[P]`) — **bloque de mayor prioridad de negocio**.
- **Grupo D (paralelo parcial)**: T037–T041 y T043–T044 (infraestructura secundaria, tras T036/T042;
  T036 y T042 ahora dependen explícitamente de T037/gestión de token respectivamente).
- **Grupo E (paralelo parcial)**: servicios `[P]` de la Fase 5 que no dependen entre sí (T046, T048,
  T049, T050, T052, T053, T057, T059, T060, T061, T063–T068).
- **Grupo F (paralelo)**: T069–T079 (tests de servicios, tras cada servicio correspondiente).
- **Grupo G (paralelo)**: T080–T083, T095, T096B (componentes/pantallas sin dependencias cruzadas).
- **Grupo H (paralelo, Fase 9)**: T107–T111 (tests de casos borde, tras sus respectivas tareas de
  servicio/componente ya completadas).
