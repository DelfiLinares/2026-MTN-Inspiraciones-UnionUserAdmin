/**
 * GeneroMusical — Géneros musicales de preferencia
 *
 * Enum que define los 12 géneros musicales del cuestionario.
 *
 * NOTA CRÍTICA (RNF-23): Estos géneros DEBEN sincronizarse exactamente
 * con los del módulo 002 (publicaciones). El test T011 verifica esta sincronización.
 *
 * Referencia: spec.md § 6 (RF-06), data-model.md § 1.1
 */

export enum GeneroMusical {
  /**
   * Rock — Música rock en todas sus variantes
   */
  Rock = 'rock',

  /**
   * Pop — Música pop comercial y contemporánea
   */
  Pop = 'pop',

  /**
   * Electronica — Música electrónica y EDM
   */
  Electronica = 'electronica',

  /**
   * Metal — Música metal en todas sus variantes
   */
  Metal = 'metal',

  /**
   * KPop — Música pop coreana
   */
  KPop = 'k_pop',

  /**
   * Country — Música country
   */
  Country = 'country',

  /**
   * Nacional — Música nacional/folklórica
   */
  Nacional = 'nacional',

  /**
   * Reggaeton — Música reggaeton y urbana
   */
  Reggaeton = 'reggaeton',

  /**
   * HipHop — Hip hop y rap
   */
  HipHop = 'hip_hop',

  /**
   * Clasica — Música clásica
   */
  Clasica = 'clasica',

  /**
   * RB — Rhythm & Blues
   */
  RB = 'r_and_b',

  /**
   * Blues — Música blues
   */
  Blues = 'blues',
}

/**
 * Obtiene la descripción legible de un género musical
 */
export function getGeneroMusicalDescription(genero: GeneroMusical): string {
  const descriptions: Record<GeneroMusical, string> = {
    [GeneroMusical.Rock]: 'Rock',
    [GeneroMusical.Pop]: 'Pop',
    [GeneroMusical.Electronica]: 'Electrónica',
    [GeneroMusical.Metal]: 'Metal',
    [GeneroMusical.KPop]: 'K-Pop',
    [GeneroMusical.Country]: 'Country',
    [GeneroMusical.Nacional]: 'Nacional',
    [GeneroMusical.Reggaeton]: 'Reggaeton',
    [GeneroMusical.HipHop]: 'Hip-Hop',
    [GeneroMusical.Clasica]: 'Clásica',
    [GeneroMusical.RB]: 'R&B',
    [GeneroMusical.Blues]: 'Blues',
  }
  return descriptions[genero]
}

/**
 * Valida si un valor es un GeneroMusical válido
 */
export function isValidGeneroMusical(value: unknown): value is GeneroMusical {
  return Object.values(GeneroMusical).includes(value as GeneroMusical)
}
