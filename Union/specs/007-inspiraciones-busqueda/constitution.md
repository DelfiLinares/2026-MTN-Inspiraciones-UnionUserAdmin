# Constitution — 007 Inspiraciones: Búsqueda y Descubrimiento

**Versión**: 1.0.0 | **Ratificada**: 2026-10-20

Módulo de búsqueda y descubrimiento de publicaciones de la red social de inspiración artística. Incluye únicamente: barra de búsqueda, feed "Para ti" (FYP) con scroll infinito y filtros de búsqueda. Complementa la constitution general del proyecto (`.specify/memory/constitution.md`), cuyos principios siguen vigentes y no pueden contradecirse. No modifica la documentación de otras iteraciones.

Se desarrolla solo como Frontend, dentro de la aplicación React de usuario existente (`Union/frontend`). No se crean aplicaciones nuevas.

## Alcance

**Dentro**:
- Buscar publicaciones por texto.
- Ver el feed FYP con scroll infinito.
- Filtrar por estilo, tipo de arte, técnica, distancia y demás criterios definidos por el alcance.
- Abrir una publicación desde el feed o los resultados (el detalle pertenece a otro módulo).

**Fuera**:
- Frontend de administración.
- Backend, base de datos, caché y algoritmo de recomendación.
- Crear, editar, borrar o reportar publicaciones.

## Principios

### I. La especificación manda
No se programa funcionalidad, pantalla, componente o flujo que no esté trazado a una historia de usuario o requisito del módulo. Lo indefinido se resuelve en clarify, no se asume en la implementación.

### II. Dominio con orientación a objetos real
Evitar clases anémicas cuando haya reglas claras. `CriteriosBusqueda` (texto + filtros activos) y `PaginaResultados` (items + cursor siguiente) encapsulan sus reglas (normalización del texto, filtros válidos, combinación de filtros). Esas reglas no se trasladan a componentes de interfaz.

### III. API REST de Java no implementada
El Frontend consume una API REST de Java que no se implementa en este speckit. La conexión con el backend real la hará otra persona en una próxima iteración.

### IV. Sin funciones de Backend
Ni siquiera para pruebas. Los datos de ejemplo viven detrás de una interfaz de servicio que luego se reemplaza por el cliente de la API sin tocar dominio, aplicación ni componentes.

### V. Separación por capas
- **Dominio**: criterios de búsqueda, filtros, enums, value objects y reglas.
- **Aplicación/servicios**: casos de uso (buscar publicaciones, cargar feed FYP, cargar más resultados, limpiar filtros).
- **Infraestructura**: cliente HTTP de la API y adaptador de datos de ejemplo.
- **Frontend usuario**: componentes y pantallas React (barra de búsqueda, feed, panel de filtros).

### VI. Componentes limpios
Los componentes no contienen reglas de negocio, lógica duplicada ni funciones gigantes. Evitar `instanceof` innecesario.

### VII. Enums y value objects para valores cerrados
- `TipoFiltro`: ESTILO, TECNICA, TIPO_ARTE, DISTANCIA.
- `TipoContenido`: IMAGEN, VIDEO, MUSICA, TUTORIAL.
- `EstadoPublicacion`: ACTIVA, REPORTADA, ELIMINADA (reutilizado del módulo general).
- `OrigenFeed`: FYP, BUSQUEDA.

### VIII. Patrones de diseño solo si simplifican
No se fuerzan patrones.

### IX. Tests de reglas de negocio (NON-NEGOTIABLE)
Toda regla importante tiene tests:
- Búsqueda vacía muestra FYP; búsqueda con texto muestra resultados de búsqueda.
- El texto se normaliza (espacios sobrantes) antes de enviarse a la API.
- Los filtros activos se combinan de forma consistente y se limpian individualmente o todos a la vez.
- Cambiar texto o filtros reinicia paginación y scroll.
- No se dispara una carga adicional mientras hay otra en curso ni cuando no hay más resultados.
- Los estados de carga, vacío y error se muestran correctamente.

### X. Búsqueda, filtros y recomendaciones pertenecen al backend
El frontend no filtra, ordena ni recorre listas completas en memoria, ni recalcula rankings o recomendaciones. Solo envía criterios a la API y renderiza lo devuelto. El orden y contenido del FYP lo decide la API.

### XI. Scroll infinito y concurrencia
Feed y resultados usan scroll infinito servido por la API (cursor u offset, a definir en clarify), con carga progresiva y sin cargar todo el listado. La búsqueda usa debounce y cancela o ignora respuestas obsoletas para evitar resultados desordenados.

### XII. Usabilidad, claridad y rendimiento
- Barra de búsqueda siempre visible y accesible.
- Filtros (estilo, tipo de arte, técnica, distancia y demás del alcance) fáciles de aplicar, con filtros activos visibles y removibles en un paso.
- Estados de carga (esqueletos), vacío ("sin resultados", con sugerencia de limpiar filtros) y error (con reintentar) en todo el flujo.
- Carga diferida de imágenes y reserva de espacio para evitar saltos de diseño.
- Criterios y filtros reflejados en la URL para compartir o volver atrás (a confirmar en clarify).
- Accesibilidad básica: teclado, etiquetas en controles, contraste suficiente.

### XIII. Seguridad en el backend
Los permisos se validan en el backend. El frontend maneja 401, 403 y errores de red sin romper la pantalla. Las publicaciones ELIMINADA no se muestran; la API las excluye.

### XIV. Solo lectura
No crea, edita ni borra publicaciones; sin likes, comentarios ni guardado (otros módulos). Si se requieren acciones rápidas sobre una tarjeta, se definen en clarify.

### XV. Sin código en fases documentales
No se implementa código durante especificación, aclaración, checklist, planificación y generación de tareas. Solo se crean o actualizan documentos.

## Gobernanza
Esta constitution complementa a la general y no puede contradecirla. Las enmiendas se documentan en este archivo con incremento de versión.
