/**
 * Componente `PublicacionCard`: Tarjeta de presentación pura para una publicación.
 * Ensambla los datos de la entidad `Publicacion`, avatar del autor, tipo de contenido,
 * lista de tags (`TagChip`), me gusta (`LikeButton`), reporte (`ReportButton`) y opción de guardar en carpeta.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-02, HU-03, RF-31 a RF-34, RF-49)
 * - Union/specs/001-plataforma-unificada/tasks.md (T080)
 */

import React from 'react'
import { Publicacion } from '../../domain/Publicacion'
import { LikeButton } from './LikeButton'
import { ReportButton } from './ReportButton'
import { TagChip } from './TagChip'

export interface PublicacionCardProps {
  publicacion: Publicacion
  nombreAutor?: string
  fotoAutorUrl?: string
  onToggleLike?: (publicacionId: string) => void
  onReportar?: (publicacionId: string) => void
  onGuardarEnCarpeta?: (publicacionId: string) => void
  onTagClick?: (tag: string) => void
  cargandoLike?: boolean
  cargandoReporte?: boolean
}

export const PublicacionCard: React.FC<PublicacionCardProps> = ({
  publicacion,
  nombreAutor = 'Usuario',
  fotoAutorUrl,
  onToggleLike,
  onReportar,
  onGuardarEnCarpeta,
  onTagClick,
  cargandoLike = false,
  cargandoReporte = false,
}) => {
  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Cabecera del autor */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-50">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold overflow-hidden flex-shrink-0">
          {fotoAutorUrl ? (
            <img src={fotoAutorUrl} alt={nombreAutor} className="w-full h-full object-cover" />
          ) : (
            <span>{nombreAutor.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{nombreAutor}</h3>
          <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded capitalize">
            {publicacion.tipoContenido.toLowerCase()}
          </span>
        </div>
      </div>

      {/* Tags de la publicación */}
      {publicacion.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pt-3">
          {publicacion.tags.map((tag) => (
            <TagChip key={tag} tag={tag} onClick={onTagClick} />
          ))}
        </div>
      )}

      {/* Acciones e interactividad (Likes, Reporte, Guardar) */}
      <div className="flex items-center justify-between p-4 pt-3 border-t border-gray-50 mt-2">
        <div className="flex items-center space-x-2">
          <LikeButton
            cantidadLikes={publicacion.cantidadLikes}
            likeDelUsuarioActual={publicacion.likeDelUsuarioActual}
            cargando={cargandoLike}
            onToggleLike={() => onToggleLike?.(publicacion.id)}
          />

          <ReportButton
            reportadaPorUsuarioActual={publicacion.reportadaPorUsuarioActual}
            cargando={cargandoReporte}
            onReportar={() => onReportar?.(publicacion.id)}
          />
        </div>

        {onGuardarEnCarpeta && (
          <button
            type="button"
            onClick={() => onGuardarEnCarpeta(publicacion.id)}
            aria-label="Guardar en carpeta"
            title="Guardar en carpeta"
            className="p-1.5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
      </div>
    </article>
  )
}
