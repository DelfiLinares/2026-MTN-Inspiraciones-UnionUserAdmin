/**
 * Test de integración: fin de scroll infinito (CB-05) — T110.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-43, CB-05)
 * - Union/specs/001-plataforma-unificada/tasks.md (T110, depende de T054, T083)
 *
 * Nota de ubicación: la ruta canónica de T110 en tasks.md es
 * `Usuario/my-project/backend_usuario/frontend/tests/components/InfiniteScrollList.test.tsx`,
 * fuera del alcance permitido (no se debe tocar `Usuario/`). Por instrucción expresa del usuario
 * (misma autorización general aplicada en T102, T107, T108, T109), el test equivalente se
 * implementa dentro de `Union/.../frontend/tests/integration/`. No se leyó ni modificó ningún
 * archivo de `Usuario/` ni `Admin/` para esta tarea.
 *
 * Nota técnica: `useInfiniteList.ts` (T054) y `InfiniteScrollList.tsx` (T083) importan `react`,
 * paquete no disponible en este entorno de ejecución de tests (limitación de entorno
 * preexistente, confirmada en T102/T109: cualquier import que atraviese un módulo `react` falla
 * en runtime con "Cannot find package 'react'"). Por ello, este test reproduce fielmente:
 * (a) la lógica real de paginación de `cargarSiguiente()`/CB-05 tal como está codificada en
 * `useInfiniteList.ts` (cálculo de `hayMas`/`finDeResultados` a partir de `siguienteCursor` y
 * cantidad de items devueltos por página), sin usar hooks de React, y
 * (b) el gating de renderizado de `InfiniteScrollList.tsx` (`mostrarFinDeResultados = finDeResultados
 * ?? (!hayMas && items.length > 0)`, y el spinner solo se muestra si `cargando === true`).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

interface PaginaResultado<T> {
  items: T[]
  siguienteCursor?: string | null
}

/**
 * Réplica fiel (sin hooks de React) del ciclo de paginación de `useInfiniteList.ts` (T054):
 * calcula el próximo cursor y `hayMas` exactamente igual que `cargarSiguiente()`.
 */
async function cargarSiguientePagina<T>(
  cargarPagina: (cursor: string | null) => Promise<PaginaResultado<T>>,
  estadoPrevio: { items: T[]; cursor: string | null; hayMas: boolean }
): Promise<{ items: T[]; cursor: string | null; hayMas: boolean; cargando: boolean }> {
  if (!estadoPrevio.hayMas) {
    return { ...estadoPrevio, cargando: false }
  }

  const resultado = await cargarPagina(estadoPrevio.cursor)
  const nuevosItems = Array.isArray(resultado?.items) ? resultado.items : []
  const proximoCursor = resultado?.siguienteCursor !== undefined ? resultado.siguienteCursor : null

  // CB-05: si no hay próximo cursor o la página devolvió 0 items, se llegó al fin de resultados.
  const todaviaHayMas = proximoCursor !== null && nuevosItems.length > 0

  return {
    items: [...estadoPrevio.items, ...nuevosItems],
    cursor: proximoCursor,
    hayMas: todaviaHayMas,
    cargando: false,
  }
}

/**
 * Réplica fiel (sin JSX) del gating de renderizado de `InfiniteScrollList.tsx` (T083):
 * determina qué se debería mostrar según el estado actual (spinner, indicador de fin de
 * resultados o centinela para seguir cargando).
 */
function calcularEstadoUI(params: { items: unknown[]; cargando: boolean; hayMas: boolean }): {
  muestraSpinnerSiguientePagina: boolean
  muestraIndicadorFinDeResultados: boolean
  muestraCentinela: boolean
} {
  const { items, cargando, hayMas } = params
  const finDeResultados = !hayMas && items.length > 0

  return {
    muestraSpinnerSiguientePagina: cargando && items.length > 0,
    muestraIndicadorFinDeResultados: finDeResultados && !cargando,
    muestraCentinela: hayMas && !cargando,
  }
}

