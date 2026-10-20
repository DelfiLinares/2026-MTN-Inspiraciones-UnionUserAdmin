import { FiltroActivo } from './FiltroActivo'
import { TipoFiltro } from '../enums/TipoFiltro'
import { OrigenFeed } from '../enums/OrigenFeed'

/**
 * Contexto necesario para decidir si un filtro puede aplicarse.
 * `ubicacionConcedida` indica si el usuario concedió su ubicación (necesaria para DISTANCIA).
 */
export interface ContextoCriterios {
  readonly ubicacionConcedida: boolean
}

// Valores definidos en la spec (clarify A-07/A-08). T075 los centralizará en `constantes.ts`.
const MIN_CARACTERES = 2
const MAX_CARACTERES = 100

function normalizarTexto(texto: string): string {
  const colapsado = (texto ?? '').replace(/\s+/g, ' ').trim()
  return colapsado.slice(0, MAX_CARACTERES).trimEnd()
}

/**
 * Value object inmutable: texto de búsqueda normalizado + filtros activos.
 *
 * Encapsula las reglas del módulo 007:
 * - Normalización del texto (recorte, colapso de espacios, máximo 100 caracteres).
 * - `origen()`: BUSQUEDA si el texto es buscable (≥ 2 caracteres); en otro caso FYP.
 * - Combinación de filtros: OR entre valores del mismo tipo; AND entre tipos y con el texto.
 * - Sin filtros duplicados; quitar uno, quitar por tipo y limpiar todos.
 * - DISTANCIA solo se admite con ubicación concedida.
 *
 * No conoce query params (ver `CodecCriteriosUrl`) ni cómo se envían a la API.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/data-model.md (CriteriosBusqueda)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T015)
 */
export class CriteriosBusqueda {
  readonly texto: string
  readonly filtros: readonly FiltroActivo[]

  private constructor(texto: string, filtros: readonly FiltroActivo[]) {
    this.texto = texto
    this.filtros = Object.freeze([...filtros])
    Object.freeze(this)
  }

  static vacio(): CriteriosBusqueda {
    return new CriteriosBusqueda('', [])
  }

  esVacio(): boolean {
    return this.texto === '' && this.filtros.length === 0
  }

  esBuscable(): boolean {
    return this.texto.length >= MIN_CARACTERES
  }

  origen(): OrigenFeed {
    return this.esBuscable() ? OrigenFeed.BUSQUEDA : OrigenFeed.FYP
  }

  admiteFiltro(tipo: TipoFiltro, contexto: ContextoCriterios): boolean {
    if (tipo === TipoFiltro.DISTANCIA) {
      return contexto.ubicacionConcedida === true
    }
    return true
  }

  valoresDe(tipo: TipoFiltro): string[] {
    return this.filtros.filter((filtro) => filtro.tipo === tipo).map((filtro) => filtro.valor)
  }

  tiposActivos(): TipoFiltro[] {
    const tipos: TipoFiltro[] = []
    for (const filtro of this.filtros) {
      if (!tipos.includes(filtro.tipo)) {
        tipos.push(filtro.tipo)
      }
    }
    return tipos
  }

  conTexto(texto: string): CriteriosBusqueda {
    return new CriteriosBusqueda(normalizarTexto(texto), this.filtros)
  }

  limpiarTexto(): CriteriosBusqueda {
    return new CriteriosBusqueda('', this.filtros)
  }

  conFiltro(filtro: FiltroActivo, contexto?: ContextoCriterios): CriteriosBusqueda {
    if (!this.admiteFiltro(filtro.tipo, contexto ?? { ubicacionConcedida: false })) {
      throw new Error(`El filtro ${filtro.tipo} no puede aplicarse sin ubicación concedida.`)
    }
    if (this.filtros.some((existente) => existente.equals(filtro))) {
      return this
    }
    return new CriteriosBusqueda(this.texto, [...this.filtros, filtro])
  }

  sinFiltro(filtro: FiltroActivo): CriteriosBusqueda {
    return new CriteriosBusqueda(
      this.texto,
      this.filtros.filter((existente) => !existente.equals(filtro)),
    )
  }

  sinFiltrosDeTipo(tipo: TipoFiltro): CriteriosBusqueda {
    return new CriteriosBusqueda(
      this.texto,
      this.filtros.filter((filtro) => filtro.tipo !== tipo),
    )
  }

  limpiarFiltros(): CriteriosBusqueda {
    return new CriteriosBusqueda(this.texto, [])
  }

  /**
   * Dos criterios son equivalentes si tienen el mismo texto y el mismo conjunto de filtros
   * (sin importar el orden). Sirve para detectar cambios que reinician la paginación.
   */
  equivale(otros: CriteriosBusqueda): boolean {
    if (this.texto !== otros.texto || this.filtros.length !== otros.filtros.length) {
      return false
    }
    return this.filtros.every((filtro) => otros.filtros.some((otro) => otro.equals(filtro)))
  }
}
