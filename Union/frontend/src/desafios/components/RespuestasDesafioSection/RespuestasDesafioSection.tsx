import React, { useState } from 'react'
import { Desafio } from '../../../domain/Desafio'
import { RespuestaDesafio } from '../../../domain/RespuestaDesafio'
import { FormularioRespuesta } from '../FormularioRespuesta'
import { ListaRespuestas } from '../ListaRespuestas'
import { httpClient } from '../../../infrastructure/httpClient'
import './respuestas-desafio-section.css'

export interface RespuestasDesafioSectionProps {
  desafio: Desafio
  respuestas?: RespuestaDesafio[]
  sesionActual?: { usuarioId: string; rol: 'USER' | 'ADMIN' }
  cargando?: boolean
  onRespuestaEnviada?: (respuesta: RespuestaDesafio) => void
  onRespuestaEditada?: (respuesta: RespuestaDesafio) => void
  onRespuestaEliminada?: (respuestaId: string) => void
}

/**
 * Componente RespuestasDesafioSection (T061)
 *
 * Gestiona las respuestas a un desafío:
 * - Solo permite responder si el desafío está ACTIVO (RF-12, A-05)
 * - Una única respuesta por usuario (RF-12, A-10)
 * - Edita y elimina solo las propias (RF-13, HU-15)
 * - El admin solo puede eliminar, no editar (RF-14, HU-16)
 * - Maneja CB-07: intento de editar respuesta ajena es rechazado
 *
 * Dependencias:
 * - T055 (FormularioRespuesta)
 * - T056 (ListaRespuestas)
 * - T043 (RespuestaDesafio domain)
 *
 * Fuente: specs/003-desafios/spec.md (HU-14, HU-15, HU-16)
 */
