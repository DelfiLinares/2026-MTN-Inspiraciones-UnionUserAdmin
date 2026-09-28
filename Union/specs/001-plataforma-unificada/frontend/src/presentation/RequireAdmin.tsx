/**
 * `RequireAdmin`: Guard de rutas que requieren sesión activa con rol ADMIN (módulo administrativo).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T101) define este componente
 * dentro de `Admin/my-proyect/frontend-admin/src/RequireAdmin.tsx`. Por instrucción explícita del
 * usuario (misma confirmación que en T095/T096/T097A/T097B/T098A/T098B/T099/T100), la
 * implementación se coloca aquí, dentro de
 * `Union/specs/001-plataforma-unificada/frontend/src/presentation/`, sin leer ni modificar ningún
 * archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (RF-11, RF-12, RF-14, RF-75, AC-10.2, AC-10.4)
 * - Union/specs/001-plataforma-unificada/tasks.md (T101, depende de T045)
 *
 * Responsabilidades:
 * - Integra `sessionGuard.validarAccesoAdmin()` (T045) en cada ruta administrativa protegida.
 * - RF-14: Restringe todas las acciones de administración/moderación a usuarios con rol ADMIN y
 *   sesión válida.
 * - AC-10.2 / AC-10.4: Si la sesión expiró o el rol no es ADMIN, redirige a `/login-admin` con un
 *   mensaje explicativo, exigiendo reautenticación antes de permitir nuevas acciones.
 */

import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { validarAccesoAdmin, SesionExpiradaError, RolNoAutorizadoError } from '../infrastructure/sessionGuard'

export interface RequireAdminProps {
  children: React.ReactNode
}

export const RequireAdmin: React.FC<RequireAdminProps> = ({ children }) => {
  const [verificando, setVerificando] = useState(true)
  const [autorizado, setAutorizado] = useState(false)
  const [mensajeError, setMensajeError] = useState<string | null>(null)

  useEffect(() => {
    let cancelado = false

    const verificar = async () => {
      setVerificando(true)
      try {
        await validarAccesoAdmin()
        if (!cancelado) {
          setAutorizado(true)
        }
      } catch (error) {
        if (!cancelado) {
          setAutorizado(false)
          if (error instanceof RolNoAutorizadoError || error instanceof SesionExpiradaError) {
            setMensajeError(error.message)
          } else {
            setMensajeError('No se pudo validar el acceso administrativo.')
          }
        }
      } finally {
        if (!cancelado) {
          setVerificando(false)
        }
      }
    }

    verificar()

    return () => {
      cancelado = true
    }
  }, [])

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Verificando sesión administrativa...</p>
      </div>
    )
  }

  if (!autorizado) {
    return (
      <Navigate
        to="/login-admin"
        replace
        state={{ mensaje: mensajeError ?? 'Acceso denegado.' }}
      />
    )
  }

  return <>{children}</>
}
