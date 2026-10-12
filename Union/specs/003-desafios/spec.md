# Especificación — 003 Desafíos

**Estado**: Borrador | **Fecha**: 2026-10-11
**Constitution**: `constitution.md` (misma carpeta)
**Naturaleza**: solo frontend (2 apps React existentes: usuario y administración). La API REST Java se conecta en una iteración futura. Esta especificación no contiene código.

## Clarificaciones

### Sesión 2026-10-11
- **A-01 (borrado)**: borrado lógico con `ELIMINADO` persistido.
- **A-03 (aprobar solicitud)**: aprobar solo cambia el estado a `APROBADA`. Publicar el desafío es un paso aparte del admin.
- **A-05 (cuándo responder)**: solo mientras el desafío está `ACTIVO`.
- **A-06 (fotos)**: 1 a 5 fotos, JPEG o PNG. Los topes de tamaño los valida el backend.
- **A-07 (edición)**: todos los campos son editables en un desafío `ACTIVO` o con respuestas, con confirmación explícita.
- **A-09 (respuesta)**: una respuesta es una publicación del módulo de Publicación de Contenido vinculada al desafío.
- **A-10 (cantidad)**: una respuesta por usuario y desafío, que su autor puede editar.
- **A-12 (cascada)**: al eliminar un desafío, sus respuestas se conservan ocultas.
- **A-18 (lectura)**: ver desafíos, detalle y respuestas requiere sesión iniciada.
- **Admin y respuestas**: el administrador solo borra respuestas ajenas; no las edita. Esto cambia el requisito original (HU-16, RF-14) y contradice el principio 6 del constitution, que se enmienda a la versión 1.1.0 para alinearlo.
- **Pendientes tras esta sesión**: A-02, A-04, A-08, A-11, A-13, A-14, A-15, A-16, A-17, A-19, A-20, A-21, A-22.

## 1. Objetivo

Permitir que los usuarios encuentren desafíos de inspiración artística de forma simple y rápida, los filtren por ámbito y estado, vean su detalle y las respuestas de otros usuarios, y propongan nuevos desafíos mediante solicitudes. Los administradores publican desafíos completos y moderan desafíos, solicitudes y respuestas.

## 2. Actores

| Actor | Responsabilidades |
|---|---|
| Usuario | Consulta y filtra desafíos; ve detalle y respuestas de otros; envía solicitudes y respuestas; edita y borra únicamente sus propias solicitudes y respuestas. No publica desafíos completos. |
| Administrador | Publica, edita y elimina desafíos completos; ve, aprueba, rechaza, edita y elimina solicitudes de cualquier usuario; elimina cualquier respuesta, sin editarla. |
| Sistema (backend) | Valida permisos, aplica reglas de negocio, deriva el estado del desafío a partir de sus fechas y sirve listados paginados. No se implementa en esta iteración. |

## 3. Fuera de alcance inicial

- Premios, puntos o recompensas por participar o ganar.
- Votación, ranking o elección de ganadores.
- Recomendaciones automáticas de desafíos.
- Notificaciones (email o push).
- Implementación de backend, incluso para pruebas.
- Aplicaciones frontend nuevas (se usan las dos existentes).
- Login avanzado por roles, más allá de `USER` y `ADMIN`.

## 4. Historias de usuario y prioridades

Prioridades: **P1** imprescindible, **P2** importante, **P3** deseable.

### Gestión de desafíos (administrador)
- **HU-01 (P1)** Como administrador, quiero publicar un desafío completo con nombre, descripción larga, foto, fechas y tags de ámbito.
- **HU-02 (P1)** Como administrador, quiero editar un desafío existente.
- **HU-03 (P1)** Como administrador, quiero eliminar un desafío.

### Solicitudes de desafío
- **HU-04 (P1)** Como usuario, quiero enviar una solicitud para proponer un desafío.
- **HU-05 (P2)** Como usuario, quiero ver, editar y eliminar mis propias solicitudes.
- **HU-06 (P1)** Como administrador, quiero ver las solicitudes pendientes y aprobarlas o rechazarlas con pocos pasos.
- **HU-07 (P2)** Como administrador, quiero editar o eliminar solicitudes de cualquier usuario.
- **HU-08 (P2)** Como usuario, quiero saber el estado de mis solicitudes (PENDIENTE, APROBADA, RECHAZADA). [A ACLARAR: A-17]

