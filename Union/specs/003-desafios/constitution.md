# Constitution — 003 Desafíos (Frontend)

Constitution complementaria de `.specify/memory/constitution.md`. Todos sus principios siguen vigentes y este módulo no puede contradecirlos. Aplica solo a este spec.

## Propósito y alcance

Red social de inspiración artística donde los usuarios proponen desafíos y los administradores publican desafíos completos. Cada desafío incluye fotos, nombre, descripción larga, fecha de inicio, fecha de fin y tags del ámbito artístico.

Funcionalidad incluida: **proponer desafíos (usuarios), publicar desafíos completos (admins), editarlos, borrarlos, filtrarlos y ver las respuestas a cada desafío**.

### Stack
- Frontend: las 2 aplicaciones React existentes (usuario y administración/moderación). No se crean aplicaciones nuevas.
- API REST en Java: **fuera del alcance de este speckit**; se conectará en una iteración futura.

### Módulo
- **Desafíos**: propuesta de desafíos mediante solicitudes, publicación de desafíos completos, visualización de respuestas de usuarios y clasificación por tags de ámbito.

### Frontend de usuario
- Ver y filtrar desafíos por tag de ámbito y por estado.
- Ver el detalle de un desafío y las respuestas de los usuarios.
- Enviar, editar y borrar sus propias solicitudes de desafío.
- Enviar, editar y borrar sus propias respuestas a un desafío.

### Frontend de administración/moderación
- Publicar, editar y eliminar desafíos completos.
- Gestionar las solicitudes de desafío enviadas por usuarios.
- Editar o eliminar cualquier desafío o solicitud; eliminar cualquier respuesta, sin editarla.

## Principios obligatorios

1. **La especificación manda.** No se programa funcionalidad, pantalla, componente o flujo sin trazabilidad a una historia de usuario o requisito del alcance. Lo no definido se resuelve en la etapa de aclaración, no durante la implementación.
2. **Dominio con OO real.** Evitar clases anémicas. Las entidades `Desafio`, `SolicitudDesafio` y `RespuestaDesafio` encapsulan sus reglas (validación de fechas, transiciones de estado, quién puede modificarlas) y no las delegan a componentes de UI.
3. **API REST Java externa.** El frontend consumirá una API REST Java que no se implementa en este speckit; solo se integra cuando alguien la conecte a su backend en una próxima iteración.
4. **Sin backend, ni siquiera de prueba.** No se crean endpoints, servidores ni lógica de servidor simulada. Los datos de ejemplo viven detrás de una interfaz de servicio (puerto) que luego se reemplaza por el cliente de la API.
5. **Separación por capas.**
   - Dominio: entidades, value objects, enums y reglas de negocio de desafíos.
   - Aplicación/servicios: casos de uso (proponer desafío, publicar desafío, listar y filtrar desafíos, ver respuestas, etc.).
   - Frontend usuario: UI React para usuarios y artistas.
   - Frontend administración: UI React separada para administradores.
6. **Dos frontends separados** con responsabilidades diferenciadas.
   - Usuario: ver, filtrar y consultar desafíos y respuestas; gestionar únicamente sus propias solicitudes y respuestas. **Nunca publica un desafío completo**, solo envía solicitudes.
   - Administración: publicar desafíos completos; editar o borrar cualquier desafío y solicitud; borrar cualquier respuesta, sin editarla.
   - Ningún frontend accede directamente a MySQL ni asume responsabilidades del backend.
7. **Enums y value objects para valores cerrados**:
   - `EstadoSolicitudDesafio`: `PENDIENTE`, `APROBADA`, `RECHAZADA`.
   - `EstadoDesafio`: `PROGRAMADO`, `ACTIVO`, `FINALIZADO`, `ELIMINADO` (borrado lógico persistido, A1 resuelta).
   - `AmbitoDesafio`: tags de ámbito del catálogo cerrado (ver punto de aclaración A2).
   - `RolUsuario`: `USER`, `ADMIN` (reutilizado del módulo general).
   - `RangoFechas`: value object que garantiza que la fecha de fin sea posterior a la de inicio.
   - `TipoFiltroDesafio`: `AMBITO`, `ESTADO`, `FECHA`.
8. **Toda regla de negocio importante tiene tests**, por ejemplo:
   - Un desafío no puede tener fecha de fin anterior o igual a la de inicio.
   - Un desafío debe tener nombre, descripción larga y al menos una foto.
   - Solo un admin puede publicar un desafío completo.
   - Un usuario normal solo puede crear solicitudes de desafío.
   - Un usuario solo puede editar o eliminar sus propias solicitudes y respuestas.
   - Solo un admin puede editar o eliminar desafíos de cualquier usuario.
   - Un desafío debe tener al menos un tag de ámbito, y solo se aceptan tags del catálogo definido.
   - Las acciones administrativas destructivas requieren confirmación explícita en la interfaz.
