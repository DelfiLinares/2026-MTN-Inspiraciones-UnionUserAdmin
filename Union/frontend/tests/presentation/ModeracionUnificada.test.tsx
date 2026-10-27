import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ModeracionDetalleReporte } from '../../src/presentation/moderacion/ModeracionDetalleReporte'
import { httpClientAdmin } from '../../src/infrastructure/httpClientAdmin'
vi.mock('../../src/infrastructure/httpClientAdmin', () => ({ httpClientAdmin: { get: vi.fn(), post: vi.fn() } }))
const detalle = { id: 'r1', motivo: 'SPAM', prioridad: 'MEDIA', estadoModeracion: 'PENDIENTE', fechaCreacion: '2026-10-27T10:00:00Z',
  objetivo: { tipo: 'COMENTARIO', id: 'c1', publicacionId: 'p1' }, contenidoObjetivo: { contenido: 'Contenido del comentario' } }
describe('Moderación unificada', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(httpClientAdmin.get).mockResolvedValue(detalle); vi.mocked(httpClientAdmin.post).mockResolvedValue({}) })
  it('muestra el contrato actual sin pedir la identidad del reportante y exige motivo', async () => {
    render(<ModeracionDetalleReporte reporteId="r1" onVolver={vi.fn()} />)
    await screen.findByText('Contenido del comentario')
    expect(screen.getByRole('button', { name: 'Ocultar comentario' })).toBeDisabled()
    expect(screen.queryByText('Reportante')).toBeNull()
    fireEvent.change(screen.getByLabelText('Motivo de la decisión'), { target: { value: 'Spam repetido' } })
    expect(screen.getByRole('button', { name: 'Ocultar comentario' })).toBeEnabled()
  })
  it('resuelve con motivo solo después de confirmar y recarga el estado', async () => {
    render(<ModeracionDetalleReporte reporteId="r1" onVolver={vi.fn()} />)
    await screen.findByText('Contenido del comentario')
    fireEvent.change(screen.getByLabelText('Motivo de la decisión'), { target: { value: ' No viola las normas ' } })
    fireEvent.click(screen.getByRole('button', { name: 'Desestimar reporte' }))
    expect(httpClientAdmin.post).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    await screen.findByText('La decisión quedó guardada.')
    expect(httpClientAdmin.post).toHaveBeenCalledWith('/admin/reportes/r1/rechazar', { motivoAdmin: 'No viola las normas' })
  })
  it('un error de red no anuncia una decisión exitosa', async () => {
    vi.mocked(httpClientAdmin.post).mockRejectedValue(new Error('offline'))
    render(<ModeracionDetalleReporte reporteId="r1" onVolver={vi.fn()} />)
    await screen.findByText('Contenido del comentario')
    fireEvent.change(screen.getByLabelText('Motivo de la decisión'), { target: { value: 'Revisión terminada' } })
    fireEvent.click(screen.getByRole('button', { name: 'Resolver sin retirar contenido' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    await screen.findByRole('alert')
    expect(screen.queryByText('La decisión quedó guardada.')).toBeNull()
  })
})
