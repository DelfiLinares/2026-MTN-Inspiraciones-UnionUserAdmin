/**
 * Clasificación de errores de la API para la página de búsqueda (módulo 007).
 * - RED: sin conexión, timeout o fallo de red.
 * - NO_AUTENTICADO: 401.
 * - SIN_PERMISO: 403.
 * - SOLICITUD_INVALIDA: 400.
 * - LIMITE: 429.
 * - SERVIDOR: 5xx u otros errores de la API.
 *
 * Fuente: Union/specs/007-inspiraciones-busqueda/data-model.md
 */
export enum TipoErrorBusqueda {
  RED = "RED",
  NO_AUTENTICADO = "NO_AUTENTICADO",
  SIN_PERMISO = "SIN_PERMISO",
  SOLICITUD_INVALIDA = "SOLICITUD_INVALIDA",
  LIMITE = "LIMITE",
  SERVIDOR = "SERVIDOR",
}
