import { describe, expect, it } from 'vitest'
import {
  normalizarReporteBack,
  paginaDesdeBack,
  paramsListadoBack,
} from '../../src/infrastructure/adaptadorReportesBack'

describe('adaptadorReportesBack', () => {
  describe('paramsListadoBack', () => {
    it('convierte page base 1 a pagina base 0 y pageSize a tamanio', () => {
      expect(paramsListadoBack({ page: 3, pageSize: 25 })).toEqual({
        pagina: 2,
        tamanio: 25,
        estadoModeracion: undefined,
        prioridad: undefined,
        motivo: undefined,
      })
    })

    it('usa valores por defecto y limita tamanio a 100', () => {
      expect(paramsListadoBack({})).toMatchObject({ pagina: 0, tamanio: 10 })
      expect(paramsListadoBack({ page: 0, pageSize: 500 })).toMatchObject({ pagina: 0, tamanio: 100 })
    })

    it('propaga estadoModeracion, prioridad y motivo sin enviar ordenarPor', () => {
      const params = paramsListadoBack({
        estadoModeracion: 'PENDIENTE',
        prioridad: 'ALTA',
        motivo: 'SPAM',
        ordenarPor: 'prioridad',
      } as never)
      expect(params).toMatchObject({ estadoModeracion: 'PENDIENTE', prioridad: 'ALTA', motivo: 'SPAM' })
      expect(params).not.toHaveProperty('ordenarPor')
    })
  })

  describe('paginaDesdeBack', () => {
    it('convierte contenido/totalElementos en items/total mapeando cada fila', () => {
      const pagina = paginaDesdeBack(
        { contenido: [{ id: 'a' }, { id: 'b' }], totalElementos: 7, pagina: 0, tamanioPagina: 2 },
        (fila: { id: string }) => fila.id.toUpperCase(),
      )
      expect(pagina).toEqual({ items: ['A', 'B'], total: 7 })
    })

    it('tolera respuestas sin contenido', () => {
      expect(paginaDesdeBack({} as never, (x: unknown) => x)).toEqual({ items: [], total: 0 })
    })
  })

  describe('normalizarReporteBack', () => {
    it('renombra fechaCreacion a fecha y estadoModeracion a estado conservando publicacion y reportante', () => {
      const publicacion = {
        id: 'p1',
        autorId: 'u1',
        estado: 'REPORTADA',
        cantidadReportes: 2,
        motivosReporte: ['SPAM'],
      }
      const reportante = { id: 'u2', nombre: 'Ana', email: 'ana@example.com' }

      const resultado = normalizarReporteBack({
        id: 'r1',
        publicacionId: 'p1',
        reportanteId: 'u2',
        motivo: 'SPAM',
        prioridad: 'ALTA',
        estadoModeracion: 'PENDIENTE',
        fechaCreacion: '2026-10-20T10:00:00Z',
        publicacion,
        reportante,
      })

      expect(resultado).toEqual({
        id: 'r1',
        publicacionId: 'p1',
        reportanteId: 'u2',
        motivo: 'SPAM',
        prioridad: 'ALTA',
        estado: 'PENDIENTE',
        fecha: '2026-10-20T10:00:00Z',
        publicacion,
        reportante,
      })
    })
  })
})
