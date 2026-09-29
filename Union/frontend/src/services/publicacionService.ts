/**
 * Servicio de aplicación `publicacionService` (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-21 a RF-36, CB-01, CB-02)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T048, T070)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección B)
 *
 * Responsabilidades:
 * - Crear publicación (`POST /publicaciones`, multipart/form-data) soportando reintento manual
 *   ante error de red sin perder los datos ya adjuntados (CB-01).
 * - Like/Unlike (`POST`/`DELETE /publicaciones/{id}/like`) con reversión ante error y
 *   serialización/debounce de clics consecutivos rápidos para evitar inconsistencias (CB-02).
 * - Reportar publicación (`POST /publicaciones/{id}/reportes`).
 * - Consultar estado de reporte del usuario actual (`GET /publicaciones/{id}/reportes/mio`).
 */

import { httpClient, ApiError } from '../infrastructure/httpClient'
import { config } from '../infrastructure/config'
import { Publicacion } from '../domain/Publicacion'
import { TipoContenido } from '../domain/enums/TipoContenido'
import { EstadoPublicacion } from '../domain/enums/EstadoPublicacion'

export interface LikeResponseDto {
  cantidadLikes: number
  likeDelUsuarioActual: boolean
}

export interface ReporteResponseDto {
  id: string
  estado: string
}

export interface EstadoReporteMioDto {
  reportado: boolean
}

export interface PublicacionDto {
  id: string
  autorId: string
  tipoContenido: TipoContenido
  estado: EstadoPublicacion
  tags: string[]
  cantidadLikes: number
  likeDelUsuarioActual: boolean
  reportadaPorUsuarioActual: boolean
  urlContenido?: string
  titulo?: string
  descripcion?: string
  creadaEn?: string
}

export interface DatosCrearPublicacion {
  archivo: File | Blob
  tipoContenido: TipoContenido
  tags?: string[]
  titulo?: string
  descripcion?: string
}

export interface ResultadoCreacionPublicacion {
  publicacion: Publicacion
  exito: boolean
}

function mapearPublicacion(dto: PublicacionDto): Publicacion {
  return new Publicacion({
    id: dto.id,
    autorId: dto.autorId,
    tipoContenido: dto.tipoContenido,
    estado: dto.estado,
    tags: dto.tags ?? [],
    cantidadLikes: dto.cantidadLikes ?? 0,
    likeDelUsuarioActual: dto.likeDelUsuarioActual ?? false,
    reportadaPorUsuarioActual: dto.reportadaPorUsuarioActual ?? false,
  })
}

// Colas y controladores para serializar y debouncar llamadas rápidas de like por publicación (CB-02)
const controllersPorPublicacion = new Map<string, AbortController>()
const promesasEnCursoPorPublicacion = new Map<string, Promise<Publicacion>>()

/**
 * Alterna el like de una publicación aplicando actualización optimista en el dominio,
 * serializando llamadas consecutivas (CB-02) y revirtiendo el estado ante fallo de la API.
 */
export async function alternarLike(
  publicacionActual: Publicacion,
  usuarioActualId: string,
  autenticado = true,
): Promise<Publicacion> {
  const publicacionId = publicacionActual.id

  // 1. Validar reglas del dominio (no likear propia, requerir auth, etc.)
  if (!publicacionActual.puedeDarLike(usuarioActualId, autenticado)) {
    throw new Error('No se puede dar like a una publicación propia o con sesión no autorizada.')
  }

  // 2. Cancelar request anterior en vuelo para esta publicación si aún no finalizó (CB-02)
  const controllerPrevio = controllersPorPublicacion.get(publicacionId)
  if (controllerPrevio) {
    controllerPrevio.abort()
  }

  const controller = new AbortController()
  controllersPorPublicacion.set(publicacionId, controller)

  // 3. Aplicar actualización optimista usando el método de dominio
  const publicacionOptimista = publicacionActual.toggleLike()
  const dioLike = publicacionOptimista.likeDelUsuarioActual

  const ejecutarRequest = async (): Promise<Publicacion> => {
    try {
      const endpoint = `/publicaciones/${publicacionId}/like`
      let resultadoDto: LikeResponseDto

      if (dioLike) {
        resultadoDto = await httpClient.post<LikeResponseDto>(endpoint, undefined, {
          signal: controller.signal,
        })
      } else {
        resultadoDto = await httpClient.delete<LikeResponseDto>(endpoint, {
          signal: controller.signal,
        })
      }

      // Si la llamada fue exitosa y no fue abortada por una acción posterior
      return new Publicacion({
        ...publicacionOptimista,
        cantidadLikes: resultadoDto.cantidadLikes ?? publicacionOptimista.cantidadLikes,
        likeDelUsuarioActual: resultadoDto.likeDelUsuarioActual ?? dioLike,
      })
    } catch (error) {
      if (controller.signal.aborted) {
        // Si fue abortada por otro clic consecutivo, no revertir el estado del último clic
        throw error
      }
      // Reversión ante fallo de red o error de API (AC-01.3 / CB-02)
      throw error
    } finally {
      if (controllersPorPublicacion.get(publicacionId) === controller) {
        controllersPorPublicacion.delete(publicacionId)
        promesasEnCursoPorPublicacion.delete(publicacionId)
      }
    }
  }

  const promesa = ejecutarRequest()
  promesasEnCursoPorPublicacion.set(publicacionId, promesa)
  return promesa
}

