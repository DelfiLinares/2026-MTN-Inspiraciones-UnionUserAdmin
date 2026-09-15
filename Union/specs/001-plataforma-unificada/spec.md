# Feature Specification: Plataforma Unificada — Red Social de Inspiración Artística (Frontend)

**Feature Branch**: `001-plataforma-unificada`

**Created**: 2026-09-15

**Status**: Draft

**Input**: Unificación de `Usuario/my-project/specs/001-user-interactions/spec.md` (frontend de
usuario) y `Admin/my-proyect/specs/001-admin-moderacion/spec.md` (frontend de administración) en
una única especificación funcional de plataforma, sin implementar backend, API ni persistencia.

**Fuentes**:
- `Usuario/my-project/specs/001-user-interactions/spec.md` (no modificado)
- `Admin/my-proyect/specs/001-admin-moderacion/spec.md` (no modificado)

Este documento reemplaza conceptualmente la visión de "dos sistemas" por la de **una sola
plataforma** con dos superficies de interfaz (frontend de usuario y frontend de administración)
que comparten actores, entidades y reglas de negocio, consumiendo la misma API.

---

## 1. Descripción General del Sistema

### 1.1 Objetivo de la plataforma

Ofrecer una red social donde usuarios y artistas puedan compartir creaciones (dibujos, pinturas,
fotografías, música, esculturas, videos, tutoriales y otros tipos de contenido artístico),
descubrir e inspirarse en el contenido de otros, interactuar (likes, comentarios/reportes, seguir
usuarios), organizar publicaciones guardadas en carpetas, participar de desafíos, y contar con un
módulo administrativo que garantice la calidad y seguridad de la comunidad mediante moderación,
gestión de usuarios, gestión de desafíos propuestos y visualización/exportación de reportes y
analíticas.

### 1.2 Alcance general

La especificación describe **exclusivamente el comportamiento del frontend** (dos aplicaciones
React: frontend de usuario y frontend de administración) y su interacción con una API REST externa
a este alcance. No se especifica ni se implementa backend, base de datos, integraciones externas,
procesamiento de analytics ni generación de archivos de reportes: estas responsabilidades se
consumen a través de la API, no se recalculan ni implementan en el cliente.

### 1.3 Actores

1. **Visitante**: usuario no autenticado. Accede a funcionalidades públicas de descubrimiento y debe
   iniciar sesión para cualquier acción que requiera identidad.
2. **Usuario autenticado (USER)**: gestiona su cuenta/perfil, publica contenido, interactúa
   (like, reportar, seguir), busca/descubre contenido, guarda publicaciones en carpetas y propone
   desafíos.
3. **Administrador (ADMIN)**: accede al módulo administrativo; gestiona y modera usuarios,
   publicaciones, reportes y desafíos; consulta reportes/analíticas; solo un ADMIN puede promover a
   otro usuario a ADMIN.
4. **Sistema/API**: gestiona autenticación, autorización, persistencia y estados; es responsable de
   validar permisos de forma definitiva. Todo lo que corresponda al backend queda fuera de la lógica
   propia del frontend.

### 1.4 Diferenciación de funcionalidades

| Tipo de funcionalidad | Accesible por | Superficie |
| --- | --- | --- |
| Públicas (descubrimiento, ver contenido) | Visitante, USER, ADMIN | Frontend de usuario |
| De usuario autenticado (publicar, like, seguir, reportar, carpetas, desafíos propios) | USER, ADMIN* | Frontend de usuario |
| Administrativas (dashboard, moderación, gestión de usuarios/desafíos, reportes/analíticas) | ADMIN | Frontend de administración |

`*` — Los specify originales no aclaran si una cuenta ADMIN puede además operar como usuario común
en el frontend de usuario (publicar, dar like, etc.). Ver **A14** en la sección de Ambigüedades.

---

## 2. Historias de Usuario

> Numeración continua HU-01 a HU-15. Se conservan todas las historias de ambos specify originales,
> con su prioridad y criterios de aceptación originales, adaptando la redacción de "Como
> administrador/Un administrador" a la convención **Como [actor]** solicitada.

### HU-01 — Dar like a una publicación

**Como** usuario autenticado

**quiero** marcar con like una publicación que me inspire

**para** expresar apreciación y ayudar al sistema a conocer mis gustos.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-01.1: Al hacer clic en like sobre una publicación ajena, el botón cambia a estado activo y el
  contador se incrementa inmediatamente (actualización optimista), sin recargar la página.
- AC-01.2: Si el usuario ya dio like, el botón se muestra en estado activo, visualmente distinguible.
- AC-01.3: Si la llamada a la API falla, el like se revierte visualmente y se muestra un error no
  bloqueante.
- AC-01.4: El botón de like no está habilitado en publicaciones propias.
- AC-01.5: Un usuario no autenticado que intenta dar like es invitado/redirigido a iniciar sesión;
  la acción no se ejecuta hasta autenticarse.

---

### HU-02 — Publicar contenido con tags

**Como** usuario autenticado

**quiero** crear una publicación con contenido (imagen, video, música, etc.) y agregarle tags
descriptivos

**para** que otros usuarios puedan descubrir y filtrar mi trabajo.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-02.1: Al adjuntar un archivo, el tipo de contenido se determina o puede seleccionarse.
- AC-02.2: Los tags se agregan por autocompletado desde un vocabulario controlado provisto por el
  backend, mostrados como chips removibles, hasta un máximo de 10 tags por publicación.
- AC-02.3: El envío se bloquea si no hay al menos un archivo adjunto.
- AC-02.4: Si el tipo de archivo (extensión/MIME) no es válido para el tipo de contenido, se muestra
  un error claro en cliente antes de subir; la validación de tamaño máximo es responsabilidad
  exclusiva del backend.
- AC-02.5: Durante la subida se muestra feedback visual (progreso/spinner) sin bloquear la interfaz.
- AC-02.6: Se mantiene un estado de carga visible durante el envío (objetivo: respuesta en ≤ 5 s).
- AC-02.7: La publicación creada aparece en el perfil propio sin recargar la página.
- AC-02.8: Si el envío falla, se muestra un mensaje descriptivo y el formulario conserva los datos
  ya ingresados.

---

### HU-03 — Buscar publicaciones y aplicar filtros

**Como** usuario autenticado o visitante

**quiero** buscar publicaciones por texto libre y aplicar filtros (estilo, técnica, tipo de
contenido, distancia)

**para** encontrar inspiración específica de forma rápida.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-03.1: Ingresar un término de búsqueda actualiza los resultados según coincidencias.
- AC-03.2: Aplicar un filtro (estilo, técnica, tipo de contenido, distancia) actualiza resultados sin
  recargar la página ni requerir un botón adicional (salvo texto libre, que puede requerir Enter).
- AC-03.3: Cada filtro activo se muestra como chip removible individualmente.
- AC-03.4: La resolución de búsqueda/filtros ocurre siempre contra la API, nunca filtrando en
  memoria del cliente listas ya cargadas.
- AC-03.5: Los resultados extensos se cargan mediante paginación o scroll infinito.
- AC-03.6: Una búsqueda sin resultados muestra un estado vacío con mensaje claro y sugerencia de
  acción.
- AC-03.7: Si la geolocalización no está activada, el filtro de distancia aparece deshabilitado con
  mensaje explicativo.
- AC-03.8: Mientras los resultados no llegan, se muestran skeletons/placeholders.

---

### HU-04 — Login e inicio de sesión

**Como** visitante

