/**
 * Componente `Skeleton`: Marcador de posición animado (shimmer) para estados de carga.
 * Presentación pura.
 */

import React from 'react'

export interface SkeletonProps {
  variante?: 'texto' | 'rectangular' | 'circular' | 'tarjeta'
  ancho?: string
  alto?: string
  cantidad?: number
  className?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variante = 'texto',
  ancho,
  alto,
  cantidad = 1,
  className = '',
}) => {
  const elementos = Array.from({ length: cantidad })

  const obtenerClaseBase = () => {
    switch (variante) {
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-xl'
      case 'tarjeta':
        return 'rounded-2xl border border-gray-100 p-4 space-y-3'
      case 'texto':
      default:
        return 'rounded-md'
    }
  }

  if (variante === 'tarjeta') {
    return (
      <div className="space-y-4 w-full">
        {elementos.map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 space-y-3 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              <div className="space-y-1.5 flex-1">
                <div className="h-3.5 bg-gray-200 rounded w-1/3"></div>
                <div className="h-2.5 bg-gray-100 rounded w-1/4"></div>
              </div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg w-full"></div>
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {elementos.map((_, i) => (
        <div
          key={i}
          style={{ width: ancho, height: alto }}
          className={`bg-gray-200 animate-pulse ${obtenerClaseBase()} ${!alto ? 'h-4' : ''} ${!ancho ? 'w-full' : ''}`}
        />
      ))}
    </div>
  )
}
