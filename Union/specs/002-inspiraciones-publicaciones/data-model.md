# Modelo de datos del frontend — 002 Inspiraciones

Descripción de tipos y reglas. Es documentación de diseño; no es código a ejecutar. Los nombres usan la convención de la constitution.

## 1. Enums y uniones de literales

| Tipo | Valores | Fuente |
|---|---|---|
| `RolUsuario` | `USER`, `ADMIN` | Constitution 7, spec A-15 |
| `EstadoPublicacion` | `ACTIVA`, `REPORTADA`, `ELIMINADA` | Constitution 7 |
| `TipoContenido` | `IMAGEN`, `VIDEO`, `AUDIO` | Spec A-11 (`TUTORIAL` pendiente) |
| `FormatoArchivo` | `png`, `jpeg`, `mp4`, `avi`, `mp3` | Spec A-11 |
| `MotivoReporte` | `SPAM`, `CONTENIDO_INAPROPIADO`, `PLAGIO`, `OTRO` (provisional, A-13) | Spec RF-21 |
| `VisibilidadCarpeta` | `PRIVADA`, `PUBLICA` | Spec RF-20 |

Nota: la petición original usa `usuario | administrador`; se unifica con `USER | ADMIN`, que es lo que devuelve la API (spec A-15).

## 2. Entidades

**UsuarioActual**: `id`, `nombre`, `rol: RolUsuario`.

**Publicacion**: `id`, `titulo`, `descripcion`, `contenido` (url), `formato`, `tipoContenido`, `etiquetas[]` / `categoria`, `autor {id, nombre}`, `fechaCreacion`, `fechaUltimaEdicion`, `cantidadLikes`, `estado`, `likeadaPorMi`, `guardadaPorMi`, `reportadaPorMi`.
- Las banderas `...PorMi` las calcula la API para el usuario actual.
- Regla de dominio: `esDe(usuario)` compara `autor.id` con `usuario.id`.

**Carpeta**: `id`, `nombre`, `cantidadPublicaciones`, `visibilidad`.

**ItemCarpeta**: `publicacion` o marcador `{id, disponible: false}` cuando está eliminada (CB-02).

**Reporte**: `id`, `publicacion`, `motivo`, `textoLibre?`, `fecha`, `reportante {id, nombre}`, `resuelto`.

**PublicacionReportada** (moderación): `publicacion`, `cantidadReportes`, `motivos[]`, `reportes[]`.

**Paginacion<T>**: `items[]`, `siguienteCursor?`.

**ErrorApi**: `codigo` (401, 403, 404, 409, 413, 422, red), `mensaje`, `detalles?`.

## 3. Estados de UI

Estado de recurso: `cargando` | `error` | `vacio` | `exito`.
Estados globales: `no autenticado (401)`, `sin permiso (403)`, `no encontrado (404)`, `error de red`.
Estado de mutación: `inactiva` | `pendiente` | `exito` | `error`, con mensaje en español.

## 4. Funciones puras de permisos (`domain/permisos`)

Todas reciben `(usuario, publicacion)` y devuelven `boolean`. Son una ayuda de UX; la autoridad es el backend.

| Función | Regla | Spec |
|---|---|---|
| `puedeEditar` | Solo el autor. El admin no edita ajenas. | RF-04, RF-06, RF-08 |
| `puedeBorrar` | Autor, o `ADMIN` sobre cualquiera | RF-05, RF-06, RF-07 |
| `puedeDarLike` | Autenticado, no es el autor y la publicación no está eliminada | RF-11, RF-14 |
| `puedeGuardar` | No es el autor, no está eliminada | RF-17, A-9 |
| `puedeReportar` | No es el autor, no está ya reportada por mí | RF-21 a RF-23 |
| `puedeModerar` | `rol === ADMIN` | RF-24, RF-10b |

Todas devuelven `false` para publicaciones en estado `ELIMINADA`, salvo `puedeBorrar` (que tampoco aplica, ya que no hay nada que borrar).

## 5. Validaciones de interfaz (`domain/validaciones`)

| Validación | Regla | Spec |
|---|---|---|
| Publicación | Título y descripción no vacíos; contenido presente; formato en la lista; al menos una etiqueta o categoría | RF-02, HU-01 |
| Tamaño de archivo | ≤ tope informado por la API (provisional) | A-11 |
| Reporte | Motivo obligatorio; texto ≤ 500; `OTRO` exige texto | RF-21 |
| Carpeta | Nombre 1–50 caracteres | A-7 |

## 6. Matriz regla → test

| Regla | Test |
|---|---|
| Solo el autor edita | Unitario `puedeEditar`; página Editar |
| Admin no edita ajenas | Unitario; `TarjetaPublicacion` sin "Editar" |
| Admin borra cualquiera con confirmación | Unitario; página admin |
| Sin like propio | Unitario; `BotonLike` no se muestra |
| Like alternancia y contador | Hook `useLike` (optimista y reversión) |
| Doble clic en like | Componente `BotonLike` |
| Sin reporte propio ni duplicado | Unitario; `ModalReportar` |
| Borrado con confirmación | `ConfirmDialog` |
| Carpeta vacía, publicación no disponible | Página Carpeta |
| 401/403/404/red | Servicio `httpClient` con MSW |
| Rol no admin en app admin | `RequireAdmin` |

## 7. Referencias de trazabilidad

Publicacion → RF-02; Carpeta → RF-16 a RF-20; Reporte → RF-21 a RF-24; Like → RF-11 a RF-15; permisos → RF-06 a RF-10b.
