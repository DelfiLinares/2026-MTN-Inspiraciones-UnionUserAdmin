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
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './services/AuthContext'
import { AppRoutes } from './routes'

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
