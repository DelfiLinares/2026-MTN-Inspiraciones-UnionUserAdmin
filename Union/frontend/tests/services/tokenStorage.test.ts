import { afterEach, describe, expect, it, vi } from 'vitest'
import { Usuario } from '../../src/domain/Usuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.resetModules()
})

function crearStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear() {
      values.clear()
    },
    getItem(key: string) {
      return values.get(key) ?? null
    },
    key(index: number) {
      return Array.from(values.keys())[index] ?? null
    },
    removeItem(key: string) {
      values.delete(key)
    },
    setItem(key: string, value: string) {
      values.set(key, String(value))
    },
  }
}

describe('tokenStorage', () => {
  it('no consulta auth/me cuando no existe un token', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const { verificarSesion } = await import('../../src/infrastructure/tokenStorage')

    await expect(verificarSesion()).resolves.toBeNull()

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('guarda el token en localStorage y lo recupera tras recargar el módulo', async () => {
    const localStorage = crearStorage()
    const sessionStorage = crearStorage()
    vi.stubGlobal('window', { localStorage, sessionStorage })

    const { tokenStorage } = await import('../../src/infrastructure/tokenStorage')
    tokenStorage.setToken('jwt-persistente')
    tokenStorage.setLoginData('ana@ejemplo.com', 'ana', crearUsuario())

    expect(localStorage.getItem('inspiraciones.auth.token')).toBe('jwt-persistente')
    expect(localStorage.getItem('inspiraciones.auth.email')).toBe('ana@ejemplo.com')
    expect(localStorage.getItem('inspiraciones.auth.username')).toBe('ana')
    expect(sessionStorage.getItem('inspiraciones.auth.token')).toBeNull()

    vi.resetModules()
    const { tokenStorage: storageRecargado } = await import('../../src/infrastructure/tokenStorage')

    expect(storageRecargado.getToken()).toBe('jwt-persistente')
    expect(storageRecargado.obtenerUsuarioPersistido()).toMatchObject({ id: 'u1', nombre: 'Ana' })
  })

  it('guarda mail y nombre de usuario en localStorage y los limpia al cerrar sesión', async () => {
    const localStorage = crearStorage()
    const sessionStorage = crearStorage()
    vi.stubGlobal('window', { localStorage, sessionStorage })

    const { tokenStorage } = await import('../../src/infrastructure/tokenStorage')
    tokenStorage.setToken('jwt-persistente')
    tokenStorage.setLoginData('ana@ejemplo.com', 'ana', crearUsuario())

    expect(localStorage.getItem('inspiraciones.auth.email')).toBe('ana@ejemplo.com')
    expect(localStorage.getItem('inspiraciones.auth.username')).toBe('ana')
    expect(tokenStorage.obtenerUsuarioPersistido()).toMatchObject({ id: 'u1', nombre: 'Ana' })

    tokenStorage.clearToken()

    expect(localStorage.getItem('inspiraciones.auth.token')).toBeNull()
    expect(localStorage.getItem('inspiraciones.auth.email')).toBeNull()
    expect(localStorage.getItem('inspiraciones.auth.username')).toBeNull()
    expect(localStorage.getItem('inspiraciones.auth.user')).toBeNull()
  })

  it('migra a localStorage un token guardado previamente en sessionStorage', async () => {
    const localStorage = crearStorage()
    const sessionStorage = crearStorage()
    sessionStorage.setItem('inspiraciones.auth.token', 'jwt-anterior')
    vi.stubGlobal('window', { localStorage, sessionStorage })

    const { tokenStorage } = await import('../../src/infrastructure/tokenStorage')

    expect(tokenStorage.getToken()).toBe('jwt-anterior')
    expect(localStorage.getItem('inspiraciones.auth.token')).toBe('jwt-anterior')
    expect(sessionStorage.getItem('inspiraciones.auth.token')).toBeNull()
  })
})

function crearUsuario(): Usuario {
  return new Usuario({
    id: 'u1',
    nombre: 'Ana',
    apellido: 'Pérez',
    rol: RolUsuario.USER,
    siguiendoAlUsuarioActual: false,
    cantidadSeguidores: 0,
  })
}