**quiero** iniciar sesión con mi cuenta (mail/contraseña, Google o GitHub)

**para** acceder a las funcionalidades del usuario autenticado.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-04.1: La pantalla de login ofrece tres opciones: mail/contraseña, Google y GitHub.
- AC-04.2: El envío se bloquea en cliente si hay campos incompletos o mail con formato inválido.
- AC-04.3: Ante credenciales incorrectas se muestra un error genérico, sin indicar el campo fallido.
- AC-04.4: El frontend maneja el callback de retorno de Google/GitHub y establece la sesión.
- AC-04.5: Tras login exitoso, se redirige al destino previo protegido o al home si no había uno.
- AC-04.6: El token de sesión se almacena de forma segura y se incluye automáticamente en llamadas
  a la API.
- AC-04.7: El botón de submit permanece deshabilitado mientras la operación está en curso.
- AC-04.8: Un usuario ya autenticado que accede a login es redirigido al home.

---

### HU-05 — Registro de cuenta

**Como** visitante

**quiero** registrar una cuenta nueva

**para** poder participar en la comunidad de inspiración artística.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-05.1: El formulario solicita nombre, apellido, mail, contraseña y confirmación de contraseña.
- AC-05.2: Se indica en tiempo real si la contraseña cumple los criterios mínimos definidos por el
  backend.
- AC-05.3: Si el mail ya está registrado, se muestra el error sin revelar información innecesaria.
- AC-05.4: Un registro exitoso inicia el flujo de cuestionario de onboarding.
- AC-05.5: El registro por Google o GitHub crea la cuenta y autentica en un solo paso.

---

### HU-06 — Editar datos de perfil

**Como** usuario autenticado

**quiero** actualizar mi información de perfil (nombre, apellido, bio, foto, etc.) sin tocar mi
contraseña

**para** mantener mi identidad actualizada en la plataforma.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-06.1: Permite modificar nombre, apellido, bio/descripción y foto de perfil.
- AC-06.2: No incluye campo de contraseña; ofrece un enlace "Cambiar contraseña" a un flujo separado.
- AC-06.3: El envío se bloquea en cliente si faltan campos obligatorios.
- AC-06.4: Tras guardado exitoso, el perfil visible se actualiza sin recargar la página.
- AC-06.5: Se advierte al usuario antes de abandonar la pantalla si hay cambios sin guardar.
- AC-06.6: Se muestra previsualización de una nueva foto de perfil antes de confirmar la subida.

---

### HU-07 — Reportar una publicación ajena

**Como** usuario autenticado

**quiero** reportar una publicación que considero inapropiada

**para** alertar a los moderadores de contenido que viola las normas de la comunidad.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-07.1: El botón "Reportar" está disponible en publicaciones que no son propias.
- AC-07.2: El botón "Reportar" no está habilitado en publicaciones propias.
- AC-07.3: Al hacer clic se abre un modal/drawer con motivos de reporte provistos por el backend.
- AC-07.4: El envío se bloquea hasta seleccionar un motivo.
- AC-07.5: Tras un reporte exitoso se muestra confirmación no bloqueante y el modal se cierra.
- AC-07.6: Si el usuario ya reportó esa publicación, el botón aparece deshabilitado o indica "Ya
  reportaste esto" (estado de reporte propio del usuario, no estado global).
- AC-07.7: El frontend no muestra al usuario el resultado del proceso de moderación posterior.

---

### HU-08 — Seguir a otra persona

**Como** usuario autenticado

**quiero** seguir el perfil de otro usuario

**para** ver su contenido de forma prioritaria en mi feed.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-08.1: El botón "Seguir"/"Siguiendo" refleja el estado actual de la relación en el perfil ajeno.
- AC-08.2: Al hacer clic en "Siguiendo" se solicita confirmación antes de dejar de seguir.
- AC-08.3: Seguir se aplica de forma optimista, actualizando el conteo de seguidores de inmediato.
- AC-08.4: Si la acción falla en la API, el estado se revierte y se muestra un error no bloqueante.
- AC-08.5: El botón "Seguir" no se muestra en el perfil propio.

---

### HU-09 — Crear carpetas de posts guardados

**Como** usuario autenticado

**quiero** organizar los posts que me gustan en carpetas temáticas

**para** volver a encontrarlos fácilmente y curar mis inspiraciones.

**Prioridad:** Baja

**Criterios de aceptación:**
- AC-09.1: Se puede crear una carpeta indicando un nombre.
- AC-09.2: Al guardar una publicación se puede elegir una carpeta existente o crear una nueva en el
  mismo flujo.
- AC-09.3: Cada carpeta muestra su nombre y cantidad de posts que contiene.
- AC-09.4: Al eliminar una carpeta se advierte que el contenido guardado se perderá (los posts
  originales no se eliminan de la plataforma).
- AC-09.5: Quitar un post de una carpeta no lo elimina de la plataforma.
- AC-09.6: Hasta 100 carpetas (límite máximo) la interfaz no se degrada (scroll/paginación); al
  alcanzar el límite se impide crear una carpeta adicional.
- AC-09.7: Las carpetas de cualquier usuario son visibles públicamente (nombre y cantidad de posts)
  para cualquier visitante o usuario autenticado que visite ese perfil.

---

### HU-10 — Acceso seguro al módulo administrativo

**Como** administrador

**quiero** iniciar sesión en el módulo de administración con mis credenciales

**para** acceder a las herramientas de gestión y moderación de la plataforma.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-10.1: Un usuario con rol ADMIN y credenciales válidas obtiene acceso al módulo administrativo.
- AC-10.2: Un usuario con rol USER (no ADMIN) que intenta ingresar es rechazado, informando que no
  tiene permisos.
- AC-10.3: Credenciales inválidas muestran un error de autenticación sin revelar si el usuario existe.
- AC-10.4: Si la sesión del administrador expira o se invalida, se exige reautenticación antes de
  permitir nuevas acciones administrativas.

---

### HU-11 — Moderación de publicaciones y reportes

**Como** administrador

**quiero** revisar publicaciones reportadas, consultar el detalle de cada reporte y, cuando
corresponda, eliminar la publicación reportada

**para** mantener la calidad y seguridad de la plataforma.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-11.1: El listado de publicaciones en estado REPORTADA se muestra paginado.
- AC-11.2: Se pueden aplicar filtros (por ejemplo, motivo o estado), resueltos vía API.
- AC-11.3: El detalle de un reporte muestra motivo, fecha, publicación asociada y reportante.
- AC-11.4: Eliminar una publicación reportada requiere confirmación explícita.
- AC-11.5: Al confirmar la eliminación, la publicación pasa a estado ELIMINADA y la acción se
  distingue visualmente como sensible.
- AC-11.6: Un reporte puede marcarse como "resuelto sin eliminar" mediante una acción explícita, sin
  eliminar la publicación (cambia el estado del **reporte**, no de la publicación).

---

### HU-12 — Gestión de usuarios

**Como** administrador

**quiero** buscar usuarios y aplicar acciones administrativas sobre ellos: banear, eliminar o
promover a administrador

**para** mantener el orden y la seguridad de la comunidad.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-12.1: La búsqueda de usuarios se resuelve vía API con resultados paginados.
- AC-12.2: La acción "banear" requiere confirmación explícita antes de aplicarse.
- AC-12.3: La acción "eliminar" requiere confirmación explícita antes de aplicarse.
- AC-12.4: La acción "promover a administrador" requiere confirmación explícita; al confirmarse, el
  usuario pasa a rol ADMIN. Solo puede ejecutarla quien ya tiene rol ADMIN.
