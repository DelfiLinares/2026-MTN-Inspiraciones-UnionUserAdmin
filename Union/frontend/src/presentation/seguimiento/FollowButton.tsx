import React, { useState } from 'react'
import { SeguimientoRelacion } from '../../domain/SeguimientoRelacion'

/**
 * Componente FollowButton — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-04, AC-04, A4)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 3, componentes de presentación)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Value Object: SeguimientoRelacion)
 * - Union/specs/004-inspiraciones-perfil/contracts/openapi.yaml (endpoints de seguimiento)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T026)
 *
 * UI reutilizable para seguir/dejar de seguir a otro usuario.
 *
 * Funcionalidades:
 * - AC-04.1: Muestra opción de seguir en perfil ajeno
 * - AC-04.2: Disponible para cualquier autenticado (sin distinción de rol)
 * - AC-04.3: Refleja nuevo estado tras éxito (optimistic update)
 * - AC-04.4: Maneja errores, revierte estado si falla
 * - AC-04.5: No requiere confirmación explícita (es no-destructivo)
 * - A4: Implementa toggle bidireccional (seguir ↔ dejar de seguir)
 *
 * Props:
 * - seguimiento: SeguimientoRelacion — Estado actual de seguimiento
 * - onToggleSeguimiento?: (seguimiento: SeguimientoRelacion) => Promise<void> — Callback cuando el usuario presiona el botón
 * - enviando?: boolean — Indica si se está procesando la solicitud (loading state)
 * - error?: string — Mensaje de error si la operación falla (AC-04.4)
 * - onErrorClear?: () => void — Callback para limpiar error
 *
 * Estados visuales:
 * - Normal: Seguir (azul) / Dejar de seguir (gris)
 * - Enviando: Opacidad reducida, cursor not-allowed
 * - Error: Mensaje rojo debajo del botón
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

  /**
   * AC-04: Handle toggle follow/unfollow.
   * Implementa optimistic update (A4):
   * 1. Toggle local inmediato (AC-04.3)
   * 2. Si falla, revert (AC-04.4)
   * 3. No requiere confirmación (AC-04.5)
   */
  const handleToggle = async () => {
    // Limpia error anterior si existe
    setErrorLocal(undefined)
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
          backgroundColor: isFollowing ? '#e5e7eb' : '#4f46e5',
          color: isFollowing ? '#374151' : 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: '600',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          opacity: isLoading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          minWidth: '120px',
          textAlign: 'center',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            const btn = e.currentTarget as HTMLButtonElement
            if (isFollowing) {
              btn.style.backgroundColor = '#d1d5db'
            } else {
              btn.style.backgroundColor = '#4338ca'
            }
          }
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget as HTMLButtonElement
          btn.style.backgroundColor = isFollowing ? '#e5e7eb' : '#4f46e5'
        }}
      >
        {/* A4: Toggle text based on state */}
        {seguimientoLocal.getBotonTexto()}
      </button>

      {/* AC-04.4: Error message if operation fails */}
      {errorLocal && (
        <p
          style={{
            margin: '0',
            fontSize: '12px',
            color: '#dc2626',
            fontWeight: '500',
          }}
          role="alert"
        >
          {errorLocal}
        </p>
      )}
    </div>
  )
}
