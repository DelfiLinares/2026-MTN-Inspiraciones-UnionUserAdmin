import { describe, it, expect } from 'vitest'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'

/**
 * T009 — Combinación, quitar y limpiar filtros (HU-03, RF-12–14, RF-22).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,data-model,tasks}.md
 *
 * Reglas:
 * - Dentro de un mismo TipoFiltro, los valores se combinan con OR (selección múltiple).
 * - Entre tipos distintos, y con el texto, se combinan con AND.
 * - No se admiten filtros duplicados.
 * - Se puede quitar un filtro individual, todos los de un tipo, o limpiar todos a la vez.
 * - Quitar o limpiar filtros no altera el texto, y limpiar el texto no altera los filtros.
 * - CriteriosBusqueda es inmutable.
 *
 * DISTANCIA (regla de ubicación) se prueba en T010, no aquí.
 */
describe('CriteriosBusqueda — combinación y limpieza de filtros', () => {
  const impresionismo = new FiltroActivo(TipoFiltro.ESTILO, 'impresionismo')
  const surrealismo = new FiltroActivo(TipoFiltro.ESTILO, 'surrealismo')
  const oleo = new FiltroActivo(TipoFiltro.TECNICA, 'oleo')
  const pintura = new FiltroActivo(TipoFiltro.TIPO_ARTE, 'pintura')
  const imagen = new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, TipoContenido.IMAGEN)

  describe('agregar filtros', () => {
    it('parte sin filtros activos', () => {
      const criterios = CriteriosBusqueda.vacio()

      expect(criterios.filtros).toHaveLength(0)
    })

    it('agrega un filtro', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(impresionismo)

      expect(criterios.filtros).toHaveLength(1)
      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['impresionismo'])
    })

    it('un criterio con filtros pero sin texto no es vacío', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(oleo)

      expect(criterios.esVacio()).toBe(false)
    })

    it('no admite el mismo filtro duplicado', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(impresionismo)
        .conFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'impresionismo'))

      expect(criterios.filtros).toHaveLength(1)
    })
  })

  describe('combinación OR dentro de un mismo tipo', () => {
    it('acumula varios valores del mismo tipo', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(impresionismo).conFiltro(surrealismo)

      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['impresionismo', 'surrealismo'])
    })

    it('conserva el orden de selección dentro del tipo', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(surrealismo).conFiltro(impresionismo)

      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['surrealismo', 'impresionismo'])
    })

    it('valoresDe devuelve lista vacía si el tipo no tiene filtros', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(impresionismo)

      expect(criterios.valoresDe(TipoFiltro.TECNICA)).toEqual([])
    })
  })

  describe('combinación AND entre tipos y con el texto', () => {
    it('mantiene por separado los valores de cada tipo', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(impresionismo)
        .conFiltro(oleo)
        .conFiltro(pintura)
        .conFiltro(imagen)

      expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['impresionismo'])
      expect(criterios.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
      expect(criterios.valoresDe(TipoFiltro.TIPO_ARTE)).toEqual(['pintura'])
      expect(criterios.valoresDe(TipoFiltro.TIPO_CONTENIDO)).toEqual([TipoContenido.IMAGEN])
      expect(criterios.filtros).toHaveLength(4)
    })

    it('lista los tipos con filtros activos sin repetir', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(impresionismo)
        .conFiltro(surrealismo)
        .conFiltro(oleo)

      expect(criterios.tiposActivos()).toEqual([TipoFiltro.ESTILO, TipoFiltro.TECNICA])
    })

    it('combina filtros con el texto sin que se afecten entre sí', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('  paisaje  ').conFiltro(oleo)

      expect(criterios.texto).toBe('paisaje')
      expect(criterios.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
    })

    it('el orden en que se aplican filtros y texto no cambia el resultado', () => {
      const a = CriteriosBusqueda.vacio().conTexto('paisaje').conFiltro(oleo).conFiltro(impresionismo)
      const b = CriteriosBusqueda.vacio().conFiltro(impresionismo).conFiltro(oleo).conTexto('paisaje')

      expect(a.equivale(b)).toBe(true)
    })

    it('el orden entre tipos distintos no importa para la equivalencia', () => {
      const a = CriteriosBusqueda.vacio().conFiltro(oleo).conFiltro(pintura)
      const b = CriteriosBusqueda.vacio().conFiltro(pintura).conFiltro(oleo)

      expect(a.equivale(b)).toBe(true)
    })

    it('criterios con distintos filtros no son equivalentes', () => {
      const a = CriteriosBusqueda.vacio().conFiltro(impresionismo)
      const b = CriteriosBusqueda.vacio().conFiltro(surrealismo)

      expect(a.equivale(b)).toBe(false)
    })
  })

  describe('quitar filtros', () => {
    it('quita un filtro individual y conserva los demás', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(impresionismo)
        .conFiltro(surrealismo)
        .conFiltro(oleo)

      const resultado = criterios.sinFiltro(impresionismo)

      expect(resultado.valoresDe(TipoFiltro.ESTILO)).toEqual(['surrealismo'])
      expect(resultado.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
    })

    it('quitar un filtro que no está activo no cambia nada', () => {
      const criterios = CriteriosBusqueda.vacio().conFiltro(impresionismo)

      const resultado = criterios.sinFiltro(oleo)

      expect(resultado.equivale(criterios)).toBe(true)
    })

    it('quita todos los filtros de un tipo y conserva los otros tipos', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(impresionismo)
        .conFiltro(surrealismo)
        .conFiltro(oleo)

      const resultado = criterios.sinFiltrosDeTipo(TipoFiltro.ESTILO)

      expect(resultado.valoresDe(TipoFiltro.ESTILO)).toEqual([])
      expect(resultado.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
    })

    it('quitar filtros no altera el texto', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('retrato').conFiltro(oleo)

      const resultado = criterios.sinFiltro(oleo)

      expect(resultado.texto).toBe('retrato')
    })
  })

  describe('limpiar todos los filtros', () => {
    it('deja la lista de filtros vacía', () => {
      const criterios = CriteriosBusqueda.vacio()
        .conFiltro(impresionismo)
        .conFiltro(oleo)
        .conFiltro(pintura)

      const resultado = criterios.limpiarFiltros()

      expect(resultado.filtros).toHaveLength(0)
      expect(resultado.tiposActivos()).toEqual([])
    })

    it('conserva el texto de búsqueda', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('acuarela').conFiltro(oleo)

      const resultado = criterios.limpiarFiltros()

      expect(resultado.texto).toBe('acuarela')
    })

    it('sin texto ni filtros, el resultado es vacío', () => {
      const resultado = CriteriosBusqueda.vacio().conFiltro(oleo).limpiarFiltros()

      expect(resultado.esVacio()).toBe(true)
    })

    it('limpiar el texto no altera los filtros', () => {
      const criterios = CriteriosBusqueda.vacio().conTexto('acuarela').conFiltro(oleo)

      const resultado = criterios.limpiarTexto()

      expect(resultado.texto).toBe('')
      expect(resultado.valoresDe(TipoFiltro.TECNICA)).toEqual(['oleo'])
    })
  })

  describe('inmutabilidad', () => {
    it('conFiltro devuelve nuevos criterios y no altera los originales', () => {
      const original = CriteriosBusqueda.vacio()

      const nuevo = original.conFiltro(oleo)

      expect(nuevo).not.toBe(original)
      expect(original.filtros).toHaveLength(0)
      expect(nuevo.filtros).toHaveLength(1)
    })

    it('sinFiltro y limpiarFiltros no alteran los criterios originales', () => {
      const original = CriteriosBusqueda.vacio().conFiltro(oleo).conFiltro(pintura)

      original.sinFiltro(oleo)
      original.limpiarFiltros()

      expect(original.filtros).toHaveLength(2)
    })

    it('la lista expuesta de filtros no permite alterar el estado interno', () => {
      const original = CriteriosBusqueda.vacio().conFiltro(oleo)

      const expuesta = original.filtros as FiltroActivo[]
      try {
        expuesta.push(pintura)
      } catch {
        // Si la lista está congelada, lanzar es un comportamiento válido.
      }

      expect(original.filtros).toHaveLength(1)
    })
  })
})
