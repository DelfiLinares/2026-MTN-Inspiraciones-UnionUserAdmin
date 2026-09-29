/**
 * `ModeracionAcciones`: Botones de acciones sensibles sobre un reporte/publicación en el módulo
 * de moderación — eliminar publicación y resolver sin eliminar (HU-11).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T098B) define este componente
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/moderacion/ModeracionAcciones.tsx`.
 * Por instrucción explícita del usuario (misma confirmación que en T095/T096/T097A/T097B/T098A),
 * la implementación se coloca aquí, dentro de
 * `Union/frontend/src/presentation/moderacion/`, sin leer ni
 * modificar ningún archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-63, RF-64, RF-80, AC-11.4 a AC-11.7)
 * - Union/specs/001-plataforma-unificada/tasks.md (T098B, depende de T066, T096B, T098A)
 * - Union/specs/001-plataforma-unificada/contracts/api-contracts.md (`DELETE /admin/publicaciones/{id}`,
 *   `POST /admin/reportes/{id}/resolver-sin-eliminar`)
 *
 * Criterios de aceptación cubiertos:
 * - RF-63 / AC-11.4 / AC-11.5: "Eliminar publicación" requiere confirmación explícita
 *   (`ConfirmacionAccionSensibleModal`); al confirmar, la publicación pasa a estado ELIMINADA. Se
 *   distingue visualmente como acción sensible (variante `peligro`).
 * - RF-64 / AC-11.6: "Resolver sin eliminar" requiere una acción explícita, cambia el estado del
 *   **reporte** (no de la publicación).
 * - AC-11.7 / RF-80: No distingue el rol del autor de la publicación; ambas acciones aplican por
 *   igual sin importar si el autor es USER o ADMIN.
 * - Ambas acciones se deshabilitan cuando el reporte ya no está pendiente
 *   (`reporte.puedeResolverseSinEliminar()` / `puedeResolverseConEliminacion()`) o cuando la
 *   publicación ya no puede eliminarse (`publicacion.puedeEliminarse()`).
 */

import React, { useState } from 'react'
import { Reporte } from '../../domain/Reporte'
import { PublicacionModeracion } from '../../domain/PublicacionModeracion'
import { eliminarPublicacion, resolverReporteSinEliminar } from '../../services/ModeracionService'
import { ConfirmacionAccionSensibleModal } from '../shared/ConfirmacionAccionSensibleModal'

type AccionModeracion = 'eliminarPublicacion' | 'resolverSinEliminar'

export interface ModeracionAccionesProps {
  reporte: Reporte
  publicacion: PublicacionModeracion
  onPublicacionEliminada?: () => void
  onReporteResuelto?: () => void
}

export const ModeracionAcciones: React.FC<ModeracionAccionesProps> = ({
  reporte,
  publicacion,
  onPublicacionEliminada,
  onReporteResuelto,
}) => {
  const [accionActiva, setAccionActiva] = useState<AccionModeracion | null>(null)
  const [procesando, setProcesando] = useState(false)
  const [errorMensaje, setErrorMensaje] = useState<string | null>(null)

  const puedeEliminarPublicacion =
    reporte.puedeResolverseConEliminacion() && publicacion.puedeEliminarse()
  const puedeResolverSinEliminar = reporte.puedeResolverseSinEliminar()

  const ejecutarAccion = async () => {
    if (!accionActiva) {
      return
    }
    setProcesando(true)
    setErrorMensaje(null)
    try {
      if (accionActiva === 'eliminarPublicacion') {
        // RF-63/AC-11.5: eliminar la publicación (no distingue rol del autor, RF-80/AC-11.7)
        await eliminarPublicacion(publicacion.id)
        onPublicacionEliminada?.()
      } else {
        // RF-64/AC-11.6: resuelve el reporte sin alterar la publicación
        await resolverReporteSinEliminar(reporte.id)
        onReporteResuelto?.()
      }
      setAccionActiva(null)
    } catch {
      setErrorMensaje('No se pudo completar la acción. Intentá nuevamente.')
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Acciones de moderación">
        <button
          type="button"
          onClick={() => setAccionActiva('eliminarPublicacion')}
          disabled={!puedeEliminarPublicacion}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
        >
          Eliminar publicación
        </button>

        <button
          type="button"
          onClick={() => setAccionActiva('resolverSinEliminar')}
          disabled={!puedeResolverSinEliminar}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
        >
          Resolver sin eliminar
        </button>
      </div>

      {errorMensaje && (
        <p role="alert" className="text-xs text-red-600">
          {errorMensaje}
        </p>
      )}

      {accionActiva === 'eliminarPublicacion' && (
        <ConfirmacionAccionSensibleModal
          abierto
          titulo="Eliminar publicación reportada"
          mensaje="¿Confirmás eliminar esta publicación? Pasará a estado ELIMINADA de forma permanente."
          variante="peligro"
          confirmando={procesando}
          onConfirmar={ejecutarAccion}
          onCancelar={() => !procesando && setAccionActiva(null)}
        />
      )}

      {accionActiva === 'resolverSinEliminar' && (
        <ConfirmacionAccionSensibleModal
          abierto
          titulo="Resolver reporte sin eliminar"
          mensaje="¿Confirmás marcar este reporte como resuelto sin eliminar la publicación asociada?"
          variante="advertencia"
          confirmando={procesando}
          onConfirmar={ejecutarAccion}
          onCancelar={() => !procesando && setAccionActiva(null)}
        />
      )}
    </div>
  )
}
