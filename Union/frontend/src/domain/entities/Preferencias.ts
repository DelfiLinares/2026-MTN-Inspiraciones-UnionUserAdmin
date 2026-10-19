import { CategoriaInteres } from '../enums/CategoriaInteres';
import { GeneroMusical } from '../enums/GeneroMusical';
import { EstiloPintura } from '../enums/EstiloPintura';
import { PreferenciasDTO } from '../../application/dto/PreferenciasDTO';

/**
 * Preferencias
 *
 * Value object que representa las preferencias artísticas del usuario
 * con deduplicación automática y validación de invariantes.
 *
 * Responsabilidades:
 * - Encapsular preferencias artísticas del usuario
 * - Deduplicar automáticamente categorías repetidas
 * - Validar invariantes de negocio
 * - Transformar a DTO para handoff
 * - Ser inmutable
 *
 * Invariantes:
 * - Al menos 1 interés artístico es requerido
 * - Al menos 1 género musical es requerido
 * - Estilos de pintura son opcionales (pueden estar vacíos)
 * - No hay duplicados en ninguno de los arrays
 *
 * Requisitos:
 * - RF-21: Almacenamiento de preferencias
 * - RF-22: Transformación de respuestas
 * - RNF-20: Persistencia de preferencias
 * - RNF-21: Deduplicación automática
 * - A-6: Serialización a JSON
 *
 * Referencia: spec.md § 8, data-model.md § 3
 */
export class Preferencias {
  /**
   * Intereses artísticos seleccionados (deduplicado)
   */
  readonly interesesArtisticos: readonly CategoriaInteres[];

  /**
   * Géneros musicales seleccionados (deduplicado)
   */
  readonly generosMusical: readonly GeneroMusical[];

  /**
   * Estilos de pintura seleccionados (deduplicado)
   */
  readonly estilosPintura: readonly EstiloPintura[];

  /**
   * Constructor privado para forzar validación
   */
  private constructor(
    interesesArtisticos: CategoriaInteres[],
    generosMusical: GeneroMusical[],
    estilosPintura: EstiloPintura[]
  ) {
    // Deduplicar automáticamente usando Set
    this.interesesArtisticos = Object.freeze(
      Array.from(new Set(interesesArtisticos))
    );
    this.generosMusical = Object.freeze(
      Array.from(new Set(generosMusical))
    );
    this.estilosPintura = Object.freeze(
      Array.from(new Set(estilosPintura))
    );

    // Validar invariantes
    this.validarInvariantes();
  }

  /**
   * Factory method que crea preferencias con validación
   *
   * @param interesesArtisticos - Array de intereses artísticos
   * @param generosMusical - Array de géneros musicales
   * @param estilosPintura - Array de estilos de pintura (opcional)
   * @returns Instancia de Preferencias
   * @throws Error si no se cumplen los invariantes
   */
  static crear(
    interesesArtisticos: CategoriaInteres[],
    generosMusical: GeneroMusical[],
    estilosPintura: EstiloPintura[] = []
  ): Preferencias {
    return new Preferencias(
      interesesArtisticos,
      generosMusical,
      estilosPintura
    );
  }

  /**
   * Factory method para crear preferencias desde DTO
   *
   * @param dto - PreferenciasDTO con datos
   * @returns Instancia de Preferencias
   * @throws Error si el DTO no es válido
   */
  static desdeDTO(dto: PreferenciasDTO): Preferencias {
    return new Preferencias(
      dto.interesesArtisticos,
      dto.generosMusical,
      dto.estilosPintura
    );
  }

  /**
   * Valida que se cumplan los invariantes de negocio
   *
   * Invariantes:
   * - Al menos 1 interés artístico
   * - Al menos 1 género musical
   * - Estilos de pintura opcional
   *
   * @throws Error si algún invariante no se cumple
   */
  private validarInvariantes(): void {
    if (this.interesesArtisticos.length === 0) {
      throw new Error(
        'Preferencias: debe haber al menos 1 interés artístico'
      );
    }
    if (this.generosMusical.length === 0) {
      throw new Error(
        'Preferencias: debe haber al menos 1 género musical'
      );
    }
  }

