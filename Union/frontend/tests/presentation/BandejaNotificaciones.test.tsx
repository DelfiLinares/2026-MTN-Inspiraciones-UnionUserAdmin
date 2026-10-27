import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NotificacionesPage } from '../../src/pages/notificaciones/NotificacionesPage'
import { notificacionesService } from '../../src/services/notificacionesService'
vi.mock('../../src/services/notificacionesService', () => ({ notificacionesService: { pendientes: vi.fn(), marcarLeida: vi.fn(), marcarTodasLeidas: vi.fn() } }))
const aviso = { id: 'aviso', tipo: 'COMMENT' as const, titulo: 'Nuevo comentario', mensaje: 'Artista comentó tu publicación.', publicacionId: 'post', createdAt: '2026-10-27T10:00:00Z' }
function abrir() { render(<MemoryRouter><NotificacionesPage /></MemoryRouter>) }
describe('Bandeja de avisos no vistos', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(notificacionesService.pendientes).mockResolvedValue([aviso]); vi.mocked(notificacionesService.marcarLeida).mockResolvedValue(undefined) })
  it('muestra avisos y ofrece configuración aparte; marcar uno lo quita solo al guardar', async () => {
    abrir(); await screen.findByText('Artista comentó tu publicación.')
    expect(screen.getByRole('link', { name: 'Configuración' })).toHaveAttribute('href', '/notificaciones/configuracion')
    expect(screen.queryByRole('checkbox')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como leída' }))
    await screen.findByText('Estás al día')
    expect(notificacionesService.marcarLeida).toHaveBeenCalledWith('aviso')
  })
  it('conserva el aviso cuando falla el guardado', async () => {
    vi.mocked(notificacionesService.marcarLeida).mockRejectedValue(new Error('offline'))
    abrir(); await screen.findByText('Nuevo comentario')
    fireEvent.click(screen.getByRole('button', { name: 'Marcar como leída' }))
    await screen.findByRole('alert')
    expect(screen.getByText('Nuevo comentario')).toBeInTheDocument()
  })
  it('permite recuperarse de una carga fallida', async () => {
    vi.mocked(notificacionesService.pendientes).mockRejectedValueOnce(new Error('offline'))
    abrir(); await screen.findByRole('alert')
    fireEvent.click(screen.getByRole('button', { name: 'Actualizar' }))
    await screen.findByText('Nuevo comentario')
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })
})
