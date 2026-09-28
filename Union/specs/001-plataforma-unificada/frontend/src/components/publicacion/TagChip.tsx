/**
 * Componente `TagChip`: Renderiza una etiqueta/tag individual de la publicación.
 * Presentación pura.
 */

import React from 'react'

export interface TagChipProps {
  tag: string
  onClick?: (tag: string) => void
  seleccionado?: boolean
}

export const TagChip: React.FC<TagChipProps> = ({ tag, onClick, seleccionado = false }) => {
  const textoFormateado = tag.startsWith('#') ? tag : `#${tag}`

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
        seleccionado
          ? 'bg-indigo-600 text-white hover:bg-indigo-700'
          : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
      }`}
      onClick={() => onClick?.(tag)}
    >
      {textoFormateado}
    </span>
  )
}
