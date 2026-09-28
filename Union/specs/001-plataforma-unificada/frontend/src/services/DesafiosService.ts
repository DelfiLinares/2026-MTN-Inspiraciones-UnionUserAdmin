/**
 * Servicio de aplicación `DesafiosService` (módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-66 a RF-70, CB-15)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T067)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/desafios-propuestos`, `GET /admin/desafios-propuestos/{id}`,
 *   `POST /admin/desafios-propuestos/{id}/aprobar`, `POST /admin/desafios-propuestos/{id}/rechazar`)
 *
 * Responsabilidades:
 * - `listarDesafiosPropuestos(filtros)`: Listado paginado de desafíos propuestos (`GET /admin/desafios-propuestos`, RF-66).
 * - `obtenerDetalleDesafioPropuesto(id)`: Detalle completo de un desafío propuesto con `contenidoFormulario` (RF-67).
 * - `aprobarDesafio(desafioId)`: Aprueba un desafío propuesto en estado PENDIENTE (`POST /admin/desafios-propuestos/{id}/aprobar`, RF-68).
 *   Valida previamente `desafio.puedeAprobarse()`. Si la decisión ya se tomó (CB-15), rechaza con `DesafioYaResueltoError`.
 * - `rechazarDesafio(desafioId)`: Rechaza un desafío propuesto en estado PENDIENTE (`POST /admin/desafios-propuestos/{id}/rechazar`, RF-69).
 *   Valida previamente `desafio.puedeRechazarse()`. Si la decisión ya se tomó (CB-15), rechaza con `DesafioYaResueltoError`.
 */

import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { DesafioPropuesto } from '../domain/DesafioPropuesto'
import { EstadoDesafioPropuesto } from '../domain/enums/EstadoDesafioPropuesto'
import type { HttpClient, HttpRequestOptions } from '../application/ports/HttpClient'

export const MENSAJE_DESAFIO_YA_RESUELTO = 'El desafío ya fue resuelto previamente (la decisión es irreversible).'

export class DesafioYaResueltoError extends Error {
  constructor(mensaje = MENSAJE_DESAFIO_YA_RESUELTO) {
    super(mensaje)
    this.name = 'DesafioYaResueltoError'
  }
}

export interface DesafioPropuestoDto {
  id: string
  autorId: string
  titulo?: string
  descripcion?: string
  contenidoFormulario?: Record<string, unknown>
  estado: EstadoDesafioPropuesto
  fechaPropuesta?: string
}

export interface RespuestaListaDesafiosPropuestosDto {
  items: DesafioPropuestoDto[]
  total: number
}

export interface FiltrosDesafiosPropuestos {
  estado?: EstadoDesafioPropuesto
  page?: number
  pageSize?: number
}

export interface PaginaDesafiosPropuestos {
  items: DesafioPropuesto[]
  total: number
}

function mapearDesafioPropuesto(dto: DesafioPropuestoDto): DesafioPropuesto {
  return new DesafioPropuesto({
    id: dto.id,
    autorId: dto.autorId,
    titulo: dto.titulo,
    descripcion: dto.descripcion,
    contenidoFormulario: dto.contenidoFormulario,
    estado: dto.estado,
    fechaPropuesta: dto.fechaPropuesta ? new Date(dto.fechaPropuesta) : undefined,
  })
}

/**
 * Obtiene el listado de desafíos propuestos por los usuarios (`GET /admin/desafios-propuestos`, RF-66).
 */
export async function listarDesafiosPropuestos(
  filtros: FiltrosDesafiosPropuestos = {},
  options?: HttpRequestOptions
): Promise<PaginaDesafiosPropuestos> {
  const params: Record<string, string | number | boolean | undefined> = {
    estado: filtros.estado ?? EstadoDesafioPropuesto.PENDIENTE,
    page: filtros.page ?? 1,
    pageSize: filtros.pageSize ?? 10,
  }

  const respuesta = await httpClientAdmin.get<RespuestaListaDesafiosPropuestosDto>(
    apiEndpoints.desafiosPropuestos(),
    { ...options, params }
  )

  const itemsRaw = Array.isArray(respuesta.items) ? respuesta.items : []
  const items = itemsRaw.map(mapearDesafioPropuesto)
  const total = typeof respuesta.total === 'number' ? respuesta.total : items.length

  return { items, total }
}

/**
 * Obtiene los detalles completos de un desafío propuesto (`GET /admin/desafios-propuestos/{id}`, RF-67).
 */
export async function obtenerDetalleDesafioPropuesto(
  desafioId: string,
  options?: HttpRequestOptions
): Promise<DesafioPropuesto> {
  const dto = await httpClientAdmin.get<DesafioPropuestoDto>(
    apiEndpoints.desafioPropuesto(desafioId),
    options
  )

  return mapearDesafioPropuesto(dto)
}

