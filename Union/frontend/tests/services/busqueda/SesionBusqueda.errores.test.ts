import { describe, expect, it, vi } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import { SimulacionFallos } from '../../../src/infrastructure/busqueda/simulacionFallos'
import { PUBLICACIONES_EJEMPLO } from '../../../src/infrastructure/busqueda/datosEjemplo'
import { TAMANO_PAGINA } from '../../../src/domain/busqueda/constantes'
import { ErrorBusqueda } from '../../../src/domain/busqueda/ErrorBusqueda'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'
import { TipoErrorBusqueda } from '../../../src/domain/enums/TipoErrorBusqueda'

/**
 * T030 — `SesionBusqueda`: errores 401/403/red/429, reintento de primera página y de página
 * adicional conservando items (HU-05, RF-17, RF-18, RF-25; CA-05.3/05.4/05.5).
 *
 * Tests escritos antes de la implementación (T034a/T034c). Contrato asumido (ver T026–T029):
 *   iniciar, cambiarTexto, cargarMas, criterios, items, cursor, hayMas, estadoCarga, error
 *   await sesion.reintentar()   // repite la última operación fallida (ReintentarCarga, T034c)
 * Tras un error: `estadoCarga === ERROR` y `error` es un `ErrorBusqueda` tipado. En un error de
 * página adicional los items ya cargados se conservan. La sesión solo expone el error tipado:
 * la redirección a /login (401) y el aviso (403) los resuelve la UI mediante `SesionUsuarioPort`
 * (T049), por lo que aquí no se prueba navegación.
 * Fallos simulados con `SimulacionFallos` (T020b) sobre el adaptador en memoria; sin MSW.
 */
function crear(datos = PUBLICACIONES_EJEMPLO) {
  const fallos = new SimulacionFallos()
  const repositorio = new BusquedaEnMemoriaRepository({
    datos,
    antesDeResponder: fallos.aplicar,
  })
  const obtenerFyp = vi.spyOn(repositorio, 'obtenerFyp')
  const buscar = vi.spyOn(repositorio, 'buscar')
  const sesion = new SesionBusqueda({ repositorio })
  return { sesion, fallos, obtenerFyp, buscar }
}

describe('SesionBusqueda — errores tipados en la primera página', () => {
  it.each([
    [401, TipoErrorBusqueda.NO_AUTENTICADO],
    [403, TipoErrorBusqueda.SIN_PERMISO],
    [429, TipoErrorBusqueda.LIMITE],
    ['red', TipoErrorBusqueda.RED],
  ] as const)('fallo %s → estado ERROR con ErrorBusqueda %s', async (fallo, tipo) => {
    const ctx = crear()
    ctx.fallos.fallarProxima(fallo)
    await ctx.sesion.iniciar() // no lanza: el error queda en el estado

    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.ERROR)
    expect(ctx.sesion.error).toBeInstanceOf(ErrorBusqueda)
    expect(ctx.sesion.error!.tipo).toBe(tipo)
    expect(ctx.sesion.items).toHaveLength(0)
  })

  it('un error en la búsqueda (texto) también queda tipado, con items vacíos', async () => {
    const ctx = crear()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.ERROR)
    expect(ctx.sesion.error!.tipo).toBe(TipoErrorBusqueda.RED)
    expect(ctx.sesion.criterios.texto).toBe('paisaje')
  })

  it('los errores no tipados (inesperados) se exponen como ErrorBusqueda SERVIDOR', async () => {
    const repositorio = new BusquedaEnMemoriaRepository({
      antesDeResponder: async () => {
        throw new Error('boom')
      },
    })
    const sesion = new SesionBusqueda({ repositorio })
    await sesion.iniciar()
    expect(sesion.estadoCarga).toBe(EstadoCarga.ERROR)
    expect(sesion.error).toBeInstanceOf(ErrorBusqueda)
    expect(sesion.error!.tipo).toBe(TipoErrorBusqueda.SERVIDOR)
  })

  it('la sesión no reintenta sola tras un error (sin reintento automático)', async () => {
    const ctx = crear()
    ctx.fallos.fallarProxima(403)
    await ctx.sesion.iniciar()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
    expect(ctx.fallos.cantidadLlamadas).toBe(1)
  })
})

