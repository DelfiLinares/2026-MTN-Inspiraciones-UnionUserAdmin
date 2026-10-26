import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { ChipsFiltrosActivos } from '../../../src/components/busqueda/ChipsFiltrosActivos'
import { PanelFiltros } from '../../../src/components/busqueda/PanelFiltros'
import { CatalogoFiltros } from '../../../src/domain/busqueda/CatalogoFiltros'
import { CriteriosBusqueda } from '../../../src/domain/busqueda/CriteriosBusqueda'
import { ErrorBusqueda } from '../../../src/domain/busqueda/ErrorBusqueda'
import { FiltroActivo } from '../../../src/domain/busqueda/FiltroActivo'
import { TipoContenido } from '../../../src/domain/enums/TipoContenido'
import { TipoErrorBusqueda } from '../../../src/domain/enums/TipoErrorBusqueda'
import { TipoFiltro } from '../../../src/domain/enums/TipoFiltro'

/**
 * T064 — PanelFiltros y ChipsFiltrosActivos (HU-03; RF-11–14, RF-21; CA-03.1, CA-03.4,
 * CA-03.5). Fuente: Union/specs/007-inspiraciones-busqueda/{spec,plan,tasks}.md
 *
 * Contrato asumido para T042a/T043 (no definido en las specs):
 *
 * PanelFiltros — `<PanelFiltros criterios catalogo errorCatalogo onAplicar onQuitar
 *   onReintentarCatalogo />`
 * - `criterios: CriteriosBusqueda` (solo se consulta: filtros activos y `admiteFiltro`).
 * - `catalogo: CatalogoFiltros | null`; `errorCatalogo?: ErrorBusqueda | null` (error local).
 * - `onAplicar(filtro: FiltroActivo)`, `onQuitar(filtro: FiltroActivo)`: el panel no decide
 *   reglas, solo informa la acción.
 * - Un `fieldset` (role `group`) por tipo, con nombre «Estilo», «Técnica», «Tipo de arte»,
 *   «Tipo de contenido» y «Distancia». Cada opción es un checkbox con la etiqueta de la
 *   opción; marcado si el filtro está activo. Selección múltiple: varias opciones a la vez.
 * - Marcar un checkbox llama a `onAplicar`; desmarcarlo llama a `onQuitar`.
 * - Error de catálogo: `role="alert"` con botón «Reintentar» (`onReintentarCatalogo`); en ese
 *   caso no se muestran los grupos de estilo/técnica/tipo de arte, pero sí «Tipo de contenido».
 * - DISTANCIA (RF-21, A-02): el grupo «Distancia» siempre está, con todos sus controles
 *   deshabilitados mientras `criterios.admiteFiltro(DISTANCIA, …)` sea falso, más un aviso que
 *   menciona la ubicación. Nunca llama a `onAplicar` con DISTANCIA.
 *
 * ChipsFiltrosActivos — `<ChipsFiltrosActivos filtros onQuitar onLimpiarTodos />`
 * - Lista (`role="list"`, nombre «Filtros activos») con un ítem por filtro; el texto incluye
 *   el valor. Sin filtros no se renderiza nada.
 * - Botón «Quitar filtro …» por chip → `onQuitar(filtro)` con ese filtro exacto (aunque haya
 *   otros del mismo tipo).
 * - Botón «Limpiar todos» (solo con filtros) → `onLimpiarTodos()`.
 */
const catalogo = new CatalogoFiltros({
  estilos: [
    { valor: 'impresionismo', etiqueta: 'Impresionismo' },
    { valor: 'surrealismo', etiqueta: 'Surrealismo' },
  ],
  tecnicas: [
    { valor: 'oleo', etiqueta: 'Óleo' },
    { valor: 'acuarela', etiqueta: 'Acuarela' },
  ],
  tiposArte: [{ valor: 'pintura', etiqueta: 'Pintura' }],
})

