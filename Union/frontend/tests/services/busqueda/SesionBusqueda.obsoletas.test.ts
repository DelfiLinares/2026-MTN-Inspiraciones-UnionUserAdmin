import { describe, expect, it } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import type { BusquedaRepository } from '../../../src/application/busqueda/BusquedaRepository'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { ErrorBusqueda } from '../../../src/domain/busqueda/ErrorBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'
import { OrigenFeed } from '../../../src/domain/enums/OrigenFeed'
import { TipoErrorBusqueda } from '../../../src/domain/enums/TipoErrorBusqueda'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

/**
 * T029 — `SesionBusqueda`: respuestas obsoletas (HU-02/04, RF-10, CA-04.3).
 * Token de secuencia + cancelación con `AbortController`; una respuesta tardía se ignora.
 *
 * Tests escritos antes de la implementación (T034a/T034b). Contrato asumido (ver T026–T028):
 *   iniciar, cambiarTexto, aplicarFiltro, cargarMas, criterios, items, cursor, estadoCarga,
 *   origen, error (nulo/indefinido si no hay error).
 * La sesión pasa un `AbortSignal` a cada petición del repositorio y aborta el de la petición
 * anterior cuando los criterios cambian; además descarta por token lo que llegue tarde.
 *
 * Doble de repositorio: envuelve al adaptador en memoria (T020a), registra las señales
 * recibidas y retiene respuestas con una compuerta manual. Con `ignorarSenal` simula un
 * repositorio que NO respeta la cancelación, para comprobar que el token por sí solo
 * descarta lo obsoleto. Sin MSW.
 */
interface Retenida {
  resolver: () => void
  rechazar: (e: unknown) => void
}

function crear(opciones: { ignorarSenal?: boolean } = {}) {
  let retener = false
  const retenidas: Retenida[] = []
  const senales: Array<AbortSignal | undefined> = []

  const base = new BusquedaEnMemoriaRepository({
    antesDeResponder: async () => {
      if (!retener) return
      await new Promise<void>((resolver, rechazar) => retenidas.push({ resolver, rechazar }))
    },
  })
  const pasar = (s?: AbortSignal) => (opciones.ignorarSenal ? undefined : s)

  const repositorio: BusquedaRepository = {
    obtenerFyp: (cursor, signal) => {
      senales.push(signal)
      return base.obtenerFyp(cursor, pasar(signal))
    },
    buscar: (criterios, cursor, signal) => {
      senales.push(signal)
      return base.buscar(criterios, cursor, pasar(signal))
    },
    obtenerCatalogoFiltros: (signal) => base.obtenerCatalogoFiltros(pasar(signal)),
  }

  return {
    sesion: new SesionBusqueda({ repositorio }),
    senales,
    retener: (valor: boolean) => {
      retener = valor
    },
    /** Libera la n-ésima petición retenida (0 = la primera retenida). */
    liberar: (n: number) => retenidas[n].resolver(),
    liberarTodas: () => retenidas.forEach((r) => r.resolver()),
    rechazar: (n: number, error: unknown) => retenidas[n].rechazar(error),
  }
}

const estilo = (v: string) => new FiltroActivo(TipoFiltro.ESTILO, v)

async function idsEsperados(criterios: CriteriosBusqueda): Promise<string[]> {
  const pagina = await new BusquedaEnMemoriaRepository().buscar(criterios)
  return pagina.items.map((i) => i.id)
}

describe('SesionBusqueda — cancelación de la petición anterior (CA-04.3)', () => {
  it('cambiar el texto aborta la señal de la petición en curso y la nueva queda vigente', async () => {
    const ctx = crear()
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.senales[0]).toBeDefined()
    expect(ctx.senales[0]!.aborted).toBe(false)

    const b = ctx.sesion.cambiarTexto('mar')
    expect(ctx.senales[0]!.aborted).toBe(true)
    expect(ctx.senales[1]!.aborted).toBe(false)
    expect(ctx.senales[1]).not.toBe(ctx.senales[0])

    ctx.liberarTodas()
    await Promise.all([a, b])
    expect(ctx.senales[1]!.aborted).toBe(false)
  })

  it('el AbortError de la petición cancelada no se muestra como error', async () => {
    const ctx = crear()
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje')
    const b = ctx.sesion.cambiarTexto('mar')
    ctx.liberarTodas()
    await Promise.all([a, b])

    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.error ?? null).toBeNull()
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(
      await idsEsperados(CriteriosBusqueda.vacio().conTexto('mar')),
    )
  })

  it('un cambio que no altera los criterios no cancela la petición en curso', async () => {
    const ctx = crear()
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje')
    const b = ctx.sesion.cambiarTexto('  paisaje ')
    expect(ctx.senales).toHaveLength(1)
    expect(ctx.senales[0]!.aborted).toBe(false)
    ctx.liberarTodas()
    await Promise.all([a, b])
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('cambiar los filtros con una carga adicional en curso la cancela', async () => {
    const ctx = crear()
    await ctx.sesion.cambiarTexto('obra')
    ctx.retener(true)
    const mas = ctx.sesion.cargarMas()
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO_MAS)

    const cambio = ctx.sesion.aplicarFiltro(estilo('abstracto'))
    expect(ctx.senales[1]!.aborted).toBe(true) // [0]=primera página, [1]=cargarMas
    expect(ctx.senales[2]!.aborted).toBe(false)

    ctx.liberarTodas()
    await Promise.all([mas, cambio])
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.error ?? null).toBeNull()
  })
})

