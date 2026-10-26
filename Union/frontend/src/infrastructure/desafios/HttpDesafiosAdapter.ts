/**
 * Adaptador HTTP para el puerto DesafiosPort.
 *
 * ESTRUCTURA ESQUELETO LISTA PARA INTEGRACIÓN CON API JAVA
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/spec.md (requisitos funcionales y no funcionales)
 * - Union/specs/003-desafios/plan.md (pendientes P-01 a P-05)
 * - Union/specs/003-desafios/contracts/openapi.yaml (contrato HTTP)
 * - Union/specs/003-desafios/data-model.md (entidades y casos de uso)
 * - Union/specs/003-desafios/tasks.md (T091-T095: integración API)
 *
 * Responsabilidades:
 * - Implementar la interfaz DesafiosPort usando httpClient
 * - Mapear tipos de dominio a/desde DTO del API (cuando esté definido en T089)
 * - Manejar errores HTTP con mapeo uniforme (T093)
 * - Soportar control de concurrencia con If-Match (P-04, T095)
 * - Soportar subida de fotos en multipart/form-data (P-01, T094)
 * - Respetar paginación por cursor (RF-40, RNF-05)
 *
 * PENDIENTES DE T089:
 * - A-02: Definir catálogo de ámbitos
 * - A-04, A-08, A-11, A-14, A-16, A-17, A-19, A-20, A-21, A-22: Definir campos y DTOs
 * - P-01: Formato multipart para fotos
 * - P-04: Campos de versión y cabeceras If-Match
 *
 * ESTRUCTURA:
 * 1. Tipos/interfaces locales para DTOs del API
 * 2. Mapeos entre dominio y DTOs
 * 3. Implementación de DesafiosPort
 * 4. Manejo de errores
 * 5. Serialización de queries y bodies
 *
 * NOTAS DE INTEGRACIÓN:
 * - Usar httpClient.get/post/put/delete del proyecto
 * - BaseURL ya viene configurada en httpClient
 * - Token Authorization se adjunta automáticamente
 * - Para multipart: crear FormData, no usar headers especiales (fetch lo hace automático)
 * - Para If-Match: pasar opción `headers: { 'If-Match': versionTag }`
 * - Errores HTTP deben mapearse a excepciones de dominio (mapearErrorDesafios.ts)
 */

/**
 * IMPORTS (Descomentar cuando implementar - tras T089):
 *
 * import type {
 *   AmbitoDesafio,
 *   DatosDesafio,
 *   Desafio,
 *   RespuestaDesafio,
 *   SolicitudDesafio,
 *   EstadoDesafio,
 *   EstadoSolicitudDesafio,
 * } from 'ruta/a/dominio'
 * import type {
 *   DesafiosPort,
 *   FiltrosDesafios,
 *   DesafioResumen,
 *   Pagina,
 *   ParametrosPagina,
 * } from 'ruta/a/puerto'
 * import { httpClient } from '../httpClient'
 */

/**
 * DTOs del API Java - definir según decisión de T089 y analysis de openapi.yaml
 *
 * ESTRUCTURA ESPERADA (pendiente confirmación):
 * - DesafioDTO: { id, nombre, descripcion, fotosUrls[], ámbito, estado, fechaInicio, fechaFin, ... }
 * - SolicitudDTO: { id, estado, usuarioId, ... }
 * - RespuestaDTO: { id, contenido, fotosUrls[], autorId, ... }
 * - AmbitoDTO: { id, nombre, descripcion, ... }
 *
 * Campos críticos según spec/data-model.md:
 * - Desafio: tieneRespuestas (CB-02, RF-22), version (P-04, T095)
 * - Solicitud: version (P-04 si es necesario)
 * - Respuesta: A-22 define estructura
 * - Ámbito: A-02 define catálogo
 */

// TODO: Definir DTOs del API tras T089
// interface DesafioDTO { ... }
// interface SolicitudDTO { ... }
// interface RespuestaDTO { ... }
// interface AmbitoDTO { ... }

/**
 * Mapeos de DTO → Dominio
 *
 * TODO: Implementar tras T089 cuando se conozcan los DTOs
 * - Convertir fotosUrls[] a Foto[] del dominio
 * - Convertir estados string a enums
 * - Normalizar fechas
 * - Extraer version para control de concurrencia
 */

// function mapearDesafioDTO(dto: DesafioDTO): Desafio { ... }
// function mapearSolicitudDTO(dto: SolicitudDTO): SolicitudDesafio { ... }
// function mapearRespuestaDTO(dto: RespuestaDTO): RespuestaDesafio { ... }
// function mapearAmbitoDTO(dto: AmbitoDTO): AmbitoDesafio { ... }

/**
 * Mapeos de Dominio → DTO
 *
 * TODO: Implementar tras T089
 * - Convertir Foto[] a fotosUrls[] o FormData
 * - Convertir enums a valores esperados por API
 * - Extraer campos requeridos según DesafioEscritura
 */

