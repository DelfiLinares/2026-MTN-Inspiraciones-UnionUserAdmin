# Especificación — 002 Plataforma de Inspiraciones

**Estado**: Borrador | **Fecha**: 2026-10-01
**Constitution**: `constitution.md` (misma carpeta)
**Naturaleza**: solo frontend (2 apps React: usuario y administración). La API REST Java se conecta en una iteración futura. Esta especificación no contiene código.

## Clarificaciones

### Sesión 2026-10-01
- **Rol admin (A-4)**: el administrador funciona como un usuario con opciones extra: puede publicar, editar/borrar las propias, dar like, guardar en carpetas y reportar, además de borrar cualquier publicación y ver las reportadas. Sigue sin poder editar publicaciones ajenas.
- **Identificación de rol (A-15)**: la API devuelve el rol (`USER` o `ADMIN`) en la sesión; la app de administración rechaza a quien no sea `ADMIN`.
- **Borrado (A-2)**: lógico, con `EstadoPublicacion.ELIMINADA`.
- **Reportes al borrar (A-1)**: se conservan en la base de datos durante 4 años y quedan como "resueltos". La retención la aplica el backend.
- **Publicación eliminada en carpetas y likes (A-2, CB-02)**: la carpeta muestra "publicación no disponible" con opción de quitarla; los likes dejan de contarse.
- **Publicación reportada (A-16)**: sigue visible en el feed hasta que un admin decida borrarla.
- **Límites (A-6)**: sin límite en el frontend; los define el backend.
- **Guardado de publicaciones propias (A-9)**: no; solo de otros.
- **Tipos de contenido (A-11)**: imagen (png, jpeg), video (mp4, avi) y audio (mp3). Los topes de tamaño los define el backend; el frontend solo valida.

## 1. Objetivo

Permitir que los usuarios compartan inspiraciones mediante publicaciones, y que otros las descubran, valoren (like), organicen (carpetas) y reporten. Los administradores moderan eliminando publicaciones de otros. Encontrar publicaciones debe ser simple y rápido.

## 2. Actores

| Actor | Responsabilidades |
|---|---|
| Usuario | Crea, edita y borra sus publicaciones; da/quita like, guarda en carpetas y reporta publicaciones ajenas. |
| Administrador | Usuario con opciones extra: además de todo lo del usuario (publicar, like, carpetas, reportar), ve publicaciones reportadas y borra cualquier publicación. No edita publicaciones ajenas. No gestiona usuarios. |
| Sistema (backend) | Valida permisos, registra operaciones, contabiliza likes y registra reportes. |

## 3. Fuera de alcance inicial

- Manejo de usuarios (registro, baja, edición de perfil, cuentas).
- Comentarios.
- Seguidores y mensajes.
- Recomendaciones automáticas.
- Pagos o monetización.
- Login avanzado por roles (solo lo mínimo para distinguir admin de usuario).

> Nota de alineación: la constitution (alcance de frontend de usuario) menciona comentarios y la edición por admin; esta especificación los excluye según el pedido. Ver A-14.

## 4. Historias de usuario y prioridades

Prioridades: **P1** imprescindible, **P2** importante, **P3** deseable.

### Gestión de publicaciones
- **HU-01 (P1)** Como usuario, quiero crear una publicación para compartir mi inspiración.
- **HU-02 (P1)** Como usuario, quiero editar mis publicaciones para corregirlas.
- **HU-03 (P1)** Como usuario, quiero borrar mis publicaciones.

### Exploración
- **HU-04 (P1)** Como usuario, quiero ver un feed de publicaciones.
- **HU-05 (P1)** Como usuario, quiero ver el detalle de una publicación.
- **HU-06 (P1)** Como usuario, quiero buscar y filtrar publicaciones.

### Likes
- **HU-07 (P2)** Como usuario, quiero dar y quitar like a publicaciones ajenas.

### Carpetas
- **HU-08 (P2)** Como usuario, quiero crear, renombrar y eliminar carpetas personales.
- **HU-09 (P2)** Como usuario, quiero guardar y quitar publicaciones ajenas en mis carpetas y consultarlas.
- **HU-10 (P3)** Como usuario, quiero hacer pública una carpeta.

### Reportes y moderación
- **HU-11 (P2)** Como usuario, quiero reportar una publicación ajena indicando un motivo.
- **HU-12 (P1)** Como administrador, quiero borrar cualquier publicación.
- **HU-13 (P2)** Como administrador, quiero ver las publicaciones reportadas para decidir si las borro.

## 5. Criterios de aceptación

**HU-01**
- Dado un usuario autenticado, cuando completa título, descripción, contenido principal con formato válido y categoría/etiquetas, entonces la publicación se crea con autor, fecha de creación y fecha de última edición asignados automáticamente.
- Si falta un campo obligatorio o el formato no es admitido, se muestra el error y no se crea.
- Un usuario no autenticado no puede publicar.

