import { describe, it, expect } from 'vitest'
import { DesafioPropuesto } from '../../src/domain/DesafioPropuesto'
import { EstadoDesafioPropuesto } from '../../src/domain/enums/EstadoDesafioPropuesto'

describe('DesafioPropuesto (Entidad de dominio UI)', () => {
  describe('Estado PENDIENTE', () => {
    it('debe permitir aprobarse y rechazarse mientras esté PENDIENTE', () => {
      const desafio = new DesafioPropuesto({
        id: 'des-prop-1',
        autorId: 'user-1',
        estado: EstadoDesafioPropuesto.PENDIENTE,
        titulo: 'Dibujar estilo Bauhaus',
        descripcion: 'Crear una composición geométrica abstracta',
      })

      expect(desafio.estaPendiente()).toBe(true)
      expect(desafio.puedeAprobarse()).toBe(true)
      expect(desafio.puedeRechazarse()).toBe(true)
    })
  })

  describe('Caso crítico CB-15: Transiciones irreversibles', () => {
    it('una vez APROBADO, puedeAprobarse() y puedeRechazarse() devuelven false permanentemente', () => {
      const desafio = new DesafioPropuesto({
        id: 'des-prop-2',
        autorId: 'user-2',
        estado: EstadoDesafioPropuesto.APROBADO,
        titulo: 'Retrato con técnica mixta',
        descripcion: 'Usar tinta y acuarela',
      })

      expect(desafio.estaPendiente()).toBe(false)
      expect(desafio.puedeAprobarse()).toBe(false)
      expect(desafio.puedeRechazarse()).toBe(false)
    })

    it('una vez RECHAZADO, puedeAprobarse() y puedeRechazarse() devuelven false permanentemente', () => {
      const desafio = new DesafioPropuesto({
        id: 'des-prop-3',
        autorId: 'user-3',
        estado: EstadoDesafioPropuesto.RECHAZADO,
        titulo: 'Desafío no válido',
        descripcion: 'Descripción inadecuada',
      })

      expect(desafio.estaPendiente()).toBe(false)
      expect(desafio.puedeAprobarse()).toBe(false)
      expect(desafio.puedeRechazarse()).toBe(false)
    })
  })

  describe('Propiedades iniciales', () => {
    it('asigna correctamente los atributos del constructor y genera contenidoFormulario por defecto', () => {
      const fecha = new Date('2026-09-20T12:00:00.000Z')
      const desafio = new DesafioPropuesto({
        id: 'des-prop-4',
        autorId: 'user-4',
        estado: EstadoDesafioPropuesto.PENDIENTE,
        titulo: 'Pintura digital rápida',
        descripcion: 'Speedpainting de 30 minutos',
        fechaPropuesta: fecha,
      })

      expect(desafio.id).toBe('des-prop-4')
      expect(desafio.autorId).toBe('user-4')
      expect(desafio.estado).toBe(EstadoDesafioPropuesto.PENDIENTE)
      expect(desafio.titulo).toBe('Pintura digital rápida')
      expect(desafio.descripcion).toBe('Speedpainting de 30 minutos')
      expect(desafio.fechaPropuesta).toBe(fecha)
      expect(desafio.contenidoFormulario).toEqual({
        titulo: 'Pintura digital rápida',
        descripcion: 'Speedpainting de 30 minutos',
      })
    })
  })
})
