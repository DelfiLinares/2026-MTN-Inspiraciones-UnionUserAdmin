# Modelo de datos — 003 Desafíos (Frontend)

**Spec**: `spec.md` (sección 10) | **Constitution**: `constitution.md` (principios 2 y 7; reglas de estado y fechas) | **Research**: `research.md`

Este documento describe el modelo de dominio que vive en el frontend y su representación en la API. **No contiene DDL, migraciones ni esquema de base de datos**: la persistencia es responsabilidad de la API Java (constitution 003, principio 3; apartado de persistencia).

---

## 1. Ubicación

Todo el modelo vive en `packages/shared/src/desafios/domain/` (entidades, value objects, enums) y `packages/shared/src/desafios/application/` (casos de uso). Las apps no definen entidades propias.

---

## 2. Enums

| Enum | Valores | Uso | Nota |
|---|---|---|---|
| `EstadoSolicitudDesafio` | `PENDIENTE`, `APROBADA`, `RECHAZADA` | Estado de `SolicitudDesafio` (RF-08) | Toda solicitud nueva nace en `PENDIENTE`. |
| `EstadoDesafio` | `PROGRAMADO`, `ACTIVO`, `FINALIZADO`, `ELIMINADO` | Estado de `Desafio` (RF-06) | `PROGRAMADO`, `ACTIVO`, `FINALIZADO` se derivan de `RangoFechas`. `ELIMINADO` es el borrado lógico persistido (A-01). La API no expone `ELIMINADO`: un desafío eliminado responde como no encontrado (HU-11, CB-13). |
| `TipoFiltroDesafio` | `AMBITO`, `ESTADO`, `FECHA` | Tipos de filtro del listado (RF-17, RF-19) | `FECHA` sujeto a A-14. |
| `RolUsuario` | `USER`, `ADMIN` | Permisos (reutilizado) | Reutilizado del módulo compartido de 002 (`packages/shared/src/domain/enums.ts`). No se redefine. |

---

## 3. Value objects

### 3.1 `RangoFechas`

- **Atributos**: `inicio` (fecha), `fin` (fecha).
- **Invariante**: `fin` es posterior a `inicio`. Si no lo es, la construcción falla con un error de validación de campo (RF-03, HU-01).
- **Comportamiento**:
  - `estado(ahora)`: devuelve `PROGRAMADO` si `ahora` es anterior a `inicio`; `FINALIZADO` si es posterior a `fin`; `ACTIVO` en otro caso. **La frontera de `ACTIVO` depende de A-16 (día de fin inclusivo o no) y no está fijada.**
- **Sin identidad**: dos rangos con los mismos valores son iguales.

### 3.2 `AmbitoDesafio`

- **Atributos**: `valor` (texto).
- **Invariante**: pertenece al catálogo. El catálogo lo entrega la API (`GET /ambitos`). **La lista cerrada está pendiente de A-02**; el valor no se asume en el dominio.
- **Uso**: un `Desafio` tiene al menos un `AmbitoDesafio` (RF-04, CB-12).

### 3.3 `Foto`

- **Atributos**: `id`, `url`, `formato` (`JPEG` o `PNG`), `principal` (booleano).
- **Invariante de formato**: solo `JPEG` o `PNG` (A-06, CB-11). La validación de tamaño no se hace en el frontend: la valida el backend (A-06).
- **Regla de colección**: un `Desafio` tiene entre 1 y 5 fotos, y exactamente una `principal` (A-06, RF-02).

---

## 4. Entidades

### 4.1 `Desafio`

**Atributos**:

| Atributo | Tipo | Regla |
|---|---|---|
| `id` | identificador | Asignado por la API. |
| `nombre` | texto | Obligatorio (RF-04). Longitud pendiente de A-11. |
| `descripcionLarga` | texto | Obligatorio (RF-04). Longitud pendiente de A-11. |
| `fotos` | colección de `Foto` | Entre 1 y 5 (RF-02, A-06). |
| `rango` | `RangoFechas` | Obligatorio. |
| `ambitos` | colección de `AmbitoDesafio` | Al menos uno (RF-04, CB-12). |
| `eliminado` | booleano | `true` tras el borrado lógico (A-01). |
| `tieneRespuestas` | booleano | Dato que entrega la API. Se usa para exigir confirmación al editar (RF-22). |
| `version` | entero | Control de concurrencia (P-04, CB-02). |

**Comportamiento (reglas que la entidad encapsula)**:

