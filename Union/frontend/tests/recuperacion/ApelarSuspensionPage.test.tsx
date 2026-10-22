// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApelarSuspensionPage } from '../../src/pages/apelacion/ApelarSuspensionPage'
import type { RecoveryService } from '../../src/application/recoveryService'

afterEach(cleanup)

const MENSAJE = 'Creo que la suspensión fue un error.'

function montar(apelar: RecoveryService['apelar']) {
  const service: RecoveryService = {
    solicitarCodigo: vi.fn(),
    confirmar: vi.fn(),
    apelar,
  }
  render(
    <MemoryRouter>
      <ApelarSuspensionPage service={service} />
    </MemoryRouter>,
  )
  return service
}

const escribir = (etiqueta: string, valor: string) =>
  fireEvent.change(screen.getByLabelText(etiqueta), { target: { value: valor } })

function completar() {
  escribir('Correo', 'ana@mail.com')
  escribir('Contraseña', 'secreto')
  escribir('Mensaje', MENSAJE)
}

describe('ApelarSuspensionPage', () => {
  it('deshabilita el envío hasta que el formulario es válido y muestra el contador', () => {
    montar(vi.fn())
    const boton = screen.getByRole('button', { name: 'Enviar apelación' }) as HTMLButtonElement
    expect(boton.disabled).toBe(true)
    escribir('Mensaje', 'corto')
    expect(screen.getByText(/5\/1000/)).toBeTruthy()
    completar()
    expect(boton.disabled).toBe(false)
  })

  it('envía la apelación y muestra la confirmación', async () => {
    const apelar = vi.fn().mockResolvedValue(undefined)
    montar(apelar)
    completar()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar apelación' }))
    await screen.findByText('Apelación recibida')
    expect(apelar).toHaveBeenCalledWith({ email: 'ana@mail.com', password: 'secreto', mensaje: MENSAJE })
  })

  it.each([
    [409, { code: 'APELACION_DUPLICADA' }, /apelación pendiente/],
    [429, { code: 'APELACION_RECHAZO_RECIENTE' }, /fue rechazada/],
    [401, {}, /incorrectos/],
    [403, { code: 'CUENTA_NO_APELABLE' }, /no está suspendida/],
  ])('muestra el mensaje propio para %i', async (status, body, patron) => {
    montar(vi.fn().mockRejectedValue({ status, body }))
    completar()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar apelación' }))
    const alerta = await screen.findByRole('alert')
    expect(alerta.textContent).toMatch(patron)
    expect(screen.queryByText('Apelación recibida')).toBeNull()
  })
})
