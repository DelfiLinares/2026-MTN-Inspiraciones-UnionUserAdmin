/**
 * `AceptarReporteAction`: Acción "Aceptar" de reporte.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T057, depende de T024, T025, T050c, T056)
 * - Union/specs/002-frontend-admin/spec.md HU-07, AC-07.3, AC-07.4
 * - Union/specs/002-frontend-admin/data-model.md → Reporte.requiereConfirmacionParaAceptar()
 *
 * Responsabilidades:
 * - Usa `AccionSensibleBoton` (T025) para el botón que dispara la acción, deshabilitado cuando
 *   `reporte.esEstadoFinal()` (AC-07.4: no disponible sobre reportes ya `RESUELTO`/`DESESTIMADO`).
 * - **No** usa `ConfirmDialog` (T024) en este componente: aceptar un reporte como acción simple NO
 *   requiere confirmación explícita (`Reporte.requiereConfirmacionParaAceptar()` devuelve siempre
 *   `false`, según `data-model.md`), ya que solo cambia el estado de moderación del reporte a
 *   `RESUELTO` sin efectos secundarios irreversibles sobre otras entidades (resuelto,
 *   Clarifications Session 2026-10-05, A2). Si el administrador decide además eliminar la
 *   publicación asociada en el mismo flujo, esa acción adicional (`EliminarPublicacionAction`,
 *   T045) ya exige su propia confirmación por sí misma; el encadenamiento de ambas acciones en una
 *   misma pantalla es responsabilidad de `ReportesPage.tsx` (T059), fuera del alcance de este
 *   componente.
 * - Delega la validación de negocio a `ReportesService.aceptar()` (T050c): este componente no
 *   reimplementa la regla `puedeAceptarse()`, solo captura el error y lo expone mediante `onError`.
 * - Tras aceptar, invoca `onAceptado` para que el consumidor (T059, `ReportesPage`) pueda refrescar
 *   el listado/detalle.
 */

import React, { useState } from 'react'
import { AccionSensibleBoton } from '../shared/AccionSensibleBoton'
import { ReportesService } from '../../application/ReportesService'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { Reporte } from '../../domain/Reporte'

export interface AceptarReporteActionProps {
  readonly reporte: Reporte
  readonly httpClient: HttpClient
  readonly onAceptado?: () => void
  readonly onError?: (mensaje: string) => void
}

export const AceptarReporteAction: React.FC<AceptarReporteActionProps> = ({
  reporte,
  httpClient,
  onAceptado,
  onError,
}) => {
  const [cargando, setCargando] = useState(false)

  const servicio = React.useMemo(() => new ReportesService(httpClient), [httpClient])

  const puedeAceptar = !reporte.esEstadoFinal()

  const handleClick = async () => {
    setCargando(true)
    try {
      await servicio.aceptar(reporte)
      onAceptado?.()
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo aceptar el reporte.'
      onError?.(mensaje)
    } finally {
      setCargando(false)
    }
  }

  return (
    <AccionSensibleBoton
      etiqueta="Aceptar"
      sensible={false}
      onClick={handleClick}
      deshabilitado={!puedeAceptar || cargando}
    />
  )
}
