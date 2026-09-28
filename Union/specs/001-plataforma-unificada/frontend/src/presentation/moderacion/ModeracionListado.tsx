/**
 * `ModeracionListado`: Pantalla de Moderación — listado paginado de reportes (HU-11).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T098A) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/moderacion/ModeracionListado.tsx`.
 * Por instrucción explícita del usuario (misma confirmación que en T095/T096/T097A/T097B), la
 * implementación se coloca aquí, dentro de
 * `Union/specs/001-plataforma-unificada/frontend/src/presentation/moderacion/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-11, RF-61, AC-11.1, AC-11.2)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T098A, depende de T066)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/publicaciones/reportadas`)
 *
 * Criterios de aceptación cubiertos:
 * - AC-11.1 / RF-61: Listado paginado, con una fila por cada reporte individual (resuelto A1); si
 *   una misma publicación tiene varios reportes, aparece una fila distinta por cada uno.
 * - AC-11.2: Filtros por motivo y estado, resueltos vía API (sin filtrar en memoria).
 * - Alcance de T098A: SOLO lectura (listado + filtros + paginación + navegación a detalle). Las
 *   acciones sensibles (eliminar publicación / resolver sin eliminar) quedan fuera de esta tarea y
 *   corresponden a T098B (`ModeracionAcciones`), pendiente de implementación separada.
 */

import React, { useCallback, useEffect, useState } from 'react'
import { listarPublicacionesReportadas } from '../../services/ModeracionService'
import type { PaginaModeracionReportes } from '../../services/ModeracionService'
import { MotivoReporteAdmin } from '../../domain/enums/MotivoReporteAdmin'
import { EstadoModeracion } from '../../domain/enums/EstadoModeracion'
import { Skeleton, EmptyState } from '../../components/comunes'
import { ModeracionDetalleReporte } from './ModeracionDetalleReporte'

const TAMANO_PAGINA = 10

const ETIQUETAS_MOTIVO: Record<MotivoReporteAdmin, string> = {
  [MotivoReporteAdmin.SPAM]: 'Spam',
  [MotivoReporteAdmin.CONTENIDO_INAPROPIADO]: 'Contenido inapropiado',
  [MotivoReporteAdmin.PLAGIO_DERECHOS_AUTOR]: 'Plagio / derechos de autor',
  [MotivoReporteAdmin.VIOLENCIA]: 'Violencia',
  [MotivoReporteAdmin.OTRO]: 'Otro',
}

const ETIQUETAS_ESTADO: Record<EstadoModeracion, string> = {
  [EstadoModeracion.PENDIENTE]: 'Pendiente',
  [EstadoModeracion.EN_REVISION]: 'En revisión',
  [EstadoModeracion.RESUELTO]: 'Resuelto',
  [EstadoModeracion.DESESTIMADO]: 'Desestimado',
}

export const ModeracionListado: React.FC = () => {
  const [motivo, setMotivo] = useState<MotivoReporteAdmin | ''>('')
  const [estado, setEstado] = useState<EstadoModeracion | ''>('')
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<PaginaModeracionReportes | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)
  const [reporteSeleccionadoId, setReporteSeleccionadoId] = useState<string | null>(null)

  const cargarReportes = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      const datos = await listarPublicacionesReportadas({
        motivo: motivo || undefined,
        estado: estado || undefined,
        page: pagina,
        pageSize: TAMANO_PAGINA,
      })
      setResultado(datos)
    } catch {
      setErrorMensaje('No se pudo cargar el listado de moderación.')
    } finally {
      setCargando(false)
    }
  }, [motivo, estado, pagina])

  useEffect(() => {
    cargarReportes()
  }, [cargarReportes])

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault()
    setPagina(1)
    cargarReportes()
  }

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / TAMANO_PAGINA)) : 1

  if (reporteSeleccionadoId) {
    return (
      <ModeracionDetalleReporte
        reporteId={reporteSeleccionadoId}
        onVolver={() => setReporteSeleccionadoId(null)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderación de publicaciones</h1>

        <form
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-col sm:flex-row gap-3"
          onSubmit={handleFiltrar}
          aria-label="Formulario de filtros de moderación"
        >
          <select
            value={motivo}
            onChange={(e) => setMotivo(e.target.value as MotivoReporteAdmin | '')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filtrar por motivo"
          >
            <option value="">Todos los motivos</option>
            {Object.values(MotivoReporteAdmin).map((m) => (
              <option key={m} value={m}>
                {ETIQUETAS_MOTIVO[m]}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoModeracion | '')}
            className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {Object.values(EstadoModeracion).map((e) => (
              <option key={e} value={e}>
                {ETIQUETAS_ESTADO[e]}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Filtrar
          </button>
        </form>

        {cargando && <Skeleton variante="tarjeta" cantidad={3} />}

        {!cargando && errorMensaje && (
          <EmptyState
            titulo="Error al cargar la moderación"
            mensaje={errorMensaje}
            onAccion={cargarReportes}
            textoAccion="Reintentar"
          />
        )}

        {!cargando && !errorMensaje && resultado && resultado.items.length === 0 && (
          <EmptyState
            titulo="No hay reportes"
            mensaje="No se encontraron reportes para los filtros seleccionados."
          />
        )}

        {!cargando && !errorMensaje && resultado && resultado.items.length > 0 && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100" aria-label="Listado de reportes">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Publicación</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Motivo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultado.items.map(({ reporte }) => (
                    <tr key={reporte.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{reporte.publicacionId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ETIQUETAS_MOTIVO[reporte.motivo]}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{ETIQUETAS_ESTADO[reporte.estado]}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(reporte.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={() => setReporteSeleccionadoId(reporte.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4">
              <button
                type="button"
                onClick={() => setPagina((p) => Math.max(1, p - 1))}
                disabled={pagina <= 1}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-500">
                Página {pagina} de {totalPaginas}
              </span>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina >= totalPaginas}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
