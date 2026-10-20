import { describe, expect, it } from 'vitest'
import { waitFor } from '@testing-library/react'
import {
  TAMANO_PAGINA,
  buscarTexto,
  conEtiqueta,
  crearPuerta,
  esperarTarjetas,
  instalarEntorno,
  marcar,
  observer,
  renderizarPagina,
  scrollTo,
  titulos,
  titulosDe,
  todos,
  vaciar,
} from './ayudas'

/**
 * T067 — HU-04: reinicio de paginación al cambiar criterios (CA-04.1 … CA-04.3; RF-09, RF-10).
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 * Se parte de «obra» (55 resultados, 3 páginas) para poder cargar más antes de cambiar criterios.
 */
instalarEntorno()

async function conSegundaPagina() {
  const contexto = renderizarPagina()
  await esperarTarjetas(TAMANO_PAGINA)
  buscarTexto('obra')
  await esperarTarjetas(TAMANO_PAGINA)
  await observer.intersectar()
  await esperarTarjetas(TAMANO_PAGINA * 2)
  return contexto
}

describe('PaginaBusqueda — HU-04: reinicio al cambiar criterios', () => {
  it('cambiar el texto descarta lo cargado y pide la primera página sin cursor (CA-04.1)', async () => {
    const { espias } = await conSegundaPagina()

    buscarTexto('retrato')

    await esperarTarjetas(conEtiqueta('retrato').length)
    expect(titulos()).toEqual(titulosDe(conEtiqueta('retrato')))
    const ultima = espias.buscar.mock.calls[espias.buscar.mock.calls.length - 1]
    expect(ultima[0].texto).toBe('retrato')
    expect(ultima[1]).toBeUndefined()
  })

  it('cambiar un filtro reinicia la lista y no reutiliza el cursor anterior (CA-04.1)', async () => {
    const { espias } = await conSegundaPagina()

    await marcar(/^estilo$/i, 'Abstracto')

    const esperados = todos.filter((d) => d.estilos.includes('abstracto'))
    await waitFor(() => expect(titulos()).toEqual(titulosDe(esperados).slice(0, TAMANO_PAGINA)))
    const ultima = espias.buscar.mock.calls[espias.buscar.mock.calls.length - 1]
    expect(ultima[1]).toBeUndefined()
  })

  it('el scroll vuelve al inicio al cambiar criterios, pero no al cargar más (CA-04.2)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('obra')
    await esperarTarjetas(TAMANO_PAGINA)
    scrollTo.mockClear()

    await observer.intersectar()
    await esperarTarjetas(TAMANO_PAGINA * 2)
    expect(scrollTo).not.toHaveBeenCalled()

    buscarTexto('retrato')
    await esperarTarjetas(conEtiqueta('retrato').length)
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
  })

  it('una búsqueda en curso de criterios anteriores se cancela o ignora (CA-04.3)', async () => {
    const { espias, originales } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    const puerta = crearPuerta()
    espias.buscar.mockImplementationOnce(async (criterios, cursor, signal) => {
      await puerta.promesa
      return originales.buscar(criterios, cursor, signal)
    })

    buscarTexto('paisaje')
    await waitFor(() => expect(espias.buscar).toHaveBeenCalledTimes(1))
    buscarTexto('retrato')
    await esperarTarjetas(conEtiqueta('retrato').length)

    puerta.abrir()
    await vaciar()

    expect(titulos()).toEqual(titulosDe(conEtiqueta('retrato')))
    expect(espias.buscar.mock.calls[0][2]?.aborted).toBe(true)
  })

  it('cambiar filtros durante una carga adicional descarta esa respuesta (RF-10)', async () => {
    const { espias, originales } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('obra')
    await esperarTarjetas(TAMANO_PAGINA)
    const puerta = crearPuerta()
    espias.buscar.mockImplementationOnce(async (criterios, cursor, signal) => {
      await puerta.promesa
      return originales.buscar(criterios, cursor, signal)
    })

    await observer.intersectar()
    await waitFor(() => expect(espias.buscar).toHaveBeenCalledTimes(2))
    await marcar(/^estilo$/i, 'Abstracto')

    const esperados = todos.filter((d) => d.estilos.includes('abstracto'))
    await waitFor(() => expect(titulos()).toEqual(titulosDe(esperados).slice(0, TAMANO_PAGINA)))
    puerta.abrir()
    await vaciar()

    expect(titulos()).toEqual(titulosDe(esperados).slice(0, TAMANO_PAGINA))
    expect(espias.buscar.mock.calls[1][2]?.aborted).toBe(true)
  })
})
