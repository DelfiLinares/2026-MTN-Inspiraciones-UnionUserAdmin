# Inspiraciones: revisión de integraciones y orden de trabajo

Fecha: 13 de octubre de 2026.

## Alcance y criterio

Revisé código y contratos de 11 repositorios accesibles por Git, sus ramas relevantes y las dos copias locales con las que venimos trabajando. Los commits exactos están en [manifest.json](manifest.json). Los snapshots de código de la revisión están en el workspace local `revision-integracion`; las rutas indicadas como evidencia identifican archivos de esos repositorios.

Esto es una revisión estática de integración. No ejecuté en esta revisión una prueba conjunta de todos los servicios ni sus suites. La comprobación previa de login, feed y tres publicaciones usó la API Java real con H2 temporal; no acredita subida de archivos, Analytics real, Firebase ni exportaciones integradas. Graphify no pudo arrancar por un error de su runtime local; la revisión se hizo directamente sobre el código.

Clasificación:
- **Conectado en la copia local:** recorrido observado entre navegador y API.
- **Implementado parcialmente:** hay endpoints, componentes o lógica, pero faltan piezas del recorrido.
- **Pendiente de integración:** existen módulos por separado con contratos que todavía no coinciden.
- **No encontrado:** no hay implementación en las ramas y repositorios revisados; no implica que no exista en una copia local ajena.

## Repositorios y ramas revisados

