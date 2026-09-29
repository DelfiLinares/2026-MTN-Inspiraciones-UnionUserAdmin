/**
 * Tests de `perfilService` y `useSeguirUsuario` (T074).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-16 a RF-20, RF-37 a RF-39, CB-07, AC-08.3, AC-08.4)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md
 *   (`GET /usuarios/{id}`, `PATCH /perfil`, `POST/DELETE /usuarios/{id}/seguir`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T074, depende de T062)
 *
 * Cobertura:
 * - Actualización optimista del contador de seguidores y del estado `siguiendoAlUsuarioActual` (AC-08.3).
 * - Reversión inmediata al estado previo si la solicitud a la API falla (CB-07, AC-08.4).
 * - Modificación de perfil excluyendo contraseña (RF-16) y enviando FormData si incluye foto.
 * - Invocaciones a `POST /usuarios/{id}/seguir` y `DELETE /usuarios/{id}/seguir`.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import {
  obtenerUsuario,
  actualizarPerfil,
  seguirUsuario,
  dejarDeSeguir,
  useSeguirUsuario,
} from '../../src/services/perfilService'
import { httpClient } from '../../src/infrastructure/httpClient'
import { Usuario } from '../../src/domain/Usuario'
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

function crearUsuarioPrueba(siguiendo = false, seguidores = 5): Usuario {
  return new Usuario({
    id: 'usr-target-1',
    nombre: 'Ana',
    apellido: 'García',
    bio: 'Artista digital',
    fotoUrl: 'https://example.com/foto.jpg',
    rol: RolUsuario.USER,
    siguiendoAlUsuarioActual: siguiendo,
    cantidadSeguidores: seguidores,
  })
}

describe('perfilService & useSeguirUsuario (T074)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('obtenerUsuario (GET /usuarios/{id})', () => {
    it('obtiene un usuario y lo mapea correctamente a la entidad Usuario', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({
        id: 'usr-target-1',
        nombre: 'Ana',
        apellido: 'García',
        bio: 'Artista digital',
        fotoUrl: 'https://example.com/foto.jpg',
        rol: 'USER',
        siguiendoAlUsuarioActual: false,
        cantidadSeguidores: 12,
      })

      const usuario = await obtenerUsuario('usr-target-1')

      expect(httpClient.get).toHaveBeenCalledWith('/usuarios/usr-target-1', undefined)
      expect(usuario).toBeInstanceOf(Usuario)
      expect(usuario.nombre).toBe('Ana')
      expect(usuario.apellido).toBe('García')
      expect(usuario.cantidadSeguidores).toBe(12)
      expect(usuario.siguiendoAlUsuarioActual).toBe(false)
    })
  })

  describe('actualizarPerfil (PATCH /perfil, RF-16)', () => {
    it('envía un objeto JSON sin contraseña cuando no hay foto (RF-16)', async () => {
      vi.mocked(httpClient.patch).mockResolvedValueOnce({
        id: 'usr-mi-perfil',
        nombre: 'NuevoNombre',
        apellido: 'García',
        bio: 'Nueva Bio',
        rol: 'USER',
      })

      const usuario = await actualizarPerfil({
        nombre: 'NuevoNombre',
        bio: 'Nueva Bio',
      })

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/perfil',
        {
          nombre: 'NuevoNombre',
          bio: 'Nueva Bio',
        },
        undefined
      )

      expect(usuario.nombre).toBe('NuevoNombre')
      expect(usuario.bio).toBe('Nueva Bio')
    })

    it('envía FormData cuando se adjunta un archivo de foto', async () => {
      vi.mocked(httpClient.patch).mockResolvedValueOnce({
        id: 'usr-mi-perfil',
        nombre: 'Ana',
        apellido: 'García',
        fotoUrl: 'https://example.com/nueva-foto.png',
        rol: 'USER',
      })

      const archivoFoto = new File(['contenido-imagen'], 'avatar.png', { type: 'image/png' })
      const usuario = await actualizarPerfil({
        nombre: 'Ana',
        foto: archivoFoto,
      })

      expect(httpClient.patch).toHaveBeenCalledTimes(1)
      const callArgs = vi.mocked(httpClient.patch).mock.calls[0]
      expect(callArgs[0]).toBe('/perfil')
      expect(callArgs[1]).toBeInstanceOf(FormData)

      const formData = callArgs[1] as FormData
      expect(formData.get('nombre')).toBe('Ana')
      expect(formData.get('foto')).toBe(archivoFoto)
      expect(usuario.fotoUrl).toBe('https://example.com/nueva-foto.png')
    })
  })

  describe('seguirUsuario & dejarDeSeguir (POST/DELETE /usuarios/{id}/seguir, RF-38, RF-39)', () => {
    it('invoca POST /usuarios/{id}/seguir al seguir a un usuario', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        siguiendo: true,
        cantidadSeguidores: 6,
      })

      const respuesta = await seguirUsuario('usr-target-1')

      expect(httpClient.post).toHaveBeenCalledWith('/usuarios/usr-target-1/seguir', undefined, undefined)
      expect(respuesta.siguiendo).toBe(true)
      expect(respuesta.cantidadSeguidores).toBe(6)
    })

    it('invoca DELETE /usuarios/{id}/seguir al dejar de seguir a un usuario', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce({
        siguiendo: false,
        cantidadSeguidores: 4,
      })

      const respuesta = await dejarDeSeguir('usr-target-1')

      expect(httpClient.delete).toHaveBeenCalledWith('/usuarios/usr-target-1/seguir', undefined)
      expect(respuesta.siguiendo).toBe(false)
      expect(respuesta.cantidadSeguidores).toBe(4)
    })
  })

  describe('useSeguirUsuario & Actualización Optimista + Revert (CB-07, AC-08.3, AC-08.4)', () => {
    it('actualiza optimistamente al seguir y confirma con la respuesta de la API (AC-08.3)', async () => {
      const usuarioInicial = crearUsuarioPrueba(false, 10)
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        siguiendo: true,
        cantidadSeguidores: 11,
      })

      const { result } = renderHook(() => useSeguirUsuario(usuarioInicial))

      expect(result.current.usuario.siguiendoAlUsuarioActual).toBe(false)
      expect(result.current.usuario.cantidadSeguidores).toBe(10)

      await act(async () => {
        await result.current.alternarSeguir()
      })

      expect(httpClient.post).toHaveBeenCalledWith(
        '/usuarios/usr-target-1/seguir',
        undefined,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(result.current.usuario.siguiendoAlUsuarioActual).toBe(true)
      expect(result.current.usuario.cantidadSeguidores).toBe(11)
      expect(result.current.error).toBeNull()
    })

    it('actualiza optimistamente al dejar de seguir y confirma con la respuesta de la API', async () => {
      const usuarioInicial = crearUsuarioPrueba(true, 10)
      vi.mocked(httpClient.delete).mockResolvedValueOnce({
        siguiendo: false,
        cantidadSeguidores: 9,
      })

      const { result } = renderHook(() => useSeguirUsuario(usuarioInicial))

      expect(result.current.usuario.siguiendoAlUsuarioActual).toBe(true)

      await act(async () => {
        await result.current.alternarSeguir()
      })

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/usuarios/usr-target-1/seguir',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(result.current.usuario.siguiendoAlUsuarioActual).toBe(false)
      expect(result.current.usuario.cantidadSeguidores).toBe(9)
      expect(result.current.error).toBeNull()
    })

    it('CB-07 / AC-08.4: revierte el estado optimistamente aplicado al fallar la solicitud HTTP', async () => {
      const usuarioInicial = crearUsuarioPrueba(false, 10)
      vi.mocked(httpClient.post).mockRejectedValueOnce({
        message: 'Error de red al intentar seguir al usuario',
      })

      const { result } = renderHook(() => useSeguirUsuario(usuarioInicial))

      await act(async () => {
        await result.current.alternarSeguir()
      })

      // Reversión al estado anterior
      expect(result.current.usuario.siguiendoAlUsuarioActual).toBe(false)
      expect(result.current.usuario.cantidadSeguidores).toBe(10)
      expect(result.current.error).toBe('Error de red al intentar seguir al usuario')
      expect(result.current.enviando).toBe(false)
    })
  })
})