**HU-02**
- El autor puede editar sus campos y la fecha de última edición se actualiza automáticamente; autor y fecha de creación no cambian.
- Un usuario no puede editar publicaciones ajenas. Un administrador tampoco.

**HU-03**
- Antes de borrar se pide confirmación explícita; tras borrar se muestra confirmación.
- Un usuario no puede borrar publicaciones ajenas.

**HU-04/05**
- El feed se carga paginado/incremental y cada ítem muestra su cantidad de likes.
- El detalle muestra todos los datos de la publicación, likes y acciones permitidas al actor (like, guardar, reportar).
- Una publicación inexistente o eliminada muestra un mensaje claro.

**HU-06**
- Se puede buscar por texto y filtrar por categoría/etiqueta y tipo de contenido (otros filtros: ver A-10).
- Sin resultados se muestra un estado vacío claro.

**HU-07**
- Like: el contador aumenta en 1 y el botón pasa a estado "con like".
- Quitar like: el contador disminuye en 1.
- Un usuario no puede dar más de un like a la misma publicación.
- Un usuario no puede dar like a su propia publicación (la acción no se ofrece y el backend la rechaza).

**HU-08/09**
- Crear carpeta con nombre; renombrar; eliminar con confirmación explícita.
- Guardar una publicación ajena en una o varias carpetas; quitarla de una carpeta; consultar el contenido.
- Eliminar una carpeta no elimina las publicaciones originales.
- Una carpeta vacía muestra estado vacío.
- No se puede guardar una publicación propia (ver A-9).

**HU-10**
- Las carpetas son privadas por defecto; el dueño puede cambiar la visibilidad a pública y volver a privada.

**HU-11**
- El reporte incluye un motivo (lista y/o texto libre) y se confirma tras enviarlo.
- No se puede reportar la propia publicación ni reportar dos veces la misma publicación.

**HU-12**
- El administrador borra cualquier publicación con confirmación explícita diferenciada visualmente.
- El sistema valida el rol antes de ejecutar; un usuario común no puede ejecutar esta acción aunque conozca el endpoint.

**HU-13**
- El administrador ve el listado de publicaciones reportadas con motivos y cantidad de reportes, y puede abrir el detalle y borrar.

## 6. Requisitos funcionales

**Publicaciones**
- **RF-01** El sistema permite crear una publicación.
- **RF-02** Cada publicación tiene: título, descripción, contenido principal, formato de contenido (imagen: png, jpeg; video: mp4, avi; audio: mp3), categoría o etiquetas, autor, fecha de creación, fecha de última edición y estado (`EstadoPublicacion`).
- **RF-02b** El frontend valida formato y tamaño según los topes definidos por el backend; el borrado es lógico (estado `ELIMINADA`).
- **RF-03** Autor y fechas se asignan automáticamente.
- **RF-04** El autor puede editar su publicación.
- **RF-05** El autor puede borrar su publicación.

**Permisos**
- **RF-06** Un usuario solo edita y borra sus propias publicaciones.
- **RF-07** Un administrador puede borrar cualquier publicación.
- **RF-08** Un administrador no puede editar publicaciones ajenas.
- **RF-09** Los permisos se validan antes de cada acción (en el backend; la UI los refleja).
- **RF-10** Solo usuarios autenticados (incluidos administradores) publican, dan like, guardan o reportan.
- **RF-10b** La sesión incluye el rol (`USER` o `ADMIN`); la app de administración rechaza el acceso a quien no sea `ADMIN`.

**Likes**
- **RF-11** Dar like a publicaciones ajenas.
- **RF-12** Quitar el propio like.
- **RF-13** Máximo un like por usuario y publicación.
- **RF-14** No se permite like a publicaciones propias.
- **RF-15** Se muestra la cantidad de likes en cada publicación.

**Carpetas**
- **RF-16** Crear, renombrar y eliminar carpetas personales.
- **RF-17** Guardar publicaciones ajenas en una o varias carpetas.
- **RF-18** Quitar una publicación de una carpeta.
- **RF-19** Consultar el contenido de las carpetas.
- **RF-20** Carpetas privadas por defecto, con opción de hacerlas públicas.

**Reportes**
- **RF-21** Reportar publicaciones ajenas con motivo (lista y/o texto libre).
- **RF-22** No reportar publicaciones propias.
- **RF-23** No reportar dos veces la misma publicación.
- **RF-24** El administrador ve las publicaciones reportadas.

**Exploración**
- **RF-25** Listado/feed de publicaciones.
- **RF-26** Detalle de publicación.
- **RF-27** Búsqueda y filtros.

**Interfaz**
- **RF-28** Confirmación explícita antes de borrar y confirmación visible tras cada acción.
- **RF-29** Dos aplicaciones React separadas: usuario y administración.

## 7. Requisitos no funcionales

