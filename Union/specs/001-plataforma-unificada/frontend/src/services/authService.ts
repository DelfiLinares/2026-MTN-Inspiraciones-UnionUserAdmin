/**
 * Servicio de aplicación `authService` (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-01 a RF-10, RF-77, RF-78, AC-04.9)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T046)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A)
 *
 * Responsabilidades:
 * - Login con mail y contraseña usando `mailPasswordProvider`.
 * - Manejo explícito de respuestas 403 con `CUENTA_BANEADA` o `CUENTA_ELIMINADA` (RF-77, A10).
 * - Registro de nuevos usuarios (`POST /auth/register`).
 * - Delegación de OAuth Google / GitHub (`googleProvider`, `githubProvider`).
 * - Verificación de sesión (`GET /auth/me`) mediante `tokenStorage.verificarSesion()`.
 * - Cierre de sesión (`POST /auth/logout` y `tokenStorage.clearToken()`).
 */

import { httpClient, ApiError, HttpForbiddenError } from '../infrastructure/httpClient'
import { tokenStorage, verificarSesion } from '../infrastructure/tokenStorage'
import { mailPasswordProvider, LoginCredentials, LoginResult } from '../infrastructure/authProviders/mailPasswordProvider'
import { googleProvider, OAuthResult } from '../infrastructure/authProviders/googleProvider'
import { githubProvider } from '../infrastructure/authProviders/githubProvider'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

export type ProveedorOAuth = 'google' | 'github'

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

export interface RegistroDatos {
  nombre: string
  apellido: string
  mail?: string
  email?: string
  password: string
  passwordConfirmacion?: string
}

export interface RegistroResponseDto {
  token: string
  usuario: {
    id: string
    nombre: string
    apellido: string
    rol?: string
    bio?: string | null
    fotoUrl?: string | null
    cantidadSeguidores?: number
  }
}

function mapearUsuario(dto: RegistroResponseDto['usuario']): Usuario {
  return new Usuario({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido,
    bio: dto.bio ?? undefined,
    fotoUrl: dto.fotoUrl ?? undefined,
    rol: RolUsuario.USER,
    cantidadSeguidores: dto.cantidadSeguidores ?? 0,
    siguiendoAlUsuarioActual: false,
  })
}

/**
 * Inicia sesión mediante email y contraseña.
 * Captura 403 con error CUENTA_BANEADA / CUENTA_ELIMINADA (RF-77) y lanza CuentaBloqueadaError
 * con el mensaje correspondiente sin continuar el flujo de login.
 */
export async function login(credenciales: LoginCredentials | { email: string; password: string }): Promise<LoginResult> {
  try {
    return await mailPasswordProvider.iniciarSesion(credenciales)
  } catch (error) {
    if (error instanceof ApiError || error instanceof HttpForbiddenError) {
      const cuerpo = error.body as { error?: string; codigo?: string } | undefined
      const errorCodigo = cuerpo?.error ?? cuerpo?.codigo

      if (error.status === 403 || errorCodigo === 'CUENTA_BANEADA' || errorCodigo === 'CUENTA_ELIMINADA') {
        tokenStorage.clearToken()
        if (errorCodigo === 'CUENTA_BANEADA') {
          throw new CuentaBloqueadaError('CUENTA_BANEADA', MENSAJE_CUENTA_BANEADA)
        }
        if (errorCodigo === 'CUENTA_ELIMINADA') {
          throw new CuentaBloqueadaError('CUENTA_ELIMINADA', MENSAJE_CUENTA_ELIMINADA)
        }
      }
    }
    throw error
  }
}

/**
 * Registra un nuevo usuario en la plataforma (`POST /auth/register`).
 */
export async function registrar(datos: RegistroDatos): Promise<LoginResult> {
  const mail = datos.mail ?? datos.email ?? ''
  const payload = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    mail,
    password: datos.password,
    passwordConfirmacion: datos.passwordConfirmacion ?? datos.password,
  }

  const respuesta = await httpClient.post<RegistroResponseDto>('/auth/register', payload)

  if (respuesta.token) {
    tokenStorage.setToken(respuesta.token)
  }

  const usuario = mapearUsuario(respuesta.usuario)

  return {
    token: respuesta.token,
    usuario,
  }
}

/**
 * Inicia el flujo OAuth redirigiendo al proveedor correspondiente.
 */
export function iniciarSesionConOAuth(proveedor: ProveedorOAuth): void {
  if (proveedor === 'google') {
    googleProvider.iniciarRedireccion()
    return
  }
  githubProvider.iniciarRedireccion()
}

/**
 * Procesa la redirección de callback de un proveedor OAuth externo.
 */
export async function procesarCallbackOAuth(
  proveedor: ProveedorOAuth,
  parametros?: string | URLSearchParams,
): Promise<OAuthResult> {
  if (proveedor === 'google') {
    return googleProvider.procesarCallback(parametros)
  }
  return githubProvider.procesarCallback(parametros)
}

/**
 * Verifica la sesión actual contra `GET /auth/me`.
 */
export async function verificarSesionActual(): Promise<Usuario | null> {
  return verificarSesion()
}

/**
 * Cierra la sesión activa en el backend y limpia el token local.
 */
export async function logout(): Promise<void> {
  try {
    await httpClient.post('/auth/logout')
  } catch {
    // Si falla la llamada de red al desloguear, limpia igualmente el almacenamiento local
  } finally {
    tokenStorage.clearToken()
  }
}

export const authService = {
  login,
  iniciarSesionConMail: login,
  registrar,
  iniciarSesionConOAuth,
  procesarCallbackOAuth,
  verificarSesionActual,
  logout,
  cerrarSesion: logout,
}
