/**
 * Servicio de aplicación `UsuariosServiceAdmin` del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T034a: `listar()`, depende de T008, T009, T017, T033;
 *   T034b: `banear()`, depende de T009, T017, T034a, hace pasar la porción "banear" de T033;
 *   T034c: `eliminar()`, depende de T009, T017, T034a, hace pasar la porción "eliminar" de T033;
 *   T065: `promover()`, depende de T008, T017, T064, T064b, hace pasar T064 y la regla de negocio
 *   crítica #5 de `spec.md` §6)
 * - Union/specs/002-frontend-admin/spec.md RF-01, RF-02, RF-03, RF-06, RF-07, RF-08, CB-01, CB-02,
 *   CB-08
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml
 *   (`GET /usuarios`, `POST /usuarios/{id}/banear`, `POST /usuarios/{id}/eliminar`,
 *   `POST /usuarios/{id}/promover`)
 *
 * Nota de colisión de nombres (ver `tests/application/UsuariosServiceAdmin.test.ts`, T033):
 * ya existe `src/services/UsuariosService.ts` (clase `UsuariosService`, de
 * `001-plataforma-unificada`, T065), que usa `apiEndpoints`/`httpClientAdmin` concretos (rutas con
 * prefijo `/admin/...`) y no valida fecha de baneo temporal (CB-08 no estaba en su alcance). Este
 * servicio usa el puerto `HttpClient` abstracto (T031, `AdminHttpClientPort.ts`) y
 * `apiEndpointsAdmin` (T032, rutas sin prefijo `/admin`), e incorpora la validación CB-08. Por eso
 * se llama `UsuariosServiceAdmin`.
 *
 * Responsabilidades:
 * - `listar(filtros)`: Búsqueda paginada de usuarios (`GET /usuarios`).
 * - `banear(usuario, opciones)`: Delega `usuario.puedeSerBaneado()` a la entidad `UsuarioAdmin`
 *   (T017) antes de invocar el `HttpClient`. Si se provee `opciones.fechaFin` (baneo temporal),
 *   valida que no esté en el pasado (CB-08) antes de invocar el `HttpClient`.
 * - `eliminar(usuario)`: Delega `usuario.puedeSerEliminado()` a la entidad `UsuarioAdmin` antes de
 *   invocar el `HttpClient`.
 * - `promover(usuario)`: Delega `usuario.puedeSerPromovidoAAdmin()` a la entidad `UsuarioAdmin`
 *   (RF-06, RF-08, CB-02: no-op si el usuario objetivo ya es `ADMIN`) y, si se provee
 *   `obtenerRolActorActual` al constructor, verifica que el actor autenticado tenga rol `ADMIN`
 *   (RF-07; regla de negocio crítica #5 de `spec.md` §6) antes de invocar el `HttpClient`. Si no se
 *   provee ese callback, se asume que la verificación de rol del actor ya fue realizada en una capa
 *   superior (p. ej. guardia de ruta `GuardiaRolAdmin`, T028), manteniendo compatibilidad con la
 *   forma de instanciación existente de `banear()`/`eliminar()` (T034b/T034c), que tampoco reciben
 *   el rol del actor.
 */

import type { HttpClient } from '../infrastructure/AdminHttpClientPort'
import { apiEndpointsAdmin } from '../infrastructure/apiEndpointsAdmin'
import { UsuarioAdmin } from '../domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'

export const MENSAJE_ACCION_PROHIBIDA_ADMIN_O_UNO_MISMO =
  'La acción está prohibida sobre un administrador o sobre uno mismo.'

export const MENSAJE_FECHA_BANEO_INVALIDA =
  'La fecha de fin del baneo temporal debe ser una fecha futura.'

export const MENSAJE_USUARIO_YA_ES_ADMIN =
  'El usuario ya tiene rol ADMIN y no puede volver a promoverse.'

export const MENSAJE_ACTOR_SIN_PERMISO_ADMIN =
  'Solo un usuario con rol ADMIN puede ejecutar esta acción.'

export class AccionUsuarioProhibidaError extends Error {
  constructor(mensaje = MENSAJE_ACCION_PROHIBIDA_ADMIN_O_UNO_MISMO) {
    super(mensaje)
    this.name = 'AccionUsuarioProhibidaError'
  }
}

export class UsuarioYaEsAdminError extends Error {
  constructor(mensaje = MENSAJE_USUARIO_YA_ES_ADMIN) {
    super(mensaje)
    this.name = 'UsuarioYaEsAdminError'
  }
}

export class ActorSinPermisoAdminError extends Error {
  constructor(mensaje = MENSAJE_ACTOR_SIN_PERMISO_ADMIN) {
    super(mensaje)
    this.name = 'ActorSinPermisoAdminError'
  }
}

