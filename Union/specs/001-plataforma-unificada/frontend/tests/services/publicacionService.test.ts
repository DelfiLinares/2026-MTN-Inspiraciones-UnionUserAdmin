import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  alternarLike,
  reportarPublicacion,
  consultarEstadoReporteMio,
  crearPublicacion,
} from '../../src/services/publicacionService'
import { httpClient, ApiError } from '../../src/infrastructure/httpClient'
import { Publicacion } from '../../src/domain/Publicacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'

vi.mock('../../src/infrastructure/httpClient', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    httpClient: {
      post: vi.fn(),
      get: vi.fn(),
      delete: vi.fn(),
    },
  }
})

describe('publicacionService (T070)', () => {
  const usuarioActualId = 'usr-visitante-1'
  const autorAjenoId = 'usr-autor-2'

  const publicacionBase = new Publicacion({
    id: 'pub-100',
    autorId: autorAjenoId,
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    tags: ['arte', 'digital'],
    cantidadLikes: 10,
    likeDelUsuarioActual: false,
    reportadaPorUsuarioActual: false,
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('alternarLike & Reversión (AC-01.3, CB-02)', () => {
    it('incrementa optimistamente los likes y llama a POST /publicaciones/{id}/like', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({
        cantidadLikes: 11,
        likeDelUsuarioActual: true,
      })

      const res = await alternarLike(publicacionBase, usuarioActualId, true)

      expect(httpClient.post).toHaveBeenCalledWith(
        '/publicaciones/pub-100/like',
        undefined,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(res.cantidadLikes).toBe(11)
      expect(res.likeDelUsuarioActual).toBe(true)
    })

    it('decrementa optimistamente los likes cuando ya le dio like y llama a DELETE /publicaciones/{id}/like', async () => {
      const publicacionConLike = new Publicacion({
        ...publicacionBase,
        cantidadLikes: 11,
        likeDelUsuarioActual: true,
      })

      vi.mocked(httpClient.delete).mockResolvedValueOnce({
        cantidadLikes: 10,
        likeDelUsuarioActual: false,
      })

      const res = await alternarLike(publicacionConLike, usuarioActualId, true)

      expect(httpClient.delete).toHaveBeenCalledWith(
        '/publicaciones/pub-100/like',
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      )
      expect(res.cantidadLikes).toBe(10)
      expect(res.likeDelUsuarioActual).toBe(false)
    })

    it('restringe dar like a una publicación propia arrojando error de negocio', async () => {
      const publicacionPropia = new Publicacion({
        ...publicacionBase,
        autorId: usuarioActualId,
      })

      await expect(alternarLike(publicacionPropia, usuarioActualId, true)).rejects.toThrow(
        'No se puede dar like a una publicación propia o con sesión no autorizada.'
      )
      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('restringe dar like a un usuario no autenticado', async () => {
      await expect(alternarLike(publicacionBase, usuarioActualId, false)).rejects.toThrow(
        'No se puede dar like a una publicación propia o con sesión no autorizada.'
      )
      expect(httpClient.post).not.toHaveBeenCalled()
    })

    it('reverte la acción lanzando error cuando la API responde con fallo (AC-01.3)', async () => {
      const apiError = new ApiError('Error de servidor', 500, {})
      vi.mocked(httpClient.post).mockRejectedValueOnce(apiError)

      await expect(alternarLike(publicacionBase, usuarioActualId, true)).rejects.toThrow(apiError)
    })

    it('aborta la petición anterior en vuelo si se realizan clics rápidos consecutivos (CB-02)', async () => {
      let resolverPeticion1: (val: unknown) => void = () => {}
      const promesaLenta = new Promise((res) => {
        resolverPeticion1 = res
      })

      let signalPeticion1: AbortSignal | undefined

      vi.mocked(httpClient.post).mockImplementationOnce((_url: string, _body: unknown, options?: { signal?: AbortSignal }) => {
        signalPeticion1 = options?.signal
        return promesaLenta as Promise<unknown>
      })
      vi.mocked(httpClient.delete).mockResolvedValueOnce({
        cantidadLikes: 10,
        likeDelUsuarioActual: false,
      })

      // Clic 1: dar like (petición lenta en vuelo)
      const promesaClic1 = alternarLike(publicacionBase, usuarioActualId, true)

      expect(signalPeticion1?.aborted).toBe(false)

      // Clic 2 inmediato: quitar like (cancela la primera petición vía AbortSignal)
      const publicacionLikeadaOptimista = publicacionBase.toggleLike()
      const promesaClic2 = alternarLike(publicacionLikeadaOptimista, usuarioActualId, true)

      // El signal de la primera petición fue marcado como aborted
      expect(signalPeticion1?.aborted).toBe(true)

      resolverPeticion1({ cantidadLikes: 11, likeDelUsuarioActual: true })

      const resFinal = await promesaClic2
      expect(resFinal.likeDelUsuarioActual).toBe(false)
      expect(resFinal.cantidadLikes).toBe(10)
    })
  })

  describe('reportarPublicacion & Estado Reporte', () => {
    it('envía el reporte si no es autor y no la reportó previamente', async () => {
      vi.mocked(httpClient.post).mockResolvedValueOnce({ id: 'rep-1', estado: 'PENDIENTE' })

      const res = await reportarPublicacion(publicacionBase, usuarioActualId, 'MOTIVO_CONTENIDO_INAPROPIADO')

      expect(httpClient.post).toHaveBeenCalledWith('/publicaciones/pub-100/reportes', {
        motivoCodigo: 'MOTIVO_CONTENIDO_INAPROPIADO',
      })
      expect(res.id).toBe('rep-1')
    })

    it('rechaza reportar la publicación propia', async () => {
      const publicacionPropia = new Publicacion({ ...publicacionBase, autorId: usuarioActualId })

      await expect(
        reportarPublicacion(publicacionPropia, usuarioActualId, 'MOTIVO_SPAM')
      ).rejects.toThrow('No se puede reportar una publicación propia o ya reportada.')
    })

    it('consultarEstadoReporteMio devuelve true si el usuario la reportó', async () => {
      vi.mocked(httpClient.get).mockResolvedValueOnce({ reportado: true })

      const reportado = await consultarEstadoReporteMio('pub-100')

      expect(httpClient.get).toHaveBeenCalledWith('/publicaciones/pub-100/reportes/mio')
      expect(reportado).toBe(true)
    })

    it('consultarEstadoReporteMio devuelve false si la API responde error o no reportado', async () => {
      vi.mocked(httpClient.get).mockRejectedValueOnce(new Error('404 Not Found'))

      const reportado = await consultarEstadoReporteMio('pub-100')

      expect(reportado).toBe(false)
    })
  })

  describe('crearPublicacion (CB-01)', () => {
    it('exige adjuntar un archivo para crear la publicación', async () => {
      await expect(
        crearPublicacion({
          archivo: null as unknown as File,
          tipoContenido: TipoContenido.IMAGEN,
        })
      ).rejects.toThrow('Debe adjuntar un archivo para crear la publicación.')
    })
  })
})
