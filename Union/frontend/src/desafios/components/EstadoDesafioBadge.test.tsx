import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { EstadoDesafioBadge } from './EstadoDesafioBadge'

/**
 * T075 - Pruebas de EstadoDesafioBadge
 *
 * Verifica:
 * - Texto del estado mostrado correctamente
 * - Clases CSS aplicadas según el estado
 * - Manejo de estado undefined (muestra "Desconocido")
 * - Accesibilidad: role="status"
 */

describe('EstadoDesafioBadge (T075)', () => {
  describe('Texto del estado', () => {
    it('debe mostrar el texto del estado cuando está definido', () => {
      const { container } = render(<EstadoDesafioBadge estado="ACTIVO" />)
      const badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('ACTIVO')
    })

    it('debe mostrar "Desconocido" cuando el estado es undefined', () => {
      const { container } = render(<EstadoDesafioBadge estado={undefined} />)
      const badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('Desconocido')
    })

    it('debe normalizar el texto a minúsculas para la clase CSS pero mantener el formato original en el texto', () => {
      const { container } = render(<EstadoDesafioBadge estado="PROGRAMADO" />)
      const badge = container.querySelector('.estado-programado')
      expect(badge).not.toBeNull()
      expect(badge?.textContent).toBe('PROGRAMADO')
    })
  })

  describe('Clases CSS', () => {
    it('debe aplicar clase CSS estado-activo cuando el estado es ACTIVO', () => {
      const { container } = render(<EstadoDesafioBadge estado="ACTIVO" />)
      expect(container.querySelector('.estado-activo')).not.toBeNull()
    })

    it('debe aplicar clase CSS estado-programado cuando el estado es PROGRAMADO', () => {
      const { container } = render(<EstadoDesafioBadge estado="PROGRAMADO" />)
      expect(container.querySelector('.estado-programado')).not.toBeNull()
    })

    it('debe aplicar clase CSS estado-finalizado cuando el estado es FINALIZADO', () => {
      const { container } = render(<EstadoDesafioBadge estado="FINALIZADO" />)
      expect(container.querySelector('.estado-finalizado')).not.toBeNull()
    })

    it('debe aplicar clase CSS estado-eliminado cuando el estado es ELIMINADO', () => {
      const { container } = render(<EstadoDesafioBadge estado="ELIMINADO" />)
      expect(container.querySelector('.estado-eliminado')).not.toBeNull()
    })

    it('debe aplicar clase "estado-desconocido" cuando el estado es undefined', () => {
      const { container } = render(<EstadoDesafioBadge />)
      expect(container.querySelector('.estado-desconocido')).not.toBeNull()
    })

    it('debe aplicar clase "estado-badge" siempre', () => {
      const { container } = render(<EstadoDesafioBadge estado="ACTIVO" />)
      expect(container.querySelector('.estado-badge')).not.toBeNull()
    })

    it('debe aplicar clases adicionales pasadas mediante className prop', () => {
      const { container } = render(
        <EstadoDesafioBadge estado="ACTIVO" className="mi-clase-extra" />,
      )
      const badge = container.querySelector('.estado-badge')
      expect(badge?.className).toContain('mi-clase-extra')
      expect(badge?.className).toContain('estado-activo')
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener role="status" para screen readers', () => {
      const { container } = render(<EstadoDesafioBadge estado="ACTIVO" />)
      const badge = container.querySelector('[role="status"]')
      expect(badge).not.toBeNull()
    })

    it('debe ser accesible cuando se actualiza el estado (aria-live implícito)', () => {
      const { rerender, container } = render(<EstadoDesafioBadge estado="PROGRAMADO" />)
      let badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('PROGRAMADO')

      rerender(<EstadoDesafioBadge estado="ACTIVO" />)
      badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('ACTIVO')
    })
  })

  describe('Casos especiales', () => {
    it('debe manejar estados con espacios en blanco', () => {
      const { container } = render(<EstadoDesafioBadge estado="  ACTIVO  " />)
      const badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('  ACTIVO  ')
    })

    it('debe manejar strings vacíos mostrando "Desconocido"', () => {
      const { container } = render(<EstadoDesafioBadge estado="" />)
      const badge = container.querySelector('.estado-badge')
      expect(badge?.textContent).toBe('Desconocido')
    })
  })
})
