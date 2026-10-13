import { describe, it, expect } from 'vitest'
import { FormularioRespuesta } from '../../src/desafios/components'

describe('FormularioRespuesta import', () => {
  it('debe exportar FormularioRespuesta desde barrel export', () => {
    expect(FormularioRespuesta).toBeDefined()
  })

  it('debe ser un componente React válido', () => {
    expect(typeof FormularioRespuesta).toBe('function')
  })
})
