import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { DashboardService } from '../../src/services/DashboardService'
import type { HttpClient } from '../../src/application/ports/HttpClient'

const obtenerIndicadores = vi.fn()

vi.mock('../../src/services/DashboardService', async (importOriginal: () => Promise<unknown>) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return { ...actual, dashboardService: { obtenerIndicadores: () => obtenerIndicadores() } }
})

const dtoBack = {
  reportesPendientes: 4,
  usuariosActivos: 10,
  usuariosBaneados: 1,
  publicacionesActivas: 20,
  publicacionesEliminadas: 3,
}

describe('Dashboard con el contrato real del back', () => {
  it('DashboardService llama a /admin/dashboard y deja los indicadores de desafíos sin valor', async () => {
    const client = { get: vi.fn().mockResolvedValue(dtoBack) } as unknown as HttpClient

    const indicadores = await new DashboardService(client).obtenerIndicadores()

    expect(client.get).toHaveBeenCalledWith('/admin/dashboard', undefined)
    expect(indicadores.reportesPendientes).toBe(4)
    expect(indicadores.desafiosPendientes).toBeUndefined()
    expect(indicadores.desafiosAprobadosRechazados).toBeUndefined()
  })

  it('DashboardPage oculta las tarjetas de desafíos cuando no hay dato', async () => {
    const { DashboardPage } = await import('../../src/presentation/dashboard/DashboardPage')
    obtenerIndicadores.mockResolvedValue({ ...dtoBack })

    render(React.createElement(DashboardPage))

    await waitFor(() => expect(screen.getByText('Reportes pendientes')).toBeTruthy())
    expect(screen.queryByText('Desafíos pendientes')).toBeNull()
    expect(screen.queryByText('Desafíos decididos')).toBeNull()
    expect(screen.getByText('Usuarios baneados')).toBeTruthy()
  })
})
