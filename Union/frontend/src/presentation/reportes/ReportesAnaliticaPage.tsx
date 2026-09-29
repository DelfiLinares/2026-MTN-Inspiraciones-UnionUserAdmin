/**
 * `ReportesAnaliticaPage`: Pantalla de Reportes y Analíticas exportables (módulo administrativo,
 * HU-15).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T100) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/reportes/`. Por instrucción
 * explícita del usuario (misma confirmación que en T095/T096/T097A/T097B/T098A/T098B/T099), la
 * implementación se coloca aquí, dentro de
 * `Union/frontend/src/presentation/reportes/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-15, RF-71 a RF-74, AC-15.1 a AC-15.4)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T100, depende de T068)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/analiticas`,
 *   `POST /admin/reportes-analiticas/exportaciones`)
 *
 * Criterios de aceptación cubiertos:
 * - AC-15.1 / RF-71: Muestra los datos agregados de analíticas provistos por el backend, tratando
 *   su estructura como genérica (`Record<string, unknown>`, ambigüedad B3).
 * - AC-15.2 / RF-72/RF-73: Solicitar una exportación es una operación SÍNCRONA: el botón queda
 *   deshabilitado mientras se espera la respuesta, que entrega directamente el resultado.
 * - AC-15.3: Si la exportación tiene éxito (`fueExitosa()`), se ofrece un enlace de descarga usando
 *   `urlDescarga` (URL opaca, ambigüedad B5).
 * - AC-15.4 / RF-74: Si el backend falla al generar el archivo, se muestra el mensaje obligatorio
 *   "Error: Reporte no generado."
 */

import React, { useCallback, useEffect, useState } from 'react'
import { obtenerAnaliticas, exportarReporteAnalitica } from '../../services/ReportesAnaliticaService'
import type { ExportacionReporte } from '../../domain/ExportacionReporte'
import { Spinner, EmptyState } from '../../components/comunes'

export const ReportesAnaliticaPage: React.FC = () => {
  const [analiticas, setAnaliticas] = useState<Record<string, unknown> | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const [exportando, setExportando] = useState(false)
  const [exportacion, setExportacion] = useState<ExportacionReporte | null>(null)

  const cargarAnaliticas = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      const datos = await obtenerAnaliticas()
      setAnaliticas(datos)
    } catch {
      setErrorMensaje('No se pudieron cargar las analíticas.')
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarAnaliticas()
  }, [cargarAnaliticas])

  const handleExportar = async () => {
    setExportando(true)
    setExportacion(null)
    try {
      // AC-15.2 / RF-72 / RF-73: operación síncrona, espera hasta tener el resultado final.
      const resultado = await exportarReporteAnalitica({})
      setExportacion(resultado)
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportes y analíticas</h1>

        {cargando && <Spinner tamano="lg" texto="Cargando analíticas..." />}

        {!cargando && errorMensaje && (
          <EmptyState
            titulo="Error al cargar las analíticas"
            mensaje={errorMensaje}
            onAccion={cargarAnaliticas}
            textoAccion="Reintentar"
          />
        )}

        {!cargando && !errorMensaje && analiticas && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Datos agregados</h2>
            <pre className="text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto">
              {JSON.stringify(analiticas, null, 2)}
            </pre>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Exportar reporte</h2>

          <button
            type="button"
            onClick={handleExportar}
            disabled={exportando}
            className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {exportando ? 'Generando reporte...' : 'Exportar reporte'}
          </button>

          {exportacion && exportacion.fueExitosa() && (
            <div
              role="status"
              className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm"
            >
              Reporte generado correctamente.{' '}
              <a
                href={exportacion.urlDescarga}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline"
              >
                Descargar archivo
              </a>
            </div>
          )}

          {exportacion && !exportacion.fueExitosa() && (
            <div
              role="alert"
              className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm"
            >
              {exportacion.errorMensaje}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
