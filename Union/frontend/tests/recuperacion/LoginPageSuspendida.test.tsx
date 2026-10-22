// @vitest-environment jsdom
import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const { login } = vi.hoisted(() => ({ login: vi.fn() }))

vi.mock('../../src/services/AuthContext', () => ({
  useAuth: () => ({ iniciarSesion: vi.fn() }),
}))

vi.mock('../../src/services/authService', async (importOriginal) => {
  const original = await importOriginal<typeof import('../../src/services/authService')>()
  return { ...original, authService: { ...original.authService, login } }
})

import { LoginPage } from '../../src/pages/login/LoginPage'
import { CuentaBloqueadaError, MENSAJE_CUENTA_BANEADA } from '../../src/services/authService'

afterEach(() => {
  cleanup()
  login.mockReset()
})

function montar(state?: unknown) {
  render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <LoginPage />
    </MemoryRouter>,
  )
}

function enviar() {
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'ana@mail.com' } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secreto' } })
  fireEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('LoginPage — recuperación (spec 008)', () => {
  it('el enlace de olvido apunta a /recuperar-contrasena', () => {
    montar()
    const enlace = screen.getByText('¿Olvidaste tu contraseña?') as HTMLAnchorElement
    expect(enlace.getAttribute('href')).toBe('/recuperar-contrasena')
  })

  it('muestra el mensaje de éxito recibido tras restablecer la contraseña', () => {
    montar({ mensajeExito: 'Contraseña actualizada.' })
    expect(screen.getByRole('status').textContent).toContain('Contraseña actualizada.')
  })

  it('ofrece apelar cuando la cuenta está suspendida (CUENTA_BANEADA)', async () => {
    login.mockRejectedValue(new CuentaBloqueadaError('CUENTA_BANEADA', MENSAJE_CUENTA_BANEADA))
    montar()
    enviar()
    const alerta = await screen.findByRole('alert')
    expect(alerta.textContent).toContain(MENSAJE_CUENTA_BANEADA)
    const enlace = screen.getByText('Apelar suspensión') as HTMLAnchorElement
    expect(enlace.getAttribute('href')).toBe('/apelar-suspension')
  })

  it('no ofrece apelar ante credenciales inválidas', async () => {
    login.mockRejectedValue(new Error('401'))
    montar()
    enviar()
    await screen.findByRole('alert')
    expect(screen.queryByText('Apelar suspensión')).toBeNull()
  })

  it('no ofrece apelar para cuentas eliminadas', async () => {
    login.mockRejectedValue(new CuentaBloqueadaError('CUENTA_ELIMINADA', 'eliminada'))
    montar()
    enviar()
    await screen.findByRole('alert')
    expect(screen.queryByText('Apelar suspensión')).toBeNull()
  })
})
