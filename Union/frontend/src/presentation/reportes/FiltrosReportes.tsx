/**
 * `FiltrosReportes`: Panel de controles de filtro por estado de moderación, prioridad y motivo.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T054, depende de T011, T012, T013, T020, T053)
 * - Union/specs/002-frontend-admin/spec.md AC-06.2, RF-14
 *
 * Responsabilidades:
 * - Expone controles `<select>` para `estadoModeracion` (`EstadoModeracion`, T011), `prioridad`
 *   (`PrioridadReporte`, T013) y `motivo` (`MotivoReporte`, T012), cada uno con la opción "Todos"
 *   para no filtrar por ese campo (AC-06.2).
 * - Es un componente **controlado**: no mantiene su propio estado de filtro ni llama a ningún
 *   servicio. Recibe `filtros: FiltroReportes` (T020) y notifica los cambios mediante
 *   `onCambiarFiltros`, de forma que el estado de filtro activo viva en el componente padre
 *   (`ReportesPage.tsx`, T059) y pueda compartirse con `ReportesTable` (T053) y con la acción de
 *   exportar (`ExportarReportesBoton.tsx`, T059), ya que ambos viven en la misma pantalla `/reportes`
 *   (Clarifications Session 2026-10-01).
 */

import React from 'react'
import type { FiltroReportes } from '../../application/dto/FiltroReportes'
import { EstadoModeracion } from '../../domain/enums/EstadoModeracion'
import { PrioridadReporte } from '../../domain/enums/PrioridadReporte'
import { MotivoReporteAdmin as MotivoReporte } from '../../domain/enums/MotivoReporteAdmin'

export interface FiltrosReportesProps {
  readonly filtros: FiltroReportes
  readonly onCambiarFiltros: (filtros: FiltroReportes) => void
}

const OPCIONES_ESTADO_MODERACION = Object.values(EstadoModeracion)
const OPCIONES_PRIORIDAD = Object.values(PrioridadReporte)
const OPCIONES_MOTIVO = Object.values(MotivoReporte)

export const FiltrosReportes: React.FC<FiltrosReportesProps> = ({ filtros, onCambiarFiltros }) => {
  const handleCambiarEstadoModeracion = (evento: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value
    onCambiarFiltros({
      ...filtros,
      estadoModeracion: valor ? (valor as EstadoModeracion) : undefined,
    })
  }

  const handleCambiarPrioridad = (evento: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value
    onCambiarFiltros({
      ...filtros,
      prioridad: valor ? (valor as PrioridadReporte) : undefined,
    })
  }

  const handleCambiarMotivo = (evento: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = evento.target.value
    onCambiarFiltros({
      ...filtros,
      motivo: valor ? (valor as MotivoReporte) : undefined,
    })
  }

  return (
    <div className="filtros-reportes" aria-label="Filtros de reportes">
      <label>
        Estado
        <select
          aria-label="Filtrar por estado de moderación"
          value={filtros.estadoModeracion ?? ''}
          onChange={handleCambiarEstadoModeracion}
        >
          <option value="">Todos</option>
          {OPCIONES_ESTADO_MODERACION.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </label>

      <label>
        Prioridad
        <select
          aria-label="Filtrar por prioridad"
          value={filtros.prioridad ?? ''}
          onChange={handleCambiarPrioridad}
        >
          <option value="">Todas</option>
          {OPCIONES_PRIORIDAD.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </label>

      <label>
        Motivo
        <select
          aria-label="Filtrar por motivo"
          value={filtros.motivo ?? ''}
          onChange={handleCambiarMotivo}
        >
          <option value="">Todos</option>
          {OPCIONES_MOTIVO.map((valor) => (
            <option key={valor} value={valor}>
              {valor}
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
