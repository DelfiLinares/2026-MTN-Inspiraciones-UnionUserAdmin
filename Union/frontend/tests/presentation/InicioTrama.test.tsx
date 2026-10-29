import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { HomePage } from '../../src/pages/home/HomePage'
import { feedService } from '../../src/services/feedService'
import { listarDesafios } from '../../src/services/desafioService'
import { Publicacion } from '../../src/domain/Publicacion'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'
import { Desafio } from '../../src/domain/Desafio'

vi.mock('../../src/services/AuthContext', () => ({
  useAuth: () => ({ estaAutenticado: true, usuario: { id: 'yo' } }),
}))
vi.mock('../../src/services/feedService', () => ({ feedService: { obtenerPagina: vi.fn() } }))
vi.mock('../../src/services/desafioService', () => ({ listarDesafios: vi.fn() }))
vi.mock('../../src/services/reporteService', () => ({
  reporteService: { obtenerMotivos: vi.fn().mockResolvedValue([{ codigo: 'SPAM', etiqueta: 'Spam' }]) },
}))

const obra = new Publicacion({
  id: 'obra-1', autorId: 'artista-1', contenido: 'Estudio de luz', tipoContenido: TipoContenido.IMAGEN,
  estado: EstadoPublicacion.ACTIVA, tags: ['dibujo'], cantidadLikes: 2,
  likeDelUsuarioActual: false, reportadaPorUsuarioActual: false,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(feedService.obtenerPagina).mockResolvedValue({ items: [obra], siguienteCursor: null })
  vi.mocked(listarDesafios).mockResolvedValue([new Desafio({
    id: 'desafio-1', titulo: 'Crear con una línea', descripcion: 'Una consigna de prueba', activo: true,
  })])
})

function montar() { render(<MemoryRouter><HomePage /></MemoryRouter>) }

describe('Inicio de Trama', () => {
  it('muestra obras y una consigna real sin carrusel ni pestaña Seguidos', async () => {
    montar()
    expect(await screen.findByRole('heading', { name: 'Estudio de luz' })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Ver consigna →' })).toHaveAttribute('href', '/desafios/desafio-1')
    expect(screen.getByRole('link', { name: 'Ver artista' })).toHaveAttribute('href', '/perfil/artista-1')
    expect(screen.queryByRole('button', { name: /Seguidos/ })).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Contenido destacado')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Para vos' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('permite alternar Desafíos y Para vos conservando el feed cargado', async () => {
    montar()
    await screen.findByRole('heading', { name: 'Estudio de luz' })
    fireEvent.click(screen.getByRole('button', { name: 'Desafíos' }))
    expect(screen.getByRole('button', { name: 'Desafíos' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('link', { name: 'Proponer un desafío' })).toHaveAttribute('href', '/desafios/solicitar')
    expect(screen.queryByRole('heading', { name: 'Estudio de luz' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Para vos' }))
    expect(screen.getByRole('heading', { name: 'Estudio de luz' })).toBeInTheDocument()
    expect(feedService.obtenerPagina).toHaveBeenCalledTimes(1)
  })

  it('no simula un desafío cargado ante error y permite reintentar', async () => {
    vi.mocked(listarDesafios).mockRejectedValueOnce(new Error('Sin conexión'))
    montar()
    expect(await screen.findByText('No pudimos cargar el desafío.')).toHaveAttribute('role', 'alert')
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByRole('heading', { name: 'Crear con una línea' })).toBeInTheDocument()
  })

  it('cierra el reporte con Escape y devuelve el foco al control de origen', async () => {
    montar()
    const reportar = await screen.findByRole('button', { name: 'Reportar publicación' })
    reportar.focus()
    fireEvent.click(reportar)
    const dialogo = screen.getByRole('dialog', { name: 'Reportar publicación' })
    fireEvent.keyDown(dialogo, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await waitFor(() => expect(reportar).toHaveFocus())
  })
})
