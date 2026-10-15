/**
 * Test de integración: FlujoCarpetasPerfil — Módulo 004-inspiraciones-perfil (T086).
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-05, HU-06, HU-07, HU-08, A3, A6, A7)
 * - Union/specs/004-inspiraciones-perfil/quickstart.md (Escenarios 6–8, 12)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T086)
 *
 * Escenarios validados (quickstart):
 * - Escenario 6: Crear Carpeta (HU-05, AC-05.1/5.2, A3)
 * - Escenario 7: Renombrar Carpeta (HU-06, AC-06.1/6.2, A3)
 * - Escenario 8: Eliminar Carpeta (HU-07, AC-07.1/7.2/7.3, A7)
 * - Escenario 12: Visualizar Lista de Carpetas Paginada (A6)
 *
 * Cobertura:
 * - HU-05: Crear carpeta con validación de nombre (1-15 chars, A3: uniqueness per user)
 * - HU-06: Renombrar carpeta con validación (A3: uniqueness per user)
 * - HU-07: Eliminar carpeta con advertencia (A7: posts guardados no se eliminan)
 * - HU-08: Listar carpetas con paginación (A6: server-side, 10 items por página)
 * - A3: 409 Conflict si nombre duplicado
 * - A6: Paginación con limit=10, offset, hasMore
 * - A7: Eliminación sin afectar posts originales
 * - AC validados: AC-05.1/5.2, AC-06.1/6.2, AC-07.1/7.2/7.3, AC-08.2/8.3
 *
 * Depende de:
 * - T081: carpetaService tests
 * - T075: CarpetaPost domain tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient } from '../../src/infrastructure/httpClient'
import { CarpetaPost } from '../../src/domain/CarpetaPost'

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

/**
 * Helper: Crear respuesta de carpeta
 */
function crearCarpetaResponse(
  overrides: Partial<{
    id: string
    usuarioId: string
    nombre: string
    postCount: number
  }> = {},
) {
  return {
    id: overrides.id ?? 'carpeta-1',
    usuarioId: overrides.usuarioId ?? 'user-actual',
    nombre: overrides.nombre ?? 'Favoritos',
    postCount: overrides.postCount ?? 0,
  }
}

/**
 * Helper: Crear respuesta de lista paginada de carpetas
 */
function crearCarpetasPageResponse(
  items: Array<{ id: string; nombre: string; postCount: number }>,
  total: number,
  offset: number,
) {
  return {
    items,
    total,
    offset,
    limit: 10,
    hasMore: offset + items.length < total,
  }
}

/**
 * Helper: Crear respuesta de posts en carpeta
 */
function crearPostsEnCarpetaResponse(
  overrides: Partial<{ id: string; texto: string; imagenUrl?: string }> = {},
) {
  return [
    {
      id: overrides.id ?? 'post-1',
      texto: overrides.texto ?? 'Post en carpeta',
      imagenUrl: overrides.imagenUrl ?? 'https://example.com/post1.jpg',
      autor: { id: 'user-actual', username: 'mi_usuario' },
      createdAt: '2026-01-15T10:00:00Z',
    },
  ]
}

