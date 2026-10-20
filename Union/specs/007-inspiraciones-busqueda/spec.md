# Especificación — 007 Búsqueda y Descubrimiento de Publicaciones

**Rama**: 007-inspiraciones-busqueda | **Fecha**: 2026-10-20 | **Estado**: Clarificada (A-02 diferida al backend)
**Constitution**: [constitution.md](./constitution.md)

## 1. Resumen

Página de búsqueda y descubrimiento de publicaciones de la red social de inspiración artística. Permite buscar por texto, explorar el feed "Para ti" (FYP) con scroll infinito y filtrar resultados. Es solo Frontend, dentro de la aplicación React de usuario existente. Consume una API REST de Java que **no** se implementa en esta etapa; los datos de ejemplo viven detrás de una interfaz de servicio reemplazable.

Al entrar, el usuario ve el FYP; al escribir, ve resultados de búsqueda; y puede refinar ambos con filtros. El contenido y el orden los decide la API; el frontend solo envía criterios y renderiza.

## Clarifications

### Sesión 2026-10-20

- **Paginación (A-01, A-13)**: cursor opaco entregado por la API; tamaño de página 20. El cursor evita duplicados entre páginas; si aun así llegara un item repetido, la UI lo descarta por id sin reordenar.
- **Distancia (A-02) — parcialmente diferida al backend**: el filtro es cercanía geográfica con rangos cerrados en km (5, 25, 100 y "cualquiera"). **Cómo la API obtiene o recibe la ubicación lo decide el backend y hoy no se puede saber**; el contrato no lo define (`x-pending`) y el frontend no inventa nada. Mientras tanto el filtro DISTANCIA permanece **deshabilitado** con aviso, no se aproxima ninguna ubicación (ni por IP ni por defecto) y no se envía el criterio. Se habilita en una iteración posterior, cuando el backend defina el mecanismo; ese cambio solo toca infraestructura (`UbicacionPort`) y contrato.
- **Filtros (A-03, A-04, A-05)**: selección múltiple dentro de un mismo filtro (OR); entre filtros distintos y con el texto, AND. Los valores de ESTILO, TIPO_ARTE y TECNICA los provee la API (catálogo dinámico). `TipoContenido` es un quinto filtro (TIPO_CONTENIDO).
- **Texto (A-06, A-07, A-08)**: abarca título, descripción, tags y autor; la decisión final es de la API. Debounce 400 ms; mínimo 2 caracteres (con 0 caracteres se muestra FYP; con 1 no se dispara búsqueda). Máximo 100 caracteres. El cliente solo normaliza espacios; no escapa ni descarta otros caracteres.
- **URL y navegación (A-09, A-15)**: texto y filtros se reflejan en la URL (HU-07 pasa a P2). Al volver desde el detalle se conservan criterios y posición del scroll.
- **401/403 (A-16)**: 401 cierra la sesión local y redirige a `/login` usando el mecanismo de sesión de la app de usuario (`authService.logout()` / `AuthContext`, como hace `RutaProtegida`); **no** se usa `sessionGuard`, que es exclusivo de administración. 403 muestra un aviso sin romper la pantalla.
- **Tarjeta (A-14)**: miniatura, título, autor y `TipoContenido`. Sin acciones rápidas (módulo de solo lectura).
- **Texto de 1 carácter (confirmado)**: no se dispara búsqueda, se muestra el FYP y una pista "escribí al menos 2 caracteres". `origen()` devuelve FYP si el texto no es buscable.
- **Selector de repositorio**: variable `VITE_BUSQUEDA_REPOSITORIO` (`ejemplo` | `http`).
- **Resueltas (segunda ronda, se aceptan las propuestas)**:
  - A-10: sin autocompletado ni sugerencias.
  - A-11: sin opciones de orden; el orden lo define solo la API.
  - A-12: lo que ve un usuario nuevo en el FYP lo decide la API; el frontend no distingue el caso.
  - A-17: sin "no me interesa" ni ocultar contenido.
  - A-18: tiempos máximos y volúmenes objetivo delegados a la API; el frontend no fija umbrales (solo páginas de 20 y carga progresiva).
  - A-19: sin conexión o conexión lenta se trata como error de red, con mensaje y Reintentar; sin modo offline ni caché local.
  - A-20: el tope de resultados navegables lo define la API; al agotarse, `cursorSiguiente` llega nulo y no se cargan más.

