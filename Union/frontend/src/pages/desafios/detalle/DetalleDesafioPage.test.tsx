import { describe, it, expect } from 'vitest'
import { DetalleDesafioPage } from './DetalleDesafioPage'

describe('DetalleDesafioPage', () => {
  it('exporta el componente correctamente', () => {
    expect(DetalleDesafioPage).toBeDefined()
    expect(typeof DetalleDesafioPage).toBe('function')
  })
})