- AC-12.5: Banear y eliminar están deshabilitadas cuando el usuario objetivo tiene rol ADMIN,
  incluido el propio administrador autenticado (solo aplican sobre usuarios con rol USER).
- AC-12.6: Promover a un usuario que ya es ADMIN se rechaza como operación inválida (no-op).
- AC-12.7: Las acciones banear/eliminar/promover se diferencian visualmente de las acciones de solo
  consulta (color/iconografía distintiva).

---

### HU-13 — Dashboard administrativo

**Como** administrador

**quiero** ver, al ingresar al módulo, un resumen general del estado de la plataforma

**para** priorizar mi trabajo del día.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-13.1: Muestra cantidad de reportes pendientes.
- AC-13.2: Muestra cantidad de usuarios activos (`estadoCuenta = ACTIVO`, sin considerar actividad
  reciente ni ventana de tiempo).
- AC-13.3: Muestra cantidad de desafíos propuestos pendientes de revisión.
- AC-13.4: Muestra indicadores generales adicionales: total de publicaciones activas, total de
  publicaciones eliminadas (histórico), total de usuarios baneados y total de desafíos
  aprobados/rechazados (histórico).
- AC-13.5: Todos los datos provienen ya agregados del backend; no se recalculan en el cliente.

---

### HU-14 — Gestión de desafíos propuestos

**Como** administrador

**quiero** revisar los desafíos propuestos por los usuarios y decidir si se aprueban o rechazan

**para** mantener actualizada y curada la oferta de desafíos de la plataforma.

**Prioridad:** Baja

**Criterios de aceptación:**
- AC-14.1: El listado muestra los desafíos propuestos en estado PENDIENTE.
- AC-14.2: El detalle muestra la información completa del formulario de propuesta.
- AC-14.3: La acción "aprobar" cambia el estado del desafío a APROBADO.
- AC-14.4: La acción "rechazar" cambia el estado del desafío a RECHAZADO.
- AC-14.5: Un desafío APROBADO o RECHAZADO no puede revertirse ni reconsiderarse; las acciones
  aprobar/rechazar quedan deshabilitadas de forma permanente para ese desafío.

---

### HU-15 — Reportes y analíticas exportables

**Como** administrador

**quiero** visualizar reportes y analíticas de la plataforma y poder iniciar su exportación

**para** descargarlos y compartirlos con el equipo administrativo.

**Prioridad:** Baja

**Criterios de aceptación:**
- AC-15.1: La pantalla muestra los datos agregados provistos por el backend.
- AC-15.2: Solicitar una exportación es una operación **síncrona**: la solicitud espera hasta que el
  archivo esté generado y la respuesta entrega directamente el resultado disponible para descarga.
- AC-15.3: Si la exportación tiene éxito, se ofrece un enlace o acción clara para descargar el
  archivo generado.
- AC-15.4: Si el backend falla al generar el archivo, se muestra el mensaje **"Error: Reporte no
  generado."**

---

## 3. Requisitos Funcionales

> Numeración única y continua RF-01 en adelante, integrando Usuario (FR-001–FR-049) y Admin
> (FR-001–FR-029) del documento original. Se fusionan los requisitos generales de confirmación
> explícita y de resolución vía API cuando son equivalentes a requisitos ya más específicos,
> evitando listas duplicadas (el detalle de esa fusión se explicita entre paréntesis).

### Autenticación, sesión y roles

- **RF-01**: El sistema DEBE soportar los tres proveedores de autenticación (mail/contraseña, Google
  y GitHub) tanto para login como para registro del usuario final.
- **RF-02**: El formulario de login de usuario DEBE validar en cliente que mail y contraseña estén
  completos y que el mail tenga formato válido antes de enviar la solicitud.
- **RF-03**: El sistema DEBE mostrar un mensaje de error genérico ante credenciales incorrectas, sin
  revelar cuál campo específico fue incorrecto (aplica tanto a login de usuario como de
  administrador).
- **RF-04**: El sistema DEBE deshabilitar el botón de submit del login mientras la operación está en
  progreso, para evitar envíos duplicados.
- **RF-05**: El sistema DEBE redirigir a un usuario ya autenticado que acceda a la pantalla de login
  hacia el home.
- **RF-06**: El token de sesión DEBE almacenarse de forma segura e incluirse automáticamente en todas
  las llamadas HTTP hacia la API.
- **RF-07**: El formulario de registro DEBE solicitar nombre, apellido, mail, contraseña y
  confirmación de contraseña, indicando en tiempo real si la contraseña cumple los criterios
  mínimos de seguridad definidos por el backend.
- **RF-08**: El sistema DEBE mostrar un error claro, sin revelar información innecesaria, cuando el
  mail ingresado en el registro ya esté registrado.
- **RF-09**: El sistema DEBE iniciar el flujo de cuestionario de onboarding inmediatamente después de
  un registro exitoso.
- **RF-10**: El registro mediante Google o GitHub DEBE crear la cuenta y autenticar al usuario en un
  solo paso.
- **RF-11**: El sistema DEBE permitir a un usuario iniciar sesión en el módulo administrativo
  mediante un formulario de login de administrador.
- **RF-12**: El sistema DEBE permitir el acceso al módulo administrativo únicamente a usuarios con
  rol ADMIN; cualquier otro rol DEBE ser rechazado con un mensaje claro.
- **RF-13**: El sistema DEBE derivar a un usuario no autenticado al login cuando intente dar like,
  publicar, reportar, seguir o guardar contenido, conservando el destino original para volver tras
  autenticarse.
- **RF-14**: El sistema DEBE restringir todas las acciones de administración y moderación a usuarios
  autenticados con rol ADMIN y sesión válida; si dicha sesión expira, se exige reautenticación antes
  de ejecutar nuevas acciones.
- **RF-15**: El frontend de usuario NUNCA DEBE operar con el rol ADMIN ni mostrar pantallas o
  acciones de moderación/administración.

### Perfil de usuario

- **RF-16**: La edición de perfil NO DEBE incluir el campo de contraseña; en su lugar DEBE ofrecer un
  enlace hacia un flujo separado de cambio de contraseña con verificación.
- **RF-17**: El formulario de edición de perfil DEBE validar en cliente los campos requeridos antes de
  permitir el envío.
- **RF-18**: El sistema DEBE actualizar el perfil visible inmediatamente tras un guardado exitoso, sin
  requerir recarga de página.
- **RF-19**: El sistema DEBE advertir al usuario antes de abandonar la pantalla de edición de perfil
  si existen cambios sin guardar.
- **RF-20**: El sistema DEBE previsualizar una nueva foto de perfil antes de confirmar su subida.

### Publicaciones y contenido

- **RF-21**: El formulario de publicación DEBE soportar los tipos de contenido IMAGEN, VIDEO, MUSICA
  y TUTORIAL, determinados por el archivo adjunto o seleccionables por el usuario.
- **RF-22**: El sistema DEBE permitir agregar tags exclusivamente desde un vocabulario controlado
  provisto por el backend, mediante autocompletado; cada tag se muestra como chip removible
  individualmente, hasta un máximo de 10 tags por publicación.
- **RF-23**: El sistema DEBE bloquear el envío del formulario de publicación si no hay al menos un
  archivo adjunto.
- **RF-24**: El sistema DEBE validar en cliente únicamente el tipo (extensión/MIME) del archivo
  adjunto según el tipo de contenido seleccionado; la validación del tamaño máximo del archivo es
  responsabilidad exclusiva del backend.
