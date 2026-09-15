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

### Moderación de Publicaciones y Reportes

**`GET /admin/publicaciones/reportadas`** — RF-61
- Query: `motivo?`, `estado?`, `page`, `pageSize`
- 200 OK: `{ items: PublicacionModeracion[], total: number }`

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

| ID | Descripción | Endpoints afectados |
|---|---|---|
| **B1** | Formato exacto del callback OAuth (`code` vs `token` vs error en query params) para Google/GitHub. | `GET /auth/callback` |
| **B2** | Campos exactos del formulario de propuesta de desafío (`contenidoFormulario`); `spec.md` no los detalla. | `POST /desafios/propuestas`, `GET /admin/desafios-propuestos/{id}` |
| **B3** | Estructura exacta de los datos agregados de `/admin/analiticas` (qué series, agrupaciones o rankings expone). | `GET /admin/analiticas` |
| **B4** | Estrategia de paginación (`page`/`pageSize` vs. `cursor`) no está cerrada en ningún specify original; se asume `page`/`pageSize` por convención hasta definición conjunta con backend. | Todos los listados paginados |
| **B5** | Formato/extensión del archivo devuelto por `POST /reportes-analiticas/exportaciones` (`urlDescarga`): no definido en `spec.md` (ver **A11**). | `POST /admin/reportes-analiticas/exportaciones` |
| **B6** | Estructura exacta de la respuesta de error al intentar acceder al módulo admin sin rol ADMIN (mensaje, código). | `GET /auth/me` (uso en `sessionGuard`) |

Estas ambigüedades son consistentes con las ya registradas en `spec.md` (A2, A5, A11) y se agregan
aquí desde la perspectiva de contrato de API para que el equipo de backend las revise antes de la
implementación real.
