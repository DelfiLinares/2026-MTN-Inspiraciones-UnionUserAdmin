/**
 * `AppRoutes`: Define el árbol de rutas del frontend (SPA).
 *
 * Fuente de verdad:
 * - Union/specs/001-plataforma-unificada/spec.md (HU-01 a HU-09, RF-05, RF-77, RF-78)
 * - Union/specs/003-desafios/spec.md (HU-09 a HU-15, HU-01 a HU-07, RF-20, RF-21, RF-24, A-18)
 * - Union/specs/001-plataforma-unificada/plan.md (sección 3.2, 3.4, "Project Structure")
 * - Union/specs/001-plataforma-unificada/tasks.md (T094)
 * - Union/specs/003-desafios/tasks.md (T068, T069)
 *
 * Rutas públicas (no requieren sesión):
 * - `/login`, `/registro`.
 *   RF-05: si un usuario ya autenticado accede a `/login`, se lo redirige al home (`/feed`).
 *
 * Rutas protegidas por sesión (requieren sesión activa, `RutaProtegida`):
 * - `/feed`, `/perfil/:id`, `/editar-perfil`.
 *   Todas ellas rechazan/redirigen cualquier cuenta con rol ADMIN (RF-78, Resuelto A14).
 * - `/desafios`, `/desafios/:desafioId`, `/desafios/mis-solicitudes`, `/desafios/solicitar`.
 *   Rutas de desafíos de usuario (T068, HU-09 a HU-15, RF-24, A-18).
 *   Protegidas por sesión: cualquier usuario autenticado puede verlas.
 *
 * Rutas protegidas por rol ADMIN (`RutaProtegidaAdmin`):
 * - `/admin/desafios`, `/admin/desafios/nuevo`, `/admin/desafios/:desafioId/editar`.
 *   Rutas de administración de desafíos (T069, HU-01 a HU-02, RF-20, RF-21).
 * - `/admin/solicitudes`, `/admin/solicitudes/:solicitudId`.
 *   Rutas de administración de solicitudes (T069, HU-06 a HU-07).
 *   Solo usuarios con rol ADMIN pueden acceder (RF-20, RF-21, RF-77).
 */

import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from '../services/AuthContext'
import { RutaProtegida } from './RutaProtegida'
import { RutaProtegidaAdmin } from './RutaProtegidaAdmin'

import { LoginPage } from '../pages/login'
import { RegistroPage } from '../pages/registro'
import { HomePage } from '../pages/home'
import { PerfilPage } from '../pages/perfil'
import { EditarPerfilPage } from '../pages/editar-perfil'
import { ListadoDesafiosPage } from '../pages/desafios/listado'
import { DetalleDesafioPage } from '../pages/desafios/detalle'
import { MisSolicitudesPage } from '../pages/desafios/mis-solicitudes'
import { NuevaSolicitudPage } from '../pages/desafios/nueva-solicitud'
import { ListadoDesafiosAdminPage } from '../pages/desafios/listado-admin'
import { PublicarDesafioPage } from '../pages/desafios/publicar'
import { EditarDesafioPage } from '../pages/desafios/editar'
import { BandejaSolicitudesPage } from '../pages/solicitudes/bandeja'
import { DetalleSolicitudAdminPage } from '../pages/solicitudes/detalle-admin'
import { CarpetaPostsPage } from '../presentation/carpetas/CarpetaPostsPage'
import { CuestionarioPage } from '../presentation/cuestionario/CuestionarioPage'

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
        path="/cuestionario"
        element={
          <RutaProtegida>
            <CuestionarioPage />
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
        path="/carpeta/:id"
        element={
          <RutaProtegida>
            <CarpetaPostsPage />
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

      {/* Rutas de desafíos de usuario (T068, HU-09 a HU-15, RF-24) */}
      <Route
        path="/desafios"
        element={
          <RutaProtegida>
            <ListadoDesafiosPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/desafios/:desafioId"
        element={
          <RutaProtegida>
            <DetalleDesafioPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/desafios/mis-solicitudes"
        element={
          <RutaProtegida>
            <MisSolicitudesPage />
          </RutaProtegida>
        }
      />
      <Route
        path="/desafios/solicitar"
        element={
          <RutaProtegida>
            <NuevaSolicitudPage />
          </RutaProtegida>
        }
      />

      {/* Rutas de administración de desafíos (T069, HU-01 a HU-07, RF-20, RF-21) */}
      <Route
        path="/admin/desafios"
        element={
          <RutaProtegidaAdmin>
            <ListadoDesafiosAdminPage />
          </RutaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/desafios/nuevo"
        element={
          <RutaProtegidaAdmin>
            <PublicarDesafioPage />
          </RutaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/desafios/:desafioId/editar"
        element={
          <RutaProtegidaAdmin>
            <EditarDesafioPage />
          </RutaProtegidaAdmin>
        }
      />

      {/* Rutas de administración de solicitudes (T069, HU-06, HU-07) */}
      <Route
        path="/admin/solicitudes"
        element={
          <RutaProtegidaAdmin>
            <BandejaSolicitudesPage />
          </RutaProtegidaAdmin>
        }
      />
      <Route
        path="/admin/solicitudes/:solicitudId"
        element={
          <RutaProtegidaAdmin>
            <DetalleSolicitudAdminPage />
          </RutaProtegidaAdmin>
        }
      />

      {/* Redirecciones por defecto */}
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  )
}
