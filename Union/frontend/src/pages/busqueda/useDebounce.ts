import { useEffect, useState } from 'react'
import { DEBOUNCE_MS } from '../../domain/busqueda/constantes'

/**
 * Devuelve `valor` retrasado `retardoMs` (por defecto 400 ms, RF-23) desde el último cambio.
 * Limpia el temporizador al cambiar el valor y al desmontar (T055).
 */
export function useDebounce<T>(valor: T, retardoMs: number = DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState<T>(valor)

  useEffect(() => {
    const id = setTimeout(() => setDebounced(valor), retardoMs)
    return () => clearTimeout(id)
  }, [valor, retardoMs])

  return debounced
}
