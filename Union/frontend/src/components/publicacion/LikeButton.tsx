/**
 * Componente `LikeButton`: Botón de me gusta con contador e indicador de estado optimista.
 * Presentación pura.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-31, RF-32, CB-02)
 */

import React from 'react'

export interface LikeButtonProps {
  cantidadLikes: number
  likeDelUsuarioActual: boolean
  cargando?: boolean
  deshabilitado?: boolean
  onToggleLike: () => void
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  cantidadLikes,
  likeDelUsuarioActual,
  cargando = false,
  deshabilitado = false,
  onToggleLike,
}) => {
  return (
    <button
      type="button"
      onClick={onToggleLike}
      disabled={cargando || deshabilitado}
      aria-label={likeDelUsuarioActual ? 'Quitar Me gusta' : 'Dar Me gusta'}
      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        likeDelUsuarioActual
          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      } ${cargando || deshabilitado ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <svg
        className={`w-5 h-5 transition-transform ${likeDelUsuarioActual ? 'fill-rose-600 text-rose-600 scale-110' : 'text-gray-400'}`}
        fill={likeDelUsuarioActual ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      <span>{cantidadLikes}</span>
    </button>
  )
}