export class FechaBaneoInvalidaError extends Error {
  constructor(mensaje = MENSAJE_FECHA_BANEO_INVALIDA) {
    super(mensaje)
    this.name = 'FechaBaneoInvalidaError'
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

export interface ListarUsuariosFiltros {
  q?: string
  page?: number
  pageSize?: number
  rol?: RolUsuario
  estadoCuenta?: EstadoCuentaUsuario
}

export interface PaginaUsuariosAdmin {
  items: UsuarioAdmin[]
  total: number
}

export interface OpcionesBanear {
  /** Fecha de fin del baneo temporal. Si se omite, el baneo es permanente. */
  fechaFin?: Date
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

interface RespuestaListaUsuariosDto {
  items: UsuarioAdminDto[]
  total: number
}

export class UsuariosServiceAdmin {
  constructor(
    private readonly client: HttpClient,
    private readonly obtenerAdminActualId?: () => string | undefined,
    private readonly obtenerRolActorActual?: () => string | undefined
  ) {}

  /**
   * T034a: Búsqueda paginada de usuarios (`GET /usuarios`, RF-05).
   */
  async listar(filtros: ListarUsuariosFiltros = {}): Promise<PaginaUsuariosAdmin> {
    const params: Record<string, string | number | boolean | undefined> = {
      q: filtros.q,
      page: filtros.page ?? 1,
      pageSize: filtros.pageSize ?? 10,
      rol: filtros.rol,
      estadoCuenta: filtros.estadoCuenta,
    }

    const respuesta = await this.client.get<RespuestaListaUsuariosDto>(apiEndpointsAdmin.usuarios(), {
      params,
    })

    const items = Array.isArray(respuesta.items) ? respuesta.items.map(mapearUsuarioAdmin) : []
    const total = typeof respuesta.total === 'number' ? respuesta.total : items.length

    return { items, total }
  }

  /**
   * T034b: Banea un usuario (`POST /usuarios/{id}/banear`, RF-01).
   * Valida `usuario.puedeSerBaneado()` (CB-01) y, si se especifica `fechaFin` (baneo temporal),
   * que no esté en el pasado (CB-08), antes de invocar el `HttpClient`.
   */
  async banear(usuario: UsuarioAdmin, opciones: OpcionesBanear = {}): Promise<void> {
    const adminActualId = this.obtenerAdminActualId?.()

    if (!usuario.puedeSerBaneado(adminActualId)) {
      throw new AccionUsuarioProhibidaError()
    }

    if (opciones.fechaFin !== undefined && opciones.fechaFin.getTime() <= Date.now()) {
      throw new FechaBaneoInvalidaError()
    }

    const body = opciones.fechaFin !== undefined ? { fechaFin: opciones.fechaFin.toISOString() } : undefined

    await this.client.post<void>(apiEndpointsAdmin.banearUsuario(usuario.id), body)
  }

  /**
   * T034c: Elimina un usuario (`POST /usuarios/{id}/eliminar`, RF-02).
   * Valida `usuario.puedeSerEliminado()` (CB-01) antes de invocar el `HttpClient`.
   */
  async eliminar(usuario: UsuarioAdmin): Promise<void> {
    const adminActualId = this.obtenerAdminActualId?.()

    if (!usuario.puedeSerEliminado(adminActualId)) {
      throw new AccionUsuarioProhibidaError()
    }

    await this.client.delete<void>(apiEndpointsAdmin.eliminarUsuario(usuario.id))
  }

  /**
   * T065: Promueve un usuario al rol ADMIN (`POST /usuarios/{id}/promover`, RF-06).
   * Verifica primero que el actor autenticado tenga rol `ADMIN` (RF-07; regla de negocio crítica
   * #5 de `spec.md` §6) cuando se provee `obtenerRolActorActual` al constructor; si el actor no es
   * `ADMIN`, rechaza sin invocar el `HttpClient`. Luego valida `usuario.puedeSerPromovidoAAdmin()`
   * (delegado a la entidad `UsuarioAdmin`, T017): si el usuario objetivo ya tiene rol `ADMIN`, la
   * operación es un no-op inválido (RF-08, CB-02) y tampoco invoca el `HttpClient`.
   */
  async promover(usuario: UsuarioAdmin): Promise<void> {
    const rolActorActual = this.obtenerRolActorActual?.()

    if (rolActorActual !== undefined && rolActorActual !== RolUsuario.ADMIN) {
      throw new ActorSinPermisoAdminError()
    }

    if (!usuario.puedeSerPromovidoAAdmin()) {
      throw new UsuarioYaEsAdminError()
    }

    await this.client.post<void>(apiEndpointsAdmin.promoverUsuario(usuario.id), undefined)
  }
}
