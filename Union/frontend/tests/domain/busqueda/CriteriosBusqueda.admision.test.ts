import { describe, it, expect } from 'vitest'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { RangoDistancia } from '../../../src/domain/enums/RangoDistancia'
import { OrigenFeed } from '../../../src/domain/enums/OrigenFeed'

/**
 * T069 — Tests de admisión de criterios (RF-21, RF-22, RF-23; A-02; Clarifications de texto).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,data-model,tasks}.md
 *
 * Reglas:
 * - `admiteFiltro(tipo, contexto)`: DISTANCIA solo con ubicación concedida; el resto siempre.
 * - Sin ubicación, DISTANCIA no puede agregarse al criterio.
 * - Texto de 1 carácter: no es buscable y `origen()` es FYP (con o sin filtros activos).
 */
describe('CriteriosBusqueda — admisión de filtros (admiteFiltro)', () => {
  const sinUbicacion = { ubicacionConcedida: false }
  const conUbicacion = { ubicacionConcedida: true }

  it('DISTANCIA no se admite sin ubicación concedida', () => {
    expect(CriteriosBusqueda.vacio().admiteFiltro(TipoFiltro.DISTANCIA, sinUbicacion)).toBe(false)
  })

  it('DISTANCIA se admite con ubicación concedida', () => {
    expect(CriteriosBusqueda.vacio().admiteFiltro(TipoFiltro.DISTANCIA, conUbicacion)).toBe(true)
  })

  it.each([TipoFiltro.ESTILO, TipoFiltro.TECNICA, TipoFiltro.TIPO_ARTE, TipoFiltro.TIPO_CONTENIDO])(
    '%s se admite con y sin ubicación',
    (tipo) => {
      const criterios = CriteriosBusqueda.vacio()
      expect(criterios.admiteFiltro(tipo, sinUbicacion)).toBe(true)
      expect(criterios.admiteFiltro(tipo, conUbicacion)).toBe(true)
    },
  )

  it('conFiltro rechaza DISTANCIA sin ubicación y no modifica el criterio', () => {
    const distancia25 = new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.KM_25)
    expect(() => CriteriosBusqueda.vacio().conFiltro(distancia25, sinUbicacion)).toThrow()
  })

  it('conFiltro acepta DISTANCIA con ubicación concedida', () => {
    const distancia25 = new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.KM_25)
    const criterios = CriteriosBusqueda.vacio().conFiltro(distancia25, conUbicacion)
    expect(criterios.filtros).toHaveLength(1)
  })

  it('conFiltro acepta filtros de contenido sin ubicación', () => {
    const contenido = new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, TipoContenido.IMAGEN)
    const criterios = CriteriosBusqueda.vacio().conFiltro(contenido, sinUbicacion)
    expect(criterios.filtros).toHaveLength(1)
  })
})

describe('CriteriosBusqueda — texto de 1 carácter', () => {
  it('con 1 carácter no es buscable y el origen es FYP', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('a')
    expect(criterios.esBuscable()).toBe(false)
    expect(criterios.origen()).toBe(OrigenFeed.FYP)
  })

  it('con 1 carácter rodeado de espacios sigue siendo FYP (se evalúa normalizado)', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('   a   ')
    expect(criterios.esBuscable()).toBe(false)
    expect(criterios.origen()).toBe(OrigenFeed.FYP)
  })

  it('con 1 carácter y filtros activos el origen sigue siendo FYP', () => {
    const oleo = new FiltroActivo(TipoFiltro.TECNICA, 'oleo')
    const criterios = CriteriosBusqueda.vacio().conFiltro(oleo).conTexto('a')
    expect(criterios.esBuscable()).toBe(false)
    expect(criterios.origen()).toBe(OrigenFeed.FYP)
  })

  it('con 2 caracteres es buscable y el origen es BUSQUEDA', () => {
    const criterios = CriteriosBusqueda.vacio().conTexto('ab')
    expect(criterios.esBuscable()).toBe(true)
    expect(criterios.origen()).toBe(OrigenFeed.BUSQUEDA)
  })
})
