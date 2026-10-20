import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import {
  TAMANO_PAGINA,
  barra,
  buscarTexto,
  chips,
  conEtiqueta,
  esperarTarjetas,
  fijarScroll,
  instalarEntorno,
  marcar,
  observer,
  parametros,
  primeraPagina,
  renderizarPagina,
  scrollTo,
  tarjetas,
  tipoNavegacion,
  titulos,
  titulosDe,
  todos,
  ubicacion,
} from './ayudas'

/**
 * T067 — HU-07: texto y filtros en la URL (CA-07.1 … CA-07.3; RF-24). Incluye el scroll al volver.
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 * `tipo-navegacion` expone `useNavigationType` para distinguir `replace` (texto) de `push`
 * (filtros), según research §5.
 */
instalarEntorno()

describe('PaginaBusqueda — HU-07: URL ⇄ criterios', () => {
  describe('criterios → URL (CA-07.1)', () => {
    it('el texto se refleja en q con replace, sin llenar el historial', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)

      buscarTexto('retrato')

      await waitFor(() => expect(parametros().get('q')).toBe('retrato'))
      expect(tipoNavegacion()).toBe('REPLACE')
    })

    it('los filtros se reflejan en la URL con push; varios valores van separados por coma', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      buscarTexto('paisaje')
      await waitFor(() => expect(parametros().get('q')).toBe('paisaje'))

      await marcar(/^estilo$/i, 'Abstracto')
      await waitFor(() => expect(parametros().get('estilo')).toBe('abstracto'))
      expect(tipoNavegacion()).toBe('PUSH')

      await marcar(/^estilo$/i, 'Realista')
      await waitFor(() => expect(parametros().get('estilo')).toBe('abstracto,realista'))
      expect(parametros().get('q')).toBe('paisaje')
    })

    it('quitar un filtro y limpiar todos actualizan la URL', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      buscarTexto('paisaje')
      await marcar(/^estilo$/i, 'Abstracto')
      await marcar(/^estilo$/i, 'Realista')
      await waitFor(() => expect(parametros().get('estilo')).toBe('abstracto,realista'))

      fireEvent.click(screen.getByRole('button', { name: /quitar filtro.*realista/i }))
      await waitFor(() => expect(parametros().get('estilo')).toBe('abstracto'))

      fireEvent.click(screen.getByRole('button', { name: /limpiar todos/i }))
      await waitFor(() => expect(parametros().has('estilo')).toBe(false))
      expect(parametros().get('q')).toBe('paisaje')
    })

    it('el cursor de paginación nunca va en la URL', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      buscarTexto('obra')
      await esperarTarjetas(TAMANO_PAGINA)

      await observer.intersectar()
      await esperarTarjetas(TAMANO_PAGINA * 2)

      expect(ubicacion()).not.toMatch(/cursor/i)
      expect(Array.from(parametros().keys())).toEqual(['q'])
    })

    it('sin criterios la URL queda sin parámetros', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)

      expect(ubicacion()).toBe('/buscar')
    })
  })

  describe('URL → criterios (CA-07.2, CA-07.3)', () => {
    it('abrir una URL con criterios restaura texto, filtros y resultados', async () => {
      const { espias } = renderizarPagina({ ruta: '/buscar?q=paisaje&estilo=abstracto' })

      const esperados = conEtiqueta('paisaje').filter((d) => d.estilos.includes('abstracto'))
      await waitFor(() => expect(titulos()).toEqual(titulosDe(esperados)))
      expect(barra()).toHaveValue('paisaje')
      expect(chips()).toHaveLength(1)
      expect(
        within(screen.getByRole('list', { name: /filtros activos/i })).getByText(/abstracto/i),
      ).toBeInTheDocument()
      expect(
        await within(await screen.findByRole('group', { name: /^estilo$/i })).findByRole(
          'checkbox',
          { name: 'Abstracto' },
        ),
      ).toBeChecked()
      expect(espias.buscar).toHaveBeenCalled()
    })

    it('los valores inválidos de la URL se ignoran sin romper la pantalla (CA-07.3)', async () => {
      renderizarPagina({
        ruta: '/buscar?q=retrato&tipoContenido=PINTURA&distancia=25&foo=bar&estilo=&cursor=abc',
      })

      await waitFor(() => expect(titulos()).toEqual(titulosDe(conEtiqueta('retrato'))))
      expect(barra()).toHaveValue('retrato')
      expect(chips()).toHaveLength(0)
    })

    it('una URL totalmente inválida muestra el FYP', async () => {
      renderizarPagina({ ruta: '/buscar?tipoContenido=%%&distancia=NaN&estilo=,,,' })

      await esperarTarjetas(TAMANO_PAGINA)

      expect(titulos()).toEqual(primeraPagina(todos))
      expect(barra()).toHaveValue('')
    })

    it('la distancia de la URL se ignora mientras no haya ubicación (A-02)', async () => {
      const { espias } = renderizarPagina({ ruta: '/buscar?q=retrato&distancia=25' })

      await waitFor(() => expect(titulos()).toEqual(titulosDe(conEtiqueta('retrato'))))

      expect(chips()).toHaveLength(0)
      for (const [criterios] of espias.buscar.mock.calls) {
        expect(criterios.filtros).toHaveLength(0)
      }
    })

    it('atrás y adelante restauran los criterios del historial', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      buscarTexto('paisaje')
      await esperarTarjetas(conEtiqueta('paisaje').length)
      await marcar(/^estilo$/i, 'Abstracto')
      await waitFor(() => expect(parametros().get('estilo')).toBe('abstracto'))

      fireEvent.click(screen.getByRole('button', { name: /atrás/i }))

      await waitFor(() => expect(parametros().has('estilo')).toBe(false))
      await waitFor(() => expect(chips()).toHaveLength(0))
      await waitFor(() => expect(titulos()).toEqual(titulosDe(conEtiqueta('paisaje'))))
      expect(barra()).toHaveValue('paisaje')

      fireEvent.click(screen.getByRole('button', { name: /adelante/i }))

      await waitFor(() => expect(chips()).toHaveLength(1))
      expect(parametros().get('estilo')).toBe('abstracto')
    })
  })

  describe('al volver del detalle (RF-24)', () => {
    it('conserva los criterios y restaura el scroll', async () => {
      renderizarPagina({ ruta: '/buscar?q=retrato' })
      await esperarTarjetas(conEtiqueta('retrato').length)
      fijarScroll(640)

      fireEvent.click(within(tarjetas()[0]).getByRole('link'))
      await screen.findByRole('heading', { name: /detalle de publicación/i })
      scrollTo.mockClear()
      fireEvent.click(screen.getByRole('button', { name: /atrás/i }))

      await esperarTarjetas(conEtiqueta('retrato').length)
      expect(barra()).toHaveValue('retrato')
      expect(ubicacion()).toBe('/buscar?q=retrato')
      await waitFor(() =>
        expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 640 })),
      )
    })
  })
})
