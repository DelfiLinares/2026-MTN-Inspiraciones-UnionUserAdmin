import type { CriteriosBusqueda } from '../../domain/busqueda/CriteriosBusqueda'
import { FiltroActivo } from '../../domain/busqueda/FiltroActivo'
import { RangoDistancia } from '../../domain/enums/RangoDistancia'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'
import { SelectorFiltroCatalogo } from './SelectorFiltroCatalogo'

export interface ControlDistanciaProps {
  criterios: CriteriosBusqueda
  onAplicar: (filtro: FiltroActivo) => void
  onQuitar: (filtro: FiltroActivo) => void
}

const RANGOS_DISTANCIA = [
  { valor: RangoDistancia.KM_5, etiqueta: 'Hasta 5 km' },
  { valor: RangoDistancia.KM_25, etiqueta: 'Hasta 25 km' },
  { valor: RangoDistancia.KM_100, etiqueta: 'Hasta 100 km' },
]

export function ControlDistancia({
  criterios,
  onAplicar,
  onQuitar,
}: ControlDistanciaProps) {
  const distanciaAdmitida = criterios.admiteFiltro(TipoFiltro.DISTANCIA, {
    ubicacionConcedida: false,
  })

  return (
    <SelectorFiltroCatalogo
      titulo="Distancia"
      opciones={RANGOS_DISTANCIA}
      seleccionados={criterios.valoresDe(TipoFiltro.DISTANCIA)}
      onCambiar={(valor, marcado) => {
        const filtro = new FiltroActivo(TipoFiltro.DISTANCIA, valor)
        if (marcado) onAplicar(filtro)
        else onQuitar(filtro)
      }}
      deshabilitado={!distanciaAdmitida}
      aviso={
        distanciaAdmitida
          ? undefined
          : 'Necesitamos tu ubicación para filtrar por distancia.'
      }
    />
  )
}
