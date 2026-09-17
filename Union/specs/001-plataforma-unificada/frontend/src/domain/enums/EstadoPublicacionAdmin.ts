/**
 * Enum EstadoPublicacion (vista administración).
 * Mantiene la misma semántica que la vista de usuario según data-model.md y tasks.md (T012).
 */
export enum EstadoPublicacionAdmin {
  ACTIVA = "ACTIVA",
  REPORTADA = "REPORTADA",
  ELIMINADA = "ELIMINADA",
}

// Alias para compatibilidad con tareas/entidades de administración
export { EstadoPublicacionAdmin as EstadoPublicacion };
