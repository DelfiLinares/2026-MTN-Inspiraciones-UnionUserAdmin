<!--
Sync Impact Report
==================
Version change: 1.0.0 → 2.0.0 (MAJOR — redefinición de alcance y principios)
Modified principles:
  - Alcance reducido de "red social completa (2 frontends + backend propio)"
    a "red social de inspiración artística con 1 frontend React de
    administración/moderación únicamente"; el backend se consume vía API REST
    Java ya existente/externa y NO se implementa en este repositorio/speckit.
  - Reemplazo íntegro de los 18 principios previos por 15 principios nuevos
    alineados al encargo del administrador (gestión de usuarios,
    publicaciones y reportes).
Added sections:
  - Core Principles (15 principios, I–XV)
  - Módulos del Sistema
  - Alcance del Frontend de Administración
  - Enums y Value Objects Obligatorios
  - Arquitectura y Responsabilidades por Capa (frontend-only)
  - Governance
Removed sections:
  - Stack tecnológico multi-servicio (Spring Boot, Node.js, RabbitMQ,
    Firebase, Python, MongoDB) — fuera de alcance del speckit actual.
  - Frontend de usuario y sus historias (módulo no cubierto por este
    speckit; pertenece a otro proyecto/iteración).
Templates requiring updates:
  - .specify/templates/plan-template.md ⚪ no verificado
  - .specify/templates/spec-template.md ⚪ no verificado
  - .specify/templates/tasks-template.md ⚪ no verificado
  - .specify/templates/checklist-template.md ⚪ no verificado
Follow-up TODOs:
  - Conectar el frontend administrativo a la API REST Java real cuando
    exista una iteración de integración backend-frontend.
-->

# Inspiraciones Union — Admin/Moderación Constitution

## Contexto del Proyecto

Red social de inspiración artística donde usuarios y artistas comparten
creaciones (dibujos, música, esculturas, etc.) y se inspiran entre sí. Este
speckit cubre **exclusivamente** la parte de administración: gestión de
usuarios (eliminar, banear, promover a admin), gestión de publicaciones
(editar, eliminar) y gestión de reportes (exportar, aceptar, rechazar).

**Stack tecnológico de este speckit**: 1 aplicación **React** para
administración/moderación. No existe implementación de backend en este
speckit; el frontend consumirá en una iteración futura una API REST Java ya
provista externamente.

## Core Principles

### I. La especificación manda sobre la implementación
No se debe programar funcionalidad, pantalla, componente o flujo que no esté
trazado a una historia de usuario o requisito del documento de alcance
correspondiente.

### II. Dominio orientado a objetos real
El dominio debe modelarse con orientación a objetos real. Se evitan clases
anémicas cuando existan reglas de negocio claras: las entidades encapsulan
las reglas que les corresponden, sin trasladar toda la lógica a
controladores o componentes de interfaz.

### III. La API Java no se implementa en este speckit
El frontend va a usar una API REST de Java, pero esta no debe ser
implementada en el speckit. La única forma de conectarlo será cuando una
persona lo integre con su backend en una próxima iteración.

### IV. Prohibido implementar backend, incluso para pruebas
No se deben crear funciones de backend, ni siquiera a modo de prueba. El
proyecto debe funcionar únicamente como frontend.

### V. Separación de responsabilidades por capa
- **Dominio**: entidades, value objects, enums y reglas de negocio.
- **Aplicación/servicios**: casos de uso y lógica de aplicación.
- **Frontend administración**: interfaz React separada para administradores.

### VI. Frontend administrativo autónomo y de responsabilidad acotada
El frontend de administración se mantiene como una aplicación separada, con
responsabilidades claramente diferenciadas:
- Implementa exclusivamente funcionalidades de administración: editar y
  borrar publicaciones de cualquier usuario; banear, eliminar y promover
  usuarios; y exportar reportes.
- No accede directamente a MySQL ni implementa responsabilidades propias
  del backend.

### VII. Enums y value objects para valores cerrados
Se deben usar enums o value objects cuando representen valores cerrados,
por ejemplo: `EstadoPublicacion`, `RolUsuario`, `EstadoCuentaUsuario`,
`EstadoModeracion`, `MotivoReporte`, `PrioridadReporte`.

### VIII. Tests obligatorios de reglas de negocio
Toda regla de negocio importante debe tener tests, por ejemplo:
- Solo el admin puede eliminar o editar las publicaciones de cualquier
  usuario.
- Solo el admin puede banear, eliminar o crear usuarios.
- Solo el admin puede leer, exportar, aceptar y rechazar reportes.
- Solo un admin puede promover a otro usuario a admin.
- Solo usuarios con rol `ADMIN` pueden realizar acciones administrativas.
- Las acciones administrativas destructivas requieren confirmación
  explícita en la interfaz.

### IX. Seguridad validada en backend, reflejada en frontend
La seguridad y los permisos deben validarse en el backend y reflejarse
correctamente en las interfaces. Ocultar una acción en el frontend no
reemplaza la autorización del backend.

