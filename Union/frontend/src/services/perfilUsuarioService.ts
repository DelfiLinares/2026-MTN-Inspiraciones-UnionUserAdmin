import { UsuarioPerfil as Usuario } from '../domain/UsuarioPerfil'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'
import { RolUsuario } from '../domain/enums/RolUsuario'
import { ActualizarPerfilPayload } from '../application/dto/ActualizarPerfilPayload'
import { UsuarioPerfilRepository } from '../application/ports/UsuarioPerfilRepository'
import { UsuarioPerfilService } from '../application/UsuarioPerfilService'
import { httpClient } from '../infrastructure/httpClient'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { lanzarErrorAdaptado } from '../infrastructure/apiErrorAdapter'

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
  avatarUrl?: string | null
  sobreMi?: string | null
  descripcion?: string | null
  estado?: string // EstadoCuentaUsuario
  status?: string // ACTIVE | BANNED | DELETED (contrato del backend)
  rol?: string // RolUsuario
  role?: string
  createdAt?: string
  siguiendoPorUsuarioActual?: boolean
  cantidadSeguidores?: number
}

/**
 * DTO del API HTTP para actualizar perfil (PATCH /usuarios/me).
 * Mapea el payload local a formato del API.
 */
interface ActualizarPerfilRequestDto {
  username?: string
  sobreMi?: string | null
  descripcion?: string | null
}

const ESTADO_DESDE_BACKEND: Record<string, EstadoCuentaUsuario> = {
  ACTIVE: EstadoCuentaUsuario.ACTIVO,
  BANNED: EstadoCuentaUsuario.BANEADO,
  DELETED: EstadoCuentaUsuario.ELIMINADO,
}

/**
 * Mapear DTO HTTP a entidad Usuario de dominio.
 * Acepta tanto el contrato del backend (`avatarUrl`, `status`, `role`) como el histórico del módulo.
 */
function mapearUsuarioDelDto(dto: UsuarioResponseDto): Usuario {
  const estado =
    (dto.estado as EstadoCuentaUsuario | undefined) ??
    (dto.status ? ESTADO_DESDE_BACKEND[dto.status] : undefined) ??
    EstadoCuentaUsuario.ACTIVO
  const rol = ((dto.rol ?? dto.role) as RolUsuario | undefined) || RolUsuario.USER
  return new Usuario(
    dto.id,
    dto.username,
    dto.foto || dto.avatarUrl || undefined,
    dto.sobreMi || '',
    dto.descripcion || '',
    estado,
    rol,
    dto.createdAt ? new Date(dto.createdAt) : new Date(),
    dto.siguiendoPorUsuarioActual ?? false,
    dto.cantidadSeguidores || 0,
  )
}

/**
 * Convertir ActualizarPerfilPayload (interfaz application) a DTO HTTP.
 */
function mapearPayloadAlDto(payload: ActualizarPerfilPayload): ActualizarPerfilRequestDto {
  return {
    username: payload.nombreUsuario,
    sobreMi: payload.sobreMi,
    descripcion: payload.descripcion,
  }
}

/**
 * Clase que implementa UsuarioPerfilRepository.
 * Delegada por UsuarioPerfilService (T030) para operaciones HTTP.
 */
class HttpUsuarioPerfilRepository implements UsuarioPerfilRepository {
  /**
   * Obtener usuario autenticado actual.
   * Endpoint: GET /usuarios/me
   */
  async obtenerUsuarioActual(): Promise<Usuario> {
    try {
      const response = await httpClient.get<UsuarioResponseDto>(
        apiEndpoints.perfilActual()
      )
      return mapearUsuarioDelDto(response)
    } catch (error) {
      lanzarErrorAdaptado(error)
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
      lanzarErrorAdaptado(error)
    }
  }

  /**
   * Actualizar datos del perfil propio (sin foto).
   * Endpoint: PATCH /usuarios/me
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
      lanzarErrorAdaptado(error)
    }
  }

  /**
   * Cambiar foto de perfil propia.
   * Endpoint: POST /usuarios/me/avatar
   * Content-Type: multipart/form-data (parte `avatar`)
   * A2: Retorna 400/413/415 para errores de foto.
   */
  async cambiarFotoPerfil(fotoData: FormData): Promise<Usuario> {
    try {
      // El backend espera la parte multipart `avatar`; el payload de aplicación usa `foto`.
      const archivo = fotoData.get('avatar') ?? fotoData.get('foto')
      const cuerpo = new FormData()
      if (archivo !== null) {
        cuerpo.append('avatar', archivo)
      }
      const response = await httpClient.post<UsuarioResponseDto>(
        apiEndpoints.cambiarFotoPerfil(),
        cuerpo,
        {
          // No establecer Content-Type; el navegador lo hará automáticamente con boundary
        }
      )
      return mapearUsuarioDelDto(response)
    } catch (error) {
      lanzarErrorAdaptado(error)
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
