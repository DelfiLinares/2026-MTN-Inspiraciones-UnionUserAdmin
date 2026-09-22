/**
 * Almacenamiento seguro del token de sesión (frontend).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-06)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T036, T037)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (Sección A)
 *
 * Responsabilidades:
 * - Guardar/leer/borrar el token de sesión de forma segura.
 * - Soporta persistencia en memoria y sessionStorage para mitigar ventanas de exposición.
 * - Provee `getToken()`, `setToken(token)`, `clearToken()` y `hasToken()`.
 * - Compatible con verificación de sesión (`verificarSesion`) consultando `GET /auth/me`.
 */

import { httpClient, ApiError } from './httpClient'
import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

const TOKEN_STORAGE_KEY = 'inspiraciones.auth.token'

let memoryToken: string | null = null

function obtenerStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage
    }
  } catch {
    // Entornos sin acceso a sessionStorage (ej. SSR o modo restringido)
  }
  return null
}

export function getToken(): string | null {
  if (memoryToken) {
    return memoryToken
  }
  const storage = obtenerStorage()
  if (storage) {
    const guardado = storage.getItem(TOKEN_STORAGE_KEY)
    if (guardado) {
      memoryToken = guardado
      return guardado
    }
  }
  return null
}

export function setToken(token: string | null): void {
  memoryToken = token
  const storage = obtenerStorage()
  if (storage) {
    if (token) {
      storage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      storage.removeItem(TOKEN_STORAGE_KEY)
    }
  }
}

export function clearToken(): void {
  setToken(null)
}

export function hasToken(): boolean {
  return getToken() !== null
}

export interface UsuarioActualDto {
  id: string
  nombre: string
  apellido?: string
  bio?: string | null
  fotoUrl?: string | null
  rol?: RolUsuario | string
  cantidadSeguidores?: number
  estadoCuenta?: string
}

function mapearUsuarioActual(dto: UsuarioActualDto): Usuario {
  return new Usuario({
    id: dto.id,
    nombre: dto.nombre,
    apellido: dto.apellido ?? '',
    bio: dto.bio ?? undefined,
    fotoUrl: dto.fotoUrl ?? undefined,
    rol: RolUsuario.USER,
    cantidadSeguidores: dto.cantidadSeguidores ?? 0,
    siguiendoAlUsuarioActual: false,
  })
}

/**
 * Consulta `GET /auth/me` para verificar si existe una sesión activa y obtener el usuario.
 * Retorna el `Usuario` autenticado, o `null` si la sesión no es válida (401), sin propagar error 401.
 */
export async function verificarSesion(): Promise<Usuario | null> {
  try {
    const dto = await httpClient.get<UsuarioActualDto>('/auth/me')
    return mapearUsuarioActual(dto)
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearToken()
      return null
    }
    throw error
  }
}

export const tokenStorage = {
  getToken,
  setToken,
  clearToken,
  hasToken,
  verificarSesion,
}
