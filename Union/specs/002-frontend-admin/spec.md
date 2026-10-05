# Feature Specification: Frontend Administrativo — Gestión de Usuarios, Publicaciones y Reportes

**Feature Branch**: `002-frontend-admin`

**Created**: 2026-10-01

**Status**: Draft

**Input**: Desarrollar el frontend administrativo de una red social de inspiración artística, donde
el administrador gestiona cuentas de usuario (banear, eliminar, promover a ADMIN), publicaciones de
cualquier usuario (editar, eliminar) y reportes pendientes de revisión (ver, exportar, aceptar,
rechazar). El frontend funciona únicamente como frontend; consumirá en una próxima iteración una
API REST de Java ya existente, que no se implementa en este speckit.

**Alineado con**: `Union/.specify/memory/constitution.md` (v2.0.0).

## Clarifications

### Sesión 2026-10-05

- P: ¿"Aceptar" un reporte (HU-07) requiere siempre confirmación explícita, igual que "Rechazar"?
  → R: No siempre. Solo requiere confirmación explícita cuando, además de cambiar el estado del
  reporte a `RESUELTO`, el administrador decide ejecutar una acción sensible adicional (por
  ejemplo, eliminar la publicación asociada vía HU-05). El cambio de estado del reporte por sí
  solo (sin acción adicional) no requiere confirmación.

### Sesión 2026-10-01

- P: ¿Cómo debe comportarse la exportación de reportes (HU-09) respecto a los filtros activos y a
  la navegación entre pantallas? → R: La exportación se dispara **desde la misma pantalla** de
  reportes (`/reportes`), mediante un botón "Exportar" dentro del listado, sin una pantalla
  separada; usa siempre el filtro (`FiltroReportes`) visible/activo en ese momento. No existe una
  pantalla independiente de exportación con selección propia de filtros.
- P: ¿Qué ocurre con el `EstadoPublicacion` de la publicación asociada cuando su reporte es
  rechazado (`DESESTIMADO`)? → R: La publicación vuelve automáticamente a `ACTIVA` si no tiene
  otros reportes en estado `PENDIENTE` o `EN_REVISION`; si tiene otros reportes aún pendientes de
  revisión, permanece en `REPORTADA`.
- P: ¿La restricción de que un ADMIN nunca puede ser baneado/eliminado (ni siquiera a sí mismo,
  A1) queda completamente cerrada, o falta alguna regla adicional sobre auto-acciones? → R: Queda
  completamente cerrada; no se requiere ninguna restricción adicional sobre acciones de un ADMIN
  sobre sí mismo.
- P: ¿Dónde deben ubicarse `FiltroReportes` y `ResultadoExportacion` para mantener separación de
  capas? → R: Se ubican en `src/application/dto/` (capa de aplicación), no en `src/domain/`,
  porque son objetos de transporte/caso de uso y no entidades/value objects de dominio.

---

## 1. Descripción General

### 1.1 Objetivo

Proveer al administrador una aplicación React de administración/moderación que le permita mantener
la calidad y seguridad de la comunidad mediante tres capacidades: gestión de usuarios, gestión de
publicaciones y gestión de reportes. El frontend es la única superficie cubierta por este speckit;
no incluye backend, persistencia ni frontend de usuario final.

### 1.2 Alcance

Esta especificación cubre exclusivamente el comportamiento del **frontend administrativo**
(aplicación React) y su interacción prevista con una API REST de Java que se conectará en una
iteración posterior. No se especifica, diseña ni implementa el backend, su persistencia (MySQL),
caché (Redis) ni ningún otro servicio; estas responsabilidades son externas a este documento.

### 1.3 Actores

1. **Administrador (ADMIN)**: único actor que opera el frontend administrativo. Gestiona usuarios,
   publicaciones y reportes; solo un ADMIN puede promover a otro usuario a ADMIN.
2. **Usuario (USER)**: no opera este frontend directamente, pero es el sujeto de las acciones
   administrativas (su cuenta puede ser baneada/eliminada/promovida; sus publicaciones pueden ser
   editadas/eliminadas por el administrador).
3. **Sistema (API/backend externo)**: valida permisos, estados y reglas de negocio de forma
   definitiva. Fuera de alcance de este speckit, pero el frontend asume su existencia futura.

### 1.4 Fuera de alcance (resumen)

- Implementación del backend o de cualquier función de backend, incluso para pruebas.
- Acceso directo a MySQL o a cualquier base de datos desde el frontend.
- Recomendaciones, analytics o recálculo de estadísticas/rankings en el cliente.
- Cualquier pantalla o flujo propio del frontend de usuario final (registro, publicación,
  descubrimiento, perfil propio, etc.).
