import { describe, it, expect } from 'vitest'
import { PublicacionModeracion } from '../../src/domain/PublicacionModeracion'
import { EstadoPublicacionAdmin as EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin as MotivoReporte } from '../../src/domain/enums/MotivoReporteAdmin'

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
