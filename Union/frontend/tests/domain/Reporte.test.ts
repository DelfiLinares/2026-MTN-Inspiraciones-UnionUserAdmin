import { describe, it, expect } from 'vitest'
import { Reporte } from '../../src/domain/Reporte'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../../src/domain/enums/EstadoModeracion'
import { PrioridadReporte } from '../../src/domain/enums/PrioridadReporte'

/**
 * Trazabilidad adicional (T016, `Union/specs/002-frontend-admin/tasks.md`):
 * Esta suite cubre el requisito de T016 — tests de `estaPendiente()` (ya existente, vía
 * `puedeResolverseSinEliminar()`), más `puedeAceptarse()`, `puedeRechazarse()` y `esEstadoFinal()`
 * (agregados en esta revisión) — RF-15, RF-16, RF-17 y regla de negocio crítica 9 de
 * `Union/specs/002-frontend-admin/spec.md` §6 (reportes en estado final `RESUELTO`/`DESESTIMADO` no
 * pueden volver a aceptarse ni rechazarse).
 *
 * A diferencia de T012/T014/T015, no hay colisión de nombres aquí: `Reporte.ts` /
 * `Reporte.test.ts` ya es la entidad administrativa (no existe una entidad social homónima en
 * `001-plataforma-unificada`).
 *
 * Siguiendo TDD (Fase 2 de `tasks.md`: "escribir ANTES de las entidades; deben fallar primero"),
 * los tests de `puedeAceptarse()`, `puedeRechazarse()` y `esEstadoFinal()` se esperan en **rojo**
 * hasta que T019 implemente dichos métodos en la entidad `Reporte`.
 */
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

  describe('esEstadoFinal() (T016, regla de negocio crítica 9 de spec.md §6)', () => {
    it('debe retornar false si el estado es PENDIENTE', () => {
      const reporte = new Reporte({
        id: 'rep-8',
        publicacionId: 'pub-8',
        motivo: MotivoReporte.SPAM,
        reportanteId: 'usr-8',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.PENDIENTE,
      })

      expect(reporte.esEstadoFinal()).toBe(false)
    })

    it('debe retornar false si el estado es EN_REVISION', () => {
      const reporte = new Reporte({
        id: 'rep-9',
        publicacionId: 'pub-9',
        motivo: MotivoReporte.CONTENIDO_INAPROPIADO,
        reportanteId: 'usr-9',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.EN_REVISION,
      })

      expect(reporte.esEstadoFinal()).toBe(false)
    })

    it('debe retornar true si el estado es RESUELTO', () => {
      const reporte = new Reporte({
        id: 'rep-10',
        publicacionId: 'pub-10',
        motivo: MotivoReporte.PLAGIO_DERECHOS_AUTOR,
        reportanteId: 'usr-10',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.RESUELTO,
      })

      expect(reporte.esEstadoFinal()).toBe(true)
    })

    it('debe retornar true si el estado es DESESTIMADO', () => {
      const reporte = new Reporte({
        id: 'rep-11',
        publicacionId: 'pub-11',
        motivo: MotivoReporte.OTRO,
        reportanteId: 'usr-11',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.DESESTIMADO,
      })

      expect(reporte.esEstadoFinal()).toBe(true)
    })
  })

  describe('puedeAceptarse() (T016, RF-16)', () => {
    it('debe retornar true si el estado es PENDIENTE', () => {
      const reporte = new Reporte({
        id: 'rep-12',
        publicacionId: 'pub-12',
        motivo: MotivoReporte.SPAM,
        reportanteId: 'usr-12',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.PENDIENTE,
      })

      expect(reporte.puedeAceptarse()).toBe(true)
    })

    it('debe retornar true si el estado es EN_REVISION', () => {
      const reporte = new Reporte({
        id: 'rep-13',
        publicacionId: 'pub-13',
        motivo: MotivoReporte.VIOLENCIA,
        reportanteId: 'usr-13',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.EN_REVISION,
      })

      expect(reporte.puedeAceptarse()).toBe(true)
    })

    it('debe retornar false si el estado ya es RESUELTO (estado final)', () => {
      const reporte = new Reporte({
        id: 'rep-14',
        publicacionId: 'pub-14',
        motivo: MotivoReporte.OTRO,
        reportanteId: 'usr-14',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.RESUELTO,
      })

      expect(reporte.puedeAceptarse()).toBe(false)
    })

    it('debe retornar false si el estado ya es DESESTIMADO (estado final)', () => {
      const reporte = new Reporte({
        id: 'rep-15',
        publicacionId: 'pub-15',
        motivo: MotivoReporte.SPAM,
        reportanteId: 'usr-15',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.DESESTIMADO,
      })

      expect(reporte.puedeAceptarse()).toBe(false)
    })
  })

  describe('puedeRechazarse() (T016, RF-17)', () => {
    it('debe retornar true si el estado es PENDIENTE', () => {
      const reporte = new Reporte({
        id: 'rep-16',
        publicacionId: 'pub-16',
        motivo: MotivoReporte.CONTENIDO_INAPROPIADO,
        reportanteId: 'usr-16',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.PENDIENTE,
      })

      expect(reporte.puedeRechazarse()).toBe(true)
    })

    it('debe retornar true si el estado es EN_REVISION', () => {
      const reporte = new Reporte({
        id: 'rep-17',
        publicacionId: 'pub-17',
        motivo: MotivoReporte.PLAGIO_DERECHOS_AUTOR,
        reportanteId: 'usr-17',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.EN_REVISION,
      })

      expect(reporte.puedeRechazarse()).toBe(true)
    })

    it('debe retornar false si el estado ya es RESUELTO (estado final)', () => {
      const reporte = new Reporte({
        id: 'rep-18',
        publicacionId: 'pub-18',
        motivo: MotivoReporte.VIOLENCIA,
        reportanteId: 'usr-18',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.RESUELTO,
      })

      expect(reporte.puedeRechazarse()).toBe(false)
    })

    it('debe retornar false si el estado ya es DESESTIMADO (estado final)', () => {
      const reporte = new Reporte({
        id: 'rep-19',
        publicacionId: 'pub-19',
        motivo: MotivoReporte.OTRO,
        reportanteId: 'usr-19',
        fecha: '2026-09-20T10:00:00.000Z',
        estado: EstadoModeracion.DESESTIMADO,
      })

      expect(reporte.puedeRechazarse()).toBe(false)
    })
  })
})
