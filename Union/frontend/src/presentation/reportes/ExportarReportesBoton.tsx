/**
 * `ExportarReportesBoton`: Botón de exportación de reportes, integrado en la misma pantalla de
 * listado (`/reportes`), sin pantalla ni ruta separadas.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T059, depende de T054, T055, T057, T058, T052, T027)
 * - Union/specs/002-frontend-admin/spec.md HU-09, AC-09.1, AC-09.2, AC-09.3, AC-09.4
 * - Clarifications Session 2026-10-01: no existe `ExportacionPage.tsx` ni ruta `/reportes/exportar`
 *   separadas (T060/T061, fusionadas con T059).
 *
 * Responsabilidades:
 * - Consume `ExportacionService.exportar()` (T052), respetando el `FiltroReportes` activo recibido
 *   por prop desde `ReportesPage` (el mismo estado compartido con `FiltrosReportes`/`ReportesTable`,
 *   AC-09.1).
 * - Mientras se genera la exportación, deshabilita el botón y muestra un estado de carga claro sin
 *   bloquear el resto de la interfaz (AC-09.2).
 * - Si la exportación tiene éxito, ofrece un enlace de descarga claro hacia `urlDescarga` (AC-09.3).
 * - Si la exportación falla, expone el `mensajeError` del `ResultadoExportacion` mediante `onError`
 *   para que `ReportesPage` lo muestre con `MensajeError` (T027), de forma no bloqueante (AC-09.4).
 */

import React, { useState } from 'react'
import { ExportacionService } from '../../application/ExportacionService'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { FiltroReportes } from '../../application/dto/FiltroReportes'

export interface ExportarReportesBotonProps {
  readonly httpClient: HttpClient
  readonly filtros: FiltroReportes
  readonly onError?: (mensaje: string) => void
}

export const ExportarReportesBoton: React.FC<ExportarReportesBotonProps> = ({
  httpClient,
  filtros,
  onError,
}) => {
  const [cargando, setCargando] = useState(false)
  const [urlDescarga, setUrlDescarga] = useState<string | null>(null)

  const servicio = React.useMemo(() => new ExportacionService(httpClient), [httpClient])

  const handleClick = async () => {
    setCargando(true)
    setUrlDescarga(null)
    try {
      const resultado = await servicio.exportar(filtros)
      if (resultado.exitoso) {
        setUrlDescarga(resultado.urlDescarga ?? null)
      } else {
        onError?.(resultado.mensajeError ?? 'Error: Reporte no generado.')
      }
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="exportar-reportes-boton">
      <button type="button" onClick={handleClick} disabled={cargando}>
        {cargando ? 'Exportando…' : 'Exportar'}
      </button>

      {urlDescarga !== null && (
        <a href={urlDescarga} target="_blank" rel="noreferrer">
          Descargar archivo exportado
        </a>
      )}
    </div>
  )
}
