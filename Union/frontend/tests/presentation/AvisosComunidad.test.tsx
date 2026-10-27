import { act, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AvisosComunidad } from '../../src/presentation/shared/AvisosComunidad'
import type { AvisoPush } from '../../src/services/activarPush'

const estado = vi.hoisted(() => ({ usuario: { id: 'persona' } as { id: string } | null, escuchar: vi.fn() }))
vi.mock('../../src/services/AuthContext', () => ({ useAuth: () => ({ usuario: estado.usuario }) }))
vi.mock('../../src/services/activarPush', () => ({ escucharPush: estado.escuchar }))

describe('Avisos recibidos de Firebase', () => {
  beforeEach(() => { estado.usuario = { id: 'persona' }; estado.escuchar.mockReset() })
  it('muestra el aviso y deja de escuchar al cerrar sesión', async () => {
    let recibir!: (aviso: AvisoPush) => void
    const cancelar = vi.fn()
    estado.escuchar.mockImplementation(async callback => { recibir = callback; return cancelar })
    const vista = render(<MemoryRouter><AvisosComunidad /></MemoryRouter>)
    await waitFor(() => expect(estado.escuchar).toHaveBeenCalledOnce())
    act(() => recibir({ titulo: 'Nuevo comentario', mensaje: 'Comentario recibido.', publicacionId: 'publicacion-qa' }))
    expect(screen.getByRole('link', { name: 'Ver publicación' })).toHaveAttribute('href', '/publicaciones/publicacion-qa')
    estado.usuario = null
    vista.rerender(<MemoryRouter><AvisosComunidad /></MemoryRouter>)
    expect(cancelar).toHaveBeenCalledOnce()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    act(() => recibir({ titulo: 'Tardío', mensaje: 'No debe aparecer' }))
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
  it('renueva la escucha después de activar permisos y limpia la suscripción anterior', async () => {
    const cancelar = vi.fn()
    estado.escuchar.mockResolvedValue(cancelar)
    const vista = render(<MemoryRouter><AvisosComunidad /></MemoryRouter>)
    await waitFor(() => expect(estado.escuchar).toHaveBeenCalledOnce())
    act(() => window.dispatchEvent(new Event('inspiraciones:push-activado')))
    await waitFor(() => expect(estado.escuchar).toHaveBeenCalledTimes(2))
    expect(cancelar).toHaveBeenCalledOnce()
    vista.unmount()
    expect(cancelar).toHaveBeenCalledTimes(2)
  })
})
