import { describe, it, expect } from 'vitest'
import { ExportacionReporte } from '../../src/domain/ExportacionReporte'

describe('ExportacionReporte (Entidad de dominio UI)', () => {
  describe('fueExitosa()', () => {
    it('debe retornar false si existe un errorMensaje aunque disponible sea true', () => {
      const exportacion = new ExportacionReporte({
        disponible: true,
        errorMensaje: 'Error en el servidor al generar CSV',
        urlDescarga: 'http://example.com/reporte.csv',
      })

      expect(exportacion.disponible).toBe(true)
      expect(exportacion.errorMensaje).toBe('Error en el servidor al generar CSV')
      expect(exportacion.fueExitosa()).toBe(false)
      expect(exportacion.fallo()).toBe(true)
    })

    it('debe retornar true si disponible es true y no hay errorMensaje', () => {
      const exportacion = new ExportacionReporte({
        disponible: true,
        urlDescarga: 'http://example.com/reportes/analitica.pdf',
      })

      expect(exportacion.fueExitosa()).toBe(true)
      expect(exportacion.estaListoParaDescargar()).toBe(true)
      expect(exportacion.fallo()).toBe(false)
    })

    it('debe retornar false si disponible es false aunque no haya errorMensaje', () => {
      const exportacion = new ExportacionReporte({
        disponible: false,
      })

      expect(exportacion.fueExitosa()).toBe(false)
      expect(exportacion.fallo()).toBe(true)
    })

    it('debe soportar mensajeError como alias de errorMensaje', () => {
      const exportacion = new ExportacionReporte({
        disponible: true,
        mensajeError: 'Fallo de conexión a la base de datos',
      })

      expect(exportacion.errorMensaje).toBe('Fallo de conexión a la base de datos')
      expect(exportacion.mensajeError).toBe('Fallo de conexión a la base de datos')
      expect(exportacion.fueExitosa()).toBe(false)
    })
  })

  describe('estaListoParaDescargar()', () => {
    it('debe retornar false si fue exitosa pero no tiene urlDescarga', () => {
      const exportacion = new ExportacionReporte({
        disponible: true,
      })

      expect(exportacion.fueExitosa()).toBe(true)
      expect(exportacion.estaListoParaDescargar()).toBe(false)
    })

    it('debe retornar true si fue exitosa y tiene urlDescarga', () => {
      const exportacion = new ExportacionReporte({
        disponible: true,
        urlDescarga: 'http://cdn.example.com/reporte.xlsx',
      })

      expect(exportacion.estaListoParaDescargar()).toBe(true)
    })
  })

  describe('Propiedades iniciales', () => {
    it('asigna correctamente los atributos del constructor', () => {
      const exportacion = new ExportacionReporte({
        disponible: true,
        urlDescarga: 'http://example.com/export.csv',
        reporteAnaliticaId: 'rep-analitica-123',
      })

      expect(exportacion.disponible).toBe(true)
      expect(exportacion.urlDescarga).toBe('http://example.com/export.csv')
      expect(exportacion.reporteAnaliticaId).toBe('rep-analitica-123')
      expect(exportacion.errorMensaje).toBeUndefined()
    })
  })
})
