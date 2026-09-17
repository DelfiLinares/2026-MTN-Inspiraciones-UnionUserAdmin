# API Contracts: Plataforma Unificada — Frontend Usuario + Frontend Admin

**Input**: `spec.md`, `plan.md`, `data-model.md` (Union/specs/001-plataforma-unificada)

Este documento define los contratos REST que **ambos frontends** esperan consumir de la API del
backend (fuera de alcance de este plan). Cada endpoint incluye método, headers relevantes, payload,
query params, y respuestas 2xx/4xx/5xx esperadas. Al final se listan las **ambigüedades a resolver
con el equipo de backend**, trazadas a la sección 8 (`Ambigüedades`) de `spec.md`.

> Convención general: todo endpoint autenticado requiere header `Authorization: Bearer <token>`.
> Todo listado soporta `page`/`pageSize` (o `cursor`, a confirmar — ver Ambigüedad B4) y devuelve
> metadatos de paginación.

---

## A. Autenticación y Sesión (compartido por ambos frontends)

### `POST /auth/login`
- **Body**: `{ mail: string, password: string }`
- **200 OK**: `{ token: string, usuario: { id, nombre, apellido, rol } }`
- **400 Bad Request**: `{ error: "CAMPOS_INVALIDOS" }`
- **401 Unauthorized**: `{ error: "CREDENCIALES_INVALIDAS" }` (mensaje genérico — RF-03)
- **403 Forbidden**: `{ error: "CUENTA_BANEADA" }` / `{ error: "CUENTA_ELIMINADA" }` — la cuenta
  tiene `estadoCuenta = BANEADO` o `ELIMINADO`; el frontend muestra el mensaje específico
  correspondiente (RF-77, resuelto **A10** en sesión de clarificación 2026-09-17). Aplica tanto al
  login de usuario como al login de administrador.

### `GET /auth/google` / `GET /auth/github`
- Redirección iniciada por el frontend (RF-01); el backend gestiona el intercambio OAuth y
  redirige de vuelta a una URL de callback del frontend con el resultado (token o error).

### `GET /auth/callback` (procesado en `infrastructure/authProviders/*`)
- **Query params**: `code` / `token` / `error` (formato exacto a definir con backend — ver
  Ambigüedad B1).
- **200 OK**: equivalente a login exitoso.

### `POST /auth/register`
- **Body**: `{ nombre, apellido, mail, password, passwordConfirmacion }`
- **201 Created**: `{ token: string, usuario: {...} }` (inicia cuestionario — RF-09)
- **409 Conflict**: `{ error: "MAIL_YA_REGISTRADO" }` (RF-08)
- **400 Bad Request**: `{ error: "PASSWORD_INVALIDO", detalles: [...] }` (RF-07)

### `GET /auth/me`
- **200 OK**: `{ id, nombre, apellido, rol, estadoCuenta }` — usado para verificar sesión activa y
  rol (RF-05, RF-12).
- **401 Unauthorized**: sesión inválida/expirada (CB-06, RF-75).
- **403 Forbidden**: `{ error: "ROL_NO_AUTORIZADO" }` — el usuario autenticado no tiene rol ADMIN e
  intenta acceder al módulo administrativo (resuelto **B6** en sesión de clarificación 2026-09-17,
  usado por `sessionGuard`).

### `POST /auth/logout`
- **200 OK**: invalida el token del lado backend (si aplica).

---

## B. Frontend de Usuario

### Publicaciones e Interacciones

**`GET /publicaciones/feed`** — Home (HU no numerada explícitamente pero transversal a "home")
- Query: `page`, `pageSize`
- 200: `{ items: Publicacion[], nextPage: number | null }`

**`GET /publicaciones`** — Descubrir (HU-03, RF-40)
- Query: `q?`, `estilo?`, `tecnica?`, `tipoContenido?`, `distanciaKm?`, `lat?`, `lon?`, `page`,
  `pageSize`
- 200: `{ items: Publicacion[], nextPage: number | null }`
- 200 (sin resultados): `{ items: [], nextPage: null }` (RF-44)

