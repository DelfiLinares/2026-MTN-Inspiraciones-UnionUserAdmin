import { TipoFiltro } from '../enums/TipoFiltro'

export interface OpcionFiltro {
  readonly valor: string
  readonly etiqueta: string
}

/** Tipos cuyo catálogo de valores provee la API (catálogo dinámico, clarify A-03). */
export type TipoFiltroDeCatalogo = TipoFiltro.ESTILO | TipoFiltro.TECNICA | TipoFiltro.TIPO_ARTE

export interface CatalogoFiltrosProps {
  estilos: readonly OpcionFiltro[]
  tecnicas: readonly OpcionFiltro[]
  tiposArte: readonly OpcionFiltro[]
}

/**
 * Catálogo de valores posibles de los filtros ESTILO, TECNICA y TIPO_ARTE (módulo 007).
 * TIPO_CONTENIDO y DISTANCIA son cerrados en el cliente (enums) y no forman parte del catálogo.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/data-model.md (CatalogoFiltros)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T016)
 */
export class CatalogoFiltros {
  readonly estilos: readonly OpcionFiltro[]
  readonly tecnicas: readonly OpcionFiltro[]
  readonly tiposArte: readonly OpcionFiltro[]

  constructor(props: CatalogoFiltrosProps) {
    this.estilos = congelar(props.estilos)
    this.tecnicas = congelar(props.tecnicas)
    this.tiposArte = congelar(props.tiposArte)
    Object.freeze(this)
  }

  opcionesDe(tipo: TipoFiltroDeCatalogo): readonly OpcionFiltro[] {
    switch (tipo) {
      case TipoFiltro.ESTILO:
        return this.estilos
      case TipoFiltro.TECNICA:
        return this.tecnicas
      case TipoFiltro.TIPO_ARTE:
        return this.tiposArte
    }
  }
}

function congelar(opciones: readonly OpcionFiltro[]): readonly OpcionFiltro[] {
  return Object.freeze(opciones.map((o) => Object.freeze({ valor: o.valor, etiqueta: o.etiqueta })))
}
