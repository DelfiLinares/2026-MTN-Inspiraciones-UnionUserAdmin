/**
 * Componente `CarpetaCard`: Tarjeta de presentación pura para una carpeta guardada.
 * Renderiza el nombre de la carpeta, la cantidad de publicaciones guardadas,
 * y los botones condicionales para renombrar y eliminar según permisos del dueño (RF-50, RF-53).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-09, RF-50 a RF-53)
 * - Union/specs/001-plataforma-unificada/tasks.md (T082)
 */

import React from 'react'
import { Carpeta } from '../../domain/Carpeta'

export interface CarpetaCardProps {
  carpeta: Carpeta
  usuarioActualId?: string
  onClick?: (carpetaId: string) => void
  onRenombrar?: (carpeta: Carpeta) => void
  onEliminar?: (carpeta: Carpeta) => void
}

export const CarpetaCard: React.FC<CarpetaCardProps> = ({
  carpeta,
  usuarioActualId = '',
  onClick,
  onRenombrar,
  onEliminar,
}) => {
  const puedeEditar = carpeta.puedeRenombrar(usuarioActualId)
  const puedeBorrar = carpeta.puedeEliminar(usuarioActualId)

  return (
    <div
      onClick={() => onClick?.(carpeta.id)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">{carpeta.nombre}</h3>
            <p className="text-xs text-gray-500">
              {carpeta.cantidadPosts} {carpeta.cantidadPosts === 1 ? 'publicación' : 'publicaciones'}
            </p>
          </div>
        </div>
      </div>

      {(puedeEditar || puedeBorrar) && (
        <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-end space-x-2">
          {puedeEditar && onRenombrar && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRenombrar(carpeta)
              }}
              className="text-xs font-medium text-gray-500 hover:text-indigo-600 transition-colors p-1 rounded hover:bg-indigo-50"
              title="Renombrar carpeta"
            >
              Renombrar
            </button>
          )}

          {puedeBorrar && onEliminar && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEliminar(carpeta)
              }}
              className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-50"
              title="Eliminar carpeta"
            >
              Eliminar
            </button>
          )}
        </div>
      )}
    </div>
  )
}
