# Especificación — 006 Cuestionario de Intereses (Frontend)

**Estado**: Borrador | **Fecha**: 2026-10-19  
**Constitution**: `constitution.md` (misma carpeta)  
**Naturaleza**: solo frontend React. La API REST Java se conecta en una iteración futura. Esta especificación no contiene código.

---

## Clarificaciones

### Sesión 2026-10-19
- **(A-1) Persistencia de respuestas**: Las respuestas se mantienen en memoria durante la sesión actual del cuestionario. No se implementa localStorage/sessionStorage a menos que sea requerido en futuras iteraciones. Comportamiento ante recarga: se pierden respuestas (usuario debe reiniciar). Comportamiento tras finalizar: respuestas se pasan al módulo de feed y no se persisten en esta etapa.
- **(A-2) Estructura de categorías**: Las categorías de intereses artísticos, géneros musicales y estilos de pintura deben ser idénticas a las del módulo 002 (publicaciones). No se crean taxonomías paralelas. Si una categoría no existe en filtros, no se incluye en el cuestionario.
- **(A-3) Opciones por pregunta**: El sistema define un catálogo cerrado de opciones por pregunta. El frontend no permite seleccionar opciones fuera del catálogo. Las opciones se obtienen del dominio (enums/configuración) en esta etapa; en futuras iteraciones podrían venir de la API.
- **(A-4) Validación obligatoria**: Una pregunta es obligatoria si su atributo `obligatoria` es true. Si está vacía, bloqueamos el continuar y mostramos mensaje de error claro. Preguntas opcionales pueden quedar sin responder.
- **(A-5) Interfaz de respuesta**: El usuario ve opciones como checkboxes (multi-selección) o radio buttons (selección única). El sistema valida que la pregunta permite el tipo de selección esperado.
- **(A-6) Handoff de preferencias**: Al finalizar, las respuestas se transforman en un objeto `Preferencias` con arrays de categorías seleccionadas. Este objeto se pasa al siguiente módulo/componente (feed personalizado). No se realiza llamada backend en esta etapa para obtener publicaciones.
- **(A-7) Eslogan y bienvenida**: Texto breve y atractivo en la parte superior del cuestionario. Ejemplo: "Descubre inspiraciones artísticas acordes a tus gustos". Debe reflejar la identidad de la red social.
- **(A-8) Accesibilidad sin registro**: El cuestionario es completamente accesible sin login ni registro. No se exige identificación del usuario.
- **(A-9) Flujo de navegación**: Cuestionario → Validación → Finalización → Preferencias listas para feed. El frontend no obtiene publicaciones en esta etapa.
- **(A-10) Casos borde - Recarga de página**: Respuestas se pierden. El usuario debe responder nuevamente. (Futura iteración: persistencia en localStorage si se requiere).
- **(A-11) Casos borde - Cierre de cuestionario**: Sin persistencia en BD en esta etapa. Si el usuario cierra la pestaña, pierde respuestas.
- **(A-12) Responsabilidad de recomendación**: El frontend prepara preferencias; el backend (módulo de feed) genera las recomendaciones usando servicios, índices, caché. El frontend NO recorre listas de publicaciones ni calcula rankings.

---

## 1. Objetivo

Permitir que usuarios no registrados ni autenticados respondan un cuestionario inicial sobre sus intereses artísticos, musicales y de pintura, para recibir un feed personalizado con publicaciones relacionadas a esos intereses. El frontend captura preferencias, las valida y las prepara para integración futura con la API REST de Java que obtendrá las publicaciones.

---

## 2. Actores

| Actor | Responsabilidades |
|---|---|
| Usuario no autenticado | Accede al cuestionario sin login, responde preguntas sobre intereses artísticos, musicales y de pintura, y continúa hacia el feed personalizado. |
| Sistema (frontend) | Presenta preguntas y opciones, valida respuestas, conserva estado, transforma respuestas en preferencias. |
| Módulo de Feed (futuro) | Recibe preferencias del usuario y utiliza servicios backend para obtener publicaciones personalizadas. |
| API REST Java (futuro) | Proporciona publicaciones según preferencias del usuario, filtros, búsqueda y recomendaciones. |

