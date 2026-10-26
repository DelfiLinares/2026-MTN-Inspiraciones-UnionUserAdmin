import { describe, expect, it } from 'vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { mapearError } from '../../../src/infrastructure/busqueda/busquedaMappers'
import {
  TAMANO_PAGINA,
  barra,
  buscarTexto,
  chips,
  crearPuerta,
  esperarTarjetas,
  instalarEntorno,
  marcar,
  observer,
  renderizarPagina,
  tarjetas,
  titulos,
  titulosDe,
  todos,
} from './ayudas'

/**
 * T067 — HU-05: estados de carga, vacío y error; 401/403 (CA-05.1 … CA-05.5; RF-17, RF-18, RF-25).
 * Integración UI + SesionBusqueda + adaptador en memoria. Contrato de la página: ver `ayudas.tsx`.
 * Los fallos se programan sobre el método concreto del repositorio (no hay carrera con el
 * catálogo) y se construyen con `mapearError`, igual que los produce el adaptador HTTP.
 */
instalarEntorno()

describe('PaginaBusqueda — HU-05: estados', () => {
  describe('carga (CA-05.1)', () => {
    it('la carga inicial muestra un indicador y luego las tarjetas', async () => {
      const puerta = crearPuerta()
      renderizarPagina({
        preparar: ({ espias, originales }) =>
          espias.obtenerFyp.mockImplementationOnce(async (cursor, signal) => {
            await puerta.promesa
            return originales.obtenerFyp(cursor, signal)
          }),
      })

      expect(await screen.findByRole('status', { name: /cargando/i })).toBeInTheDocument()
      expect(tarjetas()).toHaveLength(0)

      puerta.abrir()
      await esperarTarjetas(TAMANO_PAGINA)
      expect(screen.queryByRole('status', { name: /cargando/i })).not.toBeInTheDocument()
    })

    it('la carga de más resultados muestra un indicador sin quitar lo ya cargado', async () => {
      const puerta = crearPuerta()
      const { espias, originales } = renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      espias.obtenerFyp.mockImplementationOnce(async (cursor, signal) => {
        await puerta.promesa
        return originales.obtenerFyp(cursor, signal)
      })

      await observer.intersectar()

      expect(await screen.findByRole('status', { name: /cargando/i })).toBeInTheDocument()
      expect(tarjetas()).toHaveLength(TAMANO_PAGINA)
      puerta.abrir()
      await esperarTarjetas(TAMANO_PAGINA * 2)
    })
  })

  describe('vacío (CA-05.2)', () => {
    it('sin resultados muestra un mensaje claro y no ofrece limpiar si no hay filtros', async () => {
      renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)

      buscarTexto('zzzzzz')

      expect(await screen.findByText(/no (hay|se encontraron) (resultados|publicaciones)/i))
        .toBeInTheDocument()
      expect(tarjetas()).toHaveLength(0)
      expect(screen.queryByRole('button', { name: /limpiar filtros/i })).not.toBeInTheDocument()
    })

    it('con filtros activos sugiere limpiarlos y la acción restablece los resultados', async () => {
      const abstractos = todos.filter((d) => d.estilos.includes('abstracto'))
      renderizarPagina({ datos: abstractos })
      await esperarTarjetas(Math.min(TAMANO_PAGINA, abstractos.length))
      buscarTexto('obra')
      await esperarTarjetas(Math.min(TAMANO_PAGINA, abstractos.length))

      await marcar(/^estilo$/i, 'Realista')

      const limpiar = await screen.findByRole('button', { name: /limpiar filtros/i })
      expect(tarjetas()).toHaveLength(0)
      fireEvent.click(limpiar)

      await waitFor(() => expect(chips()).toHaveLength(0))
      await waitFor(() =>
        expect(titulos()).toEqual(titulosDe(abstractos).slice(0, TAMANO_PAGINA)),
      )
    })
  })

  describe('error de red o servidor (CA-05.3)', () => {
    it.each([
      ['red', null, /conexi[oó]n|red/i],
      ['servidor', 500, /servidor|problema|inesperado/i],
      ['límite', 429, /demasiad|l[ií]mite|esper/i],
    ])('error de %s en la primera página: mensaje comprensible y reintento', async (_nombre, estado, mensaje) => {
      const { espias } = renderizarPagina({
        preparar: ({ espias: e }) => e.obtenerFyp.mockRejectedValueOnce(mapearError(estado)),
      })

      const alerta = await screen.findByRole('alert')
      expect(alerta).toHaveTextContent(mensaje)
      expect(tarjetas()).toHaveLength(0)

      fireEvent.click(within(alerta).getByRole('button', { name: /reintentar/i }))

      await esperarTarjetas(TAMANO_PAGINA)
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(espias.obtenerFyp).toHaveBeenCalledTimes(2)
    })

    it('un error al cargar una página adicional conserva los items y permite reintentar (CA-05.4)', async () => {
      const { espias } = renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      espias.obtenerFyp.mockRejectedValueOnce(mapearError(null))

      await observer.intersectar()

      const alerta = await screen.findByRole('alert')
      expect(tarjetas()).toHaveLength(TAMANO_PAGINA)
      expect(titulos()).toEqual(titulosDe(todos).slice(0, TAMANO_PAGINA))

      fireEvent.click(within(alerta).getByRole('button', { name: /reintentar/i }))

      await esperarTarjetas(TAMANO_PAGINA * 2)
      expect(titulos()).toEqual(titulosDe(todos).slice(0, TAMANO_PAGINA * 2))
      expect(espias.obtenerFyp.mock.calls[1][0]).toBe(espias.obtenerFyp.mock.calls[2][0])
    })

    it('el error de una búsqueda se reintenta con los mismos criterios', async () => {
      const { espias } = renderizarPagina()
      await esperarTarjetas(TAMANO_PAGINA)
      espias.buscar.mockRejectedValueOnce(mapearError(null))

      buscarTexto('retrato')
      fireEvent.click(await screen.findByRole('button', { name: /reintentar/i }))

      await waitFor(() => expect(titulos()).toHaveLength(11))
      expect(espias.buscar.mock.calls[1][0].texto).toBe('retrato')
    })
  })

  describe('401 y 403 (CA-05.5, RF-18, RF-25)', () => {
    it('401: delega en SesionUsuarioPort (ir a login) y no rompe la pantalla', async () => {
      const { sesionUsuario } = renderizarPagina({
        preparar: ({ espias }) => espias.obtenerFyp.mockRejectedValueOnce(mapearError(401)),
      })

      await waitFor(() => expect(sesionUsuario.alNoAutenticado).toHaveBeenCalledTimes(1))
      expect(barra()).toBeInTheDocument()
    })

    it('403: muestra un aviso de falta de permiso sin romper la pantalla ni reintentar', async () => {
      const { sesionUsuario } = renderizarPagina({
        preparar: ({ espias }) => espias.obtenerFyp.mockRejectedValueOnce(mapearError(403)),
      })

      expect(await screen.findByRole('alert')).toHaveTextContent(/permiso/i)
      expect(barra()).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument()
      expect(sesionUsuario.alNoAutenticado).not.toHaveBeenCalled()
    })

    it('403 no cierra la sesión', async () => {
      const { sesionUsuario } = renderizarPagina({
        preparar: ({ espias }) => espias.obtenerFyp.mockRejectedValueOnce(mapearError(403)),
      })

      await screen.findByRole('alert')

      expect(sesionUsuario.alNoAutenticado).not.toHaveBeenCalled()
    })
  })

  describe('error local del catálogo de filtros', () => {
    it('no afecta al feed y se puede reintentar desde el panel', async () => {
      renderizarPagina({
        preparar: ({ espias }) =>
          espias.obtenerCatalogoFiltros.mockRejectedValueOnce(mapearError(null)),
      })

      const alerta = await screen.findByRole('alert')
      await esperarTarjetas(TAMANO_PAGINA)
      expect(screen.queryByRole('checkbox', { name: 'Abstracto' })).not.toBeInTheDocument()

      fireEvent.click(within(alerta).getByRole('button', { name: /reintentar/i }))

      expect(await screen.findByRole('checkbox', { name: 'Abstracto' })).toBeInTheDocument()
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
      expect(tarjetas()).toHaveLength(TAMANO_PAGINA)
    })
  })
})
