// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ApiError } from '../../src/infrastructure/httpClient'
import { RegistroPage } from '../../src/pages/registro/RegistroPage'

const mocks = vi.hoisted(() => ({
  registrar: vi.fn(),
  iniciarSesion: vi.fn(),
  iniciarSesionConOAuth: vi.fn(),
}))

vi.mock('../../src/services/AuthContext', () => ({
  useAuth: () => ({ iniciarSesion: mocks.iniciarSesion }),
}))

vi.mock('../../src/services/authService', () => ({
  authService: {
    registrar: mocks.registrar,
    iniciarSesionConOAuth: mocks.iniciarSesionConOAuth,
  },
}))

function renderRegistro() {
  return render(
    <MemoryRouter>
      <RegistroPage />
    </MemoryRouter>,
  )
}

function completarFormulario(email = 'ana@test.com', password = 'password1!') {
  fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Ana' } })
  fireEvent.change(screen.getByLabelText('Apellido'), { target: { value: 'Test' } })
  fireEvent.change(screen.getByLabelText('Nombre de usuario'), { target: { value: 'ana' } })
  fireEvent.change(screen.getByLabelText('Correo'), { target: { value: email } })
  fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: password } })
  fireEvent.change(screen.getByLabelText('Confirmar'), { target: { value: password } })
  fireEvent.click(
    screen.getByRole('checkbox', { name: 'Acepto todos los términos y condiciones.' }),
  )
}

describe('RegistroPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('acepta una contraseña válida para la API sin exigir mayúsculas y minúsculas a la vez', () => {
    renderRegistro()
    completarFormulario()

    const submit = screen.getByRole('button', { name: 'Registrarse' }) as HTMLButtonElement
    expect(submit.disabled).toBe(false)
  })

  it('deshabilita el envío cuando el correo no tiene un formato válido', () => {
    renderRegistro()
    completarFormulario('ana-no-es-un-correo')

    const submit = screen.getByRole('button', { name: 'Registrarse' }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
  })

  it('muestra el motivo del conflicto devuelto por la API', async () => {
    mocks.registrar.mockRejectedValueOnce(
      new ApiError('Error HTTP 409 al solicitar /auth/register', 409, {
        code: 'CONFLICT',
        message: 'El email ya se encuentra registrado',
      }),
    )
    renderRegistro()
    completarFormulario()

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'El email ya se encuentra registrado',
      )
    })
  })

  it('indica cuando la API no está disponible', async () => {
    mocks.registrar.mockRejectedValueOnce(new TypeError('Failed to fetch'))
    renderRegistro()
    completarFormulario()

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'Verificá que el backend esté iniciado en http://localhost:8080',
      )
    })
  })

  it('reconoce la respuesta 500 del proxy cuando el backend está apagado', async () => {
    mocks.registrar.mockRejectedValueOnce(
      new ApiError(
        'Error HTTP 500 al solicitar /auth/register',
        500,
        'Error occurred while proxying request',
      ),
    )
    renderRegistro()
    completarFormulario()

    fireEvent.click(screen.getByRole('button', { name: 'Registrarse' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain(
        'No se pudo conectar con la API. Verificá que el backend esté iniciado',
      )
    })
  })
})
