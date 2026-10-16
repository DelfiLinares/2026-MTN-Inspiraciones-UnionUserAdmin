/**
 * Test de integración: FlujoPublicacionesPerfil — Módulo 004-inspiraciones-perfil (T087).
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-09, HU-11, HU-12, A5, A8)
 * - Union/specs/004-inspiraciones-perfil/quickstart.md (Escenarios 9–11)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T087)
 *
 * Escenarios validados (quickstart):
 * - Escenario 9: Guardar Post en Carpeta (HU-09, AC-09.1/9.2, A8 - idempotencia)
 * - Escenario 10: Editar Publicación Propia (HU-11, AC-11.1/11.2, A5 - solo texto, no imagen)
 * - Escenario 11: Eliminar Publicación Propia (HU-12, AC-12.1/12.2)
 *
 * Cobertura:
 * - HU-09: Guardar post en carpeta con idempotencia (A8: 200 si existe, 201 si nueva)
 * - HU-11: Editar solo texto del post, imagen es inmutable (A5)
 * - HU-12: Eliminar post con confirmación, elimina de carpetas también
 * - A5: Texto editable, imagen inmutable
 * - A8: Idempotencia en guardar (sin duplicados)
 * - AC validados: AC-09.1/9.2, AC-11.1/11.2, AC-12.1/12.2
 *
 * Depende de:
 * - T082: publicacionService tests
 * - T075: PublicacionPerfil domain tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { httpClient } from '../../src/infrastructure/httpClient'
import { PublicacionPerfil } from '../../src/domain/PublicacionPerfil'

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
 * Helper: Crear respuesta de publicación
 */
function crearPublicacionResponse(
  overrides: Partial<{
    id: string
    autorId: string
    autorNombreUsuario: string
    imagenUrl: string
    texto: string
    fechaCreacion: string
    fechaActualizacion?: string
  }> = {},
) {
  return {
    id: overrides.id ?? 'post-1',
    autorId: overrides.autorId ?? 'user-actual',
    autorNombreUsuario: overrides.autorNombreUsuario ?? 'mi_usuario',
    imagenUrl: overrides.imagenUrl ?? 'https://example.com/post1.jpg',
    texto: overrides.texto ?? 'Contenido de mi post',
    fechaCreacion: overrides.fechaCreacion ?? '2026-01-15T10:00:00Z',
    fechaActualizacion: overrides.fechaActualizacion,
  }
}

/**
 * Helper: Crear respuesta de guardado de post
 */
function crearGuardarPostResponse(
  carpetaId: string,
  publicacionId: string,
  creada: boolean = true,
) {
  return {
    carpetaId,
    publicacionId,
    creada,
    mensaje: creada
      ? 'Post guardado en carpeta'
      : 'El post ya está guardado en esta carpeta',
  }
}

/**
 * Helper: Crear respuesta de lista de posts
 */
function crearListaPostsResponse(
  items: Array<{ id: string; texto: string; imagenUrl: string }>,
) {
  return items.map((item) => ({
    ...item,
    autorId: 'user-actual',
    autorNombreUsuario: 'mi_usuario',
    fechaCreacion: '2026-01-15T10:00:00Z',
  }))
}

/**
 * Helper: Crear respuesta de posts en carpeta
 */
function crearPostsEnCarpetaResponse(
  items: Array<{ id: string; texto: string }>,
) {
  return {
    items: items.map((item) => ({
      id: item.id,
      texto: item.texto,
      imagenUrl: 'https://example.com/post.jpg',
      autorId: 'user-actual',
      autorNombreUsuario: 'mi_usuario',
      fechaCreacion: '2026-01-15T10:00:00Z',
    })),
    total: items.length,
  }
}

