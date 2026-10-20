import { Pregunta } from '../domain/entities/Pregunta';
import { RespuestaCuestionario } from '../domain/entities/RespuestaCuestionario';
import { Preferencias } from '../domain/entities/Preferencias';
import { CategoriaInteres } from '../domain/enums/CategoriaInteres';
import { GeneroMusical } from '../domain/enums/GeneroMusical';
import { EstiloPintura } from '../domain/enums/EstiloPintura';

/**
 * Resultado de validación con errores desglosados por pregunta
 */
export interface ResultadoValidacion {
  valida: boolean;
  errores?: Map<string, string>;
}

/**
 * Resultado de validación de selección individual
 */
export interface ResultadoValidacionSeleccion {
  valida: boolean;
  error?: string;
}

/**
 * CuestionarioService
 *
 * Servicio que centraliza la lógica de validación y transformación de respuestas
 * del cuestionario de intereses.
 *
 * Responsabilidades:
 * - Validar completitud de respuestas (preguntas obligatorias con respuesta)
 * - Validar selecciones individuales contra el catálogo de opciones
 * - Transformar RespuestaCuestionario a Preferencias
 *
 * Arquitectura:
 * - Separación de reglas de negocio (aquí) de presentación (componentes)
 * - Validación sin efectos secundarios
 * - Métodos puros y deterministas
 *
 * Requisitos:
 * - RF-16: Validar que todas las preguntas obligatorias tengan respuesta
 * - RF-17: Si una obligatoria está vacía → error claro
 * - RF-18: Preguntas opcionales pueden quedar sin responder
 * - RF-19: No permitir continuar si hay validaciones incompletas
 * - RF-21: Transformar respuestas a Preferencias
 * - RF-22: Preferencias con arrays de categorías seleccionadas
 * - RNF-20: Reglas de negocio separadas de componentes
 *
 * Referencia: spec.md § 6, plan.md § 3-4, data-model.md
 */
export class CuestionarioService {

  /**
   * Valida la completitud de respuestas verificando que todas las preguntas
   * obligatorias tengan al menos una respuesta.
   *
   * @param respuestas - RespuestaCuestionario con las respuestas del usuario
   * @param preguntas - Array de preguntas del cuestionario
   * @returns ResultadoValidacion con validez y errores por pregunta
   *
   * Criterio: Una pregunta es válida si:
   * - Es opcional (obligatoria=false), O
   * - Es obligatoria Y tiene al menos una respuesta seleccionada
   *
   * Requisitos: RF-16, RF-17, RF-18, RF-19
   */
  static validarCompletitud(
    respuestas: RespuestaCuestionario,
    preguntas: Pregunta[]
  ): ResultadoValidacion {
    if (!respuestas) {
      throw new Error('CuestionarioService: respuestas no puede ser null');
    }
    if (!preguntas || !Array.isArray(preguntas)) {
      throw new Error('CuestionarioService: preguntas debe ser un array válido');
    }

    const errores = new Map<string, string>();

    for (const pregunta of preguntas) {
      // Solo validar preguntas obligatorias
      if (!pregunta.obligatoria) {
        continue;
      }

      // Obtener respuesta para esta pregunta
      const respuesta = respuestas.obtenerRespuesta(pregunta.id);

      // Verificar que hay al menos una opción seleccionada
      if (!respuesta || respuesta.size === 0) {
        errores.set(
          pregunta.id,
          `La pregunta "${pregunta.texto}" es obligatoria y debe tener al menos una respuesta.`
        );
      }
    }

    const valida = errores.size === 0;

    if (valida) {
      return { valida: true };
    }

    return {
      valida: false,
      errores,
    };
  }

