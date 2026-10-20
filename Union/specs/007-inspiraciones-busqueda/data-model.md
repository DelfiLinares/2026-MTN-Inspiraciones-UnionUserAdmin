# Modelo de datos — 007 Búsqueda y Descubrimiento

Modelo conceptual del frontend y DTOs de la API. Sin DDL, sin tablas. Tipos descritos en prosa/tablas, no es código.

## 1. Enums

| Enum | Valores | Notas |
|---|---|---|
| `TipoFiltro` | ESTILO, TECNICA, TIPO_ARTE, DISTANCIA, TIPO_CONTENIDO | Ya existe en `domain/enums`; se agrega `TIPO_CONTENIDO` (clarify) |
| `TipoContenido` | IMAGEN, VIDEO, MUSICA, TUTORIAL | Ya existe |
| `EstadoPublicacion` | ACTIVA, REPORTADA, ELIMINADA | Reutilizado del módulo general |
| `OrigenFeed` | FYP, BUSQUEDA | Nuevo |
| `RangoDistancia` | KM_5, KM_25, KM_100, CUALQUIERA | Cerrado (clarify A-02) |
| `EstadoCarga` | INICIAL, CARGANDO, CARGANDO_MAS, LISTO, VACIO, ERROR | Estado de la sesión de búsqueda |
| `TipoErrorBusqueda` | RED, NO_AUTENTICADO (401), SIN_PERMISO (403), SOLICITUD_INVALIDA (400), LIMITE (429), SERVIDOR | Mapeo de errores de API |

## 2. Value objects y entidades de dominio

### FiltroActivo (value object, inmutable)
- Campos: `tipo: TipoFiltro`, `valor: string` (id/código del valor del catálogo, o `RangoDistancia`).
- Invariantes: valor no vacío; si `tipo = DISTANCIA`, el valor pertenece a `RangoDistancia` y ≠ CUALQUIERA (CUALQUIERA equivale a no filtrar); si `tipo = TIPO_CONTENIDO`, el valor pertenece a `TipoContenido`.
- Igualdad por (tipo, valor).

### CriteriosBusqueda (value object / agregado inmutable)
- Campos: `texto` (ya normalizado), `filtros: conjunto de FiltroActivo`.
- Reglas (encapsuladas):
  - Normalización: recortar extremos, colapsar espacios internos, truncar/validar a 100 caracteres.
  - `esBuscable()`: texto con ≥ 2 caracteres.
  - `origen()`: `BUSQUEDA` si `esBuscable()`; en otro caso `FYP` (texto vacío o de 1 carácter; con 1 carácter no se dispara búsqueda y la UI muestra una pista de mínimo 2 caracteres. Asumido, ver spec Clarifications).
  - `admiteFiltro(tipo, contexto)`: decide si un filtro puede aplicarse (DISTANCIA solo con ubicación concedida). La UI solo consulta este método.
  - Combinación: valores del mismo `TipoFiltro` = OR; tipos distintos y texto = AND. No admite duplicados.
  - Operaciones (devuelven nuevos criterios): `conTexto`, `conFiltro`, `sinFiltro`, `sinFiltrosDeTipo`, `limpiarFiltros`, `limpiarTexto`.
  - `esVacio()`: sin texto ni filtros.
  - `equivale(otros)`: para detectar cambio de criterios (reinicio de paginación) y clave de URL.
  - La serialización a/desde query params **no** vive aquí: está en `CodecCriteriosUrl` (dominio, T070), que ignora valores inválidos.
  - DISTANCIA solo se admite si hay ubicación concedida (parámetro de contexto); si no, rechaza la operación.

### PaginaResultados (value object)
- Campos: `items: PublicacionResumen[]`, `cursorSiguiente: string | null`, `hayMas: boolean`.
- Invariantes: `hayMas` ⇔ `cursorSiguiente` no nulo. Items en el orden recibido.
- Operaciones: `agregar(otra)` concatena preservando orden y descartando ids ya presentes; `estaVacia()`.

### PublicacionResumen (entidad de solo lectura, datos de la tarjeta)
| Campo | Tipo | Estado |
|---|---|---|
| `id` | string | Definido |
| `titulo` | string | Definido (clarify A-14) |
| `autor` | `{ id, nombre }` | Definido |
| `miniaturaUrl` | string | Definido |
| `tipoContenido` | `TipoContenido` | Definido |
| `estado` | `EstadoPublicacion` | Informativo; ELIMINADA no debe llegar |
| `aspectoImagen` / dimensiones | opcional | **Pendiente** (reserva de espacio) |

### CatalogoFiltros
- Campos: por `TipoFiltro` (ESTILO, TECNICA, TIPO_ARTE) una lista de `OpcionFiltro { valor, etiqueta }`. TIPO_CONTENIDO y DISTANCIA son cerrados en el cliente.

### SesionBusqueda (estado de aplicación)
- Campos: `criterios`, `origen`, `items/pagina`, `estadoCarga`, `error?`, `tokenPeticion`, `ubicacionConcedida`.
- Reglas: cambiar criterios → vaciar items, cursor nulo, nuevo token, cancelar petición previa, scroll al inicio. Cargar más solo si `hayMas` y `estadoCarga ≠ CARGANDO/CARGANDO_MAS`. Respuesta con token ≠ vigente se descarta.

## 3. DTOs de la API (ver contracts/openapi.yaml)

| DTO | Campos | Mapea a |
|---|---|---|
| `PaginaPublicacionesDto` | `items: PublicacionResumenDto[]`, `cursorSiguiente: string?` | `PaginaResultados` |
| `PublicacionResumenDto` | `id`, `titulo`, `autor{id,nombre}`, `miniaturaUrl`, `tipoContenido`, `estado` | `PublicacionResumen` |
| `CatalogoFiltrosDto` | `estilos[]`, `tecnicas[]`, `tiposArte[]` de `{valor, etiqueta}` | `CatalogoFiltros` |
| `ErrorDto` | `codigo`, `mensaje`, `detalles?` | `TipoErrorBusqueda` |
| Parámetros de búsqueda | `q`, `estilo[]`, `tecnica[]`, `tipoArte[]`, `tipoContenido[]`, `distancia`, `cursor`, `limite` | `CriteriosBusqueda` + cursor |

Mapeadores en infraestructura convierten DTO ⇄ dominio; el dominio nunca ve DTOs.

## 4. Relaciones
`CriteriosBusqueda` 1—* `FiltroActivo`. `SesionBusqueda` 1—1 `CriteriosBusqueda`, 1—1 `PaginaResultados` acumulada. `PaginaResultados` 1—* `PublicacionResumen`.

## 5. Reglas transversales
- Ningún tipo del dominio ordena ni filtra publicaciones por contenido.
- ELIMINADA: la API nunca debe enviarla. El cliente **no** filtra ni omite (principio X); si llegara una se registra como violación de contrato y se renderiza lo recibido. Se prueba en T071.
- Duplicados: el único dueño es `PaginaResultados.agregar`; `SesionBusqueda` solo lo invoca.
- Constantes (T075): `TAMANO_PAGINA`=20, `DEBOUNCE_MS`=400, `MIN_CARACTERES`=2, `MAX_CARACTERES`=100. `RangoDistancia` ⇄ km (KM_5↔5, KM_25↔25, KM_100↔100) en dominio.
- Ubicación del usuario: dato de contexto, nunca parte de la URL.

## 6. Pendientes
Campos opcionales de `PublicacionResumen` (dimensiones), forma de enviar la ubicación (A-02, diferida al backend), comportamiento exacto ante 429 (`Retry-After`). A-10/11/12/17/18/19/20 resueltas.
