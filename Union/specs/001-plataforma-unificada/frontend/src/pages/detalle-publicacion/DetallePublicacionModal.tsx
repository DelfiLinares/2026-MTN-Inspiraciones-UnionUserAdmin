/**
 * Modal/Pantalla de Detalle de Publicación — `DetallePublicacionModal.tsx`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-30 a RF-35, RF-48, RF-49, RF-52, CB-02, CB-03)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T089)
 *
 * Descripción:
 * - Vista ampliada de una `Publicacion` ya cargada por la pantalla de origen (Home o Descubrir),
 *   evitando depender de un endpoint de detalle no definido en `contracts/api-contracts.md`.
 * - Reutiliza `LikeButton` y `ReportButton` (T080) para alternar like y reportar, delegando en
 *   `publicacionService.alternarLike` (reversión optimista, CB-02).
 * - Reutiliza `GuardarEnCarpetaModal` (T082) para el flujo de guardado en carpeta, incluyendo el
 *   límite de 100 carpetas (RF-52) y el bloqueo mientras cargan las carpetas (CB-03).
 */

import React, { useState } from 'react'
import type { Publicacion } from '../../domain/Publicacion'
import type { Carpeta } from '../../domain/Carpeta'
import { LikeButton, ReportButton, TagChip } from '../../components/publicacion'
import { GuardarEnCarpetaModal } from '../../components/carpetas'
import { publicacionService } from '../../services/publicacionService'
import { carpetaService } from '../../services/carpetaService'

export interface DetallePublicacionModalProps {
  publicacion: Publicacion
  nombreAutor?: string
  fotoAutorUrl?: string
  usuarioActualId: string
  estaAutenticado: boolean
  onCerrar: () => void
  onPublicacionActualizada?: (publicacionActualizada: Publicacion) => void
  onReportar?: (publicacionId: string) => void
}

export const DetallePublicacionModal: React.FC<DetallePublicacionModalProps> = ({
  publicacion,
  nombreAutor = 'Usuario',
  fotoAutorUrl,
  usuarioActualId,
  estaAutenticado,
  onCerrar,
  onPublicacionActualizada,
  onReportar,
}) => {
  const [publicacionActual, setPublicacionActual] = useState<Publicacion>(publicacion)
  const [cargandoLike, setCargandoLike] = useState(false)

  const [modalCarpetaAbierto, setModalCarpetaAbierto] = useState(false)
  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [cargandoCarpetas, setCargandoCarpetas] = useState(false)
  const [errorCarpetas, setErrorCarpetas] = useState<string | null>(null)

  const handleToggleLike = async () => {
    setCargandoLike(true)
    try {
      const actualizada = await publicacionService.alternarLike(
        publicacionActual,
        usuarioActualId,
        estaAutenticado,
      )
      setPublicacionActual(actualizada)
      onPublicacionActualizada?.(actualizada)
    } catch {
      // El servicio ya revierte el estado optimista internamente ante fallo (CB-02)
    } finally {
      setCargandoLike(false)
    }
  }

  const handleAbrirGuardarEnCarpeta = async () => {
    setModalCarpetaAbierto(true)
    setCargandoCarpetas(true)
    setErrorCarpetas(null)
    try {
      const propias = await carpetaService.obtenerCarpetas(usuarioActualId)
      setCarpetas(propias)
    } catch {
      setErrorCarpetas('No se pudieron cargar tus carpetas.')
    } finally {
      setCargandoCarpetas(false)
    }
  }

  const handleGuardarEnCarpeta = async (carpetaId: string, publicacionId: string) => {
    await carpetaService.guardarPostEnCarpeta(carpetaId, publicacionId)
  }

  const handleCrearCarpeta = async (nombre: string, cantidadActual: number) => {
    const nueva = await carpetaService.crearCarpeta(nombre, cantidadActual)
    setCarpetas((actuales) => [...actuales, nueva])
    return nueva
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold overflow-hidden flex-shrink-0">
              {fotoAutorUrl ? (
                <img src={fotoAutorUrl} alt={nombreAutor} className="w-full h-full object-cover" />
              ) : (
                <span>{nombreAutor.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{nombreAutor}</h3>
              <span className="inline-block text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded capitalize">
                {publicacionActual.tipoContenido.toLowerCase()}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar detalle de publicación"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 cursor-pointer flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Contenido ampliado */}
        <div className="p-4 overflow-y-auto space-y-4">
          {publicacionActual.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {publicacionActual.tags.map((tag) => (
                <TagChip key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>

        {/* Acciones (Like, Reportar, Guardar en carpeta) */}
        <div className="flex items-center justify-between p-4 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <LikeButton
              cantidadLikes={publicacionActual.cantidadLikes}
              likeDelUsuarioActual={publicacionActual.likeDelUsuarioActual}
              cargando={cargandoLike}
              onToggleLike={handleToggleLike}
            />

            <ReportButton
              reportadaPorUsuarioActual={publicacionActual.reportadaPorUsuarioActual}
              onReportar={() => onReportar?.(publicacionActual.id)}
            />
          </div>

          <button
            type="button"
            onClick={handleAbrirGuardarEnCarpeta}
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
        </div>
      </div>

      {/* Modal anidado de Guardar en Carpeta (CB-03, RF-52) */}
      <GuardarEnCarpetaModal
        abierto={modalCarpetaAbierto}
        publicacionId={publicacionActual.id}
        carpetas={carpetas}
        cargandoCarpetas={cargandoCarpetas}
        errorCarpetas={errorCarpetas}
        onCerrar={() => setModalCarpetaAbierto(false)}
        onGuardar={handleGuardarEnCarpeta}
        onCrearCarpeta={handleCrearCarpeta}
      />
    </div>
  )
}