- Implementación de código durante las fases de especificación, aclaración, checklist,
  planificación y generación de tareas.

---

## 2. Historias de Usuario

### HU-01 — Banear a un usuario

**Como** administrador

**quiero** banear la cuenta de un usuario por un tiempo determinado o de forma permanente

**para** impedir temporal o definitivamente que continúe interactuando en la comunidad cuando
incumple las normas.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-01.1: Desde el listado o detalle de un usuario con rol USER, el administrador puede iniciar la
  acción "Banear".
- AC-01.2: La acción "Banear" permite elegir entre baneo temporal (indicando una duración/fecha de
  fin) o baneo permanente.
- AC-01.3: La acción "Banear" requiere confirmación explícita antes de aplicarse.
- AC-01.4: Al confirmar, el estado de cuenta del usuario pasa a `BANEADO`.
- AC-01.5: La acción "Banear" está deshabilitada cuando el usuario objetivo tiene rol ADMIN,
  incluido el propio administrador autenticado; esta restricción es completa y no admite
  excepciones (resuelto **A1**, Clarifications Session 2026-10-01).
- AC-01.6: La acción "Banear" se distingue visualmente (color/iconografía) de las acciones de solo
  consulta.
- AC-01.7: Si la operación falla en el backend, se muestra un mensaje de error no bloqueante y el
  estado del usuario no cambia en la interfaz.

---

### HU-02 — Eliminar la cuenta de un usuario

**Como** administrador

**quiero** eliminar la cuenta de un usuario

**para** remover definitivamente de la plataforma a cuentas que lo ameriten.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-02.1: Desde el listado o detalle de un usuario con rol USER, el administrador puede iniciar la
  acción "Eliminar".
- AC-02.2: La acción "Eliminar" requiere confirmación explícita antes de aplicarse.
- AC-02.3: Al confirmar, el estado de cuenta del usuario pasa a `ELIMINADO`.
- AC-02.4: La acción "Eliminar" está deshabilitada cuando el usuario objetivo tiene rol ADMIN,
  incluido el propio administrador autenticado.
- AC-02.5: La acción "Eliminar" se distingue visualmente como acción sensible/destructiva.
- AC-02.6: Si la operación falla en el backend, se muestra un mensaje de error no bloqueante y el
  estado del usuario no cambia en la interfaz.

---

### HU-03 — Promover un usuario a administrador

**Como** administrador

**quiero** promover a un usuario con rol USER al rol ADMIN

**para** delegar funciones de moderación/administración en otra persona de confianza.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-03.1: Solo un usuario con rol ADMIN puede ejecutar la acción "Promover a administrador".
- AC-03.2: La acción "Promover a administrador" requiere confirmación explícita antes de aplicarse.
- AC-03.3: Al confirmar, el valor del rol (`RolUsuario`) del usuario pasa a `ADMIN`.
- AC-03.4: Intentar promover a un usuario que ya tiene rol `ADMIN` se rechaza como operación
  inválida (no-op), sin requerir llamada alguna al backend.
- AC-03.5: La acción "Promover a administrador" se distingue visualmente como acción sensible.
- AC-03.6: Si la operación falla en el backend, se muestra un mensaje de error no bloqueante y el
  rol del usuario no cambia en la interfaz.

---

### HU-04 — Editar la publicación de cualquier usuario

**Como** administrador

**quiero** editar el contenido de una publicación de cualquier usuario

**para** corregir o moderar contenido que lo requiera sin necesidad de eliminarlo por completo.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-04.1: El administrador puede abrir el formulario de edición de cualquier publicación,
  independientemente de quién sea su autor.
- AC-04.2: Guardar los cambios requiere confirmación explícita.
- AC-04.3: Tras guardar exitosamente, los cambios se reflejan en la interfaz sin recargar la
  página.
- AC-04.4: Si el guardado falla, se muestra un mensaje de error descriptivo y el formulario
  conserva los datos ya editados.
- AC-04.5: Editar una publicación no cambia por sí sola su `EstadoPublicacion` (el estado se
  gestiona de forma independiente, ver HU-05).

---

### HU-05 — Eliminar la publicación de cualquier usuario

**Como** administrador

**quiero** eliminar una publicación de cualquier usuario

**para** remover contenido que incumple las normas de la comunidad.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-05.1: El administrador puede iniciar la acción "Eliminar" sobre cualquier publicación,
  independientemente de su autor o de su `EstadoPublicacion` actual.