### Exploración y detalle
- **HU-09 (P1)** Como usuario, quiero ver un listado de desafíos con nombre, foto principal, tags, fechas y estado visible.
- **HU-10 (P1)** Como usuario, quiero filtrar desafíos por tag de ámbito y por estado.
- **HU-11 (P1)** Como usuario, quiero ver el detalle de un desafío con fotos, descripción larga, tags, fechas y estado.
- **HU-12 (P1)** Como usuario, quiero ver las respuestas de otros usuarios a un desafío, cargadas de forma progresiva.
- **HU-13 (P3)** Como usuario, quiero filtrar desafíos por fecha. [A ACLARAR: A-14]

### Respuestas
- **HU-14 (P1)** Como usuario, quiero enviar una respuesta a un desafío.
- **HU-15 (P2)** Como usuario, quiero editar y eliminar mis propias respuestas.
- **HU-16 (P2)** Como administrador, quiero eliminar cualquier respuesta.

## 5. Criterios de aceptación

**HU-01 (publicar desafío)**
- Dado un administrador autenticado, cuando completa nombre, descripción larga, al menos una foto, fecha de inicio, fecha de fin y al menos un tag de ámbito válido, entonces el desafío se publica.
- La fecha de fin debe ser posterior a la fecha de inicio. Si no lo es, se muestra un error y no se publica.
- Si falta nombre, descripción, foto o tag, se muestra un mensaje de error por campo y no se publica.
- Un usuario con rol `USER` no ve la acción de publicar y, si la invoca, el backend la rechaza.

**HU-02 (editar desafío)**
- El administrador puede modificar los campos editables del desafío y se mantienen las reglas de HU-01.
- Si el desafío está `ACTIVO` o tiene respuestas, se pide confirmación explícita antes de guardar. Todos los campos son editables (A-07).
- Un usuario `USER` no puede editar desafíos.

**HU-03 (eliminar desafío)**
- Antes de eliminar, se pide confirmación explícita diferenciada visualmente.
- Un usuario `USER` no puede eliminar desafíos.
- Tras eliminar, el desafío deja de aparecer en el listado. Es un borrado lógico (`ELIMINADO`) y sus respuestas se conservan ocultas (A-01, A-12).

**HU-04 (enviar solicitud)**
- Dado un usuario autenticado, cuando completa los datos de la solicitud, se crea con estado `PENDIENTE` y autor asignado.
- Si faltan datos obligatorios, se muestra un error comprensible y no se envía.
- Un administrador puede enviar solicitudes como usuario. [A ACLARAR: A-19]

**HU-05 (gestionar mis solicitudes)**
- El usuario ve solo sus solicitudes, con su estado.
- Puede editar y eliminar solo las suyas. Antes de eliminar se pide confirmación.
- No puede editar ni eliminar solicitudes de otros. [A ACLARAR: A-04 para solicitudes ya resueltas]

**HU-06 (aprobar o rechazar solicitud)**
- El administrador ve el listado de solicitudes `PENDIENTE` paginado.
- Aprobar o rechazar cambia el estado de la solicitud de `PENDIENTE` a `APROBADA` o `RECHAZADA`.
- Una solicitud ya resuelta no vuelve a `PENDIENTE` (ver caso borde CB-06).
- Aprobar solo cambia el estado a `APROBADA`; publicar el desafío es un paso aparte del admin (A-03).

**HU-07 (admin sobre solicitudes ajenas)**
- El administrador edita y elimina solicitudes de cualquier usuario con confirmación explícita para eliminar.

**HU-09 (listado)**
- Cada ítem muestra nombre, foto principal, tags, fecha de inicio, fecha de fin y estado derivado (`PROGRAMADO`, `ACTIVO` o `FINALIZADO`) con indicación visible.
- El listado se carga paginado o con scroll infinito servido por la API.
- Un listado vacío muestra un estado vacío claro.

