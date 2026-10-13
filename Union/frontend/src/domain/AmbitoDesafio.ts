/**
 * Value object AmbitoDesafio
 * 
 * Representa un ámbito (tema o categoría) de un desafío.
 * Pertenece a un catálogo entregado por la API (GET /ambitos).
 * 
 * Fuente: specs/003-desafios/data-model.md (sección 3.2)
 * 
 * Nota: El catálogo está pendiente de A-02.
 * Por ahora, solo almacena el valor como texto.
 */

export interface AmbitoDesafioProps {
  valor: string
}

export class AmbitoDesafio {
  readonly valor: string

  constructor(props: AmbitoDesafioProps) {
    this.valor = props.valor
  }

  /**
   * Valida que el valor no esté vacío.
   * Devuelve un objeto con errores por campo si no cumple.
   */
  validar(): Record<string, string> {
    const errores: Record<string, string> = {}

    if (!this.valor || this.valor.trim() === '') {
      errores.valor = 'El ámbito no puede estar vacío'
    }

    return errores
  }
}
