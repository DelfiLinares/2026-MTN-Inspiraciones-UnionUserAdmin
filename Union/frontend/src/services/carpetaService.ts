import { CarpetaPost } from '../domain/CarpetaPost'
import { Publicacion } from '../domain/Publicacion'
import { CarpetaRepository } from '../application/ports/CarpetaRepository'
import {
  ResultadoCarpetasPaginado,
  ResultadoPublicacionesPaginado,
  ResultadoGuardadoPost,
} from '../application/ports/CarpetaRepository'
import { CarpetaService } from '../application/CarpetaService'
import { httpClient } from '../infrastructure/httpClient'
import { apiEndpoints } from '../infrastructure/apiEndpoints'

/**
 * Adaptador HTTP CarpetaRepository — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (paths: /usuarios/{id}/carpetas, /carpetas, /carpetas/{id}, /carpetas/{id}/posts)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, HU-09, HU-10, A3, A6, A7, A8)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 4, capa infrastructure)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T038)
 *
 * Implementación HTTP del puerto CarpetaRepository (T036).
 * Mapea endpoints HTTP a métodos del puerto y gestiona errores según A3/A6/A7/A8.
 *
 * Responsabilidades:
 * 1. Listar carpetas de un usuario (GET /usuarios/{usuarioId}/carpetas)
 * 2. Crear carpeta propia (POST /carpetas)
 * 3. Renombrar carpeta propia (PATCH /carpetas/{carpetaId})
 * 4. Eliminar carpeta propia (DELETE /carpetas/{carpetaId})
 * 5. Listar publicaciones de una carpeta (GET /carpetas/{carpetaId}/posts)
 * 6. Guardar publicación en carpeta (POST /carpetas/{carpetaId}/posts)
 * 7. Quitar publicación de carpeta (DELETE /carpetas/{carpetaId}/posts/{publicacionId})
 * 8. Mapear errores HTTP a excepciones con detalles
 * 9. Convertir DTOs HTTP a entidades de dominio
 *
 * Manejo de errores:
 * - A3: 409 Conflict si nombre duplicado o ya existe
 * - A6: 400 si parámetros de paginación inválidos
 * - A7: 403/404 si no es propietario
 * - A8: 200 (ya existe) vs 201 (nueva) en guardar post
 *
 * Historias: HU-05, HU-06, HU-07, HU-08, HU-09, HU-10
 */

/**
 * DTO del API HTTP para CarpetaPost.
 */
interface CarpetaPostResponseDto {
  id: string
  usuarioId: string
  nombre: string
  descripcion?: string
  fechaCreacion: string
  postCount?: number
}

/**
 * DTO del API HTTP para Publicacion.
 */
interface PublicacionResponseDto {
  id: string
  autorId: string
  imagenUrl: string
  texto: string
  fechaCreacion: string
  fechaActualizacion?: string
}

/**
 * DTO del API HTTP para crear carpeta (POST /carpetas).
 */
interface CrearCarpetaRequestDto {
  nombre: string
}

/**
 * DTO del API HTTP para renombrar carpeta (PATCH /carpetas/{carpetaId}).
 */
interface RenombrarCarpetaRequestDto {
  nombre: string
}

/**
 * DTO del API HTTP para guardar post en carpeta (POST /carpetas/{carpetaId}/posts).
 */
interface GuardarPostRequestDto {
  publicacionId: string
}

/**
 * DTO del API HTTP para respuesta de guardar post.
 * A8: Puede retornar 200 (ya existía) o 201 (nueva).
 */
interface GuardarPostResponseDto {
  carpetaId: string
  publicacionId: string
  creada?: boolean
  mensaje?: string
}

/**
 * DTO del API HTTP para respuesta paginada de carpetas.
 */
interface PaginaCarpetasResponseDto {
  items: CarpetaPostResponseDto[]
  total: number
  limit: number
  offset: number
  hasMore?: boolean
}

/**
 * DTO del API HTTP para respuesta paginada de publicaciones.
 */
interface PaginaPublicacionesResponseDto {
  items: PublicacionResponseDto[]
  total: number
  limit: number
  offset: number
  hasMore?: boolean
}

