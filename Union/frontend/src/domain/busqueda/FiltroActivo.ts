import { TipoFiltro } from '../enums/TipoFiltro'
import { TipoContenido } from '../enums/TipoContenido'
import { RangoDistancia } from '../enums/RangoDistancia'

/**
 * Value object inmutable: un filtro activo de la búsqueda (tipo + valor).
 *
 * Invariantes:
 * - El valor no puede ser vacío ni solo espacios.
 * - DISTANCIA solo acepta rangos cerrados (KM_5, KM_25, KM_100). CUALQUIERA equivale a
 *   no filtrar, por lo que no se puede crear como filtro activo.
 * - TIPO_CONTENIDO solo acepta valores de `TipoContenido`.
 * - La igualdad es por (tipo, valor).
 *
 * Los valores de ESTILO, TECNICA y TIPO_ARTE provienen del catálogo de la API; el dominio
 * solo exige que no estén vacíos.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/data-model.md (FiltroActivo)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T014)
 */
const RANGOS_DISTANCIA_ADMITIDOS: readonly string[] = [
  RangoDistancia.KM_5,
  RangoDistancia.KM_25,
  RangoDistancia.KM_100,
]

const VALORES_TIPO_CONTENIDO: readonly string[] = Object.values(TipoContenido)

export class FiltroActivo {
  readonly tipo: TipoFiltro
  readonly valor: string

  constructor(tipo: TipoFiltro, valor: string) {
    if (typeof valor !== 'string' || valor.trim() === '') {
      throw new Error(`El valor del filtro ${tipo} no puede ser vacío.`)
    }

    if (tipo === TipoFiltro.DISTANCIA && !RANGOS_DISTANCIA_ADMITIDOS.includes(valor)) {
      throw new Error(`Rango de distancia no admitido: ${valor}.`)
    }

    if (tipo === TipoFiltro.TIPO_CONTENIDO && !VALORES_TIPO_CONTENIDO.includes(valor)) {
      throw new Error(`Tipo de contenido no admitido: ${valor}.`)
    }

    this.tipo = tipo
    this.valor = valor
    Object.freeze(this)
  }

  equals(otro: FiltroActivo): boolean {
    return this.tipo === otro.tipo && this.valor === otro.valor
  }
}