const estilo = (v: string) => new FiltroActivo(TipoFiltro.ESTILO, v)
const tecnica = (v: string) => new FiltroActivo(TipoFiltro.TECNICA, v)
const contenido = (v: TipoContenido) => new FiltroActivo(TipoFiltro.TIPO_CONTENIDO, v)

function renderPanel(
  props: Partial<Parameters<typeof PanelFiltros>[0]> = {},
) {
  const onAplicar = vi.fn()
  const onQuitar = vi.fn()
  const onReintentarCatalogo = vi.fn()
  const vista = render(
    <PanelFiltros
      criterios={CriteriosBusqueda.vacio()}
      catalogo={catalogo}
      errorCatalogo={null}
      onAplicar={onAplicar}
      onQuitar={onQuitar}
      onReintentarCatalogo={onReintentarCatalogo}
      {...props}
    />,
  )
  return { onAplicar, onQuitar, onReintentarCatalogo, ...vista }
}

const grupo = (nombre: RegExp) => screen.getByRole('group', { name: nombre })

describe('PanelFiltros — filtros disponibles (RF-11, CA-03.1)', () => {
  it.each([[/^estilo$/i], [/^t[eé]cnica$/i], [/^tipo de arte$/i], [/^tipo de contenido$/i], [/^distancia$/i]])(
    'muestra el grupo %s',
    (nombre) => {
      renderPanel()

      expect(grupo(nombre)).toBeInTheDocument()
    },
  )

  it('lista las opciones del catálogo como checkboxes dentro de su grupo', () => {
    renderPanel()

    const estilos = within(grupo(/^estilo$/i))
    expect(estilos.getByRole('checkbox', { name: 'Impresionismo' })).toBeInTheDocument()
    expect(estilos.getByRole('checkbox', { name: 'Surrealismo' })).toBeInTheDocument()
    const tecnicas = within(grupo(/^t[eé]cnica$/i))
    expect(tecnicas.getByRole('checkbox', { name: 'Óleo' })).toBeInTheDocument()
    expect(tecnicas.getByRole('checkbox', { name: 'Acuarela' })).toBeInTheDocument()
    expect(
      within(grupo(/^tipo de arte$/i)).getByRole('checkbox', { name: 'Pintura' }),
    ).toBeInTheDocument()
  })

  it('ofrece los tipos de contenido', () => {
    renderPanel()

    const tipos = within(grupo(/^tipo de contenido$/i))
    expect(tipos.getByRole('checkbox', { name: /imagen/i })).toBeInTheDocument()
    expect(tipos.getByRole('checkbox', { name: /video/i })).toBeInTheDocument()
  })

  it('sin filtros activos no hay ningún checkbox marcado', () => {
    renderPanel()

    for (const caja of screen.getAllByRole('checkbox')) expect(caja).not.toBeChecked()
  })

  it('marca las opciones de los filtros activos', () => {
    const criterios = CriteriosBusqueda.vacio()
      .conFiltro(estilo('surrealismo'))
      .conFiltro(contenido(TipoContenido.VIDEO))

    renderPanel({ criterios })

    expect(screen.getByRole('checkbox', { name: 'Surrealismo' })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: /video/i })).toBeChecked()
    expect(screen.getByRole('checkbox', { name: 'Impresionismo' })).not.toBeChecked()
  })
})

