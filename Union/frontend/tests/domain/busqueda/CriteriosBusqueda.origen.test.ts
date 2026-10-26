import { describe, it, expect } from 'vitest'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { OrigenFeed } from '../../../src/domain/enums/OrigenFeed'

/**
 * T008 — `origen()` y `esBuscable()` (HU-01, HU-02, RF-05, RF-23).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,data-model,tasks}.md
 *
 * Reglas:
 * - Texto vacío (o solo espacios) → FYP.
 * - Texto de 1 carácter → no es buscable; se muestra FYP (clarify: texto de 1 carácter).
 * - Texto de 2 o más caracteres (ya normalizado) → BUSQUEDA.
 * - El mínimo se evalúa sobre el texto normalizado.
 */
describe('CriteriosBusqueda — origen() y esBuscable()', () => {
  describe('esBuscable()', () => {
    it('es falso con texto vacío', () => {
      expect(CriteriosBusqueda.vacio().esBuscable()).toBe(false)
    })

    it('es falso con texto solo de espacios', () => {
      expect(CriteriosBusqueda.vacio().conTexto('     ').esBuscable()).toBe(false)
    })

    it('es falso con 1 carácter', () => {
      expect(CriteriosBusqueda.vacio().conTexto('a').esBuscable()).toBe(false)
    })

    it('es falso con 1 carácter rodeado de espacios (se evalúa normalizado)', () => {
      expect(CriteriosBusqueda.vacio().conTexto('   a   ').esBuscable()).toBe(false)
    })

    it('es verdadero con exactamente 2 caracteres', () => {
      expect(CriteriosBusqueda.vacio().conTexto('ab').esBuscable()).toBe(true)
    })

    it('es verdadero con más de 2 caracteres', () => {
      expect(CriteriosBusqueda.vacio().conTexto('acuarela').esBuscable()).toBe(true)
    })

    it('cuenta los espacios internos tras normalizar (a b = 3 caracteres)', () => {
      expect(CriteriosBusqueda.vacio().conTexto('a    b').esBuscable()).toBe(true)
    })
  })

  describe('esTextoIncompleto()', () => {
    it('es falso con texto vacío o solo espacios', () => {
      expect(CriteriosBusqueda.vacio().esTextoIncompleto()).toBe(false)
      expect(CriteriosBusqueda.vacio().conTexto('   ').esTextoIncompleto()).toBe(false)
    })

    it('es verdadero con 1 carácter (se evalúa normalizado)', () => {
      expect(CriteriosBusqueda.vacio().conTexto('a').esTextoIncompleto()).toBe(true)
      expect(CriteriosBusqueda.vacio().conTexto('   a   ').esTextoIncompleto()).toBe(true)
    })

    it('es falso con 2 o más caracteres', () => {
      expect(CriteriosBusqueda.vacio().conTexto('ab').esTextoIncompleto()).toBe(false)
    })
  })

  describe('origen()', () => {
    it('es FYP con criterios vacíos', () => {
      expect(CriteriosBusqueda.vacio().origen()).toBe(OrigenFeed.FYP)
    })

    it('es FYP con texto solo de espacios', () => {
      expect(CriteriosBusqueda.vacio().conTexto('      ').origen()).toBe(OrigenFeed.FYP)
    })

    it('es FYP con 1 carácter (no se dispara búsqueda)', () => {
      expect(CriteriosBusqueda.vacio().conTexto('x').origen()).toBe(OrigenFeed.FYP)
    })

    it('es BUSQUEDA con 2 caracteres', () => {
      expect(CriteriosBusqueda.vacio().conTexto('oi').origen()).toBe(OrigenFeed.BUSQUEDA)
    })

    it('es BUSQUEDA con texto de varias palabras', () => {
      expect(CriteriosBusqueda.vacio().conTexto('  paisaje   al óleo ').origen()).toBe(
        OrigenFeed.BUSQUEDA,
      )
    })

    it('vuelve a FYP al borrar el texto', () => {
      const conTexto = CriteriosBusqueda.vacio().conTexto('acuarela')
      expect(conTexto.origen()).toBe(OrigenFeed.BUSQUEDA)

      const sinTexto = conTexto.limpiarTexto()

      expect(sinTexto.origen()).toBe(OrigenFeed.FYP)
    })

    it('es coherente con esBuscable(): BUSQUEDA si y solo si es buscable', () => {
      const casos = ['', ' ', 'a', 'ab', 'abc', '  a  ', '  ab  ']

      for (const texto of casos) {
        const criterios = CriteriosBusqueda.vacio().conTexto(texto)
        const esperado = criterios.esBuscable() ? OrigenFeed.BUSQUEDA : OrigenFeed.FYP
        expect(criterios.origen()).toBe(esperado)
      }
    })
  })
})
