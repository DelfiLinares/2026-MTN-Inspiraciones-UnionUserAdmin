/**
 * Componente `ReportButton`: Botón para reportar una publicación o abrir el modal de reporte.
 * Presentación pura.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-33, RF-34, AC-07.1)
 */

import React from 'react'

export interface ReportButtonProps {
  reportadaPorUsuarioActual: boolean
  cargando?: boolean
  deshabilitado?: boolean
  onReportar: () => void
}

export const ReportButton: React.FC<ReportButtonProps> = ({
  reportadaPorUsuarioActual,
  cargando = false,
  deshabilitado = false,
  onReportar,
}) => {
  return (
    <button
      type="button"
      onClick={onReportar}
      disabled={reportadaPorUsuarioActual || cargando || deshabilitado}
      aria-label={reportadaPorUsuarioActual ? 'Publicación reportada' : 'Reportar publicación'}
      title={reportadaPorUsuarioActual ? 'Ya reportaste esta publicación' : 'Reportar publicación'}
      className={`inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
        reportadaPorUsuarioActual
          ? 'bg-amber-100 text-amber-800 cursor-default'
          : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 cursor-pointer'
      } ${cargando || deshabilitado ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>{reportadaPorUsuarioActual ? 'Reportada' : 'Reportar'}</span>
    </button>
  )
}
