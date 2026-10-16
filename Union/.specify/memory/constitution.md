<!--
Sync Impact Report
==================
Version change: 2.0.0 → 3.0.0 (MAJOR — ampliación de alcance y redefinición
de principios)

Modified principles:
  - Alcance ampliado de "1 frontend React de administración/moderación
    únicamente" a "1 frontend React compartido por usuarios y
    administradores", incorporando el módulo de **perfil** (datos del
    perfil, carpetas de posts guardados y posts propios).
  - V (Separación por capa): la capa de presentación pasa de "frontend
    administración" a "frontend usuarios y administradores".
  - VI (Responsabilidad acotada): se redefine para incluir visualización
    del perfil propio y de terceros (con botón de seguir), y edición
    restringida al perfil propio.
  - VII (Enums): quedan como obligatorios `RolUsuario` y
    `EstadoCuentaUsuario`.
  - VIII (Tests obligatorios): se reemplaza la lista de reglas de
    moderación por las 13 reglas de negocio del módulo de perfil
    (seguir, carpetas, validaciones de nombre de usuario / sobre mí /
    descripción, límite de 50 carpetas, etc.).
  - XI, XII, XIII: reorientados a usabilidad, eficiencia y confirmación
    explícita sobre datos de perfil y carpetas.

Added sections:
  - Reglas de Validación de Datos del Perfil y Carpetas (nueva sección
    normativa con límites de caracteres y de cantidad).
  - Módulos del Sistema: Editar perfil, Editar carpetas, Editar posts.
  - Alcance del Frontend (usuarios y administradores).

Removed sections:
  - Módulos de moderación como alcance único (promoción, baneo,
    reportes) — permanecen como legado entregado en el speckit 002, pero
    ya no definen por sí solos el alcance global.
  - Enums exclusivos de moderación (`EstadoPublicacion`,
    `EstadoModeracion`, `MotivoReporte`, `PrioridadReporte`) dejan de ser
    obligatorios para este alcance.

Templates requiring updates:
  - .specify/templates/plan-template.md ⚪ no verificado (directorio de
    templates no encontrado en el repositorio)
  - .specify/templates/spec-template.md ⚪ no verificado
  - .specify/templates/tasks-template.md ⚪ no verificado
  - .specify/templates/checklist-template.md ⚪ no verificado

Follow-up TODOs:
  - Ejecutar `/speckit.specify` para el módulo de perfil en la branch
    `004-inspiraciones-perfil` (specs/004-inspiraciones-perfil/).
  - Conectar el frontend a la API REST Java real cuando exista una
    iteración de integración backend-frontend.
  - Revisar si el módulo 002 (administración/moderación) requiere
    re-validar su Constitution Check contra esta versión 3.0.0.
-->

# Inspiraciones Union — Constitution

## Contexto del Proyecto

Red social de inspiración artística donde usuarios y artistas comparten
creaciones (dibujos, música, esculturas, etc.) y se inspiran entre sí.

Este speckit cubre el **frontend** de la plataforma, usado tanto por
usuarios como por administradores. El alcance vigente incorpora el
**módulo de perfil**: pantalla de perfil propia y de terceros, con datos
del perfil (foto de perfil, nombre de usuario, sobre mí, descripción),
carpetas de posts guardados y posts propios de esa persona.

Desde un post se puede acceder al perfil de su autor tocando la foto de
perfil o el nombre de usuario; al visitar un perfil ajeno aparece la
opción de seguirlo.

**Stack tecnológico de este speckit**: 1 aplicación **React** para
usuarios y administradores. No existe implementación de backend en este
speckit; el frontend consumirá en una iteración futura una API REST Java
ya provista externamente.

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
- **Frontend usuarios y administradores**: interfaz React para ambos
  roles.

### VI. Frontend autónomo y de responsabilidad acotada
El frontend se mantiene como una aplicación separada, con
responsabilidades claramente diferenciadas:
- Tanto para usuarios como para administradores, debe permitir visualizar
  el perfil propio o el de otros usuarios —en este último caso, agregando
  el botón de seguir— con su información: foto de perfil, nombre de
  usuario, sobre mí, descripción, sus carpetas con posts guardados y sus
  propios posts.
- Debe permitir editar esta información **únicamente del propio perfil**,
  cuando se desee.
- Ningún frontend debe acceder directamente a MySQL ni implementar
  responsabilidades propias del backend.

### VII. Enums y value objects para valores cerrados
Se deben usar enums o value objects cuando representen valores cerrados,
por ejemplo:
- `RolUsuario`: `USER`, `ADMIN`.
- `EstadoCuentaUsuario`: `ACTIVO`, `BANEADO`, `ELIMINADO`.

### VIII. Tests obligatorios de reglas de negocio
Toda regla de negocio importante debe tener tests. Para el alcance de
perfil, como mínimo:
1. Cualquier tipo de usuario puede seguir a otra persona mediante el
   acceso a su perfil.
2. Cualquier tipo de usuario puede crear carpetas de posts guardados,
   indicándole un nombre.
3. Cualquier tipo de usuario puede editar los datos de su propio perfil
   únicamente.
4. El sistema DEBE permitir crear, renombrar y eliminar carpetas de posts
   guardados desde el perfil, indicando al menos un nombre al crearlas
   que no supere los 15 caracteres y permita espacios.
5. Al guardar un post, el sistema DEBE permitir seleccionar una carpeta
   existente o crear una nueva en el mismo flujo, sin salir de la
   publicación.
6. El sistema DEBE advertir que el contenido guardado se perderá al
   eliminar una carpeta, aclarando que los posts originales no se
   eliminan de la plataforma.
7. El sistema DEBE permitir quitar un post de una carpeta sin eliminarlo
   de la plataforma.
