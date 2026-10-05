/**
 * Test de componente: disponibilidad transversal de la acción "Eliminar" en publicaciones.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T047, depende de T046)
 * - Union/specs/002-frontend-admin/spec.md AC-05.1, AC-05.4
 *
 * Cobertura:
 * - AC-05.1: la acción "Eliminar" está disponible sin distinguir autor ni estado previo
 *   (se verifica en publicaciones de distinto autor y distinto estado no final: ACTIVA/REPORTADA).
 * - AC-05.4: la acción "Eliminar" se distingue visualmente como sensible/destructiva.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { PublicacionesPage } from '../../src/presentation/publicaciones/PublicacionesPage'
import type { HttpClient } from '../../src/infrastructure/AdminHttpClientPort'

function crearHttpClientMockConPublicaciones(items: unknown[]): HttpClient {
  return {
    get: vi.fn().mockResolvedValue({ items, total: items.length }),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}

describe('PublicacionesPage — disponibilidad de eliminar (T047)', () => {
  it('muestra "Eliminar" habilitado para publicaciones de distinto autor y estado, y con estilo sensible', async () => {
    const httpClient = crearHttpClientMockConPublicaciones([
      {
        id: 'pub-1',
        autorId: 'autor-a',
        estado: 'ACTIVA',
        cantidadReportes: 0,
        motivosReporte: [],
      },
      {
        id: 'pub-2',
        autorId: 'autor-b',
        estado: 'REPORTADA',
        cantidadReportes: 2,
        motivosReporte: ['SPAM'],
      },
    ])

    render(<PublicacionesPage httpClient={httpClient} />)

    await waitFor(() => {
      expect(screen.getByText('pub-1')).toBeInTheDocument()
      expect(screen.getByText('pub-2')).toBeInTheDocument()
    })

    const botonesEliminar = screen.getAllByRole('button', { name: 'Eliminar' })
    expect(botonesEliminar).toHaveLength(2)

    for (const boton of botonesEliminar) {
      expect(boton).toBeEnabled()
      expect(boton).toHaveClass('accion-sensible-boton--sensible')
    }
  })
})