- AC-05.2: La acción "Eliminar" requiere confirmación explícita antes de aplicarse.
- AC-05.3: Al confirmar, el `EstadoPublicacion` pasa a `ELIMINADA`.
- AC-05.4: La acción "Eliminar" se distingue visualmente como acción sensible/destructiva, frente a
  acciones de solo consulta (ver publicación, ver detalle).
- AC-05.5: Si la operación falla en el backend, se muestra un mensaje de error no bloqueante y el
  estado de la publicación no cambia en la interfaz.

---

### HU-06 — Ver reportes pendientes de revisión

**Como** administrador

**quiero** ver un listado de los reportes pendientes de revisión, con su estado, motivo y
prioridad claramente visibles

**para** priorizar mi trabajo de moderación de forma rápida y clara.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-06.1: El listado de reportes muestra, como mínimo, estado de moderación (`EstadoModeracion`),
  motivo (`MotivoReporte`) y prioridad (`PrioridadReporte`) de cada reporte.
- AC-06.2: El listado puede filtrarse al menos por estado de moderación y por prioridad.
- AC-06.3: Los reportes en estado `PENDIENTE` se identifican visualmente de forma clara y rápida
  (por ejemplo, mediante color o posición destacada) frente a los demás estados.
- AC-06.4: El detalle de un reporte muestra, como mínimo, motivo, prioridad, estado de moderación y
  la publicación o usuario asociado.
- AC-06.5: El listado está paginado; no se requiere cargar todos los reportes en memoria para
  mostrar o filtrar resultados (la resolución final de paginación/filtrado queda delegada a la API,
  ver sección 9, Fuera de Alcance).

---

### HU-07 — Aceptar un reporte

**Como** administrador

**quiero** aceptar un reporte pendiente

**para** confirmar que el contenido o usuario reportado incumple las normas y que corresponde
tomar una acción de moderación.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-07.1: La acción "Aceptar" está disponible sobre reportes en estado `PENDIENTE` o
  `EN_REVISION`.
- AC-07.2: Al confirmar la acción "Aceptar", el estado de moderación del reporte pasa a
  `RESUELTO`.
- AC-07.3: La acción "Aceptar" **no requiere** confirmación explícita por sí sola (se ejecuta
  directamente al hacer clic) cuando únicamente cambia el estado del reporte a `RESUELTO`, sin
  ninguna acción adicional sobre la publicación asociada. Si el administrador, en el mismo flujo,
  decide además eliminar la publicación asociada (acción independiente de HU-05), esa acción
  adicional sí requiere su propia confirmación explícita, igual que cualquier otra eliminación de
  publicación (resuelto **A2**, Clarifications Session 2026-10-05).
- AC-07.4: Un reporte en estado `RESUELTO` o `DESESTIMADO` no puede volver a aceptarse ni
  rechazarse (las acciones quedan deshabilitadas de forma permanente para ese reporte).
- AC-07.5: Si la operación falla en el backend, se muestra un mensaje de error no bloqueante y el
  estado del reporte no cambia en la interfaz.

---

### HU-08 — Rechazar un reporte

**Como** administrador

**quiero** rechazar un reporte pendiente

**para** descartar reportes que no ameritan una acción de moderación (por ejemplo, reportes
infundados).

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-08.1: La acción "Rechazar" está disponible sobre reportes en estado `PENDIENTE` o
  `EN_REVISION`.
- AC-08.2: Al confirmar la acción "Rechazar", el estado de moderación del reporte pasa a
  `DESESTIMADO`.
- AC-08.3: La acción "Rechazar" requiere confirmación explícita antes de aplicarse.
- AC-08.4: Un reporte en estado `RESUELTO` o `DESESTIMADO` no puede volver a aceptarse ni
  rechazarse (las acciones quedan deshabilitadas de forma permanente para ese reporte).
- AC-08.5: Si la operación falla en el backend, se muestra un mensaje de error no bloqueante y el
  estado del reporte no cambia en la interfaz.
- AC-08.6: Al confirmarse el rechazo (`DESESTIMADO`), si la publicación asociada no tiene otros
  reportes en estado `PENDIENTE` o `EN_REVISION`, su `EstadoPublicacion` vuelve automáticamente a
  `ACTIVA` (resuelto, Clarifications Session 2026-10-01). Si la publicación tiene otros reportes aún
  pendientes de revisión, permanece en `REPORTADA`.

---

### HU-09 — Exportar reportes

**Como** administrador

**quiero** exportar los reportes (todos o un subconjunto filtrado)