// function mapearDesafioEscritura(datos: DatosDesafio): FormData { ... }
// function mapearSolicitudEscritura(datos: ...): Body { ... }
// function mapearRespuestaEscritura(datos: ...): Body { ... }

/**
 * Clase esqueleto lista para implementar tras T089
 *
 * ESTRUCTURA:
 * 1. Tipos/interfaces locales para DTOs del API (ver comentarios)
 * 2. Mapeos entre dominio y DTOs (ver comentarios)
 * 3. Serialización de queries
 * 4. Implementación completa de DesafiosPort
 * 5. Manejo de errores
 */

// TODO: Descomentar y completar DTOs tras T089
// interface DesafioDTO { ... }
// interface SolicitudDTO { ... }
// interface RespuestaDTO { ... }
// interface AmbitoDTO { ... }

// TODO: Implementar mapeos tras T089
// function mapearDesafioDTO(dto: DesafioDTO): Desafio { ... }
// function mapearDesafioEscritura(datos: DatosDesafio): FormData { ... }
// ... etc

/**
 * Serialización de query params - estructura lista
 */
function serializarFiltros(filtros: any, pagina: any): URLSearchParams {
  const params = new URLSearchParams()
  // TODO: T089 + T092
  // - Ámbitos (A-02): ?ambito=A&ambito=B
  // - Estados: ?estado=ACTIVO
  // - Fechas (A-14): ?fechaDesde=2026-01-01&fechaHasta=2026-12-31
  // - Paginación: ?cursor=abc&limit=20 (cursor-based, RNF-05)
  return params
}

/**
 * HttpDesafiosAdapter - Implementación de DesafiosPort vía httpClient
 *
 * MÉTODOS ESTRUCTURADOS POR RECURSO:
 * - Ámbitos (GET)
 * - Desafíos (GET, POST, PUT, DELETE)
 * - Respuestas (GET, POST, PUT, DELETE)
 * - Solicitudes (GET, POST, PUT, DELETE, POST .../aprobar, POST .../rechazar)
 *
 * CADA MÉTODO:
 * 1. Endpoint HTTP (comentado con método, path, query, body, respuesta)
 * 2. Pendientes de T089 (qué información falta)
 * 3. Código comentado listo para descomentar
 * 4. Error temporal indicando que está pendiente T089
 */
export class HttpDesafiosAdapter {
  private baseUrl = '/api/desafios' // O configurable vía config.apiBaseUrl

  /**
   * GET /ambitos
   * Retorna: AmbitoDTO[]
   * Pendiente: A-02 (definir catálogo)
   */
  async listarAmbitos(): Promise<any[]> {
    // TODO: T089 + T092
    // const response = await httpClient.get(`${this.baseUrl}/ambitos`)
    // return response.map(mapearAmbitoDTO)
    throw new Error('Pendiente T089 (A-02) + T092')
  }

