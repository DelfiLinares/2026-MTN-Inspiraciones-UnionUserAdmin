import { TipoContenido } from '../enums/TipoContenido'
import { EstadoPublicacion } from '../enums/EstadoPublicacion'

export interface AutorResumen {
  readonly id: string
  readonly nombre: string
}

export interface PublicacionResumenProps {
  id: string
  titulo: string
  autor: AutorResumen
  miniaturaUrl: string
  tipoContenido: TipoContenido
  estado: EstadoPublicacion
}

/**
 * Datos de solo lectura que muestra la tarjeta de una publicación (módulo 007).
 *
 * No incluye likes, edición ni borrado: el módulo es de solo lectura.
 * Las dimensiones de la imagen (ancho/alto) están pendientes de definir con el backend
 * y por eso no forman parte de este tipo todavía.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/data-model.md (PublicacionResumen)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T016)
 */
export class PublicacionResumen {
  readonly id: string
  readonly titulo: string
  readonly autor: AutorResumen
  readonly miniaturaUrl: string
  readonly tipoContenido: TipoContenido
  readonly estado: EstadoPublicacion

  constructor(props: PublicacionResumenProps) {
    this.id = props.id
    this.titulo = props.titulo
    this.autor = Object.freeze({ id: props.autor.id, nombre: props.autor.nombre })
    this.miniaturaUrl = props.miniaturaUrl
    this.tipoContenido = props.tipoContenido
    this.estado = props.estado
    Object.freeze(this)
  }
}