9. **Seguridad en el backend.** Los permisos se validan en el backend y se reflejan en las interfaces. Ocultar un botón de "Publicar desafío" a un usuario normal no reemplaza la autorización.
10. **Escalabilidad.** El módulo debe soportar gran cantidad de desafíos, solicitudes y respuestas. La lista de desafíos, los filtros por tag y por estado, y las respuestas de cada desafío usan paginación o scroll infinito servido por la API. No se recorren ni filtran listas completas en memoria. El backend se apoya en consultas, índices de BD y caché Redis cuando corresponda.
11. **Usabilidad y rendimiento.**
    - La página de desafíos muestra nombre, foto principal, tags, fecha de inicio y fecha de fin, con indicación visible de si está programado, activo o finalizado.
    - La página de detalle muestra fotos, descripción larga, tags, fechas y respuestas de usuarios, con carga progresiva.
    - Filtrar por tag de ámbito y por estado debe ser simple.
    - Los formularios de solicitud y de desafío dan validación clara y mensajes de error comprensibles.
12. **Eficiencia del admin.** Las acciones sensibles (editar o eliminar desafíos, solicitudes o respuestas) se diferencian visualmente de las de consulta. Publicar un desafío completo y gestionar solicitudes pendientes deben poder hacerse con pocos pasos.
13. **Confirmación explícita** antes de acciones destructivas o administrativas sensibles: eliminación de desafíos, solicitudes y respuestas, y edición de un desafío que ya está `ACTIVO` o tiene respuestas.
14. **Rankings, recomendaciones y estadísticas** pertenecen al backend. Los frontends consumen los resultados de la API y no recalculan rankings de respuestas, popularidad de desafíos ni estadísticas.
15. **Sin código en fases documentales.** En especificación, aclaración, checklist, planificación y generación de tareas solo se crean o actualizan documentos.

## Reglas de estado y fechas

- Los estados `PROGRAMADO`, `ACTIVO` y `FINALIZADO` se **derivan de `RangoFechas` y de la fecha actual**. No se almacenan de forma redundante.
- Cualquier transición que no sea derivada de fechas (por ejemplo, `ELIMINADO`) debe modelarse explícitamente en la entidad `Desafio`, no en componentes de UI.

## Puntos pendientes de aclaración

Estos puntos no están definidos en la entrada. Se resuelven en la etapa de aclaración antes de planificar y no se asumen en la implementación.

- ~~**A1. `ELIMINADO` en `EstadoDesafio`.**~~ Resuelta: borrado lógico con `ELIMINADO` persistido.
- **A2. Catálogo de `AmbitoDesafio`.** Los ejemplos (`ESCULTURA`, `DIBUJO_TRADICIONAL`, `DIBUJO_DIGITAL`) no son un catálogo cerrado. Hay que definir la lista completa.
- ~~**A3. Efecto de aprobar una solicitud.**~~ Resuelta: aprobar solo cambia el estado; publicar es un paso aparte.
- **A4. Modificación de solicitudes ya resueltas.** Falta definir si un usuario puede editar o borrar una solicitud `APROBADA` o `RECHAZADA`.
- ~~**A5. Respuestas según estado del desafío.**~~ Resuelta: solo mientras el desafío está `ACTIVO`.
- ~~**A6. Límites de contenido.**~~ Resuelta: 1 a 5 fotos, JPEG o PNG; el tamaño lo valida el backend.
- ~~**A7. Edición de desafíos con respuestas.**~~ Resuelta: todos los campos editables, con confirmación explícita.

## Gobernanza

- Esta constitution prevalece sobre prácticas ad hoc dentro del spec 003 y complementa al constitution general del proyecto.
- Enmiendas: documentadas, con justificación y fecha.
- Todo plan, tarea y revisión debe verificar el cumplimiento de estos principios.

### Historial de enmiendas
- **1.1.0 (2026-10-11), MINOR**: el admin solo borra respuestas de desafíos, sin editarlas. Motivación: decisión de la clarificación del spec 003, alineada con RF-08 del spec 002 (el admin no edita contenido ajeno). Módulos afectados: Desafíos (respuestas). Se resuelven A1, A3, A5, A6 y A7.

**Versión**: 1.1.0 | **Ratificada**: 2026-10-11 | **Última enmienda**: 2026-10-11
</content>