- **RNF-01 Usabilidad**: interfaz amigable y visual; like, guardar y reportar fáciles de encontrar y usar; acciones del admin diferenciadas visualmente.
- **RNF-02 Performance**: tiempo máximo de carga del listado y de respuesta de acciones **[A DEFINIR]**; volumen de usuarios y publicaciones **[A DEFINIR]**. Feed paginado, sin recorrer listas completas en cliente.
- **RNF-03 Seguridad**: permisos aplicados en el backend; solo autenticados realizan acciones de escritura.
- **RNF-04 Calidad**: reglas de negocio separadas de la UI (capa de dominio); validaciones clave cubiertas por tests derivados de los criterios de aceptación.
- **RNF-05 Arquitectura**: sin lógica de backend en el frontend; integración con API REST Java futura.

## 8. Casos borde

- CB-01 Borrar una publicación que otros tienen likeada: los likes dejan de contarse y desaparece del feed.
- CB-02 Borrar una publicación guardada en carpetas: la carpeta muestra "publicación no disponible" con opción de quitarla.
- CB-03 Publicación reportada y borrada a la vez (el autor la borra mientras el admin la revisa): el admin ve que ya no existe y sus reportes quedan "resueltos" y se conservan 4 años.
- CB-04 Usuario reporta y luego el autor edita la publicación: el reporte sigue asociado; el admin ve la versión actual y la fecha de edición posterior al reporte (ver A-8).
- CB-05 Carpeta vacía: estado vacío con indicación.
- CB-06 Publicación eliminada dentro de una carpeta pública: no se expone contenido eliminado.
- CB-07 Doble clic en like o reporte: la operación es idempotente respecto a las reglas de unicidad.
- CB-08 Dos admins borran la misma publicación: el segundo recibe mensaje de "ya eliminada".
- CB-09 Sesión expirada durante una acción: se solicita autenticarse de nuevo sin perder el formulario.
- CB-10 Carpeta con nombre duplicado o vacío (ver A-7).
- CB-11 Archivo con formato o tamaño no admitido: rechazo con mensaje claro.

## 9. Ambigüedades (a resolver en /speckit.clarify)

- ~~**A-1**~~ Resuelta: reportes conservados 4 años como "resueltos".
- ~~**A-2**~~ Resuelta: borrado lógico (`ELIMINADA`).
- **A-3** ¿Se notifica al autor si el admin borra su publicación? Las notificaciones no están en alcance (se asume que no).
- ~~**A-4**~~ Resuelta: el admin también publica y da like.
- **A-5** ¿Las carpetas públicas: quién las ve (cualquier usuario autenticado o anónimo) y cómo se descubren?
- ~~**A-6**~~ Resuelta: sin límite en el frontend; lo define el backend.
- **A-7** ¿Los nombres de carpeta deben ser únicos por usuario? ¿Longitud máxima?
- **A-8** ¿Editar una publicación reportada invalida o reinicia los reportes?
- ~~**A-9**~~ Resuelta: solo publicaciones de otros.
- **A-10** ¿Qué filtros exactos hay? La constitution lista estilo, técnica, tipo de arte y distancia; la distancia requiere geolocalización no mencionada aquí.
- ~~**A-11**~~ Resuelta: png, jpeg, mp4, avi, mp3; topes de tamaño definidos por el backend. Pendiente: ¿y el tipo TUTORIAL de la constitution?
- **A-12** ¿Qué criterio usa el "algoritmo con feed"? Choca con "recomendaciones automáticas" fuera de alcance; se propone orden por fecha/popularidad definido por el backend.
- **A-13** Lista de motivos de reporte y longitud máxima del texto libre.
- **A-14** Alineación con la constitution: comentarios y edición por admin aparecen en la constitution pero no aquí.
- ~~**A-15**~~ Resuelta: el rol viene en la sesión de la API.
- ~~**A-16**~~ Resuelta: la publicación reportada sigue visible hasta que un admin la borre.
- **A-17** ¿Cantidad de reportes que dispara prioridad en la lista del admin?

## 10. Entidades del dominio (conceptuales)

- **Publicación**: título, descripción, contenido principal, formato, categoría/etiquetas, autor, fechas, estado. Encapsula quién puede editar/borrar.
- **Usuario / RolUsuario** (USER, ADMIN).
- **Like**: usuario + publicación (único).
- **Carpeta**: dueño, nombre, visibilidad, publicaciones.
- **Reporte**: reportante, publicación, motivo (único por par usuario/publicación).
- **Enums**: TipoContenido, EstadoPublicacion, TipoFiltro, MotivoReporte (a definir).

## 11. Criterios de éxito

- Un usuario crea una publicación y la encuentra en el feed sin pasos adicionales.
- Ninguna acción prohibida (borrar ajena, like propio, reporte duplicado) se completa.
- El admin llega desde la lista de reportados a la eliminación en pocos pasos y con confirmación.
- Metas de tiempo y volumen definidas en RNF-02 (pendiente).