**HU-10 (filtros)**
- El usuario puede filtrar por uno o más tags de ámbito y por estado.
- Los filtros se aplican a través de la API; el frontend no filtra listas completas en memoria.
- Sin resultados, se muestra un estado vacío con opción de limpiar filtros.

**HU-11 (detalle)**
- Muestra todas las fotos, la descripción larga, los tags, las fechas y el estado derivado.
- Un desafío inexistente o eliminado muestra un mensaje claro.

**HU-12 (ver respuestas)**
- Las respuestas se cargan paginadas o con scroll infinito.
- Cada respuesta muestra su autor y su contenido.
- Si no hay respuestas, se muestra un estado vacío claro. Requiere sesión iniciada (A-18).

**HU-14 (enviar respuesta)**
- Dado un usuario autenticado, cuando envía una respuesta válida a un desafío, esta queda asociada al desafío y a su autor.
- Solo se puede responder mientras el desafío está `ACTIVO` (A-05).
- Cada usuario tiene una única respuesta por desafío, que puede editar (A-10).

**HU-15 (gestionar mis respuestas)**
- El usuario edita y elimina solo sus respuestas. Antes de eliminar se pide confirmación.
- No puede editar ni eliminar respuestas de otros.

**HU-16 (admin sobre respuestas)**
- El administrador elimina cualquier respuesta con confirmación explícita. No puede editarla (decisión de la sesión 2026-10-11).

## 6. Requisitos funcionales

**Desafíos**
- **RF-01** El administrador publica un desafío completo.
- **RF-02** Cada desafío tiene: nombre, descripción larga, entre 1 y 5 fotos en JPEG o PNG (la principal se usa en el listado), fecha de inicio, fecha de fin y uno o más tags de ámbito (A-06).
- **RF-03** La fecha de fin debe ser posterior a la fecha de inicio (`RangoFechas`).
- **RF-04** Un desafío debe tener nombre, descripción larga, al menos una foto y al menos un tag de ámbito válido.
- **RF-05** El administrador edita y elimina desafíos.
- **RF-06** El estado (`PROGRAMADO`, `ACTIVO`, `FINALIZADO`) se deriva de las fechas y no se almacena de forma redundante. `ELIMINADO` se persiste como borrado lógico (A-01).

**Solicitudes**
- **RF-07** El usuario envía solicitudes de desafío.
- **RF-08** Cada solicitud tiene estado `EstadoSolicitudDesafio`: `PENDIENTE`, `APROBADA` o `RECHAZADA`. Toda solicitud nueva nace en `PENDIENTE`.
- **RF-09** El administrador ve, aprueba y rechaza solicitudes de cualquier usuario.
- **RF-10** El usuario ve, edita y elimina solo sus propias solicitudes.
- **RF-11** El administrador edita y elimina cualquier solicitud.

**Respuestas**
- **RF-12** El usuario envía una única respuesta por desafío, solo mientras está `ACTIVO` (A-05, A-10).
- **RF-13** El usuario edita y elimina solo sus propias respuestas.
- **RF-14** El administrador elimina cualquier respuesta. No la edita.
- **RF-15** Las respuestas de un desafío se listan paginadas o con scroll infinito.

**Listado, filtros y detalle**
- **RF-16** Listado de desafíos con nombre, foto principal, tags, fechas y estado visible.
- **RF-17** Filtro por tag de ámbito (`TipoFiltroDesafio.AMBITO`) y por estado (`TipoFiltroDesafio.ESTADO`).
- **RF-18** Detalle de desafío con fotos, descripción larga, tags, fechas, estado y respuestas.
- **RF-19** Filtro por fecha (`TipoFiltroDesafio.FECHA`) sujeto a A-14.

**Permisos e interfaz**
- **RF-20** Solo un administrador publica desafíos completos. Un usuario `USER` solo crea solicitudes.
- **RF-21** Los permisos se validan en el backend antes de cada acción; la UI los refleja.
- **RF-22** Las acciones destructivas (eliminar desafíos, solicitudes o respuestas) y la edición de un desafío `ACTIVO` o con respuestas requieren confirmación explícita.
- **RF-23** Dos aplicaciones React separadas: usuario y administración. Ninguna accede a MySQL.
- **RF-24** Ver desafíos, detalle y respuestas requiere sesión iniciada (A-18).

