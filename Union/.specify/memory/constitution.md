<!--
Sync Impact Report
==================
Version change: [TEMPLATE] → 1.0.0 (initial ratification)
Modified principles: N/A (first ratified version)
Added sections:
  - Core Principles (18 principles, I–XVIII)
  - Alcance del Sistema y Fronteras de Responsabilidad
  - Arquitectura y Responsabilidades por Capa
  - Governance
Removed sections: none (template placeholders replaced)
Templates requiring updates:
  - .specify/templates/plan-template.md ⚪ no verificado (no existe aún en Union)
  - .specify/templates/spec-template.md ⚪ no verificado (no existe aún en Union)
  - .specify/templates/tasks-template.md ⚪ no verificado (no existe aún en Union)
  - .specify/templates/checklist-template.md ⚪ no verificado (no existe aún en Union)
Follow-up TODOs:
  - Crear templates de SpecKit en Union cuando se inicialice el workflow completo.
-->

# Inspiraciones Union Constitution

## Core Principles

### I. La especificación manda sobre la implementación
No se implementará funcionalidad, pantalla, componente, endpoint, flujo ni integración que no esté trazada a historias de usuario o requisitos del documento de alcance vigente.

### II. Dominio orientado a objetos real
Las reglas de negocio deben vivir en entidades y value objects cuando corresponda; se evitan clases anémicas si existen invariantes, políticas o transiciones de estado del dominio.

### III. Separación estricta por capas
Se respetan las capas y responsabilidades:
- **Dominio**: entidades, value objects, enums, invariantes y reglas.
- **Aplicación/Servicios**: casos de uso, orquestación y políticas de aplicación.
- **Infraestructura**: MySQL/Redis, clientes APIs externas, broker, Firebase, adaptadores.
- **Presentación/API**: controladores REST, DTOs y validación de entrada/salida.
- **Frontend Usuario**: UI React para usuarios/artistas.
- **Frontend Administración**: UI React separada para administración/moderación.

### IV. Frontends separados y con límites claros
El frontend de usuario y el frontend administrativo son aplicaciones distintas, con responsabilidades no superpuestas. Ninguno accede directamente a MySQL ni asume responsabilidades de backend.

### V. Backend Java limpio y delegación correcta
En la API Spring Boot se evita lógica duplicada, métodos gigantes, validaciones incrustadas en controladores e `instanceof` innecesario. Los controladores delegan casos de uso a servicios de aplicación.

### VI. Frontend en capas, sin llamadas directas desde componentes
En ambos frontends, la presentación no debe llamar directamente a la API. Toda comunicación externa pasa por servicios de aplicación e infraestructura.

### VII. Enums y value objects para valores cerrados
Valores cerrados deben representarse con tipos explícitos (enums/value objects), por ejemplo: `TipoContenido`, `RolUsuario`, `EstadoPublicacion`, `EstadoDesafioPropuesto`, `TipoFiltro`, `MotivoReporte`.

### VIII. Tests obligatorios de reglas de negocio
Toda regla de negocio importante debe tener tests automatizados (happy path + casos límite), incluyendo permisos, reportes, promoción de roles y confirmaciones de acciones sensibles.

### IX. Seguridad en backend, reflejo en frontend
Autorización y permisos se validan en backend. Ocultar acciones en UI no reemplaza controles de seguridad del servidor.

### X. Escalabilidad por diseño
Búsquedas, filtros, rankings y recomendaciones deben resolverse con consultas, índices y cache (Redis) cuando corresponda; se prohíbe depender de recorridos completos en memoria para casos de alta escala.

### XI. UX de descubrimiento como prioridad
La experiencia de descubrimiento artístico debe ser clara y rápida. El buscador debe exponer filtros por estilo, tipo de arte, técnica y demás criterios definidos por alcance.

### XII. Eficiencia operativa del frontend administrativo
La UI administrativa debe optimizar resolución de reportes y moderación, destacando estado/prioridad y diferenciando visualmente acciones sensibles de las de consulta.

### XIII. Confirmación explícita en acciones destructivas
Eliminar publicaciones, eliminar/banear usuarios y promover usuarios a admin requiere confirmación explícita cuando aplique.

