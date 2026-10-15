import { describe, it, expect } from 'vitest'
import { ListadoDesafiosAdminPage } from './ListadoDesafiosAdminPage'

/**
 * T064 - Import Test: ListadoDesafiosAdminPage
 * 
 * Verifica que la página se pueda importar correctamente.
 * Este es un test básico de integración de módulos.
 * 
 * Fuente: specs/003-desafios/tasks.md (T064)
 */
describe('ListadoDesafiosAdminPage', () => {
  it('debe ser un componente React válido', () => {
    expect(ListadoDesafiosAdminPage).toBeDefined()
    expect(typeof ListadoDesafiosAdminPage).toBe('function')
  })

  it('debe tener el nombre correcto', () => {
    expect(ListadoDesafiosAdminPage.name).toBe('ListadoDesafiosAdminPage')
  })
})