**para** compartir esta información con el equipo administrativo fuera de la plataforma.

**Prioridad:** Media

**Criterios de aceptación:**
- AC-09.1: El administrador puede iniciar la exportación de reportes mediante un botón "Exportar"
  ubicado **dentro de la misma pantalla de listado de reportes** (`/reportes`), sin navegar a una
  pantalla separada; la exportación respeta siempre el filtro (`FiltroReportes`) activo en ese
  momento en el listado (resuelto, Clarifications Session 2026-10-01).
- AC-09.2: Mientras se genera la exportación, se muestra un estado de carga claro sin bloquear el
  resto de la interfaz.
- AC-09.3: Si la exportación tiene éxito, se ofrece una acción clara para descargar el archivo
  generado.
- AC-09.4: Si la exportación falla, se muestra un mensaje de error claro (el contrato exacto del
  mensaje y el formato del archivo exportado quedan fuera de alcance de esta especificación, ver
  **A3** en Ambigüedades).

---

### HU-10 — Acceso restringido al frontend administrativo

**Como** sistema

**quiero** restringir el uso del frontend administrativo únicamente a usuarios con rol ADMIN

**para** evitar que usuarios sin permisos administrativos ejecuten acciones de gestión.

**Prioridad:** Alta

**Criterios de aceptación:**
- AC-10.1: Únicamente un usuario con rol `ADMIN` puede acceder a las pantallas y acciones del
  frontend administrativo.
- AC-10.2: Todas las acciones administrativas (banear, eliminar, promover usuarios; editar,
  eliminar publicaciones; aceptar, rechazar, exportar reportes) se ofrecen en el frontend
  asumiendo que serán validadas de forma definitiva por el backend/API al conectarse en una
  iteración futura.
- AC-10.3: Ocultar o deshabilitar una acción en el frontend (por ejemplo, para un rol sin permisos)
  no se considera por sí sola una medida de seguridad suficiente; se documenta explícitamente que
  la autorización real depende del backend.

---

## 3. Requisitos Funcionales

### Gestión de usuarios

- **RF-01**: El sistema DEBE permitir banear a un usuario con rol `USER`, con opción de baneo
  temporal (con duración/fecha de fin) o permanente, requiriendo confirmación explícita antes de
  aplicarse.
- **RF-02**: El sistema DEBE permitir eliminar la cuenta de un usuario con rol `USER`, requiriendo
  confirmación explícita antes de aplicarse.
- **RF-03**: El sistema DEBE deshabilitar las acciones "Banear" y "Eliminar" cuando el usuario
  objetivo tiene rol `ADMIN`, incluido el propio administrador autenticado.
- **RF-04**: El sistema DEBE gestionar y mostrar para cada usuario su rol (`RolUsuario`: `USER` o
  `ADMIN`) y su estado de cuenta (`EstadoCuentaUsuario`: `ACTIVO`, `BANEADO` o `ELIMINADO`).
- **RF-05**: El sistema DEBE permitir buscar y listar usuarios de forma paginada.

### Promoción de usuarios

- **RF-06**: El sistema DEBE permitir promover a un usuario con rol `USER` al rol `ADMIN`,
  requiriendo confirmación explícita antes de aplicarse.
- **RF-07**: Solo un usuario con rol `ADMIN` autenticado puede ejecutar la acción de promoción.
- **RF-08**: El sistema DEBE rechazar como operación inválida (no-op) el intento de promover a un
  usuario que ya tiene rol `ADMIN`.

### Gestión de publicaciones

- **RF-09**: El sistema DEBE permitir editar el contenido de una publicación de cualquier usuario,
  sin distinción de autor, requiriendo confirmación explícita para guardar los cambios.
- **RF-10**: El sistema DEBE permitir eliminar la publicación de cualquier usuario, sin distinción
  de autor, requiriendo confirmación explícita antes de aplicarse.
- **RF-11**: El sistema DEBE gestionar y mostrar para cada publicación su estado
  (`EstadoPublicacion`: `ACTIVA`, `REPORTADA` o `ELIMINADA`).
- **RF-12**: Al eliminar una publicación, su `EstadoPublicacion` DEBE pasar a `ELIMINADA`.

### Gestión de reportes

- **RF-13**: El sistema DEBE permitir visualizar los reportes pendientes de revisión, mostrando
  como mínimo estado de moderación, motivo y prioridad.
- **RF-14**: El sistema DEBE permitir filtrar el listado de reportes al menos por estado de
  moderación y por prioridad.
