# Constitution — 006 Inspiraciones: Cuestionario de Intereses (Frontend)

Constitution independiente de la de `001-plataforma-unificada`, `002-inspiraciones-publicaciones` y `.specify/memory/constitution.md`. Aplica solo a este spec.

## Propósito y alcance

Red social de inspiración artística donde usuarios y artistas comparten creaciones (dibujos, música, esculturas, etc.) e inspirarse en las de otros.

Este módulo define el **cuestionario inicial para usuarios no registrados ni autenticados**, objetivo: capturar intereses artísticos, musicales y de pintura para orientar un feed personalizado.

### Stack
- Frontend: Aplicación React para el cuestionario de intereses (usuarios nuevos, sin login).
- API REST en Java: **fuera del alcance de este speckit**; se conectará en una iteración futura.

### Módulo
- **Cuestionario de Intereses**: presentar preguntas sobre intereses artísticos generales, gustos musicales y pintura; capturar preferencias; validar respuestas; preparar preferencias para integración futura con feed personalizado.

### Alcance del frontend
- Mostrar mensaje de bienvenida + eslogan.
- Presentar preguntas y opciones de respuesta.
- Permitir seleccionar, deseleccionar y modificar una o más opciones según corresponda.
- Validar respuestas según requisitos (obligatorias, opciones válidas).
- Conservar selecciones durante el flujo.
- Permitir continuar hacia feed personalizado.
- Preparar preferencias para integración futura con API REST.

### Alcance EXCLUIDO explícitamente
- Backend, base de datos, autenticación, registro de usuarios.
- Algoritmos complejos de recomendación en cliente.
- Persistencia directa en MySQL desde frontend.
- Servicios server-side simulados como reemplazo de backend real.

---

## Principios obligatorios

1. **La especificación manda.** No se programa funcionalidad, pantalla, componente o flujo sin trazabilidad explícita a una historia de usuario o requisito del alcance. Cada pregunta, validación, categoría y transición debe mapear a un requisito en spec.md.

2. **Dominio con OO real.** Evitar clases anémicas; las entidades encapsulan sus reglas de negocio. Ejemplos:
   - `Pregunta`: encapsula validación de opciones permitidas, obligatoriedad.
   - `Respuesta`: encapsula lógica de selección múltiple, invariantes.
   - `Preferencias`: encapsula transformación de respuestas a estructura utilizable por feed.

3. **API REST Java externa.** El frontend consumirá una API REST Java que no se implementa en este speckit. Puede modelarse mediante puertos/interfaces (DTO, contratos) pero sin implementar servidor.

4. **Sin backend, ni siquiera de prueba.** Todo funciona únicamente como frontend. No se crean:
   - Endpoints simulados.
   - Servidor Mock.
   - Lógica de persistencia server-side.
   - Base de datos local "de prueba".

5. **Separación por capas**:
   - **Dominio**: entidades (Pregunta, Respuesta, Preferencias), value objects, enums (TipoInteres, GeneroMusical, EstiloPintura) y reglas de negocio asociadas.
   - **Aplicación/servicios**: casos de uso (ResponderCuestionario, ValidarCompletitud), orquestación, transformación de respuestas.
   - **Frontend (React)**: UI del cuestionario, interacción, captura de selecciones, navegación.

6. **Usuarios, acceso y contexto**:
   - Cuestionario disponible para **usuarios no autenticados** (sin login ni registro requerido).
   - No exigir confirmación de identidad.
   - Transición clara desde cuestionario hacia feed personalizado (handoff de preferencias).

7. **Enums/value objects para valores cerrados**:
   - `TipoInteres`: DIBUJO, ESCULTURA, FOTOGRAFIA, LITERATURA, ... (según categorías de publicaciones).
   - `GeneroMusical`: ROCK, POP, ELECTRONICA, METAL, ... (según catálogo de aplicación).
   - `EstiloPintura`: REALISMO, ABSTRACCION, IMPRESIONISMO, ... (según filtros de publicaciones).
   - **Todos deben ser consistentes con categorías/filtros de módulo 002 (publicaciones).**

