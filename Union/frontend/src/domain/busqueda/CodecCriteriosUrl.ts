import { CriteriosBusqueda, type ContextoCriterios } from './CriteriosBusqueda'
import { FiltroActivo } from './FiltroActivo'
import { kmARango, rangoAKm } from './constantes'
import { RangoDistancia } from '../enums/RangoDistancia'
import { TipoFiltro } from '../enums/TipoFiltro'

/**
 * Codec criterios ⇄ query params (T070; HU-07, RF-24; research §5).
 *
 *   ?q=texto&estilo=a,b&tecnica=x&tipoArte=y&tipoContenido=IMAGEN&distancia=25
 *
 * - Serializa solo lo presente; varios valores del mismo tipo van separados por coma.
 * - `distancia` va en km (KM_25 ⇄ 25).
 * - Al parsear, lo inválido se ignora sin lanzar error; el texto se normaliza con
 *   `CriteriosBusqueda`; DISTANCIA solo se restaura con ubicación concedida.
 * - La ubicación del usuario, el cursor y cualquier parámetro desconocido nunca forman parte
 *   de los criterios ni de la URL.
 *
 * Capa de dominio, separada de `CriteriosBusqueda` (que no conoce query params).
 */
const PARAM_TEXTO = 'q'

const PARAM_POR_TIPO: Readonly<Record<TipoFiltro, string>> = Object.freeze({
  [TipoFiltro.ESTILO]: 'estilo',
  [TipoFiltro.TECNICA]: 'tecnica',
  [TipoFiltro.TIPO_ARTE]: 'tipoArte',
  [TipoFiltro.TIPO_CONTENIDO]: 'tipoContenido',
  [TipoFiltro.DISTANCIA]: 'distancia',
})

const TIPOS_EN_ORDEN: readonly TipoFiltro[] = [
  TipoFiltro.ESTILO,
  TipoFiltro.TECNICA,
  TipoFiltro.TIPO_ARTE,
  TipoFiltro.TIPO_CONTENIDO,
  TipoFiltro.DISTANCIA,
]

export class CodecCriteriosUrl {
  private constructor() {}

  static serializar(criterios: CriteriosBusqueda): URLSearchParams {
    const params = new URLSearchParams()

    if (criterios.texto !== '') params.set(PARAM_TEXTO, criterios.texto)

    for (const tipo of TIPOS_EN_ORDEN) {
      const valores = criterios.valoresDe(tipo)
      if (valores.length === 0) continue

      if (tipo === TipoFiltro.DISTANCIA) {
        const km = rangoAKm(valores[0] as RangoDistancia)
        if (km !== null) params.set(PARAM_POR_TIPO[tipo], String(km))
        continue
      }
      params.set(PARAM_POR_TIPO[tipo], valores.join(','))
    }

    return params
  }

  static parsear(
    entrada: URLSearchParams | string,
    contexto: ContextoCriterios,
  ): CriteriosBusqueda {
    let params: URLSearchParams
    try {
      params = typeof entrada === 'string' ? new URLSearchParams(entrada) : entrada
    } catch {
      return CriteriosBusqueda.vacio()
    }

    let criterios = CriteriosBusqueda.vacio()

    const texto = params.get(PARAM_TEXTO)
    if (texto !== null) criterios = criterios.conTexto(texto)

    for (const tipo of TIPOS_EN_ORDEN) {
      const bruto = params.get(PARAM_POR_TIPO[tipo])
      if (bruto === null) continue

      if (tipo === TipoFiltro.DISTANCIA) {
        criterios = CodecCriteriosUrl.aplicarDistancia(criterios, bruto, contexto)
        continue
      }

      for (const valor of bruto.split(',')) {
        const limpio = valor.trim()
        if (limpio === '') continue
        try {
          criterios = criterios.conFiltro(new FiltroActivo(tipo, limpio), contexto)
        } catch {
          // Valor inválido: se ignora.
        }
      }
    }

    return criterios
  }

  private static aplicarDistancia(
    criterios: CriteriosBusqueda,
    bruto: string,
    contexto: ContextoCriterios,
  ): CriteriosBusqueda {
    if (!contexto.ubicacionConcedida || !/^\d+$/.test(bruto.trim())) return criterios
    const rango = kmARango(Number(bruto.trim()))
    if (rango === null) return criterios
    try {
      return criterios.conFiltro(new FiltroActivo(TipoFiltro.DISTANCIA, rango), contexto)
    } catch {
      return criterios
    }
  }
}
