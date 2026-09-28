/**
 * `DesafiosAdminPage`: Pantalla de Gestión de Desafíos propuestos (módulo administrativo, HU-14).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T099) define esta pantalla
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/desafios/`. Por instrucción
 * explícita del usuario (misma confirmación que en T095/T096/T097A/T097B/T098A/T098B), la
 * implementación se coloca aquí, dentro de
 * `Union/specs/001-plataforma-unificada/frontend/src/presentation/desafios/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-14, RF-66 a RF-69, AC-14.1 a AC-14.5)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T099, depende de T067, T096B)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`GET /admin/desafios-propuestos`,
 *   `GET /admin/desafios-propuestos/{id}`, `POST .../aprobar`, `POST .../rechazar`)
 *
 * Criterios de aceptación cubiertos:
 * - AC-14.1 / RF-66: Listado de desafíos propuestos en estado PENDIENTE.
 * - AC-14.2 / RF-67: El detalle muestra la información completa del formulario de propuesta
 *   (`contenidoFormulario`).
 * - AC-14.3 / RF-68: "Aprobar" cambia el estado del desafío a APROBADO.
 * - AC-14.4 / RF-69: "Rechazar" cambia el estado del desafío a RECHAZADO.
 * - AC-14.5: Un desafío APROBADO o RECHAZADO no puede revertirse; aprobar/rechazar quedan
 *   deshabilitadas de forma permanente (`desafio.puedeAprobarse()` / `puedeRechazarse()`).
 * - Cada acción dispara `ConfirmacionAccionSensibleModal` (T096B) antes de ejecutarse.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  listarDesafiosPropuestos,
  obtenerDetalleDesafioPropuesto,
  aprobarDesafio,
  rechazarDesafio,
} from '../../services/DesafiosService'
import type { PaginaDesafiosPropuestos } from '../../services/DesafiosService'
import { DesafioPropuesto } from '../../domain/DesafioPropuesto'
import { Skeleton, Spinner, EmptyState } from '../../components/comunes'
import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'

type AccionDesafio = 'aprobar' | 'rechazar'

const TAMANO_PAGINA = 10

export const DesafiosAdminPage: React.FC = () => {
  const [pagina, setPagina] = useState(1)
  const [resultado, setResultado] = useState<PaginaDesafiosPropuestos | null>(null)
  const [cargando, setCargando] = useState(true)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const [desafioSeleccionado, setDesafioSeleccionado] = useState<DesafioPropuesto | null>(null)
  const [cargandoDetalle, setCargandoDetalle] = useState(false)
  const [errorDetalle, setErrorDetalle] = useState<string | null>(null)

  const [accionActiva, setAccionActiva] = useState<AccionDesafio | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [errorAccion, setErrorAccion] = useState<string | null>(null)

  const cargarListado = useCallback(async () => {
    setCargando(true)
    setErrorMensaje(null)
    try {
      const datos = await listarDesafiosPropuestos({ page: pagina, pageSize: TAMANO_PAGINA })
      setResultado(datos)
    } catch {
      setErrorMensaje('No se pudo cargar el listado de desafíos propuestos.')
    } finally {
      setCargando(false)
    }
  }, [pagina])

  useEffect(() => {
    cargarListado()
  }, [cargarListado])

  const totalPaginas = resultado ? Math.max(1, Math.ceil(resultado.total / TAMANO_PAGINA)) : 1

  const verDetalle = async (id: string) => {
    setCargandoDetalle(true)
    setErrorDetalle(null)
    try {
      const detalle = await obtenerDetalleDesafioPropuesto(id)
      setDesafioSeleccionado(detalle)
    } catch {
      setErrorDetalle('No se pudo cargar el detalle del desafío.')
    } finally {
      setCargandoDetalle(false)
    }
  }

  const volverAlListado = () => {
    setDesafioSeleccionado(null)
    setErrorDetalle(null)
  }

  const ejecutarAccion = async () => {
    if (!accionActiva || !desafioSeleccionado) {
      return
    }
    setProcesando(true)
    setErrorAccion(null)
    try {
      const actualizado =
        accionActiva === 'aprobar'
          ? await aprobarDesafio(desafioSeleccionado)
          : await rechazarDesafio(desafioSeleccionado)
      setDesafioSeleccionado(actualizado)
      setAccionActiva(null)
      cargarListado()
    } catch {
      setErrorAccion('No se pudo completar la acción. Intentá nuevamente.')
    } finally {
      setProcesando(false)
    }
  }

  if (desafioSeleccionado || cargandoDetalle || errorDetalle) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <button
            type="button"
            onClick={volverAlListado}
            className="mb-4 text-sm font-medium text-indigo-600 hover:text-indigo-800"
          >
            ← Volver al listado
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">Detalle del desafío propuesto</h1>

          {cargandoDetalle && <Spinner tamano="lg" texto="Cargando detalle..." />}

          {!cargandoDetalle && errorDetalle && (
            <EmptyState titulo="Error al cargar el detalle" mensaje={errorDetalle} />
          )}

          {!cargandoDetalle && !errorDetalle && desafioSeleccionado && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div>
                <span className="block text-xs font-medium text-gray-500">Estado</span>
                <span className="text-sm text-gray-900">{desafioSeleccionado.estado}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Formulario completo</span>
                <pre className="mt-1 text-xs bg-gray-50 border border-gray-100 rounded-lg p-3 overflow-x-auto">
                  {JSON.stringify(desafioSeleccionado.contenidoFormulario, null, 2)}
                </pre>
              </div>

              {errorAccion && (
                <p role="alert" className="text-xs text-red-600">
                  {errorAccion}
                </p>
              )}

              <div className="flex flex-wrap gap-2 pt-2" role="group" aria-label="Acciones sobre el desafío">
                <button
                  type="button"
                  onClick={() => setAccionActiva('aprobar')}
                  disabled={!desafioSeleccionado.puedeAprobarse()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  onClick={() => setAccionActiva('rechazar')}
                  disabled={!desafioSeleccionado.puedeRechazarse()}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                >
                  Rechazar
                </button>
              </div>
            </div>
          )}

          {accionActiva && (
            <ConfirmacionAccionSensibleModal
              abierto
              titulo={accionActiva === 'aprobar' ? 'Aprobar desafío' : 'Rechazar desafío'}
              mensaje={
                accionActiva === 'aprobar'
                  ? '¿Confirmás aprobar este desafío propuesto? La decisión es irreversible.'
                  : '¿Confirmás rechazar este desafío propuesto? La decisión es irreversible.'
              }
              variante={accionActiva === 'aprobar' ? 'informativa' : 'peligro'}
              confirmando={procesando}
              onConfirmar={ejecutarAccion}
              onCancelar={() => !procesando && setAccionActiva(null)}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestión de desafíos propuestos</h1>

        {cargando && <Skeleton variante="tarjeta" cantidad={3} />}

        {!cargando && errorMensaje && (
          <EmptyState
            titulo="Error al cargar los desafíos"
            mensaje={errorMensaje}
            onAccion={cargarListado}
            textoAccion="Reintentar"
          />
        )}

        {!cargando && !errorMensaje && resultado && resultado.items.length === 0 && (
          <EmptyState
            titulo="No hay desafíos pendientes"
            mensaje="No se encontraron desafíos propuestos pendientes de revisión."
          />
        )}

        {!cargando && !errorMensaje && resultado && resultado.items.length > 0 && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-100" aria-label="Listado de desafíos propuestos">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Autor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {resultado.items.map((desafio) => (
                    <tr key={desafio.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{desafio.titulo ?? desafio.id}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{desafio.autorId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{desafio.estado}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          type="button"
                          onClick={() => verDetalle(desafio.id)}
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
