import { useCallback, useEffect, useReducer, useRef } from 'react'
import { SesionBusqueda } from '../../application/busqueda/SesionBusqueda'
import type { BusquedaRepository } from '../../application/busqueda/BusquedaRepository'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import type { FiltroActivo } from '../../domain/busqueda/FiltroActivo'
import type { PublicacionResumen } from '../../domain/busqueda/PublicacionResumen'
import type { EstadoCarga } from '../../domain/enums/EstadoCarga'
import type { OrigenFeed } from '../../domain/enums/OrigenFeed'
import { obtenerBusquedaRepository } from '../../infrastructure/config'

export interface UseBusquedaResultado {
  readonly criterios: CriteriosBusqueda
  readonly origen: OrigenFeed
  readonly items: readonly PublicacionResumen[]
  readonly hayMas: boolean
  readonly estadoCarga: EstadoCarga
  readonly error: ErrorBusqueda | null
  readonly senalScrollInicio: number
  readonly cambiarTexto: (texto: string) => void
  readonly aplicarFiltro: (filtro: FiltroActivo) => void
  readonly quitarFiltro: (filtro: FiltroActivo) => void
  readonly limpiarFiltros: () => void
  readonly cargarMas: () => void
  readonly reintentar: () => void
}

/**
 * Hook delgado que observa `SesionBusqueda` (T037). No contiene reglas de negocio: solo crea
 * la sesión una vez, la inicia al montar, re-renderiza ante sus cambios y delega las acciones.
 * El debounce del texto y el scroll infinito son de otros hooks (T038).
 *
 * @param repositorio Opcional (tests); por defecto el configurado en `infrastructure/config`.
 */
export function useBusqueda(repositorio?: BusquedaRepository): UseBusquedaResultado {
  const [, redibujar] = useReducer((n: number) => n + 1, 0)
  const sesionRef = useRef<SesionBusqueda | null>(null)
  if (sesionRef.current === null) {
    sesionRef.current = new SesionBusqueda({
      repositorio: repositorio ?? obtenerBusquedaRepository(),
    })
  }
  const sesion = sesionRef.current

  useEffect(() => {
    const baja = sesion.suscribir(redibujar)
    void sesion.iniciar()
    return () => {
      baja()
      sesion.destruir()
    }
  }, [sesion])

  const cambiarTexto = useCallback((texto: string) => void sesion.cambiarTexto(texto), [sesion])
  const aplicarFiltro = useCallback((f: FiltroActivo) => void sesion.aplicarFiltro(f), [sesion])
  const quitarFiltro = useCallback((f: FiltroActivo) => void sesion.quitarFiltro(f), [sesion])
  const limpiarFiltros = useCallback(() => void sesion.limpiarFiltros(), [sesion])
  const cargarMas = useCallback(() => void sesion.cargarMas(), [sesion])
  const reintentar = useCallback(() => void sesion.reintentar(), [sesion])

  return {
    criterios: sesion.criterios,
    origen: sesion.origen,
    items: sesion.items,
    hayMas: sesion.hayMas,
    estadoCarga: sesion.estadoCarga,
    error: sesion.error,
    senalScrollInicio: sesion.senalScrollInicio,
    cambiarTexto,
    aplicarFiltro,
    quitarFiltro,
    limpiarFiltros,
    cargarMas,
    reintentar,
  }
}