**`GET /publicaciones/opciones-filtro`**
- 200: `{ estilos: string[], tecnicas: string[], tiposContenido: TipoContenido[] }`

**`POST /publicaciones`** (multipart/form-data) — RF-21–RF-28
- Body: `archivo`, `tipoContenido`, `tags: string[]` (máx. 10)
- 201 Created: `Publicacion`
- 400 Bad Request: `{ error: "ARCHIVO_REQUERIDO" }` / `{ error: "TIPO_ARCHIVO_INVALIDO" }`
- 413 Payload Too Large: `{ error: "ARCHIVO_DEMASIADO_GRANDE" }` (validado solo en backend — RF-24)
- 422 Unprocessable Entity: `{ error: "MAX_TAGS_EXCEDIDO" }`

**`GET /tags/autocompletado?q=...`**
- 200: `{ items: string[] }` (vocabulario controlado — RF-22)

**`POST /publicaciones/{id}/like`** / **`DELETE /publicaciones/{id}/like`** — RF-30–RF-32
- 200 OK: `{ cantidadLikes: number, likeDelUsuarioActual: boolean }`
- 403 Forbidden: `{ error: "NO_PUEDE_LIKEAR_PROPIA" }`
- 401 Unauthorized: requiere login (RF-13)

**`GET /motivos-reporte`**
- 200: `{ items: MotivoReporte[] }`

**`POST /publicaciones/{id}/reportes`** — RF-33–RF-36
- Body: `{ motivoCodigo: string }`
- 201 Created: `{ id: string, estado: "PENDIENTE" }`
- 403 Forbidden: `{ error: "NO_PUEDE_REPORTAR_PROPIA" }`
- 409 Conflict: `{ error: "YA_REPORTADO_POR_USUARIO" }` (RF-35)

**`GET /publicaciones/{id}/reportes/mio`**
- 200: `{ reportado: boolean }` — estado de reporte propio (RF-35, distinto del estado global)

### Perfil y Seguidores

**`PATCH /perfil`** — RF-16–RF-20
- Body (multipart si incluye foto): `{ nombre?, apellido?, bio?, foto? }`
- 200 OK: `Usuario`
- 400 Bad Request: `{ error: "CAMPOS_REQUERIDOS_FALTANTES" }`
- 413 Payload Too Large: `{ error: "ARCHIVO_DEMASIADO_GRANDE" }` (CB-08)

**`GET /usuarios/{id}`**
- 200 OK: `Usuario` (incluye `siguiendoAlUsuarioActual`, `cantidadSeguidores`)

**`POST /usuarios/{id}/seguir`** / **`DELETE /usuarios/{id}/seguir`** — RF-37–RF-39
- 200 OK: `{ cantidadSeguidores: number, siguiendo: boolean }`
- 403 Forbidden: `{ error: "NO_PUEDE_SEGUIRSE_A_SI_MISMO" }`
- 409 Conflict: `{ error: "LIMITE_SEGUIDOS_ALCANZADO" }` (CB-07, mensaje específico de la API)

### Carpetas

**`GET /usuarios/{id}/carpetas`**
- 200 OK: `{ items: Carpeta[] }` (visibles públicamente — RF-53)

**`POST /carpetas`** — RF-48
- Body: `{ nombre: string }`
- 201 Created: `Carpeta`
- 422 Unprocessable Entity: `{ error: "LIMITE_CARPETAS_ALCANZADO" }` (RF-52, máx. 100)

**`PATCH /carpetas/{id}`** / **`DELETE /carpetas/{id}`**
- 200 OK / 204 No Content

**`POST /carpetas/{id}/posts`** / **`DELETE /carpetas/{id}/posts/{publicacionId}`** — RF-49, RF-51
- 200 OK / 204 No Content

### Desafíos (usuario)

**`GET /desafios`**
- 200 OK: `{ items: Desafio[] }`

**`POST /desafios/propuestas`**
- Body: formulario de propuesta (campos exactos no cerrados en `spec.md` — ver Ambigüedad B2)
- 201 Created: `{ id: string, estado: "PENDIENTE" }`

---

## C. Frontend de Administración

### Autenticación Admin

