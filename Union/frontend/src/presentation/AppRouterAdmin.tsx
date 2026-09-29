/**
 * `AppRouterAdmin`: Árbol de rutas del módulo administrativo (frontend de administración).
 *
 * Nota de ubicación: `Union/specs/001-plataforma-unificada/tasks.md` (T101) define este componente
 * dentro de `Admin/my-proyect/frontend-admin/src/AppRouter.tsx`. Por instrucción explícita del
 * usuario (misma confirmación que en T095/T096/T097A/T097B/T098A/T098B/T099/T100), la
 * implementación se coloca aquí, dentro de
 * `Union/frontend/src/presentation/`, sin leer ni modificar ningún
 * archivo del proyecto `Admin/`.
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-10 a HU-15)
 * - Union/specs/001-plataforma-unificada/tasks.md (T101, depende de: T095, T096, T096B, T097A,
 *   T097B, T098A, T098B, T099, T100, T045)
 *
 * Responsabilidades:
 * - Integra `RequireAdmin` (`sessionGuard`, T045) en todas las rutas del módulo administrativo,
 *   protegiendo dashboard, usuarios, moderación, desafíos y reportes/analíticas.
 * - `/login-admin` es la única ruta pública del módulo (T095).
 */

import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { RequireAdmin } from './RequireAdmin'

import { LoginAdminPage } from './login'
import { DashboardPage } from './dashboard'
import { UsuariosListadoPage } from './usuarios'
import { ModeracionListado } from './moderacion'
import { DesafiosAdminPage } from './desafios'
import { ReportesAnaliticaPage } from './reportes'

export const AppRouterAdmin: React.FC = () => {
  return (
    <Routes>
      {/* Ruta pública: login administrativo (T095, HU-10) */}
      <Route path="/login-admin" element={<LoginAdminPage />} />

      {/* Rutas protegidas: requieren sesión activa con rol ADMIN (T101, T045) */}
      <Route
        path="/admin/dashboard"
        element={
          <RequireAdmin>
            <DashboardPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <RequireAdmin>
            <UsuariosListadoPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/moderacion"
        element={
          <RequireAdmin>
            <ModeracionListado />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/desafios"
        element={
          <RequireAdmin>
            <DesafiosAdminPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/reportes"
        element={
          <RequireAdmin>
            <ReportesAnaliticaPage />
          </RequireAdmin>
        }
      />
    </Routes>
  )
}