## 7. Requisitos no funcionales

- **RNF-01 Usabilidad**: interfaz clara y amigable. Encontrar desafíos y filtrarlos por ámbito y estado debe ser simple. Los formularios muestran validaciones y mensajes comprensibles. En administración, editar y eliminar se diferencian visualmente de consultar.
- **RNF-02 Performance**: tiempos máximos de carga del listado y del detalle **[A ACLARAR: A-15]**. Listado y respuestas paginados por la API; no se recorren ni filtran listas completas en memoria.
- **RNF-03 Escalabilidad**: el módulo debe soportar gran cantidad de desafíos, solicitudes y respuestas. Volúmenes objetivo **[A ACLARAR: A-15]**.
- **RNF-04 Seguridad**: permisos validados en el backend; la UI los refleja. Ocultar una acción no reemplaza la autorización.
- **RNF-05 Calidad**: reglas de negocio separadas de la UI (dominio, aplicación/servicios). Las validaciones clave (RF-03, RF-04, RF-10, RF-13, RF-20) tienen tests.
- **RNF-06 Arquitectura**: los datos de ejemplo viven detrás de una interfaz de servicio reemplazable por el cliente de la API Java. Sin lógica de backend en el frontend.
- **RNF-07 Rankings y estadísticas**: los frontends no calculan rankings de respuestas, popularidad ni estadísticas; solo consumen lo que entrega la API.

## 8. Casos borde

- **CB-01** Un administrador elimina un desafío mientras otro usuario lo está viendo: al refrescar o al intentar responder, se muestra "desafío no disponible".
- **CB-02** Dos administradores editan el mismo desafío a la vez: el segundo recibe un aviso de conflicto y no sobrescribe cambios sin confirmación.
- **CB-03** Un usuario elimina su solicitud mientras el administrador la está aprobando: el administrador ve que ya no existe.
- **CB-04** Un usuario envía la misma solicitud dos veces (doble clic): solo se crea una. [A ACLARAR: A-20 sobre duplicados lógicos]
- **CB-05** Un desafío cambia de estado mientras un usuario tiene el listado abierto (`PROGRAMADO` a `ACTIVO`): el estado mostrado se actualiza al recargar.
- **CB-06** Una solicitud ya `APROBADA` o `RECHAZADA` intenta volver a `PENDIENTE`: la operación se rechaza. [A ACLARAR: A-04]
- **CB-07** Un usuario intenta editar la respuesta de otro desde la URL: el backend rechaza la acción y la UI muestra un mensaje de permiso denegado.
- **CB-08** Sesión expirada durante un envío de solicitud o respuesta: se pide autenticarse de nuevo sin perder el formulario.
- **CB-09** Un desafío sin respuestas muestra un estado vacío claro.
- **CB-10** Un desafío con fechas ya pasadas al momento de publicarlo se publica directamente como `FINALIZADO`. [A ACLARAR: A-21]
- **CB-11** Foto con formato o tamaño no admitido (solo JPEG o PNG, máximo 5 fotos): rechazo con mensaje claro (A-06).
- **CB-12** Tag que no pertenece al catálogo: se rechaza con mensaje claro.
- **CB-13** Eliminación de un desafío con respuestas: las respuestas se conservan ocultas (A-12).

## 9. Ambigüedades (a resolver en /speckit.clarify)

No se asume ninguna de estas decisiones durante la implementación. Las referencias a la constitution usan la numeración A1–A7 de su sección de puntos pendientes.