| Repositorio | Estado observado |
| --- | --- |
| [Unión/UserAdmin](https://github.com/DelfiLinares/2026-MTN-Inspiraciones-UnionUserAdmin) | Revisé main, 002-inspiraciones-publicaciones, 003-inspiraciones-reportes, 004-inspiraciones-perfil y 005-desafios. Contiene componentes y servicios de varios módulos, pero el App activo monta principalmente las rutas de usuario. |
| [API Java](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Api) | Main contiene identidad, publicaciones, interacciones, seguimiento y recomendaciones. 006 agrega perfil; 007 agrega onboarding; dev contiene trabajo de perfil y onboarding que no está en main. |
| [Usuario](https://github.com/DelfiLinares/2026-MTN-Inspiraciones-Usuario) | Main contiene especificaciones. Primera-iteracion tiene componentes de Descubrir, perfil, cuestionario y desafíos; su App.tsx devuelve null. No es una aplicación completa ya montada. |
| [Admin](https://github.com/DelfiLinares/2026-MTN-Inspiraciones-Admin) | Contiene servicios y pantallas administrativas reutilizables. Sus contratos no coinciden completamente con la API Java. |
| [Eventos](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Eventos) | HTTP de recepción, validación, prioridad y respuesta. No publica en el Broker. |
| [Caja de Mensajes](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Caja-Mensajes) | Broker programático sobre Redis: publish, consume, requeue y estadísticas. Es una cola de eventos; no encontré un módulo de chat de usuarios. |
| [Notificaciones Push](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Notificaciones-Push) | Lógica de notificación, repositorios, Firebase y controladores de tokens/preferencias. El ensamblado deja adaptadores provisionales y no monta el servidor HTTP de esos controladores. |
| [Notificaciones](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Notificaciones) | Solo encontré la constitución del módulo, sin implementación ejecutable. |
| [Analytics](https://github.com/Instituto-Politecnico-Modelo/MTN-2026-Inspiraciones-Analytics) | Jobs MySQL → Redis para ranking musical, recomendaciones colaborativas y trending. El esquema SQL y las claves Redis no coinciden con todo lo que usa la API actual. |
| [Reportes](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Reportes) | Servicio FastAPI para generar y descargar Excel de ranking, actividad, moderación y desafíos. No es el backend de denuncias de publicaciones. |
| [APIs Externas](https://github.com/Instituto-Politecnico-Modelo/2026-MTN-Inspiraciones-Api_Externas) | Funciones de sincronización de canciones y samples con lyrics.ovh y Freesound. Falta conectarlas con el ciclo real de contenidos y el reprocesamiento programado. |

Los repositorios global `2026-MTN-Inspiraciones` y `DelfiLinares/2026-MTN-Inspiraciones-Frontend` no devolvieron ramas remotas. No encontré allí código adicional. Tampoco encontré una composición Docker común en las copias revisadas.

## Qué ya está conectado

- Registro e inicio de sesión de usuario por mail/contraseña con la API Java.
- Descubre/feed en la copia local 002: recomendaciones con cursor y mapeo de contenido, imagen, hashtags y conteos.
- Petición de toggle de LIKE ajustada en esta rama al contrato Java: cuerpo `{ tipo: "LIKE" }` y lectura de `activa/reaccionesCount`. Las pruebas del servicio del front cubren el toggle optimista y su reversión.
- Java ya ofrece creación/actualización/borrado lógico de publicaciones, comentarios, reacciones, seguimiento, preferencias y coautoría. Que exista el endpoint no significa que todas sus pantallas estén conectadas.

Los cambios de esta integración, el respaldo H2, la evidencia visual y este plan quedan incluidos en la rama `002-inspiraciones-publicaciones` de Unión.

## Entrega y comprobaciones de la rama 002

- Feed real: la API Java con H2 devolvió las tres publicaciones de muestra al lector de prueba.
- Algoritmo: 33 pruebas de integración/unidad de recomendaciones pasaron; incluyen afinidad, preferencias, paginación y fallback.
- Front: las 20 pruebas de feed/likes pasaron y `tsc -b` más `vite build` finalizaron correctamente.
- Base reproducible: `demo-data/publicaciones-demo.sql` restaura en una H2 nueva dos cuentas, tres publicaciones y seis hashtags. Las imágenes sintéticas están en `frontend/public/demo/`.
- Captura del feed: [Descubre con publicaciones del backend](evidence/descubre-ejemplos.jpg).
- Las pruebas de API se ejecutaron desde el checkout local `Algoritmo_de_recomendacion`; no modifican ni publican ninguna rama `dev`.

La comprobación cubre este recorrido de publicaciones y el algoritmo Java probado por sus suites. No equivale a levantar conjuntamente todos los módulos del ecosistema descritos abajo.

## Orden recomendado

| Orden | Trabajo | Depende de | Criterio para darlo por terminado |
| --- | --- | --- | --- |
| 1 | Consolidar ramas, contratos, esquema de datos y arranque local | — | Una versión candidata del front/API; IDs, tablas, rutas, DTOs y URLs de servicios acordados; MySQL y Redis compartidos de desarrollo. |
| 2 | Sesión, perfil, seguimiento y onboarding | 1 | Registro → cuestionario real → perfil → recarga de sesión → expiración; edición y seguimiento reflejados en servidor. |
| 3 | Archivos y recorrido completo de publicaciones | 2 | Subir imagen → crear → verla en feed/perfil → editar → borrar; comentarios e invitaciones de coautoría utilizables. |
| 4 | Búsqueda y filtros de Descubrir | 3 | Texto, tags y filtros producen resultados del servidor con paginación y estado vacío correctos. |
| 5 | Carpetas y guardados | 2, 3 | Crear/renombrar/borrar carpeta, guardar/quitar una publicación y recuperar el estado al recargar. |
| 6 | Administración y denuncias/moderación | 2, 3 | Login admin, rutas accesibles, usuarios/roles/estados, denuncia → revisión → decisión persistida. |
| 7 | Desafíos | 3, 6 | Crear/proponer/aprobar, publicar desafío, responder/participar y mostrar el desafío vigente desde la API. |
| 8 | API → Eventos → Broker | 1 y acciones de 3, 6, 7 | Una acción real genera un evento compatible que llega a Redis y se consume, con estrategia de reintento acordada. |
| 9 | Analytics y personalización real del feed | 1, 2, 3, 5 | Los jobs leen el esquema elegido y producen las señales que Java realmente consume; embeddings y fallback comprobados con datos reales. |
| 10 | Push de punta a punta | 8, 2, 3 | Navegador registra token FCM; una acción de otro usuario llega al destinatario correcto; preferencias y reintentos funcionan. |
| 11 | Catálogo musical y APIs externas | 1, 3 | Canciones/samples y sus relaciones existen en el modelo común; una creación dispara sincronización y los pendientes se reprocesan. |
| 12 | Excel/reportes de gestión | 6, 7, 9; 11 para ranking musical | Solicitar → consultar estado → descargar → recuperar historial, con identidad admin real y datos de los módulos. |
| 13 | Orquestación y verificación del sistema completo | Recorridos anteriores | Arranque documentado, migraciones y configuración reproducibles, servicios enrutados y pruebas de los recorridos completos. |

Los pasos 8 y 9 pueden avanzar en paralelo: Analytics hoy funciona por lotes leyendo MySQL, no consume eventos del Broker. La personalización de publicaciones no tiene que esperar al enriquecimiento musical del paso 11. El ranking musical y algunos Excel sí requieren disponer de ese catálogo y sus métricas.

## Detalle de lo que falta conectar

### 1. Base común y consolidación

- Elegir el esquema canónico o adaptadores explícitos. Java usa UUID como string en `usuario.id/publicacion.id`; Eventos exige un usuario numérico; Analytics y APIs Externas trabajan con IDs/tablas del esquema legado.
- Definir migraciones o vistas de compatibilidad. Apuntar todos a la misma base no resuelve columnas y relaciones diferentes.
- Consolidar selectivamente las ramas 002/003/004/005 del front: modifican entidades y contratos compartidos. Integrar también los ajustes locales de 002.
- Tomar dev de Java como candidata a revisar para perfil/onboarding; no asumir que superponer 006 y 007 conserva sus diferencias.
- Elegir un router y un cliente administrativo. Actualmente hay contratos `/admin/usuarios`, `/usuarios` y `/admin/users`.
- Definir gateway/proxy/BFF y prefijos para los servicios. El front activo solo tiene proxy de `/api` hacia Java.
- Mantener diferentes nombres para denuncias de contenido y exportaciones de gestión: ambos hoy aparecen como “reportes”.

Evidencia en los repositorios revisados: API `src/main/java/com/inspiraboard/api/entity/Publicacion.java`; Eventos `modulo-eventos/src/validation/validarTipoYUsuario.js`; Analytics `my-project/analytics-preprocessing/src/ingestion/interaction_repository.py`.

### 2. Sesión, perfil y onboarding

- El front verifica `GET /auth/me`; main de Java no lo expone. Dev expone `GET /api/usuarios/me`: alinear la verificación y el DTO en lugar de depender de la copia persistida del usuario.
- El login administrativo espera `token/usuario`; Java responde `accessToken/user`. Ajustar ese proveedor y sus verificaciones de rol.
- El front de perfil usa `PATCH /perfil` y `POST /perfil/foto`; el backend de perfil usa `PATCH /api/usuarios/me` y metadatos de avatar. Falta acordar carga de archivos.
- Incorporar las pantallas reales de perfil al router activo: la rama 004 agrega componentes en presentation/perfil, mientras AppRoutes sigue importando pages/perfil.
- Conectar `PUT /api/usuarios/me/intereses/onboarding` y el indicador de finalización de dev. Unión registra y va al feed; el cuestionario de Usuario/primera-iteracion solo tiene “Continuar”, sin guardar intereses.
- Seguimiento ya existe en Java; unificar los clientes que usan `/seguir` frente a `/seguimiento`.
- OAuth Google/GitHub tiene adaptadores de front, pero no encontré endpoints de callback en Java. Planificarlo como ampliación del recorrido de autenticación.

Evidencia: [sesión del front](../frontend/src/infrastructure/tokenStorage.ts); Admin `Union/frontend/src/services/AuthAdminService.ts`; API `src/main/java/com/inspiraboard/api/controller/PerfilUsuarioController.java` (rama dev revisada); Usuario `my-project/backend_usuario/frontend/src/pages/cuestionario/CuestionarioPage.tsx` (primera-iteracion).

### 3. Publicaciones y archivos

- La creación del front envía multipart con archivo, titulo, descripcion y tags[]. Java recibe JSON con contenido, tipoContenido, fotoUrl, categorias y hashtags. Este recorrido todavía no coincide.
- Crear/acordar el almacenamiento y endpoint de archivos; la fotoUrl actual es una referencia HTTP. Las imágenes de la demostración se sirvieron desde un servidor temporal de assets, no desde un sistema de uploads implementado.
- Unificar el mapeo de publicaciones en feed, búsqueda, perfil, creación y edición. Corregir un servicio no corrige automáticamente sus otros DTOs.
- Categorías devuelve `{ items: [...] }`, pero el cliente de publicaciones espera un array directo.
- Incorporar pantallas/acciones para comentarios e invitaciones de coautoría; hay endpoints y helpers, pero no un recorrido completo visible en Home.
- El DTO del feed no incluye la reacción del usuario actual ni el nombre del autor: falta resolver esos datos para estado inicial de like y autor real en las tarjetas.
- Definir detalle/listados propios con paginación: no encontré un GET de detalle por ID en PublicacionController.

Evidencia: [creación del front](../frontend/src/services/publicacionService.ts); API `src/main/java/com/inspiraboard/api/dto/CreatePublicacionRequest.java` y `PublicacionResponse.java`.

### 4–5. Descubrir y carpetas

- Recuperar e integrar la pantalla Descubrir de Usuario/primera-iteracion y sus filtros. El Home de Unión usa recomendaciones y no monta el panel de búsqueda.
- El buscador de 002 manda q/estilo/tecnica/tipoContenido/distancia y paginación a GET /publicaciones; Java lista sin leer esos parámetros.
- No encontré endpoints para opciones-filtro ni tags; uno de los clientes pide `/api/tags` sobre una base `/api`, lo que duplica el prefijo.
- Acordar qué filtros existen en el modelo de datos, incluyendo ubicación si se conserva la búsqueda por distancia.
- La rama 004 tiene bastante UI de carpetas/guardados, pero no encontré su backend en main/dev/006/007 de Java. Definir CRUD, propiedad, contenidos y paginación antes de conectarla.

Evidencia: [búsqueda del front](../frontend/src/services/busquedaService.ts); API `src/main/java/com/inspiraboard/api/controller/PublicacionController.java`; Usuario `my-project/backend_usuario/frontend/src/pages/descubrir/DescubrirPage.tsx`; Unión 004 `Union/frontend/src/presentation/carpetas`.

### 6–7. Administración, denuncias y desafíos

- App de Unión monta AppRoutes de usuario. La rama 003 aporta AppRoutesAdmin y pantallas adicionales, pero no están montados desde App.
- Alinear login admin, guardias y rutas antes de usuarios/roles/moderación. Java implementa cambio de rol y edición de perfil admin; no encontré el resto de gestión de usuarios y dashboard que espera el front.
- “Reportar” en Home solo escribe en consola. Falta UI de motivos, envío y estado, y el backend de denuncias/moderación.
- El servicio Python Reportes genera Excel; no implementa aceptar/rechazar denuncias de contenido.
- La rama 005 agrega formularios y entidades de desafíos, sin conectarlos a una ruta/servicio completo. No encontré backend de desafíos en Java.
- Home todavía muestra texto fijo en el challenge y un destacado vacío. Conectar desafío vigente y contenido destacado cuando existan sus fuentes.

Evidencia: Unión 003 `Union/frontend/src/routes/AppRoutesAdmin.tsx` y `src/App.tsx`; [Home de esta rama](../frontend/src/pages/home/HomePage.tsx); Unión 005 `Union/frontend/src/desafios/components`.

### 8. Eventos y Broker

- Añadir un productor desde las acciones confirmadas de Java; no encontré un cliente hacia Eventos/Broker. Acordar entrega posterior al commit y recuperación de fallos, por ejemplo mediante outbox.
- Eventos hoy valida, construye la respuesta y devuelve 200; no llama a publish.
- Traducir tipos/campos: `like_publicacion / usuario_id / datos / timestamp ISO` frente a `LIKE / userId / resourceId / timestamp epoch ms`.
- Resolver UUID frente a usuario_id numérico.
- Acordar IDs de evento, deduplicación, requeue y tipos que transportará el Broker.

Evidencia en repositorios revisados: Eventos `modulo-eventos/src/routes/eventos.js`; Caja de Mensajes `my-project/broker/src/domain/EventMessage.js`.

### 9. Analytics y algoritmo

- Adaptar ingestión SQL al esquema elegido: Analytics usa `publicacion.idpublicacion`, tabla `like`, entidades polimórficas y `carpeta_has_publicacion`; Java usa UUID, `publicacion.id` y `reaccion`.
- Los jobs producen `analytics:recommendations:user:...`, `analytics:trending:global` y `analytics:ranking:songs`.
- El ranking de afinidad Java lee `perfil:{id}:tags`, `grafo:vecinos:...`, `tags:similares:...`, `tendencias:dia`, `usuario_cluster:...` y otras señales. Esas claves no las generan los tres jobs actuales.
- Elegir la interfaz consumida por Java o implementar el productor/adaptador de esas señales.
- Operativizar generación/refresco de embeddings y artefactos. El baseline puede servir resultados aun sin señales; eso no demuestra que Analytics ni el ranking de grafo estén conectados.
- Verificar con MySQL/Redis reales que una interacción cambia los datos de personalización, que las claves no expiradas se usan y que el fallback funciona.

Evidencia en repositorios revisados: Analytics `my-project/analytics-preprocessing/src/output/redis_keys.py`; API `src/main/java/com/inspiraboard/api/repository/RedisAffinitySignalRepository.java`.

### 10. Push

- Reemplazar crearBrokerCliente(): hoy devuelve siempre [].
- Adaptar consume(): Broker devuelve un EventMessage; Push espera un array. Broker usa type; Push valida tipo.
- Resolver autor/destinatarios reales: el resolver actual devuelve undefined.
- Cablear tokens vigentes: FirebaseGateway envía `token: destinatarioUserId`, pero FCM necesita un token de dispositivo real.
- Montar el router de tokens/preferencias en un servidor HTTP o gateway; el main actual solo inicia el worker.
- Alinear autenticación con Java; el middleware utiliza AUTH_DEV_JWT_SECRET y se declara provisional.
- Implementar el registro del navegador, permisos, service worker/mensajería y preferencias visibles.
- Acordar loop de consumo/reintento con el consumo bloqueante del Broker para evitar ciclos concurrentes innecesarios.

Evidencia en Notificaciones Push: `my-project/push-notifications/src/index.ts`, `src/infrastructure/broker-gateway.ts` y `src/infrastructure/firebase-gateway.ts`.

### 11. Catálogo y APIs externas

- Definir canciones, samples y relaciones con publicaciones en el esquema/API común; no encontré ese CRUD ni esas entidades en Java.
- Adaptar las funciones existentes que usan idcancion/idsample.
- Conectar un trigger de sincronización desde la creación/asociación de recursos.
- Agregar el proceso que consume api_sync_pendiente y reintenta las sincronizaciones por rate limit.
- Exponer los metadatos enriquecidos en la API y las pantallas musicales.

Evidencia en APIs Externas: `src/index.js` y `src/core/obtenerMetadatosRecurso.js`.

### 12. Excel y reportes de gestión

- Adaptar las rutas del front: hay clientes para /admin/reportes-analiticas/exportaciones y /reportes/exportar; FastAPI ofrece POST /reportes, GET /reportes/{id}, descarga e historial.
- Unificar la identidad de administrador con Java/gateway; la dependencia de autenticación de Reportes todavía no es obligatoria en los routers.
- Resolver las fuentes SQL `eventos_actividad`, `publicaciones_moderacion` y `desafios`, que no aparecen en las migraciones Java revisadas.
- Resolver otro desacuerdo de Redis: Reportes busca `analytics:ranking:canciones:{periodo}` y `analytics:actividad:usuarios:{periodo}`; los jobs actuales de Analytics no producen esas claves.
- Conectar solicitud, estado, descarga, error e historial; verificar qué persiste después de reiniciar. La composición todavía utiliza repositorios en memoria para solicitudes/reportes generados, aunque hay historial SQLite.
- Confirmar ejecución asíncrona real si se requiere: el handler responde 202, pero SolicitarReporte invoca el generador directamente.

Evidencia en Reportes: `my-project/reportes/src/api/routers/reportes.py`, `src/api/auth.py`, `src/infrastructure/redis/ranking_repository.py` y `src/api/dependencies.py`.

## Primer bloque de trabajo concreto

1. Acordar esquema/IDs y consolidar una candidata de Java dev con el front 002, preservando sus ajustes locales.
2. Alinear sesión y perfil con /usuarios/me y corregir login admin al DTO accessToken/user.
3. Montar perfil/onboarding y comprobar el recorrido completo de identidad.
4. Acordar uploads + JSON de publicaciones y completar crear/ver/editar/borrar.
5. Después conectar búsqueda, carpetas y moderación.

Este bloque deja una aplicación utilizable y datos consistentes sobre los que conectar los módulos restantes.
