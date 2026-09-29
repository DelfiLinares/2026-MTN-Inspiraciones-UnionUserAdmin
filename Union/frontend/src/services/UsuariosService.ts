/**
 * Servicio de aplicación `UsuariosService` (módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-56 a RF-59, RF-76, CB-11, CB-12, AC-12.5, AC-12.6, AC-12.8)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T065)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección C:
 *   `GET /admin/usuarios`, `POST /admin/usuarios/{id}/banear`, `DELETE /admin/usuarios/{id}`,
 *   `POST /admin/usuarios/{id}/promover`, `POST /admin/usuarios/{id}/degradar`)
 *
 * Responsabilidades:
 * - `buscarUsuarios(params)`: Búsqueda paginada y filtrada en servidor (`GET /admin/usuarios`).
 * - `banearUsuario(usuario, adminActualId)`: Banear usuario (`POST /admin/usuarios/{id}/banear`).
 *   Valida `usuario.puedeSerBaneado(adminActualId)` antes de invocar la API (CB-11, AC-12.5).
 * - `eliminarUsuario(usuario, adminActualId)`: Eliminar usuario (`DELETE /admin/usuarios/{id}`).
 *   Valida `usuario.puedeSerEliminado(adminActualId)` antes de invocar la API (CB-11, AC-12.5).
 * - `promoverUsuario(usuario)`: Promover USER a ADMIN (`POST /admin/usuarios/{id}/promover`).
 *   Valida `usuario.puedeSerPromovido()` antes de invocar la API (CB-12, AC-12.6). Si ya es ADMIN,
 *   retorna el usuario sin invocar la API (no-op).
 * - `degradarUsuario(usuario, adminActualId)`: Degradación de ADMIN a USER (`POST /admin/usuarios/{id}/degradar`, RF-76).
 *   Valida `usuario.puedeSerDegradado(adminActualId)` antes de invocar la API (AC-12.8).
 */

import { httpClientAdmin } from '../infrastructure/httpClientAdmin'
import { apiEndpoints } from '../infrastructure/apiEndpoints'
import { UsuarioAdmin } from '../domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'
import type { HttpClient, HttpRequestOptions } from '../application/ports/HttpClient'

export const MENSAJE_PROHIBIDO_ADMIN_O_UNO_MISMO =
  'La acción está prohibida sobre un administrador o sobre uno mismo.'

export const MENSAJE_NO_PUEDE_DEGRADARSE_A_SI_MISMO =
  'Un administrador no puede degradarse a sí mismo.'

export const MENSAJE_USUARIO_NO_ES_ADMIN =
  'El usuario ya posee el rol USER.'

export class AccionAccesoAdminProhibidaError extends Error {
  constructor(mensaje = MENSAJE_PROHIBIDO_ADMIN_O_UNO_MISMO) {
    super(mensaje)
    this.name = 'AccionAccesoAdminProhibidaError'
  }
}

export interface UsuarioAdminDto {
  id: string
  nombre: string
  mail?: string
  email?: string
  rol: string
  estadoCuenta: string
}

export interface BuscarUsuariosFiltros {
  q?: string
  texto?: string
  page?: number
  pageSize?: number
  rol?: RolUsuario
  estadoCuenta?: EstadoCuentaUsuario
}

export interface RespuestaListaUsuariosDto {
  items: UsuarioAdminDto[]
  total: number
}

export interface PaginaUsuariosAdmin {
  items: UsuarioAdmin[]
  total: number
}

function mapearUsuarioAdmin(dto: UsuarioAdminDto): UsuarioAdmin {
  return new UsuarioAdmin({
    id: dto.id,
    nombre: dto.nombre,
    mail: dto.mail ?? dto.email ?? '',
    rol: (dto.rol as RolUsuario) || RolUsuario.USER,
    estadoCuenta: (dto.estadoCuenta as EstadoCuentaUsuario) || EstadoCuentaUsuario.ACTIVO,
  })
}

/**
 * Búsqueda paginada y filtrada de usuarios para el panel de administración (`GET /admin/usuarios`, RF-56).
 */
export async function buscarUsuarios(
  filtros: BuscarUsuariosFiltros = {},
  options?: HttpRequestOptions
): Promise<PaginaUsuariosAdmin> {
  const params: Record<string, string | number | boolean | undefined> = {
    q: filtros.q ?? filtros.texto,
    page: filtros.page ?? 1,
    pageSize: filtros.pageSize ?? 10,
    rol: filtros.rol,
    estadoCuenta: filtros.estadoCuenta,
  }

  const respuesta = await httpClientAdmin.get<RespuestaListaUsuariosDto>(
    apiEndpoints.usuarios(),
    { ...options, params }
  )

  const items = Array.isArray(respuesta.items) ? respuesta.items.map(mapearUsuarioAdmin) : []
  const total = typeof respuesta.total === 'number' ? respuesta.total : items.length

  return { items, total }
}

/**
 * Banea un usuario (`POST /admin/usuarios/{id}/banear`, RF-57).
 * Valida previamente con `usuario.puedeSerBaneado()` para impedir banear a administradores
 * o a uno mismo (CB-11, AC-12.5).
 */
export async function banearUsuario(
  usuario: UsuarioAdmin,
  adminActualId?: string,
  options?: HttpRequestOptions
): Promise<UsuarioAdmin> {
  if (!usuario.puedeSerBaneado(adminActualId)) {
    throw new AccionAccesoAdminProhibidaError(MENSAJE_PROHIBIDO_ADMIN_O_UNO_MISMO)
  }

  const dto = await httpClientAdmin.post<UsuarioAdminDto>(
    apiEndpoints.banearUsuario(usuario.id),
    undefined,
    options
  )
  return mapearUsuarioAdmin(dto)
}

