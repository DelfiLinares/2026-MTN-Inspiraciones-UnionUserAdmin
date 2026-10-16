import React from 'react'

export interface MensajeErrorDesafioProps {
  /**
   * Código HTTP del error
   */
  codigo?: number

  /**
   * Mensaje de error personalizado
   */
  mensaje?: string

  /**
   * Errores por campo (para validación 400)
   * Ejemplo: { nombre: "El nombre es requerido", fotos: "Se requiere al menos una foto" }
   */
  erroresPorCampo?: Record<string, string>

  /**
   * Callback cuando el usuario desea volver atrás
   */
  onVolver?: () => void

  /**
   * Clase CSS adicional
   */
  className?: string
}

/**
 * MensajeErrorDesafio (T070)
 *
 * Componente para mostrar mensajes de error en el contexto de Desafíos.
 * 
 * Maneja diferentes códigos HTTP con mensajes apropiadoss:
 * - 400: Errores de validación por campo
 * - 401: Sesión expirada, requiere retornar a acceso
 * - 403: Permiso denegado (no es admin, no es propietario, etc)
 * - 404: Recurso no encontrado o no disponible
 * - 409: Conflicto o error de transición de estado
 * 
 * Requiere (CB-02, CB-06, CB-07):
 * - CB-02: Confirmación de edición en desafío ACTIVO o con respuestas
 * - CB-06: Solicitud ya resuelta no vuelve a PENDIENTE
 * - CB-07: Intento de editar respuesta ajena es rechazado
 * 
 * Fuente: specs/003-desafios/spec.md (RF-24, RF-25)
 * Referencia: T030 (errores), T012 (arquitectura de errores)
 */
export const MensajeErrorDesafio: React.FC<MensajeErrorDesafioProps> = ({
  codigo,
  mensaje,
  erroresPorCampo,
  onVolver,
  className = '',
}) => {
  // Determinar el estilo visual según el código de error
  const getEstiloError = (code?: number): { clase: string; titulo: string; icono: string } => {
    switch (code) {
      case 400:
        return {
          clase: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          titulo: 'Error de validación',
          icono: '⚠️',
        }
      case 401:
        return {
          clase: 'bg-red-50 border-red-200 text-red-800',
          titulo: 'Sesión expirada',
          icono: '🔐',
        }
      case 403:
        return {
          clase: 'bg-red-50 border-red-200 text-red-800',
          titulo: 'Permiso denegado',
          icono: '🚫',
        }
      case 404:
        return {
          clase: 'bg-gray-50 border-gray-200 text-gray-800',
          titulo: 'No disponible',
          icono: '❌',
        }
      case 409:
        return {
          clase: 'bg-orange-50 border-orange-200 text-orange-800',
          titulo: 'Conflicto o error de transición',
          icono: '⚡',
        }
      default:
        return {
          clase: 'bg-gray-50 border-gray-200 text-gray-800',
          titulo: 'Error',
          icono: '❌',
        }
    }
  }

  const { clase, titulo, icono } = getEstiloError(codigo)

  // Mensaje principal según el código
  const getMensajePrincipal = (): string => {
    if (mensaje) return mensaje

    switch (codigo) {
      case 400:
        return 'Por favor, revisá los errores marcados y intentá nuevamente.'
      case 401:
        return 'Tu sesión ha expirado. Iniciá sesión nuevamente para continuar.'
      case 403:
        return 'No tienes permiso para realizar esta acción.'
      case 404:
        return 'El recurso que buscas no existe o fue eliminado.'
      case 409:
        return 'No se pudo completar la acción. El recurso ha cambiado o está en conflicto.'
      default:
        return 'Ocurrió un error. Intentá nuevamente más tarde.'
    }
  }

  return (
    <div className={`mensaje-error-desafio ${className}`}>
      <div
        className={`border rounded-lg p-4 ${clase}`}
        role="alert"
        aria-live="polite"
        aria-label={`Error: ${titulo}`}
      >
        {/* Encabezado con icono y título */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{icono}</span>
          <h3 className="font-semibold text-sm">{titulo}</h3>
          {codigo && <span className="text-xs opacity-75 ml-auto">(Código {codigo})</span>}
        </div>

        {/* Mensaje principal */}
        <p className="text-sm mb-3 leading-relaxed">{getMensajePrincipal()}</p>

        {/* Errores por campo (si existen) */}
        {erroresPorCampo && Object.keys(erroresPorCampo).length > 0 && (
          <div className="bg-opacity-20 bg-current rounded p-3 mb-3" aria-label="Errores de validación">
            <p className="text-xs font-semibold mb-2">Errores identificados:</p>
            <ul className="text-xs space-y-1">
              {Object.entries(erroresPorCampo).map(([campo, error]) => (
                <li key={campo} className="flex gap-2">
                  <span>•</span>
                  <span>
                    <strong>{campo}:</strong> {error}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botón de acción si hay callback */}
        {onVolver && (
          <div className="flex gap-2">
            <button
              onClick={onVolver}
              className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded border border-current opacity-75 hover:opacity-100 transition-opacity"
              aria-label="Volver atrás"
            >
              ← Volver
            </button>
          </div>
        )}
      </div>

      <style>{`
        .mensaje-error-desafio {
          width: 100%;
        }

        .mensaje-error-desafio [role="alert"] {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        /* Responsivo */
        @media (max-width: 640px) {
          .mensaje-error-desafio [role="alert"] {
            padding: 1rem;
          }

          .mensaje-error-desafio h3 {
            font-size: 0.875rem;
          }

          .mensaje-error-desafio p {
            font-size: 0.8125rem;
          }
        }
      `}</style>
    </div>
  )
}
