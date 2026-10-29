import React, { useEffect, useState } from 'react'
import { SeguimientoRelacion } from '../../domain/SeguimientoRelacion'

/**
 * Componente FollowButton — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, AC-04, A4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 3, componentes de presentación)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Value Object: SeguimientoRelacion)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (endpoints de seguimiento)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T026, T062)
 *
 * UI reutilizable para seguir/dejar de seguir a otro usuario con feedback visual.
 *
 * Funcionalidades:
 * - AC-04.1: Muestra opción de seguir en perfil ajeno
 * - AC-04.2: Disponible para cualquier autenticado (sin distinción de rol)
 * - AC-04.3: Refleja nuevo estado tras éxito (optimistic update)
 * - AC-04.4: Maneja errores, revierte estado si falla (rollback)
 * - AC-04.5: No requiere confirmación explícita (es no-destructivo)
 * - A4: Implementa toggle bidireccional (seguir ↔ dejar de seguir)
 * - T062: Estados visuales: loading (spinner), error (mensaje), success (confirmación)
 *
 * Props:
 * - seguimiento: SeguimientoRelacion — Estado actual de seguimiento
 * - onToggleSeguimiento?: (seguimiento: SeguimientoRelacion) => Promise<void> — Callback cuando el usuario presiona el botón
 * - enviando?: boolean — Indica si se está procesando la solicitud (loading state)
 * - error?: string — Mensaje de error si la operación falla (AC-04.4)
 * - onErrorClear?: () => void — Callback para limpiar error
 *
 * Estados visuales (T062):
 * - Normal: Seguir (azul) / Dejar de seguir (gris)
 * - Loading: Spinner + opacidad reducida (T062)
 * - Error: Mensaje de error rojo + botón retry (T062)
 * - Success: Confirmación visual breve (checkmark) (T062)
 * - Rollback: Revierte a estado anterior si falla (AC-04.4)
 */

interface FollowButtonProps {
  seguimiento: SeguimientoRelacion
  onToggleSeguimiento?: (seguimiento: SeguimientoRelacion) => Promise<void>
  enviando?: boolean
  error?: string
  onErrorClear?: () => void
}

/**
 * React component para botón de seguimiento.
 * Encapsula toda la lógica visual y de interacción para seguir/dejar de seguir.
 * Reutilizable en cualquier contexto donde se muestre perfil ajeno (HU-04).
 */
export const FollowButton: React.FC<FollowButtonProps> = ({
  seguimiento,
  onToggleSeguimiento,
  enviando = false,
  error,
  onErrorClear,
}) => {
  const [seguimientoLocal, setSeguimientoLocal] = useState<SeguimientoRelacion>(seguimiento)
  const [enviandoLocal, setEnviandoLocal] = useState(false)
  const [errorLocal, setErrorLocal] = useState<string | undefined>(error)
  const [mostrarExito, setMostrarExito] = useState(false)

  useEffect(() => {
    setSeguimientoLocal(seguimiento)
  }, [
    seguimiento.usuarioId,
    seguimiento.usuarioASeguidoId,
    seguimiento.siguiendo,
  ])

  useEffect(() => {
    setErrorLocal(error)
  }, [error])

  /**
   * AC-04: Handle toggle follow/unfollow.
   * Implementa optimistic update (A4):
   * 1. Toggle local inmediato (AC-04.3)
   * 2. Si falla, revert (AC-04.4)
   * 3. No requiere confirmación (AC-04.5)
   * T062: Feedback visual de success
   */
  const handleToggle = async () => {
    // Limpia error anterior si existe
    setErrorLocal(undefined)
    setMostrarExito(false)
    if (onErrorClear) {
      onErrorClear()
    }

    // Optimistic: toggle immediately
    const seguimientoToggled = seguimientoLocal.toggle()
    setSeguimientoLocal(seguimientoToggled)
    setEnviandoLocal(true)

    try {
      // Call provided handler if exists
      if (onToggleSeguimiento) {
        await onToggleSeguimiento(seguimientoToggled)
      }
      // AC-04.3: State reflects new state after success
      // T062: Mostrar feedback de éxito brevemente
      setMostrarExito(true)
      setTimeout(() => setMostrarExito(false), 1500) // Mostrar durante 1.5s
    } catch (err) {
      // AC-04.4: Revert if fails
      setSeguimientoLocal(seguimiento)
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar seguimiento'
      setErrorLocal(errorMsg)
    } finally {
      setEnviandoLocal(false)
    }
  }

  const isFollowing = seguimientoLocal.esSiguiendo()
  const isLoading = enviandoLocal || enviando

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Botón con estado visual (A4: Seguir ↔ Dejar de seguir) */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={`${isFollowing ? 'Dejar de seguir' : 'Seguir'} a este usuario`}
        style={{
          padding: '0.5rem 1rem',
          // AC-04: Visual diferenciación: Seguir (azul/activo) vs Dejar de seguir (gris/inactivo)
          // T062: Cambiar a verde si hay éxito
          backgroundColor: mostrarExito
            ? 'var(--trama-success)' // Verde para éxito
            : isFollowing
              ? 'var(--trama-line)' // Gris para "Dejar de seguir"
              : 'var(--trama-action)', // Azul para "Seguir"
          color: mostrarExito ? 'white' : isFollowing ? 'var(--trama-ink)' : 'white',
          border: 'none',
          borderRadius: 'var(--trama-radius)',
          fontSize: '14px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          minWidth: '120px',
          textAlign: 'center',
        }}
        onMouseEnter={(e) => {
          if (!isLoading && !mostrarExito) {
            const btn = e.currentTarget as HTMLButtonElement
            if (isFollowing) {
              btn.style.backgroundColor = 'var(--trama-line)'
            } else {
              btn.style.backgroundColor = 'var(--trama-hover)'
            }
          }
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement
          if (!mostrarExito) {
            btn.style.backgroundColor = isFollowing ? 'var(--trama-line)' : 'var(--trama-action)'
          }
        }}
      >
        {/* T062: Mostrar spinner/loader durante carga */}
        {isLoading ? (
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                width: '12px',
                height: '12px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }}
            />
            Procesando...
          </span>
        ) : mostrarExito ? (
          /* T062: Mostrar checkmark para éxito */
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            ✓ Actualizado
          </span>
        ) : (
          /* A4: Toggle text based on state */
          seguimientoLocal.getBotonTexto()
        )}
      </button>

      {/* T062: Spinner animation CSS */}
      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* T062: Error message with retry option if operation fails */}
      {errorLocal && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: 'var(--trama-error-surface)',
            border: '1px solid var(--trama-error-surface)',
            borderRadius: 'var(--trama-radius)',
          }}
          role="alert"
        >
          <p
            style={{
              margin: '0',
              fontSize: '14px',
              color: 'var(--trama-error)',
              fontWeight: '500',
            }}
          >
            {errorLocal}
          </p>
          {/* Botón de reintentar */}
          <button
            onClick={handleToggle}
            style={{
              padding: '0.35rem 0.75rem',
              backgroundColor: 'var(--trama-error)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--trama-radius)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--trama-error)'
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'var(--trama-error)'
            }}
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  )
}
