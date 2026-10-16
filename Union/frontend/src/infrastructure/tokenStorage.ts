import { Usuario } from '../domain/Usuario'
import { RolUsuario } from '../domain/enums/RolUsuario'
import { ApiError, httpClient } from './httpClient'
import { apiEndpoints } from './apiEndpoints'
import type { PerfilPropioDto } from './dto/perfilDtos'
import { mapearUsuarioAutenticado } from './mappers/perfilMappers'

const CLAVE_TOKEN = 'inspiraciones.auth.token'
const CLAVE_USUARIO = 'inspiraciones.auth.user'
const CLAVE_EMAIL = 'inspiraciones.auth.email'
const CLAVE_USERNAME = 'inspiraciones.auth.username'

interface UsuarioPersistidoDto {
  id: string
  nombre: string
  apellido: string
  bio?: string
  fotoUrl?: string
  rol: RolUsuario
  siguiendoAlUsuarioActual: boolean
  cantidadSeguidores: number
}

let tokenEnMemoria: string | null = null
let usuarioEnMemoria: Usuario | null = null

function obtenerStorage(): Storage | null {
  return typeof window === 'undefined' ? null : window.localStorage
}

function serializarUsuario(usuario: Usuario): string {
  const dto: UsuarioPersistidoDto = {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    bio: usuario.bio,
    fotoUrl: usuario.fotoUrl,
    rol: usuario.rol,
    siguiendoAlUsuarioActual: usuario.siguiendoAlUsuarioActual,
    cantidadSeguidores: usuario.cantidadSeguidores,
  }
  return JSON.stringify(dto)
}

function esUsuarioPersistidoDto(value: unknown): value is UsuarioPersistidoDto {
  if (!value || typeof value !== 'object') {
    return false
  }

  const dto = value as Partial<UsuarioPersistidoDto>
  return (
    typeof dto.id === 'string' &&
    typeof dto.nombre === 'string' &&
    typeof dto.apellido === 'string' &&
    (dto.bio === undefined || typeof dto.bio === 'string') &&
    (dto.fotoUrl === undefined || typeof dto.fotoUrl === 'string') &&
    (dto.rol === RolUsuario.USER || dto.rol === RolUsuario.ADMIN) &&
    typeof dto.siguiendoAlUsuarioActual === 'boolean' &&
    typeof dto.cantidadSeguidores === 'number'
  )
}

function deserializarUsuario(json: string): Usuario | null {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    return null
  }

  if (!esUsuarioPersistidoDto(value)) {
    return null
  }

  return new Usuario({
    id: value.id,
    nombre: value.nombre,
    apellido: value.apellido,
    bio: value.bio,
    fotoUrl: value.fotoUrl,
    rol: value.rol,
    siguiendoAlUsuarioActual: value.siguiendoAlUsuarioActual,
    cantidadSeguidores: value.cantidadSeguidores,
  })
}

function limpiarDatosLegados(storage: Storage): void {
  storage.removeItem(CLAVE_EMAIL)
  storage.removeItem(CLAVE_USERNAME)
}

function guardarUsuario(usuario: Usuario): void {
  usuarioEnMemoria = usuario
  obtenerStorage()?.setItem(CLAVE_USUARIO, serializarUsuario(usuario))
}

function obtenerToken(): string | null {
  const storage = obtenerStorage()
  if (!storage) {
    return tokenEnMemoria
  }

  const tokenPersistido = storage.getItem(CLAVE_TOKEN)
  if (tokenPersistido) {
    tokenEnMemoria = tokenPersistido
    return tokenPersistido
  }

  const tokenAnterior = window.sessionStorage.getItem(CLAVE_TOKEN)
  if (tokenAnterior) {
    storage.setItem(CLAVE_TOKEN, tokenAnterior)
    window.sessionStorage.removeItem(CLAVE_TOKEN)
    tokenEnMemoria = tokenAnterior
    return tokenAnterior
  }

  return tokenEnMemoria
}

export const tokenStorage = {
  getToken(): string | null {
    return obtenerToken()
  },

  setToken(token: string): void {
    tokenEnMemoria = token
    const storage = obtenerStorage()
    if (storage) {
      storage.setItem(CLAVE_TOKEN, token)
      window.sessionStorage.removeItem(CLAVE_TOKEN)
    }
  },

  setLoginData(_email: string, _username: string, usuario: Usuario): void {
    guardarUsuario(usuario)
    const storage = obtenerStorage()
    if (storage) {
      limpiarDatosLegados(storage)
    }
  },

  obtenerUsuarioPersistido(): Usuario | null {
    if (!obtenerToken()) {
      return null
    }
    if (usuarioEnMemoria) {
      return usuarioEnMemoria
    }

    const json = obtenerStorage()?.getItem(CLAVE_USUARIO)
    if (!json) {
      return null
    }

    const usuario = deserializarUsuario(json)
    if (!usuario) {
      obtenerStorage()?.removeItem(CLAVE_USUARIO)
      return null
    }
    usuarioEnMemoria = usuario
    return usuario
  },

  clearToken(): void {
    tokenEnMemoria = null
    usuarioEnMemoria = null
    const storage = obtenerStorage()
    if (storage) {
      storage.removeItem(CLAVE_TOKEN)
      storage.removeItem(CLAVE_USUARIO)
      limpiarDatosLegados(storage)
      window.sessionStorage.removeItem(CLAVE_TOKEN)
    }
  },
}
export async function verificarSesion(): Promise<Usuario | null> {
  if (!tokenStorage.getToken()) {
    return null
  }

  try {
    const dto = await httpClient.get<PerfilPropioDto>(apiEndpoints.me())
    const usuario = mapearUsuarioAutenticado(dto)
    guardarUsuario(usuario)
    return usuario
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      tokenStorage.clearToken()
    }
    throw error
  }
}