---

## 3. Fuera de alcance inicial

- Implementación del backend / API REST Java.
- Función de backend para pruebas.
- Autenticación y registro de usuarios.
- Persistencia de preferencias en base de datos asociadas a una cuenta.
- Obtención de publicaciones (responsabilidad del módulo feed + backend).
- Algoritmos de recomendación en el frontend.
- Acceso directo a MySQL.
- Gestión de perfiles, carpetas y publicaciones.
- Otros módulos de la red social.

---

## 4. Historias de usuario y prioridades

Prioridades: **P1** imprescindible, **P2** importante, **P3** deseable.

### Bienvenida y presentación
- **HU-01 (P1)** Como usuario no registrado, quiero ver un mensaje de bienvenida con un eslogan que invite a descubrir publicaciones relacionadas con mis intereses.

### Cuestionario de intereses artísticos
- **HU-02 (P1)** Como usuario no registrado, quiero responder preguntas sobre mis intereses artísticos generales (dibujo, escultura, fotografía, literatura, etc.) seleccionando una o más opciones.

### Cuestionario de gustos musicales
- **HU-03 (P1)** Como usuario no registrado, quiero responder preguntas sobre mis géneros musicales favoritos (Rock, Pop, Electrónica, Metal, K-pop, etc.) seleccionando una o más opciones.

### Cuestionario de intereses de pintura
- **HU-04 (P1)** Como usuario no registrado, quiero responder preguntas sobre estilos, técnicas o categorías de pintura que me interesan (Realismo, Abstracción, Impresionismo, etc.) seleccionando una o más opciones.

### Interacción y validación
- **HU-05 (P1)** Como usuario, quiero poder seleccionar, deseleccionar y modificar mis respuestas antes de continuar.
- **HU-06 (P1)** Como usuario, quiero recibir mensajes de error claros si falta responder preguntas obligatorias.

### Finalización y transición
- **HU-07 (P1)** Como usuario, quiero finalizar el cuestionario y acceder a un feed personalizado con publicaciones relacionadas a mis intereses.

### Usabilidad
- **HU-08 (P2)** Como usuario, quiero que la interfaz sea clara, intuitiva y accesible desde dispositivos móviles y computadoras.

---

## 5. Criterios de aceptación

**HU-01**
- El cuestionario muestra un título o eslogan de bienvenida en la parte superior.
- El mensaje es breve (máximo 2-3 líneas), atractivo y coherente con la identidad de la red social.
- El eslogan invita explícitamente a descubrir publicaciones relacionadas con intereses.

**HU-02**
- Las preguntas sobre intereses artísticos incluyen opciones del catálogo de categorías de publicaciones (ej: dibujo, escultura, fotografía, literatura, escultura digital, etc.).
- El usuario puede seleccionar una o más opciones.
- Las opciones seleccionadas se diferencian visualmente de las no seleccionadas.

**HU-03**
- La pregunta sobre géneros musicales incluye opciones del catálogo (ej: Rock, Pop, Electrónica, Metal, K-pop, Country, Nacional, Reggaetón, Hip-Hop, Clásica, R&B, Blues).
- El usuario puede seleccionar una o más opciones.
- Las opciones coinciden con las categorías de filtros de publicaciones.

**HU-04**
- La pregunta sobre pintura incluye opciones del catálogo (ej: Realismo, Abstracción, Impresionismo, Surrealismo, etc.).
- El usuario puede seleccionar una o más opciones.
- Las opciones seleccionadas se diferencian visualmente.

**HU-05**
- El usuario puede hacer clic en una opción para seleccionarla.
- El usuario puede hacer clic nuevamente para deseleccionar.
- Cambiar una respuesta no afecta las respuestas de otras preguntas.
- Las opciones seleccionadas se conservan mientras el usuario interactúa con el cuestionario.