/**
 * Mapear DTO HTTP a entidad CarpetaPost de dominio.
 */
function mapearCarpetaDelDto(dto: CarpetaPostResponseDto): CarpetaPost {
  return new CarpetaPost(
    dto.id,
    dto.usuarioId,
    dto.nombre,
    dto.descripcion || '',
    new Date(dto.fechaCreacion),
    dto.postCount || 0,
  )
}

/**
 * Mapear DTO HTTP a entidad Publicacion de dominio.
 */
function mapearPublicacionDelDto(dto: PublicacionResponseDto): Publicacion {
  return new Publicacion(
    dto.id,
    dto.autorId,
    dto.imagenUrl,
    dto.texto,
    new Date(dto.fechaCreacion),
    dto.fechaActualizacion ? new Date(dto.fechaActualizacion) : undefined,
  )
}

/**
 * Parsear errores HTTP y lanzar excepciones descriptivas.
 * Maneja A3, A6, A7, A8 según openapi.yaml.
 */
function manejarErrorHttp(status: number, mensaje?: string, detalles?: any): never {
  switch (status) {
    case 400:
      // Validación fallida (nombre vacío, fuera de límite, parámetros inválidos)
      throw new Error(
        mensaje ||
          'Validación fallida. Verifica los datos enviados (nombre, limit, offset).',
      )
    case 401:
      // No autenticado
      throw new Error('No estás autenticado. Inicia sesión para continuar.')
    case 403:
      // Permisos insuficientes (no es propietario)
      throw new Error('No tienes permisos para realizar esta acción en esta carpeta.')
    case 404:
      // No encontrado (carpeta, publicación)
      throw new Error('La carpeta o publicación no existe.')
    case 409:
      // Conflicto (A3: nombre duplicado, A6: límite de carpetas alcanzado)
      // Diferenciar según detalles si está disponible
      if (detalles?.codigo === 'NOMBRE_DUPLICADO') {
        throw new Error(
          'Ya tienes una carpeta con este nombre. Por favor, elige otro.',
        )
      }
      if (detalles?.codigo === 'LIMITE_CARPETAS_ALCANZADO') {
        throw new Error(
          'Alcanzaste el límite de 50 carpetas. Elimina una para crear otra.',
        )
      }
      throw new Error(
        mensaje ||
          'Esta acción no se puede realizar ahora. Verifica los datos e intenta nuevamente.',
      )
    case 507:
      // Insufficient storage (fallback para límite de carpetas)
      throw new Error(
        'Se alcanzó el límite de almacenamiento. Elimina una carpeta e intenta nuevamente.',
      )
    default:
      throw new Error(
        mensaje ||
          `Error al procesar la solicitud (${status}). Por favor, intenta nuevamente.`,
      )
  }
}

/**
 * Clase que implementa CarpetaRepository.
 * Delegada por CarpetaService (T037) para operaciones HTTP.
 */
