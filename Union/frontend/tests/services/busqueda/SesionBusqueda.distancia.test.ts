import { describe, expect, it, vi } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import {
  BusquedaHttpRepository,
  type HttpClientBusqueda,
} from '../../../src/infrastructure/busqueda/BusquedaHttpRepository'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'
import { OrigenFeed } from '../../../src/domain/enums/OrigenFeed'
import { RangoDistancia } from '../../../src/domain/enums/RangoDistancia'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

/**
 * T031 — `SesionBusqueda`: DISTANCIA sin ubicación (no se agrega ni se envía) — RF-21.
 *
 * Tests escritos antes de la implementación (T034a). Contrato asumido (ver T026–T030):
 *   new SesionBusqueda({ repositorio })   // sin ubicación concedida (A-02 diferida al backend)
 *   await sesion.aplicarFiltro(filtro)    // con DISTANCIA y sin ubicación: se ignora
 * Mientras A-02 siga diferida no existe mecanismo de ubicación: la sesión nace sin ubicación
 * concedida y DISTANCIA nunca se agrega ni se envía. Aplicar DISTANCIA es un no-op: no lanza,
 * no recarga, no emite la señal de scroll y no deja un error. La deshabilitación y el aviso
 * visibles son de la UI (T042b, en espera) y se apoyan en `CriteriosBusqueda.admiteFiltro`.
 * Sin MSW.
 */
const distancia = (r: RangoDistancia) => new FiltroActivo(TipoFiltro.DISTANCIA, r)
const RANGOS = [RangoDistancia.KM_5, RangoDistancia.KM_25, RangoDistancia.KM_100] as const

function crear() {
  const repositorio = new BusquedaEnMemoriaRepository()
  const obtenerFyp = vi.spyOn(repositorio, 'obtenerFyp')
  const buscar = vi.spyOn(repositorio, 'buscar')
  return { sesion: new SesionBusqueda({ repositorio }), obtenerFyp, buscar }
}

describe('SesionBusqueda — DISTANCIA sin ubicación no se agrega', () => {
  it.each(RANGOS)('aplicar %s no agrega el filtro a los criterios', async (rango) => {
    const { sesion } = crear()
    await sesion.iniciar()
    await sesion.aplicarFiltro(distancia(rango))
    expect(sesion.criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([])
    expect(sesion.criterios.filtros).toHaveLength(0)
  })

  it('aplicarFiltro(DISTANCIA) no lanza y la promesa se resuelve', async () => {
    const { sesion } = crear()
    await sesion.iniciar()
    await expect(sesion.aplicarFiltro(distancia(RangoDistancia.KM_5))).resolves.not.toThrow()
  })

  it('es un no-op: no recarga, no cambia el estado ni emite la señal de scroll', async () => {
    const { sesion, obtenerFyp } = crear()
    await sesion.iniciar()
    const items = sesion.items.map((i) => i.id)
    const cursor = sesion.cursor
    const senal = sesion.senalScrollInicio
    const llamadas = obtenerFyp.mock.calls.length

    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_25))

    expect(obtenerFyp).toHaveBeenCalledTimes(llamadas)
    expect(sesion.items.map((i) => i.id)).toEqual(items)
    expect(sesion.cursor).toBe(cursor)
    expect(sesion.senalScrollInicio).toBe(senal)
    expect(sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(sesion.error ?? null).toBeNull()
  })

  it('no altera el origen: con texto buscable sigue siendo BUSQUEDA y sin texto FYP', async () => {
    const { sesion } = crear()
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_100))
    expect(sesion.origen).toBe(OrigenFeed.FYP)
    await sesion.cambiarTexto('paisaje')
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_100))
    expect(sesion.origen).toBe(OrigenFeed.BUSQUEDA)
  })

  it('el dominio informa que DISTANCIA no es admisible sin ubicación (la UI solo consulta)', async () => {
    const { sesion } = crear()
    expect(sesion.criterios.admiteFiltro(TipoFiltro.DISTANCIA, { ubicacionConcedida: false })).toBe(false)
    expect(sesion.criterios.admiteFiltro(TipoFiltro.ESTILO, { ubicacionConcedida: false })).toBe(true)
  })
})

describe('SesionBusqueda — DISTANCIA sin ubicación no se envía', () => {
  it('la búsqueda nunca recibe criterios con DISTANCIA', async () => {
    const { sesion, buscar } = crear()
    await sesion.cambiarTexto('paisaje')
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_5))
    await sesion.aplicarFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'abstracto'))
    for (const [criterios] of buscar.mock.calls) {
      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([])
      expect(criterios.tiposActivos()).not.toContain(TipoFiltro.DISTANCIA)
    }
  })

  it('los demás filtros siguen funcionando aunque se intente aplicar DISTANCIA', async () => {
    const { sesion } = crear()
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_5))
    await sesion.aplicarFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'abstracto'))
    expect(sesion.criterios.filtros.map((f) => f.tipo)).toEqual([TipoFiltro.ESTILO])
  })

  it('con el repositorio HTTP la petición no incluye el parámetro distancia', async () => {
    const get = vi.fn(async (_ruta: string, _o?: { signal?: AbortSignal }) => ({
      items: [],
      cursorSiguiente: null,
    }))
    const repositorio = new BusquedaHttpRepository({ get } as unknown as HttpClientBusqueda)
    const sesion = new SesionBusqueda({ repositorio })

    await sesion.iniciar()
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_25))
    await sesion.cambiarTexto('paisaje')
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_100))

    expect(get).toHaveBeenCalled()
    for (const [ruta] of get.mock.calls) {
      expect(ruta).not.toMatch(/distancia/i)
      expect(ruta).not.toMatch(/\bkm\b|lat|lng/i)
    }
  })

  it('no se aproxima ninguna ubicación (ni por IP ni por defecto): no hay peticiones extra', async () => {
    const { sesion, obtenerFyp, buscar } = crear()
    await sesion.iniciar()
    await sesion.aplicarFiltro(distancia(RangoDistancia.KM_5))
    expect(obtenerFyp).toHaveBeenCalledTimes(1)
    expect(buscar).not.toHaveBeenCalled()
  })
})
