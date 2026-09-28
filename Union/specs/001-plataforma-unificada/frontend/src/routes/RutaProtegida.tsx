/**
 * `RutaProtegida`: Guard de rutas que requieren sesión activa (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-05, RF-13, RF-77, RF-78)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T094, refuerza T084)
 *
 * Responsabilidades:
 * - Mientras `AuthContext` está verificando la sesión inicial (`cargando === true`), no redirige
 *   todavía: evita un "flash" de redirección a `/login` antes de confirmar el estado real.
 * - Si no hay sesión activa, redirige a `/login`, conservando la ruta de origen en el estado de
 *   navegación (`state.from`) para poder volver tras un login exitoso.
 * - RF-78 / Resuelto A14: si la cuenta autenticada tiene rol `ADMIN`, se rechaza el acceso al
 *   `frontend/` de usuario y se cierra la sesión local, redirigiendo a `/login` con un mensaje
 *   explicativo (refuerzo de lo ya aplicado en `LoginPage`, T084, ante sesiones ya persistidas).
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { authService } from '../services/authService'

export interface RutaProtegidaProps {
  children: React.ReactNode
}

export const RutaProtegida: React.FC<RutaProtegidaProps> = ({ children }) => {
  const { usuario, cargando, estaAutenticado } = useAuth()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Verificando sesión...</p>
      </div>
    )
  }

  if (!estaAutenticado || !usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // RF-78 / Resuelto A14: rechazar/redirigir cualquier cuenta ADMIN que opere en `frontend/`
  if ((usuario.rol as unknown as string) === 'ADMIN') {
    authService.logout()
    return (
      <Navigate
        to="/login"
        replace
        state={{
          mensaje:
            'Acceso restringido: las cuentas administrativas deben iniciar sesión desde la consola de administración.',
        }}
      />
    )
  }

  return <>{children}</>
}