## 2. Actores

- **Usuario**: busca, explora el FYP, aplica/quita filtros y abre una publicación.
- **Sistema (API/backend)**: ejecuta búsquedas, aplica filtros, decide orden y contenido del FYP, pagina, excluye publicaciones ELIMINADA y valida permisos.

## 3. Historias de usuario

### HU-01 — Ver el feed FYP con scroll infinito (P1)
Como usuario, quiero ver al entrar un feed de publicaciones recomendadas que se amplía al desplazarme, para descubrir inspiración sin esfuerzo.

**Criterios de aceptación**
- CA-01.1: Con la barra de búsqueda vacía y sin filtros se muestra el FYP (`OrigenFeed.FYP`).
- CA-01.2: Las publicaciones se muestran en el orden entregado por la API, sin reordenar.
- CA-01.3: Al llegar cerca del final se solicita la siguiente página y se agregan los items al final.
- CA-01.4: No se solicita otra página mientras hay una carga en curso.
- CA-01.5: No se solicita otra página cuando la API indica que no hay más resultados.
- CA-01.6: Nunca se carga el listado completo.

### HU-02 — Buscar publicaciones por texto (P1)
Como usuario, quiero escribir en una barra de búsqueda siempre visible para encontrar publicaciones concretas.

**Criterios de aceptación**
- CA-02.1: La barra está siempre visible y accesible, con etiqueta accesible y operable por teclado.
- CA-02.2: Con texto no vacío se muestran resultados de búsqueda (`OrigenFeed.BUSQUEDA`) en lugar del FYP.
- CA-02.3: El texto se normaliza (espacios sobrantes recortados/colapsados) antes de enviarse; un texto solo con espacios equivale a vacío.
- CA-02.4: La búsqueda usa debounce; no se dispara en cada tecla.
- CA-02.5: Un solo paso (botón/acción) borra el texto y vuelve al FYP (respetando filtros activos).
- CA-02.6: Los resultados se paginan con scroll infinito con las mismas reglas que HU-01.
- CA-02.7: Las respuestas obsoletas se cancelan o ignoran; nunca se muestran resultados de un texto anterior.

### HU-03 — Filtrar publicaciones (P1)
Como usuario, quiero filtrar por estilo, tipo de arte, técnica y distancia para acotar lo que veo.

**Criterios de aceptación**
- CA-03.1: Están disponibles los filtros ESTILO, TIPO_ARTE, TECNICA y DISTANCIA (`TipoFiltro`); otros criterios se definen en clarify.
- CA-03.2: Los filtros se combinan entre sí y con el texto de forma consistente (regla de combinación en clarify).
- CA-03.3: Los filtros se envían a la API; el frontend no filtra en memoria.
- CA-03.4: Los filtros activos se muestran visibles y cada uno se quita individualmente en un paso.
- CA-03.5: Existe una acción para limpiar todos los filtros a la vez.
- CA-03.6: Los filtros aplican tanto al FYP como a los resultados de búsqueda.

### HU-04 — Reinicio de paginación al cambiar criterios (P1)
Como usuario, quiero que al cambiar texto o filtros la lista empiece desde arriba para no ver resultados mezclados.

**Criterios de aceptación**
- CA-04.1: Cambiar texto o filtros descarta el cursor/página actual y solicita la primera página.
- CA-04.2: El scroll vuelve al inicio de la lista.
- CA-04.3: Las peticiones en curso de criterios anteriores se cancelan o ignoran.

### HU-05 — Estados de carga, vacío y error (P1)
Como usuario, quiero saber qué ocurre en cada momento para no quedar desorientado.

**Criterios de aceptación**
- CA-05.1: Carga inicial y carga de más resultados muestran esqueletos o indicadores.
- CA-05.2: Sin resultados muestra mensaje claro con sugerencia de limpiar filtros (y acción para hacerlo).
- CA-05.3: Error de red/API muestra mensaje comprensible con opción de reintentar.
- CA-05.4: Un error al cargar una página adicional conserva los items ya cargados y permite reintentar.
- CA-05.5: Respuestas 401 y 403 no rompen la pantalla (comportamiento exacto en clarify).

