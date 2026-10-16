import { describe, it, expect } from 'vitest'
import { ListaRespuestas } from '../../src/desafios/components'

describe('ListaRespuestas import', () => {
  it('debe exportar ListaRespuestas desde barrel export', () => {
    expect(ListaRespuestas).toBeDefined()
  })

  it('debe ser un componente React válido', () => {
    expect(typeof ListaRespuestas).toBe('function')
  })
})
