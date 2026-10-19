/**
 * EstiloPintura — Estilos de pintura y técnicas artísticas
 *
 * Enum que define los 10 estilos de pintura del cuestionario.
 *
 * NOTA CRÍTICA (RNF-23): Estos estilos DEBEN sincronizarse exactamente
 * con los del módulo 002 (publicaciones). El test T011 verifica esta sincronización.
 *
 * Referencia: spec.md § 6 (RF-06), data-model.md § 1.1
 */

export enum EstiloPintura {
  /**
   * Realismo — Representación fidedigna de la realidad
   */
  Realismo = 'realismo',

  /**
   * Abstraccion — Arte abstracto no representativo
   */
  Abstraccion = 'abstraccion',

  /**
   * Impresionismo — Enfoque en la luz y color, movimiento artístico del siglo XIX
   */
  Impresionismo = 'impresionismo',

  /**
   * Surrealismo — Arte del subconsciente y los sueños
   */
  Surrealismo = 'surrealismo',

  /**
   * Expresionismo — Enfoque en la expresión emocional
   */
  Expresionismo = 'expresionismo',

  /**
   * Cubismo — Representación de múltiples perspectivas simultáneamente
   */
  Cubismo = 'cubismo',

  /**
   * Fauvismo — Uso de colores puros y vibrantes
   */
  Fauvismo = 'fauvismo',

  /**
   * Dadaismo — Movimiento anti-arte del siglo XX
   */
  Dadaismo = 'dadaismo',

  /**
   * Constructivismo — Arte geométrico y constructivista
   */
  Constructivismo = 'constructivismo',

  /**
   * PopArt — Arte popular contemporáneo
   */
  PopArt = 'pop_art',
}

/**
 * Obtiene la descripción legible de un estilo de pintura
 */
export function getEstiloPinturaDescription(estilo: EstiloPintura): string {
  const descriptions: Record<EstiloPintura, string> = {
    [EstiloPintura.Realismo]: 'Realismo',
    [EstiloPintura.Abstraccion]: 'Abstracción',
    [EstiloPintura.Impresionismo]: 'Impresionismo',
    [EstiloPintura.Surrealismo]: 'Surrealismo',
    [EstiloPintura.Expresionismo]: 'Expresionismo',
    [EstiloPintura.Cubismo]: 'Cubismo',
    [EstiloPintura.Fauvismo]: 'Fauvismo',
    [EstiloPintura.Dadaismo]: 'Dadaísmo',
    [EstiloPintura.Constructivismo]: 'Constructivismo',
    [EstiloPintura.PopArt]: 'Pop Art',
  }
  return descriptions[estilo]
}

/**
 * Valida si un valor es un EstiloPintura válido
 */
export function isValidEstiloPintura(value: unknown): value is EstiloPintura {
  return Object.values(EstiloPintura).includes(value as EstiloPintura)
}