Reutiliza `POST /auth/login` + `GET /auth/me` (RF-11, RF-12); el frontend admin rechaza el acceso
si `rol !== "ADMIN"` tras `GET /auth/me`, mostrando mensaje claro (AC-10.2).

### Dashboard

**`GET /admin/dashboard`** — RF-54, RF-55
- 200 OK:
```json
{
  "reportesPendientes": 0,
  "usuariosActivos": 0,
  "desafiosPendientes": 0,
  "publicacionesActivas": 0,
  "publicacionesEliminadas": 0,
  "usuariosBaneados": 0,
  "desafiosAprobadosRechazados": 0
}
```

### Gestión de Usuarios

**`GET /admin/usuarios`** — RF-56
- Query: `q?`, `page`, `pageSize`
- 200 OK: `{ items: UsuarioAdmin[], total: number }`

**`POST /admin/usuarios/{id}/banear`** — RF-57
- 200 OK: `UsuarioAdmin` actualizado
- 403 Forbidden: `{ error: "OBJETIVO_ES_ADMIN_O_UNO_MISMO" }` (CB-11)

**`DELETE /admin/usuarios/{id}`** — RF-58
- 204 No Content
- 403 Forbidden: `{ error: "OBJETIVO_ES_ADMIN_O_UNO_MISMO" }` (CB-11)

**`POST /admin/usuarios/{id}/promover`** — RF-59
- 200 OK: `UsuarioAdmin` actualizado (`rol: "ADMIN"`)
- 409 Conflict: `{ error: "USUARIO_YA_ES_ADMIN" }` (CB-12, no-op)
- 403 Forbidden: solo ejecutable por rol ADMIN (validado también por `sessionGuard` en frontend)

**`POST /admin/usuarios/{id}/degradar`** — RF-76 (agregado en sesión de clarificación 2026-09-17,
resuelve **A8**)
- 200 OK: `UsuarioAdmin` actualizado (`rol: "USER"`)
- 403 Forbidden: `{ error: "NO_PUEDE_DEGRADARSE_A_SI_MISMO" }` — un ADMIN no puede degradarse a sí
  mismo.
- 409 Conflict: `{ error: "USUARIO_NO_ES_ADMIN" }` — el usuario objetivo ya tiene rol USER (no-op).

### Moderación de Publicaciones y Reportes

**`GET /admin/publicaciones/reportadas`** — RF-61
- Query: `motivo?`, `estado?`, `page`, `pageSize`
- 200 OK: `{ items: PublicacionModeracion[], total: number }` — **una fila por cada reporte
  individual**, no agrupada por publicación (resuelto **A1** en sesión de clarificación
  2026-09-17); si una publicación tiene N reportes, aparece N veces en `items` (o el backend expone
  un array `reportes` embebido por fila — a confirmar con backend, no bloquea el frontend porque el
  criterio de agrupación ya está fijado).

**`GET /admin/reportes/{id}`** — RF-62
- 200 OK: `Reporte` (con `publicacion`, `reportante`, `motivo`, `fecha`, `prioridad`)

**`DELETE /admin/publicaciones/{id}`** — RF-63
- 200 OK: `{ estado: "ELIMINADA" }`

**`POST /admin/reportes/{id}/resolver-sin-eliminar`** — RF-64
- 200 OK: `{ estado: "RESUELTO" }` (estado del reporte, no de la publicación)

### Gestión de Desafíos Propuestos

**`GET /admin/desafios-propuestos`** — RF-66
- Query: `estado? = PENDIENTE`, `page`, `pageSize`
- 200 OK: `{ items: DesafioPropuesto[], total: number }`

**`GET /admin/desafios-propuestos/{id}`** — RF-67
- 200 OK: `DesafioPropuesto` con `contenidoFormulario` completo

**`POST /admin/desafios-propuestos/{id}/aprobar`** / **`.../rechazar`** — RF-68, RF-69
- 200 OK: `DesafioPropuesto` actualizado
- 409 Conflict: `{ error: "DESAFIO_YA_RESUELTO" }` (CB-15, decisión final)

### Reportes y Analíticas Exportables

