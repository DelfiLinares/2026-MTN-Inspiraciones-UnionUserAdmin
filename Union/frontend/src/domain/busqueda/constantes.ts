import { RangoDistancia } from '../enums/RangoDistancia'

/** Tamaño de página que pide el cliente (RF-20). */
export const TAMANO_PAGINA = 20
/** Espera (ms) tras la última pulsación antes de buscar. */
export const DEBOUNCE_MS = 400
/** Mínimo de caracteres (normalizados) para que el texto sea buscable. */
export const MIN_CARACTERES = 2
/** Máximo de caracteres del texto de búsqueda. */
export const MAX_CARACTERES = 100

const KM_POR_RANGO: Readonly<Record<RangoDistancia, number | null>> = Object.freeze({
  [RangoDistancia.KM_5]: 5,
  [RangoDistancia.KM_25]: 25,
  [RangoDistancia.KM_100]: 100,
  [RangoDistancia.CUALQUIERA]: null,
})

/** Km del rango; `null` para CUALQUIERA (no se filtra ni se envía). */
export function rangoAKm(rango: RangoDistancia): number | null {
  return KM_POR_RANGO[rango]
}

/** Rango correspondiente a un valor en km; `null` si no es 5, 25 o 100. */
export function kmARango(km: number): RangoDistancia | null {
  switch (km) {
    case 5:
      return RangoDistancia.KM_5
    case 25:
      return RangoDistancia.KM_25
    case 100:
      return RangoDistancia.KM_100
    default:
      return null
  }
}