  /**
   * Verifica si las preferencias están vacías
   *
   * @returns true si no hay preferencias seleccionadas
   */
  estaVacio(): boolean {
    return (
      this.interesesArtisticos.length === 0 &&
      this.generosMusical.length === 0 &&
      this.estilosPintura.length === 0
    );
  }

  /**
   * Obtiene el total de preferencias seleccionadas
   *
   * @returns Número total sin duplicados
   */
  totalPreferencias(): number {
    return (
      this.interesesArtisticos.length +
      this.generosMusical.length +
      this.estilosPintura.length
    );
  }

  /**
   * Convierte a DTO para handoff o persistencia
   *
   * @returns PreferenciasDTO equivalente
   */
  toDTO(): PreferenciasDTO {
    return PreferenciasDTO.crear(
      Array.from(this.interesesArtisticos),
      Array.from(this.generosMusical),
      Array.from(this.estilosPintura)
    );
  }

  /**
   * Verifica si una categoría está presente
   *
   * @param categoria - Categoría a buscar
   * @returns true si está en alguno de los arrays
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
   * Cuenta cuántas veces aparece una categoría
   * (siempre 0 o 1 gracias a deduplicación)
   *
   * @param categoria - Categoría a contar
   * @returns 1 si existe, 0 si no
   */
  contarCategoria(
    categoria:
      | CategoriaInteres
      | GeneroMusical
      | EstiloPintura
  ): number {
    return this.tieneCategoria(categoria) ? 1 : 0;
  }

  /**
   * Obtiene un resumen textual de las preferencias
   *
   * @returns String con formato "X intereses, Y géneros, Z estilos"
   */
  resumen(): string {
    return `${this.interesesArtisticos.length} intereses, ${this.generosMusical.length} géneros, ${this.estilosPintura.length} estilos`;
  }

  /**
   * Obtiene un resumen detallado con valores
   *
   * @returns String descriptivo con todas las categorías
   */
  resumenDetallado(): string {
    const intereses = this.interesesArtisticos.join(', ');
    const generos = this.generosMusical.join(', ');
    const estilos = this.estilosPintura.length > 0 
      ? this.estilosPintura.join(', ') 
      : '(ninguno)';

    return `Intereses: ${intereses}\nGéneros: ${generos}\nEstilos: ${estilos}`;
  }

  /**
   * Compara dos instancias de Preferencias
   *
   * @param otras - Otra instancia de Preferencias
   * @returns true si tienen las mismas preferencias
   */
  igualA(otras: Preferencias): boolean {
    return (
      this.interesesArtisticos.length === otras.interesesArtisticos.length &&
      this.generosMusical.length === otras.generosMusical.length &&
      this.estilosPintura.length === otras.estilosPintura.length &&
      this.interesesArtisticos.every((cat) =>
        otras.interesesArtisticos.includes(cat)
      ) &&
      this.generosMusical.every((gen) =>
        otras.generosMusical.includes(gen)
      ) &&
      this.estilosPintura.every((est) =>
        otras.estilosPintura.includes(est)
      )
    );
  }

  /**
   * Serializa a JSON para localStorage/API
   *
   * @returns Objeto serializable
   */
  toJSON() {
    return {
      interesesArtisticos: Array.from(this.interesesArtisticos),
      generosMusical: Array.from(this.generosMusical),
      estilosPintura: Array.from(this.estilosPintura),
    };
  }

  /**
   * Deserializa desde JSON
   *
   * @param json - Objeto JSON con estructura de Preferencias
   * @returns Instancia de Preferencias
   * @throws Error si no es válido
   */
  static fromJSON(json: any): Preferencias {
    if (!json || typeof json !== 'object') {
      throw new Error('Preferencias.fromJSON: input must be an object');
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

    return new Preferencias(
      interesesArtisticos,
      generosMusical,
      estilosPintura
    );
  }
}

export default Preferencias;
