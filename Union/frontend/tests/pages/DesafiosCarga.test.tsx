import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ListadoDesafiosPage } from '../../src/pages/desafios/listado/ListadoDesafiosPage'
import { httpClient } from '../../src/infrastructure/httpClient'

vi.mock('../../src/infrastructure/httpClient', () => ({ httpClient: { get: vi.fn() } }))

describe('Carga de desafíos sin peticiones en bucle', () => {
  it('mantiene el error hasta que se pulsa reintentar y no vuelve a cargar automáticamente', async () => {
    vi.mocked(httpClient.get).mockImplementation(async (path) => {
      if (path === '/ambitos') return [] as never
      throw new Error('Servicio no disponible')
    })
    render(<MemoryRouter><ListadoDesafiosPage /></MemoryRouter>)
    await screen.findByText('No se pudieron cargar los desafíos. Intentá nuevamente.')
    const contar = () => vi.mocked(httpClient.get).mock.calls.filter(([ruta]) => ruta === '/desafios').length
    expect(contar()).toBe(1)
    expect(screen.queryByText('Cargando desafíos...')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))
    await waitFor(() => expect(contar()).toBe(2))
    await screen.findByText('No se pudieron cargar los desafíos. Intentá nuevamente.')
    expect(contar()).toBe(2)
  })
})