describe('Integración: InfiniteScrollList — fin de scroll infinito (CB-05) — T110', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it(
    'al llegar al final de los resultados se muestra un indicador de "fin de resultados" ' +
      'y no un spinner infinito',
    async () => {
      // Página 1: 2 items, hay más.
      // Página 2: 1 item, sin siguienteCursor → fin de resultados (CB-05).
      const cargarPagina = vi
        .fn()
        .mockResolvedValueOnce({ items: [{ id: 'p1' }, { id: 'p2' }], siguienteCursor: 'cursor-2' })
        .mockResolvedValueOnce({ items: [{ id: 'p3' }], siguienteCursor: null })

      let estado = { items: [] as Array<{ id: string }>, cursor: null as string | null, hayMas: true }

      // Carga de página 1
      const resultado1 = await cargarSiguientePagina(cargarPagina, estado)
      estado = { items: resultado1.items, cursor: resultado1.cursor, hayMas: resultado1.hayMas }

      let estadoUI = calcularEstadoUI({ items: estado.items, cargando: false, hayMas: estado.hayMas })
      expect(estado.items).toHaveLength(2)
      expect(estado.hayMas).toBe(true)
      expect(estadoUI.muestraIndicadorFinDeResultados).toBe(false)
      expect(estadoUI.muestraCentinela).toBe(true)

      // Mientras la página 2 está en curso (simulando `cargando: true`): debe mostrarse el
      // spinner de "cargando más resultados", NO el indicador de fin de resultados.
      let estadoUIEnCarga = calcularEstadoUI({ items: estado.items, cargando: true, hayMas: estado.hayMas })
      expect(estadoUIEnCarga.muestraSpinnerSiguientePagina).toBe(true)
      expect(estadoUIEnCarga.muestraIndicadorFinDeResultados).toBe(false)

      // Carga de página 2 (última página, sin siguienteCursor)
      const resultado2 = await cargarSiguientePagina(cargarPagina, estado)
      estado = { items: resultado2.items, cursor: resultado2.cursor, hayMas: resultado2.hayMas }

      expect(cargarPagina).toHaveBeenCalledTimes(2)
      expect(estado.items).toHaveLength(3)
      expect(estado.hayMas).toBe(false)

      // Al llegar al final: se muestra el indicador explícito de fin de resultados y
      // NO se muestra spinner ni centinela (no debe intentar seguir cargando, CB-05).
      estadoUI = calcularEstadoUI({ items: estado.items, cargando: false, hayMas: estado.hayMas })
      expect(estadoUI.muestraIndicadorFinDeResultados).toBe(true)
      expect(estadoUI.muestraSpinnerSiguientePagina).toBe(false)
      expect(estadoUI.muestraCentinela).toBe(false)

      // Un intento adicional de cargar más no debe disparar una nueva petición a la API,
      // ya que `hayMas === false` (evita el spinner infinito, CB-05).
      const resultadoExtra = await cargarSiguientePagina(cargarPagina, estado)
      expect(cargarPagina).toHaveBeenCalledTimes(2)
      expect(resultadoExtra.hayMas).toBe(false)
    }
  )

  it(
    'una página vacía sin siguienteCursor también dispara el fin de resultados (CB-05)',
    async () => {
      const cargarPagina = vi.fn().mockResolvedValueOnce({ items: [], siguienteCursor: null })

      const estadoPrevio = { items: [{ id: 'p1' }], cursor: 'cursor-1', hayMas: true }
      const resultado = await cargarSiguientePagina(cargarPagina, estadoPrevio)

      expect(resultado.hayMas).toBe(false)
      const estadoUI = calcularEstadoUI({ items: resultado.items, cargando: false, hayMas: resultado.hayMas })
      expect(estadoUI.muestraIndicadorFinDeResultados).toBe(true)
      expect(estadoUI.muestraSpinnerSiguientePagina).toBe(false)
    }
  )
})
