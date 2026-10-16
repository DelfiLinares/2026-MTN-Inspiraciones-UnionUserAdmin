import { CarpetaPost } from '../../domain/CarpetaPost'
import { EstadoCuentaUsuario } from '../../domain/enums/EstadoCuentaUsuario'
import { PublicacionPerfil } from '../../domain/PublicacionPerfil'
import { RolUsuario } from '../../domain/enums/RolUsuario'
import { Usuario } from '../../domain/Usuario'
import { UsuarioPerfil } from '../../domain/UsuarioPerfil'
import type { ActualizarPerfilPayload } from '../../application/dto/ActualizarPerfilPayload'
import type { UsuarioProps } from '../../domain/Usuario'
import type {
  ActualizarPerfilRequestDto,
  CarpetaDto,
  PerfilPropioDto,
  PerfilPublicoDto,
  PublicacionPerfilDto,
} from '../dto/perfilDtos'

export class ErrorDeContrato extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ErrorDeContrato'
  }
}

export interface UsuarioAutenticadoDto {
  id: string
  username?: string
  nombreCompleto?: string | null
  nombre?: string
  apellido?: string
  avatarUrl?: string | null
  fotoUrl?: string | null
  role?: string
  rol?: string
  status?: string
  bio?: string | null
  sobreMi?: string | null
  cantidadSeguidores?: number
}

export function mapearRolUsuario(role: string): RolUsuario {
  switch (role) {
    case 'USER':
      return RolUsuario.USER
    case 'ADMIN':
      return RolUsuario.ADMIN
    default:
      throw new ErrorDeContrato(`Rol de API desconocido: ${role}`)
  }
}

export function mapearEstadoCuenta(status: string): EstadoCuentaUsuario {
  switch (status) {
    case 'ACTIVE':
      return EstadoCuentaUsuario.ACTIVO
    case 'BANNED':
    case 'SUSPENDED':
      return EstadoCuentaUsuario.BANEADO
    case 'DELETED':
      return EstadoCuentaUsuario.ELIMINADO
    default:
      throw new ErrorDeContrato(`Estado de cuenta de API desconocido: ${status}`)
  }
}

function mapearFecha(value: string, field: string): Date {
  const fecha = new Date(value)
  if (Number.isNaN(fecha.getTime())) {
    throw new ErrorDeContrato(`Fecha inválida en la respuesta de API: ${field}`)
  }
  return fecha
}

export function mapearUsuarioAutenticado(dto: UsuarioAutenticadoDto): Usuario {
  const nombreCompleto =
    dto.nombreCompleto?.trim() ||
    [dto.nombre, dto.apellido].filter(Boolean).join(' ').trim() ||
    dto.username?.trim() ||
    ''
  const [nombre, ...apellidos] = nombreCompleto.split(/\s+/)
  const props: UsuarioProps = {
    id: dto.id,
    nombre,
    apellido: apellidos.join(' '),
    bio: dto.sobreMi ?? dto.bio ?? undefined,
    fotoUrl: dto.avatarUrl ?? dto.fotoUrl ?? undefined,
    rol: mapearRolUsuario(dto.role ?? dto.rol ?? 'USER'),
    siguiendoAlUsuarioActual: false,
    cantidadSeguidores: dto.cantidadSeguidores ?? 0,
  }
  return new Usuario(props)
}

export function mapearPerfilPropio(dto: PerfilPropioDto): UsuarioPerfil {
  return new UsuarioPerfil(
    dto.id,
    dto.username,
    dto.avatarUrl ?? undefined,
    dto.sobreMi ?? '',
    dto.descripcion ?? '',
    mapearEstadoCuenta(dto.status),
    mapearRolUsuario(dto.role),
    mapearFecha(dto.createdAt, 'createdAt'),
    false,
    dto.cantidadSeguidores,
  )
}

export function mapearPerfilPublico(dto: PerfilPublicoDto): UsuarioPerfil {
  return new UsuarioPerfil(
    dto.id,
    dto.username,
    dto.avatarUrl ?? undefined,
    dto.sobreMi ?? '',
    dto.descripcion ?? '',
    EstadoCuentaUsuario.ACTIVO,
    RolUsuario.USER,
    new Date(),
    dto.siguiendoPorUsuarioActual,
    dto.cantidadSeguidores,
  )
}

export function mapearActualizarPerfil(
  payload: ActualizarPerfilPayload,
): ActualizarPerfilRequestDto {
  const request: ActualizarPerfilRequestDto = {}
  if (payload.nombreUsuario !== undefined) {
    request.username = payload.nombreUsuario
  }
  if (payload.sobreMi !== undefined) {
    request.sobreMi = payload.sobreMi === '' ? null : payload.sobreMi
  }
  if (payload.descripcion !== undefined) {
    request.descripcion = payload.descripcion === '' ? null : payload.descripcion
  }
  return request
}

export function mapearCarpeta(dto: CarpetaDto): CarpetaPost {
  return new CarpetaPost(
    dto.id,
    dto.usuarioId,
    dto.nombre,
    '',
    mapearFecha(dto.createdAt, 'createdAt'),
    dto.cantidadPosts,
  )
}

export function mapearPublicacionPerfil(dto: PublicacionPerfilDto): PublicacionPerfil {
  return new PublicacionPerfil(
    dto.id,
    dto.usuarioId || dto.autor.id,
    dto.autor.username,
    dto.fotoUrl ?? '',
    dto.contenido,
    mapearFecha(dto.createdAt, 'createdAt'),
    dto.updatedAt ? mapearFecha(dto.updatedAt, 'updatedAt') : undefined,
    dto.autor.avatarUrl ?? undefined,
  )
}