| Método | Regla | Fuente |
|---|---|---|
| `estado(ahora)` | Si `eliminado`, devuelve `ELIMINADO`. Si no, delega en `rango.estado(ahora)`. | Constitution 003, reglas de estado; A-01 |
| `puedeEditarPor(sesion)` | Solo `ADMIN`. | HU-02, RF-05, RF-20 |
| `puedeEliminarPor(sesion)` | Solo `ADMIN`. | HU-03, RF-05 |
| `requiereConfirmacionEdicion(ahora)` | `true` si `estado(ahora)` es `ACTIVO` o `tieneRespuestas` es `true`. | HU-02, RF-22, A-07 |
| `aceptaRespuestas(ahora)` | `true` solo si `estado(ahora)` es `ACTIVO`. | RF-12, A-05 |
| `marcarEliminado()` | Cambia `eliminado` a `true`. Es irreversible desde el cliente. | A-01, HU-03 |
| `validar(datos)` | Devuelve errores por campo: nombre, descripción, fotos (1–5, JPEG/PNG), ámbitos (al menos uno), fechas (fin posterior a inicio). Los errores se devuelven a la UI, que no decide nada. | HU-01, RF-03, RF-04, CB-11, CB-12 |

**Regla de uso**: los componentes solo leen estos métodos. Ningún componente calcula permisos, estado ni validaciones por su cuenta. La unicidad de una respuesta por usuario y desafío (A-10) la aplica la API; la UI muestra el mensaje de conflicto si ocurre.

### 4.2 `SolicitudDesafio`

**Atributos**:

| Atributo | Tipo | Regla |
|---|---|---|
| `id` | identificador | Asignado por la API. |
| `autorId` | identificador de usuario | Asignado al crear (HU-04). |
| `datos` | pendiente | Los campos de la solicitud dependen de **A-08**. La entidad no define campos hasta resolverlo. |
| `estado` | `EstadoSolicitudDesafio` | Nace en `PENDIENTE` (RF-08). |
| `version` | entero | Control de concurrencia (P-04). |

**Comportamiento**:

| Método | Regla | Fuente |
|---|---|---|
| `aprobar()` | Solo desde `PENDIENTE`. Pasa a `APROBADA`. Desde otro estado, lanza transición inválida. | HU-06, CB-06, A-03 |
| `rechazar()` | Solo desde `PENDIENTE`. Pasa a `RECHAZADA`. | HU-06, CB-06 |
| `puedeEditarPor(sesion)` | Autor de la solicitud o `ADMIN`. **Solo aplica con estado `PENDIENTE` hasta resolver A-04.** | HU-05, HU-07, RF-10, RF-11 |
| `puedeEliminarPor(sesion)` | Autor o `ADMIN`. Misma nota de A-04. | HU-05, HU-07, RF-10, RF-11 |
| `estaResuelta()` | `true` si el estado es `APROBADA` o `RECHAZADA`. Se usa para ocultar acciones pendientes de A-04. | CB-06, A-04 |

**Lo que la entidad no decide**: si al aprobar se publica un desafío. A-03 indica que es un paso aparte del admin. El efecto sobre el desafío queda fuera de la entidad (P-03).

### 4.3 `RespuestaDesafio`

**Atributos**:

| Atributo | Tipo | Regla |
|---|---|---|
| `id` | identificador | Asignado por la API. |
| `desafioId` | identificador | Vincula con `Desafio` (A-09). |
| `autorId` | identificador de usuario | Asignado al crear. |
| `contenido` | pendiente | El tipo de contenido depende de **A-22**. La entidad no define formatos hasta resolverlo. |

**Comportamiento**:

| Método | Regla | Fuente |
|---|---|---|
| `puedeEditarPor(sesion)` | Solo el autor. **Nunca el admin** (decisión de la clarificación 2026-10-11; constitution 1.1.0). | HU-15, RF-13, CB-07 |
| `puedeEliminarPor(sesion)` | El autor o un `ADMIN`. | HU-15, HU-16, RF-13, RF-14 |

**Lo que la entidad no decide**: si una respuesta puede editarse o borrarse cuando el desafío ya no está `ACTIVO`. Solo consta que las respuestas se crean mientras está `ACTIVO` (A-05). La regla para editar y borrar queda pendiente (P-02).

---

## 5. Sesión actual

Objeto de valor que representa al usuario que actúa: `usuarioId` y `rol` (`RolUsuario`). Lo entrega el módulo de sesión de 002. Los métodos `puedeEditarPor` y `puedeEliminarPor` reciben este objeto. No hay lógica de sesión en las entidades.

---

## 6. Casos de uso (aplicación)

Cada caso de uso recibe el puerto y la sesión actual. Orquesta, no decide: delega las reglas en las entidades.

