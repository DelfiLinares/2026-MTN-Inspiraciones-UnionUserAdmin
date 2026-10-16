// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { UsuarioPerfil } from '../../src/domain/UsuarioPerfil'
import { EditarPerfilForm } from '../../src/presentation/perfil/EditarPerfilForm'

const mocks = vi.hoisted(() => ({
  actualizarPerfil: vi.fn(),
}))

vi.mock('../../src/services/perfilUsuarioService', () => ({
  usuarioPerfilService: {
    actualizarPerfil: mocks.actualizarPerfil,
  },
}))

function crearUsuario(username: string) {
  return new UsuarioPerfil('user-actual', username)
}

describe('EditarPerfilForm', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('permite guardar otros campos si el username existente supera el límite de edición', async () => {
    const usuario = crearUsuario('usuario_largo15')
    const onPerfilActualizado = vi.fn()
    mocks.actualizarPerfil.mockResolvedValueOnce(
      new UsuarioPerfil(
        usuario.id,
        usuario.username,
        usuario.foto,
        'Biografía actualizada',
        usuario.descripcion,
      ),
    )

    render(<EditarPerfilForm usuario={usuario} onPerfilActualizado={onPerfilActualizado} />)
    fireEvent.change(screen.getByLabelText('Sobre mí'), {
      target: { value: 'Biografía actualizada' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => {
      expect(mocks.actualizarPerfil).toHaveBeenCalledWith({
        sobreMi: 'Biografía actualizada',
      })
      expect(onPerfilActualizado).toHaveBeenCalled()
    })
  })

  it('mantiene el límite de 10 caracteres cuando se cambia el username', () => {
    const usuario = crearUsuario('usuario_actual')

    render(<EditarPerfilForm usuario={usuario} />)
    fireEvent.change(screen.getByLabelText(/Nombre de usuario/), {
      target: { value: 'username_muy_largo' },
    })
    fireEvent.change(screen.getByLabelText('Sobre mí'), {
      target: { value: 'Biografía actualizada' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(screen.getByText('El nombre de usuario no debe superar 10 caracteres')).toBeTruthy()
    expect(mocks.actualizarPerfil).not.toHaveBeenCalled()
  })
})
