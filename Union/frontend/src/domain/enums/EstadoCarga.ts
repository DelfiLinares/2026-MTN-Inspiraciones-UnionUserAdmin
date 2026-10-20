/**
 * Estado de carga de la sesión de búsqueda (módulo 007).
 *
 * Fuente: Union/specs/007-inspiraciones-busqueda/data-model.md
 */
export enum EstadoCarga {
  INICIAL = "INICIAL",
  CARGANDO = "CARGANDO",
  CARGANDO_MAS = "CARGANDO_MAS",
  LISTO = "LISTO",
  VACIO = "VACIO",
  ERROR = "ERROR",
}