- **RF-15**: El sistema DEBE permitir aceptar un reporte en estado `PENDIENTE` o `EN_REVISION`,
  cambiando su estado de moderación a `RESUELTO`.
- **RF-16**: El sistema DEBE permitir rechazar un reporte en estado `PENDIENTE` o `EN_REVISION`,
  cambiando su estado de moderación a `DESESTIMADO`.
- **RF-17**: El sistema DEBE deshabilitar las acciones "Aceptar" y "Rechazar" sobre reportes que ya
  se encuentren en estado `RESUELTO` o `DESESTIMADO`.
- **RF-18**: El sistema DEBE gestionar y mostrar para cada reporte su estado de moderación
  (`EstadoModeracion`: `PENDIENTE`, `EN_REVISION`, `RESUELTO`, `DESESTIMADO`), su motivo
  (`MotivoReporte`: `SPAM`, `CONTENIDO_INAPROPIADO`, `PLAGIO_DERECHOS_AUTOR`, `VIOLENCIA`, `OTRO`) y
  su prioridad (`PrioridadReporte`: `ALTA`, `MEDIA`, `BAJA`).
- **RF-19**: El sistema DEBE permitir iniciar la exportación de reportes, respetando los filtros
  activos si existen, y ofrecer una acción de descarga cuando el resultado esté disponible.
- **RF-20**: El sistema DEBE mostrar un mensaje de error claro cuando la exportación de reportes
  falle.

### Permisos y acceso

- **RF-21**: El sistema DEBE restringir el acceso a todas las pantallas y acciones del frontend
  administrativo a usuarios con rol `ADMIN`.
- **RF-22**: El sistema DEBE diferenciar visualmente las acciones sensibles (banear, eliminar,
  promover usuario; editar, eliminar publicación) de las acciones de solo consulta, en el 100% de
  las pantallas del frontend administrativo.
- **RF-23**: Toda acción administrativa destructiva o sensible (banear, eliminar o promover un
  usuario; editar o eliminar una publicación; rechazar un reporte) DEBE requerir confirmación
  explícita antes de ejecutarse. **Excepción**: aceptar un reporte (cambiar su estado de
  moderación a `RESUELTO` sin ninguna acción adicional sobre la publicación asociada) NO requiere
  confirmación explícita por sí solo; si esa acción se combina con eliminar la publicación
  asociada, dicha eliminación sí requiere su propia confirmación (resuelto, Clarifications Session
  2026-10-05, AC-07.3).
- **RF-24**: El frontend NO DEBE considerarse la fuente definitiva de autorización: toda acción
  administrativa asume que será validada por el backend/API al integrarse en una iteración futura;
  ocultar o deshabilitar una acción en el frontend no reemplaza dicha validación.

### Restricciones de implementación

- **RF-25**: El frontend NO DEBE implementar ninguna función de backend, ni siquiera a modo de
  prueba (mocks que simulen reglas de negocio de servidor quedan fuera de alcance de este
  speckit; ver **A4** en Ambigüedades respecto del uso de datos de ejemplo puramente visuales).
- **RF-26**: El frontend NO DEBE acceder directamente a MySQL ni a ninguna base de datos.
- **RF-27**: El frontend NO DEBE recalcular rankings, recomendaciones ni estadísticas complejas; de
  requerirse indicadores agregados, estos se consumen ya calculados desde la API en la iteración de
  integración futura.

---

## 4. Requisitos No Funcionales

- **RNF-01** (Usabilidad): Gestionar usuarios, publicaciones y reportes debe poder realizarse de
  forma simple, rápida y clara, minimizando la cantidad de pasos para completar cada acción
  administrativa descripta en la sección 2.
- **RNF-02** (Usabilidad — reportes): Un administrador debe poder localizar un reporte pendiente
  específico y ver su estado y prioridad sin necesidad de abrir su detalle completo (visibles
  directamente desde el listado).
- **RNF-03** (Usabilidad — distinción visual): Las acciones sensibles (banear, eliminar, promover
  usuario; editar, eliminar publicación) deben ser visualmente distinguibles de las acciones de
  solo consulta sin necesidad de leer el texto completo del botón (color/iconografía consistente en
  toda la aplicación).
- **RNF-04** (Performance — escalabilidad de listados): Los listados de usuarios, publicaciones y
  reportes deben diseñarse asumiendo que su resolución final (paginación, filtrado y búsqueda) se
  apoyará en consultas, índices de base de datos y caché cuando corresponda del lado del backend que
  se integrará en una iteración futura; el frontend no debe asumir ni depender de recorrer listas
  completas en memoria para filtrar o paginar.