### HU-06 — Abrir una publicación (P2)
Como usuario, quiero abrir una publicación desde el feed o los resultados para verla en detalle.

**Criterios de aceptación**
- CA-06.1: La tarjeta muestra al menos miniatura, título y autor (campos exactos en clarify).
- CA-06.2: Abrir una tarjeta navega a la pantalla de detalle (otro módulo).
- CA-06.3: Publicaciones ELIMINADA no se muestran (las excluye la API).
- CA-06.4: Las imágenes se cargan de forma diferida con espacio reservado, sin saltos de diseño.

### HU-07 — Compartir/recuperar la búsqueda por URL (P2, confirmado en clarify)
Como usuario, quiero que texto y filtros queden en la URL para compartir o volver atrás sin perderlos.

**Criterios de aceptación (condicionales)**
- CA-07.1: Texto y filtros activos se reflejan en la URL.
- CA-07.2: Abrir una URL con criterios restaura texto, filtros y resultados.
- CA-07.3: Valores inválidos en la URL se ignoran sin romper la pantalla.

## 4. Requisitos funcionales

- **RF-01**: La página muestra una barra de búsqueda siempre visible y accesible.
- **RF-02**: El texto se normaliza antes de enviarse a la API (regla en `CriteriosBusqueda`).
- **RF-03**: La búsqueda usa debounce.
- **RF-04**: Se puede borrar el texto en un solo paso.
- **RF-05**: Texto vacío → FYP; texto con contenido → resultados de búsqueda.
- **RF-06**: El FYP muestra publicaciones en el orden de la API, sin reordenar, filtrar ni recalcular.
- **RF-07**: FYP y resultados usan scroll infinito paginado por la API.
- **RF-08**: No se dispara carga adicional con otra en curso ni sin más resultados.
- **RF-09**: Cambiar texto o filtros reinicia paginación y scroll.
- **RF-10**: Las respuestas obsoletas se cancelan o ignoran.
- **RF-11**: Filtros disponibles: estilo, tipo de arte, técnica y distancia (más los que defina clarify).
- **RF-12**: Los filtros se combinan entre sí y con el texto; se envían a la API.
- **RF-13**: Se muestran los filtros activos; cada uno se quita individualmente.
- **RF-14**: Existe acción "limpiar todos los filtros".
- **RF-15**: La tarjeta muestra miniatura, título y autor; abrirla lleva al detalle.
- **RF-16**: No se muestran publicaciones ELIMINADA (exclusión por la API).
- **RF-17**: Estados de carga (esqueletos), vacío (con sugerencia de limpiar filtros) y error (con reintentar).
- **RF-18**: Manejo de 401, 403 y errores de red sin romper la pantalla.
- **RF-19**: El módulo es de solo lectura (sin crear/editar/borrar/reportar, likes, comentarios ni guardado).
- **RF-20**: Paginación por cursor opaco, página de 20 items; sin items duplicados en pantalla.
- **RF-21**: DISTANCIA usa rangos cerrados en km (5, 25, 100, cualquiera); sin permiso de ubicación el filtro está deshabilitado con aviso y no se envía.
- **RF-22**: Selección múltiple por filtro (OR); entre filtros y con texto, AND. Filtro adicional TIPO_CONTENIDO. Valores de ESTILO, TIPO_ARTE y TECNICA provistos por la API.
- **RF-23**: Debounce 400 ms; búsqueda desde 2 caracteres; máximo 100 caracteres.
- **RF-24**: Texto y filtros se reflejan en la URL; al volver del detalle se conservan criterios y scroll.
- **RF-25**: 401 redirige a login; 403 muestra aviso sin romper la pantalla.
- **RF-26**: La tarjeta muestra miniatura, título, autor y `TipoContenido`, sin acciones rápidas.

## 5. Modelo de dominio (conceptual, sin implementación)

