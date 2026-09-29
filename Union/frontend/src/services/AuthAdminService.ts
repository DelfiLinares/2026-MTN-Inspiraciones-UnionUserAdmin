/**
 * Servicio de aplicación `AuthAdminService` (módulo administrativo unificado).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-11, RF-12, RF-75, RF-77, CB-13, AC-10.2)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T063)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A: `POST /auth/login`,
 *   `GET /auth/me`; resolución B7: `403 Forbidden` con `CUENTA_BANEADA`/`CUENTA_ELIMINADA`)
 *
 * Responsabilidades:
 * - `login(mail, password)`: autentica al administrador vía `POST /auth/login` y, tras obtener el
 *   token, verifica el rol ADMIN delegando en `sessionGuard.validarAccesoAdmin()` (que a su vez
 *   consulta `GET /auth/me`). Si el rol no es ADMIN, la sesión NO se persiste y se rechaza con un
 *   mensaje claro (AC-10.2).
 * - Manejo explícito de `403 Forbidden` con `CUENTA_BANEADA` / `CUENTA_ELIMINADA` (RF-77, B7).
 * - Persistencia de la sesión administrativa exitosa mediante `sessionManager.guardarSesion()`.
 * - `verificarSesionActual()`: valida la sesión ya persistida sin re-loguear, reutilizando
 *   `sessionGuard.validarAccesoAdmin()`.
 * - `logout()`: limpia la sesión administrativa vía `sessionManager.limpiarSesion()`.
 */

import { httpClientAdmin, HttpError, HttpForbiddenError } from '../infrastructure/httpClientAdmin'
import { sessionManager } from '../infrastructure/sessionManager'
import { sessionGuard, RolNoAutorizadoError } from '../infrastructure/sessionGuard'
import { SesionAdministrativa } from '../domain/SesionAdministrativa'
import { UsuarioAdmin } from '../domain/UsuarioAdmin'
import { RolUsuarioAdmin as RolUsuario } from '../domain/enums/RolUsuarioAdmin'
import { EstadoCuentaUsuario } from '../domain/enums/EstadoCuentaUsuario'

export const MENSAJE_CUENTA_BANEADA = 'Tu cuenta ha sido baneada. No podés iniciar sesión.'
export const MENSAJE_CUENTA_ELIMINADA = 'Tu cuenta ha sido eliminada. No podés iniciar sesión.'
export const MENSAJE_CREDENCIALES_INVALIDAS = 'Mail o contraseña incorrectos.'

export class CuentaBloqueadaError extends Error {
  readonly codigo: 'CUENTA_BANEADA' | 'CUENTA_ELIMINADA'

  constructor(codigo: 'CUENTA_BANEADA' | 'CUENTA_ELIMINADA', mensaje: string) {
    super(mensaje)
    this.name = 'CuentaBloqueadaError'
    this.codigo = codigo
  }
}

export class CredencialesInvalidasError extends Error {
  constructor(mensaje = MENSAJE_CREDENCIALES_INVALIDAS) {
    super(mensaje)
    this.name = 'CredencialesInvalidasError'
  }
}

export interface LoginAdminCredenciales {
  mail: string
  password: string
}

interface LoginResponseDto {
  token: string
  usuario: {
    id: string
    nombre: string
    apellido?: string
    rol: string
  }
}

/**
 * Inicia sesión de administrador (`POST /auth/login`) y verifica el rol ADMIN
 * delegando en `sessionGuard.validarAccesoAdmin()` (que consulta `GET /auth/me`).
 *
 * - Si las credenciales son inválidas (401), lanza `CredencialesInvalidasError` (mensaje genérico, RF-03).
 * - Si la cuenta está baneada o eliminada (403, RF-77), lanza `CuentaBloqueadaError` con el
 *   mensaje específico correspondiente.
 * - Si el rol autenticado no es ADMIN (AC-10.2), la sesión no se persiste y se propaga
 *   `RolNoAutorizadoError` desde `sessionGuard`.
 */
export async function login(credenciales: LoginAdminCredenciales): Promise<SesionAdministrativa> {
  let dto: LoginResponseDto

  try {
    dto = await httpClientAdmin.post<LoginResponseDto>('/auth/login', {
      mail: credenciales.mail,
      password: credenciales.password,
    })
  } catch (error) {
    if (error instanceof HttpForbiddenError) {
      const cuerpo = error.body as { error?: string } | undefined
      if (cuerpo?.error === 'CUENTA_BANEADA') {
        throw new CuentaBloqueadaError('CUENTA_BANEADA', MENSAJE_CUENTA_BANEADA)
      }
      if (cuerpo?.error === 'CUENTA_ELIMINADA') {
        throw new CuentaBloqueadaError('CUENTA_ELIMINADA', MENSAJE_CUENTA_ELIMINADA)
      }
      throw error
    }
    if (error instanceof HttpError && error.status === 401) {
      throw new CredencialesInvalidasError(MENSAJE_CREDENCIALES_INVALIDAS)
    }
    throw error
  }

  // Autentica temporalmente el cliente HTTP administrativo con el token recibido,
  // de modo que `sessionGuard.validarAccesoAdmin()` pueda consultar `GET /auth/me`.
  const sesionTemporal = new SesionAdministrativa({
    usuario: new UsuarioAdmin({
      id: dto.usuario.id,
      nombre: dto.usuario.nombre,
      mail: credenciales.mail,
      rol: (dto.usuario.rol as RolUsuario) ?? RolUsuario.ADMIN,
      estadoCuenta: EstadoCuentaUsuario.ACTIVO,
    }),
    token: dto.token,
    // Expiración temporal amplia; será reemplazada por la sesión definitiva tras la verificación.
    expiraEn: new Date(Date.now() + 5 * 60 * 1000),
  })
  sessionManager.guardarSesion(sesionTemporal)

  try {
    // RF-12, AC-10.2: verifica el rol ADMIN vía GET /auth/me antes de considerar el login exitoso.
    const usuarioAdmin = await sessionGuard.validarAccesoAdmin()

    const sesion = new SesionAdministrativa({
      usuario: usuarioAdmin,
      token: dto.token,
      expiraEn: new Date(Date.now() + 60 * 60 * 1000),
    })
    sessionManager.guardarSesion(sesion)
    return sesion
  } catch (error) {
    // Si el rol no es ADMIN u ocurre cualquier otro fallo de verificación, no se persiste sesión.
    sessionManager.limpiarSesion()
    if (error instanceof RolNoAutorizadoError) {
      throw error
    }
    throw error
  }
}

/**
 * Verifica que la sesión administrativa actual (ya persistida) siga siendo válida y con rol ADMIN,
 * delegando en `sessionGuard.validarAccesoAdmin()` (RF-11, RF-12, RF-75).
 */
export async function verificarSesionActual(): Promise<UsuarioAdmin> {
  return sessionGuard.validarAccesoAdmin()
}

/**
 * Cierra la sesión administrativa actual (limpia token y datos persistidos).
 */
export function logout(): void {
  sessionManager.limpiarSesion()
}

export const authAdminService = {
  login,
  verificarSesionActual,
  logout,
}