/**
 * Envía un reporte de publicación al backend (`POST /publicaciones/{id}/reportes`).
 */
export async function reportarPublicacion(
  publicacion: Publicacion,
  usuarioActualId: string,
  motivoCodigo: string,
  autenticado = true,
): Promise<ReporteResponseDto> {
  if (!publicacion.puedeReportar(usuarioActualId, autenticado)) {
    throw new Error('No se puede reportar una publicación propia o ya reportada.')
  }

  const respuesta = await httpClient.post<ReporteResponseDto>(
    `/publicaciones/${publicacion.id}/reportes`,
    { motivoCodigo },
  )

  return respuesta
}

/**
 * Consulta si la publicación fue reportada por el usuario actual (`GET /publicaciones/{id}/reportes/mio`).
 */
export async function consultarEstadoReporteMio(publicacionId: string): Promise<boolean> {
  try {
    const res = await httpClient.get<EstadoReporteMioDto>(`/publicaciones/${publicacionId}/reportes/mio`)
    return res.reportado === true
  } catch {
    return false
  }
}

/**
 * Sube y crea una nueva publicación (`POST /publicaciones`, multipart/form-data).
 * Permite reintentar manualmente ante fallas de red sin perder los datos originales (CB-01).
 */
export async function crearPublicacion(
  datos: DatosCrearPublicacion,
  onProgreso?: (porcentaje: number) => void,
): Promise<ResultadoCreacionPublicacion> {
  if (!datos.archivo) {
    throw new Error('Debe adjuntar un archivo para crear la publicación.')
  }

  const formData = new FormData()
  formData.append('archivo', datos.archivo)
  formData.append('tipoContenido', datos.tipoContenido)

  if (datos.tags && datos.tags.length > 0) {
    datos.tags.forEach((tag) => formData.append('tags[]', tag))
  }
  if (datos.titulo) {
    formData.append('titulo', datos.titulo)
  }
  if (datos.descripcion) {
    formData.append('descripcion', datos.descripcion)
  }

  // Si se solicita seguimiento de progreso y existe XMLHttpRequest (navegador)
  if (typeof XMLHttpRequest !== 'undefined' && onProgreso) {
    return new Promise<ResultadoCreacionPublicacion>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const baseUrl = config.apiBaseUrl ?? ''
      const url = `${baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl}/publicaciones`

      xhr.open('POST', url)
      xhr.withCredentials = true

      xhr.upload.addEventListener('progress', (evento) => {
        if (evento.lengthComputable) {
          const porcentaje = Math.round((evento.loaded / evento.total) * 100)
          onProgreso(porcentaje)
        }
      })

      xhr.addEventListener('load', () => {
        let body: unknown = null
        try {
          body = xhr.responseText ? JSON.parse(xhr.responseText) : null
        } catch {
          body = xhr.responseText
        }

        if (xhr.status >= 200 && xhr.status < 300) {
          onProgreso(100)
          const publicacionCreada = mapearPublicacion(body as PublicacionDto)
          resolve({
            publicacion: publicacionCreada,
            exito: true,
          })
          return
        }

        reject(new ApiError(`Error al crear la publicación (${xhr.status})`, xhr.status, body))
      })

      xhr.addEventListener('error', () => {
        // Error de red: preserva los datos originales para reintento (CB-01)
        reject(new ApiError('Error de conexión de red al subir la publicación. Se puede reintentar.', 0, null))
      })

      xhr.addEventListener('abort', () => {
        reject(new ApiError('Subida cancelada.', 0, null))
      })

      xhr.send(formData)
    })
  }

  // Fallback con httpClient estándar
  const dto = await httpClient.post<PublicacionDto>('/publicaciones', formData)
  return {
    publicacion: mapearPublicacion(dto),
    exito: true,
  }
}

export const publicacionService = {
  alternarLike,
  reportarPublicacion,
  consultarEstadoReporteMio,
  crearPublicacion,
}