/**
 * Elimina un usuario (`DELETE /admin/usuarios/{id}`, RF-58).
 * Valida previamente con `usuario.puedeSerEliminado()` para impedir eliminar a administradores
 * o a uno mismo (CB-11, AC-12.5).
 */
export async function eliminarUsuario(
  usuario: UsuarioAdmin,
  adminActualId?: string,
  options?: HttpRequestOptions
): Promise<void> {
  if (!usuario.puedeSerEliminado(adminActualId)) {
    throw new AccionAccesoAdminProhibidaError(MENSAJE_PROHIBIDO_ADMIN_O_UNO_MISMO)
  }

  await httpClientAdmin.delete<void>(apiEndpoints.eliminarUsuario(usuario.id), options)
}

/**
 * Promueve un usuario de rol USER a ADMIN (`POST /admin/usuarios/{id}/promover`, RF-59).
 * Valida previamente `usuario.puedeSerPromovido()`. Si el usuario ya es ADMIN (CB-12, AC-12.6),
 * retorna el mismo usuario de inmediato sin llamar a la API (no-op).
 */
export async function promoverUsuario(
  usuario: UsuarioAdmin,
  options?: HttpRequestOptions
): Promise<UsuarioAdmin> {
  if (!usuario.puedeSerPromovido()) {
    // Si ya es ADMIN, actúa como no-op retornado sin lanzar error para no interrumpir UI (CB-12, AC-12.6)
    return usuario
  }

  const dto = await httpClientAdmin.post<UsuarioAdminDto>(
    apiEndpoints.promoverUsuario(usuario.id),
    undefined,
    options
  )
  return mapearUsuarioAdmin(dto)
}

/**
 * Degrada un usuario de rol ADMIN a USER (`POST /admin/usuarios/{id}/degradar`, RF-76).
 * Valida previamente `usuario.puedeSerDegradado(adminActualId)` (AC-12.8). Un administrador no puede
 * degradarse a sí mismo ni degradar a un usuario que no sea ADMIN.
 */
export async function degradarUsuario(
  usuario: UsuarioAdmin,
  adminActualId: string,
  options?: HttpRequestOptions
): Promise<UsuarioAdmin> {
  if (usuario.esElPropioAdministrador(adminActualId)) {
    throw new AccionAccesoAdminProhibidaError(MENSAJE_NO_PUEDE_DEGRADARSE_A_SI_MISMO)
  }

  if (usuario.rol !== RolUsuario.ADMIN) {
    // Si ya tiene rol USER, es no-op (CB-12 analógico)
    return usuario
  }

  if (!usuario.puedeSerDegradado(adminActualId)) {
    throw new AccionAccesoAdminProhibidaError(MENSAJE_NO_PUEDE_DEGRADARSE_A_SI_MISMO)
  }

  const dto = await httpClientAdmin.post<UsuarioAdminDto>(
    apiEndpoints.degradarUsuario(usuario.id),
    undefined,
    options
  )
  return mapearUsuarioAdmin(dto)
}

/**
 * Clase orientada a inyección de dependencias (`HttpClient`), manteniendo compatibilidad
 * con puertos de aplicación de `frontend-admin`.
 */
export class UsuariosService {
  constructor(
    private readonly client: HttpClient = httpClientAdmin,
    private readonly obtenerAdminActualId?: () => string | undefined
  ) {}

  async buscarUsuarios(filtros: BuscarUsuariosFiltros = {}, options?: HttpRequestOptions): Promise<PaginaUsuariosAdmin> {
    const params: Record<string, string | number | boolean | undefined> = {
      q: filtros.q ?? filtros.texto,
      page: filtros.page ?? 1,
      pageSize: filtros.pageSize ?? 10,
      rol: filtros.rol,
      estadoCuenta: filtros.estadoCuenta,
    }

    const respuesta = await this.client.get<RespuestaListaUsuariosDto>(apiEndpoints.usuarios(), { ...options, params })
    const items = Array.isArray(respuesta.items) ? respuesta.items.map(mapearUsuarioAdmin) : []
    const total = typeof respuesta.total === 'number' ? respuesta.total : items.length
    return { items, total }
  }

  async banear(usuario: UsuarioAdmin, options?: HttpRequestOptions): Promise<UsuarioAdmin> {
    const adminActualId = this.obtenerAdminActualId?.()
    return banearUsuario(usuario, adminActualId, options)
  }

  async eliminar(usuario: UsuarioAdmin, options?: HttpRequestOptions): Promise<void> {
    const adminActualId = this.obtenerAdminActualId?.()
    return eliminarUsuario(usuario, adminActualId, options)
  }

  async promover(usuario: UsuarioAdmin, options?: HttpRequestOptions): Promise<UsuarioAdmin> {
    return promoverUsuario(usuario, options)
  }

  async degradar(usuario: UsuarioAdmin, adminActualId?: string, options?: HttpRequestOptions): Promise<UsuarioAdmin> {
    const idAdmin = adminActualId ?? this.obtenerAdminActualId?.() ?? ''
    return degradarUsuario(usuario, idAdmin, options)
  }
}

export const usuariosService = {
  buscarUsuarios,
  banearUsuario,
  eliminarUsuario,
  promoverUsuario,
  degradarUsuario,
}
