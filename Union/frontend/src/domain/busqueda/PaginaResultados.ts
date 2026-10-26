import { PublicacionResumen } from './PublicacionResumen'

/**
 * Value object inmutable: una página de resultados (FYP o búsqueda) con su cursor siguiente.
 *
 * Invariantes:
 * - `hayMas` ⇔ `cursorSiguiente` no es nulo (se deriva del cursor, no se recibe).
 * - Los items se conservan en el orden recibido; el frontend no reordena.
 * - `agregar` es el único dueño de la deduplicación por id: concatena la página siguiente,
 *   conserva la primera aparición de cada id y adopta el cursor de la página agregada.
 *
 * Fuente de verdad:
 * - Union/specs/007-inspiraciones-busqueda/data-model.md (PaginaResultados)
 * - Union/specs/007-inspiraciones-busqueda/tasks.md (T017)
 */
export class PaginaResultados {
  readonly items: readonly PublicacionResumen[]
  readonly cursorSiguiente: string | null

  constructor(items: readonly PublicacionResumen[], cursorSiguiente: string | null) {
    this.items = Object.freeze([...items])
    this.cursorSiguiente = cursorSiguiente ?? null
    Object.freeze(this)
  }

  get hayMas(): boolean {
    return this.cursorSiguiente !== null
  }

  estaVacia(): boolean {
    return this.items.length === 0
  }

  agregar(siguiente: PaginaResultados): PaginaResultados {
    const vistos = new Set<string>()
    const combinados: PublicacionResumen[] = []

    for (const item of [...this.items, ...siguiente.items]) {
      if (!vistos.has(item.id)) {
        vistos.add(item.id)
        combinados.push(item)
      }
    }

    return new PaginaResultados(combinados, siguiente.cursorSiguiente)
  }
}