- **RF-25**: El sistema DEBE mostrar feedback visual (barra de progreso o spinner) mientras un archivo
  de publicación se está subiendo.
- **RF-26**: El sistema DEBE mostrar un estado de carga durante el envío de una publicación sin
  bloquear el resto de la interfaz (objetivo: ≤ 5 segundos).
- **RF-27**: El sistema DEBE mostrar la publicación recién creada en el perfil del usuario sin
  requerir recarga de página.
- **RF-28**: El sistema DEBE conservar los datos ingresados en el formulario de publicación cuando el
  envío falla, mostrando un mensaje de error descriptivo.
- **RF-29**: El sistema DEBE representar el estado de una publicación únicamente como uno de los
  siguientes valores: ACTIVA, REPORTADA o ELIMINADA.

### Interacciones (like, reportar, seguir)

- **RF-30**: El sistema DEBE mostrar el estado de like (activo/inactivo) de cada publicación de forma
  inmediata mediante actualización optimista, sin esperar la respuesta de la API.
- **RF-31**: El sistema DEBE revertir el estado de like y mostrar un error no bloqueante si la llamada
  a la API de like falla.
- **RF-32**: El sistema DEBE impedir que un usuario dé like a su propia publicación, deshabilitando el
  botón correspondiente.
- **RF-33**: El botón "Reportar" DEBE ocultarse o deshabilitarse en las publicaciones propias del
  usuario autenticado.
- **RF-34**: El sistema DEBE requerir la selección de un motivo de reporte (provisto por el backend)
  antes de permitir el envío del reporte.
- **RF-35**: El sistema DEBE deshabilitar el botón "Reportar" (o indicar "Ya reportaste esto") cuando
  el usuario ya haya reportado esa publicación, consultando el estado de reporte propio del usuario
  (no el estado global de reportes de la publicación).
- **RF-36**: El sistema DEBE mostrar confirmación no bloqueante tras un reporte enviado exitosamente,
  sin exponer al usuario el resultado del proceso de moderación.
- **RF-37**: El botón "Seguir"/"Siguiendo" NO DEBE aparecer en el perfil propio del usuario
  autenticado.
- **RF-38**: El sistema DEBE solicitar confirmación antes de ejecutar la acción de dejar de seguir a
  otro usuario.
- **RF-39**: El sistema DEBE actualizar de forma optimista el conteo de seguidores al seguir/dejar de
  seguir, revirtiendo el estado y mostrando un error no bloqueante si la operación falla en la API.

### Búsqueda, descubrimiento y rendimiento de listados

- **RF-40**: La pantalla Descubrir DEBE ofrecer búsqueda por texto libre y filtros de estilo, técnica,
  tipo de contenido y distancia, resueltos siempre contra la API (nunca filtrando en memoria del
  cliente listas ya cargadas).
- **RF-41**: El sistema DEBE actualizar los resultados de búsqueda al aplicar o quitar un filtro, sin
  recargar la página y sin requerir una acción adicional de "Buscar" (excepto para texto libre, que
  puede requerir confirmación con Enter).
- **RF-42**: El sistema DEBE mostrar cada filtro activo como chip removible individualmente.
- **RF-43**: El sistema DEBE implementar paginación o scroll infinito tanto en los resultados de
  búsqueda como en el feed de home, sin traer nunca la lista completa al cliente.
- **RF-44**: El sistema DEBE mostrar un estado vacío con mensaje claro y sugerencia de acción cuando
  una búsqueda no arroje resultados.
- **RF-45**: El sistema DEBE deshabilitar el filtro de distancia, mostrando un mensaje explicativo,
  cuando el usuario no haya activado la geolocalización.
- **RF-46**: El sistema DEBE mostrar skeletons o placeholders mientras se cargan resultados de
  búsqueda o el feed, evitando pantallas en blanco.
- **RF-47**: Las imágenes y medios DEBEN cargarse con lazy loading para no bloquear el render inicial
  de la interfaz.

### Carpetas de posts guardados

- **RF-48**: El sistema DEBE permitir crear, renombrar y eliminar carpetas de posts guardados desde el
  perfil, indicando al menos un nombre al crearlas.
- **RF-49**: Al guardar un post, el sistema DEBE permitir seleccionar una carpeta existente o crear
  una nueva en el mismo flujo, sin salir de la publicación.
- **RF-50**: El sistema DEBE advertir que el contenido guardado se perderá al eliminar una carpeta,
  aclarando que los posts originales no se eliminan de la plataforma.
- **RF-51**: El sistema DEBE permitir quitar un post de una carpeta sin eliminarlo de la plataforma.
- **RF-52**: La lista de carpetas del usuario DEBE soportar hasta un máximo de 100 carpetas sin
  degradar la interfaz, usando scroll o paginación si es necesario; el sistema DEBE impedir la
  creación de una nueva carpeta al alcanzar dicho límite.
- **RF-53**: Las carpetas de posts guardados de un usuario DEBEN ser visibles públicamente en su
  perfil, mostrando nombre y cantidad de posts, para cualquier visitante o usuario autenticado.

### Dashboard administrativo

- **RF-54**: El sistema DEBE mostrar un dashboard con: cantidad de reportes pendientes, cantidad de
  usuarios activos (`estadoCuenta = ACTIVO`), cantidad de desafíos propuestos pendientes de
  revisión, y los indicadores generales adicionales: total de publicaciones activas, total de
  publicaciones eliminadas (histórico), total de usuarios baneados y total de desafíos
  aprobados/rechazados (histórico).
- **RF-55**: Los datos del dashboard DEBEN provenir de datos ya agregados por el backend, sin
  recalcularse en el cliente.

### Gestión de usuarios (administración)

- **RF-56**: El sistema DEBE permitir buscar usuarios mediante criterios de búsqueda resueltos contra
  la API, con resultados paginados.
- **RF-57**: El sistema DEBE permitir banear a un usuario **con rol USER**, requiriendo confirmación
  explícita antes de ejecutar la acción; esta acción DEBE estar deshabilitada cuando el usuario
  objetivo tiene rol ADMIN o coincide con el propio administrador autenticado.
- **RF-58**: El sistema DEBE permitir eliminar a un usuario **con rol USER**, requiriendo confirmación
  explícita antes de ejecutar la acción; esta acción DEBE estar deshabilitada cuando el usuario
  objetivo tiene rol ADMIN o coincide con el propio administrador autenticado.
- **RF-59**: El sistema DEBE permitir promover a un usuario a rol ADMIN, disponible únicamente para
  quienes ya tienen rol ADMIN, requiriendo confirmación explícita. Si el usuario objetivo ya tiene
  rol ADMIN, la acción DEBE rechazarse como operación inválida (no-op).
- **RF-60**: El sistema DEBE diferenciar visualmente las acciones sensibles (eliminar, banear,
  promover a administrador) de las acciones de solo consulta/lectura en toda la interfaz
  administrativa.

### Moderación de publicaciones y reportes

- **RF-61**: El sistema DEBE mostrar el listado de publicaciones en estado REPORTADA, con paginación y
  filtros resueltos contra la API.
- **RF-62**: El sistema DEBE permitir visualizar el detalle de un reporte sobre una publicación
  (motivo, publicación asociada, y demás datos provistos por el backend).
- **RF-63**: El sistema DEBE permitir eliminar una publicación reportada, requiriendo confirmación
  explícita antes de ejecutar la acción, y reflejando el cambio de estado a ELIMINADA.
