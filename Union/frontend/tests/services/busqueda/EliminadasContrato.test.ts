import { describe, expect, it } from 'vitest'
import type { BusquedaRepository } from '../../../src/application/busqueda/BusquedaRepository'
import { SesionBusqueda } from '../../../src/application/busqueda/SesionBusqueda'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { PaginaResultados } from '../../../src/domain/busqueda/PaginaResultados'
import { PublicacionResumen } from '../../../src/domain/busqueda/PublicacionResumen'
import { EstadoPublicacion } from '../../../src/domain/enums/EstadoPublicacion'
import { BusquedaEnMemoriaRepository } from '../../../src/infrastructure/busqueda/BusquedaEnMemoriaRepository'
import {
  CATALOGO_EJEMPLO,
  PUBLICACIONES_EJEMPLO,
  type PublicacionEjemplo,
} from '../../../src/infrastructure/busqueda/datosEjemplo'

/**
 * T071 — RF-16: ELIMINADA (data-model.md §5, plan.md §2).
 * La API nunca la envía; el cliente no filtra ni omite items y renderiza lo recibido.
 * El registro de "violación de contrato" queda fuera de este test: no existe aún un
 * mecanismo para observarlo en el código.
 */

const TITULO_ELIMINADA = 'Publicación eliminada de prueba RF-16'

function publicacionEliminada(): PublicacionEjemplo {
  const base = PUBLICACIONES_EJEMPLO[0]
  return {
    ...base,
    resumen: new PublicacionResumen({
      id: 'pub-eliminada-rf16',
      titulo: TITULO_ELIMINADA,
      autor: base.resumen.autor,
      miniaturaUrl: 'https://example.com/miniaturas/eliminada-rf16.jpg',
      tipoContenido: base.resumen.tipoContenido,
      estado: EstadoPublicacion.ELIMINADA,
    }),
  }
}

async function recogerTodas(
  pedir: (cursor?: string) => Promise<PaginaResultados>,
): Promise<PublicacionResumen[]> {
  const todas: PublicacionResumen[] = []
  let cursor: string | undefined
  do {
    const pagina = await pedir(cursor)
    todas.push(...pagina.items)
    cursor = pagina.cursorSiguiente ?? undefined
  } while (cursor !== undefined)
  return todas
}

describe('RF-16 — adaptador en memoria nunca devuelve ELIMINADA', () => {
  it('el FYP no incluye una ELIMINADA aunque esté en los datos', async () => {
    const repositorio = new BusquedaEnMemoriaRepository({
      datos: [...PUBLICACIONES_EJEMPLO, publicacionEliminada()],
    })
    const items = await recogerTodas((c) => repositorio.obtenerFyp(c))
    expect(items.some((i) => i.estado === EstadoPublicacion.ELIMINADA)).toBe(false)
    expect(items.map((i) => i.titulo)).not.toContain(TITULO_ELIMINADA)
  })

  it('la búsqueda no devuelve una ELIMINADA que coincide con el texto', async () => {
    const repositorio = new BusquedaEnMemoriaRepository({
      datos: [publicacionEliminada(), ...PUBLICACIONES_EJEMPLO],
    })
    const criterios = CriteriosBusqueda.vacio().conTexto('eliminada de prueba')
    const items = await recogerTodas((c) => repositorio.buscar(criterios, c))
    expect(items).toHaveLength(0)
  })

  it('el catálogo de filtros sigue disponible con datos que incluyen ELIMINADA', async () => {
    const repositorio = new BusquedaEnMemoriaRepository({
      datos: [publicacionEliminada()],
    })
    expect(await repositorio.obtenerCatalogoFiltros()).toBe(CATALOGO_EJEMPLO)
  })
})

describe('RF-16 — la sesión no filtra ni omite items recibidos', () => {
  function repositorioQueDevuelve(items: readonly PublicacionResumen[]): BusquedaRepository {
    const pagina = () => new PaginaResultados(items, null)
    return {
      obtenerFyp: async () => pagina(),
      buscar: async () => pagina(),
      obtenerCatalogoFiltros: async () => CATALOGO_EJEMPLO,
    }
  }

  it('en el FYP renderiza todos los items recibidos, incluido uno ELIMINADA, en orden', async () => {
    const eliminada = publicacionEliminada().resumen
    const recibidos = [
      PUBLICACIONES_EJEMPLO[0].resumen,
      eliminada,
      PUBLICACIONES_EJEMPLO[1].resumen,
    ]
    const sesion = new SesionBusqueda({ repositorio: repositorioQueDevuelve(recibidos) })

    await sesion.iniciar()

    expect(sesion.items.map((i) => i.id)).toEqual(recibidos.map((i) => i.id))
    expect(sesion.items).toHaveLength(3)
  })

  it('en la búsqueda renderiza el item ELIMINADA recibido sin omitirlo', async () => {
    const eliminada = publicacionEliminada().resumen
    const sesion = new SesionBusqueda({ repositorio: repositorioQueDevuelve([eliminada]) })

    await sesion.cambiarTexto('paisaje')

    expect(sesion.items.map((i) => i.titulo)).toEqual([TITULO_ELIMINADA])
  })
})
