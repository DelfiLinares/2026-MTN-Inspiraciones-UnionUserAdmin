/**
 * Enum MotivoReporte (cerrado, vista administración).
 * Ref: Union/specs/001-plataforma-unificada/data-model.md y tasks.md (T014).
 */
export enum MotivoReporteAdmin {
  SPAM = "SPAM",
  CONTENIDO_INAPROPIADO = "CONTENIDO_INAPROPIADO",
  PLAGIO_DERECHOS_AUTOR = "PLAGIO_DERECHOS_AUTOR",
  VIOLENCIA = "VIOLENCIA",
  OTRO = "OTRO",
}

// Alias para compatibilidad con tareas/entidades de administración
export { MotivoReporteAdmin as MotivoReporte };
