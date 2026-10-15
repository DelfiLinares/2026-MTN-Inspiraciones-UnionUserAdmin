import { describe, expect, it } from 'vitest'
import {
  construirSearchDesdeFiltros,
  hayFiltrosActivos,
  parsearFiltrosDesdeSearch,
} from '../../src/pages/desafios/listado/filtrosUrl'

describe('ListadoDesafiosPage - filtros URL (T057)', () => {
  it('parsea estado y ámbitos desde query string', () => {
    const filtros = parsearFiltrosDesdeSearch('?estado=ACTIVO&ambito=fotografia,ilustracion')

    expect(filtros.estado).toBe('ACTIVO')
    expect(filtros.ambitos).toEqual(['fotografia', 'ilustracion'])
  })

  it('ignora estado inválido y limpia ámbitos vacíos', () => {
    const filtros = parsearFiltrosDesdeSearch('?estado=DESCONOCIDO&ambito=,arte,,')

    expect(filtros.estado).toBeUndefined()
    expect(filtros.ambitos).toEqual(['arte'])
  })

  it('construye query string con filtros activos', () => {
    const search = construirSearchDesdeFiltros({
      estado: 'PROGRAMADO',
      ambitos: ['pintura', 'escultura'],
    })

    expect(search).toBe('?ambito=pintura%2Cescultura&estado=PROGRAMADO')
  })

  it('devuelve string vacío sin filtros', () => {
    const search = construirSearchDesdeFiltros({ ambitos: [] })
    expect(search).toBe('')
  })

  it('detecta correctamente si hay filtros activos', () => {
    expect(hayFiltrosActivos({ ambitos: [] })).toBe(false)
    expect(hayFiltrosActivos({ ambitos: ['street-art'] })).toBe(true)
    expect(hayFiltrosActivos({ ambitos: [], estado: 'FINALIZADO' })).toBe(true)
  })
})
