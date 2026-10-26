import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type {
  EstadoPermisoUbicacion,
  UbicacionPort,
} from '../../../src/application/busqueda/UbicacionPort'
import { useUbicacionPermiso } from '../../../src/pages/busqueda/useUbicacionPermiso'

function crearPuertoFalso(estadoInicial: EstadoPermisoUbicacion) {
  let estado = estadoInicial
  const oyentes = new Set<(e: EstadoPermisoUbicacion) => void>()
  const puerto: UbicacionPort = {
    estadoPermiso: () => estado,
    suscribirCambioPermiso: (callback) => {
      oyentes.add(callback)
      return () => {
        oyentes.delete(callback)
      }
    },
  }
  return {
    puerto,
    emitir(nuevo: EstadoPermisoUbicacion) {
      estado = nuevo
      oyentes.forEach((cb) => cb(nuevo))
    },
    cantidadOyentes: () => oyentes.size,
  }
}

describe('useUbicacionPermiso (A-02, CB-10)', () => {
  it('devuelve el estado inicial que informa el puerto', () => {
    const falso = crearPuertoFalso('prompt')
    const { result } = renderHook(() => useUbicacionPermiso(falso.puerto))
    expect(result.current).toBe('prompt')
  })

  it('reporta no_soportado sin cambios cuando el navegador no ofrece geolocalización', () => {
    const falso = crearPuertoFalso('no_soportado')
    const { result } = renderHook(() => useUbicacionPermiso(falso.puerto))
    expect(result.current).toBe('no_soportado')
  })

  it('se actualiza cuando el puerto notifica un cambio de permiso', () => {
    const falso = crearPuertoFalso('prompt')
    const { result } = renderHook(() => useUbicacionPermiso(falso.puerto))

    act(() => falso.emitir('granted'))
    expect(result.current).toBe('granted')

    act(() => falso.emitir('denied'))
    expect(result.current).toBe('denied')
  })

  it('refleja la revocación del permiso (denied)', () => {
    const falso = crearPuertoFalso('granted')
    const { result } = renderHook(() => useUbicacionPermiso(falso.puerto))
    expect(result.current).toBe('granted')

    act(() => falso.emitir('denied'))
    expect(result.current).toBe('denied')
  })

  it('cancela la suscripción al desmontarse', () => {
    const falso = crearPuertoFalso('prompt')
    const { unmount } = renderHook(() => useUbicacionPermiso(falso.puerto))
    expect(falso.cantidadOyentes()).toBe(1)

    unmount()
    expect(falso.cantidadOyentes()).toBe(0)
  })
})
