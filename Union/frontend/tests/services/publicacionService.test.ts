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

    /**
     * T108 — Test de integración: like/unlike en rápida sucesión (CB-02).
     *
     * Fuente de verdad:
     * - Union/specs/001-plataforma-unificada/spec.md (CB-02)
     * - Union/specs/001-plataforma-unificada/tasks.md (T108, depende de T048; complementa T070)
     *
     * Nota de ubicación: la ruta canónica de T108 en tasks.md es
     * `Usuario/my-project/backend_usuario/frontend/tests/services/publicacionService.test.ts`,
     * fuera del alcance permitido (no se debe tocar `Usuario/`). Por instrucción expresa del
     * usuario (misma autorización general aplicada en T102, T107 y siguientes), el test
     * equivalente se agrega aquí, en `Union/.../frontend/tests/services/publicacionService.test.ts`,
     * complementando el test de T070 ya existente ("aborta la petición anterior en vuelo...").
     * No se leyó ni modificó ningún archivo de `Usuario/` ni `Admin/` para esta tarea.
     *
     * Dispara like (clic 1) y, antes de que la primera petición responda, dispara unlike
     * (clic 2, sobre la publicación ya con like optimista); verifica que la primera petición
     * queda cancelada (`AbortSignal.aborted === true`) y que el contador final refleja
     * consistentemente el último estado solicitado (unlike: `cantidadLikes` original,
     * `likeDelUsuarioActual: false`), sin importar en qué orden resuelva la promesa cancelada.
     */
    it(
      'dispara like y unlike en rápida sucesión antes de que la primera responda; ' +
        'el contador final es consistente con el último estado solicitado (CB-02)',
      async () => {
        let signalClic1: AbortSignal | undefined
        let signalClic2: AbortSignal | undefined

        // Clic 1 (like): la petición nunca resuelve por sí sola, solo se cancela vía AbortSignal
        vi.mocked(httpClient.post).mockImplementationOnce(
          (_url: string, _body: unknown, options?: { signal?: AbortSignal }) => {
            signalClic1 = options?.signal
            return new Promise(() => {
              // Intencionalmente no se resuelve: solo debe cancelarse por el clic 2.
            }) as Promise<unknown>
          }
        )

        // Clic 2 (unlike): responde de inmediato con el estado final consistente
        vi.mocked(httpClient.delete).mockImplementationOnce(
          (_url: string, options?: { signal?: AbortSignal }) => {
            signalClic2 = options?.signal
            return Promise.resolve({
              cantidadLikes: publicacionBase.cantidadLikes,
              likeDelUsuarioActual: false,
            })
          }
        )

        // Clic 1: dar like sobre la publicación sin like (queda "en vuelo")
        const promesaClic1 = alternarLike(publicacionBase, usuarioActualId, true)

        // Clic 2 inmediato: quitar like, partiendo del estado optimista ya aplicado por el clic 1
        const publicacionConLikeOptimista = publicacionBase.toggleLike()
        const promesaClic2 = alternarLike(publicacionConLikeOptimista, usuarioActualId, true)

        // La primera petición (like) debe haber sido cancelada por el segundo clic (CB-02)
        expect(signalClic1?.aborted).toBe(true)
        expect(httpClient.delete).toHaveBeenCalledWith(
          '/publicaciones/pub-100/like',
          expect.objectContaining({ signal: signalClic2 })
        )

        // Solo la segunda petición (unlike) determina el estado final
        const resultadoFinal = await promesaClic2
        expect(resultadoFinal.likeDelUsuarioActual).toBe(false)
        expect(resultadoFinal.cantidadLikes).toBe(publicacionBase.cantidadLikes)

        // La promesa del clic 1 (like), al haber sido abortada, nunca resuelve por su cuenta;
        // se verifica que el flujo no depende de su resolución para llegar al estado consistente.
        await Promise.race([
          promesaClic1.catch(() => undefined),
          new Promise((resolve) => setTimeout(resolve, 10)),
        ])
      }
    )
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

    /**
     * T107 — Test de integración: reintento tras pérdida de conexión (CB-01).
     *
     * Fuente de verdad:
     * - Union/specs/001-plataforma-unificada/spec.md (CB-01)
     * - Union/specs/001-plataforma-unificada/tasks.md (T107, depende de T048)
     *
     * Nota de ubicación: la ruta canónica de T107 en tasks.md es
     * `Usuario/my-project/backend_usuario/frontend/tests/services/publicacionService.test.ts`,
     * fuera del alcance permitido (no se debe tocar `Usuario/`). Por instrucción expresa del
     * usuario (misma autorización general aplicada en T102 y siguientes), el test equivalente
     * se agrega aquí, en `Union/.../frontend/tests/services/publicacionService.test.ts`, sobre
     * el `crearPublicacion` ya implementado en T048. No se leyó ni modificó ningún archivo de
     * `Usuario/` ni `Admin/` para esta tarea.
     *
     * Simula un error de red (evento `error` de `XMLHttpRequest`) durante la subida de una
     * publicación y verifica que: (a) los datos originales (`DatosCrearPublicacion`) no se
     * mutan ni se pierden tras el fallo, y (b) reintentar la subida con esos mismos datos
     * intactos permite completar la creación exitosamente.
     */
    it('conserva los datos originales tras un error de red y permite reintentar exitosamente', async () => {
      class XHRSimulado {
        static instancias: XHRSimulado[] = []
        listeners: Record<string, Array<() => void>> = {}
        upload = { addEventListener: vi.fn() }
        status = 0
        responseText = ''
        open = vi.fn()
        send = vi.fn()
        withCredentials = false

        constructor() {
          XHRSimulado.instancias.push(this)
        }

        addEventListener(evento: string, callback: () => void) {
          this.listeners[evento] = this.listeners[evento] ?? []
          this.listeners[evento].push(callback)
        }

        disparar(evento: string) {
          this.listeners[evento]?.forEach((callback) => callback())
        }
      }

      const globalConXHR = globalThis as unknown as { XMLHttpRequest: unknown }
      const originalXHR = globalConXHR.XMLHttpRequest
      globalConXHR.XMLHttpRequest = XHRSimulado as unknown as typeof XMLHttpRequest

      try {
        const archivoOriginal = new Blob(['contenido-imagen'], { type: 'image/png' })
        const datosOriginales = {
          archivo: archivoOriginal,
          tipoContenido: TipoContenido.IMAGEN,
          tags: ['arte', 'digital'],
          titulo: 'Mi obra',
          descripcion: 'Una descripción de prueba',
        }
        // Copia profunda de referencia para comparar que no hubo mutación tras el fallo
        const datosOriginalesSnapshot = { ...datosOriginales, tags: [...datosOriginales.tags] }

        const onProgreso = vi.fn()

        // 1er intento: falla por error de red
        const primerIntento = crearPublicacion(datosOriginales, onProgreso)
        const xhr1 = XHRSimulado.instancias[0]
        xhr1.disparar('error')

        await expect(primerIntento).rejects.toThrow(
          'Error de conexión de red al subir la publicación. Se puede reintentar.'
        )

        // Verificar que los datos originales no se mutaron tras el fallo (CB-01)
        expect(datosOriginales.tipoContenido).toBe(datosOriginalesSnapshot.tipoContenido)
        expect(datosOriginales.titulo).toBe(datosOriginalesSnapshot.titulo)
        expect(datosOriginales.descripcion).toBe(datosOriginalesSnapshot.descripcion)
        expect(datosOriginales.tags).toEqual(datosOriginalesSnapshot.tags)
        expect(datosOriginales.archivo).toBe(archivoOriginal)

        // 2do intento (reintento manual): reutiliza los mismos datos preservados y ahora resuelve con éxito
        const segundoIntento = crearPublicacion(datosOriginales, onProgreso)
        const xhr2 = XHRSimulado.instancias[1]
        xhr2.status = 201
        xhr2.responseText = JSON.stringify({
          id: 'pub-nueva-1',
          autorId: usuarioActualId,
          tipoContenido: TipoContenido.IMAGEN,
          estado: EstadoPublicacion.ACTIVA,
          tags: datosOriginales.tags,
          cantidadLikes: 0,
          likeDelUsuarioActual: false,
          reportadaPorUsuarioActual: false,
        })
        xhr2.disparar('load')

        const resultado = await segundoIntento

        expect(resultado.exito).toBe(true)
        expect(resultado.publicacion.id).toBe('pub-nueva-1')
        expect(resultado.publicacion.tags).toEqual(datosOriginales.tags)
        expect(XHRSimulado.instancias).toHaveLength(2)
      } finally {
        globalConXHR.XMLHttpRequest = originalXHR
      }
    })
  })
})
