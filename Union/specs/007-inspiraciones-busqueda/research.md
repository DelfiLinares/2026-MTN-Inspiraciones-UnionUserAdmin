# Research — 007 Búsqueda y Descubrimiento

Cada punto: decisión, motivo y alternativas. Sin código.

## 1. Paginación: cursor vs offset
- **Decisión**: cursor opaco, 20 items por página (clarify A-01).
- **Motivo**: estable ante inserciones en un feed dinámico, evita duplicados/saltos, no exige conteo total.
- **Alternativa**: offset/limit; más simple pero genera duplicados cuando cambia el feed y degrada con offsets altos.
- El cliente trata el cursor como opaco: no lo interpreta ni lo guarda en la URL.

## 2. Scroll infinito
- **Decisión**: `IntersectionObserver` sobre un elemento centinela cerca del final, con margen de anticipación.
- **Motivo**: no depende de eventos `scroll`; menor costo.
- **Alternativa**: listener `scroll` con cálculo manual; descartado por rendimiento y complejidad.
- Respaldo: botón "Cargar más" accesible por teclado si el observer no está disponible.

## 3. Debounce y cancelación
- **Decisión**: debounce 400 ms, mínimo 2 caracteres. `AbortController` por petición + token de secuencia en `SesionBusqueda`; toda respuesta con token distinto del vigente se ignora.
- **Motivo**: cancelar ahorra red; el token cubre el caso en que el cliente HTTP no respeta `signal`.
- Cambios de filtros no usan debounce (acción discreta), pero sí cancelan lo pendiente.

## 4. Virtualización de listas largas
| | Pros | Contras |
|---|---|---|
| Virtualizar | Menos nodos DOM en listas muy largas | Complica altura variable en grilla, accesibilidad, restauración de scroll y tests; dependencia extra |
| No virtualizar | Simple, accesible, scroll nativo | DOM crece con el uso prolongado |

- **Decisión**: no virtualizar en esta iteración. Páginas de 20 y carga progresiva alcanzan; imágenes lazy mitigan el costo.
- **Reevaluar** si los volúmenes objetivo (A-18, pendiente) o mediciones muestran degradación (p. ej. cientos de tarjetas).

## 5. Texto y filtros en la URL; scroll al volver
- **Decisión**: reflejar texto y filtros en query params (clarify A-09). Formato propuesto: `?q=...&estilo=a,b&tecnica=...&tipoArte=...&distancia=25&tipoContenido=...`.
- Se leen al montar y se validan con `CriteriosBusqueda`; valores inválidos se ignoran. Los cambios de texto usan `replace` (no llenan el historial en cada tecla) y los de filtros `push` (permite volver atrás).
- **Scroll al volver del detalle (A-15)**: se conserva guardando, en memoria de sesión del navegador (`sessionStorage`), la posición y la cantidad de items cargados asociados a la clave de criterios; al volver se vuelve a pedir lo necesario. **Riesgo**: el cursor no se persiste, por lo que restaurar exige re-pedir páginas o mostrar desde arriba si el feed cambió. Alternativa más simple: mantener el estado en un contexto montado por encima de la ruta. Se decide en tasks; ambas cumplen la spec.
- DISTANCIA: se serializa solo si el usuario concedió ubicación; la ubicación nunca se pone en la URL.

## 6. Distancia y ubicación
- Rangos cerrados en km (5, 25, 100, cualquiera). Sin permiso: filtro deshabilitado con aviso, sin aproximar.
- **Pendiente (API)**: cómo la API conoce la ubicación (el cliente envía lat/lng por petición vs. la API la obtiene del perfil). El contrato lo marca `x-pending`; no se inventa.
- Existe `infrastructure/geolocationClient.ts`; evaluar su reutilización en tasks.

## 7. Catálogo de filtros
- **Decisión**: valores de estilo, tipo de arte y técnica provistos por la API (`GET /filtros/catalogo`). `TipoContenido` y rangos de distancia son cerrados en el cliente (enum).
- Si el catálogo falla: el panel muestra error local con reintentar; la búsqueda por texto sigue funcionando.

## 8. Combinación de filtros
- OR dentro de un tipo, AND entre tipos y con el texto (A-04). La API aplica la semántica; el dominio solo garantiza una representación consistente y la envía.

## 9. Duplicados
- El cursor debería evitarlos. Defensa mínima: ignorar items con id ya presentes. No es reordenamiento ni filtrado de contenido; se documenta como excepción acotada al principio X.

## 10. Manejo de 401/403/red
- 401 → cierre de sesión local y redirección a `/login` vía `SesionUsuarioPort` (sobre `authService`/`AuthContext`, no `sessionGuard`, que es de administración); 403 → aviso; red/5xx/429 → error con reintentar (conserva items previos). 429: respetar `Retry-After` si viene (a confirmar).

## 11. Imágenes y layout
- `loading="lazy"`, `decoding="async"`, contenedor con `aspect-ratio` fijo (o dimensiones de la API si las provee, pendiente) y esqueleto del mismo tamaño. Imagen rota: placeholder.

## 12. Accesibilidad
- Barra con `role="search"` y etiqueta; chips con botón "quitar" etiquetado; región de resultados con `aria-live="polite"` para anunciar cargas/vacío; foco visible; contraste AA.

## 13. Datos de ejemplo (sin backend)
- Adaptador en memoria que implementa `BusquedaRepository`, con latencia simulada y paginación por cursor. **No** implementa lógica de recomendación ni búsqueda real más allá de lo mínimo para ejercitar la interfaz y los tests; no es un servidor mock.
- Excepción de la regla X: su filtrado simple vive solo en infraestructura de ejemplo y se elimina al conectar la API.

## 14. Recomendaciones NO vinculantes para el equipo de backend
- **Índices**: índice de texto completo (FULLTEXT o motor dedicado) sobre título, descripción, tags y autor; índices compuestos para filtros frecuentes (estado, estilo, técnica, tipo de arte, tipo de contenido); índice por fecha/ID para el cursor; para distancia, índice espacial o geohash.
- **Cursor vs offset**: preferir keyset/cursor firmado (opaco) con orden total determinista (puntaje + id).
- **Caché Redis**: catálogo de filtros (TTL largo); páginas del FYP por usuario/segmento con TTL corto; resultados de búsquedas populares con TTL corto. Invalidar al pasar una publicación a ELIMINADA/REPORTADA.
- **Otros**: rate limiting (429) en búsqueda, exclusión de ELIMINADA en la consulta, y límite de longitud del texto (100) validado también en servidor.

## 15. Pendientes
A-10, A-11, A-12, A-17, A-18, A-19, A-20 quedaron resueltas (ver spec.md Clarifications). A-02 (ubicación) queda diferida al backend.
