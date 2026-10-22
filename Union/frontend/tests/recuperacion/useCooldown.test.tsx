// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { segundosRestantes, useCooldown } from '../../src/application/useCooldown'

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

describe('segundosRestantes', () => {
  it('redondea hacia arriba y nunca es negativo', () => {
    expect(segundosRestantes(null, 1000)).toBe(0)
    expect(segundosRestantes(61_000, 1_000)).toBe(60)
    expect(segundosRestantes(1_500, 1_000)).toBe(1)
    expect(segundosRestantes(1_000, 5_000)).toBe(0)
  })
})

describe('useCooldown', () => {
  it('cuenta regresivamente y se libera al llegar a cero', () => {
    vi.useFakeTimers()
    let ahora = 0
    const reloj = () => ahora
    const { result } = renderHook(() => useCooldown(reloj))

    expect(result.current.activo).toBe(false)

    act(() => result.current.iniciar(3))
    expect(result.current.restantes).toBe(3)
    expect(result.current.activo).toBe(true)

    act(() => {
      ahora = 2000
      vi.advanceTimersByTime(2000)
    })
    expect(result.current.restantes).toBe(1)

    act(() => {
      ahora = 3000
      vi.advanceTimersByTime(1000)
    })
    expect(result.current.restantes).toBe(0)
    expect(result.current.activo).toBe(false)
  })
})