**HU-06**
- Si una pregunta obligatoria queda vacía y el usuario intenta continuar, se muestra un mensaje de error.
- El mensaje indica claramente cuál es el problema (ej: "Debes seleccionar al menos una opción en Intereses artísticos").
- El error desaparece cuando el usuario completa la pregunta.

**HU-07**
- El cuestionario incluye un botón de "Continuar" o similar.
- Al presionarlo, se validan todas las respuestas obligatorias.
- Si todas son válidas, las preferencias se preparan (transforman en estructura de Preferencias).
- El usuario accede al siguiente paso: feed personalizado o pantalla de transición.
- El frontend no obtiene publicaciones directamente; el módulo de feed las solicita al backend.

**HU-08**
- La interfaz utiliza un diseño centrado, con secciones de preguntas claramente diferenciadas.
- El diseño es responsive y funciona en pantallas pequeñas (mobile) y grandes (desktop).
- Las opciones son legibles y fáciles de interactuar.
- El botón de continuar es visible y claramente identificable.

---

## 6. Requisitos funcionales

**Bienvenida y presentación**
- **RF-01** El sistema muestra un eslogan de bienvenida en la parte superior del cuestionario.
- **RF-02** El eslogan es breve, atractivo y coherente con la identidad de la red social.

**Preguntas y opciones**
- **RF-03** El sistema define un conjunto cerrado de preguntas organizadas por categoría (intereses artísticos, géneros musicales, estilos de pintura).
- **RF-04** Cada pregunta especifica si permite selección única o múltiple.
- **RF-05** Cada pregunta define si es obligatoria u opcional.
- **RF-06** Las opciones de cada pregunta provienen del catálogo de categorías del sistema.
- **RF-07** Las opciones son consistentes con las categorías de filtros de publicaciones (módulo 002).

**Respuestas y selección**
- **RF-08** El usuario puede seleccionar una o más opciones por pregunta según reglas de la pregunta.
- **RF-09** El usuario puede deseleccionar una opción previamente seleccionada.
- **RF-10** Las opciones seleccionadas se diferencian visualmente de las no seleccionadas (ej: checkbox marcado, color diferente).
- **RF-11** El sistema no permite seleccionar opciones que no pertenezcan al catálogo definido.
- **RF-12** El sistema valida que el tipo de selección (única vs múltiple) coincida con lo especificado por la pregunta.

**Conservación de estado**
- **RF-13** Las respuestas se conservan en memoria durante la sesión del cuestionario.
- **RF-14** Cambiar una respuesta no afecta otras respuestas.
- **RF-15** Las respuestas se mantienen hasta que el usuario finaliza o cierra la sesión.

**Validación**
- **RF-16** El sistema valida que todas las preguntas obligatorias tengan al menos una respuesta.
- **RF-17** Si una pregunta obligatoria está vacía, el sistema muestra un mensaje de error claro.
- **RF-18** Las preguntas opcionales pueden quedar sin responder.
- **RF-19** El sistema no permite continuar si hay validaciones incompletas.

**Finalización y preferencias**
- **RF-20** El cuestionario incluye un botón para continuar.
- **RF-21** Al continuar, las respuestas se transforman en un objeto `Preferencias`.
- **RF-22** El objeto `Preferencias` contiene arrays de categorías seleccionadas (intereses artísticos, géneros musicales, estilos de pintura).
- **RF-23** Las preferencias se transmiten al siguiente módulo (feed) para orientar la personalización.
- **RF-24** El frontend no obtiene publicaciones directamente desde el backend en esta etapa.

**Accesibilidad**
- **RF-25** El cuestionario está disponible sin requerir login ni registro.
- **RF-26** El usuario no debe proporcionar datos personales para responder.

---

## 7. Requisitos no funcionales

