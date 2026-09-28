/**
 * Componente `FiltroChip`: Renderiza un chip de filtro activo individual removible.
 * Presentación pura.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-42)
 * - Union/specs/001-plataforma-unificada/tasks.md (T081)
 */

import React from 'react'
import { TipoFiltro } from '../../domain/enums/TipoFiltro'

export interface FiltroChipProps {
  tipo: TipoFiltro
  valor: string
  onRemover: (tipo: TipoFiltro) => void
  etiquetaCustom?: string
}

export const FiltroChip: React.FC<FiltroChipProps> = ({
  tipo,
  valor,
  onRemover,
  etiquetaCustom,
}) => {
  const textoEtiqueta = etiquetaCustom ?? `${tipo}: ${valor}`

  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 shadow-sm">
      <span>{textoEtiqueta}</span>
      <button
        type="button"
        onClick={() => onRemover(tipo)}
        aria-label={`Quitar filtro ${textoEtiqueta}`}
        className="p-0.5 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-200 rounded-full transition-colors cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </span>
  )
}
