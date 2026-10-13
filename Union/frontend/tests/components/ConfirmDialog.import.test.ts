/**
 * Prueba básica de importación para `ConfirmDialog`
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/tasks.md (T006, T052)
 */

import { describe, it, expect } from 'vitest'
import { ConfirmDialog } from '../../src/components/ConfirmDialog'

describe('ConfirmDialog - Importación', () => {
  it('puede ser importado correctamente', () => {
    expect(ConfirmDialog).toBeDefined()
    expect(typeof ConfirmDialog).toBe('function')
  })
})
