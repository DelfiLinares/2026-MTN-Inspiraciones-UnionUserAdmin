import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import type { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'
import {
  TAMANO_PAGINA,
  buscarTexto,
  chips,
  conEtiqueta,
  esperarTarjetas,
  instalarEntorno,
  marcar,
  renderizarPagina,
  titulos,
  titulosDe,
  todos,
} from './ayudas'

/**
 * T067 — HU-03: filtrar publicaciones (CA-03.1 … CA-03.6; RF-11–14, RF-21, RF-22).
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 * Los resultados esperados se derivan de las etiquetas de los datos de ejemplo.
 */
instalarEntorno()

const ultimoCriterio = (llamadas: { mock: { calls: unknown[][] } }) =>
  llamadas.mock.calls[llamadas.mock.calls.length - 1][0] as CriteriosBusqueda

describe('PaginaBusqueda — HU-03: filtros', () => {
  it('ofrece los filtros estilo, técnica, tipo de arte, tipo de contenido y distancia (CA-03.1)', async () => {
    renderizarPagina()

    for (const nombre of [/^estilo$/i, /^t[eé]cnica$/i, /^tipo de arte$/i]) {
      expect(await screen.findByRole('group', { name: nombre })).toBeInTheDocument()
    }
    expect(screen.getByRole('group', { name: /^tipo de contenido$/i })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: /^distancia$/i })).toBeInTheDocument()
  })

  it('los filtros se envían a la API junto con el texto; no se filtra en memoria (CA-03.3, RF-12)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('paisaje')
    await esperarTarjetas(conEtiqueta('paisaje').length)

    await marcar(/^estilo$/i, 'Abstracto')

    const esperados = conEtiqueta('paisaje').filter((d) => d.estilos.includes('abstracto'))
    await esperarTarjetas(esperados.length)
    expect(titulos()).toEqual(titulosDe(esperados))
    const criterio = ultimoCriterio(espias.buscar)
    expect(criterio.texto).toBe('paisaje')
    expect(criterio.valoresDe(TipoFiltro.ESTILO)).toEqual(['abstracto'])
  })

  it('varios valores del mismo filtro se combinan con OR (RF-22)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('paisaje')
    await esperarTarjetas(conEtiqueta('paisaje').length)

    await marcar(/^estilo$/i, 'Abstracto')
    await marcar(/^estilo$/i, 'Realista')

    const esperados = conEtiqueta('paisaje').filter(
      (d) => d.estilos.includes('abstracto') || d.estilos.includes('realista'),
    )
    await esperarTarjetas(esperados.length)
    expect(titulos()).toEqual(titulosDe(esperados))
  })

  it('filtros de distinto tipo y el texto se combinan con AND (RF-22, CA-03.2)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('obra')
    await esperarTarjetas(TAMANO_PAGINA)

    await marcar(/^estilo$/i, 'Abstracto')
    await marcar(/^tipo de contenido$/i, /imagen/i)

    const esperados = todos.filter(
      (d) => d.estilos.includes('abstracto') && d.resumen.tipoContenido === TipoContenido.IMAGEN,
    )
    await waitFor(() => expect(titulos()).toEqual(titulosDe(esperados).slice(0, TAMANO_PAGINA)))
    expect(ultimoCriterio(espias.buscar).valoresDe(TipoFiltro.TIPO_CONTENIDO)).toEqual([
      TipoContenido.IMAGEN,
    ])
  })

  it('muestra los filtros activos y cada uno se quita individualmente en un paso (CA-03.4, RF-13)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('paisaje')
    await esperarTarjetas(conEtiqueta('paisaje').length)
    await marcar(/^estilo$/i, 'Abstracto')
    await marcar(/^estilo$/i, 'Realista')
    await waitFor(() => expect(chips()).toHaveLength(2))
    expect(within(screen.getByRole('list', { name: /filtros activos/i })).getByText(/realista/i))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /quitar filtro.*realista/i }))

    await waitFor(() => expect(chips()).toHaveLength(1))
    const esperados = conEtiqueta('paisaje').filter((d) => d.estilos.includes('abstracto'))
    await esperarTarjetas(esperados.length)
    expect(titulos()).toEqual(titulosDe(esperados))
  })

  it('«Limpiar todos» quita todos los filtros a la vez (CA-03.5, RF-14)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('paisaje')
    await esperarTarjetas(conEtiqueta('paisaje').length)
    await marcar(/^estilo$/i, 'Abstracto')
    await marcar(/^tipo de contenido$/i, /imagen/i)
    await waitFor(() => expect(chips()).toHaveLength(2))

    fireEvent.click(screen.getByRole('button', { name: /limpiar todos/i }))

    await waitFor(() => expect(chips()).toHaveLength(0))
    await esperarTarjetas(conEtiqueta('paisaje').length)
    expect(titulos()).toEqual(titulosDe(conEtiqueta('paisaje')))
    for (const caja of screen.getAllByRole('checkbox')) expect(caja).not.toBeChecked()
  })

  it('DISTANCIA está deshabilitada con aviso y nunca se envía (RF-21, A-02)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('obra')
    await esperarTarjetas(TAMANO_PAGINA)
    await marcar(/^estilo$/i, 'Abstracto')

    const grupo = screen.getByRole('group', { name: /^distancia$/i })
    for (const control of within(grupo).getAllByRole('checkbox')) {
      expect(control).toBeDisabled()
      fireEvent.click(control)
    }
    expect(within(grupo).getByText(/ubicaci[oó]n/i)).toBeInTheDocument()

    await waitFor(() => expect(espias.buscar.mock.calls.length).toBeGreaterThan(1))
    for (const [criterios] of espias.buscar.mock.calls) {
      expect(criterios.valoresDe(TipoFiltro.DISTANCIA)).toEqual([])
    }
  })

  /**
   * CA-03.6: los filtros aplican también al FYP (sin texto buscable). Este caso depende de que
   * `CargarFeedFyp` reciba los criterios: el puerto `obtenerFyp(cursor?, signal?)` (T019) hoy no
   * los recibe, aunque plan.md y `GET /feed/fyp` del contrato sí admiten filtros. Es la
   * inconsistencia abierta; hasta resolverla este test fallará, a propósito.
   */
  it('sin texto buscable, los filtros también se aplican al FYP (CA-03.6)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    await marcar(/^estilo$/i, 'Abstracto')

    const esperados = todos.filter((d) => d.estilos.includes('abstracto'))
    await waitFor(() => expect(titulos()).toEqual(titulosDe(esperados).slice(0, TAMANO_PAGINA)))
  })
})
