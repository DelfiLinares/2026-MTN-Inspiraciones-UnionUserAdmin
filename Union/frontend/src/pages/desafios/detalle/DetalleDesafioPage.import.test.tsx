import { describe, it, expect } from 'vitest'
import { DetalleDesafioPage } from './DetalleDesafioPage'
import React from 'react'

describe('DetalleDesafioPage.import', () => {
  it('exporta el componente', () => {
    expect(DetalleDesafioPage).toBeDefined()
  })

  it('es un componente React válido', () => {
    expect(typeof DetalleDesafioPage).toBe('function')
  })
})
