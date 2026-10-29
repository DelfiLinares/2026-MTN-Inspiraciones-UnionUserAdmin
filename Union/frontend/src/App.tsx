/**
 * `App`: Componente raíz de la aplicación (frontend de usuario).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, "Project Structure")
 * - Union/specs/001-plataforma-unificada/tasks.md (T094)
 *
 * Responsabilidades:
 * - Envuelve el árbol de rutas (`AppRoutes`) con el proveedor de sesión (`AuthProvider`) y el
 *   enrutador SPA (`BrowserRouter`), integrando `AuthContext` en toda la aplicación.
 */

import React from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom'
import { AuthProvider } from './services/AuthContext'
import { AppRoutes } from './routes'
import { AppRouterAdmin } from './presentation/AppRouterAdmin'
import { AvisosComunidad } from './presentation/shared/AvisosComunidad'
import { SiteLayout } from './presentation/shared/SiteLayout'

const RUTAS_CONSOLA_ADMIN = /^\/(?:login-admin(?:\/|$)|admin(?:\/|$)|(?:usuarios|publicaciones|promocion|reportes)\/?$)/

const Raiz: React.FC = () => {
  const { pathname } = useLocation()
  return RUTAS_CONSOLA_ADMIN.test(pathname) ? <AppRouterAdmin /> : <SiteLayout><AppRoutes /></SiteLayout>
}

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Raiz />
        <AvisosComunidad />
      </AuthProvider>
    </BrowserRouter>
  )
}