- **RNF-05** (Seguridad): Ninguna acción administrativa se considera autorizada por el solo hecho de
  estar visible o habilitada en el frontend; la autorización definitiva depende del backend/API que
  se integrará en una iteración futura.
- **RNF-06** (Confirmación de acciones destructivas): El 100% de las acciones administrativas
  sensibles (banear, eliminar o promover un usuario; editar o eliminar una publicación; rechazar un
  reporte) deben requerir y registrar una confirmación explícita antes de aplicarse, salvo la
  excepción documentada en RF-23 para "aceptar reporte" sin acción adicional.
- **RNF-07** (Calidad — separación de capas): El frontend DEBE mantener separación entre dominio
  (entidades, value objects, enums y reglas de negocio de cliente), aplicación/servicios (casos de
  uso) y presentación (componentes React); los componentes de presentación no deben invocar
  directamente llamadas HTTP, sino a través de la capa de servicios.
- **RNF-08** (Calidad — dominio orientado a objetos): Las reglas de negocio de cliente identificadas
  en esta especificación (por ejemplo: un reporte `RESUELTO`/`DESESTIMADO` no puede volver a
  aceptarse/rechazarse; no se puede banear/eliminar a un ADMIN; promover a un ADMIN ya existente es
  inválido) deben encapsularse en las entidades/value objects del dominio de UI correspondientes, no
  en los componentes de presentación.
- **RNF-09** (Testabilidad): El 100% de las reglas de negocio críticas listadas en el Principio
  VIII de la constitución (ver sección 6 de este documento) DEBEN contar con tests automatizados.
- **RNF-10** (Alcance — sin backend): Ninguna parte de este frontend DEBE implementar, simular de
  forma persistente, ni depender en tiempo de ejecución de un backend propio; el consumo de la API
  Java queda diferido a una iteración posterior fuera de este speckit.

---

## 5. Casos Borde

- **CB-01**: Un administrador intenta banear o eliminar a otro usuario con rol `ADMIN` (o a sí
  mismo). La acción está deshabilitada en la interfaz (RF-03); la validación definitiva de esta
  regla queda a cargo del backend al integrarse.
- **CB-02**: Un administrador intenta promover a un usuario que ya tiene rol `ADMIN`. La acción se
  rechaza como operación inválida (no-op) sin requerir confirmación adicional (RF-08).
- **CB-03**: Un administrador intenta aceptar o rechazar un reporte que ya está en estado
  `RESUELTO` o `DESESTIMADO`. Las acciones correspondientes se muestran deshabilitadas de forma
  permanente para ese reporte (RF-17).
- **CB-04**: El listado de reportes pendientes está vacío (no hay reportes en estado `PENDIENTE`).
  La interfaz muestra un estado vacío con mensaje claro, en lugar de una pantalla en blanco.
- **CB-05**: La exportación de reportes falla luego de iniciada. Se muestra un mensaje de error
  claro, sin dejar la interfaz en un estado de carga indefinido.
- **CB-06**: Un administrador edita una publicación y la conexión se interrumpe antes de confirmar
  el guardado. Los datos ya ingresados en el formulario se conservan y se informa el error, sin
  aplicar cambios parciales.
- **CB-07**: Un administrador intenta banear, eliminar o promover a un usuario que ya no existe al
  momento de confirmar la acción (por ejemplo, fue eliminado por otro administrador en paralelo).
  El comportamiento exacto de este escenario de concurrencia no está definido — ver **A5** en
  Ambigüedades.
- **CB-08**: Un administrador aplica un baneo temporal con una duración o fecha de fin inválida
  (por ejemplo, en el pasado). El envío se bloquea en el cliente mostrando un mensaje de validación
  claro, antes de intentar confirmar la acción.

---

## 6. Reglas de Negocio Críticas (requieren test, Principio VIII)

> Lista exhaustiva de reglas de negocio que, según el Principio VIII de la constitución, deben
> contar con tests automatizados.

1. Solo el administrador puede eliminar o editar las publicaciones de cualquier usuario (RF-09,
   RF-10).
2. Solo el administrador puede banear, eliminar o promover usuarios (RF-01, RF-02, RF-06).
3. Solo el administrador puede leer, exportar, aceptar y rechazar reportes (RF-13, RF-15, RF-16,
   RF-19).
4. Solo un administrador puede promover a otro usuario a administrador (RF-07).
5. Solo usuarios con rol `ADMIN` pueden realizar acciones administrativas (RF-21).
6. Las acciones administrativas destructivas (banear, eliminar, promover usuario; editar, eliminar
   publicación; rechazar reporte) requieren confirmación explícita en la interfaz, salvo "aceptar
   reporte" sin acción adicional, que no la requiere (RF-23).