- ~~**A-01**~~ Resuelta: borrado lógico con `ELIMINADO` persistido. (constitution A1)
- **A-02** Catálogo de tags de ámbito: ¿lista inicial exacta? ¿Solo los admins los administran o los usuarios pueden crear tags nuevos? (constitution A2)
- ~~**A-03**~~ Resuelta: aprobar solo cambia el estado a `APROBADA`; publicar es un paso aparte. (constitution A3)
- **A-04** ¿Un usuario puede editar o eliminar una solicitud ya `APROBADA` o `RECHAZADA`? (constitution A4)
- ~~**A-05**~~ Resuelta: solo mientras el desafío está `ACTIVO`. (constitution A5)
- ~~**A-06**~~ Resuelta: 1 a 5 fotos, JPEG o PNG; los topes de tamaño los valida el backend. (constitution A6)
- ~~**A-07**~~ Resuelta: todos los campos editables, con confirmación explícita. (constitution A7)
- **A-08** Datos de una solicitud: ¿los mismos campos que un desafío (fotos, fechas, tags) o una propuesta más simple?
- ~~**A-09**~~ Resuelta: una publicación del módulo de Publicación de Contenido vinculada al desafío. El admin solo la borra (ver Clarificaciones). Formatos: ver A-22.
- ~~**A-10**~~ Resuelta: una respuesta por usuario y desafío, editable por su autor.
- **A-11** Longitud mínima y máxima del nombre y de la descripción larga.
- ~~**A-12**~~ Resuelta: las respuestas se conservan ocultas.
- **A-13** ¿Un desafío `FINALIZADO` sigue visible, y por cuánto tiempo?
- **A-14** ¿Se puede filtrar por fecha, y de qué forma (rango, "activos hoy", etc.)?
- **A-15** Tiempos máximos aceptables de carga del listado y del detalle, y volúmenes objetivo (desafíos, solicitudes, respuestas).
- **A-16** Zona horaria con la que se evalúan las fechas, y si el día de fin es inclusivo para el estado `ACTIVO`.
- **A-17** ¿El usuario ve el motivo de rechazo de sus solicitudes? ¿Hay campo de motivo?
- ~~**A-18**~~ Resuelta: ver desafíos y respuestas requiere sesión iniciada.
- **A-19** ¿Un administrador también puede enviar solicitudes y respuestas como usuario? (precedente: spec 002, A-4)
- **A-20** ¿Se consideran duplicados lógicos dos solicitudes con el mismo nombre o las mismas fechas?
- **A-21** ¿Se puede publicar un desafío con fechas ya pasadas o con fecha de inicio anterior a hoy?
- **A-22** Formatos y tipos de contenido de una respuesta (dependencia de A-09): ¿los mismos que en el spec 002 (imagen, video, audio) o solo imagen? ¿Las respuestas aparecen en el feed general de 002?

## 10. Entidades del dominio (conceptuales)

- **Desafío** (`Desafio`): nombre, descripción larga, fotos, `RangoFechas`, tags de ámbito. Encapsula la validación de fechas, las reglas de quién puede modificarlo y la derivación de `EstadoDesafio`.
- **Solicitud de desafío** (`SolicitudDesafio`): autor, datos propuestos (A-08), `EstadoSolicitudDesafio`. Encapsula las transiciones (`PENDIENTE` → `APROBADA` o `RECHAZADA`) y quién puede modificarla.
- **Respuesta** (`RespuestaDesafio`): publicación vinculada al desafío y a su autor (A-09). Encapsula quién puede editarla (solo el autor) o eliminarla (el autor o un admin).
- **RangoFechas** (value object): inicio y fin; garantiza fin posterior a inicio.
- **AmbitoDesafio** (enum o value object): tags del catálogo (A-02).
- **EstadoDesafio**: `PROGRAMADO`, `ACTIVO` y `FINALIZADO` derivados de las fechas; `ELIMINADO` persistido como borrado lógico (A-01).
- **EstadoSolicitudDesafio** (enum): `PENDIENTE`, `APROBADA`, `RECHAZADA`.
- **TipoFiltroDesafio** (enum): `AMBITO`, `ESTADO`, `FECHA`.
- **RolUsuario** (enum, reutilizado): `USER`, `ADMIN`.

## 11. Criterios de éxito

- Un usuario encuentra un desafío y lo filtra por ámbito y estado sin pasos adicionales.
- Un usuario envía una solicitud y una respuesta con validaciones claras.
- Ninguna acción prohibida (publicar desafío siendo `USER`, editar respuesta ajena, eliminar solicitud ajena sin rol de admin) se completa.
- El administrador aprueba o rechaza solicitudes pendientes en pocos pasos.
- Las acciones destructivas siempre requieren confirmación.
- Tiempos y volúmenes quedan definidos en RNF-02 y RNF-03 tras resolver A-15.
