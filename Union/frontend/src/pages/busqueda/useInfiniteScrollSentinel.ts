import { useLayoutEffect, useRef } from 'react'

export interface OpcionesSentinel {
  /** Si es `false` no se observa (p. ej. cargando o sin más resultados). */
  readonly habilitado?: boolean
  /** Margen para anticipar la carga antes de llegar al final. */
  readonly rootMargin?: string
}

/**
 * Observa un elemento centinela con `IntersectionObserver` y llama a `alIntersectar` cuando
 * entra en pantalla (T038). Devuelve la `ref` a colocar en el centinela. Desconecta el
 * observer al desmontar, al deshabilitarse o si cambia el elemento (T055).
 * Sin `IntersectionObserver` disponible (p. ej. jsdom) no hace nada.
 */
export function useInfiniteScrollSentinel<T extends Element = HTMLDivElement>(
  alIntersectar: () => void,
  { habilitado = true, rootMargin = '200px' }: OpcionesSentinel = {},
) {
  const ref = useRef<T | null>(null)
  const callbackRef = useRef(alIntersectar)
  callbackRef.current = alIntersectar

  // Layout effect: el observer queda creado en el mismo commit en que aparece el centinela.
  useLayoutEffect(() => {
    const elemento = ref.current
    if (!habilitado || elemento === null || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) callbackRef.current()
      },
      { rootMargin },
    )
    observer.observe(elemento)
    return () => observer.disconnect()
  }, [habilitado, rootMargin])

  return ref
}
