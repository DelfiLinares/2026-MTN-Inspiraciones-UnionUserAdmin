/**
 * Hook de aplicación para la pantalla Descubrir (HU-03).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-40 a RF-45, CB-10)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, Principio X)
 * - Union/specs/001-plataforma-unificada/tasks.md (T055)
 *
 * Orquesta:
 * - T018: Entidad `Filtro` y `TipoFiltro`.
 * - T052: `busquedaService` (resolución de filtros siempre contra la API RNF-05).
 * - T053: `filtroOpcionesService` (obtención de catálogo de facetas de estilos, técnicas, tipos de arte).
 * - T041: `geolocationClient` (permiso de geolocalización, obtención de coordenadas y revocación CB-10 / RF-45).
 * - T054: `useInfiniteList` (scroll infinito con fin de resultados CB-05 y reset por cambio de filtro).
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Filtro } from '../domain/Filtro'
import { TipoFiltro } from '../domain/enums/TipoFiltro'
import type { Publicacion } from '../domain/Publicacion'
import { busquedaService, type CoordenadasUbicacion } from './busquedaService'
import { filtroOpcionesService, type OpcionesFiltro } from './filtroOpcionesService'
import { geolocationClient } from '../infrastructure/geolocationClient'
import { useInfiniteList, type UseInfiniteListResult, type PaginaResultado } from './useInfiniteList'

export const FILTRO_INICIAL_DESCUBRIR = new Filtro({
  texto: undefined,
  estilo: undefined,
  tecnica: undefined,
  tipoContenido: undefined,
  distanciaKm: undefined,
  geolocalizacionActiva: false,
})

export interface UseDescubrirFiltrosResult extends UseInfiniteListResult<Publicacion> {
  filtro: Filtro
  opcionesFiltro: OpcionesFiltro | null
  cargandoOpciones: boolean
  geolocalizacionHabilitada: boolean
  mensajeGeolocalizacion: string | null
  coordenadas: CoordenadasUbicacion | null
  aplicarFiltro: (nuevoFiltro: Filtro) => void
  establecerTexto: (texto: string) => void
  establecerEstilo: (estilo?: string) => void
  establecerTecnica: (tecnica?: string) => void
  establecerDistancia: (km?: number) => void
  quitarFiltro: (tipo: TipoFiltro) => void
  limpiarFiltros: () => void
  activarGeolocalizacion: () => Promise<boolean>
}

export function useDescubrirFiltros(): UseDescubrirFiltrosResult {
  const [filtro, setFiltro] = useState<Filtro>(FILTRO_INICIAL_DESCUBRIR)
  const [opcionesFiltro, setOpcionesFiltro] = useState<OpcionesFiltro | null>(null)
  const [cargandoOpciones, setCargandoOpciones] = useState<boolean>(false)
  const [coordenadas, setCoordenadas] = useState<CoordenadasUbicacion | null>(null)
  const [mensajeGeolocalizacion, setMensajeGeolocalizacion] = useState<string | null>(null)

  // 1. Carga inicial del catálogo de facetas de filtro (T053)
  useEffect(() => {
    let activo = true
    setCargandoOpciones(true)

    filtroOpcionesService
      .obtenerOpcionesFiltro()
      .then((opciones) => {
        if (activo) {
          setOpcionesFiltro(opciones)
        }
      })
      .catch(() => {
        // En caso de error conservamos null u opciones vacías
      })
      .finally(() => {
        if (activo) {
          setCargandoOpciones(false)
        }
      })

    return () => {
      activo = false
    }
  }, [])

  // 2. Inicialización de geolocalización y observador de revocación en sesión (CB-10 / RF-45)
  useEffect(() => {
    geolocationClient.inicializarObservadorPermisos().catch(() => {})

    // Si el usuario revoca el permiso durante la navegación (CB-10):
    const desuscribirRevocacion = geolocationClient.onRevocacionPermiso(() => {
      setCoordenadas(null)
      setMensajeGeolocalizacion(
        'El permiso de ubicación fue revocado. El filtro de distancia se deshabilitó automáticamente.'
      )
      setFiltro((actual: Filtro) =>
        new Filtro({
          texto: actual.texto,
          estilo: actual.estilo,
          tecnica: actual.tecnica,
          tipoContenido: actual.tipoContenido,
          distanciaKm: undefined,
          geolocalizacionActiva: false,
        })
      )
    })

    return () => {
      desuscribirRevocacion()
    }
  }, [])

  // 3. Activación voluntaria de geolocalización
  const activarGeolocalizacion = useCallback(async (): Promise<boolean> => {
    try {
      const pos = await geolocationClient.obtenerPosicionActual()
      const coords: CoordenadasUbicacion = {
        latitud: pos.latitud,
        longitud: pos.longitud,
      }
      setCoordenadas(coords)
      setMensajeGeolocalizacion(null)
      setFiltro((actual: Filtro) =>
        new Filtro({
          texto: actual.texto,
          estilo: actual.estilo,
          tecnica: actual.tecnica,
          tipoContenido: actual.tipoContenido,
          distanciaKm: actual.distanciaKm,
          geolocalizacionActiva: true,
        })
      )
      return true
    } catch {
      setCoordenadas(null)
      setMensajeGeolocalizacion(
        'No se pudo obtener tu ubicación. Activá la geolocalización en el navegador para usar el filtro por distancia.'
      )
      setFiltro((actual: Filtro) =>
        new Filtro({
          texto: actual.texto,
          estilo: actual.estilo,
          tecnica: actual.tecnica,
          tipoContenido: actual.tipoContenido,
          distanciaKm: undefined,
          geolocalizacionActiva: false,
        })
      )
      return false
    }
  }, [])

  // 4. Función de carga de página delegada a busquedaService (RNF-05 / RF-40)
  const cargarPagina = useCallback(
    async (cursor: string | null): Promise<PaginaResultado<Publicacion>> => {
      const paginaRes = await busquedaService.buscarPublicaciones(filtro, {
        cursor,
        coordenadas,
      })

      return {
        items: paginaRes.items,
        siguienteCursor: paginaRes.siguienteCursor,
        nextPage: paginaRes.nextPage,
        total: paginaRes.total,
      }
    },
    [filtro, coordenadas]
  )

  // 5. Clave de reinicio para scroll infinito: cada cambio en los criterios serializables del filtro
  // reinicia la paginación a la primera página sin recargar la pantalla (RF-41, RNF-05).
  const resetKey = useMemo(() => JSON.stringify(filtro.aQueryParams()), [filtro])

  const infiniteList = useInfiniteList<Publicacion>(cargarPagina, resetKey)

  // 6. Mutadores de filtro convenientes para los componentes UI
  const aplicarFiltro = useCallback((nuevoFiltro: Filtro) => {
    setFiltro(nuevoFiltro)
  }, [])

  const establecerTexto = useCallback((texto: string) => {
    setFiltro((actual: Filtro) =>
      new Filtro({
        texto: texto.trim() === '' ? undefined : texto,
        estilo: actual.estilo,
        tecnica: actual.tecnica,
        tipoContenido: actual.tipoContenido,
        distanciaKm: actual.distanciaKm,
        geolocalizacionActiva: actual.geolocalizacionActiva,
      })
    )
  }, [])

  const establecerEstilo = useCallback((estilo?: string) => {
    setFiltro((actual: Filtro) =>
      new Filtro({
        texto: actual.texto,
        estilo,
        tecnica: actual.tecnica,
        tipoContenido: actual.tipoContenido,
        distanciaKm: actual.distanciaKm,
        geolocalizacionActiva: actual.geolocalizacionActiva,
      })
    )
  }, [])

  const establecerTecnica = useCallback((tecnica?: string) => {
    setFiltro((actual: Filtro) =>
      new Filtro({
        texto: actual.texto,
        estilo: actual.estilo,
        tecnica,
        tipoContenido: actual.tipoContenido,
        distanciaKm: actual.distanciaKm,
        geolocalizacionActiva: actual.geolocalizacionActiva,
      })
    )
  }, [])

  const establecerDistancia = useCallback((distanciaKm?: number) => {
    setFiltro((actual: Filtro) =>
      new Filtro({
        texto: actual.texto,
        estilo: actual.estilo,
        tecnica: actual.tecnica,
        tipoContenido: actual.tipoContenido,
        distanciaKm,
        geolocalizacionActiva: actual.geolocalizacionActiva,
      })
    )
  }, [])

  const quitarFiltro = useCallback((tipo: TipoFiltro) => {
    setFiltro((actual: Filtro) => actual.quitar(tipo))
  }, [])

  const limpiarFiltros = useCallback(() => {
    setFiltro(
      new Filtro({
        texto: undefined,
        estilo: undefined,
        tecnica: undefined,
        tipoContenido: undefined,
        distanciaKm: undefined,
        geolocalizacionActiva: geolocationClient.estaActiva(),
      })
    )
  }, [])

  return {
    ...infiniteList,
    filtro,
    opcionesFiltro,
    cargandoOpciones,
    geolocalizacionHabilitada: filtro.distanciaHabilitada(),
    mensajeGeolocalizacion,
    coordenadas,
    aplicarFiltro,
    establecerTexto,
    establecerEstilo,
    establecerTecnica,
    establecerDistancia,
    quitarFiltro,
    limpiarFiltros,
    activarGeolocalizacion,
  }
}
