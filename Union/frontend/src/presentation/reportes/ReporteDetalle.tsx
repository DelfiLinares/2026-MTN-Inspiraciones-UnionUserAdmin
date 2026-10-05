/**
 * `ReporteDetalle`: Panel de detalle de un reporte.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T056, depende de T050b, T053)
 * - Union/specs/002-frontend-admin/spec.md AC-06.4
 * - Union/specs/002-frontend-admin/contracts/openapi.yaml (schema `Reporte`: `id`, `publicacionId`,
 *   `reportanteId`, `motivo`, `prioridad`, `estadoModeracion`, `fechaCreacion` — sin objetos
 *   `publicacion`/`usuario` embebidos)
 *
 * Responsabilidades:
 * - Consume `ReportesService.obtenerDetalle(reporteId)` (T050b) para obtener el reporte completo.
 * - Muestra, como mínimo, motivo, prioridad, estado de moderación y la publicación o usuario
 *   asociado (AC-06.4). Dado que el contrato `Reporte` (`openapi.yaml`) no embebe los objetos
 *   `Publicacion`/`Usuario` completos, sino solo `publicacionId` y `reportanteId`, este panel
 *   muestra dichos identificadores como referencia a la publicación/usuario asociado; la
 *   resolución de sus datos completos (p. ej. autor, contenido) queda fuera de alcance de esta
 *   tarea.
 * - Reutiliza `PrioridadBadge`/`EstadoModeracionBadge` (T055) para el resaltado visual consistente
 *   con `ReportesTable` (T053).
 * - Sin lógica de negocio sobre acciones sensibles (aceptar/rechazar): eso corresponde a
 *   `AceptarReporteAction`/`RechazarReporteAction` (T057/T058, pendientes).
 */

import React, { useCallback, useEffect, useState } from 'react'
import { ReportesService } from '../../application/ReportesService'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { Reporte } from '../../domain/Reporte'
import { PrioridadBadge } from './PrioridadBadge'
import { EstadoModeracionBadge } from './EstadoModeracionBadge'
import { EstadoVacio } from '../shared/EstadoVacio'
import { MensajeError } from '../shared/MensajeError'

export interface ReporteDetalleProps {
  readonly httpClient: HttpClient
  readonly reporteId: string
}

export const ReporteDetalle: React.FC<ReporteDetalleProps> = ({ httpClient, reporteId }) => {
  const [reporte, setReporte] = useState<Reporte | null>(null)
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const servicio = React.useMemo(() => new ReportesService(httpClient), [httpClient])

  const cargarDetalle = useCallback(async () => {
    setCargando(true)
    setMensajeError(null)
    try {
      const resultado = await servicio.obtenerDetalle(reporteId)
      setReporte(resultado)
    } catch {
      setMensajeError('No se pudo cargar el detalle del reporte.')
      setReporte(null)
    } finally {
      setCargando(false)
    }
  }, [servicio, reporteId])

  useEffect(() => {
    cargarDetalle()
  }, [cargarDetalle])

  if (mensajeError !== null) {
    return <MensajeError mensaje={mensajeError} />
  }

  if (!cargando && reporte === null) {
    return <EstadoVacio mensaje="No se encontró el reporte." />
  }

  if (reporte === null) {
    return null
  }

  return (
    <div className="reporte-detalle" aria-label="Detalle del reporte">
      <dl>
        <dt>Motivo</dt>
        <dd>{reporte.motivo}</dd>

        <dt>Prioridad</dt>
        <dd>{reporte.prioridad ? <PrioridadBadge prioridad={reporte.prioridad} /> : '—'}</dd>

        <dt>Estado de moderación</dt>
        <dd>
          <EstadoModeracionBadge estado={reporte.estado} />
        </dd>

        <dt>Publicación asociada</dt>
        <dd>{reporte.publicacionId}</dd>

        <dt>Usuario reportante</dt>
        <dd>{reporte.reportanteId}</dd>
      </dl>
    </div>
  )
}
