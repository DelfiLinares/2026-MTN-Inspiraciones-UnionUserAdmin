import { Pregunta } from './Pregunta';

/**
 * RespuestaCuestionario
 *
 * Entity que almacena las respuestas del usuario a todas las preguntas del cuestionario.
 *
 * Diseño inmutable: Todos los métodos que modifican respuestas retornan una nueva instancia.
 *
 * Estructura interna: Map<idPregunta: string, Set<idOpcion: string>>
 *
 * Invariantes:
 * - respuestas es un Map<string, Set<string>>.
 * - Las opciones seleccionadas son validadas contra las preguntas.
 *
 * Requisitos: RF-08, RF-09, RF-13, RF-14, RF-15, RNF-20, RNF-21
 * Referencia: spec.md § 6, data-model.md § 1.3
 */
export class RespuestaCuestionario {
  private readonly _respuestas: Map<string, Set<string>>;

  private constructor(respuestas?: Map<string, Set<string>>) {
    // Crear una copia defensiva del mapa y sus sets
    this._respuestas = respuestas ? new Map(respuestas) : new Map();
  }

  /**
   * Factory method para crear una nueva instancia de RespuestaCuestionario.
   * @param respuestas Map inicial (opcional)
   * @returns Nueva instancia
   */
  static crear(respuestas?: Map<string, Set<string>>): RespuestaCuestionario {
    return new RespuestaCuestionario(respuestas);
  }

  /**
   * Factory method para crear una respuesta vacía.
   * @returns Nueva instancia vacía
   */
  static vacio(): RespuestaCuestionario {
    return new RespuestaCuestionario();
  }

  /**
   * Obtiene las opciones seleccionadas para una pregunta específica.
   * @param idPregunta ID de la pregunta
   * @returns Set de IDs de opciones seleccionadas (vacío si no hay respuesta)
   */
  obtenerRespuesta(idPregunta: string): Set<string> {
    const respuesta = this._respuestas.get(idPregunta);
    return respuesta ? new Set(respuesta) : new Set();
  }

  /**
   * Selecciona una opción para una pregunta (patrón inmutable).
   * Retorna una nueva instancia con la opción seleccionada.
   * @param idPregunta ID de la pregunta
   * @param idOpcion ID de la opción a seleccionar
   * @returns Nueva instancia RespuestaCuestionario con la opción agregada
   */
  seleccionar(idPregunta: string, idOpcion: string): RespuestaCuestionario {
    if (!idPregunta || idPregunta.trim().length === 0) {
      throw new Error('RespuestaCuestionario: idPregunta no puede estar vacío');
    }
    if (!idOpcion || idOpcion.trim().length === 0) {
      throw new Error('RespuestaCuestionario: idOpcion no puede estar vacío');
    }

    // Crear nueva copia del mapa
    const nuevaRespuesta = new Map(this._respuestas);
    // Obtener o crear Set para esta pregunta
    const opcionesExistentes = nuevaRespuesta.get(idPregunta);
    const opciones = opcionesExistentes ? new Set(opcionesExistentes) : new Set<string>();
    // Agregar opción
    opciones.add(idOpcion);
    // Actualizar mapa
    nuevaRespuesta.set(idPregunta, opciones);

    return new RespuestaCuestionario(nuevaRespuesta);
  }

  /**
   * Deselecciona una opción para una pregunta (patrón inmutable).
   * Retorna una nueva instancia con la opción removida.
   * @param idPregunta ID de la pregunta
   * @param idOpcion ID de la opción a deseleccionar
   * @returns Nueva instancia RespuestaCuestionario con la opción removida
   */
  deseleccionar(idPregunta: string, idOpcion: string): RespuestaCuestionario {
    if (!idPregunta || idPregunta.trim().length === 0) {
      throw new Error('RespuestaCuestionario: idPregunta no puede estar vacío');
    }
    if (!idOpcion || idOpcion.trim().length === 0) {
      throw new Error('RespuestaCuestionario: idOpcion no puede estar vacío');
    }

    // Crear nueva copia del mapa
    const nuevaRespuesta = new Map(this._respuestas);
    const opciones = nuevaRespuesta.get(idPregunta);

    if (opciones) {
      // Crear nueva copia del set y remover opción
      const nuevasOpciones = new Set(opciones);
      nuevasOpciones.delete(idOpcion);

      if (nuevasOpciones.size === 0) {
        // Si no quedan opciones, remover la pregunta del mapa
        nuevaRespuesta.delete(idPregunta);
      } else {
        // Actualizar set
        nuevaRespuesta.set(idPregunta, nuevasOpciones);
      }
    }

    return new RespuestaCuestionario(nuevaRespuesta);
  }

