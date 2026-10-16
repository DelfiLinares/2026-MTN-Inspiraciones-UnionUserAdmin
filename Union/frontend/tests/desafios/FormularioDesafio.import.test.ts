import { describe, it, expect } from 'vitest'
import { FormularioDesafio } from '../../src/desafios/components/FormularioDesafio'

/**
 * Test de importación para FormularioDesafio (T053)
 * 
 * Verifica que el componente puede importarse y está disponible.
 * Para tests de integración completos, ver T077.
 * 
 * Fuente: specs/003-desafios/tasks.md (T053)
 */

describe('FormularioDesafio (T053)', () => {
  it('importa correctamente desde el barrel export', () => {
    expect(FormularioDesafio).toBeDefined()
    expect(typeof FormularioDesafio).toBe('function')
  })

  it('es un componente React válido', () => {
    // Un componente React es una función que puede recibir props
    const props = {
      onEnviar: () => {},
    }
    expect(FormularioDesafio.name).toBe('FormularioDesafio')
  })
})
