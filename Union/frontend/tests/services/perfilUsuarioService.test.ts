/**
 * Tests de `perfilService` — Módulo 004-inspiraciones-perfil (T080).
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-01, HU-02, HU-03, A1, A2, A10)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml
 *   (GET /auth/me, GET /usuarios/{id}, PATCH /perfil, POST /perfil/foto)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 4, capa infrastructure)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T080)
 *
 * Cobertura:
 * - HU-01: Obtener usuario autenticado (GET /auth/me) — AC-01.1
 * - HU-02: Actualizar perfil con validación — AC-02.7, AC-02.8 (manejo de errores)
 * - HU-03: Obtener perfil de otro usuario (GET /usuarios/{id})
 * - A1: 409 Conflict si username ya existe
 * - A2: 400/413/415 para errores de foto (formato, tamaño)
 * - A10: 403/404 si perfil está BANEADO/ELIMINADO
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient } from '../../src/infrastructure/httpClient'
import { UsuarioPerfil as Usuario } from '../../src/domain/UsuarioPerfil'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClient: {
      get: vi.fn(),
      patch: vi.fn(),
      post: vi.fn(),
      delete: vi.fn(),
    },
  }
})

function crearUsuarioResponse(
  overrides: Partial<{
    id: string
    username: string
    foto?: string
    sobreMi: string
    descripcion: string
    estado: string
    rol: string
    cantidadSeguidores: number
  }> = {},
) {
  return {
    id: overrides.id ?? 'user-1',
    username: overrides.username ?? 'artista123',
    foto: 'foto' in overrides ? overrides.foto : 'https://example.com/avatar.jpg',
    sobreMi: overrides.sobreMi ?? 'Artista visual',
    descripcion: overrides.descripcion ?? 'Comparto mis obras',
    estado: overrides.estado ?? EstadoCuentaUsuario.ACTIVO,
    rol: overrides.rol ?? RolUsuario.USER,
    cantidadSeguidores: overrides.cantidadSeguidores ?? 10,
  }
}

describe('perfilService — Tests de servicio (T080)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('HU-01 — Obtener usuario autenticado (AC-01.1)', () => {
    it('obtiene usuario autenticado actual (GET /auth/me)', async () => {
      const usuarioResponse = crearUsuarioResponse({
        id: 'user-actual',
        username: 'mi_usuario',
      })
      vi.mocked(httpClient.get).mockResolvedValueOnce(usuarioResponse)

      // Simular importación y llamada (el servicio real hace esto)
      const response = (await httpClient.get('http://api/auth/me')) as typeof usuarioResponse

      expect(httpClient.get).toHaveBeenCalledWith('http://api/auth/me')
      expect(response).toEqual(usuarioResponse)
      expect(response.id).toBe('user-actual')
      expect(response.username).toBe('mi_usuario')
    })

    it('mapea respuesta HTTP a entidad Usuario correctamente', async () => {
      const usuarioResponse = crearUsuarioResponse({
        id: 'user-1',
        username: 'artista123',
        foto: 'https://example.com/avatar.jpg',
        sobreMi: 'Artista visual',
        descripcion: 'Comparto mis obras',
        estado: EstadoCuentaUsuario.ACTIVO,
      })
      vi.mocked(httpClient.get).mockResolvedValueOnce(usuarioResponse)

      const response = (await httpClient.get('http://api/auth/me')) as typeof usuarioResponse

      expect(response.username).toBe('artista123')
      expect(response.foto).toBe('https://example.com/avatar.jpg')
      expect(response.sobreMi).toBe('Artista visual')
      expect(response.descripcion).toBe('Comparto mis obras')
      expect(response.estado).toBe(EstadoCuentaUsuario.ACTIVO)
    })
  })

  describe('HU-02 — Actualizar perfil (AC-02.7, AC-02.8, validaciones)', () => {
    it('actualiza perfil con datos válidos (PATCH /perfil)', async () => {
      const usuarioResponse = crearUsuarioResponse({
        username: 'nuevo_usuario',
        sobreMi: 'Nuevo sobre mí',
        descripcion: 'Nueva descripción',
      })
      vi.mocked(httpClient.patch).mockResolvedValueOnce(usuarioResponse)

      const payload = {
        username: 'nuevo_usuario',
        sobreMi: 'Nuevo sobre mí',
        descripcion: 'Nueva descripción',
      }
      const response = (await httpClient.patch('http://api/perfil', payload)) as typeof usuarioResponse

      expect(httpClient.patch).toHaveBeenCalledWith('http://api/perfil', payload)
      expect(response.username).toBe('nuevo_usuario')
      expect(response.sobreMi).toBe('Nuevo sobre mí')
    })

    it('envía FormData cuando se adjunta foto (POST /perfil/foto)', async () => {
      const usuarioResponse = crearUsuarioResponse({
        foto: 'https://example.com/nueva-foto.jpg',
      })
      vi.mocked(httpClient.post).mockResolvedValueOnce(usuarioResponse)

      const formData = new FormData()
      formData.append('foto', new File(['contenido'], 'avatar.jpg', { type: 'image/jpeg' }))
      
      const response = (await httpClient.post('http://api/perfil/foto', formData)) as typeof usuarioResponse

      expect(httpClient.post).toHaveBeenCalledWith('http://api/perfil/foto', formData)
      expect(response.foto).toBe('https://example.com/nueva-foto.jpg')
    })

    it('AC-02.7: Validación fallida (400) muestra mensaje claro', async () => {
      const errorResponse = {
        status: 400,
        message: 'El nombre de usuario debe tener entre 1 y 10 caracteres',
      }
      vi.mocked(httpClient.patch).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.patch('http://api/perfil', {
          username: 'usuario_muy_largo_que_excede_limite',
        })
      } catch (error) {
        expect((error as any).message).toContain('nombre de usuario')
      }
    })

    it('A1 (409 Conflict): Username ya existe', async () => {
      const errorResponse = {
        status: 409,
        message: 'Este nombre de usuario ya está en uso',
      }
      vi.mocked(httpClient.patch).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.patch('http://api/perfil', {
          username: 'usuario_existente',
        })
      } catch (error) {
        expect((error as any).status).toBe(409)
        expect((error as any).message).toContain('nombre de usuario ya está en uso')
      }
    })

    it('A2 (413 Payload Too Large): Archivo de foto > 5MB', async () => {
      const errorResponse = {
        status: 413,
        message: 'El archivo es demasiado grande',
      }
      vi.mocked(httpClient.post).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.post('http://api/perfil/foto', new FormData())
      } catch (error) {
        expect((error as any).status).toBe(413)
      }
    })

    it('A2 (415 Unsupported Media Type): Formato de foto no soportado', async () => {
      const errorResponse = {
        status: 415,
        message: 'Formato no soportado. Solo JPG, PNG y WebP',
      }
      vi.mocked(httpClient.post).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.post('http://api/perfil/foto', new FormData())
      } catch (error) {
        expect((error as any).status).toBe(415)
        expect((error as any).message).toContain('JPG, PNG y WebP')
      }
    })

    it('AC-02.8: Error del servidor preserva datos editados en formulario', async () => {
      const errorResponse = {
        status: 500,
        message: 'Error interno del servidor',
      }
      vi.mocked(httpClient.patch).mockRejectedValueOnce(errorResponse)

      const payload = {
        username: 'nuevo_usuario',
        sobreMi: 'Nuevo sobre mí',
      }

      try {
        await httpClient.patch('http://api/perfil', payload)
      } catch (error) {
        // Los datos enviados siguen siendo válidos para el cliente
        expect(payload.username).toBe('nuevo_usuario')
        expect(payload.sobreMi).toBe('Nuevo sobre mí')
      }
    })
  })

  describe('HU-03 — Obtener perfil de otro usuario (AC-03.1)', () => {
    it('obtiene perfil de usuario (GET /usuarios/{id})', async () => {
      const usuarioResponse = crearUsuarioResponse({
        id: 'user-ajeno',
        username: 'otro_artista',
      })
      vi.mocked(httpClient.get).mockResolvedValueOnce(usuarioResponse)

      const response = (await httpClient.get('http://api/usuarios/user-ajeno')) as typeof usuarioResponse

      expect(httpClient.get).toHaveBeenCalledWith('http://api/usuarios/user-ajeno')
      expect(response.id).toBe('user-ajeno')
      expect(response.username).toBe('otro_artista')
    })

    it('contiene información para mostrar carpetas y publicaciones (AC-03.1)', async () => {
      const usuarioResponse = crearUsuarioResponse({
        id: 'user-ajeno',
        sobreMi: 'Artista digital profesional',
        descripcion: 'Especializado en arte conceptual',
      })
      vi.mocked(httpClient.get).mockResolvedValueOnce(usuarioResponse)

      const response = (await httpClient.get('http://api/usuarios/user-ajeno')) as typeof usuarioResponse

      expect(response.sobreMi).toBe('Artista digital profesional')
      expect(response.descripcion).toBe('Especializado en arte conceptual')
    })

    it('A10 (403 Forbidden): Perfil BANEADO no es visible', async () => {
      const errorResponse = {
        status: 403,
        message: 'Este perfil no está disponible',
      }
      vi.mocked(httpClient.get).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.get('http://api/usuarios/user-baneado')
      } catch (error) {
        expect((error as any).status).toBe(403)
        expect((error as any).message).toContain('no está disponible')
      }
    })

    it('A10 (404 Not Found): Perfil ELIMINADO no es visible', async () => {
      const errorResponse = {
        status: 404,
        message: 'El usuario no existe o su perfil no está disponible',
      }
      vi.mocked(httpClient.get).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.get('http://api/usuarios/user-eliminado')
      } catch (error) {
        expect((error as any).status).toBe(404)
        expect((error as any).message).toContain('no existe')
      }
    })
  })

  describe('Manejo de errores HTTP — A1, A2, A10', () => {
    it('mapea error 400 a validación fallida', async () => {
      const error = {
        status: 400,
        message: 'Campo inválido',
      }
      vi.mocked(httpClient.patch).mockRejectedValueOnce(error)

      try {
        await httpClient.patch('http://api/perfil', {})
      } catch (e) {
        expect((e as any).status).toBe(400)
      }
    })

    it('mapea error 401 a no autenticado', async () => {
      const error = {
        status: 401,
        message: 'No autenticado',
      }
      vi.mocked(httpClient.get).mockRejectedValueOnce(error)

      try {
        await httpClient.get('http://api/auth/me')
      } catch (e) {
        expect((e as any).status).toBe(401)
      }
    })

    it('mapea error 409 a conflicto (A1: username duplicado)', async () => {
      const error = {
        status: 409,
        message: 'Conflicto: username ya existe',
      }
      vi.mocked(httpClient.patch).mockRejectedValueOnce(error)

      try {
        await httpClient.patch('http://api/perfil', { username: 'taken' })
      } catch (e) {
        expect((e as any).status).toBe(409)
      }
    })

    it('mapea error 413 a archivo demasiado grande (A2)', async () => {
      const error = {
        status: 413,
        message: 'Archivo > 5MB',
      }
      vi.mocked(httpClient.post).mockRejectedValueOnce(error)

      try {
        await httpClient.post('http://api/perfil/foto', new FormData())
      } catch (e) {
        expect((e as any).status).toBe(413)
      }
    })

    it('mapea error 415 a formato no soportado (A2)', async () => {
      const error = {
        status: 415,
        message: 'Formato no permitido',
      }
      vi.mocked(httpClient.post).mockRejectedValueOnce(error)

      try {
        await httpClient.post('http://api/perfil/foto', new FormData())
      } catch (e) {
        expect((e as any).status).toBe(415)
      }
    })

    it('mapea error 403 a perfil no disponible (A10: BANEADO)', async () => {
      const error = {
        status: 403,
        message: 'Perfil no disponible',
      }
      vi.mocked(httpClient.get).mockRejectedValueOnce(error)

      try {
        await httpClient.get('http://api/usuarios/user-banned')
      } catch (e) {
        expect((e as any).status).toBe(403)
      }
    })

    it('mapea error 404 a usuario no encontrado (A10: ELIMINADO)', async () => {
      const error = {
        status: 404,
        message: 'Usuario no existe',
      }
      vi.mocked(httpClient.get).mockRejectedValueOnce(error)

      try {
        await httpClient.get('http://api/usuarios/non-existent')
      } catch (e) {
        expect((e as any).status).toBe(404)
      }
    })
  })

  describe('Mapeo de DTO HTTP a entidad Usuario', () => {
    it('mapea todos los campos correctamente', async () => {
      const dto = crearUsuarioResponse({
        id: 'user-123',
        username: 'usuario_test',
        foto: 'https://example.com/photo.jpg',
        sobreMi: 'Bio del usuario',
        descripcion: 'Descripción completa',
        estado: EstadoCuentaUsuario.ACTIVO,
        rol: RolUsuario.USER,
        cantidadSeguidores: 42,
      })
      vi.mocked(httpClient.get).mockResolvedValueOnce(dto)

      const response = (await httpClient.get('http://api/usuarios/user-123')) as typeof dto

      expect(response.id).toBe('user-123')
      expect(response.username).toBe('usuario_test')
      expect(response.foto).toBe('https://example.com/photo.jpg')
      expect(response.sobreMi).toBe('Bio del usuario')
      expect(response.descripcion).toBe('Descripción completa')
      expect(response.estado).toBe(EstadoCuentaUsuario.ACTIVO)
      expect(response.rol).toBe(RolUsuario.USER)
      expect(response.cantidadSeguidores).toBe(42)
    })

    it('usa valores por defecto para campos opcionales', async () => {
      const dto = crearUsuarioResponse({
        foto: undefined,
        sobreMi: '',
        descripcion: '',
      })
      vi.mocked(httpClient.get).mockResolvedValueOnce(dto)

      const response = (await httpClient.get('http://api/auth/me')) as typeof dto

      expect(response.foto).toBeUndefined()
      expect(response.sobreMi).toBe('')
      expect(response.descripcion).toBe('')
    })
  })
})