### X. Escalabilidad por diseño
El sistema debe poder escalar a una gran cantidad de publicaciones,
usuarios y reportes. Las búsquedas, filtros y recomendaciones no deben
depender de recorrer listas completas en memoria; deben apoyarse en
consultas, índices de base de datos y caché Redis cuando corresponda (del
lado del backend que consumirá el frontend).

### XI. Usabilidad, claridad y rendimiento como prioridad
La interfaz de admin debe priorizar usabilidad, claridad y rendimiento.
Gestionar usuarios, reportes y publicaciones debe ser simple, rápido y
claro.

### XII. Eficiencia operativa del administrador/moderador
Los reportes pendientes deben poder encontrarse y resolverse de forma
rápida, mostrando claramente su estado y prioridad. Las acciones sensibles
(eliminar, banear, promover) deben diferenciarse visualmente de las
acciones de consulta.

### XIII. Confirmación explícita en acciones destructivas
Las acciones destructivas o administrativas sensibles deben requerir
confirmación explícita antes de ejecutarse cuando corresponda. Esto
incluye eliminar o editar publicaciones, eliminar o banear usuarios, y
promover usuarios a administradores.

### XIV. Analytics y recomendaciones fuera del frontend
Las funcionalidades de recomendaciones y analytics pertenecen a los
módulos correspondientes del backend/procesamiento. El frontend debe
consumir los resultados proporcionados por la API y no recalcular
rankings, recomendaciones ni estadísticas complejas en el cliente.

### XV. Prohibición de código en fases de especificación
No se debe implementar código durante las fases de especificación,
aclaración, checklist, planificación y generación de tareas. Durante estas
etapas solo se crean o actualizan los documentos correspondientes.

## Módulos del Sistema

- **Promoción de usuario a admin**: cambiar el valor del rol `RolUsuario`
  de un usuario a `ADMIN`.
- **Gestionar usuarios**: banear por cierta cantidad de tiempo o por
  siempre a un usuario, y eliminar su cuenta.
- **Gestionar publicaciones**: editar o eliminar la publicación de
  cualquier usuario.
- **Exportar reportes**: exportar y ver los reportes pendientes por
  revisar, aceptarlos o rechazarlos.

## Alcance del Frontend de Administración

Incluye únicamente:
- Gestión de usuarios y publicaciones.
- Promoción de usuarios.
- Revisión de reportes (ver, exportar, aceptar, rechazar).

Fuera de alcance: cualquier funcionalidad de backend, persistencia directa,
cálculo de analytics/recomendaciones, y cualquier flujo propio del frontend
de usuario final (registro, publicación, descubrimiento, etc.), que
pertenece a otro proyecto/speckit.

## Enums y Value Objects Obligatorios

- `EstadoPublicacion`: `ACTIVA`, `REPORTADA`, `ELIMINADA`.
- `RolUsuario`: `USER`, `ADMIN`.
- `EstadoCuentaUsuario`: `ACTIVO`, `BANEADO`, `ELIMINADO`.
- `EstadoModeracion`: `PENDIENTE`, `EN_REVISION`, `RESUELTO`, `DESESTIMADO`.
- `MotivoReporte`: `SPAM`, `CONTENIDO_INAPROPIADO`,
  `PLAGIO_DERECHOS_AUTOR`, `VIOLENCIA`, `OTRO`.
- `PrioridadReporte`: `ALTA`, `MEDIA`, `BAJA`.

## Arquitectura y Responsabilidades por Capa

1. **Dominio** encapsula entidades, value objects, enums y reglas de
   negocio (p. ej. quién puede banear, promover o resolver reportes).
2. **Aplicación/servicios** orquesta casos de uso (banear usuario, exportar
   reporte, promover a admin) sin lógica de negocio propia duplicada.
3. **Frontend administración** solo presenta datos y dispara casos de uso;
   no implementa persistencia, analytics complejos, generación de archivos
   del lado servidor, ni acceso directo a base de datos.

Controles mínimos de revisión:
- Trazabilidad requisito → tarea → implementación.
- Toda regla de negocio crítica (lista en el Principio VIII) tiene test
  asociado.
- No se agrega ninguna llamada o simulación de backend dentro del
  speckit/frontend.
- Acciones destructivas siempre pasan por confirmación explícita en la UI.

## Governance

Esta constitución prevalece sobre prácticas informales y decisiones ad hoc
del frontend de administración del proyecto `Union`.

### Reglas de enmienda
1. Toda enmienda debe documentar motivación, impacto y módulos afectados.
2. Versionado semántico:
   - **MAJOR**: cambio incompatible en principios o en el alcance.
   - **MINOR**: nuevo principio o expansión normativa relevante.
   - **PATCH**: aclaraciones sin cambio semántico.
3. Toda enmienda actualiza `Last Amended` y el Sync Impact Report.

### Cumplimiento
- Todo plan (`/speckit.plan`) debe incluir `Constitution Check`.
- Toda tarea de regla de negocio debe incluir test asociado.
- Incumplimientos deben registrarse como deuda técnica explícita con plan
  de resolución.

**Version**: 2.0.0 | **Ratified**: 2026-09-15 | **Last Amended**: 2026-10-01
