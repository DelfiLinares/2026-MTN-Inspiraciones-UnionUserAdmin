import { CategoriaInteres } from '../../domain/enums/CategoriaInteres';
import { GeneroMusical } from '../../domain/enums/GeneroMusical';
import { EstiloPintura } from '../../domain/enums/EstiloPintura';

/**
 * PreferenciasDTO
 *
 * Data Transfer Object que representa las preferencias artísticas del usuario
 * transformadas para handoff a otros módulos o persistencia.
 *
 * Responsabilidades:
 * - Encapsular las preferencias en un objeto serializable
 * - Facilitar transformación entre capas de aplicación
 * - Preparar datos para localStorage/API
 * - Mantener tipado fuerte de enums
 *
 * Requisitos:
 * - RF-21: Almacenamiento de preferencias
 * - RF-22: Transformación de respuestas
 * - A-6: Serialización a JSON
 *
 * Referencia: spec.md § 8, data-model.md § 3
 */
export class PreferenciasDTO {
  /**
   * Array de intereses artísticos seleccionados
   * Basado en CategoriaInteres enum
   */
  readonly interesesArtisticos: CategoriaInteres[];

  /**
   * Array de géneros musicales seleccionados
   * Basado en GeneroMusical enum
   */
  readonly generosMusical: GeneroMusical[];

  /**
   * Array de estilos de pintura seleccionados (opcional)
   * Basado en EstiloPintura enum
   */
  readonly estilosPintura: EstiloPintura[];

  /**
   * Constructor privado para forzar uso de factory methods
   */
  private constructor(
    interesesArtisticos: CategoriaInteres[],
    generosMusical: GeneroMusical[],
    estilosPintura: EstiloPintura[]
  ) {
    this.interesesArtisticos = interesesArtisticos;
    this.generosMusical = generosMusical;
    this.estilosPintura = estilosPintura;
  }

  /**
   * Factory method: crea un DTO desde arrays de preferencias
   *
   * @param interesesArtisticos - Array de intereses artísticos
   * @param generosMusical - Array de géneros musicales
   * @param estilosPintura - Array de estilos de pintura (opcional)
   * @returns Instancia de PreferenciasDTO
   */
  static crear(
    interesesArtisticos: CategoriaInteres[],
    generosMusical: GeneroMusical[],
    estilosPintura: EstiloPintura[] = []
  ): PreferenciasDTO {
    return new PreferenciasDTO(
      interesesArtisticos,
      generosMusical,
      estilosPintura
    );
  }

  /**
   * Factory method: crea un DTO vacío
   *
   * @returns PreferenciasDTO con arrays vacíos
   */
  static vacio(): PreferenciasDTO {
    return new PreferenciasDTO([], [], []);
  }

  /**
   * Valida que las preferencias sean válidas según reglas de negocio
   *
   * Reglas:
   * - Al menos 1 interés artístico es requerido
   * - Al menos 1 género musical es requerido
   * - Estilos de pintura son opcionales
   *
   * @returns true si las preferencias son válidas, false en caso contrario
   */
  esValido(): boolean {
    return this.interesesArtisticos.length > 0 && this.generosMusical.length > 0;
  }

  /**
   * Valida que no esté vacío (al menos una preferencia)
   *
   * @returns true si hay al menos una preferencia, false si todo está vacío
   */
  noEstaVacio(): boolean {
    return (
      this.interesesArtisticos.length > 0 ||
      this.generosMusical.length > 0 ||
      this.estilosPintura.length > 0
    );
  }

  /**
   * Convierte el DTO a un objeto JSON serializable
   *
   * @returns Objeto plano con arrays de preferencias
   */
  toJSON() {
    return {
      interesesArtisticos: this.interesesArtisticos,
      generosMusical: this.generosMusical,
      estilosPintura: this.estilosPintura,
    };
  }

  /**
   * Factory method: crea un DTO desde un objeto JSON
   *
   * Útil para deserializar desde localStorage/API
   *
   * @param json - Objeto con estructura de PreferenciasDTO
   * @returns Instancia de PreferenciasDTO
   * @throws Error si el JSON no tiene la estructura esperada
   */
  static fromJSON(json: any): PreferenciasDTO {
    if (!json || typeof json !== 'object') {
      throw new Error('PreferenciasDTO.fromJSON: input must be an object');
    }

    const interesesArtisticos = Array.isArray(json.interesesArtisticos)
      ? json.interesesArtisticos
      : [];
    const generosMusical = Array.isArray(json.generosMusical)
      ? json.generosMusical
      : [];
    const estilosPintura = Array.isArray(json.estilosPintura)
      ? json.estilosPintura
      : [];

    return new PreferenciasDTO(
      interesesArtisticos,
      generosMusical,
      estilosPintura
    );
  }

  /**
   * Obtiene el total de preferencias seleccionadas
   *
   * @returns Número total de preferencias
   */
  totalPreferencias(): number {
    return (
      this.interesesArtisticos.length +
      this.generosMusical.length +
      this.estilosPintura.length
    );
  }

  /**
   * Verifica si una preferencia específica está seleccionada
   *
   * @param categoria - Categoría a buscar
   * @returns true si la categoría está en alguno de los arrays
   */
  tieneCategoria(
    categoria:
      | CategoriaInteres
      | GeneroMusical
      | EstiloPintura
  ): boolean {
    return (
      this.interesesArtisticos.includes(categoria as CategoriaInteres) ||
      this.generosMusical.includes(categoria as GeneroMusical) ||
      this.estilosPintura.includes(categoria as EstiloPintura)
    );
  }

  /**
   * Obtiene un resumen textual de las preferencias
   *
   * @returns String con formato "X intereses, Y géneros, Z estilos"
   */
  resumen(): string {
    return `${this.interesesArtisticos.length} intereses, ${this.generosMusical.length} géneros, ${this.estilosPintura.length} estilos`;
  }
}

export default PreferenciasDTO;
