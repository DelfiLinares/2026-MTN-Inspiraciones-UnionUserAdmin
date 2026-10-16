import { describe, it, expect } from 'vitest'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'

/**
 * Trazabilidad adicional (T015, `Union/specs/002-frontend-admin/tasks.md`):
 * Esta suite cubre el requisito de T015 — tests de `puedeSerEliminada`, `estaReportada` (ya
 * existentes) más `puedeSerEditada` y `estaActiva` (agregados en esta revisión) — RF-09, RF-10,
 * RF-12 de `Union/specs/002-frontend-admin/spec.md`.
 *
 * No se creó un archivo separado `tests/domain/Publicacion.test.ts` para esta regla porque ese path
 * ya está ocupado por los tests de la entidad social `Publicacion` de `001-plataforma-unificada`
 * (like/reporte propios). Mismo criterio de colisión de nombres aplicado en T012/T014: la entidad
 * administrativa vive en `PublicacionModeracion.ts` / `PublicacionModeracion.test.ts`.
 *
 * Siguiendo TDD (Fase 2 de `tasks.md`: "escribir ANTES de las entidades; deben fallar primero"),
 * los dos tests de `puedeSerEditada()` y `estaActiva()` se esperan en **rojo** hasta que T018
 * implemente dichos métodos en la entidad `PublicacionModeracion`.
 */
describe('PublicacionModeracion (Entidad de dominio UI)', () => {
  describe('estaReportada()', () => {
    it('debe retornar true cuando el estado es REPORTADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-1',
        autorId: 'user-100',
        estado: EstadoPublicacion.REPORTADA,
        cantidadReportes: 3,
        motivosReporte: [MotivoReporte.SPAM, MotivoReporte.CONTENIDO_INAPROPIADO],
      })

      expect(publicacion.estaReportada()).toBe(true)
    })

    it('debe retornar false cuando el estado es ACTIVA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-2',
        autorId: 'user-101',
        estado: EstadoPublicacion.ACTIVA,
        cantidadReportes: 0,
        motivosReporte: [],
      })

      expect(publicacion.estaReportada()).toBe(false)
    })

    it('debe retornar false cuando el estado es ELIMINADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-3',
        autorId: 'user-102',
        estado: EstadoPublicacion.ELIMINADA,
        cantidadReportes: 5,
        motivosReporte: [MotivoReporte.VIOLENCIA],
      })

      expect(publicacion.estaReportada()).toBe(false)
    })
  })

  describe('puedeEliminarse() / puedeSerEliminada()', () => {
    it('debe permitir eliminar una publicación en estado REPORTADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-4',
        autorId: 'user-103',
        estado: EstadoPublicacion.REPORTADA,
        cantidadReportes: 2,
        motivosReporte: [MotivoReporte.PLAGIO_DERECHOS_AUTOR],
      })

      expect(publicacion.puedeEliminarse()).toBe(true)
      expect(publicacion.puedeSerEliminada()).toBe(true)
    })

    it('debe permitir eliminar una publicación en estado ACTIVA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-5',
        autorId: 'user-104',
        estado: EstadoPublicacion.ACTIVA,
        cantidadReportes: 0,
        motivosReporte: [],
      })

      expect(publicacion.puedeEliminarse()).toBe(true)
      expect(publicacion.puedeSerEliminada()).toBe(true)
    })

    it('no debe permitir eliminar una publicación que ya se encuentra ELIMINADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-6',
        autorId: 'user-105',
        estado: EstadoPublicacion.ELIMINADA,
        cantidadReportes: 4,
        motivosReporte: [MotivoReporte.SPAM],
      })

      expect(publicacion.puedeEliminarse()).toBe(false)
      expect(publicacion.puedeSerEliminada()).toBe(false)
    })
  })

  describe('estaActiva() (T015, RF-11/data-model.md)', () => {
    it('debe retornar true cuando el estado es ACTIVA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-8',
        autorId: 'user-106',
        estado: EstadoPublicacion.ACTIVA,
        cantidadReportes: 0,
        motivosReporte: [],
      })

      expect(publicacion.estaActiva()).toBe(true)
    })

    it('debe retornar false cuando el estado es REPORTADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-9',
        autorId: 'user-107',
        estado: EstadoPublicacion.REPORTADA,
        cantidadReportes: 1,
        motivosReporte: [MotivoReporte.SPAM],
      })

      expect(publicacion.estaActiva()).toBe(false)
    })

    it('debe retornar false cuando el estado es ELIMINADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-10',
        autorId: 'user-108',
        estado: EstadoPublicacion.ELIMINADA,
        cantidadReportes: 2,
        motivosReporte: [MotivoReporte.OTRO],
      })

      expect(publicacion.estaActiva()).toBe(false)
    })
  })

  describe('puedeSerEditada() (T015, RF-09: editable sin distinción de autor ni estado previo)', () => {
    it('debe permitir editar una publicación en estado ACTIVA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-11',
        autorId: 'user-109',
        estado: EstadoPublicacion.ACTIVA,
        cantidadReportes: 0,
        motivosReporte: [],
      })

      expect(publicacion.puedeSerEditada()).toBe(true)
    })

    it('debe permitir editar una publicación en estado REPORTADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-12',
        autorId: 'user-110',
        estado: EstadoPublicacion.REPORTADA,
        cantidadReportes: 3,
        motivosReporte: [MotivoReporte.CONTENIDO_INAPROPIADO],
      })

      expect(publicacion.puedeSerEditada()).toBe(true)
    })

    it('no debe permitir editar una publicación ya ELIMINADA', () => {
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-13',
        autorId: 'user-111',
        estado: EstadoPublicacion.ELIMINADA,
        cantidadReportes: 1,
        motivosReporte: [MotivoReporte.SPAM],
      })

      expect(publicacion.puedeSerEditada()).toBe(false)
    })
  })

  describe('Propiedades iniciales', () => {
    it('debe asignar adecuadamente todos los atributos del constructor', () => {
      const motivos = [MotivoReporte.SPAM, MotivoReporte.OTRO]
      const publicacion = new PublicacionModeracion({
        id: 'pub-mod-7',
        autorId: 'user-200',
        estado: EstadoPublicacion.REPORTADA,
        cantidadReportes: 2,
        motivosReporte: motivos,
      })

      expect(publicacion.id).toBe('pub-mod-7')
      expect(publicacion.autorId).toBe('user-200')
      expect(publicacion.estado).toBe(EstadoPublicacion.REPORTADA)
      expect(publicacion.cantidadReportes).toBe(2)
      expect(publicacion.motivosReporte).toEqual(motivos)
    })
  })
})
