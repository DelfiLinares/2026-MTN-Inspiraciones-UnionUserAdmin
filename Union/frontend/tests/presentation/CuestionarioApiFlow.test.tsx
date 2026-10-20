import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CuestionarioPage } from '../../src/presentation/cuestionario/CuestionarioPage'
import type { InteresesOnboardingResponseDTO } from '../../src/application/dto/OnboardingInteresesDTO'

const mocks = vi.hoisted(() => ({
  obtenerCatalogoOnboarding: vi.fn(),
  obtenerMisInteresesOnboarding: vi.fn(),
  guardarInteresesOnboarding: vi.fn(),
}))

vi.mock('../../src/services/onboardingInteresesService', () => mocks)
vi.mock('../../src/presentation/shared/CerrarSesionButton', () => ({
  CerrarSesionButton: () => null,
}))

const catalogo = {
  generos: [{ codigo: 'GENERO_ARTE', grupo: 'GENERO_ARTISTICO', nombre: 'Arte' }],
  estilos: [{ codigo: 'ARTE_CUBISMO', grupo: 'TIPO_ARTE', nombre: 'Cubismo' }],
  tiposMusica: [{ codigo: 'MUSICA_POP', grupo: 'TIPO_MUSICA', nombre: 'Pop' }],
}

const renderCuestionario = () => render(
  <MemoryRouter initialEntries={['/cuestionario']}>
    <Routes>
      <Route path="/cuestionario" element={<CuestionarioPage />} />
      <Route path="/feed" element={<div data-testid="feed-destination">Feed</div>} />
    </Routes>
  </MemoryRouter>,
)

describe('CuestionarioPage API flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.obtenerCatalogoOnboarding.mockResolvedValue(catalogo)
    mocks.obtenerMisInteresesOnboarding.mockResolvedValue({
      generoIds: [],
      estiloIds: [],
      tipoMusicaIds: [],
      onboardingCompletado: false,
    })
  })

  it('loads API options, sends selected codes, and waits for save confirmation before navigating', async () => {
    let confirmarGuardado!: (respuesta: InteresesOnboardingResponseDTO) => void
    mocks.guardarInteresesOnboarding.mockImplementationOnce(
      () => new Promise<InteresesOnboardingResponseDTO>((resolve) => {
        confirmarGuardado = resolve
      }),
    )

    renderCuestionario()
    await screen.findByRole('checkbox', { name: 'Arte' })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Arte' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pop' }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    const payload = {
      generoIds: ['GENERO_ARTE'],
      estiloIds: [],
      tipoMusicaIds: ['MUSICA_POP'],
    }
    await waitFor(() => {
      expect(mocks.guardarInteresesOnboarding).toHaveBeenCalledWith(payload)
    })
    expect(screen.queryByTestId('feed-destination')).not.toBeInTheDocument()

    await act(async () => {
      confirmarGuardado({ ...payload, onboardingCompletado: true })
    })

    expect(await screen.findByTestId('feed-destination')).toBeInTheDocument()
  })

  it('stays on the questionnaire and shows an error when the API save fails', async () => {
    mocks.guardarInteresesOnboarding.mockRejectedValueOnce(new Error('API no disponible'))

    renderCuestionario()
    await screen.findByRole('checkbox', { name: 'Arte' })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Arte' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Pop' }))
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }))

    expect(await screen.findByText(/No pudimos guardar tus intereses/i)).toBeInTheDocument()
    expect(screen.queryByTestId('feed-destination')).not.toBeInTheDocument()
  })

  it('preselects the categories saved in onboarding', async () => {
    mocks.obtenerMisInteresesOnboarding.mockResolvedValue({
      generoIds: ['GENERO_ARTE'],
      estiloIds: ['ARTE_CUBISMO'],
      tipoMusicaIds: ['MUSICA_POP'],
      onboardingCompletado: true,
    })

    renderCuestionario()

    expect(await screen.findByRole('checkbox', { name: 'Arte' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Cubismo' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pop' })).toBeChecked()
  })

  it('shows the questionnaire when loading saved selections fails', async () => {
    mocks.obtenerMisInteresesOnboarding.mockRejectedValueOnce(new Error('API no disponible'))

    renderCuestionario()

    expect(await screen.findByRole('checkbox', { name: 'Arte' })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Pop' })).toBeInTheDocument()
    expect(screen.queryByText(/No pudimos cargar las opciones/i)).not.toBeInTheDocument()
  })
})
