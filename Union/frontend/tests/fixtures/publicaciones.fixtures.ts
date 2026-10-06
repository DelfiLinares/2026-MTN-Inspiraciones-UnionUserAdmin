/**
 * Fixtures de publicaciones para validación manual/tests del módulo `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T073)
 * - Union/specs/002-frontend-admin/quickstart.md → Prerrequisitos
 * - Union/specs/002-frontend-admin/research.md §2 (uso exclusivo en `tests/` y demo visual)
 *
 * Cobertura mínima exigida por quickstart (Prerrequisitos):
 * - Una publicación en estado `ACTIVA`.
 * - Una publicación en estado `REPORTADA`.
 */

import type { PublicacionModeracionProps } from '../../src/domain/PublicacionModeracion'
import { EstadoPublicacionAdmin } from '../../src/domain/enums/EstadoPublicacionAdmin'
import { MotivoReporteAdmin } from '../../src/domain/enums/MotivoReporteAdmin'

/**
 * Publicación activa (mínimo requerido):
 * - Escenario 4 (editar publicación) y referencia para flujos sin reportes pendientes.
 */
export const PUBLICACION_ACTIVA_FIXTURE: PublicacionModeracionProps = {
  id: 'pub-activa-001',
  autorId: 'autor-user-001',
  estado: EstadoPublicacionAdmin.ACTIVA,
  cantidadReportes: 0,
  motivosReporte: [],
}

/**
 * Publicación reportada (mínimo requerido):
 * - Escenario 5 (eliminar publicación reportada).
 * - Escenarios 7/8 (aceptar/rechazar reportes sobre una publicación reportada).
 */
export const PUBLICACION_REPORTADA_FIXTURE: PublicacionModeracionProps = {
  id: 'pub-reportada-001',
  autorId: 'autor-user-002',
  estado: EstadoPublicacionAdmin.REPORTADA,
  cantidadReportes: 2,
  motivosReporte: [MotivoReporteAdmin.SPAM, MotivoReporteAdmin.VIOLENCIA],
}

/**
 * Colección sugerida para listados.
 */
export const PUBLICACIONES_FIXTURES: PublicacionModeracionProps[] = [
  PUBLICACION_ACTIVA_FIXTURE,
  PUBLICACION_REPORTADA_FIXTURE,
]
