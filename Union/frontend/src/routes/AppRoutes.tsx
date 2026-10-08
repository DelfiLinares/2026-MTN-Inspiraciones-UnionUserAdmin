/**
 * `AppRoutes`: Define el árbol de rutas del frontend de usuario (SPA).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-01 a HU-09, RF-05, RF-78)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, "Project Structure")
 * - Union/specs/001-plataforma-unificada/tasks.md (T094)
 *
 * Rutas públicas (no requieren sesión):
 * - `/login`, `/registro`.
 *   RF-05: si un usuario ya autenticado accede a `/login`, se lo redirige al home (`/feed`).
 *
 * Rutas protegidas (requieren sesión activa, `RutaProtegida`):
 * - `/feed`, `/perfil/:id`, `/editar-perfil`.
 *   Todas ellas, además, rechazan/redirigen cualquier cuenta con rol ADMIN (RF-78, Resuelto A14),
 *   reforzando lo ya aplicado en `LoginPage` (T084) a nivel de guard de rutas.
 */

import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { RutaProtegida } from './RutaProtegida'

import { LoginPage } from '../pages/login'
import { RegistroPage } from '../pages/registro'
import { HomePage } from '../pages/home'
import { PerfilPage } from '../pages/perfil'
import { EditarPerfilPage } from '../pages/editar-perfil'

/**
 * Envuelve las rutas públicas de autenticación (login/registro).
 * RF-05: redirige al home a un usuario ya autenticado que intente acceder a estas rutas.
 */
const RutaPublicaDeAutenticacion: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { estaAutenticado, cargando } = useAuth()

  if (cargando) {
    return null
  }

  if (estaAutenticado) {
    return <Navigate to="/feed" replace />
  }

  return <>{children}</>
}

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route
        path="/login"
        element={
          <RutaPublicaDeAutenticacion>
            <LoginPage />
          </RutaPublicaDeAutenticacion>
        }
      />
      <Route
        path="/registro"
        element={
          <RutaPublicaDeAutenticacion>
            <RegistroPage />
          </RutaPublicaDeAutenticacion>
        }
      />

      {/* Rutas protegidas (requieren sesión activa; rechazan rol ADMIN — RF-78 / A14) */}
      <Route
        path="/feed"
        element={
          <RutaProtegida>
            <HomePage />
          </RutaProtegida>
        }
      />
      <Route
        path="/perfil"
        element={
          <RutaProtegida>
            <PerfilPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/perfil/:id"
        element={
          <RutaProtegida>
            <PerfilPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/editar-perfil"
        element={
          <RutaProtegida>
            <EditarPerfilPage />
          </RutaProtegida>
        }
      />
      {/* Redirecciones por defecto */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}