**Usabilidad**
- **RNF-01** La interfaz es amigable e intuitiva para usuarios que visitan la red social por primera vez.
- **RNF-02** El eslogan de bienvenida es breve y fácil de comprender.
- **RNF-03** Las preguntas están organizadas por categorías de intereses.
- **RNF-04** Las opciones son legibles y fáciles de seleccionar.
- **RNF-05** Las opciones seleccionadas se diferencian visualmente claramente.
- **RNF-06** El botón de continuar es fácil de identificar.
- **RNF-07** Los errores de validación se comunican con mensajes claros.
- **RNF-08** El usuario puede cambiar respuestas sin reiniciar el cuestionario.
- **RNF-09** El diseño es responsive: funciona en computadoras, tablets y dispositivos móviles.
- **RNF-10** El diseño toma como referencia visual las imágenes/wireframes proporcionadas.

**Performance**
- **RNF-11** El cuestionario responde rápidamente a selecciones del usuario (sin recargas innecesarias).
- **RNF-12** La selección/deselección no causa degradación visual o demoras notables.
- **RNF-13** La cantidad de preguntas y opciones puede ampliarse sin impacto significativo en performance.
- **RNF-14** El frontend no recorre listas completas de publicaciones en memoria.
- **RNF-15** Las búsquedas, filtros y recomendaciones se delegan a servicios backend.

**Seguridad y privacidad**
- **RNF-16** El cuestionario no exige datos personales.
- **RNF-17** El frontend no accede directamente a MySQL.
- **RNF-18** El frontend no implementa responsabilidades propias del backend.
- **RNF-19** Las respuestas no se persisten en base de datos sin consentimiento explícito (futuras iteraciones).

**Calidad**
- **RNF-20** Las reglas de negocio están separadas de los componentes de interfaz.
- **RNF-21** El dominio está modelado con OO real (no clases anémicas).
- **RNF-22** Las responsabilidades están separadas por capa (dominio, aplicación, presentación).
- **RNF-23** Las opciones mantienen consistencia con filtros de publicaciones existentes.
- **RNF-24** Toda regla de negocio importante tiene tests.
- **RNF-25** No se implementa funcionalidad no especificada.

---

## 8. Casos borde

**Recarga de página**
- Caso: Usuario ha respondido algunas preguntas y recarga la página.
- Comportamiento esperado: Las respuestas se pierden. El usuario debe responder nuevamente desde el inicio.
- Justificación (A-10): En esta etapa no hay persistencia. Futuras iteraciones pueden agregar localStorage.

**Cierre de cuestionario sin finalizar**
- Caso: Usuario cierra la pestaña del navegador en medio del cuestionario.
- Comportamiento esperado: Las respuestas se pierden. Si vuelve a acceder, comienza desde el inicio.
- Justificación (A-11): Sin persistencia en BD en esta etapa.

**Selección de todas las opciones**
- Caso: Usuario selecciona todas las opciones disponibles en una pregunta.
- Comportamiento esperado: Todas se marcan visualmente; puede deseleccionar una por una.
- Justificación: Validar que multi-selección funciona correctamente.

**Dejar todas las preguntas opcionales sin responder**
- Caso: Cuestionario tiene solo preguntas opcionales; usuario intenta continuar sin responder nada.
- Comportamiento esperado: Se permite continuar; preferencias contienen arrays vacíos para categorías no respondidas.
- Justificación (A-4): Preguntas opcionales pueden quedar vacías.

**Intentar continuar con pregunta obligatoria vacía**
- Caso: Usuario intenta presionar "Continuar" sin responder una pregunta obligatoria.
- Comportamiento esperado: Se muestra error; el botón no ejecuta acción.
- Justificación: RF-16, RF-19.

**Envío de respuesta inválida (fuera del catálogo)**
- Caso: Por error de desarrollo/seguridad, se envía una opción no en el catálogo.
- Comportamiento esperado: El frontend lo rechaza; el dominio valida. En backend (futuro), se rechaza.
- Justificación (A-3): RF-11.