### XIV. Analytics y recomendaciones fuera del frontend
Los cálculos complejos de analytics/rankings/recomendaciones pertenecen a backend y módulos de procesamiento. Los frontends solo consumen resultados expuestos por la API.

### XV. Integraciones externas con cacheo responsable
Las integraciones (lyrics.ovh, YouTube y afines) se encapsulan en sus módulos. La información de una canción asociada por primera vez debe persistirse para evitar consultas redundantes.

### XVI. Eventos y notificaciones desacoplados
La generación/procesamiento de eventos debe estar separada de la presentación de notificaciones. Se permite event-driven (Observer/colas) solo cuando simplifica realmente la arquitectura.

### XVII. Reportes exportables generados en backend/procesamiento
La generación de reportes/archivos (p. ej. Python con openpyxl/XlsxWriter) no se implementa en frontend. La UI administrativa solo inicia, visualiza y descarga resultados.

### XVIII. Prohibición de código en fases de especificación
Durante especificación, clarificación, checklist, planificación y generación de tareas no se implementa código; solo se crean/actualizan artefactos documentales.

## Alcance del Sistema y Fronteras de Responsabilidad

### Stack tecnológico oficial
- **Frontend**: React (2 apps separadas: usuario y administración/moderación).
- **Backend principal**: Java + Spring Boot (API REST).
- **Persistencia principal**: MySQL.
- **Caché y datos de alta frecuencia**: Redis.
- **Sincronización de APIs externas**: Node.js.
- **Eventos y notificaciones**: Node.js + Firebase Admin SDK + RabbitMQ/Redis.
- **Preprocesamiento de analytics**: módulo dedicado.
- **Reportes**: Python.
- **Logs futuro**: MongoDB.

### Módulos funcionales del sistema
Perfil y gestión de usuario, moderación, publicación de contenido, descubrimiento y búsqueda, geolocalización, música e inspiración sonora, desafíos, notificaciones, analytics y recomendaciones, reportes, administración y moderación.

### Alcance del frontend de usuario
Incluye autenticación/registro, configuración inicial, home y descubrimiento, perfiles, publicaciones, búsqueda/filtros, likes/comentarios/guardado, geolocalización, música, desafíos y notificaciones.

### Alcance del frontend administrativo
Incluye login administrativo, dashboard, gestión de usuarios, moderación de publicaciones/reportes, gestión de desafíos propuestos y visualización/exportación de analíticas/reportes.

### Fuera de alcance del frontend administrativo
Registro de usuarios finales, cuestionario, home de descubrimiento de usuario, edición de perfil propio y participación de desafíos como usuario final.

## Arquitectura y Responsabilidades por Capa

Toda historia, spec, plan y tarea debe mapearse a una capa y respetar estas reglas:
1. **Dominio** encapsula reglas y estados.
2. **Aplicación** orquesta casos de uso y políticas.
3. **Infraestructura** implementa adaptadores técnicos.
4. **Presentación/API** traduce interacción externa a casos de uso.
5. **Frontends** no implementan persistencia, analytics complejos, generación de archivos ni lógica de integración externa.

Controles mínimos de revisión:
- Trazabilidad requisito → tarea → implementación.
- Validación de permisos en backend para operaciones sensibles.
- Pruebas de reglas de negocio críticas por módulo.
- No duplicación de lógica entre capas o frontends.

## Governance

Esta constitución prevalece sobre prácticas informales y decisiones ad hoc del proyecto `Union`.

### Reglas de enmienda
1. Toda enmienda debe documentar motivación, impacto y módulos afectados.
2. Versionado semántico:
   - **MAJOR**: cambio incompatible en principios.
   - **MINOR**: nuevo principio o expansión normativa relevante.
   - **PATCH**: aclaraciones sin cambio semántico.
3. Toda enmienda actualiza `Last Amended` y el Sync Impact Report.

### Cumplimiento
- Todo plan (`/speckit.plan`) debe incluir `Constitution Check`.
- Toda tarea de regla de negocio debe incluir test asociado.
- Incumplimientos deben registrarse como deuda técnica explícita con plan de resolución.

**Version**: 1.0.0 | **Ratified**: 2026-09-15 | **Last Amended**: 2026-09-15
