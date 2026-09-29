/**
 * Componente `Spinner`: Indicador visual de carga circular reutilizable.
 * Presentación pura.
 */

import React from 'react'

export interface SpinnerProps {
  tamano?: 'sm' | 'md' | 'lg'
  texto?: string
  claseColor?: string
}

export const Spinner: React.FC<SpinnerProps> = ({
  tamano = 'md',
  texto,
  claseColor = 'text-indigo-600',
}) => {
  const tamanosClases = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-2">
      <div
        className={`${tamanosClases[tamano]} ${claseColor} border-current border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="Cargando"
      />
      {texto && <span className="text-xs font-medium text-gray-500">{texto}</span>}
    </div>
  )
}