- **RF-64**: El sistema DEBE permitir marcar un reporte como "resuelto sin eliminar la publicación",
  como acción alternativa a eliminar la publicación reportada, cambiando el estado del **reporte**
  (no el de la publicación) a un estado de cierre.
- **RF-65**: El sistema DEBE mostrar indicadores de prioridad y/o antigüedad en los listados de
  reportes pendientes, para facilitar su identificación y resolución rápida.

### Desafíos propuestos (administración)

- **RF-66**: El sistema DEBE mostrar el listado de desafíos propuestos por los usuarios, permitiendo
  identificar los que están en estado PENDIENTE.
- **RF-67**: El sistema DEBE permitir visualizar el detalle de un desafío propuesto, incluyendo la
  información del formulario de propuesta.
- **RF-68**: El sistema DEBE permitir aprobar un desafío propuesto, cambiando su estado a APROBADO.
  Esta decisión es final: un desafío APROBADO no puede revertirse ni reconsiderarse.
- **RF-69**: El sistema DEBE permitir rechazar un desafío propuesto, cambiando su estado a RECHAZADO.
  Esta decisión es final: un desafío RECHAZADO no puede revertirse ni reconsiderarse.
- **RF-70**: El sistema DEBE representar el estado de un desafío propuesto únicamente como uno de los
  siguientes valores: PENDIENTE, APROBADO o RECHAZADO.

### Reportes y analíticas exportables

- **RF-71**: El sistema DEBE permitir visualizar reportes y analíticas de la plataforma con datos ya
  agregados por el backend.
- **RF-72**: El sistema DEBE permitir iniciar la exportación de un reporte desde la interfaz
  administrativa, de forma **síncrona**: la solicitud espera hasta que el archivo esté generado y la
  respuesta entrega directamente el resultado disponible para descarga.
- **RF-73**: El sistema DEBE permitir descargar un reporte exportado una vez que está disponible.
- **RF-74**: El sistema DEBE mostrar el mensaje **"Error: Reporte no generado."** si el backend falla
  al generar el archivo de exportación.

### Cancelación de acciones sensibles por expiración de sesión

- **RF-75**: El sistema DEBE cancelar cualquier acción administrativa sensible en curso (eliminar,
  banear, promover) si la sesión del administrador expira durante su ejecución, descartando la
  confirmación pendiente y redirigiendo al login con un mensaje explícito de que la acción no fue
  aplicada.

---

## 4. Requisitos No Funcionales

> Numeración única y continua RNF-01 en adelante. Se sintetizan a partir de los Success Criteria y
> reglas transversales presentes en ambos specify originales (ninguno tenía una sección "RNF"
> explícita numerada); se fusionan los enunciados equivalentes de performance/escalabilidad de
> ambos módulos.

- **RNF-01** (Performance — interacción): Un like/quitar-like debe reflejarse en pantalla en menos de
  200 ms mediante actualización optimista, independientemente de la latencia real de la API.
- **RNF-02** (Performance — publicación): Completar la publicación de contenido (adjuntar archivo,
  agregar al menos un tag y confirmar) debe poder realizarse en menos de 60 segundos de interacción,
  sin contar el tiempo de subida del archivo; la respuesta de creación debe percibirse en ≤ 5 s.
- **RNF-03** (Performance — búsqueda): Los primeros resultados de una búsqueda con filtros deben
  mostrarse en menos de 2 segundos desde que el usuario confirma la búsqueda o cambia un filtro.
- **RNF-04** (Performance — acceso administrativo): Un administrador debe poder iniciar sesión y
  llegar al dashboard en menos de 10 segundos en condiciones normales de red.
- **RNF-05** (Escalabilidad de listados): Los listados de usuarios, publicaciones (búsqueda/feed/
  reportadas) y reportes DEBEN resolver paginación y filtrado exclusivamente contra la API, sin
  cargar el conjunto completo de datos para filtrar o paginar en el cliente, manteniendo tiempos de
  respuesta consistentes independientemente del volumen total de datos.
- **RNF-06** (Seguridad): Todas las acciones que requieren identidad (interacciones de usuario y
  todas las acciones administrativas) DEBEN estar respaldadas por verificación de sesión y rol en el
  backend/API; el frontend no debe ser el único mecanismo de control de acceso — ocultar una acción
  en la interfaz no reemplaza la autorización del backend.
- **RNF-07** (Usabilidad — confirmación de acciones destructivas): El 100% de las acciones
  destructivas o administrativas sensibles (eliminar publicación, eliminar usuario, banear usuario,
  promover a administrador) ejecutadas en pruebas DEBEN requerir y registrar una confirmación
  explícita antes de aplicarse.
- **RNF-08** (Usabilidad — distinción visual): Un administrador debe poder distinguir visualmente,
  sin leer el texto completo del botón/acción, cuáles acciones son sensibles (destructivas) y cuáles
  son de solo consulta, en el 100% de las pantallas del módulo administrativo.
- **RNF-09** (Usabilidad — reglas de visibilidad de usuario): Ningún usuario puede completar una
  acción de like, reporte o seguimiento sobre su propio contenido o perfil propio; esto se verifica
  en el 100% de los casos mediante tests automatizados de las reglas de visibilidad/habilitación
  correspondientes.
- **RNF-10** (No bloqueo de interfaz): La interfaz de resultados de búsqueda, del feed de home y de
  cualquier operación de red NUNCA debe quedar bloqueada esperando datos del backend: el 100% de los
  estados de espera deben mostrar un indicador de carga (skeleton, spinner o equivalente).
- **RNF-11** (Escalabilidad de carpetas): La lista de carpetas de un usuario con hasta 100 carpetas
  (límite máximo) DEBE renderizarse sin degradación perceptible (sin bloqueos de interacción) en el
  perfil.
- **RNF-12** (Control de acceso por rol): Un usuario sin rol ADMIN que intenta acceder al módulo
  administrativo DEBE ser rechazado en el 100% de los casos probados.
- **RNF-13** (Eficiencia operativa de moderación): Un administrador debe poder localizar y abrir el
  detalle de un reporte pendiente específico en menos de 3 interacciones (por ejemplo: abrir
  listado, aplicar filtro, seleccionar reporte).
- **RNF-14** (Testabilidad): El 100% de las reglas de negocio identificadas como críticas (control de
  rol para moderación, restricción de promoción a administrador solo para administradores,
  confirmación obligatoria en acciones destructivas, reglas de visibilidad de acciones de usuario)
  DEBEN contar con tests automatizados que las verifiquen.
- **RNF-15** (Separación de capas): El frontend DEBE mantener separación entre presentación,
  dominio/modelos de UI, aplicación/servicios e infraestructura; los componentes de presentación NO
  DEBEN invocar directamente la API (fetch/axios), sino a través de la capa de servicios.
- **RNF-16** (Accesibilidad de estados vacíos y de error): Toda pantalla con listados (búsqueda,
  reportes, usuarios, desafíos) DEBE contemplar explícitamente un estado vacío y un estado de error,
  nunca una pantalla en blanco sin explicación.

---

## 5. Casos Borde

> Numeración única y continua CB-01 en adelante. Se integran los casos borde ya resueltos (con
> comportamiento definido) de ambos specify. Las preguntas de Admin que quedaron **sin resolver** en
> el documento original se trasladan a la sección de Ambigüedades (8), no aquí, para no inventar una
> solución no definida.

- **CB-01**: El usuario pierde conexión a internet mientras sube una publicación. El frontend debe
  detectar el error de red, mostrar un mensaje claro y permitir reintentar sin perder los datos ya
  ingresados en el formulario.
