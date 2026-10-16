/**
 * `ReportesTable`: Tabla de listado de reportes con columnas de estado, motivo y prioridad
 * visibles, y paginación.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T053, depende de T011, T012, T013, T030, T050a)
 * - Union/specs/002-frontend-admin/spec.md AC-06.1, AC-06.5, RNF-02
 *
 * Responsabilidades:
 * - Consume `ReportesService.listar()` (T050a) para obtener una página de reportes.
 * - Muestra columnas: id, motivo (`MotivoReporte`, T012), prioridad (`PrioridadReporte`, T013) y
 *   estado de moderación (`EstadoModeracion`, T011) de cada reporte (AC-06.1).
 * - Controles de paginación simples (AC-06.5): no carga todos los reportes en memoria, solo la
 *   página activa.
 * - Recibe los filtros activos (`FiltroReportes`, T020) como prop controlada desde afuera: el panel
 *   de controles de filtro (`FiltrosReportes.tsx`, T054) vive fuera de esta tabla y comparte su
 *   estado con la acción de exportar en la misma pantalla `/reportes` (Clarifications Session
 *   2026-10-01). `ReportesTable` no implementa la UI de filtro por sí misma.
 * - Sin lógica de negocio sobre acciones sensibles (aceptar/rechazar): eso corresponde a
 *   `AceptarReporteAction`/`RechazarReporteAction` (T057/T058, pendientes), que se renderizarán
 *   como columna de acciones mediante una prop `renderAcciones` (mismo patrón que
 *   `UsuariosTable`/`PublicacionesTable`, T035/T043), en una integración posterior (T059).
 * - El resaltado visual de reportes `PENDIENTE` (AC-06.3) se delega a `EstadoModeracionBadge.tsx`
 *   (T055, pendiente); esta tabla solo expone el valor crudo del estado en su columna por ahora.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { ReportesService } from '../../application/ReportesService'
import type { FiltroReportes } from '../../application/dto/FiltroReportes'
import type { HttpClient } from '../../infrastructure/AdminHttpClientPort'
import type { Reporte } from '../../domain/Reporte'
import { EstadoVacio } from '../shared/EstadoVacio'
import { MensajeError } from '../shared/MensajeError'

const TAMANO_PAGINA = 10

export interface ReportesTableProps {
  readonly httpClient: HttpClient
  readonly filtros?: FiltroReportes
  readonly renderAcciones?: (reporte: Reporte, recargar: () => void) => React.ReactNode
}

export const ReportesTable: React.FC<ReportesTableProps> = ({ httpClient, filtros, renderAcciones }) => {
  const [pagina, setPagina] = useState(1)
  const [items, setItems] = useState<Reporte[]>([])
  const [total, setTotal] = useState(0)
  const [cargando, setCargando] = useState(true)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  const servicio = React.useMemo(() => new ReportesService(httpClient), [httpClient])

  const cargarReportes = useCallback(async () => {
    setCargando(true)
    setMensajeError(null)
    try {
      const resultado = await servicio.listar({
        page: pagina,
        pageSize: TAMANO_PAGINA,
        estadoModeracion: filtros?.estadoModeracion,
        prioridad: filtros?.prioridad,
        motivo: filtros?.motivo,
      })
      setItems(resultado.items)
      setTotal(resultado.total)
    } catch {
      setMensajeError('No se pudo cargar el listado de reportes.')
    } finally {
      setCargando(false)
    }
  }, [servicio, pagina, filtros?.estadoModeracion, filtros?.prioridad, filtros?.motivo])

  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

  useEffect(() => {
    setPagina(1)
  }, [filtros?.estadoModeracion, filtros?.prioridad, filtros?.motivo])

  const totalPaginas = Math.max(1, Math.ceil(total / TAMANO_PAGINA))

  return (
    <div className="reportes-table">
      {mensajeError !== null && <MensajeError mensaje={mensajeError} />}

      {!cargando && items.length === 0 ? (
        <EstadoVacio mensaje="No hay reportes para mostrar." />
      ) : (
        <table className="admin-tabla">
          <thead>
            <tr>
              <th>Id</th>
              <th>Motivo</th>
              <th>Prioridad</th>
              <th>Estado de moderación</th>
              {renderAcciones && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((reporte) => (
              <tr key={reporte.id}>
                <td>{reporte.id}</td>
                <td>{reporte.motivo}</td>
                <td>{reporte.prioridad ?? '—'}</td>
                <td>{reporte.estado}</td>
                {renderAcciones && <td>{renderAcciones(reporte, cargarReportes)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="reportes-table__paginacion">
        <button type="button" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
          Anterior
        </button>
        <span>
          Página {pagina} de {totalPaginas}
        </span>
        <button
          type="button"
          disabled={pagina >= totalPaginas}
          onClick={() => setPagina((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}