  /**
   * Transforma RespuestaCuestionario en un objeto Preferencias.
   *
   * Mapeo:
   * - Pregunta 1 (Intereses Artísticos) → interesesArtisticos en Preferencias
   * - Pregunta 2 (Géneros Musicales) → generosMusical en Preferencias
   * - Pregunta 3 (Estilos de Pintura) → estilosPintura en Preferencias
   *
   * @param respuestas - RespuestaCuestionario con las respuestas
   * @param preguntas - Array de preguntas (debe contener exactamente 3)
   * @returns Instancia de Preferencias
   *
   * Notas:
   * - Asume que preguntas está en orden: [Intereses, Géneros, Estilos]
   * - Deduplicación se maneja automáticamente en Preferencias
   * - Si no hay respuesta para una pregunta, usa array vacío
   *
   * Requisitos: RF-21, RF-22
   */
  static transformarAPreferencias(
    respuestas: RespuestaCuestionario,
    preguntas: Pregunta[]
  ): Preferencias {
    if (!respuestas) {
      throw new Error('CuestionarioService: respuestas no puede ser null');
    }
    if (!preguntas || preguntas.length < 1) {
      throw new Error('CuestionarioService: debe haber al menos una pregunta');
    }

    // Buscar preguntas por ID (asume naming convención: preg-intereses, preg-generos, preg-estilos)
    const preguntaIntereses = preguntas.find((p) =>
      p.id.toLowerCase().includes('interes')
    );
    const preguntaGeneros = preguntas.find((p) =>
      p.id.toLowerCase().includes('genero')
    );
    const preguntaEstilos = preguntas.find((p) =>
      p.id.toLowerCase().includes('estilo')
    );

    if (!preguntaIntereses || !preguntaGeneros) {
      throw new Error(
        'CuestionarioService: Faltan preguntas de intereses o géneros'
      );
    }

    // Extraer IDs de opciones seleccionadas
    const idsIntereses = Array.from(
      respuestas.obtenerRespuesta(preguntaIntereses.id)
    );
    const idsGeneros = Array.from(
      respuestas.obtenerRespuesta(preguntaGeneros.id)
    );
    const idsEstilos = preguntaEstilos
      ? Array.from(respuestas.obtenerRespuesta(preguntaEstilos.id))
      : [];

    // Mapear IDs a valores de enum
    const interesesArtisticos = this.mapearIdsAEnumIntereses(
      idsIntereses,
      preguntaIntereses
    );
    const generosMusical = this.mapearIdsAEnumGeneros(idsGeneros, preguntaGeneros);
    const estilosPintura = preguntaEstilos
      ? this.mapearIdsAEnumEstilos(idsEstilos, preguntaEstilos)
      : [];

    // Crear y retornar Preferencias
    return Preferencias.crear(
      interesesArtisticos,
      generosMusical,
      estilosPintura
    );
  }

  /**
   * Valida que una selección individual sea válida.
   *
   * Verifica:
   * - La opción existe en el catálogo de la pregunta
   * - El ID de opción corresponde a un valor válido del enum
   *
   * @param pregunta - Pregunta a validar
   * @param idOpcion - ID de la opción seleccionada
   * @returns ResultadoValidacionSeleccion
   *
   * Requisitos: RF-16, RF-19
   */
  static validarSeleccion(
    pregunta: Pregunta,
    idOpcion: string
  ): ResultadoValidacionSeleccion {
    if (!pregunta) {
      throw new Error('CuestionarioService: pregunta no puede ser null');
    }
    if (!idOpcion || idOpcion.trim().length === 0) {
      throw new Error('CuestionarioService: idOpcion no puede estar vacío');
    }

    // Buscar si la opción existe en las opciones de la pregunta
    const opcionValida = pregunta.opciones.some(
      (opcion) => opcion.id === idOpcion
    );

    if (!opcionValida) {
      return {
        valida: false,
        error: `La opción "${idOpcion}" no es válida para la pregunta "${pregunta.texto}".`,
      };
    }

    return { valida: true };
  }

  /**
   * Mapea IDs de opciones a valores de enum CategoriaInteres
   * @private
   */
  private static mapearIdsAEnumIntereses(
    ids: string[],
    pregunta: Pregunta
  ): CategoriaInteres[] {
    const categorias: CategoriaInteres[] = [];

    for (const id of ids) {
      const opcion = pregunta.opciones.find((o) => o.id === id);
      if (opcion && this.esValorEnum(opcion.categoria, CategoriaInteres)) {
        categorias.push(opcion.categoria as unknown as CategoriaInteres);
      }
    }

    return categorias;
  }

  /**
   * Mapea IDs de opciones a valores de enum GeneroMusical
   * @private
   */
  private static mapearIdsAEnumGeneros(
    ids: string[],
    pregunta: Pregunta
  ): GeneroMusical[] {
    const generos: GeneroMusical[] = [];

    for (const id of ids) {
      const opcion = pregunta.opciones.find((o) => o.id === id);
      if (opcion && this.esValorEnum(opcion.categoria, GeneroMusical)) {
        generos.push(opcion.categoria as unknown as GeneroMusical);
      }
    }

    return generos;
  }

  /**
   * Mapea IDs de opciones a valores de enum EstiloPintura
   * @private
   */
  private static mapearIdsAEnumEstilos(
    ids: string[],
    pregunta: Pregunta
  ): EstiloPintura[] {
    const estilos: EstiloPintura[] = [];

    for (const id of ids) {
      const opcion = pregunta.opciones.find((o) => o.id === id);
      if (opcion && this.esValorEnum(opcion.categoria, EstiloPintura)) {
        estilos.push(opcion.categoria as unknown as EstiloPintura);
      }
    }

    return estilos;
  }

  /**
   * Verifica si un valor es válido en un enum
   * @private
   */
  private static esValorEnum(valor: unknown, enumObj: Record<string, unknown>): boolean {
    return Object.values(enumObj).includes(valor);
  }
}
