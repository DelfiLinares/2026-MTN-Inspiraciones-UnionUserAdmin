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
 * - Persiste el token en localStorage y lo mantiene también en memoria durante la sesión.
 * - Provee `getToken()`, `setToken(token)`, `clearToken()` y `hasToken()`.
 * - Compatible con verificación de sesión (`verificarSesion`) consultando `GET /auth/me`.
 */

import { httpClient, ApiError } from './httpClient'
import { Usuario, type UsuarioProps } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'

const TOKEN_STORAGE_KEY = 'inspiraciones.auth.token'
const EMAIL_STORAGE_KEY = 'inspiraciones.auth.email'
const USERNAME_STORAGE_KEY = 'inspiraciones.auth.username'
const USER_STORAGE_KEY = 'inspiraciones.auth.user'

let memoryToken: string | null = null

function obtenerStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage
    }
  } catch {
    // Entornos sin acceso a localStorage (ej. SSR o modo restringido)
  }
  return null
}

function obtenerStorageAnterior(): Storage | null {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      return window.sessionStorage
    }
  } catch {
    // Entornos sin acceso a sessionStorage
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

  const storageAnterior = obtenerStorageAnterior()
  const tokenAnterior = storageAnterior?.getItem(TOKEN_STORAGE_KEY)
  if (tokenAnterior) {
    if (storage) {
      storage.setItem(TOKEN_STORAGE_KEY, tokenAnterior)
      storageAnterior?.removeItem(TOKEN_STORAGE_KEY)
    }
    memoryToken = tokenAnterior
    return tokenAnterior
  }

  return null
}

export function setToken(token: string | null): void {
  memoryToken = token
  const storage = obtenerStorage()
  const storageAnterior = obtenerStorageAnterior()
  if (storage) {
    if (token) {
      storage.setItem(TOKEN_STORAGE_KEY, token)
    } else {
      storage.removeItem(TOKEN_STORAGE_KEY)
    }
  }
  storageAnterior?.removeItem(TOKEN_STORAGE_KEY)
}

export function setLoginData(email: string, username: string, usuario: Usuario): void {
  const storage = obtenerStorage()
  if (!storage) {
    return
  }

  storage.setItem(EMAIL_STORAGE_KEY, email)
  storage.setItem(USERNAME_STORAGE_KEY, username)
  storage.setItem(USER_STORAGE_KEY, JSON.stringify({
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    bio: usuario.bio,
    fotoUrl: usuario.fotoUrl,
    rol: usuario.rol,
    siguiendoAlUsuarioActual: usuario.siguiendoAlUsuarioActual,
    cantidadSeguidores: usuario.cantidadSeguidores,
  }))
}

export function obtenerUsuarioPersistido(): Usuario | null {
  if (!hasToken()) {
    return null
  }

  const storage = obtenerStorage()
  const guardado = storage?.getItem(USER_STORAGE_KEY)
  if (!storage || !guardado) {
    return null
  }

  try {
    const datos = JSON.parse(guardado) as UsuarioProps
    if (
      typeof datos.id !== 'string' ||
      typeof datos.nombre !== 'string' ||
      typeof datos.apellido !== 'string' ||
      !Object.values(RolUsuario).includes(datos.rol)
    ) {
      storage.removeItem(USER_STORAGE_KEY)
      return null
    }

    return new Usuario(datos)
  } catch {
    storage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

export function clearToken(): void {
  setToken(null)
  const storage = obtenerStorage()
  storage?.removeItem(EMAIL_STORAGE_KEY)
  storage?.removeItem(USERNAME_STORAGE_KEY)
  storage?.removeItem(USER_STORAGE_KEY)
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
  if (!hasToken()) {
    return null
  }

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
  setLoginData,
  obtenerUsuarioPersistido,
  clearToken,
  hasToken,
  verificarSesion,
}
