import { useEffect, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CodecCriteriosUrl } from '../../domain/busqueda/CodecCriteriosUrl'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'

/** A-02 diferida: no hay ubicación concedida, así que DISTANCIA nunca se restaura de la URL. */
const CONTEXTO = { ubicacionConcedida: false } as const

export interface UseCriteriosEnUrlResultado {
  /** Criterios que representa la URL actual (al montar, los iniciales; luego, atrás/adelante). */
  readonly criteriosEnUrl: CriteriosBusqueda
}

/**
 * Sincroniza query params ⇄ criterios con `CodecCriteriosUrl` (T039; HU-07, RF-24).
 *
 * - URL → criterios: `criteriosEnUrl` se parsea de la URL actual; la página los aplica a la
 *   sesión al montar y ante navegación atrás/adelante.
 * - Criterios → URL: cuando los criterios de la sesión cambian y ya no coinciden con la URL,
 *   la escribe. Si solo cambió el texto usa `replace` (no llena el historial al escribir);
 *   si cambió algún filtro usa `push`.
 * - No escribe la URL si ya coincide, para no generar bucles. Sin reglas de negocio.
 */
export function useCriteriosEnUrl(criterios: CriteriosBusqueda): UseCriteriosEnUrlResultado {
  const [searchParams, setSearchParams] = useSearchParams()
  const textoDeUrl = searchParams.toString()

  const criteriosEnUrl = useMemo(
    () => CodecCriteriosUrl.parsear(new URLSearchParams(textoDeUrl), CONTEXTO),
    [textoDeUrl],
  )

  const anterior = useRef<CriteriosBusqueda>(criterios)

  useEffect(() => {
    const previos = anterior.current
    anterior.current = criterios

    const deseada = CodecCriteriosUrl.serializar(criterios)
    if (deseada.toString() === textoDeUrl) return

    const soloCambioTexto =
      previos.texto !== criterios.texto &&
      CodecCriteriosUrl.serializar(previos.limpiarTexto()).toString() ===
        CodecCriteriosUrl.serializar(criterios.limpiarTexto()).toString()

    setSearchParams(deseada, { replace: soloCambioTexto })
    // `textoDeUrl` se omite a propósito: solo reaccionamos a cambios de criterios.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criterios])

  return { criteriosEnUrl }
}
