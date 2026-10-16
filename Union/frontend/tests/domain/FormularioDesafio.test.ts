import { describe, it, expect } from 'vitest'
import { Desafio } from '../../src/domain/Desafio'
import { RangoFechas } from '../../src/domain/RangoFechas'
import { AmbitoDesafio } from '../../src/domain/AmbitoDesafio'
import { Foto } from '../../src/domain/Foto'

/**
 * Tests para FormularioDesafio (T053, T077)
 * 
 * Validaciones probadas:
 * - RF-02: Fotos entre 1 y 5, una principal
 * - RF-03: Fin posterior a inicio (RangoFechas)
 * - RF-04: Nombre, descripción y ámbitos requeridos
 * - CB-11: Formato JPEG/PNG
 * - CB-12: Al menos un ámbito
 * 
 * Fuente: specs/003-desafios/tasks.md (T053, T077)
 * Data model: specs/003-desafios/data-model.md (sección 4.1)
 */

describe('FormularioDesafio & Desafio.validar (T053, T077)', () => {
  
  describe('Validación de nombre (RF-04)', () => {
    it('rechaza nombre vacío', () => {
      const desafio = new Desafio({
        nombre: '',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.nombre).toBeDefined()
      expect(errores.nombre).toMatch(/nombre.*requerido/i)
    })

    it('acepta nombre válido', () => {
      const desafio = new Desafio({
        nombre: 'Reciclar plástico',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.nombre).toBeUndefined()
    })
  })

  describe('Validación de descripción (RF-04)', () => {
    it('rechaza descripción vacía', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: '',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.descripcionLarga).toBeDefined()
      expect(errores.descripcionLarga).toMatch(/descripción.*requerida/i)
    })

    it('acepta descripción válida', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Esta es una descripción válida del desafío',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.descripcionLarga).toBeUndefined()
    })
  })

  describe('Validación de fotos (RF-02, A-06, CB-11)', () => {
    it('rechaza sin fotos', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fotos).toBeDefined()
      expect(errores.fotos).toMatch(/requiere.*foto/i)
    })

    it('rechaza más de 5 fotos', () => {
      const fotos = Array.from({ length: 6 }, (_, i) => 
        new Foto({ 
          id: `${i}`, 
          url: 'url', 
          formato: 'JPEG', 
          principal: i === 0 
        })
      )

      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos,
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fotos).toBeDefined()
      expect(errores.fotos).toMatch(/máximo 5/i)
    })

    it('rechaza formato inválido (no JPEG/PNG)', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG' as any, principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      // Cambiar formato manualmente para provocar error
      ;(desafio.fotos![0] as any).formato = 'BMP'

      const errores = desafio.validar()
      expect(errores.fotos).toBeDefined()
      expect(errores.fotos).toMatch(/JPEG.*PNG/i)
    })

    it('rechaza sin foto principal', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: false })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fotos).toBeDefined()
      expect(errores.fotos).toMatch(/principal/i)
    })

    it('rechaza múltiples fotos principales', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [
          new Foto({ id: '1', url: 'url1', formato: 'JPEG', principal: true }),
          new Foto({ id: '2', url: 'url2', formato: 'PNG', principal: true }),
        ],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fotos).toBeDefined()
      expect(errores.fotos).toMatch(/una foto principal/i)
    })

    it('acepta 1 a 5 fotos con una principal (JPEG o PNG)', () => {
      const fotos = Array.from({ length: 3 }, (_, i) => 
        new Foto({ 
          id: `${i}`, 
          url: 'url', 
          formato: i % 2 === 0 ? 'JPEG' : 'PNG', 
          principal: i === 0 
        })
      )

      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos,
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fotos).toBeUndefined()
    })
  })

  describe('Validación de fechas (RF-03)', () => {
    it('rechaza fin menor o igual a inicio', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-12-31'), fin: new Date('2025-01-01') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fin).toBeDefined()
      expect(errores.fin).toMatch(/posterior/i)
    })

    it('rechaza cuando fin es igual a inicio', () => {
      const mismaFecha = new Date('2025-06-15')
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: mismaFecha, fin: mismaFecha }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fin).toBeDefined()
    })

    it('acepta fin posterior a inicio', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(errores.fin).toBeUndefined()
    })
  })

  describe('Validación de ámbitos (RF-04, CB-12)', () => {
    it('rechaza sin ámbitos', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [],
      })

      const errores = desafio.validar()
      expect(errores.ambitos).toBeDefined()
      expect(errores.ambitos).toMatch(/ámbito/i)
    })

    it('acepta uno o más ámbitos', () => {
      const desafio = new Desafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [
          new AmbitoDesafio({ valor: 'Ambiente' }),
          new AmbitoDesafio({ valor: 'Salud' }),
        ],
      })

      const errores = desafio.validar()
      expect(errores.ambitos).toBeUndefined()
    })
  })

  describe('Validación completa', () => {
    it('desafío válido sin errores', () => {
      const desafio = new Desafio({
        nombre: 'Reciclar plástico en casa',
        descripcionLarga: 'Un desafío para fomentar el reciclaje de botellas y bolsas de plástico.',
        fotos: [
          new Foto({ id: '1', url: 'url1', formato: 'JPEG', principal: true }),
          new Foto({ id: '2', url: 'url2', formato: 'PNG', principal: false }),
        ],
        rango: new RangoFechas({ inicio: new Date('2025-01-15'), fin: new Date('2025-03-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = desafio.validar()
      expect(Object.keys(errores).length).toBe(0)
    })

    it('desafío con múltiples errores', () => {
      const desafio = new Desafio({
        nombre: '', // Error: nombre vacío
        descripcionLarga: '', // Error: descripción vacía
        fotos: [], // Error: sin fotos
        rango: new RangoFechas({ inicio: new Date('2025-12-31'), fin: new Date('2025-01-01') }), // Error: fin no posterior
        ambitos: [], // Error: sin ámbitos
      })

      const errores = desafio.validar()
      expect(Object.keys(errores).length).toBeGreaterThan(0)
      expect(errores.nombre).toBeDefined()
      expect(errores.descripcionLarga).toBeDefined()
      expect(errores.fotos).toBeDefined()
      expect(errores.fin).toBeDefined()
      expect(errores.ambitos).toBeDefined()
    })
  })
})