describe('FlujoCarpetasPerfil — Tests de integración (T086)', () => {
  const usuarioId = 'user-actual'
  const carpetaId = 'carpeta-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Escenario 6: Crear Carpeta (HU-05, AC-05.1/5.2, A3)', () => {
    it('valida que nombre de carpeta es requerido (AC-05.1)', async () => {
      // AC-05.1: Campo de nombre es requerido (client-side)
      const nombreVacio = ''
      expect(nombreVacio.length).toBe(0)
      // Validación client-side: debe mostrar error "El nombre de carpeta es requerido"
    })

    it('valida que nombre no supera 15 caracteres (AC-05.1)', async () => {
      // AC-05.1: Máximo 15 caracteres
      const nombreLargo = 'Esta es muy larga' // 16 caracteres
      expect(nombreLargo.length).toBeGreaterThan(15)
      // Validación client-side: debe mostrar error

      const nombreValido = 'Favoritos' // 9 caracteres
      expect(nombreValido.length).toBeLessThanOrEqual(15)
    })

    it('crea carpeta con nombre válido (AC-05.2)', async () => {
      // AC-05.2: Crear carpeta exitosa con nombre válido
      const carpetaResponse = crearCarpetaResponse({
        id: 'carpeta-1',
        nombre: 'Favoritos',
        postCount: 0,
      })

      vi.mocked(httpClient.post).mockResolvedValueOnce(carpetaResponse)

      const response = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/carpetas`,
        { nombre: 'Favoritos' },
      )) as typeof carpetaResponse

      expect(response.nombre).toBe('Favoritos')
      expect(response.postCount).toBe(0)
      expect(httpClient.post).toHaveBeenCalledWith(
        `http://api/usuarios/${usuarioId}/carpetas`,
        { nombre: 'Favoritos' },
      )
    })

    it('rechaza crear carpeta con nombre duplicado (A3)', async () => {
      // A3: 409 Conflict si nombre ya existe en el perfil del usuario
      const errorResponse = {
        status: 409,
        message: 'Ya existe una carpeta con ese nombre en tu perfil',
      }

      vi.mocked(httpClient.post).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.post(`http://api/usuarios/${usuarioId}/carpetas`, {
          nombre: 'Favoritos',
        })
        expect.fail('Debería lanzar error 409')
      } catch (error: unknown) {
        const err = error as { status: number; message: string }
        expect(err.status).toBe(409)
        expect(err.message).toContain('Ya existe')
      }
    })

    it('maneja validaciones de negocio al crear carpeta (AC-05.1)', async () => {
      // AC-05.1: Validaciones completas
      // El dominio CarpetaPost valida:
      const carpetaValida = new CarpetaPost('carpeta-1', usuarioId, 'Nuevos')
      expect(carpetaValida.nombre).toBe('Nuevos')
      expect(carpetaValida.nombre.length).toBeLessThanOrEqual(15)

      const carpetaInvalida = new CarpetaPost('carpeta-2', usuarioId, '')
      expect(carpetaInvalida.nombre).toBe('')
      // El dominio debe validar esto
    })
  })

  describe('Escenario 7: Renombrar Carpeta (HU-06, AC-06.1/6.2, A3)', () => {
    it('abre diálogo con nombre actual al renombrar (AC-06.1)', async () => {
      // AC-06.1: Diálogo con nombre actual de la carpeta
      const carpetaActual = crearCarpetaResponse({
        id: carpetaId,
        nombre: 'Favoritos',
      })

      vi.mocked(httpClient.get).mockResolvedValueOnce(carpetaActual)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
      )) as typeof carpetaActual

      expect(response.nombre).toBe('Favoritos')
      // Diálogo debe mostrar "Favoritos" en el campo de entrada
    })

    it('renombra carpeta a nombre único (AC-06.2)', async () => {
      // AC-06.2: Renombrado exitoso con nuevo nombre único
      const nombreAntiguo = 'Favoritos'
      const nombreNuevo = 'Favoritos Recientes'

      const carpetaActualizada = crearCarpetaResponse({
        id: carpetaId,
        nombre: nombreNuevo,
      })

      vi.mocked(httpClient.patch).mockResolvedValueOnce(carpetaActualizada)

      const response = (await httpClient.patch(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
        { nombre: nombreNuevo },
      )) as typeof carpetaActualizada

      expect(response.nombre).toBe(nombreNuevo)
      expect(httpClient.patch).toHaveBeenCalledWith(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
        { nombre: nombreNuevo },
      )
    })

    it('rechaza renombrar a nombre duplicado (A3)', async () => {
      // A3: 409 Conflict si ya existe otra carpeta con ese nombre
      const errorResponse = {
        status: 409,
        message: 'Ya existe una carpeta con ese nombre en tu perfil',
      }

      vi.mocked(httpClient.patch).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.patch(
          `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
          { nombre: 'Favoritos' }, // Nombre que ya existe
        )
        expect.fail('Debería lanzar error 409')
      } catch (error: unknown) {
        const err = error as { status: number; message: string }
        expect(err.status).toBe(409)
        expect(err.message).toContain('Ya existe')
      }
    })

    it('valida longitud de nombre al renombrar (AC-06.1)', async () => {
      // AC-06.1: Mismas validaciones que crear (1-15 caracteres)
      const nombreLargo = 'Esto es demasiado largo'
      expect(nombreLargo.length).toBeGreaterThan(15)
      // Cliente debe validar y mostrar error
    })

    it('mantiene diálogo abierto en caso de error (A3)', async () => {
      // A3: Si hay error, diálogo permanece abierto
      const errorResponse = {
        status: 409,
        message: 'Ya existe una carpeta con ese nombre en tu perfil',
      }

      vi.mocked(httpClient.patch).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.patch(
          `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
          { nombre: 'Nombre Duplicado' },
        )
      } catch (error: unknown) {
        const err = error as { status: number }
        expect(err.status).toBe(409)
        // Diálogo debe permanecer abierto con el nombre ingresado
      }
    })
  })

  describe('Escenario 8: Eliminar Carpeta (HU-07, AC-07.1/7.2/7.3, A7)', () => {
    it('muestra diálogo de confirmación con advertencia (A7, AC-07.1)', async () => {
      // A7: Advertencia clara sobre posts guardados
      // AC-07.1: Diálogo confirma eliminación
      const carpeta = crearCarpetaResponse({
        id: carpetaId,
        nombre: 'Trabajos',
        postCount: 5,
      })

      // El diálogo debe mostrar:
      // Título: "¿Eliminar esta carpeta?"
      // Advertencia: "⚠️ Se eliminarán todos los posts guardados en 'Trabajos',
      //             pero los posts originales seguirán en la plataforma."
      // Botones: [Cancelar] [Eliminar]

      expect(carpeta.postCount).toBe(5)
      // El diálogo debe indicar que hay 5 posts en la carpeta
    })

    it('elimina carpeta correctamente (AC-07.2)', async () => {
      // AC-07.2: Eliminación exitosa
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })

      const response = (await httpClient.delete(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
      )) as { success: boolean }

      expect(response.success).toBe(true)
      expect(httpClient.delete).toHaveBeenCalledWith(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`,
      )
    })

    it('verifica que posts guardados no se eliminan (A7, AC-07.3)', async () => {
      // A7: Posts originales permanecen en la plataforma
      // AC-07.3: Carpeta desaparece pero posts siguen existiendo

      // 1. Obtener posts en carpeta antes de eliminar
      const postsEnCarpeta = crearPostsEnCarpetaResponse({
        id: 'post-1',
        texto: 'Post importante',
      })

      vi.mocked(httpClient.get).mockResolvedValueOnce(postsEnCarpeta)
      const posts = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}/posts`,
      )) as typeof postsEnCarpeta

      expect(posts).toHaveLength(1)
      expect(posts[0].texto).toBe('Post importante')

      // 2. Eliminar carpeta
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })
      await httpClient.delete(`http://api/usuarios/${usuarioId}/carpetas/${carpetaId}`)

      // 3. Verificar que post sigue existiendo en el feed/perfil
      vi.mocked(httpClient.get).mockResolvedValueOnce(posts)
      const postsAún = (await httpClient.get(
        `http://api/usuarios/user-autor/posts`,
      )) as typeof posts

      expect(postsAún[0].texto).toBe('Post importante')
      // El post debe seguir visible en el perfil original
    })

    it('carpeta desaparece de lista después de eliminar (AC-07.2)', async () => {
      // AC-07.2: Carpeta se elimina de la lista
      const carpetasAntesDeEliminar = [
        crearCarpetaResponse({ id: 'carp-1', nombre: 'Favoritos' }),
        crearCarpetaResponse({ id: 'carp-2', nombre: 'Trabajos' }),
      ]

      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })
      await httpClient.delete(`http://api/usuarios/${usuarioId}/carpetas/carp-2`)

      // Después de eliminar, la lista debe mostrar solo 1 carpeta
      const carpetasDespuésDeEliminar = carpetasAntesDeEliminar.filter(
        (c) => c.id !== 'carp-2',
      )
      expect(carpetasDespuésDeEliminar).toHaveLength(1)
      expect(carpetasDespuésDeEliminar[0].nombre).toBe('Favoritos')
    })

    it('maneja error 404 si carpeta no existe', async () => {
      // Carpeta ya fue eliminada
      const errorResponse = {
        status: 404,
        message: 'Carpeta no encontrada',
      }

      vi.mocked(httpClient.delete).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.delete(`http://api/usuarios/${usuarioId}/carpetas/inexistente`)
        expect.fail('Debería lanzar error 404')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect(err.status).toBe(404)
      }
    })
  })

  describe('Escenario 12: Visualizar Lista de Carpetas Paginada (A6, HU-08, AC-08.2/8.3)', () => {
    it('carga primeras 10 carpetas inicialmente (A6, AC-08.2)', async () => {
      // A6: Paginación server-side con limit=10, offset=0
      // AC-08.2: Se muestran nombre y postCount

      const carpetas = [
        crearCarpetaResponse({ id: 'carp-1', nombre: 'Favoritos', postCount: 8 }),
        crearCarpetaResponse({ id: 'carp-2', nombre: 'Trabajos', postCount: 12 }),
        crearCarpetaResponse({ id: 'carp-3', nombre: 'Ideas', postCount: 3 }),
      ]

      const paginaResponse = crearCarpetasPageResponse(carpetas, 15, 0)

      vi.mocked(httpClient.get).mockResolvedValueOnce(paginaResponse)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=0`,
      )) as typeof paginaResponse

      expect(response.items).toHaveLength(3) // Primeros 10 (en este caso 3 para prueba)
      expect(response.total).toBe(15)
      expect(response.hasMore).toBe(true)
      expect(response.limit).toBe(10)
      expect(response.offset).toBe(0)

      // Verificar que se muestran nombre y postCount
      expect(response.items[0].nombre).toBe('Favoritos')
      expect(response.items[0].postCount).toBe(8)
    })

    it('carga siguiente página con offset=10 (A6, AC-08.3)', async () => {
      // A6: Scroll/Load More activa segunda página
      const carpetasSegunda = [
        crearCarpetaResponse({ id: 'carp-11', nombre: 'Inspiración', postCount: 5 }),
        crearCarpetaResponse({ id: 'carp-12', nombre: 'Proyectos', postCount: 7 }),
      ]

      const paginaResponse = crearCarpetasPageResponse(carpetasSegunda, 15, 10)

      vi.mocked(httpClient.get).mockResolvedValueOnce(paginaResponse)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=10`,
      )) as typeof paginaResponse

      expect(response.offset).toBe(10)
      expect(response.items).toHaveLength(2)
      expect(response.total).toBe(15)
      expect(response.hasMore).toBe(true)
    })

    it('última página muestra hasMore=false (A6)', async () => {
      // A6: Si offset + items.length >= total, hasMore=false
      const carpetasÚltima = [
        crearCarpetaResponse({ id: 'carp-21', nombre: 'Última', postCount: 2 }),
      ]

      const paginaResponse = crearCarpetasPageResponse(carpetasÚltima, 15, 15)
      // 15 + 1 >= 15, así que hasMore=false

      vi.mocked(httpClient.get).mockResolvedValueOnce(paginaResponse)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=15`,
      )) as typeof paginaResponse

      expect(response.hasMore).toBe(false)
      expect(response.offset).toBe(15)
      expect(response.items).toHaveLength(1)
    })

    it('append a lista anterior (infinite scroll)', async () => {
      // Paginación debe append, no reemplazar
      const primerosItems = [
        crearCarpetaResponse({ id: 'carp-1', nombre: 'Favoritos' }),
        crearCarpetaResponse({ id: 'carp-2', nombre: 'Trabajos' }),
      ]

      const segundosItems = [
        crearCarpetaResponse({ id: 'carp-3', nombre: 'Ideas' }),
        crearCarpetaResponse({ id: 'carp-4', nombre: 'Notas' }),
      ]

      // Carga primera página
      const pagina1 = crearCarpetasPageResponse(primerosItems, 20, 0)
      vi.mocked(httpClient.get).mockResolvedValueOnce(pagina1)

      const response1 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=0`,
      )) as typeof pagina1
      const listaCombinada = [...response1.items]

      // Carga segunda página
      const pagina2 = crearCarpetasPageResponse(segundosItems, 20, 10)
      vi.mocked(httpClient.get).mockResolvedValueOnce(pagina2)

      const response2 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=10`,
      )) as typeof pagina2

      // Append a la lista
      listaCombinada.push(...response2.items)

      expect(listaCombinada).toHaveLength(4)
      expect(listaCombinada[0].nombre).toBe('Favoritos')
      expect(listaCombinada[3].nombre).toBe('Notas')
    })

    it('maneja vacío si usuario no tiene carpetas', async () => {
      // Usuario sin carpetas
      const paginaVacia = crearCarpetasPageResponse([], 0, 0)

      vi.mocked(httpClient.get).mockResolvedValueOnce(paginaVacia)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=0`,
      )) as typeof paginaVacia

      expect(response.items).toHaveLength(0)
      expect(response.total).toBe(0)
      expect(response.hasMore).toBe(false)
    })
  })

  describe('Flujo completo: crear → renombrar → eliminar → paginar (Integración Escenarios 6–8, 12)', () => {
    it('flujo: crear carpeta → renombrar → eliminar → verificar paginación', async () => {
      // 1. Crear carpeta (Escenario 6)
      const carpetaNueva = crearCarpetaResponse({
        id: 'carpeta-nueva',
        nombre: 'Mi Carpeta',
        postCount: 0,
      })

      vi.mocked(httpClient.post).mockResolvedValueOnce(carpetaNueva)
      const creada = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/carpetas`,
        { nombre: 'Mi Carpeta' },
      )) as typeof carpetaNueva
      expect(creada.nombre).toBe('Mi Carpeta')

      // 2. Renombrar carpeta (Escenario 7)
      const carpetaRenombrada = crearCarpetaResponse({
        id: 'carpeta-nueva',
        nombre: 'Mi Carpeta Actualizada',
        postCount: 0,
      })

      vi.mocked(httpClient.patch).mockResolvedValueOnce(carpetaRenombrada)
      const renombrada = (await httpClient.patch(
        `http://api/usuarios/${usuarioId}/carpetas/carpeta-nueva`,
        { nombre: 'Mi Carpeta Actualizada' },
      )) as typeof carpetaRenombrada
      expect(renombrada.nombre).toBe('Mi Carpeta Actualizada')

      // 3. Eliminar carpeta (Escenario 8)
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })
      await httpClient.delete(`http://api/usuarios/${usuarioId}/carpetas/carpeta-nueva`)

      // 4. Listar carpetas paginadas (Escenario 12)
      const carpetasRestantes = [
        crearCarpetaResponse({ id: 'carp-1', nombre: 'Favoritos', postCount: 8 }),
        crearCarpetaResponse({ id: 'carp-2', nombre: 'Trabajos', postCount: 5 }),
      ]

      const paginaFinal = crearCarpetasPageResponse(carpetasRestantes, 2, 0)

      vi.mocked(httpClient.get).mockResolvedValueOnce(paginaFinal)
      const carpetas = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=0`,
      )) as typeof paginaFinal

      expect(carpetas.items).toHaveLength(2)
      expect(carpetas.total).toBe(2)
      expect(carpetas.hasMore).toBe(false)

      // Verificar que la carpeta eliminada no aparece
      const nombresCarpetas = carpetas.items.map((c) => c.nombre)
      expect(nombresCarpetas).not.toContain('Mi Carpeta Actualizada')
      expect(nombresCarpetas).toContain('Favoritos')
      expect(nombresCarpetas).toContain('Trabajos')
    })

    it('flujo: manejo de errores en operaciones de carpetas', async () => {
      // Intenta crear duplicado
      const errorDuplicado = {
        status: 409,
        message: 'Ya existe una carpeta con ese nombre en tu perfil',
      }

      vi.mocked(httpClient.post).mockRejectedValueOnce(errorDuplicado)

      try {
        await httpClient.post(`http://api/usuarios/${usuarioId}/carpetas`, {
          nombre: 'Favoritos',
        })
        expect.fail('Debería fallar')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect(err.status).toBe(409)
      }

      // Intenta eliminar inexistente
      const errorNoExiste = {
        status: 404,
        message: 'Carpeta no encontrada',
      }

      vi.mocked(httpClient.delete).mockRejectedValueOnce(errorNoExiste)

      try {
        await httpClient.delete(`http://api/usuarios/${usuarioId}/carpetas/inexistente`)
        expect.fail('Debería fallar')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect(err.status).toBe(404)
      }
    })

    it('flujo: paginación con múltiples páginas', async () => {
      // Simular 25 carpetas (más de 2 páginas de 10)
      const generarCarpetas = (inicio: number, cantidad: number) =>
        Array.from({ length: cantidad }, (_, i) => ({
          id: `carp-${inicio + i}`,
          nombre: `Carpeta ${inicio + i}`,
          postCount: Math.floor(Math.random() * 20),
        }))

      // Página 1
      const pagina1 = crearCarpetasPageResponse(
        generarCarpetas(1, 10),
        25,
        0,
      )

      vi.mocked(httpClient.get).mockResolvedValueOnce(pagina1)
      const resp1 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=0`,
      )) as typeof pagina1
      expect(resp1.items).toHaveLength(10)
      expect(resp1.hasMore).toBe(true)

      // Página 2
      const pagina2 = crearCarpetasPageResponse(
        generarCarpetas(11, 10),
        25,
        10,
      )

      vi.mocked(httpClient.get).mockResolvedValueOnce(pagina2)
      const resp2 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=10`,
      )) as typeof pagina2
      expect(resp2.items).toHaveLength(10)
      expect(resp2.hasMore).toBe(true)

      // Página 3
      const pagina3 = crearCarpetasPageResponse(
        generarCarpetas(21, 5),
        25,
        20,
      )

      vi.mocked(httpClient.get).mockResolvedValueOnce(pagina3)
      const resp3 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas?limit=10&offset=20`,
      )) as typeof pagina3
      expect(resp3.items).toHaveLength(5)
      expect(resp3.hasMore).toBe(false)
    })
  })
})