describe('SesionBusqueda — respuestas tardías ignoradas por token (RF-10)', () => {
  it('si la anterior responde después de la vigente, no pisa los items (repositorio sin cancelación)', async () => {
    const ctx = crear({ ignorarSenal: true })
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje')
    const b = ctx.sesion.cambiarTexto('mar')
    const esperados = await idsEsperados(CriteriosBusqueda.vacio().conTexto('mar'))

    ctx.liberar(1) // responde la vigente
    await b
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(esperados)
    const cursor = ctx.sesion.cursor

    ctx.liberar(0) // llega tarde la obsoleta
    await a
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(esperados)
    expect(ctx.sesion.criterios.texto).toBe('mar')
    expect(ctx.sesion.cursor).toBe(cursor)
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
  })

  it('respuestas fuera de orden: la lenta y obsoleta responde al final y se ignora', async () => {
    const ctx = crear({ ignorarSenal: true })
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje') // queda retenida
    ctx.retener(false)
    const b = ctx.sesion.cambiarTexto('mar') // responde de inmediato
    await b
    const esperados = await idsEsperados(CriteriosBusqueda.vacio().conTexto('mar'))
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(esperados)

    ctx.liberar(0)
    await a
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(esperados)
  })

  it('una respuesta obsoleta no cambia el estado de carga mientras la vigente sigue en curso', async () => {
    const ctx = crear({ ignorarSenal: true })
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje')
    const b = ctx.sesion.cambiarTexto('mar')

    ctx.liberar(0) // la obsoleta responde primero
    await a
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)
    expect(ctx.sesion.items).toHaveLength(0)

    ctx.liberar(1)
    await b
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.items.length).toBeGreaterThan(0)
  })

  it('un error tardío de una petición obsoleta no pisa el resultado vigente', async () => {
    const ctx = crear({ ignorarSenal: true })
    ctx.retener(true)
    const a = ctx.sesion.cambiarTexto('paisaje')
    ctx.retener(false)
    const b = ctx.sesion.cambiarTexto('mar')
    await b

    ctx.rechazar(0, new ErrorBusqueda(TipoErrorBusqueda.LIMITE, 'Demasiadas solicitudes'))
    await a
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.error ?? null).toBeNull()
    expect(ctx.sesion.items.length).toBeGreaterThan(0)
  })

  it('FYP → búsqueda: la respuesta tardía del FYP no reemplaza a los resultados (HU-02)', async () => {
    const ctx = crear({ ignorarSenal: true })
    ctx.retener(true)
    const inicial = ctx.sesion.iniciar() // FYP retenido
    ctx.retener(false)
    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.origen).toBe(OrigenFeed.BUSQUEDA)
    const esperados = await idsEsperados(CriteriosBusqueda.vacio().conTexto('paisaje'))

    ctx.liberar(0)
    await inicial
    expect(ctx.sesion.origen).toBe(OrigenFeed.BUSQUEDA)
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(esperados)
  })

  it('la página adicional tardía de criterios anteriores no se agrega tras cambiar los filtros', async () => {
    const ctx = crear({ ignorarSenal: true })
    await ctx.sesion.cambiarTexto('obra')
    ctx.retener(true)
    const mas = ctx.sesion.cargarMas() // retenida n.º 0
    const cambio = ctx.sesion.aplicarFiltro(estilo('abstracto')) // retenida n.º 1

    ctx.liberar(0) // llega tarde la página 2 de los criterios viejos
    await mas
    expect(ctx.sesion.items).toHaveLength(0)
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.CARGANDO)

    ctx.liberar(1)
    await cambio
    const esperados = await idsEsperados(
      CriteriosBusqueda.vacio().conTexto('obra').conFiltro(estilo('abstracto')),
    )
    expect(ctx.sesion.items.map((i) => i.id)).toEqual(esperados)
  })
})
