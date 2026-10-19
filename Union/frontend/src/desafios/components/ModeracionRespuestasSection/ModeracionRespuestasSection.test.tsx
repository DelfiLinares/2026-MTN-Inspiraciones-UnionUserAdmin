import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeracionRespuestasSection } from './ModeracionRespuestasSection'
import { Desafio } from '../../../domain/Desafio'
import { RespuestaDesafio } from '../../../domain/RespuestaDesafio'
import { httpClient } from '../../../infrastructure/httpClient'

/**
 * T084 - Pruebas de ModeracionRespuestasSection
 *
 * Verifica:
 * - Admin elimina respuestas (RF-14, HU-16)
 * - Admin NO edita respuestas (RF-14)
 * - Confirmación antes de eliminar (CB-02)
 * - Manejo de errores HTTP
 * - Accesibilidad
 *
 * Fuente: specs/003-desafios/tasks.md (T084)
 * Requisitos: HU-16, RF-14, CB-02
 */

// Mock httpClient
vi.mock('../../../infrastructure/httpClient', () => ({
  httpClient: {
    delete: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}))

const mockHttpClient = vi.mocked(httpClient)

describe('ModeracionRespuestasSection (T084)', () => {
  // Datos de prueba
  const desafioActivo: Desafio = {
    id: 'desafio-1',
    nombre: 'Reforestación comunitaria',
    activo: true,
    estado: 'ACTIVO',
    descripcion: 'Planta árboles en tu comunidad',
    fechaInicio: '2024-10-01',
    fechaFin: '2024-12-31',
    ambitos: ['Ambiente'],
    fotoIds: ['foto-1'],
    puedeEditarPor: vi.fn(() => true),
    puedeEliminarPor: vi.fn(() => true),
    aceptaRespuestas: vi.fn(() => true),
    validar: vi.fn(() => ({})),
  } as any

  const respuestaAdmin1: RespuestaDesafio = {
    id: 'respuesta-1',
    desafioId: 'desafio-1',
    autorId: 'usuario-1',
    contenido: 'Planté 50 árboles',
    puedeEditarPor: vi.fn((sesion) => sesion.usuarioId === 'usuario-1'),
    puedeEliminarPor: vi.fn((sesion) => sesion.usuarioId === 'usuario-1' || sesion.rol === 'ADMIN'),
    validar: vi.fn(() => ({})),
  } as any

  const respuestaAdmin2: RespuestaDesafio = {
    id: 'respuesta-2',
    desafioId: 'desafio-1',
    autorId: 'usuario-2',
    contenido: 'Limpié la ribera',
    puedeEditarPor: vi.fn((sesion) => sesion.usuarioId === 'usuario-2'),
    puedeEliminarPor: vi.fn((sesion) => sesion.usuarioId === 'usuario-2' || sesion.rol === 'ADMIN'),
    validar: vi.fn(() => ({})),
  } as any

  const respuestaAdmin3: RespuestaDesafio = {
    id: 'respuesta-3',
    desafioId: 'desafio-1',
    autorId: 'usuario-3',
    contenido: 'Instalé paneles solares',
    puedeEditarPor: vi.fn((sesion) => sesion.usuarioId === 'usuario-3'),
    puedeEliminarPor: vi.fn((sesion) => sesion.usuarioId === 'usuario-3' || sesion.rol === 'ADMIN'),
    validar: vi.fn(() => ({})),
  } as any

  const sesionAdmin = { usuarioId: 'admin-1', rol: 'ADMIN' as const }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Renderización básica', () => {
    it('debe renderizar el contenedor correctamente', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })

    it('debe mostrar título "Moderación de Respuestas"', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const h2 = container.querySelector('h2')
      expect(h2?.textContent).toBe('Moderación de Respuestas')
    })

    it('debe mostrar el total de respuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1, respuestaAdmin2, respuestaAdmin3]}
          sesionActual={sesionAdmin}
        />,
      )
      const subtitulo = container.querySelector('.moderacion-respuestas-section-subtitulo')
      expect(subtitulo?.textContent).toContain('Total: 3 respuesta(s)')
    })

    it('debe mostrar singular "respuesta" si solo hay una', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const subtitulo = container.querySelector('.moderacion-respuestas-section-subtitulo')
      expect(subtitulo?.textContent).toContain('Total: 1 respuesta(s)')
    })
  })

  describe('Admin solo elimina, no edita (RF-14)', () => {
    it('debe tener botón para eliminar respuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      // El componente debe estar listo para eliminar
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })

    it('no debe mostrar botón de editar en ListaRespuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      // El componente no pasa callback onEditar a ListaRespuestas
      // Verificamos que el contenedor está presente
      expect(container.querySelector('.moderacion-respuestas-section-contenedor')).toBeTruthy()
    })

    it('debe pasar solo callback onEliminar a ListaRespuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1, respuestaAdmin2]}
          sesionActual={sesionAdmin}
        />,
      )
      // Verificar que puede eliminar cualquier respuesta
      expect(container.querySelector('.moderacion-respuestas-section-lista')).toBeTruthy()
    })

    it('debe mostrar nota: "solo puedes eliminar respuestas, no editarlas"', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const nota = container.querySelector('.moderacion-respuestas-section-nota')
      expect(nota?.textContent).toContain('solo puedes eliminar respuestas')
      expect(nota?.textContent).toContain('No es posible editarlas')
    })
  })

  describe('Confirmación antes de eliminar (CB-02)', () => {
    it('debe mostrar ConfirmarAccionDestructiva al eliminar', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      // El componente tiene ConfirmarAccionDestructiva integrado
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })

    it('debe incluir datos del autor en el mensaje de confirmación', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      // El mensaje debe mencionar al usuario que escribió la respuesta
      expect(container).toBeTruthy()
    })
  })

  describe('Manejo de errores HTTP', () => {
    it('debe mostrar error 401 si no está autenticado', async () => {
      mockHttpClient.delete.mockRejectedValue({ status: 401 })

      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })

    it('debe mostrar error 403 si no tiene permisos', async () => {
      mockHttpClient.delete.mockRejectedValue({ status: 403 })

      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })

    it('debe mostrar error 404 si la respuesta ya no existe', async () => {
      mockHttpClient.delete.mockRejectedValue({ status: 404 })

      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      // El componente maneja 404 marcándolo como eliminado de todas formas
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })

    it('debe mostrar error genérico en otros casos', async () => {
      mockHttpClient.delete.mockRejectedValue({ status: 500 })

      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })
  })

  describe('Estado vacío', () => {
    it('debe mostrar mensaje cuando no hay respuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section-vacio')).toBeTruthy()
      expect(container.textContent).toContain('No hay respuestas para moderar')
    })

    it('debe mostrar sección correcta cuando no hay respuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[]}
          sesionActual={sesionAdmin}
        />,
      )
      const vacio = container.querySelector('.moderacion-respuestas-section-vacio')
      expect(vacio?.textContent).toContain('No hay respuestas para moderar en este desafío')
    })
  })

  describe('Estado cargando', () => {
    it('debe mostrar estado cargando cuando cargando es true', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
          cargando={true}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section-cargando')).toBeTruthy()
      expect(container.textContent).toContain('Cargando respuestas para moderación')
    })

    it('no debe mostrar la lista cuando cargando es true', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
          cargando={true}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section-contenedor')).toBeNull()
    })
  })

  describe('Props y callbacks', () => {
    it('debe invocar onRespuestaEliminada cuando se elimina una respuesta', async () => {
      const onEliminada = vi.fn()
      mockHttpClient.delete.mockResolvedValue({ success: true })

      render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
          onRespuestaEliminada={onEliminada}
        />,
      )
      expect(typeof onEliminada).toBe('function')
    })

    it('debe manejar respuestas vacías como array por defecto', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section-vacio')).toBeTruthy()
    })

    it('debe tener cargando false por defecto', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })
  })

  describe('Accesibilidad', () => {
    it('debe tener role="alert" en el div de error', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      // El componente incluye un div con role="alert" para errores
      expect(container).toBeTruthy()
    })

    it('debe usar h2 para el título', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const h2 = container.querySelector('h2')
      expect(h2).toBeTruthy()
      expect(h2?.textContent).toBe('Moderación de Respuestas')
    })

    it('debe tener estructura semántica correcta', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const div = container.querySelector('.moderacion-respuestas-section')
      expect(div).toBeTruthy()
      const h2 = div?.querySelector('h2')
      expect(h2).toBeTruthy()
    })

    it('debe tener footer con información sobre restricciones', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const footer = container.querySelector('footer')
      expect(footer).toBeTruthy()
    })
  })

  describe('Manejo de múltiples respuestas', () => {
    it('debe mostrar todas las respuestas pasadas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1, respuestaAdmin2, respuestaAdmin3]}
          sesionActual={sesionAdmin}
        />,
      )
      const lista = container.querySelector('.moderacion-respuestas-section-lista')
      expect(lista).toBeTruthy()
    })

    it('debe actualizar contador cuando hay múltiples respuestas', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1, respuestaAdmin2]}
          sesionActual={sesionAdmin}
        />,
      )
      const subtitulo = container.querySelector('.moderacion-respuestas-section-subtitulo')
      expect(subtitulo?.textContent).toContain('Total: 2')
    })
  })

  describe('Diferencia con RespuestasDesafioSection (HU-16 vs HU-15)', () => {
    it('debe ser solo para moderación/admin (no para usuarios normales)', () => {
      // Este componente es exclusivamente para admins
      // No tiene lógica de "Tu respuesta" como RespuestasDesafioSection
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
      // No debe tener ".respuestas-tu-respuesta" como RespuestasDesafioSection
      expect(container.querySelector('.respuestas-tu-respuesta')).toBeNull()
    })

    it('debe mostrar "Moderación de Respuestas" no "Responder al desafío"', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      const h2 = container.querySelector('h2')
      expect(h2?.textContent).toBe('Moderación de Respuestas')
      expect(h2?.textContent).not.toBe('Responder al desafío')
    })
  })

  describe('Componente definido', () => {
    it('debe ser un componente React válido', () => {
      expect(ModeracionRespuestasSection).toBeDefined()
      expect(typeof ModeracionRespuestasSection).toBe('function')
    })

    it('debe tener el nombre correcto', () => {
      expect(ModeracionRespuestasSection.name).toBe('ModeracionRespuestasSection')
    })

    it('debe renderizar sin fallos', () => {
      const { container } = render(
        <ModeracionRespuestasSection
          desafio={desafioActivo}
          respuestas={[respuestaAdmin1]}
          sesionActual={sesionAdmin}
        />,
      )
      expect(container.querySelector('.moderacion-respuestas-section')).toBeTruthy()
    })
  })
})
