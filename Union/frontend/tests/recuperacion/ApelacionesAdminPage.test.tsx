// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApelacionesAdminPage } from '../../src/presentation/apelaciones/ApelacionesAdminPage'
import type { Apelacion, AppealsAdminService } from '../../src/application/appealsAdminService'
import { EstadoApelacion } from '../../src/domain/recuperacion'

afterEach(cleanup)

const apelacion: Apelacion = {
  id: 'a1',
  usuarioId: 'u1',
  username: 'maria',
  email: 'maria@mail.com',
  mensaje: 'Fue un malentendido.',
  estado: EstadoApelacion.PENDIENTE,
  creadaEn: '2026-10-20T10:00:00Z',
}

function montar(overrides: Partial<AppealsAdminService> = {}) {
  const service: AppealsAdminService = {
    listar: vi.fn().mockResolvedValue({ contenido: [apelacion], pagina: 0, tamanio: 20, totalElementos: 1 }),
    aceptar: vi.fn().mockResolvedValue({ ...apelacion, estado: EstadoApelacion.ACEPTADA }),
    rechazar: vi.fn().mockResolvedValue({ ...apelacion, estado: EstadoApelacion.RECHAZADA }),
    ...overrides,
  }
  render(
    <MemoryRouter>
      <ApelacionesAdminPage service={service} />
    </MemoryRouter>,
  )
  return service
}

describe('ApelacionesAdminPage', () => {
  it('lista las pendientes por defecto', async () => {
    const service = montar()
    await screen.findByText('maria')
    expect(service.listar).toHaveBeenCalledWith({ estado: EstadoApelacion.PENDIENTE, page: 0, size: 20 })
  })

  it('aceptar pide confirmación y no ejecuta hasta confirmar', async () => {
    const service = montar()
    await screen.findByText('maria')
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))
    expect(service.aceptar).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar apelación' }))
    await vi.waitFor(() => expect(service.aceptar).toHaveBeenCalledWith('a1'))
  })

  it('cancelar la confirmación no ejecuta la acción', async () => {
    const service = montar()
    await screen.findByText('maria')
    fireEvent.click(screen.getByRole('button', { name: 'Aceptar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(service.aceptar).not.toHaveBeenCalled()
  })

  it('rechazar exige motivo y luego confirmación', async () => {
    const service = montar()
    await screen.findByText('maria')
    fireEvent.click(screen.getByRole('button', { name: 'Rechazar' }))

    const continuar = screen.getByRole('button', { name: 'Continuar' }) as HTMLButtonElement
    expect(continuar.disabled).toBe(true)

    fireEvent.change(screen.getByLabelText(/Se enviará al usuario/), { target: { value: 'Reincidencia' } })
    expect(continuar.disabled).toBe(false)
    fireEvent.click(continuar)
    expect(service.rechazar).not.toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: 'Rechazar apelación' }))
    await vi.waitFor(() => expect(service.rechazar).toHaveBeenCalledWith('a1', 'Reincidencia'))
  })

  it('muestra un mensaje de permisos ante 403', async () => {
    montar({ listar: vi.fn().mockRejectedValue({ status: 403 }) })
    const alerta = await screen.findByRole('alert')
    expect(alerta.textContent).toContain('permisos')
  })

  it('no ofrece acciones sobre apelaciones ya resueltas', async () => {
    montar({
      listar: vi.fn().mockResolvedValue({
        contenido: [{ ...apelacion, estado: EstadoApelacion.RECHAZADA, motivoRechazo: 'Reincidencia' }],
        pagina: 0,
        tamanio: 20,
        totalElementos: 1,
      }),
    })
    await screen.findByText('maria')
    expect(screen.queryByRole('button', { name: 'Aceptar' })).toBeNull()
    expect(screen.getByText(/Motivo del rechazo: Reincidencia/)).toBeTruthy()
  })
})
