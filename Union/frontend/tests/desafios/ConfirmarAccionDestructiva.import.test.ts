/**
 * Prueba básica de importación para `ConfirmarAccionDestructiva`
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/spec.md (RF-22, RNF-01)
 * - Union/specs/003-desafios/tasks.md (T052, T073)
 */

import { describe, it, expect } from 'vitest'
import { ConfirmarAccionDestructiva } from '../../src/desafios/components/ConfirmarAccionDestructiva'

describe('ConfirmarAccionDestructiva - Importación', () => {
  it('puede ser importado correctamente', () => {
    expect(ConfirmarAccionDestructiva).toBeDefined()
    expect(typeof ConfirmarAccionDestructiva).toBe('function')
  })
})