**`GET /admin/analiticas`** — RF-71
- 200 OK: datos agregados ya calculados por backend (estructura exacta no cerrada — ver
  Ambigüedad B3)

**`POST /admin/reportes-analiticas/exportaciones`** — RF-72, RF-73 (llamada **síncrona**)
- Body: `{ tipoReporte: string, filtros?: {...} }`
- 200 OK: `{ disponible: true, urlDescarga: string }`
- 500/502 (fallo de generación): `{ disponible: false, errorMensaje: "Error: Reporte no generado." }`
  (RF-74)

---

## D. Ambigüedades / Puntos a Resolver con Backend

> Actualizado en sesión de clarificación 2026-09-17. Las filas marcadas **RESUELTO** ya tienen
> decisión tomada y no bloquean la implementación. Las marcadas **DIFERIDO EXPLÍCITAMENTE** quedan
> intencionalmente abiertas por decisión del equipo (no por omisión): el frontend debe
> implementarse de forma que tolere el cambio posterior sin asumir un formato específico.

| ID | Descripción | Estado | Endpoints afectados |
|---|---|---|---|
| **B1** | Formato exacto del callback OAuth (`code` vs `token` vs error en query params) para Google/GitHub. | **DIFERIDO EXPLÍCITAMENTE**: no se resuelve en esta sesión; `googleProvider`/`githubProvider` deben implementarse parseando la URL de forma defensiva (leer ambos formatos posibles) hasta que backend confirme. | `GET /auth/callback` |
| **B2** | Campos exactos del formulario de propuesta de desafío (`contenidoFormulario`). | **DIFERIDO EXPLÍCITAMENTE**: se mantiene `Record<string, unknown>` genérico; no se fija un mínimo de campos en esta sesión. | `POST /desafios/propuestas`, `GET /admin/desafios-propuestos/{id}` |
| **B3** | Estructura exacta de los datos agregados de `/admin/analiticas`. | **DIFERIDO EXPLÍCITAMENTE**: el frontend consume la respuesta como un objeto agregado genérico (`Record<string, unknown>`) sin asumir series/agrupaciones específicas, conforme a "no recalcular en cliente" de `plan.md`. | `GET /admin/analiticas` |
| **B4** | Estrategia de paginación (`page`/`pageSize` vs. `cursor`). | **RESUELTO** (2026-09-17): se confirma `page`/`pageSize` para todos los listados paginados del sistema. | Todos los listados paginados |
| **B5** | Formato/extensión del archivo devuelto por la exportación (`urlDescarga`). | **DIFERIDO EXPLÍCITAMENTE**: el frontend trata `urlDescarga` como una URL opaca de descarga, sin asumir extensión ni metadatos adicionales (ver **A11** en `spec.md`). Path del endpoint corregido y unificado a `POST /admin/reportes-analiticas/exportaciones` (antes había una inconsistencia entre la sección C y esta tabla). | `POST /admin/reportes-analiticas/exportaciones` |
| **B6** | Estructura de la respuesta de error al intentar acceder al módulo admin sin rol ADMIN. | **RESUELTO** (2026-09-17): `403 Forbidden` con `{ error: "ROL_NO_AUTORIZADO" }` en `GET /auth/me` (ver sección A). | `GET /auth/me` (uso en `sessionGuard`) |
| **B7** *(nuevo)* | Formato de error de login para cuentas BANEADO/ELIMINADO. | **RESUELTO** (2026-09-17): `403 Forbidden` con `{ error: "CUENTA_BANEADA" }` / `{ error: "CUENTA_ELIMINADA" }` en `POST /auth/login` (RF-77, resuelve **A10**). | `POST /auth/login` |
| **B8** *(nuevo)* | Endpoint de degradar ADMIN a USER. | **RESUELTO** (2026-09-17): `POST /admin/usuarios/{id}/degradar` (RF-76, resuelve **A8**). | `POST /admin/usuarios/{id}/degradar` |

Estas ambigüedades son consistentes con las ya registradas en `spec.md` (A2, A5, A11) y se agregan
aquí desde la perspectiva de contrato de API para que el equipo de backend las revise antes de la
implementación real.
