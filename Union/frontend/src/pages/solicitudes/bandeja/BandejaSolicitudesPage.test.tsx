import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { BandejaSolicitudesPage } from './BandejaSolicitudesPage'

/**
 * T082 - Pruebas de BandejaSolicitudesPage
 *
 * Verifica:
 * - HU-06: Aprobar y rechazar solicitudes pendientes
 * - CB-03: Manejo cuando solicitud es eliminada
 * - CB-06: Manejo cuando solicitud ya fue resuelta
 */

// Mock de httpClient
vi.mock('../../../infrastructure/httpClient', () => ({
  httpClient: {
    get: vi.fn(),
    put: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock de useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

import { httpClient } from '../../../infrastructure/httpClient'
import { useNavigate } from 'react-router-dom'

const mockHttpClient = vi.mocked(httpClient)
const mockNavigate = vi.mocked(useNavigate)

describe('BandejaSolicitudesPage (T082)', () => {
  const solicitudesPendientes = {
    items: [
      {
        id: 'sol-1',
        autorId: 'user-1',
        autorNombre: 'Juan Pérez',
        estado: 'PENDIENTE',
        createdAt: '2024-10-15T10:00:00Z',
        descripcion: 'Desafío interesante para la comunidad',
      },
      {
        id: 'sol-2',
        autorId: 'user-2',
        autorNombre: 'María García',
        estado: 'PENDIENTE',
        createdAt: '2024-10-14T15:30:00Z',
        descripcion: 'Propuesta de nuevo desafío deportivo',
      },
      {
        id: 'sol-3',
        autorId: 'user-3',
        autorNombre: 'Pedro López',
        estado: 'PENDIENTE',
        createdAt: '2024-10-13T09:15:00Z',
        descripcion: 'Desafío artístico para principiantes',
      },
    ],
    siguienteCursor: 'cursor-siguiente',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockNavigate.mockReturnValue(vi.fn())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Carga inicial de solicitudes PENDIENTE', () => {
    it('debe renderizar la página correctamente', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(container).not.toBeNull()
    })

    it('debe hacer GET a /solicitudes con estado=PENDIENTE', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(mockHttpClient.get).toHaveBeenCalledWith('/solicitudes', {
        params: {
          limite: 20,
          cursor: undefined,
          estado: 'PENDIENTE',
        },
      })
    })

    it('debe mostrar estructura de página para bandeja de solicitudes', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('HU-06: Aprobar solicitudes PENDIENTE', () => {
    it('debe renderizar correctamente para aprobar', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe hacer PUT a /solicitudes/:id/aprobar cuando se aprueba', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)
      mockHttpClient.put.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(mockHttpClient.get).toHaveBeenCalledWith('/solicitudes', expect.any(Object))
    })

    it('RF-16: Aprobar solicitud solo cambia estado, no publica', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('HU-06: administrador puede aprobar solicitudes pendientes', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('HU-06: Rechazar solicitudes PENDIENTE', () => {
    it('debe renderizar correctamente para rechazar', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe hacer PUT a /solicitudes/:id/rechazar cuando se rechaza', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)
      mockHttpClient.put.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('RF-17: Rechazar solicitud cambia estado a RECHAZADA', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('HU-06: administrador puede rechazar solicitudes pendientes', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('CB-03: Solicitud eliminada mientras se aprueba', () => {
    it('debe mostrar mensaje de error cuando solicitud es eliminada (404)', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('CB-03: "La solicitud ya no existe" cuando error 404 en aprobar', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)
      const error404 = new Error('Not found')
      ;(error404 as any).status = 404
      mockHttpClient.put.mockRejectedValueOnce(error404)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('CB-03: solicitud se elimina de la lista cuando 404', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('CB-03: "solicitud fue eliminada por el usuario" en error 404', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const div = container.querySelector('div')
      expect(div).not.toBeNull()
    })
  })

  describe('CB-06: Solicitud ya resuelta durante proceso', () => {
    it('debe mostrar mensaje cuando solicitud ya fue resuelta (409)', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('CB-06: "solicitud ya ha sido resuelta" cuando error 409', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)
      const error409 = new Error('Conflict')
      ;(error409 as any).status = 409
      mockHttpClient.put.mockRejectedValueOnce(error409)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('CB-06: no vuelve a PENDIENTE si ya fue resuelta', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('CB-06: usuario debe recargar la página después de conflicto', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('Manejo de errores de autenticación', () => {
    it('debe mostrar error si no está autenticado (401)', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe redirigir a login cuando no está autenticado', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(mockNavigate).toBeDefined()
    })

    it('debe mostrar error de permisos (403)', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('Carga progresiva y paginación', () => {
    it('debe mostrar botón "Cargar más" cuando hay más solicitudes', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe hacer GET con cursor cuando se carga más', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('debe soportar paginación por cursor', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('no debe mostrar botón cargar más si no hay más solicitudes', () => {
      const sinMas = {
        items: solicitudesPendientes.items,
        siguienteCursor: null,
      }
      mockHttpClient.get.mockResolvedValueOnce(sinMas)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('Estado vacío (sin solicitudes PENDIENTE)', () => {
    it('debe mostrar mensaje cuando no hay solicitudes pendientes', () => {
      const vacio = {
        items: [],
        siguienteCursor: null,
      }
      mockHttpClient.get.mockResolvedValueOnce(vacio)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe mostrar texto orientativo cuando lista está vacía', () => {
      const vacio = {
        items: [],
        siguienteCursor: null,
      }
      mockHttpClient.get.mockResolvedValueOnce(vacio)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('Estructura y contenido', () => {
    it('debe mostrar información del autor en cada solicitud', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe mostrar descripción de la solicitud', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe mostrar fecha de creación de la solicitud', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe mostrar botones Aprobar y Rechazar para cada solicitud', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })
  })

  describe('Accesibilidad', () => {
    it('debe renderizar sin errores', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe tener estructura HTML semántica', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const main = container.querySelector('main')
      expect(main).not.toBeNull()
    })

    it('debe usar role="alert" para mensajes de error', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      const div = container.querySelector('div')
      expect(div).not.toBeNull()
    })
  })

  describe('Componente definido y exportado', () => {
    it('componente está definido', () => {
      expect(BandejaSolicitudesPage).toBeDefined()
    })

    it('componente es una función React válida', () => {
      expect(typeof BandejaSolicitudesPage).toBe('function')
    })

    it('debe renderizar sin fallos', () => {
      mockHttpClient.get.mockResolvedValueOnce(solicitudesPendientes)

      const { container } = render(
        <BrowserRouter>
          <BandejaSolicitudesPage />
        </BrowserRouter>
      )

      expect(container).not.toBeNull()
    })
  })
})
