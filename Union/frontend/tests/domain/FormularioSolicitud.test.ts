import { describe, it, expect } from 'vitest'
import { SolicitudDesafio } from '../../src/domain/SolicitudDesafio'
import { RangoFechas } from '../../src/domain/RangoFechas'
import { AmbitoDesafio } from '../../src/domain/AmbitoDesafio'
import { Foto } from '../../src/domain/Foto'

/**
 * Tests para FormularioSolicitud & SolicitudDesafio.validar (T054)
 * 
 * Validaciones probadas (A-08):
 * - RF-02: Fotos entre 1 y 5, una principal
 * - RF-03: Fin posterior a inicio (RangoFechas)
 * - RF-04: Nombre, descripción y ámbitos requeridos
 * - RF-07: Solicitud con los mismos campos que desafío
 * - CB-11: Formato JPEG/PNG
 * - CB-12: Al menos un ámbito
 * 
 * Fuente: specs/003-desafios/tasks.md (T054)
 * Data model: specs/003-desafios/data-model.md (sección 4.2)
 * Spec: specs/003-desafios/spec.md (A-08, RF-07)
 */

describe('FormularioSolicitud & SolicitudDesafio.validar (T054)', () => {
  
  describe('Validación de nombre (RF-04, A-08)', () => {
    it('rechaza nombre vacío', () => {
      const solicitud = new SolicitudDesafio({
        nombre: '',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.nombre).toBeDefined()
      expect(errores.nombre).toMatch(/nombre.*requerido/i)
    })

    it('acepta nombre válido', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Reciclar plástico',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.nombre).toBeUndefined()
    })
  })

  describe('Validación de descripción (RF-04, A-08)', () => {
    it('rechaza descripción vacía', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: '',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.descripcionLarga).toBeDefined()
      expect(errores.descripcionLarga).toMatch(/descripción.*requerida/i)
    })

    it('acepta descripción válida', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Esta es una descripción válida de la solicitud',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.descripcionLarga).toBeUndefined()
    })
  })

  describe('Validación de fotos (RF-02, A-08, CB-11)', () => {
    it('rechaza sin fotos', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
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

      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos,
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.fotos).toBeDefined()
      expect(errores.fotos).toMatch(/máximo 5/i)
    })

    it('acepta 1 a 5 fotos con una principal', () => {
      const fotos = Array.from({ length: 3 }, (_, i) => 
        new Foto({ 
          id: `${i}`, 
          url: 'url', 
          formato: i % 2 === 0 ? 'JPEG' : 'PNG', 
          principal: i === 0 
        })
      )

      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos,
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.fotos).toBeUndefined()
    })
  })

  describe('Validación de fechas (RF-03, A-08)', () => {
    it('rechaza fin menor o igual a inicio', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-12-31'), fin: new Date('2025-01-01') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.fin).toBeDefined()
      expect(errores.fin).toMatch(/posterior/i)
    })

    it('acepta fin posterior a inicio', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const errores = solicitud.validar()
      expect(errores.fin).toBeUndefined()
    })
  })

  describe('Validación de ámbitos (RF-04, CB-12, A-08)', () => {
    it('rechaza sin ámbitos', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [],
      })

      const errores = solicitud.validar()
      expect(errores.ambitos).toBeDefined()
      expect(errores.ambitos).toMatch(/ámbito/i)
    })

    it('acepta uno o más ámbitos', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [
          new AmbitoDesafio({ valor: 'Ambiente' }),
          new AmbitoDesafio({ valor: 'Salud' }),
        ],
      })

      const errores = solicitud.validar()
      expect(errores.ambitos).toBeUndefined()
    })
  })

  describe('Métodos de transición (RF-09, CB-06)', () => {
    it('aprueba una solicitud en estado PENDIENTE', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
        estado: 'PENDIENTE',
      })

      const aprobada = solicitud.aprobar()
      expect(aprobada.estado).toBe('APROBADA')
    })

    it('rechaza una solicitud en estado PENDIENTE', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
        estado: 'PENDIENTE',
      })

      const rechazada = solicitud.rechazar()
      expect(rechazada.estado).toBe('RECHAZADA')
    })

    it('lanza error al aprobar una solicitud no PENDIENTE', () => {
      const solicitud = new SolicitudDesafio({
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
        estado: 'APROBADA',
      })

      expect(() => solicitud.aprobar()).toThrow()
    })
  })

  describe('Métodos de permisos (RF-10, RF-11, HU-05, HU-07)', () => {
    it('autor puede editar su solicitud', () => {
      const solicitud = new SolicitudDesafio({
        autorId: 'usuario-123',
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const puedoEditar = solicitud.puedeEditarPor({
        usuarioId: 'usuario-123',
        rol: 'USER',
      })

      expect(puedoEditar).toBe(true)
    })

    it('ADMIN siempre puede editar', () => {
      const solicitud = new SolicitudDesafio({
        autorId: 'usuario-123',
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const puedoEditar = solicitud.puedeEditarPor({
        usuarioId: 'otro-usuario',
        rol: 'ADMIN',
      })

      expect(puedoEditar).toBe(true)
    })

    it('otro usuario no puede editar', () => {
      const solicitud = new SolicitudDesafio({
        autorId: 'usuario-123',
        nombre: 'Nombre',
        descripcionLarga: 'Descripción',
        fotos: [new Foto({ id: '1', url: 'url', formato: 'JPEG', principal: true })],
        rango: new RangoFechas({ inicio: new Date('2025-01-01'), fin: new Date('2025-12-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
      })

      const puedoEditar = solicitud.puedeEditarPor({
        usuarioId: 'otro-usuario',
        rol: 'USER',
      })

      expect(puedoEditar).toBe(false)
    })
  })

  describe('Método estaResuelta (CB-06, A-04)', () => {
    it('devuelve false para solicitud PENDIENTE', () => {
      const solicitud = new SolicitudDesafio({
        estado: 'PENDIENTE',
      })

      expect(solicitud.estaResuelta()).toBe(false)
    })

    it('devuelve true para solicitud APROBADA', () => {
      const solicitud = new SolicitudDesafio({
        estado: 'APROBADA',
      })

      expect(solicitud.estaResuelta()).toBe(true)
    })

    it('devuelve true para solicitud RECHAZADA', () => {
      const solicitud = new SolicitudDesafio({
        estado: 'RECHAZADA',
      })

      expect(solicitud.estaResuelta()).toBe(true)
    })
  })

  describe('Validación completa (A-08)', () => {
    it('solicitud válida sin errores', () => {
      const solicitud = new SolicitudDesafio({
        autorId: 'usuario-123',
        nombre: 'Reciclar plástico en casa',
        descripcionLarga: 'Un desafío para fomentar el reciclaje de botellas y bolsas de plástico.',
        fotos: [
          new Foto({ id: '1', url: 'url1', formato: 'JPEG', principal: true }),
          new Foto({ id: '2', url: 'url2', formato: 'PNG', principal: false }),
        ],
        rango: new RangoFechas({ inicio: new Date('2025-01-15'), fin: new Date('2025-03-31') }),
        ambitos: [new AmbitoDesafio({ valor: 'Ambiente' })],
        estado: 'PENDIENTE',
      })

      const errores = solicitud.validar()
      expect(Object.keys(errores).length).toBe(0)
    })
  })
})