- **CB-02**: El usuario da like y quita like en rápida sucesión antes de que la API responda. El
  frontend debe serializar o debounce las llamadas para evitar estados inconsistentes entre el
  contador visible y el estado real.
- **CB-03**: El usuario intenta guardar un post en una carpeta mientras la lista de carpetas aún está
  cargando. Debe mostrarse un estado de carga y no permitirse la acción hasta que la lista de
  carpetas esté disponible.
- **CB-04**: La búsqueda devuelve un resultado vacío por filtros muy restrictivos. La pantalla no
  debe quedar en blanco: debe mostrar un mensaje de estado vacío con opción de limpiar filtros.
- **CB-05**: El usuario llega al final del scroll infinito y no hay más resultados. Debe mostrarse un
  indicador de "fin de resultados", nunca un spinner infinito.
- **CB-06**: El token de sesión expira mientras el usuario navega (usuario o administrador). Al
  intentar cualquier acción protegida, el frontend debe redirigir al login y conservar el destino
  original para volver tras autenticarse.
- **CB-07**: El usuario intenta seguir a alguien y la API devuelve un error (por ejemplo, límite de
  seguidos alcanzado). El botón debe revertirse a su estado anterior y mostrarse el mensaje de error
  específico que provea la API.
- **CB-08**: El usuario edita su perfil e intenta subir una imagen que supera el tamaño máximo
  permitido por el backend. El frontend debe mostrar el mensaje de error específico devuelto por la
  API (la validación de tamaño no ocurre en cliente), sin perder los demás datos ya ingresados en el
  formulario.
- **CB-09**: El usuario abre el formulario de publicación, completa datos, y cierra la pestaña o
  navega fuera. El navegador/aplicación debe advertir sobre cambios no guardados.
- **CB-10**: El filtro de distancia está activo y el usuario revoca el permiso de geolocalización
  desde el navegador durante la sesión. El filtro debe deshabilitarse automáticamente y avisar al
  usuario del cambio.
- **CB-11**: Un administrador intenta banear o eliminar a **otro administrador** o a **sí mismo**. La
  acción está prohibida: se deshabilita en la UI y se rechaza en el backend. Banear/eliminar solo
  aplica sobre usuarios con rol USER.
- **CB-12**: Un administrador intenta promover a un usuario que ya tiene rol ADMIN. La acción se
  rechaza como operación inválida (no-op).
- **CB-13**: La sesión del administrador expira mientras está completando una acción sensible (por
  ejemplo, a mitad de confirmar una eliminación). El sistema cancela la acción en curso, descarta
  cualquier confirmación pendiente y redirige al login, informando explícitamente que la acción no
  fue aplicada.
- **CB-14**: La exportación de un reporte falla en el backend. El sistema muestra el mensaje "Error:
  Reporte no generado."
- **CB-15**: Un desafío ya está en estado APROBADO o RECHAZADO y el administrador lo visualiza. Las
  acciones aprobar/rechazar no están disponibles y se muestran deshabilitadas de forma permanente.

---

## 6. Estados y Reglas de Negocio

### Publicaciones (`EstadoPublicacion`)

| Estado | Significado | Acciones permitidas por actor |
| --- | --- | --- |
| **ACTIVA** | Publicación visible normalmente en el sistema. | Visitante/USER: ver, dar like (si no es autor), reportar (si no es autor), guardar en carpeta, comentar según alcance de interacción definido. Autor: editar/eliminar. ADMIN: moderar (ver detalle si fue reportada), eliminar. |
| **REPORTADA** | Publicación con al menos un reporte pendiente de revisión administrativa. | ADMIN: revisar detalle del/los reporte(s), eliminar la publicación o marcar el reporte como "resuelto sin eliminar". USER/Visitante: el comportamiento exacto de interacción (like, nuevos reportes) sobre una publicación ya REPORTADA no está definido — ver **A9**. |
| **ELIMINADA** | Publicación eliminada por moderación administrativa. | Deja de listarse como contenido activo. No se especifica si sigue siendo accesible para el autor original o si desaparece por completo — no definido en los specify originales. |

### Desafíos propuestos (`EstadoDesafioPropuesto`)

| Estado | Significado | Acciones permitidas por actor |
| --- | --- | --- |
| **PENDIENTE** | Propuesta enviada por un usuario, en espera de revisión. | USER: proponer (crear en este estado). ADMIN: revisar detalle, aprobar o rechazar. |
| **APROBADO** | Propuesta aceptada por un administrador. | Estado final: ninguna acción de aprobar/rechazar puede volver a aplicarse. |
| **RECHAZADO** | Propuesta rechazada por un administrador. | Estado final: ninguna acción de aprobar/rechazar puede volver a aplicarse. |

### Reportes (estado de cierre)

Los specify originales establecen que un **reporte** puede cerrarse mediante la acción "resuelto sin
eliminar la publicación" (cambia el estado del reporte, no el de la publicación). El nombre exacto
del enum/valor de dicho estado de cierre no está definido en ninguno de los dos documentos
originales — ver **A2**.

### Roles (`RolUsuario`)

| Rol | Significado | Alcance |
| --- | --- | --- |
| **USER** | Usuario final registrado. | Frontend de usuario: publicar, interactuar, buscar, seguir, guardar, proponer desafíos. Sin acceso al módulo administrativo. |
| **ADMIN** | Administrador/moderador. | Frontend de administración: dashboard, moderación, gestión de usuarios/desafíos, reportes/analíticas. Solo un ADMIN puede promover a otro usuario a ADMIN. |

### Estado de cuenta de usuario

Los specify originales mencionan `estadoCuenta = ACTIVO` (para el indicador de "usuarios activos" del
dashboard) y las acciones "banear" y "eliminar" sobre una cuenta, lo que implica al menos los
estados **ACTIVO**, **BANEADO** y **ELIMINADO**, pero ninguno de los dos documentos define un enum
explícito con ese nombre ni el comportamiento funcional detallado de una cuenta baneada/eliminada
desde la perspectiva del frontend — ver **A10**.

---

## 7. Permisos por Rol

| Funcionalidad | Visitante | USER | ADMIN |
| --- | --- | --- | --- |
| Ver contenido público / descubrir | Sí | Sí | Sí |
| Crear publicaciones | No (debe autenticarse) | Sí | Ambiguo — ver **A14** |
| Dar like a publicaciones ajenas | No (debe autenticarse) | Sí | Ambiguo — ver **A14** |
| Reportar publicaciones ajenas | No (debe autenticarse) | Sí | Ambiguo — ver **A14** |
| Gestionar perfil propio | No aplica | Sí | Ambiguo — ver **A14** |
| Seguir usuarios | No (debe autenticarse) | Sí | Ambiguo — ver **A14** |
| Gestionar carpetas propias | No aplica | Sí | Ambiguo — ver **A14** |
| Proponer desafíos | No (debe autenticarse) | Sí | Ambiguo — ver **A14** |
| Acceder al dashboard administrativo | No | No | Sí |
| Gestionar usuarios (banear/eliminar) | No | No | Sí, solo sobre usuarios con rol USER (nunca sobre otro ADMIN ni sobre sí mismo) |
| Moderar publicaciones (eliminar/resolver reporte) | No | No | Sí |
| Gestionar reportes | No | No | Sí |
| Gestionar desafíos (aprobar/rechazar) | No | No | Sí |
| Ver reportes/analíticas | No | No | Sí |
| Exportar/descargar reportes | No | No | Sí |
| Promover usuarios a ADMIN | No | No | Sí (solo un ADMIN puede promover; no puede promover a quien ya es ADMIN) |
| Degradar un ADMIN a USER | No | No | No especificado — ver **A13** |

