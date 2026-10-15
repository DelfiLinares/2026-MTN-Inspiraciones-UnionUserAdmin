import { describe, expect, it } from 'vitest'
import { ListadoDesafiosPage } from '../../src/pages/desafios/listado'

describe('ListadoDesafiosPage import (T057)', () => {
  it('exporta el componente desde su index', () => {
    expect(ListadoDesafiosPage).toBeDefined()
  })

  it('es un componente React válido', () => {
    expect(typeof ListadoDesafiosPage).toBe('function')
  })
})
