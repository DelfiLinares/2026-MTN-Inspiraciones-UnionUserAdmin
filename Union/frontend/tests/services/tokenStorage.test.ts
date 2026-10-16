import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'
import { Usuario } from '../../src/domain/Usuario'
import { ApiError, httpClient } from '../../src/infrastructure/httpClient'
import { tokenStorage, verificarSesion } from '../../src/infrastructure/tokenStorage'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal) => {
  const original =
    await importOriginal<typeof import('../../src/infrastructure/httpClient')>()
  return {
    ...original,
    httpClient: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

const CLAVE_TOKEN = 'inspiraciones.auth.token'
const CLAVE_USUARIO = 'inspiraciones.auth.user'
const CLAVE_EMAIL = 'inspiraciones.auth.email'
const CLAVE_USERNAME = 'inspiraciones.auth.username'

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

function crearUsuario(): Usuario {
  return new Usuario({
    id: 'u1',
    nombre: 'Ana',
    apellido: 'Pérez',
    bio: 'Artista',
    fotoUrl: 'https://example.com/ana.jpg',
    rol: RolUsuario.USER,
    siguiendoAlUsuarioActual: false,
    cantidadSeguidores: 5,
  })
}

const perfilPropioDto = {
  id: 'u1',
  email: 'ana@example.com',
  username: 'ana',
  nombreCompleto: 'Ana Pérez',
  avatarUrl: 'https://example.com/ana.jpg',
  role: 'USER',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00.000Z',
  onboardingCompletado: true,
  sobreMi: 'Artista',
  descripcion: 'Inspiraciones',
  cantidadSeguidores: 5,
}

describe('tokenStorage y verificarSesion', () => {
  let localStorage: Storage
  let sessionStorage: Storage

  beforeEach(() => {
    localStorage = crearStorage()
    sessionStorage = crearStorage()
    vi.stubGlobal('window', { localStorage, sessionStorage })
    tokenStorage.clearToken()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('no consulta /usuarios/me cuando no existe un token', async () => {
    await expect(verificarSesion()).resolves.toBeNull()

    expect(httpClient.get).not.toHaveBeenCalled()
  })

  it('persiste solo los datos permitidos para reconstruir el usuario', () => {
    tokenStorage.setToken('jwt-persistente')
    tokenStorage.setLoginData('ana@example.com', 'ana', crearUsuario())

    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('jwt-persistente')
    expect(sessionStorage.getItem(CLAVE_TOKEN)).toBeNull()
    expect(localStorage.getItem(CLAVE_EMAIL)).toBeNull()
    expect(localStorage.getItem(CLAVE_USERNAME)).toBeNull()
    expect(JSON.parse(localStorage.getItem(CLAVE_USUARIO) ?? '{}')).toEqual({
      id: 'u1',
      nombre: 'Ana',
      apellido: 'Pérez',
      bio: 'Artista',
      fotoUrl: 'https://example.com/ana.jpg',
      rol: 'USER',
      siguiendoAlUsuarioActual: false,
      cantidadSeguidores: 5,
    })
  })

  it('reconstruye el usuario desde la allowlist persistida', () => {
    tokenStorage.setToken('jwt-persistente')
    tokenStorage.setLoginData('ana@example.com', 'ana', crearUsuario())
    const usuarioPersistido = localStorage.getItem(CLAVE_USUARIO)

    tokenStorage.clearToken()
    localStorage.setItem(CLAVE_TOKEN, 'jwt-persistente')
    localStorage.setItem(CLAVE_USUARIO, usuarioPersistido ?? '')

    expect(tokenStorage.obtenerUsuarioPersistido()).toMatchObject({
      id: 'u1',
      nombre: 'Ana',
      apellido: 'Pérez',
      fotoUrl: 'https://example.com/ana.jpg',
      rol: RolUsuario.USER,
    })
  })

  it('migra el token anterior de sessionStorage a localStorage', () => {
    sessionStorage.setItem(CLAVE_TOKEN, 'jwt-anterior')

    expect(tokenStorage.getToken()).toBe('jwt-anterior')
    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('jwt-anterior')
    expect(sessionStorage.getItem(CLAVE_TOKEN)).toBeNull()
  })

  it('verifica la sesión contra /usuarios/me y actualiza el perfil persistido', async () => {
    tokenStorage.setToken('jwt-persistente')
    vi.mocked(httpClient.get).mockResolvedValueOnce(perfilPropioDto)

    const usuario = await verificarSesion()

    expect(httpClient.get).toHaveBeenCalledWith('/usuarios/me')
    expect(usuario).toMatchObject({
      id: 'u1',
      nombre: 'Ana',
      apellido: 'Pérez',
      fotoUrl: 'https://example.com/ana.jpg',
    })
    expect(tokenStorage.obtenerUsuarioPersistido()).toMatchObject({
      bio: 'Artista',
      cantidadSeguidores: 5,
    })
  })

  it('limpia la sesión al recibir 401', async () => {
    tokenStorage.setToken('jwt-expirado')
    vi.mocked(httpClient.get).mockRejectedValueOnce(
      new ApiError('Unauthorized', 401, { code: 'UNAUTHORIZED' }),
    )

    await expect(verificarSesion()).rejects.toBeInstanceOf(ApiError)

    expect(localStorage.getItem(CLAVE_TOKEN)).toBeNull()
  })

  it('conserva la sesión ante errores distintos de 401', async () => {
    tokenStorage.setToken('jwt-persistente')
    vi.mocked(httpClient.get).mockRejectedValueOnce(
      new ApiError('Internal server error', 500, { code: 'INTERNAL_SERVER_ERROR' }),
    )

    await expect(verificarSesion()).rejects.toBeInstanceOf(ApiError)

    expect(localStorage.getItem(CLAVE_TOKEN)).toBe('jwt-persistente')
  })
})