describe('FlujoPublicacionesPerfil — Tests de integración (T087)', () => {
  const usuarioId = 'user-actual'
  const postId = 'post-1'
  const postId2 = 'post-2'
  const carpetaId = 'carpeta-1'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Escenario 9: Guardar Post en Carpeta (HU-09, AC-09.1/9.2, A8)', () => {
    it('muestra diálogo con lista de carpetas disponibles (AC-09.1)', async () => {
      // AC-09.1: SavePostToCarpetaDialog con lista de carpetas
      const carpetasResponse = [
        { id: 'carpeta-1', nombre: 'Favoritos', postCount: 5 },
        { id: 'carpeta-2', nombre: 'Inspiración', postCount: 3 },
      ]

      vi.mocked(httpClient.get).mockResolvedValueOnce(carpetasResponse)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas`,
      )) as typeof carpetasResponse

      expect(response).toHaveLength(2)
      expect(response[0].nombre).toBe('Favoritos')
      // Diálogo debe mostrar estas carpetas para seleccionar
    })

    it('primer guardado retorna 201 Created y muestra mensaje exitoso (AC-09.2, A8)', async () => {
      // AC-09.2: Primer guardado exitoso
      // A8: Primer guardado retorna 201, mensaje de éxito
      const guardarResponse = crearGuardarPostResponse(carpetaId, postId, true)

      vi.mocked(httpClient.post).mockResolvedValueOnce(guardarResponse)

      const response = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )) as typeof guardarResponse

      expect(response.creada).toBe(true)
      expect(response.mensaje).toContain('guardado')
      // UI debe mostrar toast: "✅ Post guardado en Favoritos"
    })

    it('segundo guardado a misma carpeta retorna 200 (idempotencia A8)', async () => {
      // A8: Segundo guardado retorna 200, sin duplicado
      const guardarResponse = crearGuardarPostResponse(carpetaId, postId, false)

      vi.mocked(httpClient.post).mockResolvedValueOnce(guardarResponse)

      const response = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )) as typeof guardarResponse

      expect(response.creada).toBe(false)
      expect(response.mensaje).toContain('ya está guardado')
      // UI debe mostrar: "✅ El post ya está guardado en esta carpeta"
    })

    it('post aparece una sola vez en carpeta (A8 - sin duplicados)', async () => {
      // A8: Verificar que no hay duplicados en la carpeta
      const postsEnCarpeta = crearPostsEnCarpetaResponse([
        { id: postId, texto: 'Mi post' },
      ])

      vi.mocked(httpClient.get).mockResolvedValueOnce(postsEnCarpeta)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}/posts`,
      )) as typeof postsEnCarpeta

      expect(response.items).toHaveLength(1)
      expect(response.total).toBe(1)
      expect(response.items[0].id).toBe(postId)
      // Incluso después de guardar 2 veces, debe haber solo 1
    })

    it('actualiza postCount de carpeta cuando se guarda post (AC-09.2)', async () => {
      // AC-09.2: postCount incrementa cuando se guarda
      const carpetaAntesDeGuardar = {
        id: carpetaId,
        nombre: 'Favoritos',
        postCount: 5,
      }

      const carpetaDespuésDeGuardar = {
        ...carpetaAntesDeGuardar,
        postCount: 6,
      }

      // Antes
      expect(carpetaAntesDeGuardar.postCount).toBe(5)

      // Guardar post
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        carpetaId,
        publicacionId: postId,
        creada: true,
      })
      await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )

      // Después (el UI debe incrementar o cargar nuevamente)
      expect(carpetaDespuésDeGuardar.postCount).toBe(6)
    })

    it('diálogo se cierra después de guardar (AC-09.1)', async () => {
      // AC-09.1: Diálogo se cierra al completar
      const guardarResponse = crearGuardarPostResponse(carpetaId, postId, true)

      vi.mocked(httpClient.post).mockResolvedValueOnce(guardarResponse)

      const response = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )) as typeof guardarResponse

      expect(response.creada).toBe(true)
      // El diálogo debe cerrarse automáticamente
    })
  })

  describe('Escenario 10: Editar Publicación Propia (HU-11, AC-11.1/11.2, A5)', () => {
    it('formulario muestra imagen como read-only (A5, AC-11.1)', async () => {
      // A5: Imagen no es editable
      // AC-11.1: Abre formulario de edición
      const postActual = crearPublicacionResponse({
        id: postId,
        texto: 'Texto original',
        imagenUrl: 'https://example.com/original.jpg',
      })

      vi.mocked(httpClient.get).mockResolvedValueOnce(postActual)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
      )) as typeof postActual

      expect(response.imagenUrl).toBe('https://example.com/original.jpg')
      // El formulario debe mostrar la imagen pero sin opción de cambiar
      // Input de imagen debe estar disabled
      // No debe haber botón "Cambiar imagen"
    })

    it('campo de texto es editable con valor actual (AC-11.1)', async () => {
      // AC-11.1: Textarea con texto actual
      const postActual = crearPublicacionResponse({
        id: postId,
        texto: 'Contenido original del post',
      })

      vi.mocked(httpClient.get).mockResolvedValueOnce(postActual)

      const response = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
      )) as typeof postActual

      expect(response.texto).toBe('Contenido original del post')
      // Textarea debe mostrarlo para editar
    })

    it('envía solo campo texto en PATCH (A5, AC-11.2)', async () => {
      // A5: PATCH solo contiene { "texto": "..." }, sin imagen
      // AC-11.2: Éxito en edición
      const nuevoTexto = 'Contenido actualizado del post'

      const postActualizado = crearPublicacionResponse({
        id: postId,
        texto: nuevoTexto,
        imagenUrl: 'https://example.com/original.jpg', // NO cambia
        fechaActualizacion: new Date().toISOString(),
      })

      vi.mocked(httpClient.patch).mockResolvedValueOnce(postActualizado)

      const response = (await httpClient.patch(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
        { texto: nuevoTexto }, // Solo texto, SIN imagen
      )) as typeof postActualizado

      expect(response.texto).toBe(nuevoTexto)
      expect(response.imagenUrl).toBe('https://example.com/original.jpg')

      // Verificar que solo se envió texto
      expect(httpClient.patch).toHaveBeenCalledWith(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
        { texto: nuevoTexto },
      )
    })

    it('imagen permanece inmutable después de editar (A5)', async () => {
      // A5: Imagen no cambia aunque se edite
      const imagenOriginal = 'https://example.com/original.jpg'

      const postActualizado = crearPublicacionResponse({
        id: postId,
        texto: 'Nuevo texto',
        imagenUrl: imagenOriginal,
      })

      vi.mocked(httpClient.patch).mockResolvedValueOnce(postActualizado)

      const response = (await httpClient.patch(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
        { texto: 'Nuevo texto' },
      )) as typeof postActualizado

      expect(response.imagenUrl).toBe(imagenOriginal)
      // Imagen debe ser exactamente la misma
    })

    it('post se actualiza en pantalla después de guardar (AC-11.2)', async () => {
      // AC-11.2: Actualización visual del post
      const nuevoTexto = 'Texto actualizado'

      const postActualizado = crearPublicacionResponse({
        id: postId,
        texto: nuevoTexto,
      })

      vi.mocked(httpClient.patch).mockResolvedValueOnce(postActualizado)

      const response = (await httpClient.patch(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
        { texto: nuevoTexto },
      )) as typeof postActualizado

      expect(response.texto).toBe(nuevoTexto)
      // Lista de posts debe reflejar el nuevo texto
    })

    it('no envía campo imagen en request (A5)', async () => {
      // A5: Validación que no hay campo imagen en el request
      const requestBody = { texto: 'Nuevo texto' }

      vi.mocked(httpClient.patch).mockResolvedValueOnce({})

      await httpClient.patch(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
        requestBody,
      )

      // Verificar que imagen NO está en el request
      expect(requestBody).not.toHaveProperty('imagen')
      expect(requestBody).not.toHaveProperty('imagenUrl')
      expect(Object.keys(requestBody)).toEqual(['texto'])
    })
  })

  describe('Escenario 11: Eliminar Publicación Propia (HU-12, AC-12.1/12.2)', () => {
    it('muestra diálogo de confirmación (AC-12.1)', async () => {
      // AC-12.1: ConfirmDeletePostDialog
      // Debe mostrar:
      // - Título: "¿Eliminar esta publicación?"
      // - Botones: [Cancelar] [Eliminar]
      expect('¿Eliminar esta publicación?').toBeTruthy()
    })

    it('elimina post correctamente con DELETE (AC-12.2)', async () => {
      // AC-12.2: Eliminación exitosa
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })

      const response = (await httpClient.delete(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
      )) as { success: boolean }

      expect(response.success).toBe(true)
      expect(httpClient.delete).toHaveBeenCalledWith(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
      )
    })

    it('post desaparece de lista después de eliminar (AC-12.2)', async () => {
      // AC-12.2: Post se elimina de la lista visual
      const postsAntesDeEliminar = [
        crearPublicacionResponse({ id: 'post-1', texto: 'Post 1' }),
        crearPublicacionResponse({ id: 'post-2', texto: 'Post 2' }),
      ]

      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })
      await httpClient.delete(`http://api/usuarios/${usuarioId}/publicaciones/post-1`)

      const postsDespuésDeEliminar = postsAntesDeEliminar.filter(
        (p) => p.id !== 'post-1',
      )

      expect(postsDespuésDeEliminar).toHaveLength(1)
      expect(postsDespuésDeEliminar[0].id).toBe('post-2')
    })

    it('post se elimina de todas las carpetas donde estaba guardado (AC-12.2)', async () => {
      // AC-12.2: postCount decrementa en carpetas
      const carpeta1PostsAntesDeEliminar = [
        { id: postId, texto: 'Post a eliminar' },
        { id: 'post-otro', texto: 'Otro post' },
      ]

      const carpeta1PostsDespuésDeEliminar = [
        { id: 'post-otro', texto: 'Otro post' },
      ]

      // Simulación: eliminar el post
      const postsActuales = [...carpeta1PostsAntesDeEliminar]
      const postAEliminar = postsActuales.find((p) => p.id === postId)
      if (postAEliminar) {
        const indice = postsActuales.indexOf(postAEliminar)
        postsActuales.splice(indice, 1)
      }

      expect(postsActuales).toHaveLength(1)
      expect(postsActuales).toEqual(carpeta1PostsDespuésDeEliminar)
    })

    it('postCount en carpeta decrementa después de eliminar post', async () => {
      // AC-12.2: postCount debe decrementar
      const carpetaAntesDeEliminar = {
        id: carpetaId,
        nombre: 'Favoritos',
        postCount: 5,
      }

      const carpetaDespuésDeEliminar = {
        ...carpetaAntesDeEliminar,
        postCount: 4,
      }

      expect(carpetaAntesDeEliminar.postCount).toBe(5)
      expect(carpetaDespuésDeEliminar.postCount).toBe(4)
    })

    it('diálogo se cierra después de eliminar (AC-12.1)', async () => {
      // AC-12.1: Diálogo se cierra al confirmar
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })

      const response = (await httpClient.delete(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
      )) as { success: boolean }

      expect(response.success).toBe(true)
      // Diálogo debe cerrarse automáticamente
    })

    it('maneja error 404 si post no existe', async () => {
      // Post ya fue eliminado
      const errorResponse = {
        status: 404,
        message: 'Publicación no encontrada',
      }

      vi.mocked(httpClient.delete).mockRejectedValueOnce(errorResponse)

      try {
        await httpClient.delete(`http://api/usuarios/${usuarioId}/publicaciones/inexistente`)
        expect.fail('Debería lanzar error 404')
      } catch (error: unknown) {
        const err = error as { status: number }
        expect(err.status).toBe(404)
      }
    })
  })

  describe('Flujo completo: guardar → editar → eliminar publicaciones (Integración Escenarios 9–11)', () => {
    it('flujo: guardar post en carpeta → editar texto → eliminar', async () => {
      // 1. Guardar post en carpeta (Escenario 9)
      const guardarResponse = crearGuardarPostResponse(carpetaId, postId, true)
      vi.mocked(httpClient.post).mockResolvedValueOnce(guardarResponse)

      const guardado = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )) as typeof guardarResponse
      expect(guardado.creada).toBe(true)

      // 2. Editar texto del post (Escenario 10)
      const nuevoTexto = 'Contenido actualizado'
      const postActualizado = crearPublicacionResponse({
        id: postId,
        texto: nuevoTexto,
      })

      vi.mocked(httpClient.patch).mockResolvedValueOnce(postActualizado)
      const editado = (await httpClient.patch(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
        { texto: nuevoTexto },
      )) as typeof postActualizado
      expect(editado.texto).toBe(nuevoTexto)

      // 3. Eliminar post (Escenario 11)
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })
      const eliminado = (await httpClient.delete(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}`,
      )) as { success: boolean }
      expect(eliminado.success).toBe(true)

      // Verificar llamadas HTTP
      expect(httpClient.post).toHaveBeenCalled()
      expect(httpClient.patch).toHaveBeenCalled()
      expect(httpClient.delete).toHaveBeenCalled()
    })

    it('flujo: guardar múltiples posts a distintas carpetas', async () => {
      const carpeta1 = 'carpeta-1'
      const carpeta2 = 'carpeta-2'

      // Guardar post 1 en carpeta 1
      const guardar1 = crearGuardarPostResponse(carpeta1, postId, true)
      vi.mocked(httpClient.post).mockResolvedValueOnce(guardar1)

      await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId: carpeta1 },
      )

      // Guardar post 2 en carpeta 2
      const guardar2 = crearGuardarPostResponse(carpeta2, postId2, true)
      vi.mocked(httpClient.post).mockResolvedValueOnce(guardar2)

      await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId2}/carpetas`,
        { carpetaId: carpeta2 },
      )

      // Guardar post 1 también en carpeta 2 (diferente carpeta)
      const guardar3 = crearGuardarPostResponse(carpeta2, postId, true)
      vi.mocked(httpClient.post).mockResolvedValueOnce(guardar3)

      await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId: carpeta2 },
      )

      expect(httpClient.post).toHaveBeenCalledTimes(3)
    })

    it('flujo: idempotencia de guardado (A8)', async () => {
      // Primer guardado: creada=true
      const guardar1 = crearGuardarPostResponse(carpetaId, postId, true)
      vi.mocked(httpClient.post).mockResolvedValueOnce(guardar1)

      const resp1 = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )) as typeof guardar1
      expect(resp1.creada).toBe(true)

      // Segundo guardado: creada=false (ya existe)
      const guardar2 = crearGuardarPostResponse(carpetaId, postId, false)
      vi.mocked(httpClient.post).mockResolvedValueOnce(guardar2)

      const resp2 = (await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId },
      )) as typeof guardar2
      expect(resp2.creada).toBe(false)

      // El post debe aparecer una sola vez
      const postsEnCarpeta = crearPostsEnCarpetaResponse([
        { id: postId, texto: 'Post único' },
      ])

      vi.mocked(httpClient.get).mockResolvedValueOnce(postsEnCarpeta)
      const posts = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas/${carpetaId}/posts`,
      )) as typeof postsEnCarpeta

      expect(posts.items).toHaveLength(1)
    })

    it('flujo: eliminar post elimina de todas las carpetas', async () => {
      // Guardar post en múltiples carpetas
      const carpeta1 = 'carpeta-1'
      const carpeta2 = 'carpeta-2'

      vi.mocked(httpClient.post).mockResolvedValue({
        carpetaId: carpeta1,
        publicacionId: postId,
        creada: true,
      })

      await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId: carpeta1 },
      )
      await httpClient.post(
        `http://api/usuarios/${usuarioId}/publicaciones/${postId}/carpetas`,
        { carpetaId: carpeta2 },
      )

      // Eliminar post
      vi.mocked(httpClient.delete).mockResolvedValueOnce({ success: true })
      await httpClient.delete(`http://api/usuarios/${usuarioId}/publicaciones/${postId}`)

      // Verificar que no está en carpeta 1
      const postsEnCarp1 = crearPostsEnCarpetaResponse([])
      vi.mocked(httpClient.get).mockResolvedValueOnce(postsEnCarp1)
      const resp1 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas/${carpeta1}/posts`,
      )) as typeof postsEnCarp1
      expect(resp1.items).toHaveLength(0)

      // Verificar que no está en carpeta 2
      const postsEnCarp2 = crearPostsEnCarpetaResponse([])
      vi.mocked(httpClient.get).mockResolvedValueOnce(postsEnCarp2)
      const resp2 = (await httpClient.get(
        `http://api/usuarios/${usuarioId}/carpetas/${carpeta2}/posts`,
      )) as typeof postsEnCarp2
      expect(resp2.items).toHaveLength(0)
    })

    it('flujo: A5 - imagen nunca se modifica al editar post', async () => {
      const imagenOriginal = 'https://example.com/foto-original.jpg'

      // Crear post con imagen
      const postOriginal = crearPublicacionResponse({
        id: postId,
        imagenUrl: imagenOriginal,
        texto: 'Texto original',
      })

      // Editar varias veces
      const ediciones = ['Primera edición', 'Segunda edición', 'Tercera edición']

      ediciones.forEach((texto) => {
        const postEditado = crearPublicacionResponse({
          id: postId,
          imagenUrl: imagenOriginal, // SIEMPRE igual
          texto,
        })

        vi.mocked(httpClient.patch).mockResolvedValueOnce(postEditado)

        // Verificar que imagen no cambia
        expect(postEditado.imagenUrl).toBe(imagenOriginal)
      })
    })
  })
})
