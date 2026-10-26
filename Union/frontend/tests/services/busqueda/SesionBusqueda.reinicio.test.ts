import { describe, expect, it, vi } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TAMANO_PAGINA } from '../../../src/domain/busqueda/constantes'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

/**
 * T028 — `SesionBusqueda`: reinicio al cambiar texto/filtros (HU-04, RF-09, CA-04.1/04.2).
 *
 * Tests escritos antes de la implementación (T034a). Además del contrato asumido en
 * T026/T027 (`iniciar`, `cambiarTexto`, `aplicarFiltro`, `cargarMas`, `criterios`, `items`,
 * `estadoCarga`, `hayMas`) se asume:
 *   await sesion.quitarFiltro(filtro)   // quita un filtro y recarga la primera página
 *   await sesion.limpiarFiltros()       // quita todos los filtros y recarga la primera página
 *   sesion.cursor                       // cursor de la última página cargada (null si no hay)
 *   sesion.senalScrollInicio            // contador que se incrementa en cada reinicio; la UI
 *                                       // lo observa para llevar el scroll al inicio
 * Usa el adaptador en memoria (T020a) con una compuerta manual; sin MSW.
 */
function crear() {
  let retener = false
  const liberadores: Array<() => void> = []
  const repositorio = new BusquedaEnMemoriaRepository({
    antesDeResponder: async () => {
      if (!retener) return
      await new Promise<void>((resolver) => liberadores.push(resolver))
    },
  })
  const obtenerFyp = vi.spyOn(repositorio, 'obtenerFyp')
  const buscar = vi.spyOn(repositorio, 'buscar')
  const sesion = new SesionBusqueda({ repositorio })
  return {
    sesion,
    obtenerFyp,
    buscar,
    retener: (valor: boolean) => {
      retener = valor
    },
    liberar: () => liberadores.splice(0).forEach((f) => f()),
  }
}

const estilo = (v: string) => new FiltroActivo(TipoFiltro.ESTILO, v)

/** Sesión con 2 páginas cargadas (cursor vigente, scroll "avanzado"). */
async function sesionConDosPaginas() {
  const ctx = crear()
  await ctx.sesion.iniciar()
  await ctx.sesion.cargarMas()
  expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA * 2)
  expect(ctx.sesion.cursor).not.toBeNull()
  return ctx
}

