/**
 * `ModeracionDetalleReporte`: Componente de detalle de un reporte individual (HU-11).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T098A) define este componente
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/moderacion/ModeracionDetalleReporte.tsx`.
 * Por instrucción explícita del usuario (misma confirmación que en T095/T096/T097A/T097B), la
 * implementación se coloca aquí, dentro de
 * `Union/specs/001-plataforma-unificada/frontend/src/presentation/moderacion/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-11, RF-62, RF-65, AC-11.3)
 * - Union/specs/001-plataforma-unificada/tasks.md (T098A, depende de T066)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/reportes/{id}`)
 *
 * Criterios de aceptación cubiertos:
 * - AC-11.3: Muestra motivo, fecha, publicación asociada y reportante.
 * - RF-65: Muestra prioridad/antigüedad del reporte.
 * - Alcance de T098A: SOLO lectura. Las acciones sensibles (eliminar publicación / resolver sin
 *   eliminar) quedan fuera de esta tarea y corresponden a T098B (`ModeracionAcciones`).
 */

import React, { useEffect, useState } from 'react'
import { obtenerDetalleReporte } from '../../services/ModeracionService'
import type { DetalleReporteModeracion } from '../../services/ModeracionService'
import { Spinner, EmptyState } from '../../components/comunes'

export interface ModeracionDetalleReporteProps {
  reporteId: string
  onVolver: () => void
}

export const ModeracionDetalleReporte: React.FC<ModeracionDetalleReporteProps> = ({
  reporteId,
  onVolver,
}) => {
  const [detalle, setDetalle] = useState<DetalleReporteModeracion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    const cargar = async () => {
      setCargando(true)
      setErrorMensaje(null)
      try {
        const datos = await obtenerDetalleReporte(reporteId)
        if (!cancelado) {
          setDetalle(datos)
        }
      } catch {
        if (!cancelado) {
          setErrorMensaje('No se pudo cargar el detalle del reporte.')
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    cargar()

    return () => {
      cancelado = true
    }
  }, [reporteId])

  const calcularAntiguedadDias = (fecha: string): number => {
    const diferencia = Date.now() - new Date(fecha).getTime()
    return Math.max(0, Math.floor(diferencia / (24 * 60 * 60 * 1000)))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <button
          type="button"
          onClick={onVolver}
          className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
        >
          ← Volver al listado
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Detalle del reporte</h1>

        {cargando && <Spinner tamano="lg" texto="Cargando detalle..." />}

        {!cargando && errorMensaje && (
          <EmptyState titulo="Error al cargar el detalle" mensaje={errorMensaje} />
        )}

        {!cargando && !errorMensaje && detalle && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-xs font-medium text-gray-500">Motivo</span>
                <span className="text-sm text-gray-900">{detalle.reporte.motivo}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Estado</span>
                <span className="text-sm text-gray-900">{detalle.reporte.estado}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Publicación</span>
                <span className="text-sm text-gray-900">{detalle.publicacion.id}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Autor de la publicación</span>
                <span className="text-sm text-gray-900">{detalle.publicacion.autorId}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Reportante</span>
                <span className="text-sm text-gray-900">{detalle.reportanteId}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Fecha del reporte</span>
                <span className="text-sm text-gray-900">
                  {new Date(detalle.reporte.fecha).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Antigüedad</span>
                <span className="text-sm text-gray-900">
                  {calcularAntiguedadDias(detalle.reporte.fecha)} día(s)
                </span>
              </div>
              {detalle.reporte.prioridad && (
                <div>
                  <span className="block text-xs font-medium text-gray-500">Prioridad</span>
                  <span className="text-sm text-gray-900">{detalle.reporte.prioridad}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
