import { describe, expect, it, vi } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import {
  PUBLICACIONES_EJEMPLO,
  type PublicacionEjemplo,
} from '../../../src/infrastructure/busqueda/datosEjemplo'
import { TAMANO_PAGINA } from '../../../src/domain/busqueda/constantes'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'

/**
 * T027 — `SesionBusqueda`: control de concurrencia de la carga de más resultados
 * (HU-01, RF-08): no cargar más mientras hay una carga en curso ni con `hayMas=false`.
 *
 * Tests escritos antes de la implementación (T034a). Además del contrato asumido en
 * T026 (`iniciar`, `criterios`, `items`, `estadoCarga`) se asume:
 *   await sesion.cargarMas()   // pide la página siguiente; no hace nada si no corresponde
 *   sesion.hayMas              // derivado del cursor de la última página
 * Usa el adaptador en memoria (T020a) con una compuerta manual para controlar cuándo
 * responde cada petición; sin MSW.
 */
function crear(datos: readonly PublicacionEjemplo[] = PUBLICACIONES_EJEMPLO) {
  let retenerDesde = Number.POSITIVE_INFINITY
  let llamadas = 0
  const liberadores: Array<() => void> = []

  const repositorio = new BusquedaEnMemoriaRepository({
    datos,
    antesDeResponder: async () => {
      llamadas++
      if (llamadas < retenerDesde) return
      await new Promise<void>((resolver) => liberadores.push(resolver))
    },
  })
  const obtenerFyp = vi.spyOn(repositorio, 'obtenerFyp')
  const sesion = new SesionBusqueda({ repositorio })

  return {
    sesion,
    obtenerFyp,
    /** Las peticiones a partir de la n-ésima quedan retenidas hasta `liberar()`. */
    retenerDesdeLlamada(n: number) {
      retenerDesde = n
    },
    liberar() {
      liberadores.splice(0).forEach((f) => f())
    },
    pendientes: () => liberadores.length,
  }
}

describe('SesionBusqueda — cargar más (paginación)', () => {
  it('cargarMas agrega la página siguiente al final, usando el cursor de la anterior', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    const primeros = ctx.sesion.items.map((i) => i.id)
    await ctx.sesion.cargarMas()
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA * 2)
    expect(ctx.sesion.items.slice(0, TAMANO_PAGINA).map((i) => i.id)).toEqual(primeros)
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(2)
    expect(typeof ctx.obtenerFyp.mock.calls[1][0]).toBe('string')
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('no hay ids repetidos tras varias páginas', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    await ctx.sesion.cargarMas()
    await ctx.sesion.cargarMas()
    const ids = ctx.sesion.items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(PUBLICACIONES_EJEMPLO.length)
  })
})

describe('SesionBusqueda — no cargar mientras hay carga en curso', () => {
  it('cargarMas durante la carga inicial no dispara otra petición', async () => {
    const ctx = crear()
    ctx.retenerDesdeLlamada(1)
    const inicial = ctx.sesion.iniciar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)

    await ctx.sesion.cargarMas()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)

    ctx.liberar()
    await inicial
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA)
  })

  it('llamadas repetidas a cargarMas con una carga en curso generan una sola petición', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    ctx.retenerDesdeLlamada(2)

    const a = ctx.sesion.cargarMas()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO_MAS)
    const b = ctx.sesion.cargarMas()
    const c = ctx.sesion.cargarMas()
    await Promise.all([b, c])

    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(2)
    expect(ctx.pendientes()).toBe(1)

    ctx.liberar()
    await a
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA * 2)
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('un disparo rápido y repetido (scroll) no duplica items', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    ctx.retenerDesdeLlamada(2)
    const cargas = [ctx.sesion.cargarMas(), ctx.sesion.cargarMas(), ctx.sesion.cargarMas()]
    ctx.liberar()
    await Promise.all(cargas)
    const ids = ctx.sesion.items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ids).toHaveLength(TAMANO_PAGINA * 2)
  })

  it('al terminar la carga en curso se puede pedir la siguiente página', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    await ctx.sesion.cargarMas()
    await ctx.sesion.cargarMas()
    expect(ctx.sesion.items).toHaveLength(PUBLICACIONES_EJEMPLO.length)
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(3)
  })
})

describe('SesionBusqueda — no cargar con hayMas=false', () => {
  it('en la última página hayMas es false y cargarMas no consulta al repositorio', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    await ctx.sesion.cargarMas()
    await ctx.sesion.cargarMas() // última página (parcial)
    expect(ctx.sesion.hayMas).toBe(false)
    const llamadas = ctx.obtenerFyp.mock.calls.length

    await ctx.sesion.cargarMas()
    await ctx.sesion.cargarMas()

    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(llamadas)
    expect(ctx.sesion.items).toHaveLength(PUBLICACIONES_EJEMPLO.length)
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('con menos resultados que una página hayMas es false desde el inicio', async () => {
    const ctx = crear(PUBLICACIONES_EJEMPLO.slice(0, 5))
    await ctx.sesion.iniciar()
    expect(ctx.sesion.hayMas).toBe(false)
    await ctx.sesion.cargarMas()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
    expect(ctx.sesion.items).toHaveLength(5)
  })

  it('con exactamente una página completa y sin cursor siguiente no consulta de nuevo', async () => {
    const ctx = crear(PUBLICACIONES_EJEMPLO.slice(0, TAMANO_PAGINA))
    await ctx.sesion.iniciar()
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA)
    expect(ctx.sesion.hayMas).toBe(false)
    await ctx.sesion.cargarMas()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
  })

  it('hayMas es true tras la primera página cuando existen más resultados', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    expect(ctx.sesion.hayMas).toBe(true)
  })

  it('antes de iniciar no hay nada que cargar: cargarMas no consulta', async () => {
    const ctx = crear()
    await ctx.sesion.cargarMas()
    expect(ctx.obtenerFyp).not.toHaveBeenCalled()
    expect(ctx.sesion.items).toHaveLength(0)
  })

  it('sin resultados (VACIO) cargarMas no consulta de nuevo', async () => {
    const ctx = crear([])
    await ctx.sesion.iniciar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.VACIO)
    await ctx.sesion.cargarMas()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
  })
})
