import React, { useCallback, useState } from 'react'
import { Desafio } from '../../../domain/Desafio'
import { RespuestaDesafio } from '../../../domain/RespuestaDesafio'
import { ListaRespuestas } from '../ListaRespuestas'
import { ConfirmarAccionDestructiva } from '../ConfirmarAccionDestructiva'
import { httpClient } from '../../../infrastructure/httpClient'
import './moderacion-respuestas-section.css'

export interface ModeracionRespuestasSectionProps {
  desafio: Desafio
  respuestas?: RespuestaDesafio[]
  sesionActual?: { usuarioId: string; rol: 'USER' | 'ADMIN' }
  cargando?: boolean
  onRespuestaEliminada?: (respuestaId: string) => void
}

/**
 * ModeracionRespuestasSection (T067)
 *
 * Componente de moderación ADMIN para eliminar respuestas.
 * 
 * Funcionalidad:
 * - Solo accesible para administradores
 * - Muestra lista de todas las respuestas al desafío
 * - El admin SOLO puede eliminar respuestas (RF-14, HU-16)
 * - El admin NO ve la acción de editar (RF-14)
 * - Confirmación explícita antes de eliminar (CB-02)
 * 
 * Requisitos cumplidos:
 * - HU-16: Como administrador, quiero eliminar cualquier respuesta
 * - RF-14: El administrador elimina cualquier respuesta. No la edita.
 * - P-02: Editar o borrar respuestas no activas (solo borrar para admin)
 * 
 * Diferencias con RespuestasDesafioSection (T061):
 * - T061: Usuario normal (edita/elimina propias, ve todas)
 * - T067: Admin moderador (solo elimina, no edita, ve todas)
 * 
 * Dependencias:
 * - T043 (RespuestaDesafio domain)
 * - T052 (ConfirmarAccionDestructiva)
 * - T056 (ListaRespuestas - sin callbacks de editar)
 * - T040 (httpClient para DELETE)
 * 
 * Fuente: specs/003-desafios/spec.md (HU-16, RF-14), tasks.md (T067)
 */
export const ModeracionRespuestasSection: React.FC<ModeracionRespuestasSectionProps> = ({
  desafio,
  respuestas = [],
  sesionActual,
  cargando = false,
  onRespuestaEliminada,
}) => {
  const [respuestaAEliminar, setRespuestaAEliminar] = useState<RespuestaDesafio | null>(null)
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState<boolean>(false)
  const [eliminando, setEliminando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Callback para iniciar la eliminación
  const handleEliminarClick = useCallback((respuestaId: string) => {
    const respuesta = respuestas.find((r) => r.id === respuestaId)
    if (respuesta) {
      setRespuestaAEliminar(respuesta)
      setMostrarConfirmacion(true)
      setError(null)
    }
  }, [respuestas])

  // Callback para confirmar la eliminación
  const handleConfirmarEliminar = useCallback(async () => {
    if (!respuestaAEliminar?.id) return

    setEliminando(true)
    setError(null)

    try {
      await httpClient.delete(`/desafios/${desafio.id}/respuestas/${respuestaAEliminar.id}`)

      // Callback para notificar que se eliminó
      onRespuestaEliminada?.(respuestaAEliminar.id)

      // Limpiar estado
      setMostrarConfirmacion(false)
      setRespuestaAEliminar(null)
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para eliminar respuestas.')
      } else if (err?.status === 403) {
        setError('No tienes permiso para eliminar esta respuesta.')
      } else if (err?.status === 404) {
        setError('La respuesta no existe o ya fue eliminada.')
        // Aún así la removemos de la lista
        onRespuestaEliminada?.(respuestaAEliminar.id)
        setMostrarConfirmacion(false)
        setRespuestaAEliminar(null)
      } else {
        setError('Error al eliminar la respuesta. Intentá nuevamente.')
      }
    } finally {
      setEliminando(false)
    }
  }, [respuestaAEliminar, desafio.id, onRespuestaEliminada])

  // Callback para cancelar
  const handleCancelarEliminar = useCallback(() => {
    setMostrarConfirmacion(false)
    setRespuestaAEliminar(null)
    setError(null)
  }, [])

  if (cargando) {
    return (
      <div className="moderacion-respuestas-section-cargando">
        <p>Cargando respuestas para moderación...</p>
      </div>
    )
  }

  if (respuestas.length === 0) {
    return (
      <div className="moderacion-respuestas-section-vacio">
        <p>No hay respuestas para moderar en este desafío.</p>
      </div>
    )
  }

  return (
    <div className="moderacion-respuestas-section">
      <div className="moderacion-respuestas-section-header">
        <h2>Moderación de Respuestas</h2>
        <p className="moderacion-respuestas-section-subtitulo">
          Total: <strong>{respuestas.length}</strong> respuesta(s)
        </p>
      </div>

      {error && (
        <div className="moderacion-respuestas-section-error" role="alert">
          {error}
        </div>
      )}

      <div className="moderacion-respuestas-section-contenedor">
        <ListaRespuestas
          respuestas={respuestas}
          sesionActual={sesionActual}
          onEliminar={handleEliminarClick}
          className="moderacion-respuestas-section-lista"
          mensajeVacio="No hay respuestas."
        />
      </div>

      <ConfirmarAccionDestructiva
        caso="eliminar-respuesta"
        abierto={mostrarConfirmacion}
        confirmando={eliminando}
        onConfirmar={handleConfirmarEliminar}
        onCancelar={handleCancelarEliminar}
        tituloCustom="¿Eliminar respuesta?"
        mensajeCustom={
          respuestaAEliminar
            ? `Eliminarás la respuesta de ${respuestaAEliminar.autorId}. Esta acción no se puede deshacer.`
            : '¿Está seguro?'
        }
      />

      <footer className="moderacion-respuestas-section-footer">
        <p className="moderacion-respuestas-section-nota">
          <strong>Nota:</strong> Como administrador, solo puedes eliminar respuestas. No es posible
          editarlas. Si una respuesta viola las normas, elimínala.
        </p>
      </footer>
    </div>
  )
}