  /**
   * Obtiene una copia de todas las respuestas.
   * @returns Map con todas las respuestas
   */
  obtenerTodas(): Map<string, Set<string>> {
    const copia = new Map<string, Set<string>>();
    this._respuestas.forEach((set, key) => {
      copia.set(key, new Set(set));
    });
    return copia;
  }

  /**
   * Valida la completitud de las respuestas contra el conjunto de preguntas.
   * @param preguntas Array de preguntas a validar
   * @returns Objeto con validez y mapa de errores (si hay)
   */
  validarCompletitud(preguntas: Pregunta[]): { valida: boolean; errores?: Map<string, string> } {
    if (!Array.isArray(preguntas)) {
      throw new Error('RespuestaCuestionario: preguntas debe ser un array');
    }

    const errores = new Map<string, string>();

    for (const pregunta of preguntas) {
      // Obtener IDs seleccionados para esta pregunta
      const idsSeleccionados = Array.from(this.obtenerRespuesta(pregunta.id));
      // Validar respuesta usando el método de Pregunta
      const validacion = pregunta.validarRespuesta(idsSeleccionados);

      if (!validacion.valida) {
        errores.set(pregunta.id, validacion.error ?? 'Respuesta inválida');
      }
    }

    return {
      valida: errores.size === 0,
      errores: errores.size > 0 ? errores : undefined,
    };
  }

  /**
   * Cuenta el número total de preguntas respondidas.
   * @returns Número de preguntas con al menos una opción seleccionada
   */
  contarRespuestas(): number {
    return this._respuestas.size;
  }

  /**
   * Verifica si una pregunta tiene respuestas.
   * @param idPregunta ID de la pregunta
   * @returns true si hay al menos una opción seleccionada
   */
  tieneRespuesta(idPregunta: string): boolean {
    return this._respuestas.has(idPregunta) && (this._respuestas.get(idPregunta)?.size ?? 0) > 0;
  }

  /**
   * Limpia todas las respuestas de una pregunta.
   * @param idPregunta ID de la pregunta
   * @returns Nueva instancia sin respuestas para esa pregunta
   */
  limpiarPregunta(idPregunta: string): RespuestaCuestionario {
    const nuevaRespuesta = new Map(this._respuestas);
    nuevaRespuesta.delete(idPregunta);
    return new RespuestaCuestionario(nuevaRespuesta);
  }

  /**
   * Crea una nueva instancia vacía.
   * @returns Nueva instancia sin respuestas
   */
  limpiar(): RespuestaCuestionario {
    return new RespuestaCuestionario();
  }

  /**
   * Retorna una representación en string.
   */
  toString(): string {
    return `RespuestaCuestionario(${this._respuestas.size} preguntas respondidas)`;
  }

  /**
   * Compara dos instancias por valor.
   */
  equals(otra: RespuestaCuestionario): boolean {
    if (!otra) return false;

    if (this._respuestas.size !== otra._respuestas.size) {
      return false;
    }

    for (const [idPregunta, opciones] of this._respuestas) {
      const otrasOpciones = otra._respuestas.get(idPregunta);
      if (!otrasOpciones) return false;
      if (opciones.size !== otrasOpciones.size) return false;

      for (const opcion of opciones) {
        if (!otrasOpciones.has(opcion)) return false;
      }
    }

    return true;
  }
}
