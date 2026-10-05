/**
 * `ReportesPage`: Página contenedora de la pantalla de revisión de reportes (ver, aceptar,
 * rechazar) y exportación.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T030; T059, depende de T054, T055, T057, T058, T052,
 *   T027)
 * - Union/specs/002-frontend-admin/spec.md AC-07.5, AC-08.5, AC-09.1, AC-09.2, AC-09.3, AC-09.4
 * - Clarifications Session 2026-10-01: la acción de exportar es un botón dentro de esta misma
 *   pantalla (`ExportarReportesBoton`), reutilizando el `FiltroReportes` activo de
 *   `FiltrosReportes`. No existe `ExportacionPage.tsx` ni ruta `/reportes/exportar` separadas
 *   (T060/T061, fusionadas con esta tarea).
 *
 * Nota de colisión de nombres: `Union/frontend/src/presentation/reportes/` ya contenía
 * `ReportesAnaliticaPage.tsx` (preexistente, de `001-plataforma-unificada`, T101: dashboard de
 * analíticas administrativas, no relacionado con moderación de reportes). Este archivo,
 * `ReportesPage.tsx`, es la pantalla del módulo `002-frontend-admin` (revisión/moderación de
 * reportes de contenido), una entidad y propósito completamente distintos; ambos conviven en la
 * misma carpeta sin conflicto de nombre de archivo.
 *
 * Responsabilidades:
 * - Mantiene el estado de filtro activo (`FiltroReportes`, T020) en esta página, compartido entre
 *   `FiltrosReportes` (T054), `ReportesTable` (T053) y `ExportarReportesBoton` (T059).
 * - Cablea `ReportesTable` con `AceptarReporteAction` (T057) y `RechazarReporteAction` (T058)
 *   mediante la prop `renderAcciones` (mismo patrón que `UsuariosPage`/`PublicacionesPage`, T038/
 *   T046).
 * - Un botón "Ver detalle" por fila alterna la visibilidad de `ReporteDetalle` (T056, consulta
 *   inline), evitando mostrar los detalles de las 10 filas simultáneamente.
 * - Maneja el error no bloqueante de aceptar/rechazar/exportar vía `MensajeError` (T027), conforme
 *   a AC-07.5, AC-08.5 y AC-09.4. El estado del reporte no cambia en la interfaz si la operación
 *   falla: solo se recarga el listado (`recargar`) cuando la acción tiene éxito.
 *
 * Nota sobre el `HttpClient`: al igual que `UsuariosPage`/`PublicacionesPage`, recibe `httpClient`
 * como prop (inyección de dependencias), ya que este módulo aún no cuenta con una implementación
 * concreta del puerto `HttpClient` (T031 solo define la interfaz).
 */

import React, { useState } from 'react'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { FiltroReportes } from '../../application/dto/FiltroReportes'
import { ReportesTable } from './ReportesTable'
import { FiltrosReportes } from './FiltrosReportes'
import { ReporteDetalle } from './ReporteDetalle'
import { AceptarReporteAction } from './AceptarReporteAction'
import { RechazarReporteAction } from './RechazarReporteAction'
import { ExportarReportesBoton } from './ExportarReportesBoton'
import { MensajeError } from '../shared/MensajeError'

export interface ReportesPageProps {
  readonly httpClient: HttpClient
}

export const ReportesPage: React.FC<ReportesPageProps> = ({ httpClient }) => {
  const [filtros, setFiltros] = useState<FiltroReportes>({})
  const [mensajeError, setMensajeError] = useState<string | null>(null)
  const [idEnDetalle, setIdEnDetalle] = useState<string | null>(null)

  return (
    <section>
      <h1>Reportes</h1>

      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      <FiltrosReportes filtros={filtros} onCambiarFiltros={setFiltros} />

      <ExportarReportesBoton httpClient={httpClient} filtros={filtros} onError={setMensajeError} />

      <ReportesTable
        httpClient={httpClient}
        filtros={filtros}
        renderAcciones={(reporte, recargar) => (
          <>
            <button type="button" onClick={() => setIdEnDetalle(reporte.id)}>
              Ver detalle
            </button>
            <AceptarReporteAction
              reporte={reporte}
              httpClient={httpClient}
              onAceptado={recargar}
              onError={setMensajeError}
            />
            <RechazarReporteAction
              reporte={reporte}
              httpClient={httpClient}
              onRechazado={recargar}
              onError={setMensajeError}
            />
            {idEnDetalle === reporte.id && (
              <ReporteDetalle httpClient={httpClient} reporteId={reporte.id} />
            )}
          </>
        )}
      />
    </section>
  )
}

