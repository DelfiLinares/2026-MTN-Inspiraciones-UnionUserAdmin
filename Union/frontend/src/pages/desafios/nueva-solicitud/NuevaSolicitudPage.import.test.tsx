import { describe, it, expect } from 'vitest'
import { NuevaSolicitudPage } from './NuevaSolicitudPage'

describe('NuevaSolicitudPage', () => {
  it('exporta el componente correctamente', () => {
    expect(NuevaSolicitudPage).toBeDefined()
    expect(typeof NuevaSolicitudPage).toBe('function')
  })
})