7. No se puede banear ni eliminar a un usuario con rol `ADMIN`, incluido el propio administrador
   autenticado (RF-03).
8. No se puede promover a un usuario que ya tiene rol `ADMIN` (RF-08).
9. No se puede aceptar ni rechazar un reporte que ya está en estado `RESUELTO` o `DESESTIMADO`
   (RF-17).

---

## 7. Estados y Enums (Value Objects del Dominio)

| Enum | Valores | Entidad asociada |
| --- | --- | --- |
| `RolUsuario` | `USER`, `ADMIN` | Usuario |
| `EstadoCuentaUsuario` | `ACTIVO`, `BANEADO`, `ELIMINADO` | Usuario |
| `EstadoPublicacion` | `ACTIVA`, `REPORTADA`, `ELIMINADA` | Publicación |
| `EstadoModeracion` | `PENDIENTE`, `EN_REVISION`, `RESUELTO`, `DESESTIMADO` | Reporte |
| `MotivoReporte` | `SPAM`, `CONTENIDO_INAPROPIADO`, `PLAGIO_DERECHOS_AUTOR`, `VIOLENCIA`, `OTRO` | Reporte |
| `PrioridadReporte` | `ALTA`, `MEDIA`, `BAJA` | Reporte |

### Transiciones relevantes

- `EstadoCuentaUsuario`: `ACTIVO → BANEADO` (acción Banear), `ACTIVO → ELIMINADO` (acción Eliminar).
  No se definen transiciones de reversión (por ejemplo, des-banear) en esta especificación — ver
  **A6** en Ambigüedades.
- `RolUsuario`: `USER → ADMIN` (acción Promover). No se define en esta especificación si existe una
  acción de degradación (`ADMIN → USER`) — ver **A7** en Ambigüedades.
- `EstadoPublicacion`: cualquier estado `→ ELIMINADA` (acción Eliminar, ejecutable sin impedimento
  por estado previo).
- `EstadoModeracion`: `PENDIENTE → RESUELTO` o `EN_REVISION → RESUELTO` (acción Aceptar);
  `PENDIENTE → DESESTIMADO` o `EN_REVISION → DESESTIMADO` (acción Rechazar). `RESUELTO` y
  `DESESTIMADO` son estados finales para las acciones Aceptar/Rechazar.

---

## 8. Permisos por Rol

| Funcionalidad | Usuario (USER) | Administrador (ADMIN) |
| --- | --- | --- |
| Acceder al frontend administrativo | No | Sí |
| Ver listado/detalle de usuarios | No | Sí |
| Banear usuario | No | Sí, solo sobre usuarios con rol `USER` |
| Eliminar cuenta de usuario | No | Sí, solo sobre usuarios con rol `USER` |
| Promover usuario a `ADMIN` | No | Sí, solo sobre usuarios con rol `USER` |
| Editar publicación de cualquier usuario | No | Sí |
| Eliminar publicación de cualquier usuario | No | Sí |
| Ver reportes pendientes | No | Sí |
| Aceptar reporte | No | Sí |
| Rechazar reporte | No | Sí |
| Exportar reportes | No | Sí |

---

## 9. Ambigüedades

