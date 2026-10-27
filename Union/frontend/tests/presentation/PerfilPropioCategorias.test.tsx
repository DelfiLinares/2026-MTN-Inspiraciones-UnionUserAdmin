import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { EstadoCuentaUsuario } from '../../src/domain/enums/EstadoCuentaUsuario'
import { RolUsuario } from '../../src/domain/enums/RolUsuario'
import { UsuarioPerfil } from '../../src/domain/UsuarioPerfil'
import { PerfilPropio } from '../../src/presentation/perfil/PerfilPropio'

const onboardingMocks = vi.hoisted(() => ({
  obtenerCatalogoOnboarding: vi.fn(),
  obtenerMisInteresesOnboarding: vi.fn(),
}))

vi.mock('../../src/services/onboardingInteresesService', () => onboardingMocks)
vi.mock('../../src/services/carpetaPerfilService', () => ({
  carpetaService: {
    listarCarpetas: vi.fn().mockResolvedValue({ carpetas: [], total: 0, limit: 20, offset: 0 }),
  },
}))
vi.mock('../../src/services/perfilPublicacionService', () => ({
  publicacionService: {
    listarPublicaciones: vi.fn().mockResolvedValue({
      items: [],
      total: 0,
      limit: 20,
      offset: 0,
      hasMore: false,
    }),
  },
}))
vi.mock('../../src/presentation/carpetas/CarpetaList', () => ({ CarpetaList: () => null }))
vi.mock('../../src/presentation/publicaciones/PublicacionList', () => ({ PublicacionList: () => null }))
vi.mock('../../src/presentation/publicaciones/CrearPublicacionDialog', () => ({
  CrearPublicacionDialog: () => null,
}))

const usuario = new UsuarioPerfil(
  'user-actual',
  'mi_usuario',
  undefined,
  'Artista',
  'Comparto mis obras',
  EstadoCuentaUsuario.ACTIVO,
  RolUsuario.USER,
)

describe('PerfilPropio categorías favoritas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    onboardingMocks.obtenerCatalogoOnboarding.mockResolvedValue({
      generos: [{ codigo: 'GENERO_ARTE', grupo: 'GENERO_ARTISTICO', nombre: 'Arte' }],
      estilos: [{ codigo: 'ARTE_CUBISMO', grupo: 'TIPO_ARTE', nombre: 'Cubismo' }],
      tiposMusica: [{ codigo: 'MUSICA_POP', grupo: 'TIPO_MUSICA', nombre: 'Pop' }],
    })
    onboardingMocks.obtenerMisInteresesOnboarding.mockResolvedValue({
      generoIds: ['GENERO_ARTE'],
      estiloIds: ['ARTE_CUBISMO'],
      tipoMusicaIds: ['MUSICA_POP'],
      onboardingCompletado: true,
    })
  })

  it('muestra las categorías del usuario y permite volver al cuestionario', async () => {
    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <Routes>
          <Route path="/perfil" element={<PerfilPropio usuario={usuario} />} />
          <Route path="/cuestionario" element={<p>Formulario de categorías</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Arte')).toBeInTheDocument()
    expect(screen.getByText('Cubismo')).toBeInTheDocument()
    expect(screen.getByText('Pop')).toBeInTheDocument()

    const editButton = screen.getByRole('button', { name: 'Editar perfil' })
    expect(editButton).toHaveClass('trama-primary')

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar categorías' }))
    expect(await screen.findByText('Formulario de categorías')).toBeInTheDocument()
  })
})