/**
 * Value object RangoFechas
 * 
 * Representa un rango de fechas con una fecha de inicio y una fecha de fin.
 * Invariante: la fecha de fin debe ser posterior a la fecha de inicio.
 * 
 * Fuente: specs/003-desafios/data-model.md (sección 3.1)
 */

export type EstadoDesafio = 'PROGRAMADO' | 'ACTIVO' | 'FINALIZADO' | 'ELIMINADO'

export interface RangoFechasProps {
  inicio: Date
  fin: Date
}

export class RangoFechas {
  readonly inicio: Date
  readonly fin: Date

  constructor(props: RangoFechasProps) {
    this.inicio = props.inicio
    this.fin = props.fin
  }

  /**
   * Valida que fin sea posterior a inicio.
   * Devuelve un objeto con errores por campo si no cumple.
   */
  validar(): Record<string, string> {
    const errores: Record<string, string> = {}

    if (this.fin <= this.inicio) {
      errores.fin = 'La fecha de fin debe ser posterior a la fecha de inicio'
    }

    return errores
  }

  /**
   * Determina el estado del desafío según la fecha actual.
   * 
   * - PROGRAMADO: si ahora < inicio
   * - ACTIVO: si inicio <= ahora < fin
   * - FINALIZADO: si ahora >= fin
   * 
   * Nota: La frontera exacta del estado ACTIVO está pendiente de A-16.
   */
  estado(ahora: Date): Exclude<EstadoDesafio, 'ELIMINADO'> {
    if (ahora < this.inicio) {
      return 'PROGRAMADO'
    }
    if (ahora >= this.fin) {
      return 'FINALIZADO'
    }
    return 'ACTIVO'
  }
}
