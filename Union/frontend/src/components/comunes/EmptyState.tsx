/**
 * Componente `EmptyState`: Mensaje reutilizable para listas o búsquedas sin resultados.
 * Presentación pura.
 */

import React from 'react'

export interface EmptyStateProps {
  titulo?: string
  mensaje?: string
  icono?: React.ReactNode
  onAccion?: () => void
  textoAccion?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  titulo = 'No hay resultados',
  mensaje = 'No se encontraron elementos para mostrar.',
  icono,
  onAccion,
  textoAccion,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-dashed border-gray-200 my-4 space-y-3">
      <div className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center">
        {icono ?? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{titulo}</h3>
      <p className="text-xs text-gray-500 max-w-sm">{mensaje}</p>
      {onAccion && textoAccion && (
        <button
          type="button"
          onClick={onAccion}
          className="mt-2 px-4 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
        >
          {textoAccion}
        </button>
      )}
    </div>
  )
}
