import { RangoFechas } from './RangoFechas'
import { AmbitoDesafio } from './AmbitoDesafio'
import { Foto } from './Foto'

export type EstadoSolicitudDesafio = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA'

export interface SolicitudDesafioProps {
  id?: string
  autorId?: string
  nombre?: string
  descripcionLarga?: string
  fotos?: Foto[]
  rango?: RangoFechas
  ambitos?: AmbitoDesafio[]
  estado?: EstadoSolicitudDesafio
  version?: number
}

/**
 * Entidad de dominio SolicitudDesafio (T014, T054)
 *
 * Representa una propuesta de desafío presentada por un usuario.
 * Tiene los mismos campos que un Desafio (A-08): nombre, descripción, fotos, fechas, ámbitos.
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/data-model.md (sección 4.2)
 * - Union/specs/003-desafios/spec.md (A-08, RF-07, RF-08)
 * - Union/specs/003-desafios/tasks.md (T014, T054)
 */
export class SolicitudDesafio {
  readonly id?: string
  readonly autorId?: string
  readonly nombre?: string
  readonly descripcionLarga?: string
  readonly fotos?: Foto[]
  readonly rango?: RangoFechas
  readonly ambitos?: AmbitoDesafio[]
  readonly estado?: EstadoSolicitudDesafio
  readonly version?: number

  constructor(props: SolicitudDesafioProps) {
    this.id = props.id
    this.autorId = props.autorId
    this.nombre = props.nombre
    this.descripcionLarga = props.descripcionLarga
    this.fotos = props.fotos
    this.rango = props.rango
    this.ambitos = props.ambitos
    this.estado = props.estado ?? 'PENDIENTE'
    this.version = props.version
  }

  /**
   * Valida los datos de la solicitud usando las mismas reglas que Desafio (A-08).
   * 
   * Devuelve un objeto con errores por campo:
   * - nombre: requerido, longitud provisional hasta A-11
   * - descripcionLarga: requerido, longitud provisional hasta A-11
   * - fotos: entre 1 y 5, formato JPEG/PNG, una principal
   * - rango: fin posterior a inicio (RF-03)
   * - ambitos: al menos uno (RF-04, CB-12)
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.2, método validar)
   * Reglas: HU-04, RF-02, RF-03, RF-04, RF-07, CB-11, CB-12, A-08, A-11
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

  /**
   * Aprueba la solicitud (solo desde PENDIENTE).
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.2, método aprobar)
   * Reglas: HU-06, RF-09, CB-06, A-03
   */
  aprobar(): SolicitudDesafio {
    if (this.estado !== 'PENDIENTE') {
      throw new Error(`No se puede aprobar una solicitud en estado ${this.estado}`)
    }
    return new SolicitudDesafio({
      ...this,
      estado: 'APROBADA',
    })
  }

  /**
   * Rechaza la solicitud (solo desde PENDIENTE).
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.2, método rechazar)
   * Reglas: HU-06, RF-09, CB-06
   */
  rechazar(): SolicitudDesafio {
    if (this.estado !== 'PENDIENTE') {
      throw new Error(`No se puede rechazar una solicitud en estado ${this.estado}`)
    }
    return new SolicitudDesafio({
      ...this,
      estado: 'RECHAZADA',
    })
  }

  /**
   * Determina si el usuario actual puede editar la solicitud.
   * Solo el autor o un ADMIN pueden editar.
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.2, método puedeEditarPor)
   * Reglas: HU-05, HU-07, RF-10, RF-11, A-04
   */
  puedeEditarPor(sesion: { usuarioId: string; rol: 'USER' | 'ADMIN' }): boolean {
    return sesion.rol === 'ADMIN' || sesion.usuarioId === this.autorId
  }

  /**
   * Determina si el usuario actual puede eliminar la solicitud.
   * El autor o un ADMIN pueden eliminar.
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.2, método puedeEliminarPor)
   * Reglas: HU-05, HU-07, RF-10, RF-11
   */
  puedeEliminarPor(sesion: { usuarioId: string; rol: 'USER' | 'ADMIN' }): boolean {
    return sesion.rol === 'ADMIN' || sesion.usuarioId === this.autorId
  }

  /**
   * Determina si la solicitud está resuelta (aprobada o rechazada).
   * Se usa para ocultar acciones pendientes de A-04.
   * 
   * Fuente: specs/003-desafios/data-model.md (sección 4.2, método estaResuelta)
   * Reglas: CB-06, A-04
   */
  estaResuelta(): boolean {
    return this.estado === 'APROBADA' || this.estado === 'RECHAZADA'
  }
}
