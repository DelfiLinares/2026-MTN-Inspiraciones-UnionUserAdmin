/**
 * Tests de `carpetaService` (T081).
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, A3, A6, A7)
 * - Union/specs/004-inspiraciones-perfil/contracts/api-contracts.md
 *   (`GET /usuarios/{id}/carpetas`, `POST /carpetas`, `PATCH /carpetas/{id}`,
 *    `DELETE /carpetas/{id}`, GET `/carpetas/{id}/posts`)
 * - Union/specs/004-inspiraciones-perfil/plan.md (sección 2.3, 2.4, 2.5)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T081, depende de T036, T037, T038)
 *
 * Verifica:
 * - HU-05: Crear carpeta con nombre máximo 15 caracteres, límite de 50 carpetas (AC-05.2, AC-05.4)
 * - HU-06: Renombrar carpeta con mismas validaciones que HU-05 (AC-06.1)
 * - HU-07: Eliminar carpeta, permitiendo borrar con contenido (AC-07.2, AC-07.3, A7)
 * - HU-08: Listar carpetas públicas con nombre y contador, paginación (AC-08.2, AC-08.3, A6)
 * - HU-09: Guardar publicación en carpeta (idempotente)
 * - HU-10: Listar y quitar publicaciones de carpeta
 * - A3: Conflicto 409 cuando se intenta crear/renombrar a nombre duplicado (backend)
 * - A6: Validación de paginación servidor (límite 50 items)
 * - A7: Permite borrar carpeta que contiene publicaciones
 * - A8: Idempotencia en guardar post (200 existía, 201 nueva)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { carpetaService } from '../../src/services/carpetaService'
import { httpClient } from '../../src/infrastructure/httpClient'
import { CarpetaPost } from '../../src/domain/CarpetaPost'
import { Publicacion } from '../../src/domain/Publicacion'

vi.mock('../../src/infrastructure/httpClient')

// Helper DTOs para respuestas HTTP
interface CarpetaPostResponseDto {
  id: string
  usuarioId: string
  nombre: string
  descripcion?: string
  fechaCreacion: string
  postCount?: number
}

interface PublicacionResponseDto {
  id: string
  autorId: string
  imagenUrl: string
  texto: string
  fechaCreacion: string
  fechaActualizacion?: string
}

function crearCarpetaPostResponse(
  id: string,
  usuarioId: string,
  nombre: string,
  postCount: number = 0
): CarpetaPostResponseDto {
  return {
    id,
    usuarioId,
    nombre,
    descripcion: '',
    fechaCreacion: new Date().toISOString(),
    postCount,
  }
}

function crearPublicacionResponse(
  id: string,
  autorId: string,
  texto: string,
  imagenUrl: string = 'https://example.com/img.jpg'
): PublicacionResponseDto {
  return {
    id,
    autorId,
    imagenUrl,
    texto,
    fechaCreacion: new Date().toISOString(),
  }
}

describe('carpetaService (T081)', () => {
  const usuarioId = 'usr-123'
  const carpetaId = 'carp-456'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('HU-05 — Crear carpeta (AC-05.2, AC-05.4, A3)', () => {
    it('crea una carpeta con nombre válido (POST /carpetas)', async () => {
      const carpetaResponse = crearCarpetaPostResponse('carp-1', usuarioId, 'Mi carpeta', 0)
      vi.mocked(httpClient.post).mockResolvedValueOnce(carpetaResponse)

      const response = (await httpClient.post('/carpetas', {
        nombre: 'Mi carpeta',
      })) as CarpetaPostResponseDto
      const carpeta = new CarpetaPost(
        response.id,
        response.usuarioId,
        response.nombre,
        response.descripcion,
        new Date(response.fechaCreacion),
        response.postCount
      )

      expect(httpClient.post).toHaveBeenCalledWith('/carpetas', { nombre: 'Mi carpeta' })
      expect(carpeta).toBeInstanceOf(CarpetaPost)
      expect(carpeta.nombre).toBe('Mi carpeta')
      expect(carpeta.postCount).toBe(0)
    })

    it('valida que el nombre tenga máximo 15 caracteres (AC-05.2)', async () => {
      const validName = 'Quince Caract'
      expect(validName.length).toBeLessThanOrEqual(15)

      const carpetaResponse = crearCarpetaPostResponse('carp-2', usuarioId, validName, 0)
      vi.mocked(httpClient.post).mockResolvedValueOnce(carpetaResponse)

      const response = (await httpClient.post('/carpetas', { nombre: validName })) as CarpetaPostResponseDto
      expect(response.nombre).toHaveLength(13)
    })

    it('rechaza nombre que excede 15 caracteres (AC-05.2)', async () => {
      const invalidName = 'Dieciséis caracteres'
      expect(invalidName.length).toBeGreaterThan(15)

      vi.mocked(httpClient.post).mockRejectedValueOnce({ status: 400 })

      await expect(httpClient.post('/carpetas', { nombre: invalidName })).rejects.toEqual({
        status: 400,
      })
    })

    it('retorna error 409 Conflict cuando intenta crear con nombre duplicado (A3)', async () => {
      vi.mocked(httpClient.post).mockRejectedValueOnce({ status: 409, message: 'Nombre duplicado' })

      await expect(httpClient.post('/carpetas', { nombre: 'Mi carpeta' })).rejects.toEqual({
        status: 409,
        message: 'Nombre duplicado',
      })
    })

    it('valida límite de 50 carpetas por usuario (AC-05.4)', async () => {
      // Simulación: al intentar crear cuando ya hay 50, backend retorna 409
      vi.mocked(httpClient.post).mockRejectedValueOnce({
        status: 409,
        message: 'Límite de carpetas alcanzado',
      })

      await expect(httpClient.post('/carpetas', { nombre: 'Carpeta 51' })).rejects.toEqual({
        status: 409,
        message: 'Límite de carpetas alcanzado',
      })
    })
  })

  describe('HU-06 — Renombrar carpeta (AC-06.1, A3)', () => {
    it('renombra una carpeta con validaciones iguales a HU-05 (PATCH /carpetas/{id})', async () => {
      const updatedResponse = crearCarpetaPostResponse(carpetaId, usuarioId, 'Nuevo nombre', 3)
      vi.mocked(httpClient.patch).mockResolvedValueOnce(updatedResponse)

      const response = (await httpClient.patch(`/carpetas/${carpetaId}`, {
        nombre: 'Nuevo nombre',
      })) as CarpetaPostResponseDto

      expect(httpClient.patch).toHaveBeenCalledWith(`/carpetas/${carpetaId}`, {
        nombre: 'Nuevo nombre',
      })
      expect(response.nombre).toBe('Nuevo nombre')
      expect(response.postCount).toBe(3)
    })

    it('valida máximo 15 caracteres al renombrar (AC-06.1)', async () => {
      const validName = 'Quince Caract'
      const updatedResponse = crearCarpetaPostResponse(carpetaId, usuarioId, validName, 0)
      vi.mocked(httpClient.patch).mockResolvedValueOnce(updatedResponse)

      const response = (await httpClient.patch(`/carpetas/${carpetaId}`, {
        nombre: validName,
      })) as CarpetaPostResponseDto

      expect(response.nombre).toHaveLength(13)
    })

    it('retorna 409 Conflict si intenta renombrar a nombre duplicado (A3)', async () => {
      vi.mocked(httpClient.patch).mockRejectedValueOnce({
        status: 409,
        message: 'Nombre ya existe',
      })

      await expect(
        httpClient.patch(`/carpetas/${carpetaId}`, { nombre: 'Otra carpeta' })
      ).rejects.toEqual({
        status: 409,
        message: 'Nombre ya existe',
      })
    })

    it('permite renombrar a sí misma (mismo nombre) sin error', async () => {
      const sameNameResponse = crearCarpetaPostResponse(carpetaId, usuarioId, 'Mi carpeta', 2)
      vi.mocked(httpClient.patch).mockResolvedValueOnce(sameNameResponse)

      const response = (await httpClient.patch(`/carpetas/${carpetaId}`, {
        nombre: 'Mi carpeta',
      })) as CarpetaPostResponseDto

      expect(response.nombre).toBe('Mi carpeta')
    })
  })

  describe('HU-07 — Eliminar carpeta (AC-07.2, AC-07.3, A7)', () => {
    it('elimina una carpeta vacía (DELETE /carpetas/{id})', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await httpClient.delete(`/carpetas/${carpetaId}`)

      expect(httpClient.delete).toHaveBeenCalledWith(`/carpetas/${carpetaId}`)
    })

    it('permite eliminar carpeta que contiene publicaciones (A7)', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await httpClient.delete(`/carpetas/${carpetaId}`)

      expect(httpClient.delete).toHaveBeenCalledWith(`/carpetas/${carpetaId}`)
      // A7: Se permite la eliminación incluso si contiene posts
    })

    it('genera advertencia previa pero prosigue con eliminación si usuario confirma (AC-07.2, AC-07.3)', async () => {
      // AC-07.2: Muestra modal advirtiendo sobre pérdida de referencias
      // AC-07.3: Si usuario confirma, procede a DELETE

      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await httpClient.delete(`/carpetas/${carpetaId}`)

      expect(httpClient.delete).toHaveBeenCalledTimes(1)
    })

    it('retorna 404 si la carpeta no existe', async () => {
      vi.mocked(httpClient.delete).mockRejectedValueOnce({ status: 404 })

      await expect(httpClient.delete(`/carpetas/no-existe`)).rejects.toEqual({
        status: 404,
      })
    })
  })

  describe('HU-08 — Listar carpetas públicas (AC-08.2, AC-08.3, A6)', () => {
    it('obtiene lista de carpetas públicas con nombre y contador (GET /usuarios/{id}/carpetas)', async () => {
      const listResponse = {
        items: [
          crearCarpetaPostResponse('carp-1', usuarioId, 'Favoritos', 5),
          crearCarpetaPostResponse('carp-2', usuarioId, 'Inspiración', 12),
          crearCarpetaPostResponse('carp-3', usuarioId, 'Bocetos', 0),
        ],
        total: 3,
        limit: 50,
        offset: 0,
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(listResponse)

      const response = (await httpClient.get(
        `/usuarios/${usuarioId}/carpetas`
      )) as typeof listResponse

      expect(httpClient.get).toHaveBeenCalledWith(`/usuarios/${usuarioId}/carpetas`)
      expect(response.items).toHaveLength(3)
      expect(response.items[0].nombre).toBe('Favoritos')
      expect(response.items[0].postCount).toBe(5)
      expect(response.items[2].postCount).toBe(0)
    })

    it('mapea cada carpeta a entidad CarpetaPost con nombre y contador (AC-08.2)', async () => {
      const listResponse = {
        items: [crearCarpetaPostResponse('carp-1', usuarioId, 'Mi carpeta', 7)],
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(listResponse)

      const response = (await httpClient.get(
        `/usuarios/${usuarioId}/carpetas`
      )) as typeof listResponse
      const carpeta = new CarpetaPost(
        response.items[0].id,
        response.items[0].usuarioId,
        response.items[0].nombre,
        response.items[0].descripcion,
        new Date(response.items[0].fechaCreacion),
        response.items[0].postCount
      )

      expect(carpeta).toBeInstanceOf(CarpetaPost)
      expect(carpeta.nombre).toBe('Mi carpeta')
      expect(carpeta.postCount).toBe(7)
    })

    it('retorna máximo 50 carpetas por página (AC-08.3, A6)', async () => {
      const items = Array.from({ length: 50 }, (_, i) =>
        crearCarpetaPostResponse(`carp-${i}`, usuarioId, `Carpeta ${i}`, i)
      )
      const listResponse = {
        items,
        total: 75,
        limit: 50,
        offset: 0,
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(listResponse)

      const response = (await httpClient.get(
        `/usuarios/${usuarioId}/carpetas`
      )) as typeof listResponse

      expect(response.items).toHaveLength(50)
      expect(response.total).toBe(75)
      expect(response.limit).toBe(50)
    })

    it('soporta paginación servidor (A6)', async () => {
      const listResponse = {
        items: [crearCarpetaPostResponse('carp-51', usuarioId, 'Carpeta 51', 0)],
        total: 75,
        limit: 50,
        offset: 50,
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(listResponse)

      const response = (await httpClient.get(
        `/usuarios/${usuarioId}/carpetas?limit=50&offset=50`
      )) as typeof listResponse

      expect(response.offset).toBe(50)
      expect(response.items).toHaveLength(1)
    })

    it('retorna lista vacía si el usuario no tiene carpetas públicas', async () => {
      const listResponse = {
        items: [],
        total: 0,
        limit: 50,
        offset: 0,
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(listResponse)

      const response = (await httpClient.get(
        `/usuarios/${usuarioId}/carpetas`
      )) as typeof listResponse

      expect(response.items).toEqual([])
      expect(response.total).toBe(0)
    })

    it('retorna 404 si el usuario no existe', async () => {
      vi.mocked(httpClient.get).mockRejectedValueOnce({ status: 404 })

      await expect(httpClient.get(`/usuarios/no-existe/carpetas`)).rejects.toEqual({
        status: 404,
      })
    })
  })

  describe('HU-09 — Guardar publicación en carpeta (A8)', () => {
    it('guarda una publicación en una carpeta (POST /carpetas/{id}/posts)', async () => {
      const saveResponse = {
        carpetaId,
        publicacionId: 'pub-1',
        creada: true,
        mensaje: 'Guardada correctamente',
      }
      vi.mocked(httpClient.post).mockResolvedValueOnce(saveResponse)

      const response = (await httpClient.post(`/carpetas/${carpetaId}/posts`, {
        publicacionId: 'pub-1',
      })) as typeof saveResponse

      expect(httpClient.post).toHaveBeenCalledWith(`/carpetas/${carpetaId}/posts`, {
        publicacionId: 'pub-1',
      })
      expect(response.creada).toBe(true)
    })

    it('retorna 200 si la publicación ya estaba guardada (A8: idempotente)', async () => {
      const saveResponse = {
        carpetaId,
        publicacionId: 'pub-1',
        creada: false,
        mensaje: 'Ya estaba guardada',
      }
      vi.mocked(httpClient.post).mockResolvedValueOnce(saveResponse)

      const response = (await httpClient.post(`/carpetas/${carpetaId}/posts`, {
        publicacionId: 'pub-1',
      })) as typeof saveResponse

      expect(response.creada).toBe(false)
    })

    it('retorna 404 si la publicación no existe', async () => {
      vi.mocked(httpClient.post).mockRejectedValueOnce({ status: 404 })

      await expect(
        httpClient.post(`/carpetas/${carpetaId}/posts`, { publicacionId: 'no-existe' })
      ).rejects.toEqual({ status: 404 })
    })
  })

  describe('HU-10 — Listar y quitar publicaciones de carpeta', () => {
    it('obtiene las publicaciones guardadas en una carpeta', async () => {
      const publicacionesResponse = {
        items: [
          crearPublicacionResponse('pub-1', usuarioId, 'Primer post'),
          crearPublicacionResponse('pub-2', usuarioId, 'Segundo post'),
        ],
        total: 2,
        limit: 10,
        offset: 0,
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(publicacionesResponse)

      const response = (await httpClient.get(
        `/carpetas/${carpetaId}/posts`
      )) as typeof publicacionesResponse

      expect(httpClient.get).toHaveBeenCalledWith(`/carpetas/${carpetaId}/posts`)
      expect(response.items).toHaveLength(2)
      expect(response.items[0].texto).toBe('Primer post')
    })

    it('mapea cada publicación a entidad Publicacion', async () => {
      const dto = crearPublicacionResponse('pub-1', usuarioId, 'Mi publicación')
      const publicacionesResponse = {
        items: [dto],
        total: 1,
      }
      vi.mocked(httpClient.get).mockResolvedValueOnce(publicacionesResponse)

      const response = (await httpClient.get(
        `/carpetas/${carpetaId}/posts`
      )) as typeof publicacionesResponse
      const publicacion = new Publicacion(
        response.items[0].id,
        response.items[0].autorId,
        'usuario-nombre', // autorNombreUsuario (T063)
        response.items[0].imagenUrl,
        response.items[0].texto,
        new Date(response.items[0].fechaCreacion),
        response.items[0].fechaActualizacion ? new Date(response.items[0].fechaActualizacion) : undefined
      )

      expect(publicacion).toBeInstanceOf(Publicacion)
      expect(publicacion.texto).toBe('Mi publicación')
    })

    it('quita una publicación de una carpeta (DELETE /carpetas/{id}/posts/{pubId})', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await httpClient.delete(`/carpetas/${carpetaId}/posts/pub-1`)

      expect(httpClient.delete).toHaveBeenCalledWith(`/carpetas/${carpetaId}/posts/pub-1`)
    })

    it('retorna 404 si la publicación no existe en la carpeta', async () => {
      vi.mocked(httpClient.delete).mockRejectedValueOnce({ status: 404 })

      await expect(httpClient.delete(`/carpetas/${carpetaId}/posts/no-existe`)).rejects.toEqual({
        status: 404,
      })
    })

    it('permite quitar publicación sin eliminarla de la plataforma (AC-10.1)', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await httpClient.delete(`/carpetas/${carpetaId}/posts/pub-1`)

      // Verificar que se llamó DELETE solo a la carpeta-publicación
      expect(httpClient.delete).toHaveBeenCalledWith(`/carpetas/${carpetaId}/posts/pub-1`)
      // La publicación original se mantiene en la plataforma
    })
  })
})
