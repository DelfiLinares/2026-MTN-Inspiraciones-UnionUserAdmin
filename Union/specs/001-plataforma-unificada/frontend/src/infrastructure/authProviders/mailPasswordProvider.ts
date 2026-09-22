/**
 * Proveedor de autenticación mail/contraseña.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A: `POST /auth/login`)
 * - Union/specs/001-plataforma-unificada/tasks.md (T038)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-01 a RF-06, RF-77)
 *
 * Contrato:
 * Body: `{ mail: string, password: string }`
 * 200 OK: `{ token: string, usuario: { id, nombre, apellido, rol } }`
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

export interface LoginResponseDto {
  token: string
  usuario: {
    id: string
    nombre: string
    apellido: string
    rol: string
    bio?: string | null
    fotoUrl?: string | null
    cantidadSeguidores?: number
  }
}

export interface LoginResult {
  token: string
  usuario: Usuario
}

function mapearUsuario(dto: LoginResponseDto['usuario']): Usuario {
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
 * Inicia sesión enviando credenciales a `POST /auth/login`.
 * Almacena el token obtenido en `tokenStorage` y retorna el usuario autenticado.
 */
export async function iniciarSesion(credenciales: LoginCredentials | { email: string; password: string }): Promise<LoginResult> {
  const mail = 'mail' in credenciales ? credenciales.mail : credenciales.email
  const payload = {
    mail,
    password: credenciales.password,
  }

  const response = await httpClient.post<LoginResponseDto>('/auth/login', payload)

  if (response.token) {
    tokenStorage.setToken(response.token)
  }

  const usuario = mapearUsuario(response.usuario)

  return {
    token: response.token,
    usuario,
  }
}

export const mailPasswordProvider = {
  iniciarSesion,
}
