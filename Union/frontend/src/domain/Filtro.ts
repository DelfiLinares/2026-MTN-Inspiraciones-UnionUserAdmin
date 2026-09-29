import { TipoFiltro } from './enums/TipoFiltro'
import { TipoContenido } from './enums/TipoContenido'

export interface FiltroProps {
  texto?: string
  estilo?: string
  tecnica?: string
  tipoContenido?: TipoContenido
  distanciaKm?: number
  geolocalizacionActiva: boolean
}

/**
 * Entidad de dominio Filtro (UI Domain - frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md
 * - Union/specs/001-plataforma-unificada/tasks.md (T018, T028)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-40, RF-42, RF-45)
 */
export class Filtro {
  readonly texto?: string
  readonly estilo?: string
  readonly tecnica?: string
  readonly tipoContenido?: TipoContenido
  readonly distanciaKm?: number
  readonly geolocalizacionActiva: boolean

  constructor(props: FiltroProps) {
    this.texto = props.texto
    this.estilo = props.estilo
    this.tecnica = props.tecnica
    this.tipoContenido = props.tipoContenido
    this.distanciaKm = props.distanciaKm
    this.geolocalizacionActiva = props.geolocalizacionActiva
  }

  distanciaHabilitada(): boolean {
    return this.geolocalizacionActiva === true
  }

  activos(): { tipo: TipoFiltro; valor: string }[] {
    const listado: { tipo: TipoFiltro; valor: string }[] = []

    if (this.estilo !== undefined && this.estilo !== '') {
      listado.push({ tipo: TipoFiltro.ESTILO, valor: this.estilo })
    }
    if (this.tecnica !== undefined && this.tecnica !== '') {
      listado.push({ tipo: TipoFiltro.TECNICA, valor: this.tecnica })
    }
    if (this.tipoContenido !== undefined) {
      listado.push({ tipo: TipoFiltro.TIPO_ARTE, valor: this.tipoContenido })
    }
    if (this.distanciaKm !== undefined && this.distanciaHabilitada()) {
      listado.push({ tipo: TipoFiltro.DISTANCIA, valor: `${this.distanciaKm} km` })
    }

    return listado
  }

  aQueryParams(): Record<string, string> {
    const params: Record<string, string> = {}

    if (this.texto !== undefined && this.texto !== '') {
      params.texto = this.texto
    }
    if (this.estilo !== undefined && this.estilo !== '') {
      params.estilo = this.estilo
    }
    if (this.tecnica !== undefined && this.tecnica !== '') {
      params.tecnica = this.tecnica
    }
    if (this.tipoContenido !== undefined) {
      params.tipo_arte = this.tipoContenido
    }
    if (this.distanciaKm !== undefined && this.distanciaHabilitada()) {
      params.distancia = String(this.distanciaKm)
    }

    return params
  }

  quitar(tipo: TipoFiltro): Filtro {
    return new Filtro({
      texto: this.texto,
      estilo: tipo === TipoFiltro.ESTILO ? undefined : this.estilo,
      tecnica: tipo === TipoFiltro.TECNICA ? undefined : this.tecnica,
      tipoContenido: tipo === TipoFiltro.TIPO_ARTE ? undefined : this.tipoContenido,
      distanciaKm: tipo === TipoFiltro.DISTANCIA ? undefined : this.distanciaKm,
      geolocalizacionActiva: this.geolocalizacionActiva,
    })
  }
}
