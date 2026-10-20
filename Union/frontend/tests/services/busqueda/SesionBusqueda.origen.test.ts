import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TAMANO_PAGINA } from '../../../src/domain/busqueda/constantes'
import { EstadoCarga } from '../../../src/domain/enums/EstadoCarga'
import { OrigenFeed } from '../../../src/domain/enums/OrigenFeed'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

/**
 * T026 — `SesionBusqueda`: FYP vs búsqueda según criterios (HU-01/02, RF-05).
 *
 * Tests escritos antes de la implementación (T034a). Contrato de la sesión que asumen:
 *   new SesionBusqueda({ repositorio })
 *   await sesion.iniciar()                 // carga la primera página según los criterios vigentes
 *   await sesion.cambiarTexto(texto)       // reemplaza el texto y recarga la primera página
 *   await sesion.aplicarFiltro(filtro)     // agrega un filtro y recarga la primera página
 *   sesion.criterios / origen / items / estadoCarga
 * El debounce (400 ms) es responsabilidad del hook de UI, no de la sesión.
 * Usa el adaptador en memoria (T020a) como repositorio, espiado; sin MSW.
 */
function crear() {
  const repositorio = new BusquedaEnMemoriaRepository()
  const obtenerFyp = vi.spyOn(repositorio, 'obtenerFyp')
  const buscar = vi.spyOn(repositorio, 'buscar')
  const sesion = new SesionBusqueda({ repositorio })
  return { sesion, obtenerFyp, buscar }
}

describe('SesionBusqueda — origen FYP vs búsqueda', () => {
  let ctx: ReturnType<typeof crear>

  beforeEach(() => {
    ctx = crear()
  })

  it('sin texto ni filtros inicia con el feed FYP (HU-01)', async () => {
    await ctx.sesion.iniciar()
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
    expect(ctx.buscar).not.toHaveBeenCalled()
    expect(ctx.sesion.origen).toBe(OrigenFeed.FYP)
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.LISTO)
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA)
  })

  it('la primera página FYP se pide sin cursor', async () => {
    await ctx.sesion.iniciar()
    expect(ctx.obtenerFyp.mock.calls[0][0]).toBeUndefined()
  })

  it('texto de 2 o más caracteres consulta la búsqueda y no el FYP (HU-02)', async () => {
    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.buscar).toHaveBeenCalledTimes(1)
    expect(ctx.obtenerFyp).not.toHaveBeenCalled()
    expect(ctx.sesion.origen).toBe(OrigenFeed.BUSQUEDA)
    expect(ctx.sesion.criterios.texto).toBe('paisaje')
  })

  it('la búsqueda recibe los criterios vigentes y pide la primera página', async () => {
    await ctx.sesion.cambiarTexto('  paisaje   mar ')
    const [criterios, cursor] = ctx.buscar.mock.calls[0]
    expect(criterios.texto).toBe('paisaje mar')
    expect(cursor).toBeUndefined()
  })

  it('texto de 1 carácter no dispara búsqueda: se muestra el FYP (spec: pista visible)', async () => {
    await ctx.sesion.cambiarTexto('a')
    expect(ctx.buscar).not.toHaveBeenCalled()
    expect(ctx.sesion.origen).toBe(OrigenFeed.FYP)
    expect(ctx.sesion.criterios.texto).toBe('a')
    expect(ctx.sesion.items.length).toBeGreaterThan(0)
  })

  it('texto solo con espacios se trata como vacío → FYP', async () => {
    await ctx.sesion.cambiarTexto('     ')
    expect(ctx.buscar).not.toHaveBeenCalled()
    expect(ctx.sesion.origen).toBe(OrigenFeed.FYP)
  })

  it('al borrar el texto vuelve al FYP', async () => {
    await ctx.sesion.cambiarTexto('paisaje')
    expect(ctx.sesion.origen).toBe(OrigenFeed.BUSQUEDA)
    await ctx.sesion.cambiarTexto('')
    expect(ctx.sesion.origen).toBe(OrigenFeed.FYP)
    expect(ctx.obtenerFyp).toHaveBeenCalledTimes(1)
    expect(ctx.sesion.items).toHaveLength(TAMANO_PAGINA)
  })

  it('pasar de FYP a búsqueda reemplaza los items (no se mezclan orígenes)', async () => {
    await ctx.sesion.iniciar()
    const idsFyp = ctx.sesion.items.map((i) => i.id)
    await ctx.sesion.cambiarTexto('paisaje')
    const idsBusqueda = ctx.sesion.items.map((i) => i.id)
    expect(idsBusqueda.length).toBeGreaterThan(0)
    expect(idsBusqueda).not.toEqual(idsFyp)
    // cada item de búsqueda coincide con el texto (lo decide el adaptador, no la sesión)
    expect(ctx.sesion.items.every((i) => /paisaje/i.test(i.titulo))).toBe(true)
  })

  it('solo filtros (sin texto buscable) mantiene el origen FYP', async () => {
    await ctx.sesion.aplicarFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'abstracto'))
    expect(ctx.sesion.origen).toBe(OrigenFeed.FYP)
    expect(ctx.buscar).not.toHaveBeenCalled()
  })

  it('texto buscable + filtro consulta la búsqueda con ambos criterios', async () => {
    await ctx.sesion.cambiarTexto('paisaje')
    await ctx.sesion.aplicarFiltro(new FiltroActivo(TipoFiltro.ESTILO, 'abstracto'))
    expect(ctx.sesion.origen).toBe(OrigenFeed.BUSQUEDA)
    const criterios = ctx.buscar.mock.calls.at(-1)![0]
    expect(criterios.texto).toBe('paisaje')
    expect(criterios.valoresDe(TipoFiltro.ESTILO)).toEqual(['abstracto'])
  })

  it('búsqueda sin coincidencias → estado VACIO con items vacíos', async () => {
    await ctx.sesion.cambiarTexto('zzzzzz-no-existe')
    expect(ctx.sesion.origen).toBe(OrigenFeed.BUSQUEDA)
    expect(ctx.sesion.items).toHaveLength(0)
    expect(ctx.sesion.estadoCarga).toBe(EstadoCarga.VACIO)
  })

  it('el origen sale de CriteriosBusqueda.origen(): la sesión no duplica la regla', async () => {
    await ctx.sesion.cambiarTexto('ab')
    expect(ctx.sesion.origen).toBe(ctx.sesion.criterios.origen())
    await ctx.sesion.cambiarTexto('a')
    expect(ctx.sesion.origen).toBe(ctx.sesion.criterios.origen())
  })
})