| ID | Descripción | Impacto | Estado / Acción requerida |
| --- | --- | --- | --- |
| **A1** | ~~¿Un `ADMIN` puede banear/eliminar/degradar a sí mismo mediante algún flujo indirecto?~~ | Afecta el diseño de las reglas de habilitación de HU-01/HU-02. | **RESUELTO** (2026-10-01): la restricción queda completamente cerrada: un ADMIN nunca puede banear/eliminar a otro ADMIN ni a sí mismo, sin excepciones ni flujos indirectos; no se requiere ninguna regla adicional. |
| **A2** | ~~¿"Aceptar" un reporte incluye alguna acción obligatoria asociada (eliminar la publicación) o es independiente?~~ | Afecta el flujo de UI de HU-07 y su relación con HU-05. | **RESUELTO** (2026-10-05): "Aceptar" y "eliminar publicación" siguen siendo acciones independientes (no se encadenan automáticamente), pero la **confirmación explícita** de "Aceptar" ahora es condicional: no se requiere si solo cambia el estado del reporte a `RESUELTO`; si el administrador además elige eliminar la publicación asociada en el mismo flujo, esa acción adicional sí requiere su propia confirmación explícita (AC-07.3). |
| **A3** | ~~Formato exacto del archivo exportado y relación con filtros/pantalla.~~ Relación con filtros/pantalla **RESUELTA** (2026-10-01): se exporta desde la misma pantalla `/reportes` usando el filtro activo (AC-09.1). Pendiente: formato exacto del archivo (extensión, nombre, columnas). | Afecta el diseño de la UI de descarga de HU-09 (parcialmente resuelto). | **Parcialmente resuelto**: definir el formato exacto del archivo cuando se planifique la integración con la API Java. |
| **A4** | No se define si, durante el desarrollo sin backend conectado, el frontend puede mostrar datos de ejemplo puramente visuales (sin lógica de negocio simulada) para fines de diseño/demo, dado que el Principio IV prohíbe "funciones de backend" pero no aclara el uso de datos estáticos de muestra en la UI. | Afecta cómo se construyen las pantallas antes de la integración real con la API. | Aclarar en la fase de planificación si se permiten datos de muestra puramente estáticos (sin simular reglas de negocio) para maquetado visual. |
| **A5** | No se define el comportamiento ante conflictos de concurrencia: ¿qué sucede si dos administradores actúan simultáneamente sobre el mismo usuario, publicación o reporte, o si el recurso objetivo ya no existe al confirmar una acción (CB-07)? | Puede generar estados inconsistentes entre dos sesiones administrativas simultáneas. | Definir el comportamiento esperado (por ejemplo, mensaje de conflicto y recarga) en una futura clarificación. |
| **A6** | No se define si existe una acción para revertir un baneo (`BANEADO → ACTIVO`) antes de que expire un baneo temporal, ni qué ocurre automáticamente al vencer un baneo temporal (¿vuelve a `ACTIVO` automáticamente?). | Afecta el alcance completo de la gestión de usuarios (HU-01). | Definir en una futura clarificación si se requiere una acción de "revertir baneo" o si el vencimiento es responsabilidad exclusiva del backend. |
| **A7** | No se define si existe una acción de "degradar" a un `ADMIN` de vuelta a `USER` dentro del alcance de este frontend (el encargo original solo menciona promover, no degradar). | Afecta el alcance de HU-03 y la tabla de permisos (sección 8). | Confirmar si "degradar administrador" está dentro del alcance antes de planificar la implementación; por ahora se considera fuera de alcance explícito. |

---

## 10. Fuera de Alcance

- Implementación del backend (API REST Java) y de cualquier función de backend, incluso para
  pruebas.
- Persistencia en base de datos (MySQL) y acceso directo a ella desde el frontend.
- Caché (Redis), índices de base de datos y cualquier otro componente de infraestructura del lado
  servidor.
- Cálculo de rankings, recomendaciones o estadísticas complejas en el cliente.
- Generación física de archivos de reportes exportables; el frontend solo inicia la solicitud y
  ofrece la descarga del resultado ya generado por el backend.
- Cualquier pantalla o flujo propio de un frontend de usuario final (registro, publicación propia,
  descubrimiento, edición de perfil propio, etc.).
- Integración real con la API Java (queda explícitamente para una iteración futura fuera de este
  speckit).
- Acción de "degradar" a un administrador de vuelta a usuario (ver **A7**).
- Acción de revertir un baneo antes de su vencimiento (ver **A6**).

---

## 11. Criterio Final de Consistencia

1. ✅ Las tres capacidades del encargo (gestión de usuarios, gestión de publicaciones, gestión de
   reportes) están cubiertas por historias de usuario (HU-01 a HU-09) y requisitos funcionales
   (RF-01 a RF-27).
2. ✅ Los enums obligatorios de la constitución (`EstadoPublicacion`, `RolUsuario`,
   `EstadoCuentaUsuario`, `EstadoModeracion`, `MotivoReporte`, `PrioridadReporte`) están
   representados en la sección 7.
3. ✅ Todas las reglas de negocio críticas del Principio VIII de la constitución están listadas
   explícitamente en la sección 6 con referencia a tests obligatorios.
4. ✅ Toda acción destructiva/sensible (banear, eliminar, promover usuario; editar, eliminar
   publicación) requiere confirmación explícita (RF-23, RNF-06).
5. ✅ Ninguna funcionalidad de backend, persistencia directa, analytics o generación de archivos se
   especificó como responsabilidad del frontend (sección 10).
6. ✅ Las ambigüedades detectadas se documentaron explícitamente (A1–A7) sin inventar soluciones no
   definidas por el encargo original.
7. ✅ No se incluyó ningún fragmento de código como parte de esta especificación.

**No se implementó código como parte de esta especificación.**