| Caso de uso | Entidades | Requisito |
|---|---|---|
| `ListarDesafios` | `Desafio` (lectura) | HU-09, HU-10, RF-16, RF-17 |
| `ObtenerDesafio` | `Desafio` | HU-11, RF-18 |
| `PublicarDesafio` | `Desafio.validar`, `puedeEditarPor` (admin) | HU-01, RF-01, RF-20 |
| `EditarDesafio` | `Desafio.puedeEditarPor`, `requiereConfirmacionEdicion` | HU-02, RF-05, RF-22 |
| `EliminarDesafio` | `Desafio.puedeEliminarPor`, `marcarEliminado` | HU-03, RF-05, RF-22 |
| `ProponerSolicitud` | `SolicitudDesafio` (creación en `PENDIENTE`) | HU-04, RF-07 |
| `ListarSolicitudes` | `SolicitudDesafio` (lectura) | HU-05, HU-06, RF-09, RF-10 |
| `EditarSolicitud` | `SolicitudDesafio.puedeEditarPor` | HU-05, HU-07, RF-10, RF-11 |
| `EliminarSolicitud` | `SolicitudDesafio.puedeEliminarPor` | HU-05, HU-07 |
| `AprobarSolicitud` | `SolicitudDesafio.aprobar` | HU-06, RF-09 |
| `RechazarSolicitud` | `SolicitudDesafio.rechazar` | HU-06, RF-09 |
| `ListarRespuestas` | `RespuestaDesafio` (lectura) | HU-12, RF-15 |
| `ResponderDesafio` | `Desafio.aceptaRespuestas` | HU-14, RF-12 |
| `EditarRespuesta` | `RespuestaDesafio.puedeEditarPor` | HU-15, RF-13 |
| `EliminarRespuesta` | `RespuestaDesafio.puedeEliminarPor` | HU-15, HU-16, RF-13, RF-14 |
| `ListarAmbitos` | `AmbitoDesafio` (catálogo) | RF-17, A-02 |

---

## 7. Representación en la API

El detalle de cada esquema está en `contracts/openapi.yaml`. Resumen de correspondencias:

| Entidad | Esquema de respuesta | Esquema de escritura | Observación |
|---|---|---|---|
| `Desafio` | `Desafio` (detalle, con fotos) | `DesafioEscritura` + fotos en `multipart` | La lista usa `DesafioResumen` (solo foto principal). |
| `SolicitudDesafio` | `SolicitudDesafio` | `SolicitudDesafioEscritura` | Campos pendientes de A-08. |
| `RespuestaDesafio` | `RespuestaDesafio` | `RespuestaEscritura` | Contenido pendiente de A-22. |

**Listados**: `PaginaDesafios`, `PaginaSolicitudes`, `PaginaRespuestas`. Cada una devuelve `items` y `siguienteCursor`.

---

## 8. Trazabilidad de reglas a pruebas

| Regla | Entidad o value object | Prueba |
|---|---|---|
| Fin posterior a inicio | `RangoFechas` | Unitaria de dominio |
| Nombre, descripción, al menos una foto, al menos un ámbito | `Desafio.validar` | Unitaria de dominio y componente de formulario |
| Solo admin publica o edita o borra desafíos | `Desafio.puedeEditarPor`, `puedeEliminarPor` | Unitaria de dominio y componente |
| Confirmación al editar desafío activo o con respuestas | `Desafio.requiereConfirmacionEdicion` | Unitaria de dominio y componente |
| Respuestas solo con desafío activo | `Desafio.aceptaRespuestas` | Unitaria de dominio y componente |
| Transición de solicitud solo desde pendiente | `SolicitudDesafio.aprobar`, `rechazar` | Unitaria de dominio |
| Usuario edita o borra solo sus solicitudes | `SolicitudDesafio.puedeEditarPor`, `puedeEliminarPor` | Unitaria de dominio y componente |
| Usuario edita solo sus respuestas; admin no edita | `RespuestaDesafio.puedeEditarPor` | Unitaria de dominio y componente |
| Admin borra cualquier respuesta | `RespuestaDesafio.puedeEliminarPor` | Unitaria de dominio |
| Estado derivado de fechas | `Desafio.estado`, `RangoFechas.estado` | Unitaria de dominio (frontera pendiente de A-16) |

---

## 9. Pendientes del modelo

| ID | Tema | Efecto |
|---|---|---|
| A-02 | Catálogo de ámbitos | `AmbitoDesafio` sin valores cerrados. |
| A-04 | Editar o borrar solicitudes resueltas | `puedeEditarPor` y `puedeEliminarPor` sin regla para `APROBADA` o `RECHAZADA`. |
| A-08 | Campos de `SolicitudDesafio.datos` | Sin atributos definidos. |
| A-11 | Longitudes de nombre y descripción | Sin límites en `validar`. |
| A-16 | Frontera de `ACTIVO` | `RangoFechas.estado` sin valor de frontera fijado. |
| A-22 | Formato de `RespuestaDesafio.contenido` | Sin tipo definido. |
| P-02 | Editar o borrar respuestas cuando el desafío no está activo | Sin regla. |
| P-03 | Efecto de aprobar en la publicación | Fuera de la entidad (A-03 resuelta solo como cambio de estado). |
| P-04 | Mecanismo de `version` y `If-Match` | Campo `version` propuesto, pendiente de confirmar. |
