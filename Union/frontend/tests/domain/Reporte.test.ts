import { describe, it, expect } from 'vitest'
import { Reporte } from '../../src/domain/Reporte'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { PrioridadReporte } from '../../src/domain/enums/PrioridadReporte'

describe('Reporte (Entidad de dominio UI)', () => {
  describe('puedeResolverseSinEliminar()', () => {
    it('debe retornar true si el estado es PENDIENTE', () => {
      const reporte = new Reporte({
        id: 'rep-1',
        publicacionId: 'pub-1',
        motivo: MotivoReporte.SPAM,
        reportanteId: 'usr-1',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.PENDIENTE,
      })

      expect(reporte.puedeResolverseSinEliminar()).toBe(true)
      expect(reporte.estaPendiente()).toBe(true)
    })

    it('debe retornar true si el estado es EN_REVISION', () => {
      const reporte = new Reporte({
        id: 'rep-2',
        publicacionId: 'pub-2',
        motivo: MotivoReporte.CONTENIDO_INAPROPIADO,
        reportanteId: 'usr-2',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.EN_REVISION,
      })

      expect(reporte.puedeResolverseSinEliminar()).toBe(true)
      expect(reporte.estaPendiente()).toBe(true)
    })

    it('debe retornar false si el estado es RESUELTO', () => {
      const reporte = new Reporte({
        id: 'rep-3',
        publicacionId: 'pub-3',
        motivo: MotivoReporte.PLAGIO_DERECHOS_AUTOR,
        reportanteId: 'usr-3',
        fecha: '2026-09-18T10:00:00.000Z',
        estado: EstadoModeracion.RESUELTO,
      })

      expect(reporte.puedeResolverseSinEliminar()).toBe(false)
      expect(reporte.estaPendiente()).toBe(false)
    })

    it('debe retornar false si el estado es DESESTIMADO', () => {
      const reporte = new Reporte({
        id: 'rep-4',
        publicacionId: 'pub-4',
        motivo: MotivoReporte.OTRO,
        reportanteId: 'usr-4',
        fecha: '2026-09-19T10:00:00.000Z',
        estado: EstadoModeracion.DESESTIMADO,
      })

      expect(reporte.puedeResolverseSinEliminar()).toBe(false)
      expect(reporte.estaPendiente()).toBe(false)
    })
  })

  describe('antiguedadEnDias()', () => {
    it('calcula correctamente la diferencia en días enteros', () => {
      const fechaCreacion = '2026-09-15T00:00:00.000Z'
      const fechaActual = new Date('2026-09-20T00:00:00.000Z')

      const reporte = new Reporte({
        id: 'rep-5',
        publicacionId: 'pub-5',
        motivo: MotivoReporte.VIOLENCIA,
        reportanteId: 'usr-5',
        fecha: fechaCreacion,
        estado: EstadoModeracion.PENDIENTE,
      })

      expect(reporte.antiguedadEnDias(fechaActual)).toBe(5)
    })

    it('retorna 0 si la fecha actual es el mismo día o anterior', () => {
      const fechaCreacion = new Date('2026-09-22T08:00:00.000Z')
      const fechaActual = new Date('2026-09-22T14:00:00.000Z')

      const reporte = new Reporte({
        id: 'rep-6',
        publicacionId: 'pub-6',
        motivo: MotivoReporte.SPAM,
        reportanteId: 'usr-6',
        fecha: fechaCreacion,
        estado: EstadoModeracion.PENDIENTE,
      })

      expect(reporte.antiguedadEnDias(fechaActual)).toBe(0)
    })
  })

  describe('Compatibilidad con prioridad (T031B / PrioridadReporte)', () => {
    it('acepta valores de PrioridadReporte y no afecta los métodos de resolución ni antigüedad', () => {
      const fechaCreacion = '2026-09-18T00:00:00.000Z'
      const fechaActual = new Date('2026-09-22T00:00:00.000Z')

      const reporte = new Reporte({
        id: 'rep-7',
        publicacionId: 'pub-7',
        motivo: MotivoReporte.SPAM,
        reportanteId: 'usr-7',
        fecha: fechaCreacion,
        estado: EstadoModeracion.PENDIENTE,
        prioridad: PrioridadReporte.ALTA,
      })

      expect(reporte.prioridad).toBe(PrioridadReporte.ALTA)
      expect(reporte.puedeResolverseSinEliminar()).toBe(true)
      expect(reporte.antiguedadEnDias(fechaActual)).toBe(4)
    })
  })
})