**Cambio de preferencia tras completar**
- Caso: Usuario completa el cuestionario, luego vuelve atrás e intenta cambiar una respuesta.
- Comportamiento esperado: Depends en implementación. Si no hay navegación atrás, no aplica. Si hay, respuestas podrían recuperarse del estado.
- Justificación (A-1): Comportamiento explícitamente definido en diseño de navegación.

---

## 9. Ambigüedades marcadas explícitamente

| ID | Ambigüedad | Aclaración esperada |
|---|---|---|
| **AMB-01** | ¿Las categorías del cuestionario son editables por un admin? | En esta etapa, son fijas. Futura iteración: admin puede agregar/editar categorías sincronizadas con publicaciones. |
| **AMB-02** | ¿Cuántas preguntas del cuestionario hay? ¿Cuáles son? | Definir en plan.md: 3 preguntas (artística, musical, pintura) u otras. Cada pregunta especifica opciones exactas. |
| **AMB-03** | ¿Las preguntas son siempre multi-selección? | No. Especificar por pregunta: única o múltiple. Plan.md detalla. |
| **AMB-04** | ¿Qué sucede si todas las opciones de una pregunta son deseleccionadas? | Si es obligatoria, se bloquea continuar. Si es opcional, se permite. (Explicado en RF-18, A-4). |
| **AMB-05** | ¿El eslogan de bienvenida es configurable? | En esta etapa, es texto fijo en código. Futuras iteraciones: backend proporciona texto. |
| **AMB-06** | ¿Cómo se transmiten las preferencias al módulo de feed? | Pendiente definición de contrato (DTO, API route). Posibilidad 1: objeto en memory; Posibilidad 2: URL query params; Posibilidad 3: localStorage. Plan.md aclarará. |
| **AMB-07** | ¿Hay un "tiempo máximo" para responder el cuestionario? | No en esta etapa. Futuras iteraciones: requisito de UX/business. |
| **AMB-08** | ¿El usuario puede pausar y reanudar el cuestionario? | No en esta etapa. Futuras iteraciones: guardar en servidor (requiere autenticación o ID de sesión). |
| **AMB-09** | ¿Qué sucede si la API de categorías no responde? | En esta etapa, categorías son locales (enums/config). Futuras iteraciones: error handling en obtención de categorías. |
| **AMB-10** | ¿Se envía un evento/telemetría cuando el usuario completa el cuestionario? | No en esta etapa. Futuras iteraciones: tracking de UX/conversión. |

---

## 10. Consistencia con módulo 002 (Publicaciones)

Las categorías de intereses del cuestionario deben coincidir exactamente con las categorías de filtros de publicaciones. Ejemplos:

- **Intereses artísticos** (HU-02): Dibujo, Escultura, Fotografía, Literatura, Escultura Digital, Pintura Digital, Instalación, Performance, Video Arte, etc.
- **Géneros musicales** (HU-03): Rock, Pop, Electrónica, Metal, K-pop, Country, Nacional, Reggaetón, Hip-Hop, Clásica, R&B, Blues.
- **Estilos de pintura** (HU-04): Realismo, Abstracción, Impresionismo, Surrealismo, Expresionismo, Cubismo, etc.

Cualquier discrepancia genera inconsistencia de datos y confusión para el usuario. Se requiere sincronía explícita en plan.md y enums de dominio.

---

## 11. Notas de integración futura

1. **API REST Java**: En la próxima iteración, un desarrollador conectará el frontend con un backend Java que proporcione:
   - Validación de permisos (si se requiere autenticación futura).
   - Obtención de categorías (si se hacen dinámicas).
   - Procesamiento de preferencias para recomendaciones.

2. **Módulo de Feed**: El cuestionario pasa un objeto `Preferencias` al módulo de feed. El feed utilizará esas preferencias para solicitar publicaciones al backend.

3. **Testing en integración**: Tests de E2E verificarán que respuestas → preferencias → feed personalizado.

---

**Versión**: 0.1 | **Estado**: Borrador | **Última actualización**: 2026-10-19
