import { RangoFechas } from './RangoFechas'
import { AmbitoDesafio } from './AmbitoDesafio'
import { Foto } from './Foto'

export type TipoContenidoRespuesta = 'imagen' | 'video' | 'audio'

export interface DesafioProps {
  id?: string
  titulo?: string
  descripcion?: string
  activo?: boolean
  completadoPorUsuarioActual?: boolean
  // Campos para T053 (FormularioDesafio)
  nombre?: string
  descripcionLarga?: string
  fotos?: Foto[]
  rango?: RangoFechas
  ambitos?: AmbitoDesafio[]
  eliminado?: boolean
  tieneRespuestas?: boolean
  version?: number
  // Campos para T055 (FormularioRespuesta, A-22)
  formatosContenidoAceptados?: TipoContenidoRespuesta[]
}

/**
 * Entidad de dominio Desafio (UI Domain - frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/data-model.md (T020, T030)
 * - Union/specs/003-desafios/data-model.md (T013, validación y métodos)
 * - Union/specs/003-desafios/tasks.md (T053, FormularioDesafio; T055, A-22)
 */
export class Desafio {
  readonly id?: string
  readonly titulo?: string
  readonly descripcion?: string
  readonly activo?: boolean
  readonly completadoPorUsuarioActual?: boolean
  // Campos para T053
  readonly nombre?: string
  readonly descripcionLarga?: string
  readonly fotos?: Foto[]
  readonly rango?: RangoFechas
  readonly ambitos?: AmbitoDesafio[]
  readonly eliminado?: boolean
  readonly tieneRespuestas?: boolean
  readonly version?: number
  // Campo para T055 (A-22): tipos de contenido aceptados en respuestas
  readonly formatosContenidoAceptados?: TipoContenidoRespuesta[]

  constructor(props: DesafioProps) {
    this.id = props.id
    this.titulo = props.titulo
    this.descripcion = props.descripcion
    this.activo = props.activo
    this.completadoPorUsuarioActual = props.completadoPorUsuarioActual
    this.nombre = props.nombre
    this.descripcionLarga = props.descripcionLarga
    this.fotos = props.fotos
    this.rango = props.rango
    this.ambitos = props.ambitos
    this.eliminado = props.eliminado
    this.tieneRespuestas = props.tieneRespuestas
    this.version = props.version
    this.formatosContenidoAceptados = props.formatosContenidoAceptados
  }

  /**
   * Determina si el usuario actual puede participar en el desafío.
   * Requiere autenticado = true.
   */
  puedeParticiparUsuarioActual(autenticado: boolean): boolean {
    return Boolean(autenticado)
  }

  /**
   * Valida los datos del desafío para T053 (FormularioDesafio).
   * 
   * Devuelve un objeto con errores por campo:
   * - nombre: requerido, longitud provisional hasta A-11
   * - descripcionLarga: requerido, longitud provisional hasta A-11
   * - fotos: entre 1 y 5, formato JPEG/PNG, una principal
   * - rango: fin posterior a inicio (RF-03)
   * - ambitos: al menos uno (RF-04, CB-12)
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.1, método validar)
   * Reglas: HU-01, RF-02, RF-03, RF-04, CB-11, CB-12, A-11
   */
  validar(): Record<string, string> {
    const errores: Record<string, string> = {}

    // Validar nombre
    if (!this.nombre || this.nombre.trim() === '') {
      errores.nombre = 'El nombre es requerido'
    }

    // Validar descripcionLarga
    if (!this.descripcionLarga || this.descripcionLarga.trim() === '') {
      errores.descripcionLarga = 'La descripción es requerida'
    }

    // Validar fotos: entre 1 y 5
    if (!this.fotos || this.fotos.length === 0) {
      errores.fotos = 'Se requiere al menos una foto (JPEG o PNG)'
    } else if (this.fotos.length > 5) {
      errores.fotos = 'Se permiten máximo 5 fotos'
    } else {
      // Validar formato de cada foto
      const formatosInvalidos = this.fotos.some(
        foto => foto.formato !== 'JPEG' && foto.formato !== 'PNG'
      )
      if (formatosInvalidos) {
        errores.fotos = 'Las fotos deben ser JPEG o PNG'
      }

      // Validar exactamente una foto principal
      const fotasPrincipales = this.fotos.filter(f => f.principal)
      if (fotasPrincipales.length === 0) {
        errores.fotos = 'Se requiere marcar una foto como principal'
      } else if (fotasPrincipales.length > 1) {
        errores.fotos = 'Solo puede haber una foto principal'
      }
    }

    // Validar rango de fechas
    if (this.rango) {
      const rangoErrores = this.rango.validar()
      Object.assign(errores, rangoErrores)
    } else {
      errores.rango = 'Las fechas son requeridas'
    }

    // Validar ámbitos: al menos uno
    if (!this.ambitos || this.ambitos.length === 0) {
      errores.ambitos = 'Se requiere seleccionar al menos un ámbito'
    }

    return errores
  }
}
