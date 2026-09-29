/**
 * `DashboardPage`: Pantalla de Dashboard del módulo administrativo (HU-13).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T096) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/dashboard/`. Por instrucción
 * explícita del usuario para esta tarea puntual (misma confirmación que en T095), la
 * implementación se coloca aquí, dentro de
 * `Union/frontend/src/presentation/dashboard/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/` (solo se tomó como referencia de solo lectura
 * `Admin/my-proyect/frontend-admin/src/application/DashboardService.ts`).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-13, RF-54, RF-55)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T096, depende de T064)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/dashboard`)
 *
 * Criterios de aceptación cubiertos:
 * - HU-13: Muestra los 7 indicadores agregados del dashboard administrativo.
 * - RF-55: Los indicadores se muestran tal cual los entrega `dashboardService`, sin recalcularlos
 *   en el cliente.
 * - Estados de carga (`Spinner`) y de error (`EmptyState`) reutilizando componentes comunes.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { dashboardService } from '../../services/DashboardService'
import type { IndicadoresDashboard } from '../../services/DashboardService'
import { Spinner, EmptyState } from '../../components/comunes'

interface IndicadorTarjeta {
  clave: keyof IndicadoresDashboard
  etiqueta: string
}

const INDICADORES: IndicadorTarjeta[] = [
  { clave: 'reportesPendientes', etiqueta: 'Reportes pendientes' },
  { clave: 'usuariosActivos', etiqueta: 'Usuarios activos' },
  { clave: 'desafiosPendientes', etiqueta: 'Desafíos pendientes' },
  { clave: 'publicacionesActivas', etiqueta: 'Publicaciones activas' },
  { clave: 'publicacionesEliminadas', etiqueta: 'Publicaciones eliminadas' },
  { clave: 'usuariosBaneados', etiqueta: 'Usuarios baneados' },
  { clave: 'desafiosAprobadosRechazados', etiqueta: 'Desafíos decididos' },
]

export const DashboardPage: React.FC = () => {
  const [indicadores, setIndicadores] = useState<IndicadoresDashboard | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const cargarIndicadores = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      const datos = await dashboardService.obtenerIndicadores()
      setIndicadores(datos)
    } catch {
      setErrorMensaje('No se pudieron cargar los indicadores del dashboard.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarIndicadores()
  }, [cargarIndicadores])

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard administrativo</h1>

        {cargando && <Spinner tamano="lg" texto="Cargando indicadores..." />}

        {!cargando && errorMensaje && (
          <EmptyState
            titulo="Error al cargar el dashboard"
            mensaje={errorMensaje}
            onAccion={cargarIndicadores}
            textoAccion="Reintentar"
          />
        )}

        {!cargando && !errorMensaje && indicadores && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            aria-label="Indicadores del dashboard"
          >
            {INDICADORES.map(({ clave, etiqueta }) => (
              <div
                key={clave}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col space-y-1"
              >
                <span className="text-xs font-medium text-gray-500">{etiqueta}</span>
                <span className="text-3xl font-bold text-gray-900">{indicadores[clave] ?? 0}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
