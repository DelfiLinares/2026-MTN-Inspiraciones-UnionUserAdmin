import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { FiltrosDesafio } from './FiltrosDesafio'

/**
 * T076 - Pruebas de FiltrosDesafio
 *
 * Verifica:
 * - Sincronización con la URL (filtros reflejados en query params)
 * - Limpieza de filtros (HU-10)
 * - Selección de estado (dropdown)
 * - Selección múltiple de ámbitos (checkboxes)
 * - Accesibilidad: labels, descripciones, roles
 */

describe('FiltrosDesafio (T076)', () => {
  const ambitos = ['Ambiente', 'Educación', 'Salud']
  const filtrosVacios = {
    ambitos: [],
    estado: undefined,
  }
  const filtrosConEstado = {
    ambitos: [],
    estado: 'ACTIVO' as const,
  }
  const filtrosConAmbitos = {
    ambitos: ['Ambiente', 'Educación'],
    estado: undefined,
  }

  describe('Renderizado inicial', () => {
    it('debe renderizar select de estado con opción "Todos"', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const select = container.querySelector('#filtro-estado')
      expect(select).not.toBeNull()
      expect(select?.textContent).toContain('Todos')
    })

    it('debe renderizar checkboxes para cada ámbito', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(3)
    })

    it('debe mostrar los nombres de los ámbitos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      expect(container.textContent).toContain('Ambiente')
      expect(container.textContent).toContain('Educación')
      expect(container.textContent).toContain('Salud')
    })

    it('no debe mostrar botón "Limpiar filtros" cuando no hay filtros activos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const btnLimpiar = container.querySelector('.filtro-limpiar')
      expect(btnLimpiar).toBeNull()
    })
  })

  describe('Sincronización con la URL - Estado', () => {
    it('debe reflejar estado seleccionado en el select', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosConEstado}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const select = container.querySelector('#filtro-estado') as HTMLSelectElement
      expect(select?.value).toBe('ACTIVO')
    })

    it('debe mostrar las tres opciones de estado en el select', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const options = container.querySelectorAll('#filtro-estado option')
      expect(options.length).toBe(4) // Todos + 3 estados
      expect(options[0].textContent).toBe('Todos')
      expect(options[1].textContent).toBe('Programado')
      expect(options[2].textContent).toBe('Activo')
      expect(options[3].textContent).toBe('Finalizado')
    })

    it('debe tener atributos value correctos en las opciones', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const options = container.querySelectorAll('#filtro-estado option') as NodeListOf<
        HTMLOptionElement
      >
      expect(options[0].value).toBe('')
      expect(options[1].value).toBe('PROGRAMADO')
      expect(options[2].value).toBe('ACTIVO')
      expect(options[3].value).toBe('FINALIZADO')
    })
  })

  describe('Sincronización con la URL - Ámbitos', () => {
    it('debe reflejar ámbitos seleccionados en los checkboxes', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosConAmbitos}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const checkboxes = container.querySelectorAll('input[type="checkbox"]') as NodeListOf<
        HTMLInputElement
      >
      expect(checkboxes[0].checked).toBe(true) // Ambiente
      expect(checkboxes[1].checked).toBe(true) // Educación
      expect(checkboxes[2].checked).toBe(false) // Salud
    })

    it('debe mantener el estado al cambiar ámbitos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosConEstado}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      // Verificar que el estado está presente
      const select = container.querySelector('#filtro-estado') as HTMLSelectElement
      expect(select?.value).toBe('ACTIVO')
    })

    it('debe tener atributos value en los checkboxes', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const checkboxes = container.querySelectorAll('input[type="checkbox"]') as NodeListOf<
        HTMLInputElement
      >
      expect(checkboxes[0].value).toBe('Ambiente')
      expect(checkboxes[1].value).toBe('Educación')
      expect(checkboxes[2].value).toBe('Salud')
    })
  })

  describe('Limpieza de filtros (HU-10)', () => {
    it('debe mostrar botón "Limpiar filtros" cuando hay filtros activos por estado', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosConEstado}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const btnLimpiar = container.querySelector('.filtro-limpiar')
      expect(btnLimpiar).not.toBeNull()
      expect(btnLimpiar?.textContent).toContain('Limpiar filtros')
    })

    it('debe mostrar botón "Limpiar filtros" cuando hay filtros activos por ámbitos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosConAmbitos}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const btnLimpiar = container.querySelector('.filtro-limpiar')
      expect(btnLimpiar).not.toBeNull()
    })

    it('debe llamar onFiltrosChange con filtros vacíos al hacer click en "Limpiar filtros"', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={{
            ambitos: ['Ambiente'],
            estado: 'ACTIVO',
          }}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const btnLimpiar = container.querySelector('.filtro-limpiar') as HTMLButtonElement
      btnLimpiar?.dispatchEvent(new Event('click', { bubbles: true }))

      expect(onFiltrosChange).toHaveBeenCalledWith({
        ambitos: [],
        estado: undefined,
      })
    })

    it('debe limpiar tanto estado como ámbitos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={{
            ambitos: ['Ambiente', 'Educación'],
            estado: 'PROGRAMADO',
          }}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const btnLimpiar = container.querySelector('.filtro-limpiar') as HTMLButtonElement
      btnLimpiar?.dispatchEvent(new Event('click', { bubbles: true }))

      const ultimaLlamada = onFiltrosChange.mock.calls[onFiltrosChange.mock.calls.length - 1][0]
      expect(ultimaLlamada.ambitos).toEqual([])
      expect(ultimaLlamada.estado).toBeUndefined()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener label asociado al select de estado', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const label = container.querySelector('label[for="filtro-estado"]')
      expect(label).not.toBeNull()
      expect(label?.textContent).toContain('Estado')
    })

    it('debe tener fieldset y legend para ámbitos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const fieldset = container.querySelector('fieldset')
      const legend = container.querySelector('legend')
      expect(fieldset).not.toBeNull()
      expect(legend).not.toBeNull()
      expect(legend?.textContent).toContain('Ámbitos')
    })

    it('debe tener aria-describedby en el select de estado', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const select = container.querySelector('#filtro-estado')
      expect(select?.getAttribute('aria-describedby')).toBe('filtro-estado-descripcion')
    })

    it('debe tener role="group" en los ámbitos', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const group = container.querySelector('[role="group"]')
      expect(group).not.toBeNull()
    })

    it('debe tener aria-label en el botón "Limpiar filtros"', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosConEstado}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const btnLimpiar = container.querySelector('.filtro-limpiar')
      expect(btnLimpiar?.getAttribute('aria-label')).toBe('Limpiar todos los filtros')
    })

    it('debe tener sección con aria-label "Filtros de desafíos"', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )
      const section = container.querySelector('[aria-label="Filtros de desafíos"]')
      expect(section).not.toBeNull()
    })
  })

  describe('Casos especiales', () => {
    it('debe manejar lista de ámbitos vacía', () => {
      const onFiltrosChange = vi.fn()
      const { container } = render(
        <FiltrosDesafio filtros={filtrosVacios} ambitos={[]} onFiltrosChange={onFiltrosChange} />,
      )
      const checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(0)
    })

    it('debe actualizar cuando cambian los props filtros', () => {
      const onFiltrosChange = vi.fn()
      const { rerender, container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )

      rerender(
        <FiltrosDesafio
          filtros={filtrosConEstado}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )

      const select = container.querySelector('#filtro-estado') as HTMLSelectElement
      expect(select?.value).toBe('ACTIVO')
    })

    it('debe manejar cambios en la lista de ámbitos disponibles', () => {
      const onFiltrosChange = vi.fn()
      const { rerender, container } = render(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={ambitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )

      let checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(3)

      const nuevoAmbitos = ['Ambiente', 'Educación', 'Salud', 'Tecnología']
      rerender(
        <FiltrosDesafio
          filtros={filtrosVacios}
          ambitos={nuevoAmbitos}
          onFiltrosChange={onFiltrosChange}
        />,
      )

      checkboxes = container.querySelectorAll('input[type="checkbox"]')
      expect(checkboxes.length).toBe(4)
    })
  })
})
