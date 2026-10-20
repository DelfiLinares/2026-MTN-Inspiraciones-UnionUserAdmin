import { describe, it, expect } from 'vitest'
import { PaginaResultados } from '../../../src/domain/busqueda/PaginaResultados'
import { PublicacionResumen } from '../../../src/domain/busqueda/PublicacionResumen'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'

/**
 * T011 — PaginaResultados (HU-01, RF-06, RF-20).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,data-model,tasks}.md
 *
 * Reglas:
 * - `hayMas` ⇔ `cursorSiguiente` no nulo.
 * - Los items se conservan en el orden recibido (el frontend no reordena).
 * - `agregar` concatena la página siguiente preservando el orden y descartando
 *   items con id ya presente (único dueño de la deduplicación).
 * - Tras `agregar`, el cursor y `hayMas` son los de la página agregada.
 * - Inmutable.
 */
function publicacion(id: string): PublicacionResumen {
  return new PublicacionResumen({
    id,
    titulo: `Titulo ${id}`,
    autor: { id: `autor-${id}`, nombre: `Autor ${id}` },
    miniaturaUrl: `https://ejemplo.test/${id}.jpg`,
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
  })
}

function ids(pagina: PaginaResultados): string[] {
  return pagina.items.map((item) => item.id)
}

describe('PaginaResultados', () => {
  describe('hayMas y cursor', () => {
    it('hayMas es verdadero cuando hay cursor siguiente', () => {
      const pagina = new PaginaResultados([publicacion('1')], 'cursor-2')

      expect(pagina.cursorSiguiente).toBe('cursor-2')
      expect(pagina.hayMas).toBe(true)
    })

    it('hayMas es falso cuando el cursor es nulo', () => {
      const pagina = new PaginaResultados([publicacion('1')], null)

      expect(pagina.cursorSiguiente).toBeNull()
      expect(pagina.hayMas).toBe(false)
    })

    it('una página vacía sin cursor no tiene más resultados', () => {
      const pagina = new PaginaResultados([], null)

      expect(pagina.estaVacia()).toBe(true)
      expect(pagina.hayMas).toBe(false)
    })

    it('una página vacía puede tener cursor (la API decide)', () => {
      const pagina = new PaginaResultados([], 'cursor-3')

      expect(pagina.estaVacia()).toBe(true)
      expect(pagina.hayMas).toBe(true)
    })
  })

  describe('orden de los items', () => {
    it('conserva el orden recibido', () => {
      const pagina = new PaginaResultados(
        [publicacion('3'), publicacion('1'), publicacion('2')],
        null,
      )

      expect(ids(pagina)).toEqual(['3', '1', '2'])
    })

    it('estaVacia es falso con items', () => {
      expect(new PaginaResultados([publicacion('1')], null).estaVacia()).toBe(false)
    })
  })

  describe('agregar', () => {
    it('concatena la página siguiente al final', () => {
      const primera = new PaginaResultados([publicacion('1'), publicacion('2')], 'c2')
      const segunda = new PaginaResultados([publicacion('3'), publicacion('4')], 'c3')

      const resultado = primera.agregar(segunda)

      expect(ids(resultado)).toEqual(['1', '2', '3', '4'])
    })

    it('preserva el orden de ambas páginas sin reordenar', () => {
      const primera = new PaginaResultados([publicacion('9'), publicacion('5')], 'c2')
      const segunda = new PaginaResultados([publicacion('7'), publicacion('1')], null)

      const resultado = primera.agregar(segunda)

      expect(ids(resultado)).toEqual(['9', '5', '7', '1'])
    })

    it('descarta items de la nueva página cuyo id ya está presente', () => {
      const primera = new PaginaResultados([publicacion('1'), publicacion('2')], 'c2')
      const segunda = new PaginaResultados([publicacion('2'), publicacion('3')], 'c3')

      const resultado = primera.agregar(segunda)

      expect(ids(resultado)).toEqual(['1', '2', '3'])
    })

    it('conserva la primera aparición de un id repetido (no reordena)', () => {
      const primera = new PaginaResultados([publicacion('1'), publicacion('2')], 'c2')
      const repetida = new PaginaResultados([publicacion('1'), publicacion('2')], 'c3')

      const resultado = primera.agregar(repetida)

      expect(ids(resultado)).toEqual(['1', '2'])
    })

    it('descarta repetidos dentro de la misma página agregada', () => {
      const primera = new PaginaResultados([publicacion('1')], 'c2')
      const segunda = new PaginaResultados([publicacion('2'), publicacion('2')], null)

      const resultado = primera.agregar(segunda)

      expect(ids(resultado)).toEqual(['1', '2'])
    })

    it('adopta el cursor y hayMas de la página agregada', () => {
      const primera = new PaginaResultados([publicacion('1')], 'c2')
      const segunda = new PaginaResultados([publicacion('2')], 'c3')

      const resultado = primera.agregar(segunda)

      expect(resultado.cursorSiguiente).toBe('c3')
      expect(resultado.hayMas).toBe(true)
    })

    it('hayMas pasa a falso cuando la página agregada es la última', () => {
      const primera = new PaginaResultados([publicacion('1')], 'c2')
      const ultima = new PaginaResultados([publicacion('2')], null)

      const resultado = primera.agregar(ultima)

      expect(resultado.cursorSiguiente).toBeNull()
      expect(resultado.hayMas).toBe(false)
    })

    it('agregar una página vacía sin cursor conserva los items y marca el fin', () => {
      const primera = new PaginaResultados([publicacion('1')], 'c2')
      const vacia = new PaginaResultados([], null)

      const resultado = primera.agregar(vacia)

      expect(ids(resultado)).toEqual(['1'])
      expect(resultado.hayMas).toBe(false)
    })

    it('agregar sobre una página vacía devuelve los items de la nueva', () => {
      const vacia = new PaginaResultados([], null)
      const nueva = new PaginaResultados([publicacion('1'), publicacion('2')], 'c2')

      const resultado = vacia.agregar(nueva)

      expect(ids(resultado)).toEqual(['1', '2'])
      expect(resultado.cursorSiguiente).toBe('c2')
    })
  })

  describe('inmutabilidad', () => {
    it('agregar devuelve una nueva página y no altera las originales', () => {
      const primera = new PaginaResultados([publicacion('1')], 'c2')
      const segunda = new PaginaResultados([publicacion('2')], null)

      const resultado = primera.agregar(segunda)

      expect(resultado).not.toBe(primera)
      expect(ids(primera)).toEqual(['1'])
      expect(primera.cursorSiguiente).toBe('c2')
      expect(ids(segunda)).toEqual(['2'])
    })

    it('la lista de items expuesta no permite alterar el estado interno', () => {
      const pagina = new PaginaResultados([publicacion('1')], null)

      const expuesta = pagina.items as PublicacionResumen[]
      try {
        expuesta.push(publicacion('2'))
      } catch {
        // Si la lista está congelada, lanzar es un comportamiento válido.
      }

      expect(ids(pagina)).toEqual(['1'])
    })
  })
})
