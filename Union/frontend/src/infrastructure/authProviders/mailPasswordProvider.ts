/**
 * Proveedor de autenticación mail/contraseña.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A: `POST /auth/login`)
 * - Union/specs/001-plataforma-unificada/tasks.md (T038)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-01 a RF-06, RF-77)
 *
 * Contrato:
 * Body: `{ email: string, password: string }`
 * 200 OK: `{ accessToken, user: { id, username, nombreCompleto, avatarUrl, role } }`
 * 400 Bad Request: `{ error: "CAMPOS_INVALIDOS" }`
 * 401 Unauthorized: `{ error: "CREDENCIALES_INVALIDAS" }`
 * 403 Forbidden: `{ error: "CUENTA_BANEADA" }` / `{ error: "CUENTA_ELIMINADA" }`
 */

import { httpClient } from '../httpClient'
import { tokenStorage } from '../tokenStorage'
import { Usuario } from '../../domain/Usuario'
import { RolUsuario } from '../../domain/enums/RolUsuario'

export interface LoginCredentials {
  mail: string
  password: string
}

export interface AuthUserResponseDto {
  id: string
  email: string
  username: string
  nombreCompleto?: string | null
  avatarUrl?: string | null
  role?: string
  status?: string
}

export interface LoginResponseDto {
  accessToken: string
  tokenType?: string
  expiresAt?: string
  user: AuthUserResponseDto
}

export interface LoginResult {
  token: string
  usuario: Usuario
}

function mapearUsuario(dto: AuthUserResponseDto): Usuario {
  const nombreCompleto = dto.nombreCompleto?.trim() || dto.username
  const [nombre, ...apellidos] = nombreCompleto.split(/\s+/)

  return new Usuario({
    id: dto.id,
    nombre,
    apellido: apellidos.join(' '),
    fotoUrl: dto.avatarUrl ?? undefined,
    rol: dto.role === RolUsuario.ADMIN ? RolUsuario.ADMIN : RolUsuario.USER,
    cantidadSeguidores: 0,
    siguiendoAlUsuarioActual: false,
  })
}

/**
 * Inicia sesión enviando credenciales a `POST /auth/login`.
 * Almacena el token obtenido en `tokenStorage` y retorna el usuario autenticado.
 */
export async function iniciarSesion(credenciales: LoginCredentials | { email: string; password: string }): Promise<LoginResult> {
  const email = 'email' in credenciales ? credenciales.email : credenciales.mail
  const payload = {
    email,
    password: credenciales.password,
  }

  const response = await httpClient.post<LoginResponseDto>('/auth/login', payload)
  const usuario = mapearUsuario(response.user)

  if (response.accessToken) {
    tokenStorage.setToken(response.accessToken)
    tokenStorage.setLoginData(response.user.email || email, response.user.username, usuario)
  }

  return {
    token: response.accessToken,
    usuario,
  }
}

export const mailPasswordProvider = {
  iniciarSesion,
}
