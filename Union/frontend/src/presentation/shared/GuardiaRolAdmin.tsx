/**
 * `GuardiaRolAdmin`: Guardia de acceso para las rutas administrativas del módulo
 * `002-frontend-admin`.
 *
 * Trazabilidad:
 * - Union/specs/002-frontend-admin/tasks.md (T028, depende de T022)
 * - Union/specs/002-frontend-admin/spec.md HU-10, AC-10.1, AC-10.3
 * - Union/specs/002-frontend-admin/quickstart.md Escenario 10 ("sesión simulada/real de un usuario
 *   con rol ADMIN ya autenticado")
 *
 * Responsabilidades:
 * - Bloquea el acceso a las pantallas administrativas si la sesión (simulada o real) no tiene rol
 *   `ADMIN` (AC-10.1).
 * - AC-10.3: ocultar/deshabilitar una acción puntual para un rol sin permisos es responsabilidad de
 *   cada componente de acción (p. ej. `AccionSensibleBoton`/condiciones en T036+), no de esta
 *   guardia, que opera a nivel de pantalla completa.
 *
 * Nota sobre la fuente del rol: este módulo aún no cuenta con infraestructura de sesión HTTP propia
 * (T031, `HttpClient`, está pendiente). Por eso `GuardiaRolAdmin` recibe el rol actual como prop
 * (`rolActual`), lo que permite tanto una sesión simulada (valor fijo/mock en desarrollo o tests)
 * como una futura sesión real (el consumidor que integre la guardia en `AppRoutesAdmin.tsx` podría
 * resolver `rolActual` desde un servicio de sesión real cuando este exista), sin acoplar esta guardia
 * a una implementación concreta de infraestructura.
 *
 * Nota de distinción: no debe confundirse con `RequireAdmin.tsx` (preexistente, de
 * `001-plataforma-unificada`, T101), que valida contra `sessionGuard`/`httpClientAdmin` reales y
 * protege las rutas `/admin/*` de ese otro módulo. `GuardiaRolAdmin` es la guardia propia de este
 * módulo (`002-frontend-admin`), con una fuente de rol desacoplada de HTTP.
 */

import React from 'react'
import { Navigate } from 'react-router-dom'
import { RolUsuario } from '../../domain/enums/RolUsuarioAdmin'

export interface GuardiaRolAdminProps {
  readonly rolActual: RolUsuario
  readonly children: React.ReactNode
  readonly rutaRedireccion?: string
}

export const GuardiaRolAdmin: React.FC<GuardiaRolAdminProps> = ({
  rolActual,
  children,
  rutaRedireccion = '/login-admin',
}) => {
  if (rolActual !== RolUsuario.ADMIN) {
    return <Navigate to={rutaRedireccion} replace />
  }

  return <>{children}</>
}