class HttpCarpetaRepository implements CarpetaRepository {
  /**
   * HU-08: Listar carpetas públicas de un usuario.
   * Endpoint: GET /usuarios/{usuarioId}/carpetas?limit={limit}&offset={offset}
   * A6: Paginación server-side.
   */
  async listarCarpetas(
    usuarioId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ResultadoCarpetasPaginado> {
    try {
      const url = `${apiEndpoints.listarCarpetasDePerfil(usuarioId)}?limit=${limit}&offset=${offset}`
      const response = await httpClient.get<PaginaCarpetasResponseDto>(url)

      return {
        carpetas: response.items.map(mapearCarpetaDelDto),
        total: response.total,
        limit: response.limit,
        offset: response.offset,
      }
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-05: Crear carpeta propia.
   * Endpoint: POST /carpetas
   * A3: 409 si nombre duplicado
   * A6: 409 si límite de 50 alcanzado
   */
  async crearCarpeta(nombre: string): Promise<CarpetaPost> {
    try {
      const payload: CrearCarpetaRequestDto = { nombre }
      const response = await httpClient.post<CarpetaPostResponseDto>(
        apiEndpoints.crearCarpeta(),
        payload,
      )
      return mapearCarpetaDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      const detalles = (error as any)?.detalles

      if (status === 409) {
        // A3: Nombre duplicado o A6: Límite alcanzado
        // Backend distingue en la respuesta
        manejarErrorHttp(status, mensaje, detalles)
      }

      manejarErrorHttp(status, mensaje, detalles)
    }
  }

  /**
   * HU-06: Renombrar carpeta propia.
   * Endpoint: PATCH /carpetas/{carpetaId}
   * A3: 409 si nuevo nombre duplicado
   * AC-06.5: 403 si no es propietario
   */
  async renombrarCarpeta(carpetaId: string, nombre: string): Promise<CarpetaPost> {
    try {
      const payload: RenombrarCarpetaRequestDto = { nombre }
      const response = await httpClient.patch<CarpetaPostResponseDto>(
        apiEndpoints.renombrarCarpeta(carpetaId),
        payload,
      )
      return mapearCarpetaDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      const detalles = (error as any)?.detalles

      manejarErrorHttp(status, mensaje, detalles)
    }
  }

  /**
   * HU-07: Eliminar carpeta propia.
   * Endpoint: DELETE /carpetas/{carpetaId}
   * AC-07.6: 403 si no es propietario
   */
  async eliminarCarpeta(carpetaId: string): Promise<void> {
    try {
      await httpClient.delete(apiEndpoints.eliminarCarpeta(carpetaId))
      // 204 No Content
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-10: Listar publicaciones guardadas en una carpeta.
   * Endpoint: GET /carpetas/{carpetaId}/posts?limit={limit}&offset={offset}
   * A6: Paginación server-side.
   */
  async listarPostsDeCarpeta(
    carpetaId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ResultadoPublicacionesPaginado> {
    try {
      const url = `${apiEndpoints.listarPostsDeCarpeta(carpetaId)}?limit=${limit}&offset=${offset}`
      const response = await httpClient.get<PaginaPublicacionesResponseDto>(url)

      return {
        publicaciones: response.items.map(mapearPublicacionDelDto),
        total: response.total,
        limit: response.limit,
        offset: response.offset,
      }
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-09: Guardar publicación en carpeta.
   * Endpoint: POST /carpetas/{carpetaId}/posts
   * A8: Idempotente. Retorna 200 si ya estaba guardada, 201 si es nueva.
   * Backend indica en respuesta si fue creada (esNueva).
   */
  async guardarPostEnCarpeta(
    carpetaId: string,
    publicacionId: string,
  ): Promise<ResultadoGuardadoPost> {
    try {
      const payload: GuardarPostRequestDto = { publicacionId }
      const response = await httpClient.post<GuardarPostResponseDto>(
        apiEndpoints.guardarPostEnCarpeta(carpetaId),
        payload,
      )

      // A8: Diferenciar entre 200 (existía) y 201 (nueva)
      // El backend indica esto en la respuesta (creada/esNueva)
      return {
        esNueva: response.creada ?? true, // Default: true si no viene el campo
        carpetaId: response.carpetaId,
        publicacionId: response.publicacionId,
        mensaje: response.mensaje,
      }
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-10: Quitar publicación de carpeta.
   * Endpoint: DELETE /carpetas/{carpetaId}/posts/{publicacionId}
   * AC-10.1: Publicación original NO se elimina de la plataforma.
   */
  async quitarPostDeCarpeta(
    carpetaId: string,
    publicacionId: string,
  ): Promise<void> {
    try {
      await httpClient.delete(
        apiEndpoints.quitarPostDeCarpeta(carpetaId, publicacionId),
      )
      // 204 No Content
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }
}

/**
 * Singleton: instancia única del repositorio HTTP.
 * Se inyecta en CarpetaService (T037).
 */
export const carpetaRepository = new HttpCarpetaRepository()

/**
 * Singleton: instancia única del servicio de aplicación.
 * Se inyecta el repositorio HTTP como dependencia.
 * Usado en componentes de presentación (T039, T040, T041, T042, T043, T044).
 */
export const carpetaService = new CarpetaService(carpetaRepository)
