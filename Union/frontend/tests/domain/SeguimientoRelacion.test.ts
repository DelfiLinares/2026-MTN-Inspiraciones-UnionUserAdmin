import { describe, expect, it } from 'vitest'
import { SeguimientoRelacion } from '../../src/domain/SeguimientoRelacion'

/**
 * Tests unitarios de dominio para SeguimientoRelacion — módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T079)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Value Objects: SeguimientoRelacion)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, A4)
 *
 * Reglas cubiertas por T079:
 * - Toggle bidireccional: seguir/dejar de seguir (A4)
 * - Consistencia de estado: inmutabilidad del value object
 * - Helpers para verificar y mostrar estado
 */

function crearSeguimiento(
  overrides: Partial<{
    usuarioId: string
    usuarioASeguidoId: string
    siguiendo: boolean
  }> = {},
): SeguimientoRelacion {
  return new SeguimientoRelacion(
    overrides.usuarioId ?? 'user-1',
    overrides.usuarioASeguidoId ?? 'user-2',
    overrides.siguiendo ?? false,
  )
}

describe('SeguimientoRelacion — Validaciones de dominio (T079)', () => {
  describe('toggle() — Regla A4 (toggle bidireccional)', () => {
    it('cambia siguiendo de false a true', () => {
      const seguimiento = crearSeguimiento({ siguiendo: false })
      const toggled = seguimiento.toggle()

      expect(toggled.siguiendo).toBe(true)
    })

    it('cambia siguiendo de true a false', () => {
      const seguimiento = crearSeguimiento({ siguiendo: true })
      const toggled = seguimiento.toggle()

      expect(toggled.siguiendo).toBe(false)
    })

    it('retorna nueva instancia (value object immutable)', () => {
      const seguimiento = crearSeguimiento({ siguiendo: false })
      const toggled = seguimiento.toggle()

      expect(seguimiento).not.toBe(toggled)
      expect(seguimiento.siguiendo).toBe(false)
      expect(toggled.siguiendo).toBe(true)
    })

    it('mantiene usuarioId y usuarioASeguidoId al hacer toggle', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: false,
      })
      const toggled = seguimiento.toggle()

      expect(toggled.usuarioId).toBe('alice')
      expect(toggled.usuarioASeguidoId).toBe('bob')
    })

    it('permite toggle múltiple (invierte cada vez)', () => {
      let seguimiento = crearSeguimiento({ siguiendo: false })
      expect(seguimiento.siguiendo).toBe(false)

      seguimiento = seguimiento.toggle()
      expect(seguimiento.siguiendo).toBe(true)

      seguimiento = seguimiento.toggle()
      expect(seguimiento.siguiendo).toBe(false)

      seguimiento = seguimiento.toggle()
      expect(seguimiento.siguiendo).toBe(true)
    })
  })

  describe('esSiguiendo() — Verificación de estado', () => {
    it('retorna true cuando siguiendo es true', () => {
      const seguimiento = crearSeguimiento({ siguiendo: true })
      expect(seguimiento.esSiguiendo()).toBe(true)
    })

    it('retorna false cuando siguiendo es false', () => {
      const seguimiento = crearSeguimiento({ siguiendo: false })
      expect(seguimiento.esSiguiendo()).toBe(false)
    })

    it('alias de this.siguiendo', () => {
      const seguimientoTrue = crearSeguimiento({ siguiendo: true })
      const seguimientoFalse = crearSeguimiento({ siguiendo: false })

      expect(seguimientoTrue.esSiguiendo()).toBe(seguimientoTrue.siguiendo)
      expect(seguimientoFalse.esSiguiendo()).toBe(seguimientoFalse.siguiendo)
    })
  })

  describe('noEsSiguiendo() — Negación de estado', () => {
    it('retorna true cuando siguiendo es false', () => {
      const seguimiento = crearSeguimiento({ siguiendo: false })
      expect(seguimiento.noEsSiguiendo()).toBe(true)
    })

    it('retorna false cuando siguiendo es true', () => {
      const seguimiento = crearSeguimiento({ siguiendo: true })
      expect(seguimiento.noEsSiguiendo()).toBe(false)
    })

    it('es negación de esSiguiendo()', () => {
      const seguimientoTrue = crearSeguimiento({ siguiendo: true })
      const seguimientoFalse = crearSeguimiento({ siguiendo: false })

      expect(seguimientoTrue.noEsSiguiendo()).toBe(
        !seguimientoTrue.esSiguiendo(),
      )
      expect(seguimientoFalse.noEsSiguiendo()).toBe(
        !seguimientoFalse.esSiguiendo(),
      )
    })
  })

  describe('getBotonTexto() — Texto de botón según estado', () => {
    it('retorna "Dejar de seguir" cuando siguiendo es true', () => {
      const seguimiento = crearSeguimiento({ siguiendo: true })
      expect(seguimiento.getBotonTexto()).toBe('Dejar de seguir')
    })

    it('retorna "Seguir" cuando siguiendo es false', () => {
      const seguimiento = crearSeguimiento({ siguiendo: false })
      expect(seguimiento.getBotonTexto()).toBe('Seguir')
    })

    it('cambia texto después de toggle', () => {
      let seguimiento = crearSeguimiento({ siguiendo: false })
      expect(seguimiento.getBotonTexto()).toBe('Seguir')

      seguimiento = seguimiento.toggle()
      expect(seguimiento.getBotonTexto()).toBe('Dejar de seguir')

      seguimiento = seguimiento.toggle()
      expect(seguimiento.getBotonTexto()).toBe('Seguir')
    })
  })

  describe('HU-04 — Seguir a otra persona (A4: toggle bidireccional)', () => {
    it('estado inicial de no seguir', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: false,
      })
      expect(seguimiento.esSiguiendo()).toBe(false)
      expect(seguimiento.getBotonTexto()).toBe('Seguir')
    })

    it('tras presionar seguir, estado cambia a siguiendo', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: false,
      })
      const toggled = seguimiento.toggle()

      expect(toggled.esSiguiendo()).toBe(true)
      expect(toggled.getBotonTexto()).toBe('Dejar de seguir')
    })

    it('tras presionar dejar de seguir, vuelve al estado inicial', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: true,
      })
      const toggled = seguimiento.toggle()

      expect(toggled.esSiguiendo()).toBe(false)
      expect(toggled.getBotonTexto()).toBe('Seguir')
    })

    it('mantiene identidad de usuarios en la relación', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: false,
      })
      const toggled = seguimiento.toggle()

      // Relación unidireccional: alice sigue a bob
      expect(toggled.usuarioId).toBe('alice')
      expect(toggled.usuarioASeguidoId).toBe('bob')
    })
  })

  describe('AC-04.3 — Reflejo del nuevo estado en interfaz', () => {
    it('toggle proporciona nuevo estado para UI sin mutación', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'usuario-actual',
        usuarioASeguidoId: 'usuario-target',
        siguiendo: false,
      })

      const nuevoEstado = seguimiento.toggle()

      // Estado original sin cambios
      expect(seguimiento.siguiendo).toBe(false)
      // Nuevo estado para reflejar en UI
      expect(nuevoEstado.siguiendo).toBe(true)
    })

    it('múltiples toggles representan múltiples interacciones', () => {
      let estado = crearSeguimiento({ siguiendo: false })
      const historialEstados: boolean[] = []

      historialEstados.push(estado.siguiendo) // [false]

      estado = estado.toggle()
      historialEstados.push(estado.siguiendo) // [false, true]

      estado = estado.toggle()
      historialEstados.push(estado.siguiendo) // [false, true, false]

      expect(historialEstados).toEqual([false, true, false])
    })
  })

  describe('Casos extremos e inmutabilidad', () => {
    it('preserva propiedades de usuarios tras toggle', () => {
      const usuario1 = 'user-alice-12345'
      const usuario2 = 'user-bob-67890'

      let seguimiento = crearSeguimiento({
        usuarioId: usuario1,
        usuarioASeguidoId: usuario2,
        siguiendo: false,
      })

      const toggled = seguimiento.toggle()

      expect(toggled.usuarioId).toBe(usuario1)
      expect(toggled.usuarioASeguidoId).toBe(usuario2)
      expect(seguimiento.usuarioId).toBe(usuario1)
      expect(seguimiento.usuarioASeguidoId).toBe(usuario2)
    })

    it('toggle sucesivos no afectan instancia original', () => {
      const original = crearSeguimiento({ siguiendo: false })
      const toggled1 = original.toggle()
      const toggled2 = toggled1.toggle()
      const toggled3 = toggled2.toggle()

      // Original inmutable
      expect(original.siguiendo).toBe(false)
      expect(toggled1.siguiendo).toBe(true)
      expect(toggled2.siguiendo).toBe(false)
      expect(toggled3.siguiendo).toBe(true)

      // Todas son instancias distintas
      expect(original).not.toBe(toggled1)
      expect(toggled1).not.toBe(toggled2)
      expect(toggled2).not.toBe(toggled3)
    })

    it('diferentes relaciones son independientes', () => {
      const rel1 = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: false,
      })
      const rel2 = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'charlie',
        siguiendo: false,
      })

      const rel1Toggled = rel1.toggle()
      const rel2Toggled = rel2.toggle()

      // Rel1: alice sigue a bob
      expect(rel1Toggled.usuarioId).toBe('alice')
      expect(rel1Toggled.usuarioASeguidoId).toBe('bob')
      expect(rel1Toggled.siguiendo).toBe(true)

      // Rel2: alice sigue a charlie
      expect(rel2Toggled.usuarioId).toBe('alice')
      expect(rel2Toggled.usuarioASeguidoId).toBe('charlie')
      expect(rel2Toggled.siguiendo).toBe(true)

      // Independientes
      expect(rel1Toggled).not.toBe(rel2Toggled)
    })

    it('value object sin métodos mutadores', () => {
      const seguimiento = crearSeguimiento({ siguiendo: false })
      const originalSiguiendo = seguimiento.siguiendo

      // No hay métodos que muten el estado
      seguimiento.toggle()
      seguimiento.esSiguiendo()
      seguimiento.noEsSiguiendo()
      seguimiento.getBotonTexto()

      // Estado original no cambia
      expect(seguimiento.siguiendo).toBe(originalSiguiendo)
    })
  })

  describe('Representación de relación seguidor/seguido', () => {
    it('estructura correcta: (quien sigue) → (a quién sigue)', () => {
      const seguimiento = crearSeguimiento({
        usuarioId: 'usuario-activo',
        usuarioASeguidoId: 'usuario-a-seguir',
        siguiendo: false,
      })

      // usuario-activo es quien ejecuta la acción
      expect(seguimiento.usuarioId).toBe('usuario-activo')
      // usuario-a-seguir es el objetivo
      expect(seguimiento.usuarioASeguidoId).toBe('usuario-a-seguir')
    })

    it('permite toggle simétrico para relaciones inversas', () => {
      const rel1 = crearSeguimiento({
        usuarioId: 'alice',
        usuarioASeguidoId: 'bob',
        siguiendo: false,
      })
      const rel2 = crearSeguimiento({
        usuarioId: 'bob',
        usuarioASeguidoId: 'alice',
        siguiendo: false,
      })

      const rel1Toggled = rel1.toggle()
      const rel2Toggled = rel2.toggle()

      // Relaciones independientes pero simétricas
      expect(rel1Toggled.usuarioId).toBe(rel2.usuarioASeguidoId)
      expect(rel1Toggled.usuarioASeguidoId).toBe(rel2.usuarioId)
      expect(rel1Toggled.siguiendo).toBe(true)
      expect(rel2Toggled.siguiendo).toBe(true)
    })
  })
})
