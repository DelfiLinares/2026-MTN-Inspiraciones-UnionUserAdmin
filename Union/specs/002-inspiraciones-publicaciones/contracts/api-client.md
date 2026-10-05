# Contrato de API consumido por el frontend — 002 Inspiraciones

Propuesta que el frontend espera consumir. Debe validarla quien implemente el backend Java. Base: `/api/v1`. Formato JSON salvo la subida de archivos (`multipart/form-data`). Sin código.

## Convenciones

- Autenticación: la sesión viaja en cookie o token (S-1). Sin sesión: `401`.
- Paginación: `?cursor=...&limite=20` → `{ items, siguienteCursor }`.
- Error: `{ codigo, mensaje, detalles? }`.
- Códigos: `400/422` validación, `401` no autenticado, `403` sin permiso, `404` no existe o eliminada, `409` conflicto (duplicado), `413` archivo muy grande, `415` formato no admitido, `5xx` servidor.
- Los permisos se validan siempre en el backend.

## Sesión

| Método | Ruta | Respuesta | Errores | Spec |
|---|---|---|---|---|
| GET | `/sesion` | `{ id, nombre, rol: USER\|ADMIN }` | 401 | RF-10, RF-10b |
| GET | `/configuracion` | `{ formatosPermitidos, tamanoMaxBytes }` | — | A-11 |

## Publicaciones

| Método | Ruta | Parámetros / cuerpo | Respuesta | Errores | Spec |
|---|---|---|---|---|---|
| GET | `/publicaciones` | `q`, `etiqueta`, `categoria`, `tipo`, `cursor`, `limite` | `Paginacion<Publicacion>` | 401 | RF-25, RF-27 |
| GET | `/publicaciones/{id}` | — | `Publicacion` | 401, 404 | RF-26 |
| POST | `/publicaciones` | multipart: `titulo`, `descripcion`, `archivo`, `etiquetas[]`, `categoria` | `201 Publicacion` | 401, 413, 415, 422 | RF-01 a RF-03 |
| PUT | `/publicaciones/{id}` | `titulo`, `descripcion`, `etiquetas[]`, `categoria`, (archivo opcional) | `Publicacion` | 401, 403, 404, 422 | RF-04, RF-06, RF-08 |
| DELETE | `/publicaciones/{id}` | — | `204` | 401, 403, 404 | RF-05, RF-07 |
| GET | `/me/publicaciones` | `cursor`, `limite` | `Paginacion<Publicacion>` | 401 | HU-02, HU-03 |

Notas: `autor`, `fechaCreacion` y `fechaUltimaEdicion` los asigna el backend. Una publicación eliminada devuelve `404` en el detalle.

## Likes

| Método | Ruta | Respuesta | Errores | Spec |
|---|---|---|---|---|
| PUT | `/publicaciones/{id}/like` | `{ likeadaPorMi: true, cantidadLikes }` (idempotente) | 401, 403 (propia), 404 | RF-11, RF-13, RF-14 |
| DELETE | `/publicaciones/{id}/like` | `{ likeadaPorMi: false, cantidadLikes }` (idempotente) | 401, 404 | RF-12 |

## Carpetas

| Método | Ruta | Cuerpo | Respuesta | Errores | Spec |
|---|---|---|---|---|---|
| GET | `/carpetas` | — | `Carpeta[]` | 401 | RF-16 |
| POST | `/carpetas` | `{ nombre }` | `201 Carpeta` | 401, 409, 422 | RF-16 |
| PATCH | `/carpetas/{id}` | `{ nombre?, visibilidad? }` | `Carpeta` | 401, 403, 404, 409, 422 | RF-16, RF-20 |
| DELETE | `/carpetas/{id}` | — | `204` | 401, 403, 404 | RF-16 |
| GET | `/carpetas/{id}/publicaciones` | `cursor`, `limite` | `Paginacion<ItemCarpeta>` (incluye `{id, disponible:false}`) | 401, 403, 404 | RF-19, CB-02 |
| PUT | `/carpetas/{id}/publicaciones/{pubId}` | — | `204` | 401, 403 (propia), 404 | RF-17, A-9 |
| DELETE | `/carpetas/{id}/publicaciones/{pubId}` | — | `204` | 401, 403, 404 | RF-18 |
| GET | `/publicaciones/{id}/carpetas` | — | `{ carpetaIds[] }` donde está guardada | 401, 404 | RF-17 |

## Reportes y moderación

| Método | Ruta | Cuerpo | Respuesta | Errores | Spec |
|---|---|---|---|---|---|
| POST | `/publicaciones/{id}/reportes` | `{ motivo, textoLibre? }` | `201 Reporte` | 401, 403 (propia), 404, 409 (duplicado), 422 | RF-21 a RF-23 |
| GET | `/moderacion/reportadas` | `cursor`, `limite` | `Paginacion<PublicacionReportada>` | 401, 403 (no ADMIN) | RF-24 |
| GET | `/moderacion/reportadas/{id}` | — | `PublicacionReportada` | 401, 403, 404 | HU-13 |
| DELETE | `/publicaciones/{id}` (como ADMIN) | — | `204` | 401, 403, 404 | RF-07 |

Al borrar, el backend marca los reportes como `resuelto` y los retiene 4 años (A-1).

## Manejo de errores en el cliente

| Código | Comportamiento |
|---|---|
| 401 | Sesión expirada: redirigir al inicio de sesión sin perder el formulario |
| 403 | Pantalla/mensaje "No tenés permiso" |
| 404 | Pantalla "No encontrado" o "Publicación no disponible" |
| 409 | Mensaje específico (p. ej. "Ya reportaste esta publicación") |
| 413 / 415 | Mensaje de archivo no admitido o muy grande |
| 422 | Errores por campo en el formulario |
| Red / 5xx | Mensaje de error con opción de reintentar; GET reintenta 2 veces |

## Abiertos

Autenticación y emisión de la sesión; topes de tamaño; criterio de orden del feed; lista de motivos; visibilidad de carpetas públicas a terceros.
