# Constitution — 002 Inspiraciones: Publicaciones (Frontend)

Constitution independiente de la de `001-plataforma-unificada` y de `.specify/memory/constitution.md`. Aplica solo a este spec.

## Propósito y alcance

Red social de inspiración artística donde usuarios y artistas comparten creaciones (dibujos, música, esculturas, etc.) y se inspiran en las de otros.

Funcionalidad incluida: **crear, editar, borrar (autor o admin) y filtrar publicaciones**.

### Stack
- Frontend: 2 aplicaciones React (usuario y administración/moderación).
- API REST en Java: **fuera del alcance de este speckit**; se conectará en una iteración futura.

### Módulo
- **Publicación de Contenido**: subida de creaciones con tutoriales, técnicas e inspiraciones adjuntas; organización por tags, categorías y carpetas; guardado de inspiraciones.

### Frontend de usuario
- Publicación y gestión de creaciones propias (crear, editar, borrar).
- Likes, comentarios y guardado de inspiraciones.
- Búsqueda y filtros.

### Frontend de administración/moderación
- Moderación de publicaciones (editar y borrar las de cualquier usuario).

## Principios obligatorios

1. **La especificación manda.** No se programa funcionalidad, pantalla, componente o flujo sin trazabilidad a una historia de usuario o requisito del alcance.
2. **Dominio con OO real.** Evitar clases anémicas; las entidades encapsulan sus reglas de negocio y no se delegan a controladores o componentes de UI.
3. **API REST Java externa.** El frontend consumirá una API REST Java que no se implementa en este speckit; solo se integra cuando alguien la conecte a su backend en una próxima iteración.
4. **Sin backend, ni siquiera de prueba.** Todo funciona únicamente como frontend (sin servidores, endpoints ni lógica de servidor simulada).
5. **Separación por capas.**
   - Dominio: entidades, value objects, enums y reglas de negocio.
   - Aplicación/servicios: casos de uso y lógica de aplicación.
   - Frontend usuario: UI React para usuarios y artistas.
   - Frontend administración: UI React separada para administradores.
6. **Dos frontends separados** con responsabilidades diferenciadas.
   - Usuario: crear, editar y borrar únicamente sus propias publicaciones.
   - Administración: exclusivamente funciones administrativas (editar y borrar publicaciones de cualquier usuario).
   - Ningún frontend accede directamente a MySQL ni asume responsabilidades del backend.
7. **Enums/value objects para valores cerrados**: `TipoContenido` (IMAGEN, VIDEO, MUSICA, TUTORIAL), `RolUsuario` (USER, ADMIN), `EstadoPublicacion` (ACTIVA, REPORTADA, ELIMINADA), `TipoFiltro` (ESTILO, TECNICA, TIPO_ARTE, DISTANCIA).
8. **Toda regla de negocio importante tiene tests**, por ejemplo:
   - Solo el autor o un admin puede eliminar una publicación.
   - Solo un admin puede promover a otro usuario a admin.
   - Un usuario no puede reportar su propia publicación.
   - Solo usuarios ADMIN realizan acciones administrativas.
   - Las acciones administrativas destructivas requieren confirmación explícita en la interfaz.
9. **Seguridad en el backend.** Los permisos se validan en el backend y se reflejan en las interfaces; ocultar una acción en el frontend no reemplaza la autorización.
10. **Escalabilidad.** Soportar gran cantidad de publicaciones, usuarios y reportes. Búsquedas, filtros y recomendaciones no recorren listas completas en memoria: se apoyan en consultas, índices de BD y caché Redis (responsabilidad del backend); el frontend usa paginación/scroll incremental.
11. **Usabilidad y rendimiento.** Encontrar contenido inspirador debe ser simple, rápido y claro. El buscador permite filtros por estilo, tipo de arte, técnica y demás criterios del alcance.
12. **Eficiencia del admin.** Las acciones sensibles (editar/eliminar publicaciones ajenas) se diferencian visualmente de las de consulta.
13. **Confirmación explícita** antes de acciones destructivas o administrativas sensibles: eliminación de publicaciones, eliminación o baneo de usuarios y promoción a administrador.
14. **Recomendaciones y analytics** pertenecen al backend/procesamiento. Los frontends consumen los resultados de la API y no recalculan rankings, recomendaciones ni estadísticas complejas.
15. **Sin código en fases documentales.** En especificación, aclaración, checklist, planificación y generación de tareas solo se crean o actualizan documentos.

## Gobernanza

- Esta constitution prevalece sobre prácticas ad hoc dentro del spec 002.
- Enmiendas: documentadas, con justificación y fecha.
- Todo plan, tarea y revisión debe verificar el cumplimiento de estos principios.

**Versión**: 1.0.0 | **Ratificada**: 2026-10-01
