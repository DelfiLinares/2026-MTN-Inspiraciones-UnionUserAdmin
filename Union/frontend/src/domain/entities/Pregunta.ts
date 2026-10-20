import { OpcionRespuesta } from './OpcionRespuesta';

/**
 * Pregunta
 * 
 * Entity que representa una pregunta del cuestionario de intereses.
 * 
 * Invariantes:
 * - id es único dentro del cuestionario.
 * - texto es la pregunta a mostrar.
 * - opciones contiene al menos una OpcionRespuesta.
 * - permiteMultipleSelecciones indica si pueden seleccionarse varias opciones.
 * - obligatoria indica si debe responderse (RF-05).
 */
export class Pregunta {
  readonly id: string;
  readonly texto: string;
  readonly opciones: readonly OpcionRespuesta[];
  readonly permiteMultipleSelecciones: boolean;
  readonly obligatoria: boolean;

  private constructor(
    id: string,
    texto: string,
    opciones: OpcionRespuesta[],
    permiteMultipleSelecciones: boolean,
    obligatoria: boolean = true
  ) {
    this.id = id;
    this.texto = texto;
    this.opciones = Object.freeze([...opciones]);
    this.permiteMultipleSelecciones = permiteMultipleSelecciones;
    this.obligatoria = obligatoria;
    this.validarInvariantes();
  }

  /**
   * Factory method para crear una pregunta con validación completa.
   */
  static crear(
    id: string,
    texto: string,
    opciones: OpcionRespuesta[],
    permiteMultipleSelecciones: boolean,
    obligatoria: boolean = true
  ): Pregunta {
    return new Pregunta(id, texto, opciones, permiteMultipleSelecciones, obligatoria);
  }

  /**
   * Factory method para crear una pregunta sin validación (uso en tests/internos).
   */
  static fromValues(
    id: string,
    texto: string,
    opciones: OpcionRespuesta[],
    permiteMultipleSelecciones: boolean,
    obligatoria: boolean = true
  ): Pregunta {
    return new Pregunta(id, texto, opciones, permiteMultipleSelecciones, obligatoria);
  }

  /**
   * Valida los invariantes de construcción.
   * @throws Error si algún invariante no se cumple.
   */
  private validarInvariantes(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Pregunta: id es requerido y no puede estar vacío');
    }
    if (!this.texto || this.texto.trim().length === 0) {
      throw new Error('Pregunta: texto es requerido y no puede estar vacío');
    }
    if (this.opciones.length === 0) {
      throw new Error('Pregunta: debe tener al menos una opción');
    }
    if (!this.opciones.every(op => op.esValida())) {
      throw new Error('Pregunta: todas las opciones deben ser válidas');
    }
    // Validar que no haya opciones duplicadas por ID
    const idsUnicos = new Set(this.opciones.map(op => op.id));
    if (idsUnicos.size !== this.opciones.length) {
      throw new Error('Pregunta: las opciones deben tener IDs únicos');
    }
  }

  /**
   * Valida que las opciones seleccionadas pertenecen al catálogo de opciones.
   * @param idsSeleccionados IDs de opciones seleccionadas
   * @returns true si todas las IDs son válidas
   */
  private validarSeleccion(idsSeleccionados: string[]): boolean {
    const idsValidos = new Set(this.opciones.map(op => op.id));
    return idsSeleccionados.every(id => idsValidos.has(id));
  }

  /**
   * Valida que no se supera el límite de selecciones permitidas.
   * @param idsSeleccionados IDs de opciones seleccionadas
   * @returns true si cumple la multiplicidad
   */
  private validarMultiplicidad(idsSeleccionados: string[]): boolean {
    if (!this.permiteMultipleSelecciones && idsSeleccionados.length > 1) {
      return false;
    }
    return true;
  }

  /**
   * Valida que se cumple con la obligatoriedad.
   * @param idsSeleccionados IDs de opciones seleccionadas
   * @returns true si cumple obligatoriedad
   */
  private validarObligatoriedad(idsSeleccionados: string[]): boolean {
    if (this.obligatoria && idsSeleccionados.length === 0) {
      return false;
    }
    return true;
  }

  /**
   * Valida la respuesta del usuario de forma completa.
   * @param idsSeleccionados IDs de opciones seleccionadas por el usuario
   * @returns objeto con validez y mensaje de error opcional
   */
  validarRespuesta(idsSeleccionados: string[]): { valida: boolean; error?: string } {
    if (!Array.isArray(idsSeleccionados)) {
      return { valida: false, error: 'idsSeleccionados debe ser un array' };
    }

    if (!this.validarSeleccion(idsSeleccionados)) {
      return { valida: false, error: 'Opciones seleccionadas no válidas' };
    }

    if (!this.validarMultiplicidad(idsSeleccionados)) {
      return { valida: false, error: 'Solo se permite una opción' };
    }

    if (!this.validarObligatoriedad(idsSeleccionados)) {
      return { valida: false, error: 'Esta pregunta es obligatoria' };
    }

    return { valida: true };
  }

  /**
   * Obtiene una opción por su ID.
   * @param id ID de la opción
   * @returns La opción si existe, undefined en caso contrario
   */
  obtenerOpcion(id: string): OpcionRespuesta | undefined {
    return this.opciones.find(op => op.id === id);
  }

  /**
   * Retorna una representación en string de la pregunta.
   */
  toString(): string {
    return `Pregunta(${this.id}: "${this.texto}", ${this.opciones.length} opciones)`;
  }

  /**
   * Compara dos preguntas por valor.
   */
  equals(otra: Pregunta): boolean {
    if (!otra) return false;
    if (this.id !== otra.id) return false;
    if (this.texto !== otra.texto) return false;
    if (this.permiteMultipleSelecciones !== otra.permiteMultipleSelecciones) return false;
    if (this.obligatoria !== otra.obligatoria) return false;
    if (this.opciones.length !== otra.opciones.length) return false;
    return this.opciones.every((op, index) => op.equals(otra.opciones[index]));
  }
}
