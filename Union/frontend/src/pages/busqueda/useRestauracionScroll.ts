import { useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { EstadoCarga } from '../../domain/enums/EstadoCarga'

const PREFIJO_CLAVE = 'busqueda:scroll:'

interface PosicionGuardada {
  /** `window.scrollY` al salir de la página. */
  readonly y: number
  /** Publicaciones cargadas al salir; se recargan páginas hasta alcanzarlas. */
  readonly cantidad: number
}

export interface OpcionesRestauracionScroll {
  readonly itemsCount: number
  readonly estadoCarga: EstadoCarga
  readonly hayMas: boolean
  readonly cargarMas: () => void
}

function leerPosicion(clave: string): PosicionGuardada | null {
  try {
    const crudo = window.sessionStorage.getItem(clave)
    return crudo === null ? null : (JSON.parse(crudo) as PosicionGuardada)
  } catch {
    return null
  }
}

function guardarPosicion(clave: string, posicion: PosicionGuardada): void {
  try {
    window.sessionStorage.setItem(clave, JSON.stringify(posicion))
  } catch {
    // Sin almacenamiento disponible solo se pierde la restauración.
  }
}

/**
 * Conserva el scroll y la cantidad de publicaciones cargadas al salir de la búsqueda (T050,
 * HU-07, RF-24). La clave es el query string de la URL, así que los mismos criterios
 * recuperan su posición. Se restaura solo al volver con atrás/adelante (`POP`); una búsqueda
 * nueva empieza arriba.
 *
 * Al volver el cursor no se conserva, así que se piden páginas hasta igualar la cantidad
 * guardada (o hasta agotar resultados) y después se desplaza.
 */
export function useRestauracionScroll({
  itemsCount,
  estadoCarga,
  hayMas,
  cargarMas,
}: OpcionesRestauracionScroll): void {
  const { search } = useLocation()
  const tipoNavegacion = useNavigationType()

  const claveRef = useRef(PREFIJO_CLAVE + search)
  claveRef.current = PREFIJO_CLAVE + search
  const itemsRef = useRef(itemsCount)
  itemsRef.current = itemsCount

  const pendiente = useRef<PosicionGuardada | null>(
    tipoNavegacion === 'POP' ? leerPosicion(claveRef.current) : null,
  )

  // Al desmontar (p. ej. al abrir el detalle) el DOM anterior sigue presente: el scroll
  // todavía no se ha recortado por el contenido nuevo.
  useLayoutEffect(() => {
    return () => {
      guardarPosicion(
        claveRef.current,
        pendiente.current ?? { y: window.scrollY, cantidad: itemsRef.current },
      )
    }
  }, [])

  useEffect(() => {
    const restaurar = pendiente.current
    if (restaurar === null) return
    if (estadoCarga === EstadoCarga.ERROR) {
      pendiente.current = null
      return
    }
    if (estadoCarga !== EstadoCarga.LISTO && estadoCarga !== EstadoCarga.VACIO) return

    if (itemsCount >= restaurar.cantidad || !hayMas) {
      pendiente.current = null
      window.sessionStorage.removeItem(claveRef.current)
      window.scrollTo({ top: restaurar.y })
      return
    }
    cargarMas()
  }, [estadoCarga, itemsCount, hayMas, cargarMas])
}
