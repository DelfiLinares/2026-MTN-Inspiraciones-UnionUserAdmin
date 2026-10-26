import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ControlDistancia } from '../../../src/components/busqueda/ControlDistancia'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import type { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'

describe('ControlDistancia (A-02)', () => {
  it('muestra los rangos deshabilitados y avisa que hace falta la ubicación', () => {
    render(
      <ControlDistancia
        criterios={CriteriosBusqueda.vacio()}
        onAplicar={vi.fn()}
        onQuitar={vi.fn()}
      />,
    )

    const grupo = within(screen.getByRole('group', { name: /^distancia$/i }))
    const opciones = grupo.getAllByRole('checkbox')
    expect(opciones).toHaveLength(3)
    for (const opcion of opciones) expect(opcion).toBeDisabled()
    expect(grupo.getByText(/ubicaci[oó]n/i)).toBeInTheDocument()
  })

  it('no aplica filtros al intentar seleccionar un rango', () => {
    const onAplicar = vi.fn<(filtro: FiltroActivo) => void>()
    const onQuitar = vi.fn<(filtro: FiltroActivo) => void>()

    render(
      <ControlDistancia
        criterios={CriteriosBusqueda.vacio()}
        onAplicar={onAplicar}
        onQuitar={onQuitar}
      />,
    )

    fireEvent.click(screen.getByRole('checkbox', { name: /hasta 5 km/i }))

    expect(onAplicar).not.toHaveBeenCalled()
    expect(onQuitar).not.toHaveBeenCalled()
  })
})
