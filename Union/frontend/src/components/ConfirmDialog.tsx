/**
 * `ConfirmDialog`: Componente reutilizable para confirmaciones genéricas.
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/tasks.md (T006 - componentes reutilizados)
 * - Union/specs/003-desafios/plan.md (sección 4)
 *
 * Responsabilidades:
 * - Proporcionar un diálogo modal reutilizable para confirmaciones.
 * - Soportar variantes visuales (peligro, advertencia, informativa).
 * - Mantener accesibilidad con roles ARIA.
 */

import React from 'react'
import { useModalFocus } from '../presentation/admin/useModalFocus'

export type VarianteConfirmacion = 'peligro' | 'advertencia' | 'informativa'

export interface ConfirmDialogProps {
  abierto: boolean
  titulo: string
  mensaje: string
  variante?: VarianteConfirmacion
  textoConfirmar?: string
  textoCancelar?: string
  confirmando?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}

const CLASES_POR_VARIANTE: Record<VarianteConfirmacion, { boton: string; icono: string; halo: string }> = {
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

/**
 * Diálogo modal de confirmación reutilizable.
 *
 * @param abierto - Si el diálogo está visible.
 * @param titulo - Encabezado del diálogo.
 * @param mensaje - Cuerpo del mensaje.
 * @param variante - Estilo visual ('peligro', 'advertencia', 'informativa'). Por defecto 'informativa'.
 * @param textoConfirmar - Texto del botón de confirmación. Por defecto 'Confirmar'.
 * @param textoCancelar - Texto del botón de cancelación. Por defecto 'Cancelar'.
 * @param confirmando - Si la acción está en progreso (desactiva botones).
 * @param onConfirmar - Callback al confirmar.
 * @param onCancelar - Callback al cancelar.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  abierto,
  titulo,
  mensaje,
  variante = 'informativa',
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  confirmando = false,
  onConfirmar,
  onCancelar,
}) => {
  const modalRef = useModalFocus(abierto, onCancelar, confirmando)
  if (!abierto) {
    return null
  }

  const clases = CLASES_POR_VARIANTE[variante]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      ref={modalRef}
      tabIndex={-1}
      aria-modal="true"
      aria-labelledby="confirm-dialog-titulo"
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
            <h2 id="confirm-dialog-titulo" className="text-base font-semibold text-gray-900">
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