---

## 8. Ambigüedades

> Tabla única, renumerada A1–A14, unificando ambigüedades/contradicciones de ambos specify
> originales. No se resuelven automáticamente. Se indica explícitamente cuando una ambigüedad de un
> documento queda cubierta de forma inequívoca por un requisito del otro.

| ID | Descripción | Impacto | Acción requerida |
| --- | --- | --- | --- |
| **A1** | Comportamiento de reportes duplicados sobre la **misma** publicación desde la perspectiva de moderación: ¿el listado de moderación muestra una fila por publicación (agregando todos sus reportes) o una fila por cada reporte individual? El specify de Admin no lo define; el de Usuario solo define el estado de reporte propio del reportante. | Afecta el diseño de la pantalla de moderación (HU-11) y del listado de reportes. | Definir en una futura clarificación si el listado agrupa por publicación o por reporte individual. |
| **A2** | Nombre y valores exactos del enum de "estado de cierre" de un reporte (acción "resuelto sin eliminar publicación"). Ninguno de los dos specify originales define el value object correspondiente. | Afecta el modelado de dominio de UI para reportes (Principio de enums/value objects). | Definir el enum de estado de reporte (por ejemplo, `PENDIENTE`/`RESUELTO_SIN_ELIMINACION`/`RESUELTO_CON_ELIMINACION`) en fase de diseño técnico. |
| **A3** | Mecanismo de cambio de contraseña: el specify de Usuario solo referencia un enlace "Cambiar contraseña" y deja el mecanismo de verificación (mail, código, etc.) para un documento separado, sin especificarlo. | Bloquea el diseño detallado de la pantalla/flujo de cambio de contraseña. | Especificar el flujo en un documento dedicado antes de planificar su implementación. |
| **A4** | Campos adicionales del perfil de usuario: el specify de Usuario asume como mínimo nombre, apellido, bio/descripción y foto, aclarando que "campos adicionales se incorporarán si el contrato de API los expone", sin definir cuáles serían. | Afecta el alcance final de la pantalla de edición de perfil. | Confirmar el listado definitivo de campos de perfil cuando se defina el contrato de API. |
| **A5** | Contrato exacto del endpoint de autocompletado de tags (vocabulario controlado): el tipo de dato "vocabulario controlado" ya está resuelto (no es texto libre), pero el contrato exacto (estructura de respuesta, paginación del autocompletado, etc.) no está definido en el specify de Usuario. | Afecta el diseño de la capa de servicios/infraestructura del formulario de publicación. | Definir el contrato del endpoint en la fase de planificación técnica. |
| **A6** | El frontend no conoce de antemano el tamaño máximo permitido por tipo de contenido (solo valida tipo/extensión en cliente); no hay forma de informar preventivamente al usuario el límite antes de intentar subir el archivo. | Puede degradar la experiencia de usuario al recibir el error recién luego de intentar subir el archivo. | Evaluar si el backend expondrá el límite máximo como metadato consumible por el frontend. |
| **A7** | ¿Puede un ADMIN eliminar o moderar una publicación cuyo autor es **otro ADMIN**? Los specify originales solo definen restricciones sobre acciones de banear/eliminar/promover **usuarios** con rol ADMIN, pero no aclaran el tratamiento de publicaciones creadas por una cuenta ADMIN. | Afecta el alcance exacto de la moderación de contenido (HU-11). | Definir explícitamente si la moderación de publicaciones distingue el rol del autor. |
| **A8** | ¿Un ADMIN puede degradar a otro ADMIN de vuelta a rol USER? Ambos specify originales solo contemplan la acción de **promover** a ADMIN; ninguno define una acción de "degradar"/revocar el rol ADMIN. | Afecta el alcance de la gestión de usuarios administrativa (HU-12) y la matriz de permisos (sección 7, fila "Degradar un ADMIN a USER"). | Definir si esta funcionalidad existe o queda explícitamente fuera de alcance. |
| **A9** | Comportamiento de interacción de usuarios sobre una publicación ya en estado REPORTADA: ¿sigue siendo visible/likeable/reportable nuevamente por otros usuarios mientras está pendiente de revisión, o se restringe alguna interacción mientras dura la revisión? Ninguno de los dos specify lo define. | Afecta las reglas de habilitación de botones de interacción (like/reportar) en publicaciones REPORTADAS. | Definir el comportamiento esperado en una futura clarificación. |
| **A10** | Comportamiento funcional detallado de una cuenta con `estadoCuenta` BANEADO o ELIMINADO desde la perspectiva del frontend: ¿puede el usuario baneado/eliminado iniciar sesión y ver algún mensaje específico? ¿su contenido publicado deja de ser visible automáticamente? Ninguno de los dos specify lo define. | Afecta el diseño de login y de la visibilidad de contenido de usuarios baneados/eliminados. | Definir el comportamiento esperado en una futura clarificación. |
| **A11** | Formato/tipo exacto del archivo exportado en reportes/analíticas (por ejemplo, extensión `.xlsx`, nombre de archivo, metadatos mostrados junto al enlace de descarga). El specify de Admin solo define que la exportación es síncrona y que ante error se muestra "Error: Reporte no generado.", sin especificar el formato del archivo resultante desde la perspectiva del frontend. | Afecta el diseño de la UI de descarga (HU-15). | Definir el formato exacto cuando se especifique el contrato de la API de exportación. |
| **A12** | Concurrencia: ¿qué sucede si dos administradores actúan simultáneamente sobre el mismo reporte o usuario (por ejemplo, uno elimina una publicación mientras otro la está revisando)? El specify de Admin deja esta pregunta explícitamente abierta, sin resolución. | Puede generar estados inconsistentes en la UI de dos sesiones administrativas simultáneas. | Definir el comportamiento esperado (por ejemplo, refrescar/mostrar error de conflicto) en una futura clarificación. |
| **A13** | ¿Qué sucede si el usuario reportado/objetivo de una acción administrativa ya no existe al momento de revisar el reporte o ejecutar la acción? El specify de Admin deja esta pregunta explícitamente abierta, sin resolución. | Afecta el manejo de errores en las pantallas de moderación y gestión de usuarios. | Definir el mensaje/comportamiento esperado en una futura clarificación. |
| **A14** | ¿Una cuenta con rol ADMIN puede además operar como usuario común en el frontend de usuario (publicar, dar like, seguir, guardar, reportar, proponer desafíos)? Ninguno de los dos specify originales lo aclara explícitamente: el specify de Usuario asume un único rol USER en su módulo, y el de Admin asume que la autenticación se reutiliza diferenciando "el acceso posterior" solo por el rol, sin precisar si el ADMIN conserva las capacidades de USER en el otro frontend. | Afecta directamente la fila "ADMIN" en la matriz de permisos de la sección 7 para todas las funcionalidades de usuario final. | Definir explícitamente si ADMIN hereda o no las capacidades de USER en el frontend de usuario. |

**Nota de resolución inequívoca**: La pregunta abierta en el specify de Admin *"¿qué sucede si se
intenta acceder directamente (por URL) a una pantalla del módulo administrativo sin haber iniciado
sesión como ADMIN?"* queda **resuelta** por **RF-12** y **RF-14** de esta especificación unificada
(el acceso al módulo administrativo se restringe a usuarios con rol ADMIN y sesión válida en todos
los casos, incluyendo acceso directo por URL); por tratarse de una resolución inequívoca, no se
incluye como ambigüedad abierta.