8. La lista de carpetas del usuario DEBE soportar hasta un máximo de 50
   carpetas sin degradar la interfaz, usando scroll o paginación si es
   necesario; el sistema DEBE impedir la creación de una nueva carpeta al
   alcanzar dicho límite.
9. Las carpetas de posts guardados de un usuario DEBEN ser visibles
   públicamente en su perfil, mostrando nombre y cantidad de posts, para
   cualquier visitante o usuario autenticado.
10. Todos los posts pertenecientes específicamente a ese usuario deben ser
    visibles en su perfil.
11. El nombre de usuario debe permitir números, mayúsculas, minúsculas,
    guiones bajos y puntos; no debe superar los 10 caracteres y no debe
    permitir espacios.
12. El "sobre mí" del usuario no debe superar los 80 caracteres,
    permitiendo espacios.
13. La descripción del usuario no debe superar los 200 caracteres,
    permitiendo espacios.

### IX. Seguridad validada en backend, reflejada en frontend
La seguridad y los permisos deben validarse en el backend y reflejarse
correctamente en las interfaces. Ocultar una acción en el frontend no
reemplaza la autorización del backend.

### X. Escalabilidad por diseño
El sistema debe poder escalar a una gran cantidad de carpetas, posts y
usuarios. Las búsquedas, filtros y recomendaciones no deben depender de
recorrer listas completas en memoria; deben apoyarse en consultas,
índices de base de datos y caché Redis cuando corresponda (del lado del
backend que consumirá el frontend).

### XI. Usabilidad, claridad y rendimiento como prioridad
La interfaz debe priorizar usabilidad, claridad y rendimiento. Gestionar
los datos del perfil y las carpetas, y visualizar los posts, debe ser
simple, rápido y claro.

### XII. Eficiencia operativa
El frontend debe priorizar la eficiencia operativa. Los datos del perfil
deben poder editarse de forma rápida, mostrando claramente la foto de
perfil, el nombre de usuario, el sobre mí y la descripción. Las acciones
sensibles —como eliminar o renombrar una carpeta— deben diferenciarse
visualmente de las acciones de consulta.

### XIII. Confirmación explícita en acciones destructivas
Las acciones destructivas o sensibles deben requerir confirmación
explícita antes de ejecutarse cuando corresponda. Esto incluye eliminar o
editar carpetas y editar el nombre de usuario.

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

- **Editar perfil**: modificar los datos del perfil del usuario (foto de
  perfil, nombre de usuario, sobre mí, descripción).
- **Editar carpetas**: editar el nombre de una carpeta, eliminarla o
  crearla.
- **Editar posts**: eliminar o editar un post propio (**NO CREAR**).

## Alcance del Frontend (usuarios y administradores)

Incluye únicamente:
- Gestión de datos del perfil.
- Gestión de carpetas.
- Gestión de posteos (editar/eliminar posts propios).

Fuera de alcance: cualquier funcionalidad de backend, persistencia
directa, cálculo de analytics/recomendaciones, **creación** de posts, y
cualquier flujo no trazado a una historia de usuario del documento de
alcance vigente.

## Enums y Value Objects Obligatorios

- `RolUsuario`: `USER`, `ADMIN`.
- `EstadoCuentaUsuario`: `ACTIVO`, `BANEADO`, `ELIMINADO`.

> Los enums de moderación (`EstadoPublicacion`, `EstadoModeracion`,
> `MotivoReporte`, `PrioridadReporte`) pertenecen al módulo de
> administración ya entregado (speckit 002) y se conservan como legado;
> no son obligatorios para el alcance de perfil.

## Reglas de Validación de Datos del Perfil y Carpetas

Estas reglas son normativas y DEBEN reflejarse tanto en el dominio como
en la interfaz:

| Campo | Longitud máxima | Espacios | Caracteres permitidos |
|---|---|---|---|
| Nombre de usuario | 10 | ❌ No permitidos | números, mayúsculas, minúsculas, `_`, `.` |
| Sobre mí | 80 | ✅ Permitidos | sin restricción adicional declarada |
| Descripción | 200 | ✅ Permitidos | sin restricción adicional declarada |
| Nombre de carpeta | 15 | ✅ Permitidos | sin restricción adicional declarada |

| Límite | Valor |
|---|---|
| Cantidad máxima de carpetas por usuario | 50 |

Al alcanzar el límite de 50 carpetas, el sistema DEBE impedir la creación
de nuevas carpetas y comunicarlo claramente en la interfaz.

## Arquitectura y Responsabilidades por Capa

1. **Dominio** encapsula entidades, value objects, enums y reglas de
   negocio (p. ej. validación del nombre de usuario, límite de carpetas,
   quién puede editar un perfil).
2. **Aplicación/servicios** orquesta casos de uso (editar perfil, crear
   carpeta, seguir usuario, quitar post de carpeta) sin duplicar lógica
   de negocio propia del dominio.
3. **Frontend** solo presenta datos y dispara casos de uso; no implementa
   persistencia, analytics complejos, generación de archivos del lado
   servidor, ni acceso directo a base de datos.

Controles mínimos de revisión:
- Trazabilidad requisito → tarea → implementación.
- Toda regla de negocio crítica (lista en el Principio VIII) tiene test
  asociado.
- No se agrega ninguna llamada o simulación de backend dentro del
  speckit/frontend.
- Acciones destructivas siempre pasan por confirmación explícita en la UI.
- La edición de datos de perfil está habilitada únicamente sobre el
  perfil propio.

## Governance

Esta constitución prevalece sobre prácticas informales y decisiones ad hoc
del frontend del proyecto `Union`.

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

**Version**: 3.0.0 | **Ratified**: 2026-09-15 | **Last Amended**: 2026-10-06
