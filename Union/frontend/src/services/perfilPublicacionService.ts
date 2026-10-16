import { PublicacionPerfil } from '../domain/PublicacionPerfil'
import { PublicacionRepository, ResultadoPublicacionesPaginado, ResultadoGuardadoPublicacion } from '../application/ports/PublicacionRepository'
import { PublicacionService } from '../application/PublicacionService'
import { httpClient } from '../infrastructure/httpClient'
import { apiEndpoints } from '../infrastructure/apiEndpoints'

/**
 * Adaptador HTTP PublicacionRepository — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (paths: /usuarios/{id}/publicaciones, /publicaciones/{id})
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-09, HU-10, HU-11, HU-12, HU-13, A5, A8)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 6, capa infrastructure)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T049)
 *
 * Implementación HTTP del puerto PublicacionRepository (T047).
 * Mapea endpoints HTTP a métodos del puerto y gestiona errores según A5/A8.
 *
 * Responsabilidades:
 * 1. Listar publicaciones de un usuario (GET /usuarios/{usuarioId}/publicaciones)
 * 2. Editar publicación propia (PATCH /publicaciones/{publicacionId})
 * 3. Eliminar publicación propia (DELETE /publicaciones/{publicacionId})
 * 4. Guardar publicación en carpeta (POST /carpetas/{carpetaId}/posts)
 * 5. Quitar publicación de carpeta (DELETE /carpetas/{carpetaId}/posts/{publicacionId})
 * 6. Mapear errores HTTP a excepciones con detalles
 * 7. Convertir DTOs HTTP a entidades de dominio
 *
 * Manejo de errores:
 * - A5: 400 si texto inválido (HU-11), 403 si no es propietario
 * - A8: 200 (ya existe) vs 201 (nueva) en guardar publicación en carpeta
 * - Paginación: A6 (400 si parámetros inválidos)
 *
 * Historias: HU-09, HU-10, HU-11, HU-12, HU-13
 */

/**
 * DTO del API HTTP para PublicacionPerfil.
 */
interface PublicacionResponseDto {
  id: string
  autorId: string
  autorNombreUsuario?: string
  autorFotoUrl?: string
  imagenUrl: string
  texto: string
  fechaCreacion: string
  fechaActualizacion?: string
}

/**
 * DTO del API HTTP para editar publicación (PATCH /publicaciones/{publicacionId}).
 * A5: Solo texto es editable; imagen es inmutable.
 */
interface EditarPublicacionRequestDto {
  texto: string
}

/**
 * DTO del API HTTP para guardar publicación en carpeta (POST /carpetas/{carpetaId}/posts).
 */
interface GuardarPublicacionEnCarpetaRequestDto {
  publicacionId: string
}

/**
 * DTO del API HTTP para respuesta de guardar publicación en carpeta.
 * A8: Puede retornar 200 (ya existía) o 201 (nueva).
 */