**Nota sobre puntos ya resueltos en los documentos originales** (no ambiguos, mencionados aquí solo
para trazabilidad frente a los puntos de atención solicitados): límite máximo de tags = 10
(resuelto); tags de vocabulario controlado, no libres (resuelto); visibilidad de carpetas = siempre
públicas (resuelto); tipos de contenido = IMAGEN, VIDEO, MUSICA, TUTORIAL (resuelto, con límite de
tamaño exclusivamente validado por backend).

---

## 9. Fuera de Alcance

Fusión de las listas "Out of Scope" / "Assumptions sobre fuera de alcance" de ambos specify
originales, eliminando únicamente duplicados:

- Implementación de la API REST del backend (Java/Spring Boot).
- Persistencia en base de datos (MySQL) y cualquier modelado de esquema de datos del lado servidor.
- Integraciones con APIs externas (por ejemplo, proveedores de letras de canciones, YouTube, Google/
  GitHub OAuth del lado servidor).
- Procesamiento de analytics, generación de rankings o cálculo del feed/recomendaciones
  (responsabilidad del backend/módulo de analytics).
- Generación física de archivos de reportes exportables (por ejemplo, Python/openpyxl-XlsxWriter);
  el frontend solo dispara la solicitud de exportación y consume el resultado ya generado.
- Envío de mails o notificaciones push (responsabilidad del backend/infraestructura).
- Pagos, multas o compra de contenido.
- El flujo de cambio de contraseña en sí mismo (solo se referencia el enlace de acceso a dicho flujo
  desde edición de perfil; el flujo se especificará por separado — ver **A3**).
- Persistencia de geolocalización en servidor; el frontend solo activa/desactiva localmente y envía
  coordenadas cuando corresponde a una consulta puntual.
- Validación del tamaño máximo de archivos subidos (responsabilidad exclusiva del backend); el
  frontend solo valida el tipo de archivo en cliente.
- Administración del vocabulario controlado de tags (alta/baja/edición de tags disponibles),
  responsabilidad del backend; el frontend solo consume dicho vocabulario vía autocompletado.
- Registro de usuarios finales, cuestionario de onboarding, home de descubrimiento de usuario,
  edición de perfil propio y participación en desafíos **dentro del frontend administrativo**
  (estas funcionalidades existen, pero exclusivamente en el frontend de usuario).
- Cualquier pantalla o funcionalidad de administración/moderación (revisión de reportes, promoción
  de administradores, borrado administrativo de contenido o usuarios) **dentro del frontend de
  usuario**.

---

## 10. Reglas de Separación de Responsabilidades

- El frontend se encarga de interfaz, validaciones de presentación, estados visuales, navegación y
  comunicación con la API; no implementa lógica de negocio de backend.
- Las llamadas a la API DEBEN pasar exclusivamente por la capa de servicios de aplicación; los
  componentes de presentación no invocan directamente fetch/axios.
- Las reglas de autorización críticas (acceso al módulo administrativo, restricciones de
  banear/eliminar/promover, verificación de sesión) DEBEN ser validadas por el backend/API; el
  frontend refleja dicho estado pero no es la fuente de verdad de la autorización.
- El frontend NO DEBE filtrar ni paginar grandes cantidades de datos en memoria cuando esa operación
  corresponda a la API (búsqueda, listados de usuarios/publicaciones/reportes/desafíos).
- Los datos agregados de analytics (dashboard, reportes/analíticas) son responsabilidad exclusiva del
  backend/módulo de analytics; el frontend únicamente los visualiza.
- La generación de archivos de reportes exportables es responsabilidad del módulo correspondiente
  (fuera de este alcance); el frontend administrativo solo inicia la solicitud y ofrece la descarga
  del resultado.
- No se implementa código como parte de esta especificación.

---

## 11. Requisitos de Calidad y Arquitectura del Frontend

- El frontend se organiza en las capas: presentación, dominio/modelos de UI, aplicación/servicios e
  infraestructura, conforme a los specify originales de Usuario y Admin.
- El dominio de UI encapsula reglas de negocio de cliente relevantes (por ejemplo: si el usuario
  actual puede editar/eliminar/likear/reportar una publicación según sea o no su autor; si una acción
  administrativa está habilitada según el rol del usuario objetivo).
- Los valores cerrados se representan mediante enums/value objects: `TipoContenido`, `RolUsuario`,
  `EstadoPublicacion`, `EstadoDesafioPropuesto`, `MotivoReporte`, `TipoFiltro`, entre otros definidos
  en los specify originales.
- Toda regla de negocio de cliente identificada como crítica DEBE contar con tests automatizados
  (según RNF-14), incluyendo como mínimo: reglas de visibilidad de like/reportar/seguir sobre
  contenido/perfil propio; restricción de acceso al módulo administrativo por rol; restricción de
  banear/eliminar/promover según el rol del usuario objetivo; confirmación obligatoria en acciones
  destructivas.
- No se agregan frameworks, librerías, patrones arquitectónicos ni tecnologías que no estén
  mencionados en los specify originales de Usuario o Admin.

---

## 12. Criterio Final de Consistencia

Verificación realizada antes de finalizar esta especificación unificada:

1. ✅ Ninguna funcionalidad del specify de Usuario desapareció (9 historias de usuario conservadas
   como HU-01 a HU-09; requisitos funcionales originales FR-001–FR-049 conservados y renumerados
   como RF-01–RF-53, con fusiones únicamente de enunciados generales redundantes).
2. ✅ Ninguna funcionalidad del specify de Admin desapareció (6 historias de usuario conservadas como
   HU-10 a HU-15; requisitos funcionales originales FR-001–FR-029 conservados y renumerados como
   RF-11–RF-75, con fusiones únicamente de enunciados generales redundantes).
3. ✅ Se eliminaron duplicaciones evidentes (por ejemplo, los enunciados generales de "confirmación
   explícita antes de acción destructiva" y "resolución vía API sin filtrar en memoria" se
   consolidaron una vez, evitando repetir la misma regla para cada pantalla).
4. ✅ Numeraciones unificadas: HU-01–HU-15, RF-01–RF-75, RNF-01–RNF-16, CB-01–CB-15, A1–A14.
5. ✅ Prioridades de cada historia mantenidas según el documento de origen.
6. ✅ Criterios de aceptación de cada historia mantenidos (renumerados como AC-XX.N).
7. ✅ Casos borde mantenidos; los que en el original de Admin eran preguntas abiertas sin resolución
   se trasladaron a Ambigüedades (A12, A13) en lugar de inventarse una solución.
8. ✅ Ambigüedades mantenidas y unificadas (A1–A14), incluyendo una contradicción/zona gris nueva
   identificada al fusionar ambos módulos (A14: alcance de un ADMIN sobre funcionalidades de USER).
9. ✅ Contradicciones detectadas y marcadas explícitamente (A7, A8, A14).
10. ✅ Verificado que USER no tiene acceso a funcionalidades ADMIN (RF-12, RF-14, RF-15; matriz de
    permisos sección 7).
11. ✅ Verificado que ADMIN puede realizar las acciones administrativas definidas en los specify
    originales (RF-54–RF-75; HU-10 a HU-15).
12. ✅ Verificado que ninguna funcionalidad de backend (persistencia, analytics, generación de
    reportes, integraciones externas) se convirtió en una funcionalidad a implementar por el
    frontend (sección 9, Fuera de Alcance; sección 10, Reglas de Separación de Responsabilidades).

**No se implementó código como parte de esta especificación.**
