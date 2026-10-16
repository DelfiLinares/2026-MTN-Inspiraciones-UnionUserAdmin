/**
 * `RutaProtegidaAdmin`: Guard de rutas que requieren rol ADMIN (frontend de administración).
 *
 * Fuente de verdad:
 * - Union/specs/003-desafios/spec.md (RF-20, RF-21)
 * - Union/specs/003-desafios/plan.md (sección 5.2, principio 6)
 * - Union/specs/003-desafios/tasks.md (T069)
 * - Union/specs/001-plataforma-unificada/spec.md (RF-77, RF-78)
 *
 * Responsabilidades:
 * - Mientras `AuthContext` está verificando la sesión inicial (`cargando === true`), no redirige
 *   todavía: evita un "flash" de redirección antes de confirmar el estado real.
 * - Si no hay sesión activa, redirige a `/login`, conservando la ruta de origen en el estado de
 *   navegación (`state.from`) para poder volver tras un login exitoso.
 * - RF-20, RF-21, RF-77: Si el usuario autenticado NO tiene rol `ADMIN`, se rechaza el acceso
 *   y se redirige a la página de inicio (`/feed`) con un mensaje de permiso denegado.
 * - Solo usuarios con rol `ADMIN` pueden acceder a estas rutas.
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'

export interface RutaProtegidaAdminProps {
  children: React.ReactNode
}

export const RutaProtegidaAdmin: React.FC<RutaProtegidaAdminProps> = ({ children }) => {
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

  // RF-20, RF-21: rechazar/redirigir cualquier cuenta que NO sea ADMIN
  if ((usuario.rol as unknown as string) !== 'ADMIN') {
    return (
      <Navigate
        to="/feed"
        replace
        state={{ error: 'No tienes permisos para acceder a esta sección. Solo administradores.' }}
      />
    )
  }

  return <>{children}</>
}
