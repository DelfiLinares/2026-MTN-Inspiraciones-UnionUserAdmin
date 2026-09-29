/**
 * `sessionGuard`: guard de rutas administrativas y ejecutor protegido de acciones sensibles.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-11, RF-12, RF-75, CB-13, AC-10.2)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T045, T075, T096)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A y C, resolución B6)
 *
 * Responsabilidades:
 * - Verificar acceso a rutas administrativas (`validarAccesoAdmin`):
 *   1. Requiere sesión válida local (no expirada en `sessionManager`).
 *   2. Valida contra `GET /auth/me` que el usuario tenga rol `ADMIN`.
 *   3. Rechaza con mensaje explícito e informativo si el rol no es ADMIN (AC-10.2).
 * - Protección de acciones sensibles (`ejecutarAccionSensible`):
 *   1. Verifica validez antes de invocar la acción.
 *   2. Captura respuestas 401/403 en ejecución, cancelando la acción sensible,
 *      limpiando la sesión y notificando `onSesionExpirada` (RF-75, CB-13).
 */

import { httpClientAdmin, HttpForbiddenError, HttpUnauthorizedError } from './httpClientAdmin'
import { esValida, limpiarSesion, cancelarAccionesEnCurso } from './sessionManager'
import { RolUsuarioAdmin as RolUsuario } from '../domain/enums/RolUsuarioAdmin'
import { UsuarioAdmin } from '../domain/UsuarioAdmin'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'

export const MENSAJE_SESION_EXPIRADA =
  'La sesión expiró. La acción no fue aplicada. Iniciá sesión nuevamente.'

export const MENSAJE_ROL_NO_AUTORIZADO =
  'Acceso denegado: se requieren permisos de administrador (rol ADMIN) para acceder a este módulo.'

export class SesionExpiradaError extends Error {
  constructor(mensaje = MENSAJE_SESION_EXPIRADA) {
    super(mensaje)
    this.name = 'SesionExpiradaError'
  }
}

export class RolNoAutorizadoError extends Error {
  constructor(mensaje = MENSAJE_ROL_NO_AUTORIZADO) {
    super(mensaje)
    this.name = 'RolNoAutorizadoError'
  }
}

export interface SessionGuardOptions {
  onSesionExpirada?: (mensaje: string) => void
  onRolNoAutorizado?: (mensaje: string) => void
  ahora?: () => Date
}

interface AuthMeDto {
  id: string
  nombre: string
  apellido?: string
  mail?: string
  email?: string
  rol: string
  estadoCuenta?: string
}

/**
 * Valida si el usuario actual tiene sesión activa y posee el rol ADMIN requerido.
 * Utilizado por RequireAdmin y AppRouter para proteger las rutas administrativas.
 */
export async function validarAccesoAdmin(): Promise<UsuarioAdmin> {
  if (!esValida()) {
    limpiarSesion()
    throw new SesionExpiradaError(MENSAJE_SESION_EXPIRADA)
  }

  try {
    const dto = await httpClientAdmin.get<AuthMeDto>('/auth/me')

    if (dto.rol !== RolUsuario.ADMIN) {
      limpiarSesion()
      throw new RolNoAutorizadoError(MENSAJE_ROL_NO_AUTORIZADO)
    }

    return new UsuarioAdmin({
      id: dto.id,
      nombre: dto.nombre,
      mail: dto.mail ?? dto.email ?? '',
      rol: RolUsuario.ADMIN,
      estadoCuenta: (dto.estadoCuenta as EstadoCuentaUsuario) ?? EstadoCuentaUsuario.ACTIVO,
    })
  } catch (error) {
    if (error instanceof RolNoAutorizadoError) {
      throw error
    }
    if (error instanceof HttpForbiddenError) {
      limpiarSesion()
      throw new RolNoAutorizadoError(MENSAJE_ROL_NO_AUTORIZADO)
    }
    if (error instanceof HttpUnauthorizedError) {
      limpiarSesion()
      throw new SesionExpiradaError(MENSAJE_SESION_EXPIRADA)
    }
    throw error
  }
}

/**
 * Ejecuta una acción sensible (eliminar, banear, promover, degradar, moderar) bajo control de sesión.
 * Si la sesión expiró antes o durante la ejecución (401/403), la acción se aborta inmediatamente,
 * se limpia la sesión y se dispara `onSesionExpirada`.
 */
export async function ejecutarAccionSensible<T>(
  accion: () => Promise<T>,
  options: SessionGuardOptions = {},
): Promise<T> {
  const ahora = options.ahora ?? (() => new Date())

  if (!esValida(ahora())) {
    cancelarAccionesEnCurso(MENSAJE_SESION_EXPIRADA)
    limpiarSesion()
    options.onSesionExpirada?.(MENSAJE_SESION_EXPIRADA)
    throw new SesionExpiradaError(MENSAJE_SESION_EXPIRADA)
  }

  try {
    return await accion()
  } catch (error) {
    if (error instanceof HttpUnauthorizedError || error instanceof HttpForbiddenError) {
      cancelarAccionesEnCurso(MENSAJE_SESION_EXPIRADA)
      limpiarSesion()
      options.onSesionExpirada?.(MENSAJE_SESION_EXPIRADA)
      throw new SesionExpiradaError(MENSAJE_SESION_EXPIRADA)
    }
    throw error
  }
}

export const sessionGuard = {
  validarAccesoAdmin,
  ejecutarAccionSensible,
  MENSAJE_SESION_EXPIRADA,
  MENSAJE_ROL_NO_AUTORIZADO,
}
