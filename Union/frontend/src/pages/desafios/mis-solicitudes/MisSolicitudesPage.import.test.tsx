import { describe, it, expect } from 'vitest'
import { MisSolicitudesPage } from './MisSolicitudesPage'

describe('MisSolicitudesPage', () => {
  it('exporta el componente correctamente', () => {
    expect(MisSolicitudesPage).toBeDefined()
    expect(typeof MisSolicitudesPage).toBe('function')
  })
})
