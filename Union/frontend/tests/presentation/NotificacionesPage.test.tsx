import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ConfiguracionNotificacionesPage as NotificacionesPage } from '../../src/pages/notificaciones/ConfiguracionNotificacionesPage'
import { notificacionesService } from '../../src/services/notificacionesService'
vi.mock('../../src/services/notificacionesService', () => ({ notificacionesService: { obtener: vi.fn(), guardar: vi.fn() } }))
const preferencias = [{ tipoEvento: 'LIKE', activo: true }, { tipoEvento: 'COMMENT', activo: true }, { tipoEvento: 'NEW_POST', activo: false }]
function abrir() { render(<MemoryRouter initialEntries={[{ pathname: '/notificaciones/configuracion', state: { destino: '/feed' } }]}><Routes><Route path="/notificaciones/configuracion" element={<NotificacionesPage />} /><Route path="/feed" element={<p>Tu feed</p>} /></Routes></MemoryRouter>) }
describe('Preferencias de notificaciones', () => {
  beforeEach(() => { vi.clearAllMocks(); vi.mocked(notificacionesService.obtener).mockResolvedValue({ userId: 'u', preferencias: preferencias as never }); vi.mocked(notificacionesService.guardar).mockResolvedValue({ userId: 'u', preferencias: preferencias as never }) })
  it('carga preferencias, cambia una y conserva las restantes al guardar', async () => {
    abrir()
    fireEvent.click(await screen.findByRole('checkbox', { name: /Me gusta/ }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar y continuar' }))
    await screen.findByText('Tu feed')
    expect(notificacionesService.guardar).toHaveBeenCalledWith(expect.arrayContaining([{ tipoEvento: 'LIKE', activo: false }, { tipoEvento: 'NEW_POST', activo: false }]))
  })
  it('no anuncia éxito cuando el servidor rechaza el guardado', async () => {
    vi.mocked(notificacionesService.guardar).mockRejectedValue(new Error('offline'))
    abrir(); fireEvent.click(await screen.findByRole('button', { name: 'Guardar y continuar' }))
    await screen.findByRole('alert')
    expect(screen.queryByText('Tu feed')).toBeNull()
  })
  it('permite continuar si el módulo está caído sin simular un guardado', async () => {
    vi.mocked(notificacionesService.obtener).mockRejectedValue(new Error('offline'))
    abrir(); await screen.findByRole('alert')
    expect(screen.getByRole('button', { name: 'Guardar y continuar' })).toBeDisabled()
    fireEvent.click(screen.getByRole('link', { name: 'Ahora no' }))
    await waitFor(() => expect(screen.getByText('Tu feed')).toBeInTheDocument())
    expect(notificacionesService.guardar).not.toHaveBeenCalled()
  })
  it('sale de la carga y permite continuar cuando el servidor no responde', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(notificacionesService.obtener).mockImplementation(signal => new Promise((_resolve, reject) => {
        signal?.addEventListener('abort', () => reject(new DOMException('Cancelado', 'AbortError')))
      }))
      abrir()
      await act(async () => { await vi.advanceTimersByTimeAsync(10000) })
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.queryByText('Cargando tus preferencias…')).toBeNull()
      expect(screen.getByRole('link', { name: 'Ahora no' })).toBeInTheDocument()
    } finally { vi.useRealTimers() }
  })
})
