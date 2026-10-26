import { useEffect, useRef } from 'react'

/**
 * Lleva el scroll al inicio cada vez que `senal` cambia (CA-04.2, T072). La señal la incrementa
 * `SesionBusqueda` en cada reinicio por cambio de criterios; aquí no hay reglas de negocio.
 *
 * El primer valor observado (mientras `habilitado` es `false` o al habilitarse por primera vez)
 * solo fija la línea base y no hace scroll: así la siembra inicial desde la URL no lo dispara.
 */
export function useScrollAlInicio(senal: number, habilitado: boolean): void {
  const ultimaSenal = useRef<number | null>(null)

  useEffect(() => {
    if (!habilitado) return
    if (ultimaSenal.current === null) {
      ultimaSenal.current = senal
      return
    }
    if (senal !== ultimaSenal.current) {
      ultimaSenal.current = senal
      window.scrollTo({ top: 0 })
    }
  }, [senal, habilitado])
}