describe('SesionBusqueda — reintentar la primera página', () => {
  it.each([['red'], [429]] as const)('tras fallo %s, reintentar carga la primera página y limpia el error', async (fallo) => {
    const ctx = crear()
    ctx.fallos.fallarProxima(fallo)
    await ctx.sesion.iniciar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.ERROR)

    await ctx.sesion.reintentar()

    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.error ?? null).toBeNull()
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA)
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(2)
    expect(ctx.obtenerFyp.mock.calls[1][0]).toBeUndefined() // primera página: sin cursor
  })

  it('reintentar repite la misma operación: una búsqueda fallida vuelve a buscar con los mismos criterios', async () => {
    const ctx = crear()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.cambiarTexto('paisaje')
    await ctx.sesion.reintentar()

    expect(ctx.buscar).toHaveBeenCalledTimes(2)
    expect(ctx.buscar.mock.calls[1][0].texto).toBe('paisaje')
    expect(ctx.buscar.mock.calls[1][1]).toBeUndefined()
    expect(ctx.obtenerFyp).not.toHaveBeenCalled()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('si el reintento vuelve a fallar, sigue en ERROR con el nuevo error', async () => {
    const ctx = crear()
    ctx.fallos.fallarProxima('red').fallarProxima(429)
    await ctx.sesion.iniciar()
    await ctx.sesion.reintentar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.ERROR)
    expect(ctx.sesion.error!.tipo).toBe(TipoErrorBusqueda.LIMITE)
    await ctx.sesion.reintentar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('durante el reintento el estado es CARGANDO y el error se limpia', async () => {
    const ctx = crear()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.iniciar()
    ctx.fallos.conLatencia(5)
    const reintento = ctx.sesion.reintentar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)
    expect(ctx.sesion.error ?? null).toBeNull()
    await reintento
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('reintentar sin ningún error pendiente no consulta de nuevo', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    await ctx.sesion.reintentar()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
  })
})

describe('SesionBusqueda — error en una página adicional (CA-05.4)', () => {
  async function conPrimeraPagina() {
    const ctx = crear()
    await ctx.sesion.iniciar()
    return ctx
  }

  it.each([['red'], [429], [403], [401]] as const)('fallo %s al cargar más conserva los items y el cursor', async (fallo) => {
    const ctx = await conPrimeraPagina()
    const ids = ctx.sesion.items.map((i) => i.id)
    const cursor = ctx.sesion.cursor

    ctx.fallos.fallarProxima(fallo)
    await ctx.sesion.cargarMas()

    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.ERROR)
    expect(ctx.sesion.error).toBeInstanceOf(ErrorBusqueda)
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(ids)
    expect(ctx.sesion.cursor).toBe(cursor)
  })

  it('reintentar tras fallar la página adicional vuelve a pedir esa página (mismo cursor) y agrega', async () => {
    const ctx = await conPrimeraPagina()
    const cursor = ctx.sesion.cursor
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.cargarMas()

    await ctx.sesion.reintentar()

    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.error ?? null).toBeNull()
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA * 2)
    expect(ctx.obtenerFyp.mock.calls.at(-1)![0]).toBe(cursor)
    const ids = ctx.sesion.items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('reintentar la página adicional no reinicia la lista ni vuelve a pedir la primera', async () => {
    const ctx = await conPrimeraPagina()
    ctx.fallos.fallarProxima(429)
    await ctx.sesion.cargarMas()
    await ctx.sesion.reintentar()
    const sinCursor = ctx.obtenerFyp.mock.calls.filter((c) => c[0] === undefined)
    expect(sinCursor).toHaveLength(1) // solo la carga inicial
  })

  it('con el error de página adicional, hayMas se conserva para poder reintentar', async () => {
    const ctx = await conPrimeraPagina()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.cargarMas()
    expect(ctx.sesion.hayMas).toBe(true)
  })

  it('un error en la página adicional no se mezcla con un reintento de la primera página', async () => {
    const ctx = await conPrimeraPagina()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.cargarMas()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.reintentar() // vuelve a fallar la misma página adicional
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA)
    await ctx.sesion.reintentar()
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA * 2)
  })
})

describe('SesionBusqueda — un cambio de criterios reemplaza al error', () => {
  it('tras un error, cambiar el texto carga normalmente y limpia el error', async () => {
    const ctx = crear()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.iniciar()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.ERROR)

    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.error ?? null).toBeNull()
  })

  it('tras un error de página adicional, cambiar criterios descarta items viejos y el error', async () => {
    const ctx = crear()
    await ctx.sesion.iniciar()
    ctx.fallos.fallarProxima('red')
    await ctx.sesion.cargarMas()
    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.error ?? null).toBeNull()
    expect(ctx.sesion.items.every((i) => /paisaje/i.test(i.titulo))).toBe(true)
  })
})
