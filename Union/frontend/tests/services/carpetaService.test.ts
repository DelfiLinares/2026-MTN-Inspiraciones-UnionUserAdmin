/**
 * Tests de `carpetaService` (T073).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-48 a RF-53, RF-52, CB-03, AC-09.6)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md
 *   (`GET /usuarios/{id}/carpetas`, `POST /carpetas`, `PATCH/DELETE /carpetas/{id}`,
 *   `POST/DELETE /carpetas/{id}/posts`)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T073, depende de T061)
 *
 * Verifica:
 * - Caso crítico RF-52 / AC-09.6: al alcanzar 100 carpetas se impide crear una adicional.
 * - CB-03: la acción de guardar en carpeta está bloqueada mientras la lista de carpetas
 *   está cargando, y también si no hay carpeta seleccionada.
 * - CRUD de carpetas delegado estrictamente al backend (obtener, crear, renombrar, eliminar,
 *   guardar/quitar publicaciones de carpeta).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  LIMITE_MAXIMO_CARPETAS,
  puedeCrearNuevaCarpeta,
  puedeGuardarEnCarpeta,
  obtenerCarpetas,
  crearCarpeta,
  renombrarCarpeta,
  eliminarCarpeta,
  guardarPostEnCarpeta,
  quitarPostDeCarpeta,
} from '../../src/services/carpetaService'
import { httpClient } from '../../src/infrastructure/httpClient'
import { Carpeta } from '../../src/domain/Carpeta'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClient: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('carpetaService (T073)', () => {
  const usuarioId = 'usr-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('puedeCrearNuevaCarpeta (límite de 100, RF-52 / AC-09.6)', () => {
    it('permite crear una nueva carpeta cuando la cantidad actual es menor al límite', () => {
      expect(puedeCrearNuevaCarpeta(0)).toBe(true)
      expect(puedeCrearNuevaCarpeta(LIMITE_MAXIMO_CARPETAS - 1)).toBe(true)
    })

    it('caso crítico: impide crear una carpeta adicional al alcanzar exactamente el límite de 100', () => {
      expect(puedeCrearNuevaCarpeta(LIMITE_MAXIMO_CARPETAS)).toBe(false)
    })

    it('impide crear si la cantidad actual supera el límite (estado inconsistente defensivo)', () => {
      expect(puedeCrearNuevaCarpeta(LIMITE_MAXIMO_CARPETAS + 1)).toBe(false)
    })
  })

  describe('crearCarpeta con validación de límite en cliente (RF-52)', () => {
    it('rechaza la creación sin llamar a la API cuando ya se alcanzó el límite de 100 carpetas', async () => {
      await expect(
        crearCarpeta('Nueva carpeta', LIMITE_MAXIMO_CARPETAS)
      ).rejects.toThrow(/límite máximo de 100 carpetas/i)

      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('rechaza la creación si el nombre está vacío, sin llamar a la API', async () => {
      await expect(crearCarpeta('   ', 5)).rejects.toThrow(/nombre de la carpeta es obligatorio/i)
      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('crea la carpeta invocando POST /carpetas cuando está por debajo del límite', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        id: 'carp-nueva',
        nombre: 'Bocetos',
        cantidadPosts: 0,
      })

      const carpeta = await crearCarpeta('Bocetos', 5)

      expect(httpClient.post).toHaveBeenCalledWith('/carpetas', { nombre: 'Bocetos' }, undefined)
      expect(carpeta).toBeInstanceOf(Carpeta)
      expect(carpeta.id).toBe('carp-nueva')
      expect(carpeta.nombre).toBe('Bocetos')
    })

    it('no valida el límite en cliente si no se provee la cantidad actual (delegado al backend)', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        id: 'carp-x',
        nombre: 'Sin límite local',
        cantidadPosts: 0,
      })

      await expect(crearCarpeta('Sin límite local')).resolves.toBeInstanceOf(Carpeta)
      expect(httpClient.post).toHaveBeenCalledTimes(1)
    })
  })

  describe('puedeGuardarEnCarpeta (CB-03: bloqueo mientras carga la lista de carpetas)', () => {
    it('bloquea el guardado mientras la lista de carpetas está cargando, aunque haya carpeta seleccionada', () => {
      expect(puedeGuardarEnCarpeta(true, 'carp-1')).toBe(false)
    })

    it('bloquea el guardado si no hay ninguna carpeta seleccionada', () => {
      expect(puedeGuardarEnCarpeta(false, null)).toBe(false)
      expect(puedeGuardarEnCarpeta(false, undefined)).toBe(false)
      expect(puedeGuardarEnCarpeta(false, '')).toBe(false)
      expect(puedeGuardarEnCarpeta(false, '   ')).toBe(false)
    })

    it('permite el guardado cuando ya terminó de cargar y hay una carpeta seleccionada', () => {
      expect(puedeGuardarEnCarpeta(false, 'carp-1')).toBe(true)
    })
  })

  describe('obtenerCarpetas (GET /usuarios/{id}/carpetas, RF-53)', () => {
    it('mapea la respuesta en formato { items } a entidades Carpeta', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({
        items: [
          { id: 'c1', nombre: 'Favoritos', cantidadPosts: 3 },
          { id: 'c2', nombre: 'Inspiración', cantidadPosts: 0 },
        ],
      })

      const carpetas = await obtenerCarpetas(usuarioId)

      expect(httpClient.get).toHaveBeenCalledWith(
        `/usuarios/${usuarioId}/carpetas`,
        undefined
      )
      expect(carpetas).toHaveLength(2)
      expect(carpetas[0]).toBeInstanceOf(Carpeta)
      expect(carpetas[0].nombre).toBe('Favoritos')
      expect(carpetas[1].cantidadPosts).toBe(0)
    })

    it('mapea la respuesta cuando la API retorna un arreglo plano', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce([
        { id: 'c3', nombre: 'Bocetos', cantidadPosts: 1 },
      ])

      const carpetas = await obtenerCarpetas(usuarioId)

      expect(carpetas).toHaveLength(1)
      expect(carpetas[0].id).toBe('c3')
    })

    it('retorna arreglo vacío si la respuesta no contiene items válidos', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({})

      const carpetas = await obtenerCarpetas(usuarioId)

      expect(carpetas).toEqual([])
    })
  })

  describe('renombrarCarpeta (PATCH /carpetas/{id}, RF-48)', () => {
    it('invoca PATCH con el nombre saneado', async () => {
      vi.mocked(httpClient.patch).mockResolvedValueOnce(undefined)

      await renombrarCarpeta('carp-1', '  Nuevo nombre  ')

      expect(httpClient.patch).toHaveBeenCalledWith(
        '/carpetas/carp-1',
        { nombre: 'Nuevo nombre' },
        undefined
      )
    })

    it('rechaza el renombrado si el nuevo nombre está vacío, sin llamar a la API', async () => {
      await expect(renombrarCarpeta('carp-1', '   ')).rejects.toThrow(
        /nombre de la carpeta no puede estar vacío/i
      )
      expect(httpClient.patch).not.toHaveBeenCalled()
    })
  })

  describe('eliminarCarpeta (DELETE /carpetas/{id}, RF-50)', () => {
    it('invoca DELETE /carpetas/{id}', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await eliminarCarpeta('carp-1')

      expect(httpClient.delete).toHaveBeenCalledWith('/carpetas/carp-1', undefined)
    })
  })

  describe('guardarPostEnCarpeta / quitarPostDeCarpeta (RF-49, RF-51)', () => {
    it('guarda una publicación en la carpeta indicada', async () => {
      vi.mocked(httpClient.put).mockResolvedValueOnce(undefined)

      await guardarPostEnCarpeta('carp-1', 'pub-9')

      expect(httpClient.put).toHaveBeenCalledWith(
        '/carpetas/carp-1/publicaciones/pub-9',
        undefined,
        undefined
      )
    })

    it('quita una publicación de la carpeta indicada', async () => {
      vi.mocked(httpClient.delete).mockResolvedValueOnce(undefined)

      await quitarPostDeCarpeta('carp-1', 'pub-9')

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/carpetas/carp-1/publicaciones/pub-9',
        undefined
      )
    })
  })
})
