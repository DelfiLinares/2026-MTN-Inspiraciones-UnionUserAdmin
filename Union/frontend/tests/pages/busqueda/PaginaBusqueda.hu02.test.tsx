import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import {
  TAMANO_PAGINA,
  barra,
  buscarTexto,
  conEtiqueta,
  escribir,
  esperarTarjetas,
  instalarEntorno,
  marcar,
  observer,
  pasarDebounce,
  primeraPagina,
  renderizarPagina,
  titulos,
  titulosDe,
  todos,
  vaciar,
  chips,
} from './ayudas'

/**
 * T067 — HU-02: buscar por texto (CA-02.1 … CA-02.7; RF-01–05, RF-23).
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 * El adaptador busca en título, autor y etiquetas; «retrato» (11), «paisaje» (11) y «obra» (55)
 * dan resultados disjuntos o completos, derivados de los datos de ejemplo.
 */
instalarEntorno()

describe('PaginaBusqueda — HU-02: buscar por texto', () => {
  it('la barra está siempre visible y accesible, incluso mientras carga (CA-02.1)', async () => {
    renderizarPagina()

    expect(screen.getByRole('search')).toBeInTheDocument()
    expect(barra()).toBeInTheDocument()
    await esperarTarjetas(TAMANO_PAGINA)
    expect(screen.getByRole('search')).toBeInTheDocument()
  })

  it('con texto muestra resultados de búsqueda en lugar del FYP (CA-02.2, RF-05)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    buscarTexto('retrato')

    await esperarTarjetas(conEtiqueta('retrato').length)
    expect(titulos()).toEqual(titulosDe(conEtiqueta('retrato')))
    expect(espias.buscar).toHaveBeenCalledTimes(1)
    expect(espias.buscar.mock.calls[0][0].texto).toBe('retrato')
  })

  it('no dispara una búsqueda por cada tecla: usa debounce (CA-02.4)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    for (const texto of ['r', 're', 'ret', 'retr']) escribir(texto)
    await vaciar()
    expect(espias.buscar).not.toHaveBeenCalled()

    escribir('retrato')
    pasarDebounce()

    await esperarTarjetas(conEtiqueta('retrato').length)
    expect(espias.buscar).toHaveBeenCalledTimes(1)
  })

  it('normaliza el texto antes de enviarlo (CA-02.3)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    buscarTexto('   retrato    ')

    await waitFor(() => expect(espias.buscar).toHaveBeenCalledTimes(1))
    expect(espias.buscar.mock.calls[0][0].texto).toBe('retrato')
  })

  it('un texto solo con espacios equivale a vacío: sigue el FYP y no se busca (CA-02.3)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    buscarTexto('      ')
    await vaciar()

    expect(espias.buscar).not.toHaveBeenCalled()
    expect(espias.obtenerFyp).toHaveBeenCalledTimes(1)
    expect(titulos()).toEqual(primeraPagina(todos))
  })

  it('con 1 carácter no busca: muestra el FYP y la pista de mínimo 2 caracteres (RF-23)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)

    buscarTexto('r')
    await vaciar()

    expect(espias.buscar).not.toHaveBeenCalled()
    expect(screen.getByText(/al menos 2 caracteres/i)).toBeInTheDocument()
    await esperarTarjetas(TAMANO_PAGINA)
    expect(titulos()).toEqual(primeraPagina(todos))
  })

  it('un solo paso borra el texto y vuelve al FYP (CA-02.5, RF-04)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('retrato')
    await esperarTarjetas(conEtiqueta('retrato').length)

    fireEvent.click(screen.getByRole('button', { name: /borrar b[uú]squeda/i }))

    expect(barra()).toHaveValue('')
    await esperarTarjetas(TAMANO_PAGINA)
    expect(titulos()).toEqual(primeraPagina(todos))
    expect(espias.buscar).toHaveBeenCalledTimes(1)
  })

  it('borrar el texto respeta los filtros activos (CA-02.5)', async () => {
    renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('obra')
    await esperarTarjetas(TAMANO_PAGINA)
    await marcar(/^estilo$/i, 'Abstracto')
    await waitFor(() => expect(chips()).toHaveLength(1))

    fireEvent.click(screen.getByRole('button', { name: /borrar b[uú]squeda/i }))

    expect(barra()).toHaveValue('')
    expect(chips()).toHaveLength(1)
  })

  it('los resultados de búsqueda se paginan con scroll infinito (CA-02.6)', async () => {
    const { espias } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    buscarTexto('obra')
    await esperarTarjetas(TAMANO_PAGINA)

    await observer.intersectar()
    await esperarTarjetas(TAMANO_PAGINA * 2)

    expect(titulos()).toEqual(titulosDe(todos).slice(0, TAMANO_PAGINA * 2))
    expect(espias.buscar).toHaveBeenCalledTimes(2)
    expect(typeof espias.buscar.mock.calls[1][1]).toBe('string')
    expect(espias.buscar.mock.calls[1][0].texto).toBe('obra')
  })

  it('nunca muestra resultados de un texto anterior, aunque lleguen tarde (CA-02.7)', async () => {
    const { espias, originales } = renderizarPagina()
    await esperarTarjetas(TAMANO_PAGINA)
    const pendientes = new Map<string, () => void>()
    espias.buscar.mockImplementation(async (criterios, cursor, signal) => {
      await new Promise<void>((resolver) => pendientes.set(criterios.texto, resolver))
      return originales.buscar(criterios, cursor, signal)
    })

    buscarTexto('paisaje')
    buscarTexto('retrato')
    await waitFor(() => expect(pendientes.size).toBe(2))

    pendientes.get('retrato')?.()
    await esperarTarjetas(conEtiqueta('retrato').length)
    pendientes.get('paisaje')?.()
    await vaciar()

    expect(titulos()).toEqual(titulosDe(conEtiqueta('retrato')))
    expect(espias.buscar.mock.calls[0][2]?.aborted).toBe(true)
  })
})
