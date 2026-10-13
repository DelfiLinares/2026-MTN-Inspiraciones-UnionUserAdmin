import React, { useMemo } from 'react'
import { RespuestaDesafio } from '../../domain/RespuestaDesafio'
import {
  ContenidoImagenRespuesta,
  ContenidoVideoRespuesta,
  ContenidoAudioRespuesta,
} from '../../domain/RespuestaDesafio'

export interface ListaRespuestasProps {
  /**
   * Lista de respuestas a mostrar.
   * Fuente: RespuestaDesafio entities
   */
  respuestas: RespuestaDesafio[]

  /**
   * Sesión actual del usuario para determinar permisos.
   * Formato: { usuarioId: string; rol: 'USER' | 'ADMIN' }
   * Fuente: specs/003-desafios/data-model.md (sección 4.3)
   */
  sesionActual?: { usuarioId: string; rol: 'USER' | 'ADMIN' }

  /**
   * Callback al hacer clic en editar una respuesta.
   * Recibe el id de la respuesta y el objeto RespuestaDesafio completo.
   */
  onEditar?: (respuestaId: string, respuesta: RespuestaDesafio) => void

  /**
   * Callback al hacer clic en eliminar una respuesta.
   * Recibe el id de la respuesta.
   */
  onEliminar?: (respuestaId: string) => void

  /**
   * Clase CSS adicional para el contenedor principal.
   */
  className?: string

  /**
   * Mensaje a mostrar cuando no hay respuestas.
   */
  mensajeVacio?: string
}

/**
 * Componente ListaRespuestas
 *
 * Presenta una lista de respuestas a un desafío.
 * Para cada respuesta muestra:
 * - Autor
 * - Contenido (imagen, video o audio con preview)
 * - Acciones (editar/eliminar) según permisos
 *
 * Sin lógica propia: solo presentación de datos y callbacks.
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/data-model.md (sección 4.3)
 * - Union/specs/003-desafios/tasks.md (T056)
 * - Union/specs/003-desafios/plan.md (sección 5.2)
 *
 * Dependencias: T040 (RespuestaDesafio), T015 (data model)
 */
export const ListaRespuestas: React.FC<ListaRespuestasProps> = ({
  respuestas,
  sesionActual,
  onEditar,
  onEliminar,
  className = '',
  mensajeVacio = 'No hay respuestas aún',
}) => {
  // Determinar si el contenido es imagen
  const esImagen = (contenido: any): contenido is ContenidoImagenRespuesta => {
    return contenido.tipo === 'imagen'
  }

  // Determinar si el contenido es video
  const esVideo = (contenido: any): contenido is ContenidoVideoRespuesta => {
    return contenido.tipo === 'video'
  }

  // Determinar si el contenido es audio
  const esAudio = (contenido: any): contenido is ContenidoAudioRespuesta => {
    return contenido.tipo === 'audio'
  }

  // Renderizar preview según tipo de contenido
  const renderizarPreview = (respuesta: RespuestaDesafio) => {
    const { contenido } = respuesta

    if (!contenido) {
      return null
    }

    if (esImagen(contenido)) {
      return (
        <img
          src={contenido.url}
          alt={`Respuesta de ${respuesta.autorId}`}
          className="w-full h-48 object-cover rounded-lg"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23e5e7eb" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%236b7280" font-size="14"%3EError al cargar%3C/text%3E%3C/svg%3E'
          }}
        />
      )
    }

    if (esVideo(contenido)) {
      return (
        <video
          src={contenido.url}
          controls
          className="w-full h-48 rounded-lg bg-black"
          onError={() => {
            console.error(`Error al cargar video: ${contenido.url}`)
          }}
        />
      )
    }

    if (esAudio(contenido)) {
      return (
        <div className="w-full p-4 bg-gray-100 rounded-lg">
          <audio
            src={contenido.url}
            controls
            className="w-full"
            onError={() => {
              console.error(`Error al cargar audio: ${contenido.url}`)
            }}
          />
          <p className="text-sm text-gray-600 mt-2 truncate">{contenido.url}</p>
        </div>
      )
    }

    return null
  }

  // Determinar si se puede editar
  const puedeEditar = (respuesta: RespuestaDesafio): boolean => {
    return sesionActual ? respuesta.puedeEditarPor(sesionActual) : false
  }

  // Determinar si se puede eliminar
  const puedeEliminar = (respuesta: RespuestaDesafio): boolean => {
    return sesionActual ? respuesta.puedeEliminarPor(sesionActual) : false
  }

  // Memoizar lista de acciones disponibles por respuesta
  const accionesDisponibles = useMemo(() => {
    const mapa: Record<string, { editar: boolean; eliminar: boolean }> = {}
    respuestas.forEach((r) => {
      if (r.id) {
        mapa[r.id] = {
          editar: puedeEditar(r),
          eliminar: puedeEliminar(r),
        }
      }
    })
    return mapa
  }, [respuestas, sesionActual])

  if (respuestas.length === 0) {
    return (
      <div className={`py-8 text-center text-gray-500 ${className}`}>
        <p>{mensajeVacio}</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {respuestas.map((respuesta) => {
        if (!respuesta.id) return null

        return (
          <div
            key={respuesta.id}
            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Encabezado: Autor y acciones */}
            <div className="flex items-center justify-between bg-gray-50 px-4 py-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{respuesta.autorId}</p>
                <p className="text-sm text-gray-500">
                  {respuesta.contenido?.tipo || 'Contenido'} -{' '}
                  {respuesta.contenido?.formato || 'Formato'}
                </p>
              </div>

              {/* Acciones */}
              <div className="flex gap-2">
                {accionesDisponibles[respuesta.id].editar && onEditar && (
                  <button
                    onClick={() => onEditar(respuesta.id!, respuesta)}
                    className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    aria-label={`Editar respuesta de ${respuesta.autorId}`}
                  >
                    Editar
                  </button>
                )}

                {accionesDisponibles[respuesta.id].eliminar && onEliminar && (
                  <button
                    onClick={() => onEliminar(respuesta.id!)}
                    className="px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    aria-label={`Eliminar respuesta de ${respuesta.autorId}`}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            {/* Contenido: Preview */}
            <div className="px-4 py-4">{renderizarPreview(respuesta)}</div>
          </div>
        )
      })}
    </div>
  )
}
