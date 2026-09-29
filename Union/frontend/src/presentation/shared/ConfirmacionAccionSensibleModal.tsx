/**
 * `ConfirmacionAccionSensibleModal`: Modal de confirmación explícita reutilizable para toda acción
 * sensible del módulo administrativo (banear, eliminar, promover, degradar, eliminar publicación,
 * resolver reporte, aprobar/rechazar desafío).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T096B) define este componente
 * dentro de `Admin/my-proyect/frontend-admin/src/presentation/shared/`. Es una dependencia dura de
 * T097B (`UsuarioAccionesSensibles`), por lo que se crea aquí, dentro de
 * `Union/frontend/src/presentation/shared/`, siguiendo la misma
 * instrucción explícita autorizada para T095/T096/T097A (implementar dentro de Union frontend, sin
 * leer ni modificar ningún archivo del proyecto `Admin/`).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RNF-07, RF-60/RNF-08)
 * - Union/specs/001-plataforma-unificada/tasks.md (T096B)
 *
 * Responsabilidades:
 * - RNF-07: Centraliza la confirmación explícita del 100% de las acciones destructivas/sensibles
 *   en un único componente, en vez de duplicar el modal por pantalla.
 * - RF-60 / RNF-08: Diferenciación visual de las acciones sensibles (variante `peligro` con colores
 *   de advertencia, ícono distintivo) respecto de acciones no sensibles.
 */

import React from 'react'

export type VarianteAccionSensible = 'peligro' | 'advertencia' | 'informativa'

export interface ConfirmacionAccionSensibleModalProps {
  abierto: boolean
  titulo: string
  mensaje: string
  variante?: VarianteAccionSensible
  textoConfirmar?: string
  textoCancelar?: string
  confirmando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

const CLASES_POR_VARIANTE: Record<VarianteAccionSensible, { boton: string; icono: string; halo: string }> = {
  peligro: {
    boton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    icono: 'text-red-600 bg-red-50',
    halo: 'border-red-200',
  },
  advertencia: {
    boton: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400',
    icono: 'text-amber-600 bg-amber-50',
    halo: 'border-amber-200',
  },
  informativa: {
    boton: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    icono: 'text-indigo-600 bg-indigo-50',
    halo: 'border-indigo-200',
  },
}

export const ConfirmacionAccionSensibleModal: React.FC<ConfirmacionAccionSensibleModalProps> = ({
  abierto,
  titulo,
  mensaje,
  variante = 'peligro',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  confirmando = false,
  onConfirmar,
  onCancelar,
}) => {
  if (!abierto) {
    return null
  }

  const clases = CLASES_POR_VARIANTE[variante]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmacion-accion-sensible-titulo"
    >
      <div className={`bg-white rounded-2xl shadow-xl border ${clases.halo} max-w-md w-full p-6 space-y-4`}>
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${clases.icono}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <div>
            <h2 id="confirmacion-accion-sensible-titulo" className="text-base font-semibold text-gray-900">
              {titulo}
            </h2>
            <p className="mt-1 text-sm text-gray-600">{mensaje}</p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onCancelar}
            disabled={confirmando}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {textoCancelar}
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            disabled={confirmando}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${clases.boton}`}
          >
            {confirmando ? 'Procesando...' : textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
