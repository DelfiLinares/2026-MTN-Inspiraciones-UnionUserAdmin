import { act, fireEvent, render, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useBusqueda } from '../../../src/pages/busqueda/useBusqueda'
import { useDebounce } from '../../../src/pages/busqueda/useDebounce'
import { PieCarga } from '../../../src/components/busqueda/PieCarga'
import { BarraBusqueda } from '../../../src/components/busqueda/BarraBusqueda'
import type { BusquedaRepository } from '../../../src/application/busqueda/BusquedaRepository'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'

/**
 * T055 — Cancelación al desmontar y limpieza de observer y timers del debounce.
 */

describe('useBusqueda: desmontaje (T055)', () => {
  it('al desmontar la página aborta la petición en curso', () => {
    let senal: AbortSignal | undefined
    const base = new BusquedaEnMemoriaRepository()
    const repositorio: BusquedaRepository = {
      obtenerFyp: (cursor, signal) => {
        senal = signal
        return new Promise(() => undefined) // nunca responde
      },
      buscar: (criterios, cursor, signal) => base.buscar(criterios, cursor, signal),
      obtenerCatalogoFiltros: (signal) => base.obtenerCatalogoFiltros(signal),
    }

    const { unmount } = renderHook(() => useBusqueda(repositorio))
    expect(senal?.aborted).toBe(false)

    unmount()

    expect(senal?.aborted).toBe(true)
  })
})

describe('PieCarga: observer (T055)', () => {
  let desconectar: ReturnType<typeof vi.fn>

  beforeEach(() => {
    desconectar = vi.fn()
    class ObservadorFalso {
      constructor(_cb: IntersectionObserverCallback, _opciones?: IntersectionObserverInit) {}
      observe() {}
      disconnect() {
        desconectar()
      }
    }
    vi.stubGlobal('IntersectionObserver', ObservadorFalso)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('desconecta el observer al desmontar', () => {
    const { unmount } = render(<PieCarga hayMas cargando={false} onCargarMas={() => undefined} />)
    expect(desconectar).not.toHaveBeenCalled()

    unmount()

    expect(desconectar).toHaveBeenCalledTimes(1)
  })

  it('desconecta el observer al deshabilitarse (cargando)', () => {
    const { rerender } = render(
      <PieCarga hayMas cargando={false} onCargarMas={() => undefined} />,
    )
    rerender(<PieCarga hayMas cargando onCargarMas={() => undefined} />)

    expect(desconectar).toHaveBeenCalledTimes(1)
  })
})

describe('useDebounce: timers (T055)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('al desmontar no queda ningún timer pendiente', () => {
    const { rerender, unmount } = renderHook(({ v }) => useDebounce(v, 400), {
      initialProps: { v: 'a' },
    })
    rerender({ v: 'ab' })
    expect(vi.getTimerCount()).toBe(1)

    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})

describe('BarraBusqueda: timer del debounce (T055)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('al desmontar con una emisión pendiente cancela el timer y no emite', () => {
    const onCambiar = vi.fn()
    const { container, unmount } = render(<BarraBusqueda valor="" onCambiar={onCambiar} />)
    const input = container.querySelector('input') as HTMLInputElement

    fireEvent.change(input, { target: { value: 'playa' } })
    expect(vi.getTimerCount()).toBe(1)

    unmount()
    expect(vi.getTimerCount()).toBe(0)

    act(() => {
      vi.runOnlyPendingTimers()
    })
    expect(onCambiar).not.toHaveBeenCalled()
  })
})
