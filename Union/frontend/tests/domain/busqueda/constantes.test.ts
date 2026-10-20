import { describe, expect, it } from 'vitest'
import {
  DEBOUNCE_MS,
  MAX_CARACTERES,
  MIN_CARACTERES,
  TAMANO_PAGINA,
  kmARango,
  rangoAKm,
} from '../../../src/domain/busqueda/constantes'
import { RangoDistancia } from '../../../src/domain/enums/RangoDistancia'

describe('constantes de búsqueda', () => {
  it('tienen los valores definidos en la spec', () => {
    expect(TAMANO_PAGINA).toBe(20)
    expect(DEBOUNCE_MS).toBe(400)
    expect(MIN_CARACTERES).toBe(2)
    expect(MAX_CARACTERES).toBe(100)
  })

  it.each([
    [RangoDistancia.KM_5, 5],
    [RangoDistancia.KM_25, 25],
    [RangoDistancia.KM_100, 100],
    [RangoDistancia.CUALQUIERA, null],
  ])('rangoAKm(%s) = %s', (rango, km) => {
    expect(rangoAKm(rango)).toBe(km)
  })

  it.each([
    [5, RangoDistancia.KM_5],
    [25, RangoDistancia.KM_25],
    [100, RangoDistancia.KM_100],
  ])('kmARango(%s) = %s', (km, rango) => {
    expect(kmARango(km)).toBe(rango)
  })

  it('kmARango devuelve null para valores no soportados', () => {
    expect(kmARango(10)).toBeNull()
    expect(kmARango(0)).toBeNull()
    expect(kmARango(-5)).toBeNull()
  })

  it('ida y vuelta rango ⇄ km', () => {
    for (const r of [RangoDistancia.KM_5, RangoDistancia.KM_25, RangoDistancia.KM_100]) {
      expect(kmARango(rangoAKm(r) as number)).toBe(r)
    }
  })
})
