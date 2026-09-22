import { describe, it, expect } from 'vitest'
import { Desafio } from '../../src/domain/Desafio'

describe('Desafio (Entidad de dominio UI)', () => {
  const desafioBaseProps = {
    id: 'desafio-1',
    titulo: 'Desafío de Acuarela de Otoño',
    descripcion: 'Pintá una escena con temática otoñal usando acuarelas.',
    activo: true,
    completadoPorUsuarioActual: false,
  }

  describe('puedeParticiparUsuarioActual()', () => {
    it('debe permitir participar si el usuario está autenticado (autenticado = true)', () => {
      const desafio = new Desafio(desafioBaseProps)

      expect(desafio.puedeParticiparUsuarioActual(true)).toBe(true)
    })

    it('no debe permitir participar si el usuario no está autenticado (autenticado = false)', () => {
      const desafio = new Desafio(desafioBaseProps)

      expect(desafio.puedeParticiparUsuarioActual(false)).toBe(false)
    })
  })

  describe('Propiedades iniciales', () => {
    it('debe inicializar correctamente las propiedades del desafío', () => {
      const desafio = new Desafio(desafioBaseProps)

      expect(desafio.id).toBe('desafio-1')
      expect(desafio.titulo).toBe('Desafío de Acuarela de Otoño')
      expect(desafio.descripcion).toBe('Pintá una escena con temática otoñal usando acuarelas.')
      expect(desafio.activo).toBe(true)
      expect(desafio.completadoPorUsuarioActual).toBe(false)
    })
  })
})