export const RespuestasDesafioSection: React.FC<RespuestasDesafioSectionProps> = ({
  desafio,
  respuestas = [],
  sesionActual,
  cargando = false,
  onRespuestaEnviada,
  onRespuestaEditada,
  onRespuestaEliminada,
}) => {
  const [mostrarFormulario, setMostrarFormulario] = useState<boolean>(false)
  const [respuestaEnEdicion, setRespuestaEnEdicion] = useState<RespuestaDesafio | null>(null)
  const [enviando, setEnviando] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar si el desafío está activo
  const estaActivo = desafio?.activo === true

  // Encontrar la respuesta del usuario actual (si existe)
  const respuestaDelUsuario = respuestas.find((r) => r.autorId === sesionActual?.usuarioId)

  const handleEnviarRespuesta = async (respuesta: RespuestaDesafio) => {
    setEnviando(true)
    setError(null)

    try {
      // Validar la respuesta
      const errores = respuesta.validar()
      if (Object.keys(errores).length > 0) {
        setError(`Hay errores en tu respuesta: ${Object.values(errores).join(', ')}`)
        setEnviando(false)
        return
      }

      // Preparar payload
      const payload = {
        contenido: respuesta.contenido,
      }

      // Si es edición, usar PUT; si es creación, usar POST
      if (respuestaEnEdicion?.id) {
        // Editar respuesta existente
        await httpClient.put(`/desafios/${desafio.id}/respuestas/${respuestaEnEdicion.id}`, payload)
        const respuestaActualizada = new RespuestaDesafio({
          ...respuestaEnEdicion,
          ...respuesta,
          desafioId: desafio.id,
        })
        onRespuestaEditada?.(respuestaActualizada)
      } else {
        // Crear nueva respuesta
        const resultado = await httpClient.post<{ id: string }>(
          `/desafios/${desafio.id}/respuestas`,
          payload,
        )

        if (resultado?.id) {
          const respuestaCreada = new RespuestaDesafio({
            id: resultado.id,
            desafioId: desafio.id,
            autorId: sesionActual?.usuarioId,
            contenido: respuesta.contenido,
          })
          onRespuestaEnviada?.(respuestaCreada)
        }
      }

      // Limpiar estado
      setMostrarFormulario(false)
      setRespuestaEnEdicion(null)
    } catch (err: any) {
      if (err?.status === 401) {
        setError('Debes iniciar sesión para responder.')
      } else if (err?.status === 403) {
        setError('No tienes permiso para hacer esto.')
      } else if (err?.status === 404) {
        setError('El desafío no existe o fue eliminado.')
      } else {
        setError('No se pudo enviar tu respuesta. Intentá nuevamente.')
      }
    } finally {
      setEnviando(false)
    }
  }

  const handleEditarRespuesta = (respuestaId: string, respuesta: RespuestaDesafio) => {
    // Solo se puede editar la propia respuesta
    if (respuesta.puedeEditarPor({ usuarioId: sesionActual?.usuarioId || '', rol: sesionActual?.rol || 'USER' })) {
      setRespuestaEnEdicion(respuesta)
      setMostrarFormulario(true)
    } else {
      setError('No puedes editar esta respuesta.')
    }
  }

  const handleEliminarRespuesta = async (respuestaId: string) => {
    const respuesta = respuestas.find((r) => r.id === respuestaId)
    if (!respuesta) return

    // Verificar permisos
    if (
      !respuesta.puedeEliminarPor({
        usuarioId: sesionActual?.usuarioId || '',
        rol: sesionActual?.rol || 'USER',
      })
    ) {
      setError('No puedes eliminar esta respuesta.')
      return
    }

    try {
      await httpClient.delete(`/desafios/${desafio.id}/respuestas/${respuestaId}`)
      onRespuestaEliminada?.(respuestaId)
    } catch (err: any) {
      if (err?.status === 403) {
        setError('No tienes permiso para eliminar esta respuesta.')
      } else {
        setError('No se pudo eliminar la respuesta. Intentá nuevamente.')
      }
    }
  }

  const handleCancelar = () => {
    setMostrarFormulario(false)
    setRespuestaEnEdicion(null)
    setError(null)
  }

  return (
    <section className="respuestas-desafio-section" aria-labelledby="respuestas-titulo">
      <h2 id="respuestas-titulo">Responder al desafío</h2>

      {error && (
        <div className="respuestas-error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => setError(null)} className="respuestas-error-cerrar">
            Cerrar
          </button>
        </div>
      )}

      {!estaActivo && (
        <div className="respuestas-deshabilitada" role="status">
          <p>Este desafío no está activo. Solo puedes responder a desafíos en estado ACTIVO.</p>
        </div>
      )}

      {estaActivo && !sesionActual && (
        <div className="respuestas-no-autenticado" role="status">
          <p>Debes iniciar sesión para responder a este desafío.</p>
        </div>
      )}

      {estaActivo && sesionActual && (
        <>
          {!mostrarFormulario && !respuestaDelUsuario && (
            <button
              type="button"
              className="respuestas-btn-responder"
              onClick={() => setMostrarFormulario(true)}
              disabled={cargando}
            >
              + Enviar mi respuesta
            </button>
          )}

          {mostrarFormulario && (
            <div className="respuestas-formulario">
              <FormularioRespuesta onEnviar={handleEnviarRespuesta} cargando={enviando} />
              <button type="button" className="respuestas-btn-cancelar" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          )}

          {respuestaDelUsuario && !mostrarFormulario && (
            <div className="respuestas-tu-respuesta">
              <h3>Tu respuesta</h3>
              <ListaRespuestas
                respuestas={[respuestaDelUsuario]}
                sesionActual={sesionActual}
                onEditar={handleEditarRespuesta}
                onEliminar={handleEliminarRespuesta}
              />
            </div>
          )}

          {respuestaDelUsuario && mostrarFormulario && (
            <div className="respuestas-formulario">
              <p className="respuestas-editando">Editando tu respuesta...</p>
              <FormularioRespuesta
                respuestaInicial={respuestaDelUsuario}
                onEnviar={handleEnviarRespuesta}
                cargando={enviando}
              />
              <button type="button" className="respuestas-btn-cancelar" onClick={handleCancelar}>
                Cancelar
              </button>
            </div>
          )}
        </>
      )}

      {respuestas.length > 0 && (
        <div className="respuestas-otras">
          <h3>Respuestas de otros participantes</h3>
          <ListaRespuestas
            respuestas={respuestas.filter((r) => r.autorId !== sesionActual?.usuarioId)}
            sesionActual={sesionActual}
            onEditar={() => setError('No puedes editar respuestas de otros usuarios.')}
            onEliminar={handleEliminarRespuesta}
          />
        </div>
      )}
    </section>
  )
}