describe('SesionBusqueda — reinicio al cambiar el texto', () => {
  it('descarta items y cursor acumulados y solicita la primera página (CA-04.1)', async () => {
    const ctx = await sesionConDosPaginas()
    await ctx.sesion.cambiarTexto('paisaje')

    expect(ctx.buscar).toHaveBeenCalledTimes(1)
    const [, cursor] = ctx.buscar.mock.calls[0]
    expect(cursor).toBeUndefined()
    const ids = ctx.sesion.items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(ctx.sesion.items.every((i) => /paisaje/i.test(i.titulo))).toBe(true)
  })

  it('mientras carga la primera página los items viejos ya no se muestran y el cursor es nulo', async () => {
    const ctx = await sesionConDosPaginas()
    ctx.retener(true)
    const cambio = ctx.sesion.cambiarTexto('paisaje')

    expect(ctx.sesion.items).toHaveLength(0)
    expect(ctx.sesion.cursor).toBeNull()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)

    ctx.liberar()
    await cambio
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('el cursor nuevo es el de la primera página nueva, no el anterior', async () => {
    const ctx = await sesionConDosPaginas()
    const cursorViejo = ctx.sesion.cursor
    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.cursor).not.toBe(cursorViejo)
  })

  it('cargarMas después del reinicio continúa desde la página nueva (no desde el cursor viejo)', async () => {
    const ctx = await sesionConDosPaginas()
    await ctx.sesion.cambiarTexto('obra') // coincide con casi todos: varias páginas
    const itemsPrimera = ctx.sesion.items.length
    expect(ctx.sesion.hayMas).toBe(true)
    await ctx.sesion.cargarMas()
    expect(ctx.sesion.items.length).toBeGreaterThan(itemsPrimera)
    const ids = ctx.sesion.items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('borrar el texto reinicia hacia el FYP desde la primera página', async () => {
    const ctx = await sesionConDosPaginas()
    await ctx.sesion.cambiarTexto('paisaje')
    await ctx.sesion.cambiarTexto('')
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(3)
    expect(ctx.obtenerFyp.mock.calls.at(-1)![0]).toBeUndefined()
  })

  it('un cambio de texto que no altera los criterios normalizados no reinicia', async () => {
    const ctx = crear()
    await ctx.sesion.cambiarTexto('paisaje')
    const llamadas = ctx.buscar.mock.calls.length
    const senal = ctx.sesion.senalScrollInicio
    await ctx.sesion.cambiarTexto('  paisaje ')
    expect(ctx.buscar).toHaveBeenCalledTimes(llamadas)
    expect(ctx.sesion.senalScrollInicio).toBe(senal)
  })
})

describe('SesionBusqueda — reinicio al cambiar los filtros', () => {
  it('aplicar un filtro reinicia items y cursor y pide la primera página', async () => {
    const ctx = await sesionConDosPaginas()
    ctx.retener(true)
    const cambio = ctx.sesion.aplicarFiltro(estilo('abstracto'))
    expect(ctx.sesion.items).toHaveLength(0)
    expect(ctx.sesion.cursor).toBeNull()
    ctx.liberar()
    await cambio
    expect(ctx.sesion.criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['abstracto'])
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('quitar un filtro reinicia desde la primera página', async () => {
    const ctx = crear()
    await ctx.sesion.cambiarTexto('obra')
    await ctx.sesion.aplicarFiltro(estilo('abstracto'))
    await ctx.sesion.aplicarFiltro(estilo('realista'))
    await ctx.sesion.cargarMas()
    const llamadas = ctx.buscar.mock.calls.length

    await ctx.sesion.quitarFiltro(estilo('realista'))

    expect(ctx.buscar).toHaveBeenCalledTimes(llamadas + 1)
    expect(ctx.buscar.mock.calls.at(-1)![1]).toBeUndefined()
    expect(ctx.sesion.criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['abstracto'])
  })

  it('limpiar filtros reinicia desde la primera página y conserva el texto', async () => {
    const ctx = crear()
    await ctx.sesion.cambiarTexto('obra')
    await ctx.sesion.aplicarFiltro(estilo('abstracto'))
    const llamadas = ctx.buscar.mock.calls.length

    await ctx.sesion.limpiarFiltros()

    expect(ctx.buscar).toHaveBeenCalledTimes(llamadas + 1)
    expect(ctx.buscar.mock.calls.at(-1)![1]).toBeUndefined()
    expect(ctx.sesion.criterios.filtros).toHaveLength(0)
    expect(ctx.sesion.criterios.texto).toBe('obra')
  })

  it('aplicar un filtro ya activo no reinicia (criterios equivalentes)', async () => {
    const ctx = crear()
    await ctx.sesion.aplicarFiltro(estilo('abstracto'))
    const llamadas = ctx.obtenerFyp.mock.calls.length
    const senal = ctx.sesion.senalScrollInicio
    await ctx.sesion.aplicarFiltro(estilo('abstracto'))
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(llamadas)
    expect(ctx.sesion.senalScrollInicio).toBe(senal)
  })
})

describe('SesionBusqueda — señal de scroll al inicio (CA-04.2)', () => {
  it('cada cambio efectivo de texto o filtros incrementa la señal', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    const s0 = ctx.sesion.senalScrollInicio

    await ctx.sesion.cambiarTexto('paisaje')
    const s1 = ctx.sesion.senalScrollInicio
    expect(s1).toBeGreaterThan(s0)

    await ctx.sesion.aplicarFiltro(estilo('abstracto'))
    const s2 = ctx.sesion.senalScrollInicio
    expect(s2).toBeGreaterThan(s1)

    await ctx.sesion.quitarFiltro(estilo('abstracto'))
    const s3 = ctx.sesion.senalScrollInicio
    expect(s3).toBeGreaterThan(s2)

    await ctx.sesion.limpiarFiltros()
    // sin filtros que limpiar no hay cambio de criterios
    expect(ctx.sesion.senalScrollInicio).toBe(s3)
  })

  it('la señal se emite al reiniciar, no al cargar más páginas', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    const s = ctx.sesion.senalScrollInicio
    await ctx.sesion.cargarMas()
    expect(ctx.sesion.senalScrollInicio).toBe(s)
  })

  it('la señal se emite de inmediato (antes de que responda la API)', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    const s = ctx.sesion.senalScrollInicio
    ctx.retener(true)
    const cambio = ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.senalScrollInicio).toBeGreaterThan(s)
    ctx.liberar()
    await cambio
  })
})
