import { Usuario } from '../domain/Usuario'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'
import { RolUsuario } from '../domain/enums/RolUsuario'
import { ActualizarPerfilPayload } from '../application/dto/ActualizarPerfilPayload'
import { UsuarioPerfilRepository } from '../application/ports/UsuarioPerfilRepository'
import { UsuarioPerfilService } from '../application/UsuarioPerfilService'
import { httpClient } from '../infrastructure/httpClient'
import { apiEndpoints } from '../infrastructure/apiEndpoints'

/**
 * Adaptador HTTP UsuarioPerfilRepository — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (paths: /auth/me, /usuarios/{id}, /perfil, /perfil/foto)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03, A1, A2, A10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 4, capa infrastructure)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T031)
 *
 * Implementación HTTP del puerto UsuarioPerfilRepository (T029).
 * Mapea endpoints HTTP a métodos del puerto y gestiona errores según A1/A2/A10.
 *
 * Responsabilidades:
 * 1. Obtener usuario autenticado actual (GET /auth/me)
 * 2. Obtener perfil de usuario (GET /usuarios/{usuarioId})
 * 3. Actualizar datos de perfil (PATCH /perfil)
 * 4. Cambiar foto de perfil (POST /perfil/foto)
 * 5. Mapear errores HTTP a excepciones con detalles
 * 6. Convertir DTO HTTP a entidad Usuario de dominio
 *
 * Manejo de errores:
 * - A1: 409 Conflict si username ya existe
 * - A2: 400/413/415 para errores de foto
 * - A10: 403/404 si perfil está BANEADO/ELIMINADO
 *
 * Historias: HU-01, HU-02, HU-03
 */

/**
 * DTO del API HTTP para Usuario.
 * Mapea respuestas JSON a tipos TypeScript.
 */
interface UsuarioResponseDto {
  id: string
  username: string
  foto?: string | null
  sobreMi?: string
  descripcion?: string
  estado?: string // EstadoCuentaUsuario
  rol?: string // RolUsuario
  cantidadSeguidores?: number
}

/**
 * DTO del API HTTP para actualizar perfil (PATCH /perfil).
 * Mapea el payload local a formato del API.
 */
interface ActualizarPerfilRequestDto {
  nombreUsuario?: string
  sobreMi?: string
  descripcion?: string
}

/**
 * Mapear DTO HTTP a entidad Usuario de dominio.
 */
function mapearUsuarioDelDto(dto: UsuarioResponseDto): Usuario {
  return new Usuario(
    dto.id,
    dto.username,
    dto.foto || undefined,
    dto.sobreMi || '',
    dto.descripcion || '',
    (dto.estado as EstadoCuentaUsuario) || EstadoCuentaUsuario.ACTIVO,
    (dto.rol as RolUsuario) || RolUsuario.USER,
    new Date(), // Fecha de creación no viene en respuesta
    false, // siguiendoPorUsuarioActual no viene aquí
    dto.cantidadSeguidores || 0,
  )
}

/**
 * Convertir ActualizarPerfilPayload (interfaz application) a DTO HTTP.
 */
function mapearPayloadAlDto(payload: ActualizarPerfilPayload): ActualizarPerfilRequestDto {
  return {
    nombreUsuario: payload.nombreUsuario,
    sobreMi: payload.sobreMi,
    descripcion: payload.descripcion,
  }
}

/**
 * Parsear errores HTTP y lanzar excepciones descriptivas.
 * Maneja A1, A2, A10 según openapi.yaml.
 */
function manejarErrorHttp(status: number, mensaje?: string): never {
  switch (status) {
    case 400:
      // Validación fallida (formato de foto, campos fuera de límite, etc.)
      throw new Error(mensaje || 'Validación fallida. Verifica los datos enviados.')
    case 401:
      // No autenticado
      throw new Error('No estás autenticado. Inicia sesión para continuar.')
    case 403:
      // Perfil no disponible (A10: BANEADO)
      throw new Error('Este perfil no está disponible.')
    case 404:
      // No encontrado o perfil eliminado (A10: ELIMINADO)
      throw new Error('El usuario no existe o su perfil no está disponible.')
    case 409:
      // Conflicto (A1: username ya existe)
      throw new Error(
        mensaje || 'Este nombre de usuario ya está en uso. Por favor, elige otro.'
      )
    case 413:
      // Payload too large (A2: archivo > 5 MB)
      throw new Error(
        'El archivo es demasiado grande. Máximo 5 MB permitido.'
      )
    case 415:
      // Unsupported media type (A2: formato no soportado)
      throw new Error(
        'Formato de archivo no soportado. Solo JPG, PNG y WebP están permitidos.'
      )
    default:
      throw new Error(
        mensaje || `Error al procesar la solicitud (${status}). Por favor, intenta nuevamente.`
      )
  }
}

/**
 * Clase que implementa UsuarioPerfilRepository.
 * Delegada por UsuarioPerfilService (T030) para operaciones HTTP.
 */
class HttpUsuarioPerfilRepository implements UsuarioPerfilRepository {
  /**
   * Obtener usuario autenticado actual.
   * Endpoint: GET /auth/me
   */
  async obtenerUsuarioActual(): Promise<Usuario> {
    try {
      const response = await httpClient.get<UsuarioResponseDto>(
        apiEndpoints.me()
      )
      return mapearUsuarioDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 401
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * Obtener perfil de un usuario (propio o ajeno).
   * Endpoint: GET /usuarios/{usuarioId}
   * A10: Retorna 403/404 si perfil está BANEADO/ELIMINADO.
   */
  async obtenerPerfil(usuarioId: string): Promise<Usuario> {
    try {
      const url = apiEndpoints.obtenerPerfil(usuarioId)
      const response = await httpClient.get<UsuarioResponseDto>(url)
      return mapearUsuarioDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * Actualizar datos del perfil propio (sin foto).
   * Endpoint: PATCH /perfil
   * A1: Retorna 409 si username ya existe.
   */
  async actualizarPerfil(payload: ActualizarPerfilPayload): Promise<Usuario> {
    try {
      const dto = mapearPayloadAlDto(payload)
      const response = await httpClient.patch<UsuarioResponseDto>(
        apiEndpoints.actualizarPerfil(),
        dto
      )
      return mapearUsuarioDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }

  /**
   * Cambiar foto de perfil propia.
   * Endpoint: POST /perfil/foto
   * Content-Type: multipart/form-data
   * A2: Retorna 400/413/415 para errores de foto.
   */
  async cambiarFotoPerfil(fotoData: FormData): Promise<Usuario> {
    try {
      const response = await httpClient.post<UsuarioResponseDto>(
        apiEndpoints.cambiarFotoPerfil(),
        fotoData,
        {
          // No establecer Content-Type; el navegador lo hará automáticamente con boundary
        }
      )
      return mapearUsuarioDelDto(response)
    } catch (error) {
      const status = (error as any)?.status || 500
      const mensaje = (error as any)?.message
      manejarErrorHttp(status, mensaje)
    }
  }
}

/**
 * Singleton: instancia única del repositorio HTTP.
 * Se inyecta en UsuarioPerfilService (T030).
 */
export const usuarioPerfilRepository = new HttpUsuarioPerfilRepository()

/**
 * Singleton: instancia única del servicio de aplicación.
 * Se inyecta el repositorio HTTP como dependencia.
 * Usado en componentes de presentación (T032).
 */
export const usuarioPerfilService = new UsuarioPerfilService(usuarioPerfilRepository)

