/**
 * CategoriaInteres — Categorías de intereses artísticos
 *
 * Enum que define las 10 categorías de intereses artísticos del cuestionario.
 *
 * NOTA CRÍTICA (RNF-23): Estas categorías DEBEN sincronizarse exactamente
 * con las del módulo 002 (publicaciones). El test T011 verifica esta sincronización.
 *
 * Referencia: spec.md § 6 (RF-06), data-model.md § 1.1
 */

export enum CategoriaInteres {
  /**
   * Dibujo — Técnicas de dibujo (lápiz, carbón, tinta, etc.)
   */
  Dibujo = 'dibujo',

  /**
   * Escultura — Arte tridimensional (piedra, madera, metal, etc.)
   */
  Escultura = 'escultura',

  /**
   * Fotografía — Captura de imágenes fotográficas
   */
  Fotografia = 'fotografia',

  /**
   * Literatura — Obras literarias (novelas, poesía, drama, etc.)
   */
  Literatura = 'literatura',

  /**
   * EsculuraDigital — Escultura creada con herramientas digitales
   */
  EsculuraDigital = 'escultura_digital',

  /**
   * PinturaDigital — Pintura creada digitalmente (tablet, software, etc.)
   */
  PinturaDigital = 'pintura_digital',

  /**
   * Instalacion — Arte de instalación (intervenciones en espacios)
   */
  Instalacion = 'instalacion',

  /**
   * Performance — Arte performativo (danza, teatro, acciones artísticas)
   */
  Performance = 'performance',

  /**
   * VideoArte — Obras de arte basadas en video
   */
  VideoArte = 'video_arte',

  /**
   * CineAudiovisual — Cine y audiovisuales
   */
  CineAudiovisual = 'cine_audiovisual',
}

/**
 * Obtiene la descripción legible de una categoría
 */
export function getCategoriaInteresDescription(categoria: CategoriaInteres): string {
  const descriptions: Record<CategoriaInteres, string> = {
    [CategoriaInteres.Dibujo]: 'Dibujo',
    [CategoriaInteres.Escultura]: 'Escultura',
    [CategoriaInteres.Fotografia]: 'Fotografía',
    [CategoriaInteres.Literatura]: 'Literatura',
    [CategoriaInteres.EsculuraDigital]: 'Escultura Digital',
    [CategoriaInteres.PinturaDigital]: 'Pintura Digital',
    [CategoriaInteres.Instalacion]: 'Instalación',
    [CategoriaInteres.Performance]: 'Performance',
    [CategoriaInteres.VideoArte]: 'Video Arte',
    [CategoriaInteres.CineAudiovisual]: 'Cine Audiovisual',
  }
  return descriptions[categoria]
}

/**
 * Valida si un valor es una CategoriaInteres válida
 */
export function isValidCategoriaInteres(value: unknown): value is CategoriaInteres {
  return Object.values(CategoriaInteres).includes(value as CategoriaInteres)
}