/**
 * Aprueba un desafío propuesto (`POST /admin/desafios-propuestos/{id}/aprobar`, RF-68).
 * Verifica que el desafío esté en estado PENDIENTE. Transición irreversible (CB-15).
 */
export async function aprobarDesafio(
  desafio: DesafioPropuesto | string,
  options?: HttpRequestOptions
): Promise<DesafioPropuesto> {
  const id = typeof desafio === 'string' ? desafio : desafio.id

  if (typeof desafio !== 'string' && !desafio.puedeAprobarse()) {
    throw new DesafioYaResueltoError(MENSAJE_DESAFIO_YA_RESUELTO)
  }

  const dto = await httpClientAdmin.post<DesafioPropuestoDto>(
    apiEndpoints.aprobarDesafio(id),
    undefined,
    options
  )

  return mapearDesafioPropuesto(dto)
}

/**
 * Rechaza un desafío propuesto (`POST /admin/desafios-propuestos/{id}/rechazar`, RF-69).
 * Verifica que el desafío esté en estado PENDIENTE. Transición irreversible (CB-15).
 */
export async function rechazarDesafio(
  desafio: DesafioPropuesto | string,
  options?: HttpRequestOptions
): Promise<DesafioPropuesto> {
  const id = typeof desafio === 'string' ? desafio : desafio.id

  if (typeof desafio !== 'string' && !desafio.puedeRechazarse()) {
    throw new DesafioYaResueltoError(MENSAJE_DESAFIO_YA_RESUELTO)
  }

  const dto = await httpClientAdmin.post<DesafioPropuestoDto>(
    apiEndpoints.rechazarDesafio(id),
    undefined,
    options
  )

  return mapearDesafioPropuesto(dto)
}

/**
 * Clase `DesafiosService` (orientada a inyección de dependencias con `HttpClient`).
 */
export class DesafiosService {
  constructor(private readonly client: HttpClient = httpClientAdmin) {}

  async listarDesafios(
    filtros: FiltrosDesafiosPropuestos = {},
    options?: HttpRequestOptions
  ): Promise<PaginaDesafiosPropuestos> {
    const params: Record<string, string | number | boolean | undefined> = {
      estado: filtros.estado ?? EstadoDesafioPropuesto.PENDIENTE,
      page: filtros.page ?? 1,
      pageSize: filtros.pageSize ?? 10,
    }

    const respuesta = await this.client.get<RespuestaListaDesafiosPropuestosDto>(
      apiEndpoints.desafiosPropuestos(),
      { ...options, params }
    )

    const itemsRaw = Array.isArray(respuesta.items) ? respuesta.items : []
    const items = itemsRaw.map(mapearDesafioPropuesto)
    const total = typeof respuesta.total === 'number' ? respuesta.total : items.length

    return { items, total }
  }

  async obtenerDetalle(
    desafioId: string,
    options?: HttpRequestOptions
  ): Promise<DesafioPropuesto> {
    const dto = await this.client.get<DesafioPropuestoDto>(
      apiEndpoints.desafioPropuesto(desafioId),
      options
    )

    return mapearDesafioPropuesto(dto)
  }

  async aprobar(
    desafio: DesafioPropuesto | string,
    options?: HttpRequestOptions
  ): Promise<DesafioPropuesto> {
    const id = typeof desafio === 'string' ? desafio : desafio.id

    if (typeof desafio !== 'string' && !desafio.puedeAprobarse()) {
      throw new DesafioYaResueltoError(MENSAJE_DESAFIO_YA_RESUELTO)
    }

    const dto = await this.client.post<DesafioPropuestoDto>(
      apiEndpoints.aprobarDesafio(id),
      undefined,
      options
    )

    return mapearDesafioPropuesto(dto)
  }

  async rechazar(
    desafio: DesafioPropuesto | string,
    options?: HttpRequestOptions
  ): Promise<DesafioPropuesto> {
    const id = typeof desafio === 'string' ? desafio : desafio.id

    if (typeof desafio !== 'string' && !desafio.puedeRechazarse()) {
      throw new DesafioYaResueltoError(MENSAJE_DESAFIO_YA_RESUELTO)
    }

    const dto = await this.client.post<DesafioPropuestoDto>(
      apiEndpoints.rechazarDesafio(id),
      undefined,
      options
    )

    return mapearDesafioPropuesto(dto)
  }
}

export const desafiosService = {
  listarDesafiosPropuestos,
  obtenerDetalleDesafioPropuesto,
  aprobarDesafio,
  rechazarDesafio,
}
