import { describe, expect, it } from 'vitest'
import { Publicacion } from '../../src/domain/Publicacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'

/**
 * Tests unitarios de dominio para Publicacion.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/tasks.md (T026)
 * - Union/specs/001-plataforma-unificada/data-model.md (Entidad Publicacion)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-30 a RF-35)
 *
 * Casos requeridos por T026:
 * - no puede dar like a publicación propia
 * - no puede reportar publicación propia
 * - no puede dar like sin autenticar
 * - no puede reportar dos veces
 * - toggleLike() invierte estado y ajusta contador
 */

function crearPublicacion(
  overrides: Partial<ConstructorParameters<typeof Publicacion>[0]> = {},
): Publicacion {
  return new Publicacion({
    id: 'pub-1',
    autorId: 'autor-1',
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    tags: ['arte', 'digital'],
    cantidadLikes: 10,
    likeDelUsuarioActual: false,
    reportadaPorUsuarioActual: false,
    ...overrides,
  })
}

describe('Publicacion — tests de dominio (T026)', () => {
  describe('puedeDarLike', () => {
    it('retorna false si el usuario intenta dar like a su propia publicación', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })

      expect(publicacion.puedeDarLike('autor-1', true)).toBe(false)
    })

    it('retorna false si el usuario no está autenticado', () => {
      const publicacion = crearPublicacion({ autorId: 'autor-1' })

      expect(publicacion.puedeDarLike('usuario-2', false)).toBe(false)
      expect(publicacion.puedeDarLike('', true)).toBe(false)
    })

    it('retorna true si la publicación no es propia, está autenticado y la publicación está ACTIVA', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        estado: EstadoPublicacion.ACTIVA,
      })

      expect(publicacion.puedeDarLike('usuario-2', true)).toBe(true)
    })
  })

  describe('puedeReportar', () => {
    it('retorna false si el usuario intenta reportar su propia publicación', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        reportadaPorUsuarioActual: false,
      })

      expect(publicacion.puedeReportar('autor-1', true)).toBe(false)
    })

    it('retorna false si no está autenticado', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        reportadaPorUsuarioActual: false,
      })

      expect(publicacion.puedeReportar('usuario-2', false)).toBe(false)
      expect(publicacion.puedeReportar('', true)).toBe(false)
    })

    it('retorna false si ya fue reportada por el usuario actual (no puede reportar dos veces)', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        reportadaPorUsuarioActual: true,
      })

      expect(publicacion.puedeReportar('usuario-2', true)).toBe(false)
    })

    it('retorna true si no es propia, está autenticado y no fue reportada previamente por el usuario actual', () => {
      const publicacion = crearPublicacion({
        autorId: 'autor-1',
        reportadaPorUsuarioActual: false,
      })

      expect(publicacion.puedeReportar('usuario-2', true)).toBe(true)
    })
  })

  describe('toggleLike', () => {
    it('invierte estado de like a true e incrementa el contador de likes', () => {
      const publicacion = crearPublicacion({
        cantidadLikes: 5,
        likeDelUsuarioActual: false,
      })

      const resultado = publicacion.toggleLike()

      expect(resultado.likeDelUsuarioActual).toBe(true)
      expect(resultado.cantidadLikes).toBe(6)
    })

    it('invierte estado de like a false y decrementa el contador de likes', () => {
      const publicacion = crearPublicacion({
        cantidadLikes: 6,
        likeDelUsuarioActual: true,
      })

      const resultado = publicacion.toggleLike()

      expect(resultado.likeDelUsuarioActual).toBe(false)
      expect(resultado.cantidadLikes).toBe(5)
    })

    it('no muta la instancia original al aplicar toggleLike', () => {
      const publicacion = crearPublicacion({
        cantidadLikes: 5,
        likeDelUsuarioActual: false,
      })

      publicacion.toggleLike()

      expect(publicacion.likeDelUsuarioActual).toBe(false)
      expect(publicacion.cantidadLikes).toBe(5)
    })
  })
})
