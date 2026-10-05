/**
 * `RechazarReporteAction`: Acción "Rechazar" de reporte.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T058, depende de T024, T025, T050d, T056)
 * - Union/specs/002-frontend-admin/spec.md HU-08, AC-08.3, AC-08.4
 * - Union/specs/002-frontend-admin/data-model.md → Reporte.requiereConfirmacionParaRechazar()
 *
 * Responsabilidades:
 * - Usa `AccionSensibleBoton` (T025) para el botón que dispara la acción, deshabilitado cuando
 *   `reporte.esEstadoFinal()` (AC-08.4: no disponible sobre reportes ya `RESUELTO`/`DESESTIMADO`).
 * - Usa `ConfirmDialog` (T024, contrato de T023b) para la confirmación explícita antes de aplicarse
 *   (AC-08.3): a diferencia de "Aceptar" (T057), `Reporte.requiereConfirmacionParaRechazar()`
 *   siempre devuelve `true`, ya que rechazar puede reactivar automáticamente la publicación
 *   asociada (`Publicacion.reactivarSiNoQuedanReportesPendientes`, AC-08.6).
 * - Delega la validación de negocio a `ReportesService.rechazar()` (T050d): este componente no
 *   reimplementa la regla `puedeRechazarse()`, solo captura el error y lo expone mediante
 *   `onError`.
 * - Tras confirmar, invoca `onRechazado` para que el consumidor (T059, `ReportesPage`) pueda
 *   refrescar el listado/detalle.
 */

import React, { useState } from 'react'
import { AccionSensibleBoton } from '../shared/AccionSensibleBoton'
import { ConfirmDialog } from '../shared/ConfirmDialog'
import { ReportesService } from '../../application/ReportesService'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { Reporte } from '../../domain/Reporte'
import type { PublicacionModeracion } from '../../domain/PublicacionModeracion'

export interface RechazarReporteActionProps {
  readonly reporte: Reporte
  readonly httpClient: HttpClient
  readonly publicacionAsociada?: PublicacionModeracion
  readonly onRechazado?: () => void
  readonly onError?: (mensaje: string) => void
}

export const RechazarReporteAction: React.FC<RechazarReporteActionProps> = ({
  reporte,
  httpClient,
  publicacionAsociada,
  onRechazado,
  onError,
}) => {
  const [dialogoAbierto, setDialogoAbierto] = useState(false)
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(() => new ReportesService(httpClient), [httpClient])

  const puedeRechazar = !reporte.esEstadoFinal()

  const confirmar = async () => {
    setCargando(true)
    try {
      await servicio.rechazar(reporte, publicacionAsociada)
      setDialogoAbierto(false)
      onRechazado?.()
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo rechazar el reporte.'
      onError?.(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <>
      <AccionSensibleBoton
        etiqueta="Rechazar"
        sensible
        onClick={() => setDialogoAbierto(true)}
        deshabilitado={!puedeRechazar}
      />

      {dialogoAbierto && (
        <ConfirmDialog
          titulo="Rechazar reporte"
          mensaje="¿Confirmás rechazar este reporte? Esta acción no se puede deshacer."
          onConfirmar={confirmar}
          onCancelar={() => setDialogoAbierto(false)}
          cargando={cargando}
        />
      )}
    </>
  )
}