interface GuardarPublicacionEnCarpetaResponseDto {
  carpetaId: string
  publicacionId: string
  creada?: boolean
  mensaje?: string
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
 * Mapear DTO HTTP a entidad PublicacionPerfil de dominio.
 */
function mapearPublicacionDelDto(dto: PublicacionResponseDto): PublicacionPerfil {
  return new PublicacionPerfil(
    dto.id,
    dto.autorId,
    dto.autorNombreUsuario ?? '',
    dto.imagenUrl,
    dto.texto,
    new Date(dto.fechaCreacion),
    dto.fechaActualizacion ? new Date(dto.fechaActualizacion) : undefined,
    dto.autorFotoUrl,
  )
}

/**
 * Parsear errores HTTP y lanzar excepciones descriptivas.
 * Maneja A5, A8, autorización según openapi.yaml.
 */
function manejarErrorHttp(status: number, mensaje?: string, detalles?: any): never {
  switch (status) {
    case 400:
      // Validación fallida (texto inválido, parámetros de paginación inválidos)
      throw new Error(
        mensaje ||
          'Validación fallida. Verifica el texto o parámetros de paginación.',
      )
    case 401:
      // No autenticado
      throw new Error('No estás autenticado. Inicia sesión para continuar.')
    case 403:
      // Permisos insuficientes (no es propietario de la publicación)
      throw new Error('No tienes permisos para editar o eliminar esta publicación.')
    case 404:
      // No encontrado (publicación, usuario, carpeta)
      throw new Error('La publicación, usuario o carpeta no existe.')
    case 409:
      // Conflicto (raro en publicaciones, pero posible en casos edge)
      throw new Error(
        mensaje ||
          'Esta acción no se puede realizar ahora. Verifica los datos e intenta nuevamente.',
      )
    case 507:
      // Insufficient storage (límite de publicaciones en carpeta alcanzado)
      throw new Error(
        'Se alcanzó el límite de publicaciones en esta carpeta. Intenta nuevamente más tarde.',
      )
    default:
      throw new Error(
        mensaje ||
          `Error al procesar la solicitud (${status}). Por favor, intenta nuevamente.`,
      )
  }
}

/**
 * Clase que implementa PublicacionRepository.
 * Delegada por PublicacionService (T048) para operaciones HTTP.
 */
class HttpPublicacionRepository implements PublicacionRepository {
  /**
   * HU-13: Listar publicaciones de un usuario.
   * Endpoint: GET /usuarios/{usuarioId}/publicaciones?limit={limit}&offset={offset}
   * A6: Paginación server-side.
   * AC-13.1: Se muestran todas las publicaciones pertenecientes específicamente a esa persona.
   */
  async listarPublicaciones(
    usuarioId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<ResultadoPublicacionesPaginado> {
    try {
      const url = `${apiEndpoints.listarPublicacionesDePerfil(usuarioId)}?limit=${limit}&offset=${offset}`
      const response = await httpClient.get<PaginaPublicacionesResponseDto>(url)

      return {
        items: response.items.map(mapearPublicacionDelDto),
        total: response.total,
        limit: response.limit,
        offset: response.offset,
        hasMore: response.hasMore ?? (offset + response.items.length < response.total),
      }
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-11: Editar una publicación propia.
   * Endpoint: PATCH /publicaciones/{publicacionId}
   * A5: Solo texto es editable; imagen es inmutable.
   * AC-11.1: La acción de editar solo está disponible sobre publicaciones propias.
   * AC-11.3: Tras editar con éxito, el perfil refleja el contenido actualizado.
   */
  async editarPublicacion(
    publicacionId: string,
    texto: string,
  ): Promise<PublicacionPerfil> {
    try {
      const payload: EditarPublicacionRequestDto = { texto }
      const response = await httpClient.patch<PublicacionResponseDto>(
        apiEndpoints.editarPublicacion(publicacionId),
        payload,
      )
      return mapearPublicacionDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      const detalles = (error as any)?.detalles

      // A5: Errores de validación o autorización
      if (status === 400) {
        // Validación fallida (texto inválido)
        manejarErrorHttp(status, 'El texto de la publicación es inválido.', detalles)
      }

      if (status === 403) {
        // No es propietario
        manejarErrorHttp(status, 'No puedes editar una publicación que no es tuya.', detalles)
      }

      manejarErrorHttp(status, mensaje, detalles)
    }
  }

  /**
   * HU-12: Eliminar una publicación propia.
   * Endpoint: DELETE /publicaciones/{publicacionId}
   * AC-12.1: La acción de eliminar solo está disponible sobre publicaciones propias.
   * AC-12.3: Tras eliminar con éxito, la publicación desaparece del perfil.
   */
  async eliminarPublicacion(publicacionId: string): Promise<void> {
    try {
      await httpClient.delete(apiEndpoints.eliminarPublicacion(publicacionId))
      // 204 No Content
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message

      if (status === 403) {
        // No es propietario
        manejarErrorHttp(status, 'No puedes eliminar una publicación que no es tuya.')
      }

      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-09: Guardar una publicación en una carpeta.
   * Endpoint: POST /carpetas/{carpetaId}/posts
   * A8: Idempotente. Retorna 200 si ya estaba guardada, 201 si es nueva.
   * Backend indica en respuesta si fue creada (creada/esNueva).
   * AC-09.1: Al guardar un post se puede seleccionar una carpeta existente.
   * AC-09.4: Tras guardar con éxito, la interfaz refleja que el post quedó guardado.
   */
  async guardarPublicacionEnCarpeta(
    carpetaId: string,
    publicacionId: string,
  ): Promise<ResultadoGuardadoPublicacion> {
    try {
      const payload: GuardarPublicacionEnCarpetaRequestDto = { publicacionId }
      const response = await httpClient.post<GuardarPublicacionEnCarpetaResponseDto>(
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

      if (status === 403) {
        // Carpeta no es propia
        manejarErrorHttp(status, 'No puedes guardar publicaciones en una carpeta que no es tuya.')
      }

      if (status === 507) {
        // Límite de publicaciones en carpeta alcanzado
        manejarErrorHttp(status, 'Se alcanzó el límite de publicaciones en esta carpeta.')
      }

      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * HU-10: Quitar una publicación de una carpeta.
   * Endpoint: DELETE /carpetas/{carpetaId}/posts/{publicacionId}
   * AC-10.1: Quitar un post de una carpeta NO elimina el post de la plataforma.
   * AC-10.2: Tras quitar con éxito, la cantidad de posts de esa carpeta se actualiza.
   * AC-10.3: La acción solo está disponible sobre carpetas propias.
   */
  async quitarPublicacionDeCarpeta(
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

      if (status === 403) {
        // Carpeta no es propia
        manejarErrorHttp(status, 'No puedes quitar publicaciones de una carpeta que no es tuya.')
      }

      manejarErrorHttp(status, mensaje)
    }
  }
}

/**
 * Singleton: instancia única del repositorio HTTP.
 * Se inyecta en PublicacionService (T048).
 */
export const publicacionRepository = new HttpPublicacionRepository()

/**
 * Singleton: instancia única del servicio de aplicación.
 * Se inyecta el repositorio HTTP como dependencia.
 * Usado en componentes de presentación (T050, T051, T052, T053, T054).
 */
export const publicacionService = new PublicacionService(publicacionRepository)
