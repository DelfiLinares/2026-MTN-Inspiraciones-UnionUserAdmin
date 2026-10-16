/**
 * Enum MotivoReporte (cerrado, vista administración).
 * Ref: Union/specs/001-plataforma-unificada/data-model.md y tasks.md (T014).
 *
 * Trazabilidad adicional (T012, `Union/specs/002-frontend-admin/tasks.md`):
 * Este enum satisface el requisito de `002-frontend-admin` (RF-18, `data-model.md` → Enums) de un
 * `MotivoReporte` cerrado con los valores `SPAM`, `CONTENIDO_INAPROPIADO`, `PLAGIO_DERECHOS_AUTOR`,
 * `VIOLENCIA`, `OTRO`. Se mantiene bajo el nombre de archivo `MotivoReporteAdmin.ts` (en lugar de
 * `MotivoReporte.ts`) porque ese otro archivo ya existe con una interfaz distinta
 * (`{ codigo, etiqueta }`), consumida por `001-plataforma-unificada` (`services/reporteService.ts`)
 * para el catálogo dinámico de motivos del frontend de usuario final. El re-export de abajo
 * (`MotivoReporteAdmin as MotivoReporte`) permite que el dominio administrativo (`domain/Reporte.ts`,
 * `domain/PublicacionModeracion.ts`) importe el tipo bajo el nombre `MotivoReporte` sin colisionar
 * con el archivo homónimo de la otra feature.
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