  /**
   * GET /desafios
   * Query: ambito[], estado[], fechaDesde, fechaHasta, cursor, limit
   * Retorna: { items: DesafioResumen[], siguienteCursor?, total }
   * Pendiente: A-02, A-14, A-16, A-17, A-21
   * Importante: Paginación por cursor (RNF-05), nunca offset
   */
  async listarDesafios(filtros: any, pagina: any): Promise<any> {
    // TODO: T089 + T092
    // const query = serializarFiltros(filtros, pagina).toString()
    // const response = await httpClient.get(`${this.baseUrl}?${query}`)
    // return {
    //   items: response.items.map(mapearDesafioResumenDTO),
    //   siguienteCursor: response.cursors?.next,
    //   total: response.total,
    // }
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * GET /desafios/:id
   * Retorna: Desafio (con detalles completos)
   * Importante: Incluir campo `version` para P-04 (If-Match)
   */
  async obtenerDesafio(id: string): Promise<any> {
    // TODO: T089 + T092
    // const response = await httpClient.get(`${this.baseUrl}/${id}`)
    // return mapearDesafioDTO(response)
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * POST /desafios
   * Body: multipart/form-data { datos: JSON, fotos: File[] }
   * Retorna: Desafio creado
   * Pendiente: P-01 (formato multipart), A-11 (estructura fotos)
   */
  async publicarDesafio(datos: any): Promise<any> {
    // TODO: T089 + T091 + T094
    // const formData = mapearDesafioEscritura(datos)
    // const response = await httpClient.post(`${this.baseUrl}`, formData)
    // return mapearDesafioDTO(response)
    throw new Error('Pendiente T089 + T091 + T094 (P-01)')
  }

  /**
   * PUT /desafios/:id
   * Headers: If-Match: <version> (P-04)
   * Body: multipart/form-data { datos: JSON, fotos: File[] }
   * Retorna: Desafio actualizado
   * Error 409: Conflicto de versión (CB-02)
   * Pendiente: P-04 (If-Match), CB-02 (confirmación conflicto)
   */
  async editarDesafio(id: string, datos: any, version: number): Promise<any> {
    // TODO: T089 + T091 + T095
    // const formData = mapearDesafioEscritura(datos)
    // const response = await httpClient.put(`${this.baseUrl}/${id}`, formData, {
    //   headers: { 'If-Match': version.toString() }
    // })
    // return mapearDesafioDTO(response)
    // // mapearErrorDesafios() -> ConflictoVersionError (CB-02)
    throw new Error('Pendiente T089 + T091 + T095 (P-04)')
  }

  /**
   * DELETE /desafios/:id
   * Retorna: void
   */
  async eliminarDesafio(id: string): Promise<void> {
    // TODO: T089 + T092
    // await httpClient.delete(`${this.baseUrl}/${id}`)
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * GET /desafios/:id/respuestas
   * Query: cursor, limit
   * Retorna: { items: RespuestaDesafio[], siguienteCursor?, total }
   * Pendiente: A-22 (estructura), A-21 (fotos)
   */
  async listarRespuestas(desafioId: string, pagina: any): Promise<any> {
    // TODO: T089 + T092
    // const query = new URLSearchParams()
    // if (pagina.cursor) query.set('cursor', pagina.cursor)
    // if (pagina.limite) query.set('limit', pagina.limite.toString())
    // const response = await httpClient.get(`${this.baseUrl}/${desafioId}/respuestas?${query}`)
    // return { items: response.items.map(mapearRespuestaDTO), ... }
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * POST /desafios/:id/respuestas
   * Body: { contenido, fotos[] } (pendiente A-22)
   * Retorna: RespuestaDesafio creada
   * Pendiente: A-22, A-21
   */
  async responderDesafio(desafioId: string): Promise<any> {
    // TODO: T089 + T092
    throw new Error('Pendiente T089 + A-22')
  }

  /**
   * PUT /respuestas/:id
   * Body: { contenido, fotos[] }
   * Retorna: RespuestaDesafio actualizada
   * Pendiente: A-22, P-02 (¿editar si desafío no ACTIVO?)
   */
  async editarRespuesta(respuestaId: string): Promise<any> {
    // TODO: T089 + T092
    throw new Error('Pendiente T089 + A-22')
  }

  /**
   * DELETE /respuestas/:id
   * Retorna: void
   * Pendiente: P-02
   */
  async eliminarRespuesta(respuestaId: string): Promise<void> {
    // TODO: T089 + T092
    // await httpClient.delete(`/api/respuestas/${respuestaId}`)
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * GET /solicitudes
   * Query: estado, cursor, limit
   * Retorna: { items: SolicitudDesafio[], siguienteCursor?, total }
   * Nota: Usuario ve solo sus solicitudes; admin ve todas
   * Pendiente: A-08, A-17 (campos y filtros)
   */
  async listarSolicitudes(filtros: any, pagina: any): Promise<any> {
    // TODO: T089 + T092
    // const query = new URLSearchParams()
    // if (filtros.estado) query.set('estado', filtros.estado)
    // if (pagina.cursor) query.set('cursor', pagina.cursor)
    // if (pagina.limite) query.set('limit', pagina.limite.toString())
    // const response = await httpClient.get(`/api/solicitudes?${query}`)
    // return { items: response.items.map(mapearSolicitudDTO), ... }
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * POST /solicitudes
   * Body: { ... } (pendiente A-08)
   * Retorna: SolicitudDesafio creada
   * Pendiente: A-08 (campos de escritura)
   */
  async proponerSolicitud(): Promise<any> {
    // TODO: T089 + T092
    throw new Error('Pendiente T089 + A-08')
  }

  /**
   * PUT /solicitudes/:id
   * Body: { ... } (pendiente A-04, A-08)
   * Retorna: SolicitudDesafio actualizada
   * Pendiente: A-04 (¿editar resueltas?), P-04 (If-Match?)
   */
  async editarSolicitud(id: string, version: number): Promise<any> {
    // TODO: T089 + T092
    throw new Error('Pendiente T089 + A-04')
  }

  /**
   * DELETE /solicitudes/:id
   * Retorna: void
   */
  async eliminarSolicitud(id: string): Promise<void> {
    // TODO: T089 + T092
    // await httpClient.delete(`/api/solicitudes/${id}`)
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * POST /solicitudes/:id/aprobar
   * Retorna: SolicitudDesafio (estado=APROBADA)
   * Pendiente: P-03 (¿crea desafío automático?)
   */
  async aprobarSolicitud(id: string): Promise<any> {
    // TODO: T089 + T092
    // const response = await httpClient.post(`/api/solicitudes/${id}/aprobar`)
    // return mapearSolicitudDTO(response)
    throw new Error('Pendiente T089 + T092')
  }

  /**
   * POST /solicitudes/:id/rechazar
   * Retorna: SolicitudDesafio (estado=RECHAZADA)
   */
  async rechazarSolicitud(id: string): Promise<any> {
    // TODO: T089 + T092
    // const response = await httpClient.post(`/api/solicitudes/${id}/rechazar`)
    // return mapearSolicitudDTO(response)
    throw new Error('Pendiente T089 + T092')
  }
}

/**
 * Instancia singleton lista para inyectar cuando se resuelva T089
 */
export const httpDesafiosAdapter = new HttpDesafiosAdapter()
