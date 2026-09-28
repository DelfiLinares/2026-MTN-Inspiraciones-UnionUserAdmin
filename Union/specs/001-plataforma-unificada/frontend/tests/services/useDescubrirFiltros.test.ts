/**
 * Tests de `useDescubrirFiltros` (T072).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-40 a RF-45, RNF-05, CB-10)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, Principio X)
 * - Union/specs/001-plataforma-unificada/tasks.md (T072, depende de T055)
 *
 * Verifica:
 * - Cada cambio de filtro dispara una nueva consulta a la API (`busquedaService.buscarPublicaciones`),
 *   nunca filtrado en memoria (RNF-05).
 * - El filtro de distancia queda deshabilitado mientras no haya geolocalización activa (RF-45),
 *   y se rehabilita al activarla mediante `activarGeolocalizacion`.
 * - CB-10: al revocarse el permiso de geolocalización durante la sesión, el filtro de distancia
 *   se deshabilita automáticamente y se notifica al usuario.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useDescubrirFiltros } from '../../src/services/useDescubrirFiltros'
import { Filtro } from '../../src/domain/Filtro'
import { TipoContenido } from '../../src/domain/enums/TipoContenido'
import { Publicacion } from '../../src/domain/Publicacion'
import { EstadoPublicacion } from '../../src/domain/enums/EstadoPublicacion'

const buscarPublicacionesMock = vi.fn()
const obtenerOpcionesFiltroMock = vi.fn()
const inicializarObservadorPermisosMock = vi.fn()
const onRevocacionPermisoMock = vi.fn()
const obtenerPosicionActualMock = vi.fn()
const estaActivaMock = vi.fn()

vi.mock('../../src/services/busquedaService', () => ({
  busquedaService: {
    buscarPublicaciones: (...args: unknown[]) => buscarPublicacionesMock(...args),
  },
}))

vi.mock('../../src/services/filtroOpcionesService', () => ({
  filtroOpcionesService: {
    obtenerOpcionesFiltro: (...args: unknown[]) => obtenerOpcionesFiltroMock(...args),
  },
}))

vi.mock('../../src/infrastructure/geolocationClient', () => ({
  geolocationClient: {
    inicializarObservadorPermisos: (...args: unknown[]) => inicializarObservadorPermisosMock(...args),
    onRevocacionPermiso: (...args: unknown[]) => onRevocacionPermisoMock(...args),
    obtenerPosicionActual: (...args: unknown[]) => obtenerPosicionActualMock(...args),
    estaActiva: (...args: unknown[]) => estaActivaMock(...args),
  },
}))

function crearPublicacionDePrueba(id: string): Publicacion {
  return new Publicacion({
    id,
    autorId: 'autor-1',
    tipoContenido: TipoContenido.IMAGEN,
    estado: EstadoPublicacion.ACTIVA,
    tags: [],
    cantidadLikes: 0,
    likeDelUsuarioActual: false,
    reportadaPorUsuarioActual: false,
  })
}

describe('useDescubrirFiltros (T072)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    obtenerOpcionesFiltroMock.mockResolvedValue({
      estilos: ['realismo'],
      tecnicas: ['oleo'],
      tiposContenido: [TipoContenido.IMAGEN],
    })
    inicializarObservadorPermisosMock.mockResolvedValue(undefined)
    onRevocacionPermisoMock.mockReturnValue(() => {})
    estaActivaMock.mockReturnValue(false)
    buscarPublicacionesMock.mockResolvedValue({
      items: [crearPublicacionDePrueba('pub-1')],
      siguienteCursor: null,
      nextPage: null,
      total: 1,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('consulta la API en la carga inicial delegando la resolución de filtros al backend (RNF-05)', async () => {
    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    expect(result.current.items).toHaveLength(1)
  })

  it('dispara una nueva consulta a la API ante cada cambio de filtro (nunca filtrado en memoria)', async () => {
    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    act(() => {
      result.current.establecerTexto('paisaje')
    })

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(2)
    })

    const ultimoFiltro = buscarPublicacionesMock.mock.calls[1][0] as Filtro
    expect(ultimoFiltro.texto).toBe('paisaje')

    act(() => {
      result.current.establecerEstilo('realismo')
    })

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(3)
    })

    act(() => {
      result.current.establecerTecnica('oleo')
    })

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(4)
    })
  })

  it('el filtro de distancia queda deshabilitado por defecto sin geolocalización activa (RF-45)', async () => {
    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    expect(result.current.geolocalizacionHabilitada).toBe(false)
    expect(result.current.coordenadas).toBeNull()

    act(() => {
      result.current.establecerDistancia(10)
    })

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(2)
    })

    // Aunque se establece un valor de distancia, sin geolocalización activa el filtro
    // no debe habilitarse ni enviarse a la API como criterio de búsqueda.
    const filtroEnviado = buscarPublicacionesMock.mock.calls[1][0] as Filtro
    expect(filtroEnviado.distanciaHabilitada()).toBe(false)
    expect(result.current.geolocalizacionHabilitada).toBe(false)
  })

  it('habilita el filtro de distancia tras activar la geolocalización exitosamente', async () => {
    obtenerPosicionActualMock.mockResolvedValue({ latitud: -34.6, longitud: -58.4 })

    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    let activado = false
    await act(async () => {
      activado = await result.current.activarGeolocalizacion()
    })

    expect(activado).toBe(true)
    expect(result.current.coordenadas).toEqual({ latitud: -34.6, longitud: -58.4 })
    expect(result.current.geolocalizacionHabilitada).toBe(true)
    expect(result.current.mensajeGeolocalizacion).toBeNull()

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(2)
    })

    const filtroConGeo = buscarPublicacionesMock.mock.calls[1][0] as Filtro
    expect(filtroConGeo.geolocalizacionActiva).toBe(true)
  })

  it('deshabilita el filtro de distancia y notifica al usuario si falla la obtención de posición', async () => {
    obtenerPosicionActualMock.mockRejectedValue(new Error('Permiso denegado'))

    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    let activado = true
    await act(async () => {
      activado = await result.current.activarGeolocalizacion()
    })

    expect(activado).toBe(false)
    expect(result.current.coordenadas).toBeNull()
    expect(result.current.geolocalizacionHabilitada).toBe(false)
    expect(result.current.mensajeGeolocalizacion).toMatch(/no se pudo obtener tu ubicación/i)
  })

  it('CB-10: al revocarse el permiso de geolocalización, deshabilita el filtro de distancia y notifica al usuario', async () => {
    let callbackRevocacion: (() => void) | null = null
    onRevocacionPermisoMock.mockImplementation((cb: () => void) => {
      callbackRevocacion = cb
      return () => {}
    })
    obtenerPosicionActualMock.mockResolvedValue({ latitud: -34.6, longitud: -58.4 })

    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    await act(async () => {
      await result.current.activarGeolocalizacion()
    })

    expect(result.current.geolocalizacionHabilitada).toBe(true)
    expect(callbackRevocacion).not.toBeNull()

    act(() => {
      callbackRevocacion?.()
    })

    expect(result.current.coordenadas).toBeNull()
    expect(result.current.geolocalizacionHabilitada).toBe(false)
    expect(result.current.mensajeGeolocalizacion).toMatch(/permiso de ubicación fue revocado/i)
  })

  it('reinicia la paginación (resetKey) y consulta nuevamente al limpiar filtros', async () => {
    const { result } = renderHook(() => useDescubrirFiltros())

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(1)
    })

    act(() => {
      result.current.establecerTexto('retrato')
    })

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(2)
    })

    act(() => {
      result.current.limpiarFiltros()
    })

    await waitFor(() => {
      expect(buscarPublicacionesMock).toHaveBeenCalledTimes(3)
    })

    const filtroLimpio = buscarPublicacionesMock.mock.calls[2][0] as Filtro
    expect(filtroLimpio.texto).toBeUndefined()
    expect(filtroLimpio.estilo).toBeUndefined()
    expect(filtroLimpio.tecnica).toBeUndefined()
    expect(filtroLimpio.distanciaKm).toBeUndefined()
  })
})
