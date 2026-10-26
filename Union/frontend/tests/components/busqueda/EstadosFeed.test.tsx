import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AvisoSinPermiso } from '../../../src/components/busqueda/AvisoSinPermiso'
import { EsqueletoTarjetas } from '../../../src/components/busqueda/EsqueletoTarjetas'
import { EstadoError } from '../../../src/components/busqueda/EstadoError'
import { EstadoVacio } from '../../../src/components/busqueda/EstadoVacio'
import { ErrorBusqueda } from '../../../src/domain/busqueda/ErrorBusqueda'
import { TipoErrorBusqueda } from '../../../src/domain/enums/TipoErrorBusqueda'

/**
 * T065 — Estados del feed (HU-05; RF-17, RF-18; CA-05.1–CA-05.5).
 * Fuente: Union/specs/007-inspiraciones-busqueda/{spec,plan,tasks}.md
 *
 * Contrato asumido para T044 (no definido en las specs). Todos los componentes son de
 * presentación pura: reciben datos y callbacks, sin reglas de negocio.
 *
 * - `<EsqueletoTarjetas cantidad? />`: contenedor `aria-busy="true"` con nombre accesible
 *   «Cargando publicaciones» (`role="status"`); por defecto 6 marcadores `data-testid=
 *   "esqueleto-tarjeta"`, ocultos para lectores de pantalla (`aria-hidden`).
 * - `<EstadoVacio hayFiltros onLimpiarFiltros />`: `role="status"` con mensaje claro. Si
 *   `hayFiltros`, sugiere limpiar filtros y muestra el botón «Limpiar filtros»; si no, no hay
 *   botón (no hay nada que limpiar).
 * - `<EstadoError error onReintentar />`: `role="alert"` con un mensaje comprensible según
 *   `error.tipo`, que no expone el mensaje técnico de `error.message`. Botón «Reintentar» solo
 *   si `error.esReintentable`; para otros tipos no hay botón.
 * - `<AvisoSinPermiso />`: `role="alert"` (403) con un aviso de falta de permiso; sin botón de
 *   reintentar (reintentar no cambia el resultado).
 */
describe('EsqueletoTarjetas (CA-05.1)', () => {
  it('se anuncia como estado de carga ocupado', () => {
    render(<EsqueletoTarjetas />)

    const estado = screen.getByRole('status', { name: /cargando publicaciones/i })
    expect(estado).toHaveAttribute('aria-busy', 'true')
  })

  it('muestra 6 marcadores por defecto', () => {
    render(<EsqueletoTarjetas />)

    expect(screen.getAllByTestId('esqueleto-tarjeta')).toHaveLength(6)
  })

  it('respeta la cantidad pedida', () => {
    render(<EsqueletoTarjetas cantidad={3} />)

    expect(screen.getAllByTestId('esqueleto-tarjeta')).toHaveLength(3)
  })

  it('los marcadores se ocultan a los lectores de pantalla', () => {
    render(<EsqueletoTarjetas cantidad={2} />)

    for (const marcador of screen.getAllByTestId('esqueleto-tarjeta')) {
      expect(marcador).toHaveAttribute('aria-hidden', 'true')
    }
  })

  it('no contiene enlaces ni botones', () => {
    render(<EsqueletoTarjetas />)

    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})

describe('EstadoVacio (CA-05.2, RF-17)', () => {
  it('muestra un mensaje claro de que no hay resultados', () => {
    render(<EstadoVacio hayFiltros={false} onLimpiarFiltros={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent(/no (hay|se encontraron) (resultados|publicaciones)/i)
  })

  it('con filtros activos sugiere limpiarlos y ofrece la acción', () => {
    render(<EstadoVacio hayFiltros onLimpiarFiltros={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent(/filtros/i)
    expect(screen.getByRole('button', { name: /limpiar filtros/i })).toBeInTheDocument()
  })

  it('«Limpiar filtros» llama a onLimpiarFiltros una vez', () => {
    const onLimpiarFiltros = vi.fn()
    render(<EstadoVacio hayFiltros onLimpiarFiltros={onLimpiarFiltros} />)

    fireEvent.click(screen.getByRole('button', { name: /limpiar filtros/i }))

    expect(onLimpiarFiltros).toHaveBeenCalledTimes(1)
  })

  it('sin filtros activos no ofrece limpiar', () => {
    render(<EstadoVacio hayFiltros={false} onLimpiarFiltros={vi.fn()} />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('el botón es alcanzable con el teclado', () => {
    render(<EstadoVacio hayFiltros onLimpiarFiltros={vi.fn()} />)
    const boton = screen.getByRole('button', { name: /limpiar filtros/i })

    boton.focus()

    expect(boton).toHaveFocus()
  })
})

describe('EstadoError (CA-05.3, RF-17, RF-18)', () => {
  const error = (tipo: TipoErrorBusqueda, mensaje = 'detalle técnico interno') =>
    new ErrorBusqueda(tipo, mensaje)

  it('se anuncia como alerta', () => {
    render(<EstadoError error={error(TipoErrorBusqueda.RED)} onReintentar={vi.fn()} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it.each([
    [TipoErrorBusqueda.RED, /conexi[oó]n|red/i],
    [TipoErrorBusqueda.LIMITE, /demasiad|l[ií]mite|esper/i],
    [TipoErrorBusqueda.SERVIDOR, /servidor|problema|inesperado/i],
  ])('mensaje comprensible para %s, con opción de reintentar', (tipo, patron) => {
    render(<EstadoError error={error(tipo)} onReintentar={vi.fn()} />)

    expect(screen.getByRole('alert')).toHaveTextContent(patron)
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('no expone el mensaje técnico del error', () => {
    render(<EstadoError error={error(TipoErrorBusqueda.SERVIDOR)} onReintentar={vi.fn()} />)

    expect(screen.queryByText(/detalle técnico interno/i)).not.toBeInTheDocument()
  })

  it('«Reintentar» llama a onReintentar una vez', () => {
    const onReintentar = vi.fn()
    render(<EstadoError error={error(TipoErrorBusqueda.RED)} onReintentar={onReintentar} />)

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(onReintentar).toHaveBeenCalledTimes(1)
  })

  it('un error no reintentable no ofrece reintentar', () => {
    render(
      <EstadoError error={error(TipoErrorBusqueda.SOLICITUD_INVALIDA)} onReintentar={vi.fn()} />,
    )

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument()
  })

  it('el botón es alcanzable con el teclado', () => {
    render(<EstadoError error={error(TipoErrorBusqueda.RED)} onReintentar={vi.fn()} />)
    const boton = screen.getByRole('button', { name: /reintentar/i })

    boton.focus()

    expect(boton).toHaveFocus()
  })
})

describe('AvisoSinPermiso (403, RF-18, RF-25)', () => {
  it('muestra un aviso de falta de permiso como alerta', () => {
    render(<AvisoSinPermiso />)

    expect(screen.getByRole('alert')).toHaveTextContent(/permiso/i)
  })

  it('no ofrece reintentar', () => {
    render(<AvisoSinPermiso />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renderiza sin lanzar errores (no rompe la pantalla)', () => {
    expect(() => render(<AvisoSinPermiso />)).not.toThrow()
  })
})
