/**
 * Hook genérico de paginación / scroll infinito para listados (Feed, Descubrir, etc.).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-43, CB-05)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, Principio X)
 * - Union/specs/001-plataforma-unificada/tasks.md (T054, T110)
 *
 * Responsabilidades:
 * - Paginación desacoplada del protocolo subyacente (soporta cursor o página numérica).
 * - Cobertura explícita de CB-05: expone `hasMore = false` y `finDeResultados = true` cuando
 *   se alcanza el final de los resultados, permitiendo a la UI mostrar un indicador de fin
 *   de lista en lugar de un spinner infinito.
 * - Integra `IntersectionObserver` mediante callback ref (`centinelaRef`) para disparar
 *   automáticamente la carga de la siguiente página al ingresar en el viewport.
 * - Soporte de `resetKey` para reiniciar la lista cuando cambian los criterios de búsqueda/filtro.
 */

import { useCallback, useEffect, useRef, useState } from 'react'

export interface PaginaResultado<T> {
  items: T[]
  siguienteCursor?: string | null
  nextPage?: number | null
  total?: number
}

export interface UseInfiniteListResult<T> {
  items: T[]
  cargando: boolean
  hayMas: boolean
  /** Alias explícito para cumplimiento de CB-05 */
  hasMore: boolean
  finDeResultados: boolean
  error: unknown
  centinelaRef: (nodo: Element | null) => void
  recargar: () => Promise<void>
}

export function useInfiniteList<T>(
  cargarPagina: (cursor: string | null) => Promise<PaginaResultado<T>>,
  resetKey?: unknown
): UseInfiniteListResult<T> {
  const [items, setItems] = useState<T[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [cargando, setCargando] = useState<boolean>(false)
  const [hayMas, setHayMas] = useState<boolean>(true)
  const [error, setError] = useState<unknown>(null)

  const cargarPaginaRef = useRef(cargarPagina)
  cargarPaginaRef.current = cargarPagina

  const observerRef = useRef<IntersectionObserver | null>(null)
  const enCursoRef = useRef<boolean>(false)

  const cargarSiguiente = useCallback(async () => {
    if (enCursoRef.current || !hayMas) {
      return
    }

    enCursoRef.current = true
    setCargando(true)
    setError(null)

    try {
      const resultado = await cargarPaginaRef.current(cursor)
      const nuevosItems = Array.isArray(resultado?.items) ? resultado.items : []
      const proximoCursor =
        resultado?.siguienteCursor !== undefined
          ? resultado.siguienteCursor
          : resultado?.nextPage !== undefined && resultado.nextPage !== null
          ? String(resultado.nextPage)
          : null

      setItems((previos: T[]) => [...previos, ...nuevosItems])
      setCursor(proximoCursor)

      // CB-05: Si no hay próximo cursor o la página devolvió 0 items, se llegó al fin de resultados
      const todaviaHayMas = proximoCursor !== null && nuevosItems.length > 0
      setHayMas(todaviaHayMas)
    } catch (err) {
      setError(err)
    } finally {
      setCargando(false)
      enCursoRef.current = false
    }
  }, [cursor, hayMas])

  const recargar = useCallback(async () => {
    setItems([])
    setCursor(null)
    setHayMas(true)
    setError(null)
    enCursoRef.current = false

    enCursoRef.current = true
    setCargando(true)
    try {
      const resultado = await cargarPaginaRef.current(null)
      const nuevosItems = Array.isArray(resultado?.items) ? resultado.items : []
      const proximoCursor =
        resultado?.siguienteCursor !== undefined
          ? resultado.siguienteCursor
          : resultado?.nextPage !== undefined && resultado.nextPage !== null
          ? String(resultado.nextPage)
          : null

      setItems(nuevosItems)
      setCursor(proximoCursor)
      setHayMas(proximoCursor !== null && nuevosItems.length > 0)
    } catch (err) {
      setError(err)
    } finally {
      setCargando(false)
      enCursoRef.current = false
    }
  }, [])

  // Carga inicial
  useEffect(() => {
    cargarSiguiente()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Reinicio ante cambios en resetKey
  useEffect(() => {
    if (resetKey === undefined) {
      return
    }
    recargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey])

  // Centinela con IntersectionObserver
  const centinelaRef = useCallback(
    (nodo: Element | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
        observerRef.current = null
      }

      if (!nodo) {
        return
      }

      // Si no hay soporte para IntersectionObserver en el entorno, retornar
      if (typeof IntersectionObserver === 'undefined') {
        return
      }

      observerRef.current = new IntersectionObserver((entradas) => {
        if (entradas[0]?.isIntersecting) {
          cargarSiguiente()
        }
      })

      observerRef.current.observe(nodo)
    },
    [cargarSiguiente]
  )

  const finDeResultados = !hayMas && items.length > 0

  return {
    items,
    cargando,
    hayMas,
    hasMore: hayMas,
    finDeResultados,
    error,
    centinelaRef,
    recargar,
  }
}
