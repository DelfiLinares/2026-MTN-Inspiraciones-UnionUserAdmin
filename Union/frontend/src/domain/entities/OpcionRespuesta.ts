/**
 * OpcionRespuesta — Value Object para opciones de respuesta
 *
 * Representa una opción seleccionable dentro de una pregunta del cuestionario.
 *
 * Invariantes (DDD):
 * - id es único dentro del catálogo de opciones
 * - categoria pertenece a CategoriaInteres, GeneroMusical o EstiloPintura
 * - descripcion es texto legible para el usuario
 * - No tiene setters (inmutable)
 *
 * Referencia: spec.md § 6 (RF-06), data-model.md § 1.2
 */

import { CategoriaInteres } from '../enums/CategoriaInteres'
import { GeneroMusical } from '../enums/GeneroMusical'
import { EstiloPintura } from '../enums/EstiloPintura'

/**
 * Type union de todas las categorías posibles
 */
export type Categoria = CategoriaInteres | GeneroMusical | EstiloPintura

/**
 * OpcionRespuesta value object
 *
 * Propiedades:
 * - id: identificador único de la opción
 * - categoria: categoría a la que pertenece (artística, musical o pintura)
 * - descripcion: texto que describe la opción
 *
 * Todos los campos son readonly (immutable).
 */
export class OpcionRespuesta {
  /**
   * Constructor privado para forzar validación a través de `crear()`
   */
  private constructor(
    private readonly _id: string,
    private readonly _categoria: Categoria,
    private readonly _descripcion: string
  ) {}

  /**
   * Factory method para crear una OpcionRespuesta con validación
   *
   * @param id - Identificador único de la opción
   * @param categoria - Categoría (CategoriaInteres | GeneroMusical | EstiloPintura)
   * @param descripcion - Descripción legible para el usuario
   * @throws Error si id o descripcion están vacíos
   * @returns Instancia validada de OpcionRespuesta
   */
  public static crear(
    id: string,
    categoria: Categoria,
    descripcion: string
  ): OpcionRespuesta {
    if (!id || id.trim() === '') {
      throw new Error('OpcionRespuesta: id no puede estar vacío')
    }
    if (!descripcion || descripcion.trim() === '') {
      throw new Error('OpcionRespuesta: descripcion no puede estar vacía')
    }
    if (!categoria) {
      throw new Error('OpcionRespuesta: categoria es requerida')
    }

    return new OpcionRespuesta(id, categoria, descripcion)
  }

  /**
   * Alternative constructor for direct instantiation (sin validación extra)
   * Útil para testing y casos donde la validación ocurrió antes.
   */
  public static fromValues(
    id: string,
    categoria: Categoria,
    descripcion: string
  ): OpcionRespuesta {
    return new OpcionRespuesta(id, categoria, descripcion)
  }

  /**
   * Getter para id (readonly)
   */
  public get id(): string {
    return this._id
  }

  /**
   * Getter para categoria (readonly)
   */
  public get categoria(): Categoria {
    return this._categoria
  }

  /**
   * Getter para descripcion (readonly)
   */
  public get descripcion(): string {
    return this._descripcion
  }

  /**
   * Verifica si la opción es válida
   *
   * @returns true si id, categoria y descripcion están presentes
   */
  public esValida(): boolean {
    return !!(this._id && this._categoria && this._descripcion)
  }

  /**
   * Retorna una representación string de la opción
   */
  public toString(): string {
    return `OpcionRespuesta(id=${this._id}, categoria=${this._categoria}, descripcion=${this._descripcion})`
  }

  /**
   * Compara dos instancias de OpcionRespuesta por valor
   *
   * @param otra - Otra instancia de OpcionRespuesta
   * @returns true si tienen los mismos valores
   */
  public equals(otra: OpcionRespuesta): boolean {
    return (
      this._id === otra._id &&
      this._categoria === otra._categoria &&
      this._descripcion === otra._descripcion
    )
  }
}
