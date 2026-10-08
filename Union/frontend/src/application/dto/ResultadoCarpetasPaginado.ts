import { CarpetaPost } from '../../domain/CarpetaPost'

/**
 * DTO ResultadoCarpetasPaginado — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (schema: PaginaCarpetas)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (DTOs: ResultadoCarpetas)
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-08, A6)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T014)
 *
 * Tipado de respuesta paginada para listado de carpetas de un usuario.
 * Implementa paginación server-side (A6) con parámetros limit/offset.
 * Permite al frontend aplicar el límite de 50 carpetas máximo (RF-22).
 */
export interface ResultadoCarpetasPaginado {
  /**
   * Array de carpetas en esta página.
   * Contiene hasta `limit` items (default: 10, max: 50).
   */
  items: CarpetaPost[]

  /**
   * Total de carpetas disponibles del usuario.
   * Máximo: 50 (RF-22). Permite al frontend saber si se alcanzó límite.
   */
  total: number

  /**
   * Items retornados en esta página (típicamente 10, máximo 50).
   */
  limit: number

  /**
   * Posición de inicio de esta página (0-based).
   */
  offset: number

  /**
   * Indica si hay más páginas disponibles.
   * true si offset + limit < total.
   */
  hasMore: boolean
}

/**
 * Helper para crear resultado vacío.
 */
export const crearResultadoCarpetasVacio = (): ResultadoCarpetasPaginado => ({
  items: [],
  total: 0,
  limit: 10,
  offset: 0,
  hasMore: false,
})

/**
 * Helper para determinar si se alcanzó el límite de 50 carpetas.
 */
export const alcanzoLimiteCarpetas = (
  resultado: ResultadoCarpetasPaginado,
): boolean => {
  return resultado.total >= 50
}