describe('PanelFiltros — aplicar y quitar (RF-12, CA-03.2)', () => {
  it('marcar una opción llama a onAplicar con ese filtro', () => {
    const { onAplicar, onQuitar } = renderPanel()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Impresionismo' }))

    expect(onAplicar).toHaveBeenCalledTimes(1)
    expect(onAplicar.mock.calls[0][0].equals(estilo('impresionismo'))).toBe(true)
    expect(onQuitar).not.toHaveBeenCalled()
  })

  it('marcar un tipo de contenido aplica un filtro TIPO_CONTENIDO', () => {
    const { onAplicar } = renderPanel()

    fireEvent.click(screen.getByRole('checkbox', { name: /imagen/i }))

    expect(onAplicar.mock.calls[0][0].equals(contenido(TipoContenido.IMAGEN))).toBe(true)
  })

  it('selección múltiple: se pueden aplicar varias opciones del mismo tipo', () => {
    const { onAplicar } = renderPanel()

    fireEvent.click(screen.getByRole('checkbox', { name: 'Impresionismo' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Surrealismo' }))

    expect(onAplicar).toHaveBeenCalledTimes(2)
    expect(onAplicar.mock.calls[1][0].equals(estilo('surrealismo'))).toBe(true)
  })

  it('desmarcar una opción activa llama a onQuitar con ese filtro', () => {
    const criterios = CriteriosBusqueda.vacio().conFiltro(tecnica('oleo'))
    const { onAplicar, onQuitar } = renderPanel({ criterios })

    fireEvent.click(screen.getByRole('checkbox', { name: 'Óleo' }))

    expect(onQuitar).toHaveBeenCalledTimes(1)
    expect(onQuitar.mock.calls[0][0].equals(tecnica('oleo'))).toBe(true)
    expect(onAplicar).not.toHaveBeenCalled()
  })

  it('las opciones son alcanzables con el teclado', () => {
    renderPanel()
    const caja = screen.getByRole('checkbox', { name: 'Impresionismo' })

    caja.focus()

    expect(caja).toHaveFocus()
  })
})

describe('PanelFiltros — error local del catálogo', () => {
  const error = new ErrorBusqueda(TipoErrorBusqueda.RED, 'Sin conexión')

  it('muestra un aviso con la opción de reintentar', () => {
    renderPanel({ catalogo: null, errorCatalogo: error })

    expect(screen.getByRole('alert')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument()
  })

  it('reintentar llama a onReintentarCatalogo', () => {
    const { onReintentarCatalogo } = renderPanel({ catalogo: null, errorCatalogo: error })

    fireEvent.click(screen.getByRole('button', { name: /reintentar/i }))

    expect(onReintentarCatalogo).toHaveBeenCalledTimes(1)
  })

  it('no muestra los grupos que dependen del catálogo, pero sí tipo de contenido', () => {
    renderPanel({ catalogo: null, errorCatalogo: error })

    expect(screen.queryByRole('group', { name: /^estilo$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /^t[eé]cnica$/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: /^tipo de arte$/i })).not.toBeInTheDocument()
    expect(grupo(/^tipo de contenido$/i)).toBeInTheDocument()
  })

  it('sin error no muestra alerta', () => {
    renderPanel()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('PanelFiltros — DISTANCIA deshabilitada sin ubicación (RF-21, A-02)', () => {
  it('el grupo Distancia tiene todos sus controles deshabilitados', () => {
    renderPanel()

    const controles = within(grupo(/^distancia$/i)).getAllByRole('checkbox')
    expect(controles.length).toBeGreaterThan(0)
    for (const control of controles) expect(control).toBeDisabled()
  })

  it('muestra un aviso que menciona la ubicación', () => {
    renderPanel()

    expect(within(grupo(/^distancia$/i)).getByText(/ubicaci[oó]n/i)).toBeInTheDocument()
  })

  it('hacer clic en un rango no aplica ningún filtro', () => {
    const { onAplicar } = renderPanel()

    for (const control of within(grupo(/^distancia$/i)).getAllByRole('checkbox')) {
      fireEvent.click(control)
    }

    expect(onAplicar).not.toHaveBeenCalled()
  })

  it('el resto de los grupos sigue habilitado', () => {
    renderPanel()

    expect(screen.getByRole('checkbox', { name: 'Impresionismo' })).toBeEnabled()
  })
})

describe('ChipsFiltrosActivos — chips visibles (RF-13, CA-03.4)', () => {
  function renderChips(filtros: FiltroActivo[]) {
    const onQuitar = vi.fn()
    const onLimpiarTodos = vi.fn()
    const vista = render(
      <ChipsFiltrosActivos filtros={filtros} onQuitar={onQuitar} onLimpiarTodos={onLimpiarTodos} />,
    )
    return { onQuitar, onLimpiarTodos, ...vista }
  }

  it('sin filtros no renderiza nada', () => {
    const { container } = renderChips([])

    expect(container).toBeEmptyDOMElement()
  })

  it('muestra un chip por cada filtro activo', () => {
    renderChips([estilo('impresionismo'), tecnica('oleo'), contenido(TipoContenido.VIDEO)])

    const lista = screen.getByRole('list', { name: /filtros activos/i })
    expect(within(lista).getAllByRole('listitem')).toHaveLength(3)
    expect(within(lista).getByText(/impresionismo/i)).toBeInTheDocument()
    expect(within(lista).getByText(/oleo/i)).toBeInTheDocument()
    expect(within(lista).getByText(/video/i)).toBeInTheDocument()
  })

  it('muestra varios chips del mismo tipo', () => {
    renderChips([estilo('impresionismo'), estilo('surrealismo')])

    expect(screen.getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('ChipsFiltrosActivos — quitar uno (CA-03.4)', () => {
  it('cada chip tiene un botón «Quitar filtro» con nombre accesible', () => {
    render(
      <ChipsFiltrosActivos
        filtros={[estilo('impresionismo'), tecnica('oleo')]}
        onQuitar={vi.fn()}
        onLimpiarTodos={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /quitar filtro.*impresionismo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /quitar filtro.*oleo/i })).toBeInTheDocument()
  })

  it('quitar un chip llama a onQuitar con ese filtro exacto, en un paso', () => {
    const onQuitar = vi.fn()
    render(
      <ChipsFiltrosActivos
        filtros={[estilo('impresionismo'), estilo('surrealismo')]}
        onQuitar={onQuitar}
        onLimpiarTodos={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /quitar filtro.*surrealismo/i }))

    expect(onQuitar).toHaveBeenCalledTimes(1)
    expect(onQuitar.mock.calls[0][0].equals(estilo('surrealismo'))).toBe(true)
  })

  it('el botón de quitar es alcanzable con el teclado', () => {
    render(
      <ChipsFiltrosActivos
        filtros={[tecnica('oleo')]}
        onQuitar={vi.fn()}
        onLimpiarTodos={vi.fn()}
      />,
    )
    const boton = screen.getByRole('button', { name: /quitar filtro.*oleo/i })

    boton.focus()

    expect(boton).toHaveFocus()
  })
})

describe('ChipsFiltrosActivos — limpiar todos (RF-14, CA-03.5)', () => {
  it('muestra «Limpiar todos» cuando hay filtros', () => {
    render(
      <ChipsFiltrosActivos
        filtros={[estilo('impresionismo')]}
        onQuitar={vi.fn()}
        onLimpiarTodos={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /limpiar todos/i })).toBeInTheDocument()
  })

  it('un clic llama a onLimpiarTodos una sola vez', () => {
    const onLimpiarTodos = vi.fn()
    const onQuitar = vi.fn()
    render(
      <ChipsFiltrosActivos
        filtros={[estilo('impresionismo'), tecnica('oleo')]}
        onQuitar={onQuitar}
        onLimpiarTodos={onLimpiarTodos}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /limpiar todos/i }))

    expect(onLimpiarTodos).toHaveBeenCalledTimes(1)
    expect(onQuitar).not.toHaveBeenCalled()
  })

  it('no se muestra sin filtros', () => {
    render(<ChipsFiltrosActivos filtros={[]} onQuitar={vi.fn()} onLimpiarTodos={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /limpiar todos/i })).not.toBeInTheDocument()
  })
})
