import { describe, it, expect } from 'vitest'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { RangoDistancia } from '../../../src/domain/enums/RangoDistancia'

/**
 * T010 — Invariantes de FiltroActivo y regla de DISTANCIA (RF-21, RF-22).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,data-model,tasks}.md
 *
 * Reglas:
 * - El valor de un filtro no puede ser vacío.
 * - DISTANCIA solo acepta rangos cerrados (5, 25, 100 km); CUALQUIERA equivale a no filtrar,
 *   por lo que no se puede crear como filtro activo.
 * - TIPO_CONTENIDO solo acepta valores de `TipoContenido`.
 * - DISTANCIA solo puede aplicarse si hay ubicación concedida; sin ella se rechaza y no
 *   se agrega al criterio (A-02: hoy la ubicación está diferida al backend, por lo que el
 *   filtro permanece deshabilitado, pero la regla del dominio sigue vigente).
 * - Igualdad por (tipo, valor).
 */
describe('FiltroActivo — invariantes', () => {
  describe('valor vacío', () => {
    it.each([TipoFiltro.ESTILO, TipoFiltro.TECNICA, TipoFiltro.TIPO_ARTE])(
      'rechaza un valor vacío para %s',
      (tipo) => {
        expect(() => new FiltroActivo(tipo, '')).toThrow()
      },
    )

    it('rechaza un valor solo de espacios', () => {
      expect(() => new FiltroActivo(TipoFiltro.ESTILO, '   ')).toThrow()
    })

    it('acepta un valor válido de catálogo', () => {
      const filtro = new FiltroActivo(TipoFiltro.ESTILO, 'impresionismo')

      expect(filtro.tipo).toBe(TipoFiltro.ESTILO)
      expect(filtro.valor).toBe('impresionismo')
    })
  })

  describe('TIPO_CONTENIDO', () => {
    it.each(Object.values(TipoContenido))('acepta el valor %s de TipoContenido', (valor) => {
      const filtro = new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, valor)

      expect(filtro.valor).toBe(valor)
    })

    it('rechaza un valor que no pertenece a TipoContenido', () => {
      expect(() => new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, 'PINTURA')).toThrow()
    })

    it('rechaza un valor vacío', () => {
      expect(() => new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, '')).toThrow()
    })

    it('distingue mayúsculas: el valor debe coincidir exactamente con el enum', () => {
      expect(() => new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, 'imagen')).toThrow()
    })
  })

  describe('DISTANCIA — rangos', () => {
    it.each([RangoDistancia.KM_5, RangoDistancia.KM_25, RangoDistancia.KM_100])(
      'acepta el rango cerrado %s',
      (rango) => {
        const filtro = new FiltroActivo(TipoFiltro.DISTANCIA, rango)

        expect(filtro.tipo).toBe(TipoFiltro.DISTANCIA)
        expect(filtro.valor).toBe(rango)
      },
    )

    it('CUALQUIERA equivale a no filtrar: no se puede crear como filtro activo', () => {
      expect(() => new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.CUALQUIERA)).toThrow()
    })

    it('rechaza un valor que no es un rango cerrado', () => {
      expect(() => new FiltroActivo(TipoFiltro.DISTANCIA, '50')).toThrow()
      expect(() => new FiltroActivo(TipoFiltro.DISTANCIA, 'cerca')).toThrow()
    })

    it('rechaza un valor vacío', () => {
      expect(() => new FiltroActivo(TipoFiltro.DISTANCIA, '')).toThrow()
    })
  })

  describe('igualdad por (tipo, valor)', () => {
    it('dos filtros con el mismo tipo y valor son iguales', () => {
      const a = new FiltroActivo(TipoFiltro.TECNICA, 'oleo')
      const b = new FiltroActivo(TipoFiltro.TECNICA, 'oleo')

      expect(a.equals(b)).toBe(true)
    })

    it('el mismo valor con distinto tipo no es igual', () => {
      const a = new FiltroActivo(TipoFiltro.TECNICA, 'oleo')
      const b = new FiltroActivo(TipoFiltro.ESTILO, 'oleo')

      expect(a.equals(b)).toBe(false)
    })

    it('el mismo tipo con distinto valor no es igual', () => {
      const a = new FiltroActivo(TipoFiltro.TECNICA, 'oleo')
      const b = new FiltroActivo(TipoFiltro.TECNICA, 'acuarela')

      expect(a.equals(b)).toBe(false)
    })
  })
})

describe('CriteriosBusqueda — regla de ubicación para DISTANCIA', () => {
  const distancia25 = new FiltroActivo(TipoFiltro.DISTANCIA, RangoDistancia.KM_25)
  const sinUbicacion = { ubicacionConcedida: false }
  const conUbicacion = { ubicacionConcedida: true }

  describe('admiteFiltro(tipo, contexto)', () => {
    it('DISTANCIA no se admite sin ubicación concedida', () => {
      const criterios = CriteriosBusqueda.vacio()

      expect(criterios.admiteFiltro(TipoFiltro.DISTANCIA, sinUbicacion)).toBe(false)
    })

    it('DISTANCIA se admite con ubicación concedida', () => {
      const criterios = CriteriosBusqueda.vacio()

      expect(criterios.admiteFiltro(TipoFiltro.DISTANCIA, conUbicacion)).toBe(true)
    })

    it.each([
      TipoFiltro.ESTILO,
      TipoFiltro.TECNICA,
      TipoFiltro.TIPO_ARTE,
      TipoFiltro.TIPO_CONTENIDO,
    ])('%s se admite independientemente de la ubicación', (tipo) => {
      const criterios = CriteriosBusqueda.vacio()

      expect(criterios.admiteFiltro(tipo, sinUbicacion)).toBe(true)
      expect(criterios.admiteFiltro(tipo, conUbicacion)).toBe(true)
    })
  })

  describe('conFiltro(filtro, contexto)', () => {
    it('rechaza agregar DISTANCIA sin ubicación y no modifica los criterios', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(
        new FiltroActivo(TipoFiltro.ESTILO, 'impresionismo'),
        sinUbicacion,
      )

      expect(() => criterios.conFiltro(distancia25, sinUbicacion)).toThrow()
      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([])
      expect(criterios.filtros).toHaveLength(1)
    })

    it('agrega DISTANCIA con ubicación concedida', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(distancia25, conUbicacion)

      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([RangoDistancia.KM_25])
    })

    it('los demás filtros se pueden agregar sin ubicación', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(
        new FiltroActivo(TipoFiltro.TECNICA, 'oleo'),
        sinUbicacion,
      )

      expect(criterios.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
    })
  })
})
