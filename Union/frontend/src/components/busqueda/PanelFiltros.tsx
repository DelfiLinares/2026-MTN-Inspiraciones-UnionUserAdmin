import type { CatalogoFiltros } from '../../domain/busqueda/CatalogoFiltros'
import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import type { ErrorBusqueda } from '../../domain/busqueda/ErrorBusqueda'
import { FiltroActivo } from '../../domain/busqueda/FiltroActivo'
import { TipoContenido } from '../../domain/enums/TipoContenido'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'
import { ControlDistancia } from './ControlDistancia'
import { SelectorFiltroCatalogo } from './SelectorFiltroCatalogo'
import './busqueda.css'

export interface PanelFiltrosProps {
  criterios: CriteriosBusqueda
  catalogo: CatalogoFiltros | null
  errorCatalogo?: ErrorBusqueda | null
  onAplicar: (filtro: FiltroActivo) => void
  onQuitar: (filtro: FiltroActivo) => void
  onReintentarCatalogo: () => void
}

const TIPOS_CONTENIDO = [
  { valor: TipoContenido.TEXTO, etiqueta: 'Texto' },
  { valor: TipoContenido.MIXTO, etiqueta: 'Mixto' },
  { valor: TipoContenido.IMAGEN, etiqueta: 'Imagen' },
  { valor: TipoContenido.VIDEO, etiqueta: 'Video' },
  { valor: TipoContenido.MUSICA, etiqueta: 'Música' },
  { valor: TipoContenido.TUTORIAL, etiqueta: 'Tutorial' },
  { valor: TipoContenido.ESCULTURA, etiqueta: 'Escultura' },
  { valor: TipoContenido.DIGITAL, etiqueta: 'Digital' },
]

const GRUPOS_DE_CATALOGO = [
  { tipo: TipoFiltro.ESTILO, titulo: 'Estilo' },
  { tipo: TipoFiltro.TECNICA, titulo: 'Técnica' },
  { tipo: TipoFiltro.TIPO_ARTE, titulo: 'Tipo de arte' },
] as const

/**
 * Panel de filtros (HU-03). Solo consulta al dominio y notifica las acciones;
 * no contiene reglas. DISTANCIA se muestra deshabilitada mientras el dominio no
 * admita el filtro (A-02) y nunca se aplica desde aquí.
 */
export function PanelFiltros({
  criterios,
  catalogo,
  errorCatalogo = null,
  onAplicar,
  onQuitar,
  onReintentarCatalogo,
}: PanelFiltrosProps) {
  const cambiar = (tipo: TipoFiltro) => (valor: string, marcado: boolean) => {
    const filtro = new FiltroActivo(tipo, valor)
    if (marcado) onAplicar(filtro)
    else onQuitar(filtro)
  }

  return (
    <section className="panel-filtros" aria-label="Filtros">
      {errorCatalogo ? (
        <div role="alert" className="panel-filtros__error">
          <p>No pudimos cargar los filtros. Intentá de nuevo.</p>
          <button type="button" onClick={onReintentarCatalogo}>
            Reintentar
          </button>
        </div>
      ) : null}

      {catalogo
        ? GRUPOS_DE_CATALOGO.map(({ tipo, titulo }) => (
            <SelectorFiltroCatalogo
              key={tipo}
              titulo={titulo}
              opciones={catalogo.opcionesDe(tipo)}
              seleccionados={criterios.valoresDe(tipo)}
              onCambiar={cambiar(tipo)}
            />
          ))
        : null}

      <SelectorFiltroCatalogo
        titulo="Tipo de contenido"
        opciones={TIPOS_CONTENIDO}
        seleccionados={criterios.valoresDe(TipoFiltro.TIPO_CONTENIDO)}
        onCambiar={cambiar(TipoFiltro.TIPO_CONTENIDO)}
      />

      <ControlDistancia
        criterios={criterios}
        onAplicar={onAplicar}
        onQuitar={onQuitar}
      />
    </section>
  )
}