- **CriteriosBusqueda**: texto normalizado + filtros activos; encapsula normalización, validez, combinación, quitar uno/limpiar todos y determinación del `OrigenFeed`.
- **PaginaResultados**: items + cursor siguiente; indica si hay más resultados.
- **Enums**: `TipoFiltro` (ESTILO, TECNICA, TIPO_ARTE, DISTANCIA), `TipoContenido` (IMAGEN, VIDEO, MUSICA, TUTORIAL), `EstadoPublicacion` (ACTIVA, REPORTADA, ELIMINADA), `OrigenFeed` (FYP, BUSQUEDA).
- **Capas**: dominio / aplicación (casos de uso: buscar, cargar FYP, cargar más, limpiar filtros) / infraestructura (cliente HTTP + adaptador de datos de ejemplo tras una interfaz de servicio) / componentes React.

## 6. Requisitos no funcionales

- **RNF-01 Usabilidad**: interfaz clara; encontrar contenido simple y rápido; filtros fáciles y activos visibles; accesibilidad básica (teclado, etiquetas, contraste).
- **RNF-02 Performance**: carga progresiva, imágenes diferidas con espacio reservado, debounce y cancelación; tiempos y volúmenes por definir (ver A-18).
- **RNF-03 Seguridad**: permisos en el backend; el frontend maneja 401/403; ningún frontend accede a MySQL.
- **RNF-04 Calidad**: reglas fuera de la UI; datos de ejemplo tras interfaz de servicio; reglas clave cubiertas por tests (ver §7).
- **RNF-05 Recomendaciones**: el frontend no recalcula rankings ni recomendaciones.

## 7. Reglas a cubrir con tests

1. Búsqueda vacía → FYP; con texto → resultados de búsqueda.
2. Normalización del texto antes de enviarse.
3. Combinación consistente de filtros; quitar individual y limpiar todos.
4. Cambio de texto/filtros reinicia paginación y scroll.
5. Sin carga adicional con otra en curso o sin más resultados.
6. Estados de carga, vacío y error.
7. Respuestas obsoletas ignoradas.

## 8. Casos borde

- Texto solo con espacios o con espacios internos múltiples.
- Texto con caracteres especiales o muy largo.
- Cambio rápido de texto con respuestas que llegan desordenadas.
- Cambio de filtros durante una carga adicional.
- Última página vacía o API que devuelve página vacía con cursor.
- Publicaciones repetidas entre páginas.
- Búsqueda sin resultados con y sin filtros activos.
- Error al cargar la primera página vs. páginas siguientes.
- 401/403 durante el scroll.
- Sin conexión o conexión lenta.
- Imágenes que fallan al cargar.
- Permiso de ubicación denegado al usar DISTANCIA.
- Publicación que pasa a ELIMINADA/REPORTADA entre la carga y la apertura.
- URL con parámetros inválidos (si aplica HU-07).

## 9. Fuera de alcance

Frontend de administración; backend, base de datos, caché y algoritmo de recomendación (incluso para pruebas); crear/editar/borrar/reportar publicaciones; likes, comentarios y guardado; pantalla de detalle; historial y búsquedas guardadas; notificaciones; autocompletado/sugerencias (salvo confirmación en clarify); login avanzado por roles más allá de USER/ADMIN.

## 10. Ambigüedades

**Resueltas (ver sección Clarifications)**: A-01 a A-20, y la regla del texto de 1 carácter.

**Diferida al backend (no bloquea el resto del MVP)**:
- **A-02 (ubicación)**: cómo la API obtiene/recibe la ubicación lo decide el backend y hoy no se sabe. El filtro DISTANCIA queda deshabilitado hasta entonces. Marcado `x-pending` en el contrato.

## 11. Criterios de éxito

- Un usuario llega al FYP, busca, filtra y abre una publicación sin ayuda.
- Todos los criterios de aceptación P1 están cubiertos por tests.
- Reemplazar el adaptador de datos de ejemplo por el cliente de la API no requiere cambios en dominio, aplicación ni componentes.
- Ninguna ambigüedad queda sin decisión explícita. Única diferida: A-02 (ubicación en la API, la define el backend); el filtro DISTANCIA queda deshabilitado hasta entonces.
