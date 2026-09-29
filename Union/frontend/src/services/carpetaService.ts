/**
 * Servicio de carpetas de publicaciones guardadas (HU-09).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-48 a RF-53, CB-03)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /usuarios/{id}/carpetas`, `POST /carpetas`, `PATCH/DELETE /carpetas/{id}`, `POST/DELETE /carpetas/{id}/posts`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T061)
 *
 * Responsabilidades:
 * - CRUD de carpetas y gestión de publicaciones guardadas.
 * - Validación del límite de 100 carpetas (RF-52) antes de permitir crear una nueva:
 *   `puedeCrearNuevaCarpeta(cantidadActual)`.
 * - Cobertura de CB-03: expone el estado de carga (`cargando`) y la regla `puedeGuardarEnCarpeta()`
 *   para bloquear la acción de guardar mientras la lista de carpetas aún se está cargando.
 */

import { httpClient, HttpRequestOptions } from '../infrastructure/httpClient'
import { Carpeta } from '../domain/Carpeta'

export const LIMITE_MAXIMO_CARPETAS = 100

export interface CarpetaDto {
  id: string
  nombre: string
  cantidadPosts?: number
  propietarioId?: string
  deLaCarpetaDelUsuarioActual?: boolean
}

export interface CarpetasRespuestaDto {
  items: CarpetaDto[]
}

export interface EstadoCargaCarpetas {
  carpetas: Carpeta[]
  cargando: boolean
  error: string | null
}

/**
 * Validador de negocio: determina si se puede crear una nueva carpeta
 * respetando el límite máximo estricto de 100 carpetas (RF-52, AC-09.6).
 */
export function puedeCrearNuevaCarpeta(cantidadCarpetasActuales: number): boolean {
  return cantidadCarpetasActuales < LIMITE_MAXIMO_CARPETAS
}

/**
 * Validador de cobertura CB-03:
 * Bloquea la acción de guardar un post en carpeta mientras la lista de carpetas
 * está cargando (`cargando === true`), o si no se ha seleccionado/cargado ninguna carpeta válida.
 */
export function puedeGuardarEnCarpeta(cargando: boolean, carpetaSeleccionadaId?: string | null): boolean {
  if (cargando) {
    return false
  }
  return Boolean(carpetaSeleccionadaId && carpetaSeleccionadaId.trim() !== '')
}

function mapearCarpeta(dto: CarpetaDto, propietarioId?: string): Carpeta {
  return new Carpeta({
    id: dto.id,
    nombre: dto.nombre,
    cantidadPosts: dto.cantidadPosts ?? 0,
    propietarioId: dto.propietarioId ?? propietarioId,
    deLaCarpetaDelUsuarioActual: dto.deLaCarpetaDelUsuarioActual,
  })
}

/**
 * Obtiene las carpetas públicas de un usuario (`GET /usuarios/{id}/carpetas`, RF-53).
 */
export async function obtenerCarpetas(
  usuarioId: string,
  options?: HttpRequestOptions
): Promise<Carpeta[]> {
  const respuesta = await httpClient.get<CarpetasRespuestaDto | CarpetaDto[]>(
    `/usuarios/${encodeURIComponent(usuarioId)}/carpetas`,
    options
  )

  if (Array.isArray(respuesta)) {
    return respuesta.map((dto) => mapearCarpeta(dto, usuarioId))
  }

  const items = Array.isArray(respuesta?.items) ? respuesta.items : []
  return items.map((dto) => mapearCarpeta(dto, usuarioId))
}

/**
 * Crea una nueva carpeta para el usuario autenticado (`POST /carpetas`, RF-48).
 * Valida en cliente el límite de 100 carpetas si se provee la cantidad actual (RF-52).
 */
export async function crearCarpeta(
  nombre: string,
  cantidadActual?: number,
  options?: HttpRequestOptions
): Promise<Carpeta> {
  const nombreLimpio = nombre.trim()
  if (!nombreLimpio) {
    throw new Error('El nombre de la carpeta es obligatorio.')
  }

  if (cantidadActual !== undefined && !puedeCrearNuevaCarpeta(cantidadActual)) {
    throw new Error(`Se ha alcanzado el límite máximo de ${LIMITE_MAXIMO_CARPETAS} carpetas permitidas.`)
  }

  const respuesta = await httpClient.post<CarpetaDto>(
    '/carpetas',
    { nombre: nombreLimpio },
    options
  )

  return mapearCarpeta(respuesta)
}

/**
 * Renombra una carpeta existente (`PATCH /carpetas/{id}`, RF-48).
 */
export async function renombrarCarpeta(
  carpetaId: string,
  nuevoNombre: string,
  options?: HttpRequestOptions
): Promise<void> {
  const nombreLimpio = nuevoNombre.trim()
  if (!nombreLimpio) {
    throw new Error('El nombre de la carpeta no puede estar vacío.')
  }

  await httpClient.patch<void>(
    `/carpetas/${encodeURIComponent(carpetaId)}`,
    { nombre: nombreLimpio },
    options
  )
}

/**
 * Elimina una carpeta (`DELETE /carpetas/{id}`, RF-50).
 * Aclara que no se eliminan las publicaciones originales de la plataforma.
 */
export async function eliminarCarpeta(
  carpetaId: string,
  options?: HttpRequestOptions
): Promise<void> {
  await httpClient.delete<void>(`/carpetas/${encodeURIComponent(carpetaId)}`, options)
}

/**
 * Guarda una publicación dentro de una carpeta (`POST /carpetas/{id}/posts`, RF-49).
 */
export async function guardarPostEnCarpeta(
  carpetaId: string,
  publicacionId: string,
  options?: HttpRequestOptions
): Promise<void> {
  await httpClient.post<void>(
    `/carpetas/${encodeURIComponent(carpetaId)}/posts`,
    { publicacionId },
    options
  )
}

/**
 * Quita una publicación de una carpeta (`DELETE /carpetas/{id}/posts/{publicacionId}`, RF-51).
 */
export async function quitarPostDeCarpeta(
  carpetaId: string,
  publicacionId: string,
  options?: HttpRequestOptions
): Promise<void> {
  await httpClient.delete<void>(
    `/carpetas/${encodeURIComponent(carpetaId)}/posts/${encodeURIComponent(publicacionId)}`,
    options
  )
}

export const carpetaService = {
  LIMITE_MAXIMO_CARPETAS,
  puedeCrearNuevaCarpeta,
  puedeGuardarEnCarpeta,
  obtenerCarpetas,
  crearCarpeta,
  renombrarCarpeta,
  eliminarCarpeta,
  guardarPostEnCarpeta,
  quitarPostDeCarpeta,
}