8. **Consistencia con filtros de publicaciones**: Las opciones del cuestionario deben coincidir exactamente con las categorías de filtros existentes en el módulo de publicaciones. **MUST NOT** crearse taxonomías paralelas incompatibles. Cualquier cambio de catálogo impacta cuestionario y filtros simultáneamente.

9. **Reglas funcionales del cuestionario**:
   - Preguntas deben cubrir: intereses artísticos generales, gustos musicales, intereses de pintura.
   - Opciones deben ser claras, finitas y pertenecientes al catálogo del sistema.
   - Debe permitirse selección múltiple en preguntas que lo permitan; selección única donde corresponda.
   - Usuario debe poder identificar visualmente opciones seleccionadas.
   - Usuario puede deseleccionar/modificar antes de continuar.

10. **Validaciones obligatorias**:
    - Preguntas con atributo "obligatoria" bloquean continuación si faltan respuestas.
    - Mensajes de validación claros y sin restricciones extra no especificadas.
    - Solo opciones del sistema permitidas por pregunta.
    - No permitir continuar con campos obligatorios vacíos.

11. **Conservación de estado**:
    - Respuestas se mantienen durante el proceso (no perderse con clicks laterales).
    - Comportamiento ante recarga/salida/finalización debe estar explícitamente definido en specs.
    - Estado puede ser ephemeral (en memoria) durante sesión actual, sin persistencia en localStorage/sessionStorage a menos que spec lo requiera.

12. **UX, accesibilidad y diseño**:
    - Interfaz incluye: bienvenida + eslogan superior, cuestionario centrado, secciones de preguntas claras, botón de continuar visible.
    - Priorizarse legibilidad, simplicidad e intuición para usuarios nuevos.
    - Adaptarse a distintos tamaños de pantalla (responsive design).
    - Feedback visual de selección (checkbox marcado, cambio de color, etc.) y errores de validación.

13. **Preparación de preferencias para integración**:
    - Al finalizar, las respuestas se transforman en estructura de `Preferencias` utilizable por feed personalizado.
    - El frontend prepara y entrega preferencias al siguiente paso/módulo (sin necesidad de llamada backend en esta etapa).
    - La generación y recuperación de publicaciones corresponden al backend y módulo de feed en iteraciones futuras.

14. **Escalabilidad y responsabilidades frontend vs backend**:
    - Frontend **NO** implementa búsqueda masiva, recomendación algorítmica ni recorridocompleto de lista de publicaciones.
    - Frontend **NO** accede directo a MySQL.
    - Escalabilidad de publicaciones, búsqueda, filtros y recomendaciones recaen en backend, índices, caché Redis.
    - Frontend solo captura preferencias y las transmite.

15. **Toda regla de negocio importante tiene tests**. Cobertura mínima:
    - Solo opciones válidas (definidas por sistema) pueden seleccionarse por pregunta.
    - Preguntas multi-respuesta admiten más de una opción.
    - Selecciones corresponden a categorías de filtros de publicaciones (sincronía de taxonomía).
    - Respuestas se conservan durante el flujo.
    - Bloqueo de continuación por campos obligatorios incompletos.
    - Transformación correcta de respuestas a estructura de Preferencias.
    - Validación de invariantes de dominio (ej: no seleccionar opción no permitida).

16. **Sin código en fases documentales**. En especificación, aclaración, checklist, planificación y generación de tareas **MUST NOT** escribirse código de implementación. Solo crear/actualizar documentos.

17. **Criterios de aceptación constitucional** (Definition of Ready del módulo):
    - Existe trazabilidad explícita requisito → historia → tarea.
    - Alcance frontend-only está definido sin ambigüedad.
    - Reglas de validación obligatoria por pregunta especificadas.
    - Consistencia con categorías de filtros de publicaciones documentada.
    - Estrategia de conservación de respuestas definida.
    - Criterios de pruebas para reglas críticas establecidos.
    - No hay requisitos que impliquen backend implementado en esta etapa.

---

## Gobernanza

- Esta constitution prevalece sobre prácticas ad hoc dentro del spec 006.
- Enmiendas documentadas, con justificación y fecha.
- Todo plan, tarea y revisión verifica cumplimiento de estos principios.
- En casos de conflicto entre implementación y constitution, prevalece la constitution; se ajusta especificación primero.

---

**Versión**: 1.0.0 | **Ratificada**: 2026-10-19
