import { describe, expect, it } from 'vitest'
import { screen } from '@testing-library/react'
import {
  TAMANO_PAGINA,
  crearPuerta,
  esperarTarjetas,
  instalarEntorno,
  observer,
  renderizarPagina,
  tarjetas,
  titulos,
  titulosDe,
  todos,
} from './ayudas'

/**
 * T067 — HU-01: feed FYP con scroll infinito (CA-01.1 … CA-01.6; RF-05–08, RF-20).
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 */
instalarEntorno()

describe('PaginaBusqueda — HU-01: feed FYP con scroll infinito', () => {
  it('con la barra vacía y sin filtros muestra el FYP (CA-01.1)', async () => {
    const { espias } = renderizarPagina()

    await esperarTarjetas(TAMANO_PAGINA)

    expect(espias.obtenerFyp).toHaveBeenCalledTimes(1)
    expect(espias.buscar).not.toHaveBeenCalled()
  })

  it('muestra las publicaciones en el orden de la API, sin reordenar (CA-01.2)', async () => {
    renderizarPagina()

    await esperarTarjetas(TAMANO_PAGINA)

    expect(titulos()).toEqual(titulosDe(todos).slice(0, TAMANO_PAGINA))
  })

  it('nunca carga el listado completo: pide solo la primera página (CA-01.6)', async () => {
    const { espias } = renderizarPagina()

    await esperarTarjetas(TAMANO_PAGINA)

    expect(tarjetas().length).toBeLessThan(todos.length)
    expect(espias.obtenerFyp.mock.calls[0][0]).toBeUndefined()
  })

  it('al llegar al final pide la siguiente página con el cursor y agrega al final (CA-01.3)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    await observer.intersectar()
    await esperarTarjetas(TAMANO_PAGINA * 2)

    expect(typeof espias.obtenerFyp.mock.calls[1][0]).toBe('string')
    expect(titulos()).toEqual(titulosDe(todos).slice(0, TAMANO_PAGINA * 2))
  })

  it('no pide otra página mientras hay una carga en curso (CA-01.4)', async () => {
    const puerta = crearPuerta()
    const { espias, originales } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    espias.obtenerFyp.mockImplementationOnce(async (cursor, signal) => {
      await puerta.promesa
      return originales.obtenerFyp(cursor, signal)
    })

    await observer.intersectar()
    await observer.intersectar()
    await observer.intersectar()

    expect(espias.obtenerFyp).toHaveBeenCalledTimes(2)
    expect(screen.getByRole('status', { name: /cargando/i })).toBeInTheDocument()
    expect(tarjetas()).toHaveLength(TAMANO_PAGINA)

    puerta.abrir()
    await esperarTarjetas(TAMANO_PAGINA * 2)
    expect(espias.obtenerFyp).toHaveBeenCalledTimes(2)
  })

  it('no pide otra página cuando la API indica que no hay más resultados (CA-01.5)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    await observer.intersectar()
    await esperarTarjetas(TAMANO_PAGINA * 2)
    await observer.intersectar()
    await esperarTarjetas(todos.length)

    const llamadas = espias.obtenerFyp.mock.calls.length
    await observer.intersectar()
    await observer.intersectar()

    expect(llamadas).toBe(3)
    expect(espias.obtenerFyp).toHaveBeenCalledTimes(llamadas)
    expect(screen.queryByTestId('feed-centinela')).not.toBeInTheDocument()
  })

  it('tras recorrer todas las páginas no hay items duplicados y el orden se conserva (RF-20)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    await observer.intersectar()
    await esperarTarjetas(TAMANO_PAGINA * 2)
    await observer.intersectar()
    await esperarTarjetas(todos.length)

    expect(titulos()).toEqual(titulosDe(todos))
    expect(new Set(titulos()).size).toBe(todos.length)
  })
})
