import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Usuario } from '../../domain/Usuario'
import { EstadoCuentaUsuario } from '../../domain/enums/EstadoCuentaUsuario'

/**
 * Componente ProfileNotFoundView — Módulo 004-inspiraciones-perfil.
 *
 * Fuente de verdad:
 * - Union/specs/004-inspiraciones-perfil/spec.md (HU-03, A10)
 * - Union/specs/004-inspiraciones-perfil/plan.md (Fase 3, componentes de presentación)
 * - Union/specs/004-inspiraciones-perfil/data-model.md (Enum: EstadoCuentaUsuario)
 * - Union/specs/004-inspiraciones-perfil/tasks.md (T027)
 *
 * Renderiza una pantalla de error cuando un perfil no está disponible.
 *
 * Casos de uso (A10):
 * - Perfil con estado BANEADO: Usuario fue baneado del sistema
 * - Perfil con estado ELIMINADO: Cuenta de usuario fue eliminada/desactivada
 * - Respuesta backend: 404/403 desde /usuarios/{usuarioId} (openapi.yaml)
 *
 * El backend retorna 404/403 para perfiles no disponibles.
 * El frontend (PerfilPage) maneja estos casos mostrando ProfileNotFoundView.
 *
 * Props:
 * - usuario?: Usuario — Usuario cuyo perfil no está disponible (opcional, para detalles)
 * - razon?: 'BANEADO' | 'ELIMINADO' | 'NO_DISPONIBLE' — Motivo explícito del bloqueo
 * - onVolver?: () => void — Callback cuando usuario presiona "Volver"
 *
 * Historias de usuario:
 * - HU-03: Visualizar perfil ajeno (pero bloqueado por A10 si no está ACTIVO)
 *
 * Clarificaciones:
 * - A10: Perfil BANEADO/ELIMINADO no es visible a terceros
 */

interface ProfileNotFoundViewProps {
  usuario?: Usuario
  razon?: 'BANEADO' | 'ELIMINADO' | 'NO_DISPONIBLE'
  onVolver?: () => void
}

/**
 * React component para mostrar pantalla de perfil no disponible.
 * Renderiza mensaje claro indicando por qué no se puede acceder al perfil.
 */
export const ProfileNotFoundView: React.FC<ProfileNotFoundViewProps> = ({
  usuario,
  razon,
  onVolver,
}) => {
  const navigate = useNavigate()

  /**
   * Determina el motivo si no fue proporcionado explícitamente.
   * Si se pasó el usuario, extrae el estado de su propiedad `estado`.
   */
  const determinarRazon = (): { titulo: string; mensaje: string; descripcion: string } => {
    // Si se pasó razon explícita, úsala
    if (razon === 'BANEADO') {
      return {
        titulo: 'Usuario Baneado',
        mensaje:
          'Este usuario ha sido baneado del sistema y su perfil no está disponible por el momento.',
        descripcion: 'Si crees que esto es un error, contacta al equipo de soporte.',
      }
    }

    if (razon === 'ELIMINADO') {
      return {
        titulo: 'Cuenta Eliminada',
        mensaje: 'Este usuario eliminó su cuenta, por lo que su perfil ya no está disponible.',
        descripcion: 'Los datos asociados han sido removidos del sistema.',
      }
    }

    // Si se pasó usuario, intenta extraer su estado
    if (usuario) {
      if (usuario.estado === EstadoCuentaUsuario.BANEADO) {
        return {
          titulo: 'Usuario Baneado',
          mensaje:
            'Este usuario ha sido baneado del sistema y su perfil no está disponible por el momento.',
          descripcion: 'Si crees que esto es un error, contacta al equipo de soporte.',
        }
      }

      if (usuario.estado === EstadoCuentaUsuario.ELIMINADO) {
        return {
          titulo: 'Cuenta Eliminada',
          mensaje: 'Este usuario eliminó su cuenta, por lo que su perfil ya no está disponible.',
          descripcion: 'Los datos asociados han sido removidos del sistema.',
        }
      }
    }

    // Fallback genérico
    return {
      titulo: 'Perfil No Disponible',
      mensaje: 'El perfil que intentas acceder no está disponible en este momento.',
      descripcion: 'Intenta más tarde o regresa al inicio.',
    }
  }

  const { titulo, mensaje, descripcion } = determinarRazon()

  /**
   * Maneja el botón "Volver".
   * - Si se pasó callback onVolver, lo ejecuta
   * - Si no, navega hacia atrás o al home
   */
  const handleVolver = () => {
    if (onVolver) {
      onVolver()
    } else {
      // Intenta volver a la página anterior
      navigate(-1)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '1rem',
      }}
    >
      <div
        style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '3rem 2rem',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Icono/Símbolo visual — Lock o prohibido */}
        <div
          style={{
            fontSize: '64px',
            marginBottom: '1.5rem',
            color: '#dc2626',
          }}
        >
          🔒
        </div>

        {/* Título — A10: Razón del bloqueo */}
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            margin: '0 0 1rem 0',
            color: '#1f2937',
          }}
        >
          {titulo}
        </h1>

        {/* Mensaje principal — Explicación clara */}
        <p
          style={{
            fontSize: '16px',
            color: '#374151',
            margin: '0 0 0.75rem 0',
            lineHeight: '1.6',
          }}
        >
          {mensaje}
        </p>

        {/* Descripción adicional — Contexto o sugerencia */}
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: '0 0 2rem 0',
            lineHeight: '1.6',
          }}
        >
          {descripcion}
        </p>

        {/* Botón "Volver" — Navegación de retorno */}
        <button
          onClick={handleVolver}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            ;(e.target as HTMLButtonElement).style.backgroundColor = '#4338ca'
          }}
          onMouseLeave={(e) => {
            ;(e.target as HTMLButtonElement).style.backgroundColor = '#4f46e5'
          }}
        >
          Volver
        </button>

        {/* Enlace alternativo al home */}
        <p
          style={{
            fontSize: '13px',
            color: '#6b7280',
            margin: '1.5rem 0 0 0',
          }}
        >
          ¿Buscas otra cosa?{' '}
          <a
            href="/"
            style={{
              color: '#4f46e5',
              textDecoration: 'none',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLAnchorElement).style.textDecoration = 'none'
            }}
          >
            Ir al inicio
          </a>
        </p>
      </div>
    </div>
  )
}
